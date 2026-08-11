import User from '../../models/users.js';
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function sendAdvisoryMail(advisory) {
    try {
        const allSupervisors = await User.find({
            role: 'Supervisor',
            email: { $exists: true, $ne: null }
        })

        const emailList = allSupervisors.map(user => user.email);

        const mailOptions = {
            from: 'sfat.notification@gmail.com',
            to: emailList,
            subject: `🚨 URGENT: New Advisory Created`,
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
                            <p>Please log in the SFAT Dashboard immediately to review the advisory details.</p>
                            <p style="margin-top: 30px;">
                                <a href="${process.env.FRONTEND_URL}" target="_blank" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; border: 1px solid #333333; font-weight: bold; display: inline-block; letter-spacing: 0.5px;">
                                    Open SFAT Dashboard
                                </a>
                            </p>
                        </div>
                    `
        };

        await sgMail.send(mailOptions);
        console.log('✅ Advisory email sent successfully to all supervisors:', emailList);
    }
    catch (error) {
        console.error('❌ Error sending advisory email:', error);
    }
}