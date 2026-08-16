import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendSuccessfulRegistrationEmail(data) {
    const { email, status } = data;
    const companyName = data.name || data.companyName || data.companyname || 'Organization';
    const isApproved = status === 'Approved';

    const themeColor = isApproved ? '#10b981' : '#ef4444';
    const subject = isApproved
        ? '✅ Company Registration Approved - SFAT'
        : '❌ Company Registration Update - SFAT';

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 24px; border: 2px solid ${themeColor}; border-radius: 8px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${themeColor}; margin-top: 0;">
        ${isApproved ? 'Company Registration Approved' : 'Company Registration Rejected'}
      </h2>
      <p>Hello <strong>${companyName}</strong> Team,</p>
      
      ${isApproved
            ? `
            <p>Congratulations! Your organization registration request has been <strong>Approved</strong> by the SFAT Platform Administration.</p>
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 12px; margin: 16px 0;">
              <p style="margin: 0; color: #166534;">
                <strong>What's Next:</strong> Your team members, operators, supervisors, and analysts can now select <strong>${companyName}</strong> during registration to join your workspace.
              </p>
            </div>
            <p style="margin-top: 24px;">
              <a href="${process.env.FRONTEND_URL}" target="_blank" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                Open SFAT Portal
              </a>
            </p>
          `
            : `
            <p>We regret to inform you that your organization registration request for <strong>${companyName}</strong> has been <strong>Rejected</strong> by the SFAT Platform Administration.</p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0;">
              <p style="margin: 0; color: #991b1b;">
                <strong>Policy Notice:</strong> Your registration record will be purged automatically. You can submit a fresh registration request after <strong>7 days</strong>.
              </p>
            </div>
            <p>If you believe this was done in error, please contact platform support.</p>
          `
        }
      
      <p style="margin-top: 24px; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px;">
        This is an automated notification from Solar Flux Anomaly Tracker (SFAT). Please do not reply directly to this email.
      </p>
    </div>
  `;

    try {
        const mailOptions = {
            from: 'sfat.notification@gmail.com',
            to: email,
            subject: subject,
            html: htmlContent
        };

        await sgMail.send(mailOptions);
        console.log(`✅ Company status email (${status}) sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending company status email:', error);
    }
}