import User from '../../models/users.js';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendAdvisoryMail(advisory) {
    try {
        let mailOptions = {};

        const allSupervisors = await User.find({
            role: 'Supervisor',
            company: advisory.company,
            email: { $exists: true, $ne: null }
        });

        const allCompanyAdmins = await User.find({
            role: 'Company Admin',
            company: advisory.company,
            email: { $exists: true, $ne: null }
        });

        const supervisorEmailList = allSupervisors.map(user => user.email);
        const companyAdminEmailList = allCompanyAdmins.map(user => user.email);

        if (advisory.advisoryType === 'Prediction') {
            const recipientList = [...supervisorEmailList, ...companyAdminEmailList];

            if (recipientList.length === 0) return;

            mailOptions = {
                from: 'sfat.notification@gmail.com',
                to: recipientList,
                subject: '🚨 URGENT: New Prediction Advisory Created',
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #ff4d4d; border-radius: 8px;">
            <h2 style="color: #ff4d4d;">Advisory Alert</h2>
            <p>A new advisory has been created regarding a critical solar anomaly prediction.</p>
            <h3>Advisory Details:</h3>
            <ul>
              <li><strong>C-Class flare risk for next 24 hours:</strong> ${advisory.cclass}</li>
              <li><strong>M-Class flare risk for next 24 hours:</strong> ${advisory.mclass}</li>
              <li><strong>X-Class flare risk for next 24 hours:</strong> ${advisory.xclass}</li>
              <li><strong>Message:</strong> ${advisory.message}</li>
            </ul>
            <p>Please log in to the SFAT Dashboard immediately to review the advisory details.</p>
            <p style="margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}" target="_blank" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Open SFAT Dashboard</a>
            </p>
          </div>
        `
            };
        }

        else if (advisory.advisoryType === 'Anomaly') {
            if (companyAdminEmailList.length === 0) return;

            mailOptions = {
                from: 'sfat.notification@gmail.com',
                to: companyAdminEmailList,
                subject: '🚨 URGENT: New Anomaly Advisory Created',
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #ff4d4d; border-radius: 8px;">
            <h2 style="color: #ff4d4d;">Advisory Alert</h2>
            <p>A new advisory has been created regarding a critical solar anomaly detection.</p>
            <h3>Advisory Details:</h3>
            <ul>
              <li><strong>Flare Details:</strong> ${advisory.flareDetails}</li>
              <li><strong>Message:</strong> ${advisory.message}</li>
            </ul>
            <p>Please log in to the SFAT Dashboard immediately to review the advisory details.</p>
            <p style="margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}" target="_blank" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Open SFAT Dashboard</a>
            </p>
          </div>
        `
            };
        }

        if (mailOptions.to && mailOptions.to.length > 0) {
            await sgMail.send(mailOptions);
            console.log('✅ Advisory email sent successfully to:', mailOptions.to);
        }
    } catch (error) {
        console.error('❌ Error sending advisory email:', error);
    }
}