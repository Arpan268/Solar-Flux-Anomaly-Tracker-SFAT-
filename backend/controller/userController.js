import User from '../models/users.js'
import Company from '../models/companies.js';
import bcrypt from 'bcryptjs'
import sgMail from '@sendgrid/mail'
import { criticalEvent } from '../events/addEvents.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//Companies
export async function getCompanies(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const filter = { status: 'Approved' };
        const total = await Company.countDocuments(filter);
        const companies = await Company.find(filter).skip(skip).limit(limit);

        res.status(200).json({
            companies, total, totalPages: Math.ceil(total / limit), currentPage: page
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function getPendingCompanies(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const filter = { status: 'Pending' };
        const total = await Company.countDocuments(filter);
        const companies = await Company.find(filter).skip(skip).limit(limit);

        res.status(200).json({
            companies, total, totalPages: Math.ceil(total / limit), currentPage: page
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function handleCompanyStatus(req, res) {
    try {
        const { updatedStatus } = req.body;
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        company.status = updatedStatus;
        company.rejectedAt = updatedStatus === 'Rejected' ? new Date() : null;

        await company.save();

        const data = { status: updatedStatus, email: company.email, name: company.companyname }
        criticalEvent.emit('registration-successful', data)

        return res.status(200).json({ message: `Company ${updatedStatus.toLowerCase()}` });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

//Companies Admin
export async function getUsers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        // SFAT Admin only views approved Company Admins
        const filter = { status: 'Approved', role: 'Company Admin' };
        const total = await User.countDocuments(filter);
        const users = await User.find(filter).skip(skip).limit(limit).select('-password').populate('shift');

        res.status(200).json({
            users, total, totalPages: Math.ceil(total / limit), currentPage: page
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function deleteUser(req, res) {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (user.role === 'Admin') {
            return res.status(403).json({ message: 'Cannot delete admin users' })
        }

        await User.findByIdAndDelete(req.params.id)

        res.status(200).json({ message: 'User deleted successfully' })
    }

    catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function getPendingUsers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const companiesWithAdmins = await User.find({
            role: 'Company Admin',
            status: 'Approved'
        }).distinct('company');

        const filter = {
            status: 'Pending',
            role: 'Company Admin',
            company: { $nin: companiesWithAdmins }
        };

        const total = await User.countDocuments(filter);
        const users = await User.find(filter).skip(skip).limit(limit).select('-password');

        res.status(200).json({
            users, total, totalPages: Math.ceil(total / limit), currentPage: page
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function handleStatus(req, res) {
    try {
        const { updatedStatus, shiftId } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = updatedStatus;

        if (updatedStatus === 'Rejected') {
            user.rejectedAt = new Date();
            user.shift = null;
        } else {
            user.rejectedAt = null;
            if (updatedStatus === 'Approved' && user.role === 'Operator' && shiftId) {
                user.shift = shiftId;
            }
        }

        await user.save();
        return res.status(200).json({ message: `User ${updatedStatus.toLowerCase()}` });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

//Profile Details
export async function getProfile(req, res) {
    try {
        const user = await User.findOne({ userId: req.user.id }).select('-password').populate('shift')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.status(200).json(user)
    }

    catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function updateProfile(req, res) {
    try {
        const { username, email, password } = req.body
        const user = await User.findOne({ userId: req.user.id })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        if (username !== undefined && username !== user.username) user.username = username
        if (email !== undefined && email !== user.email) user.email = email
        if (password && !(await bcrypt.compare(password, user.password))) {
            const hashedPassword = await bcrypt.hash(password, 10)
            user.password = hashedPassword
        }

        await user.save()

        res.status(200).json({ message: 'Profile updated successfully' })
    }

    catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function deleteProfile(req, res) {
    try {
        const user = await User.findOne({ userId: req.user.id })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        await user.deleteOne({ userId: req.user.id })

        res.status(200).json({ message: 'Profile deleted successfully' })
    }

    catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}


//Admin Email
export async function adminSendEmail(data) {
    try {
        const entity = data.userWithoutPassword || data.company || data;
        const isUser = !!entity.username;
        const isCompany = !isUser && !!entity.companyName;

        if (isUser && entity.role !== 'Company Admin') {
            return;
        }

        if (isUser) {
            const existingAdmin = await User.findOne({
                role: 'Company Admin',
                status: 'Approved',
                company: entity.company
            });
            if (existingAdmin) return;
        }

        const admins = await User.find({ role: 'Admin', email: { $exists: true, $ne: null } });
        if (admins.length === 0) return;

        const adminEmails = admins.map(admin => admin.email);
        let subject, htmlContent;

        if (isCompany) {
            subject = '🚨 Action Required: New Company Registration';
            htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px;">
          <h2 style="color: #3b82f6;">New Company Pending Approval</h2>
          <p>A new organization has registered and requires SFAT Admin approval.</p>
          <ul>
            <li><strong>Company Name:</strong> ${entity.companyName}</li>
            <li><strong>Email:</strong> ${entity.email}</li>
            <li><strong>Industry Type:</strong> ${entity.companyType}</li>
          </ul>
        </div>
      `;
        } else if (isUser) {
            const companyDoc = await Company.findById(entity.company);
            const companyNameStr = companyDoc ? companyDoc.companyName : entity.company;

            subject = `🚨 Action Required: New ${entity.role} Registration`;
            htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px;">
          <h2 style="color: #3b82f6;">Initial Company Admin Pending Approval</h2>
          <p>A user has registered as the first admin for their organization.</p>
          <ul>
            <li><strong>Username:</strong> ${entity.username}</li>
            <li><strong>Email:</strong> ${entity.email}</li>
            <li><strong>Company:</strong> ${companyNameStr}</li>
            <li><strong>System ID:</strong> ${entity.userId}</li>
          </ul>
        </div>
      `;
        } else {
            return;
        }

        const mailOptions = {
            from: 'sfat.notification@gmail.com',
            to: adminEmails,
            subject,
            html: htmlContent + `
        <p>Please log in to the SFAT Admin Dashboard to approve or reject this request.</p>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}" target="_blank" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Open SFAT Dashboard</a>
        </p>
      `
        };

        await sgMail.send(mailOptions);
        console.log('✅ Admin registration alert email sent successfully to:', adminEmails);
    } catch (err) {
        console.error('❌ Error sending admin registration email:', err);
    }
}

export async function getAdminMetrics(req, res) {
    try {
        const [totalCompanies, pendingCompanies, approvedCompanies, totalCompanyAdmins] = await Promise.all([
            Company.countDocuments(),
            Company.countDocuments({ status: 'Pending' }),
            Company.countDocuments({ status: 'Approved' }),
            User.countDocuments({ role: 'Company Admin', status: 'Approved' })
        ]);

        res.status(200).json({
            totalCompanies,
            pendingCompanies,
            approvedCompanies,
            totalCompanyAdmins
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch admin metrics' });
    }
}