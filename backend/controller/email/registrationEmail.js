import sgMail from '@sendgrid/mail';
import User from '../../models/users.js';
import Company from '../../models/companies.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendRegistrationEmail(data) {
  const newUser = data.userWithoutPassword || data;

  try {
    const mailOptions = {
      from: 'sfat.notification@gmail.com',
      to: newUser.email,
      subject: '🔔 Successful Registration',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px;">
          <h2 style="color: #3b82f6;">Successful Registration</h2>
          <p>Hello <strong>${newUser.username}</strong>,</p>
          <p>You have successfully registered for SFAT.</p>
          <p>Your account details:</p>
          <ul>
            <li><strong>User ID:</strong> ${newUser.userId}</li>
            <li><strong>Role:</strong> ${newUser.role}</li>
          </ul>
          <p>Note: Your account is currently in <strong>Pending</strong> status. An admin will review your registration and approve it if everything is in order.</p>
          <p>Please note the User ID, as it will be required for logging in once your account is approved. We appreciate your patience!</p>
          <p>Thank you for joining us!</p>
        </div>
      `
    };

    await sgMail.send(mailOptions);
    console.log(`✅ Registration email sent to ${newUser.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending registration email:', error);
  }
}

export async function handleRegistrationEmail(data) {
  try {
    const entity = data.newCompany || data.userWithoutPassword || data;
    const isUser = !!entity.username;
    const isCompany = !isUser && !!entity.companyName;

    let recipients = [];
    let subject = '';
    let htmlContent = '';
    let dashboardRole = 'SFAT Admin';

    if (isCompany) {
      const sfatAdmins = await User.find({ role: 'Admin', email: { $exists: true, $ne: null } });
      if (!sfatAdmins.length) return;
      recipients = sfatAdmins.map(admin => admin.email);

      subject = '🚨 Action Required: New Company Registration';
      htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px;">
                    <h2 style="color: #3b82f6;">New Company Pending Approval</h2>
                    <p>A new organization has registered and requires SFAT Admin approval.</p>
                    <ul>
                        <li><strong>Company Name:</strong> ${entity.companyName}</li>
                        <li><strong>Email:</strong> ${entity.email}</li>
                        <li><strong>Industry Sector:</strong> ${entity.companyType}</li>
                    </ul>
                </div>
            `;
    } else if (isUser) {
      const companyDoc = await Company.findById(entity.company);
      const companyNameStr = companyDoc ? companyDoc.companyName : 'Unknown Company';

      const companyAdmins = await User.find({
        role: 'Company Admin',
        status: 'Approved',
        company: entity.company,
        email: { $exists: true, $ne: null }
      });

      if (entity.role === 'Company Admin' && companyAdmins.length === 0) {
        const sfatAdmins = await User.find({ role: 'Admin', email: { $exists: true, $ne: null } });
        if (!sfatAdmins.length) return;
        recipients = sfatAdmins.map(admin => admin.email);

        subject = '🚨 Action Required: Initial Company Admin Registration';
        htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px;">
                        <h2 style="color: #3b82f6;">Initial Company Admin Pending Approval</h2>
                        <p>A user has registered as the FIRST admin for their organization. This requires SFAT Admin approval.</p>
                        <ul>
                            <li><strong>Username:</strong> ${entity.username}</li>
                            <li><strong>Email:</strong> ${entity.email}</li>
                            <li><strong>Organization:</strong> ${companyNameStr}</li>
                            <li><strong>System ID:</strong> ${entity.userId}</li>
                        </ul>
                    </div>
                `;
      } else {
        if (!companyAdmins.length) {
          console.warn(`No approved Company Admins found for ${companyNameStr} to approve ${entity.username}.`);
          return;
        }
        recipients = companyAdmins.map(admin => admin.email);
        dashboardRole = 'Company Admin';

        subject = `🔔 Action Required: New ${entity.role} Registration`;
        htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #10b981; border-radius: 8px;">
                        <h2 style="color: #10b981;">New Team Member Pending Approval</h2>
                        <p>A new user has requested access to your organization's workspace.</p>
                        <ul>
                            <li><strong>Username:</strong> ${entity.username}</li>
                            <li><strong>Email:</strong> ${entity.email}</li>
                            <li><strong>Requested Role:</strong> ${entity.role}</li>
                            <li><strong>System ID:</strong> ${entity.userId}</li>
                        </ul>
                    </div>
                `;
      }
    }

    if (recipients.length === 0) return;

    const mailOptions = {
      from: 'sfat.notification@gmail.com',
      to: recipients,
      subject,
      html: `
                ${htmlContent}
                <p>Please log in to the <strong>${dashboardRole} Dashboard</strong> to approve or reject this request.</p>
                <p style="margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL}" target="_blank" style="background-color: #1e1e1e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Open SFAT Platform</a>
                </p>
            `
    };

    await sgMail.send(mailOptions);
    console.log(`✅ Registration alert email sent successfully to ${recipients.length} recipient(s).`);

  } catch (err) {
    console.error('❌ Error sending registration alert email:', err);
  }
}