import User from '../models/users.js'
import Shift from '../models/shifts.js'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sfat.notification@gmail.com',
        pass: process.env.PASS
    }
});

export async function getUsers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page - 1) * limit

        const filter = { status: 'Approved' }
        const total = await User.countDocuments(filter)
        const users = await User.find(filter).skip(skip).limit(limit).select('-password').populate('shift')

        res.status(200).json({
            users, total, totalPages: Math.ceil(total / limit), currentPage: page
        })
    }

    catch (err) {
        return res.status(500).json({ message: 'Server error' })
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
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page - 1) * limit

        const filter = { status: 'Pending' }
        const total = await User.countDocuments(filter)
        const users = await User.find(filter).skip(skip).limit(limit).select('-password')

        res.status(200).json({
            users, total, totalPages: Math.ceil(total / limit), currentPage: page
        })
    }

    catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function getAvailableShifts(req, res) {
    try {
        const allShifts = await Shift.find()
        const assignedUsers = await User.find({ role: 'Operator', status: 'Approved', shift: { $ne: null } })
        const assignedShiftIds = assignedUsers.map(u => u.shift.toString())
        const availableShifts = allShifts.filter(s => !assignedShiftIds.includes(s._id.toString()))

        res.status(200).json(availableShifts)
    }

    catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function handleStatus(req, res) {
    try {
        const { updatedStatus, shiftId } = req.body
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        user.status = updatedStatus

        if (updatedStatus === 'Rejected') {
            user.rejectedAt = new Date()
            user.shift = null
        } else {
            user.rejectedAt = null
            if (updatedStatus === 'Approved' && user.role === 'Operator' && shiftId) {
                user.shift = shiftId
            }
        }

        await user.save()

        if (updatedStatus === 'Approved') {
            return res.status(200).json({ message: 'User approved' })
        } else if (updatedStatus === 'Rejected') {
            return res.status(200).json({ message: 'User rejected' })
        }

        return res.status(200).json({ message: 'User status updated' })

    }

    catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}

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

export async function adminSendEmail(data) {
    const newUser = data.userWithoutPassword
    console.log(`🔔 Registration event received for: ${newUser.username}`);

    try {
        const admins = await User.find({
            role: 'Admin',
            email: { $exists: true, $ne: null }
        });

        if (admins.length === 0) {
            console.log('No admins found to receive the registration alert.');
            return;
        }

        const adminEmails = admins.map(admin => admin.email);

        const mailOptions = {
            from: 'sfat.notification@gmail.com',
            bcc: adminEmails,
            subject: `🔔 Action Required: New ${newUser.role} Registration`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px;">
                    <h2 style="color: #3b82f6;">New User Registration Pending Approval</h2>
                    <p>A new user has registered and is currently in <strong>Pending</strong> status. They require admin approval to access the system.</p>
                    <h3>User Details:</h3>
                    <ul>
                        <li><strong>Username:</strong> ${newUser.username}</li>
                        <li><strong>Email:</strong> ${newUser.email}</li>
                        <li><strong>Role Requested:</strong> ${newUser.role}</li>
                        <li><strong>System ID:</strong> ${newUser.userId}</li>
                    </ul>
                    <p>Please log in to the SFAT Admin Dashboard to approve or reject this request.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Admin registration alert email sent successfully to:', adminEmails);

    } catch (error) {
        console.error('❌ Error sending admin registration email:', error);
    }
}