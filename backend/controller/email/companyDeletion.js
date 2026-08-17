import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function handleCompanyDeletionEmail(companyData) {
    try {
        const { email, companyName } = companyData;

        if (!email) {
            console.warn("⚠️ No email provided for company deletion alert.");
            return;
        }

        const mailOptions = {
            from: 'sfat.notification@gmail.com',
            to: email,
            subject: 'Notice: SFAT Organization Account & Data Purged',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 8px;">
                    <h2 style="color: #ef4444;">Organization Account Terminated</h2>
                    <p>Hello,</p>
                    <p>This is an official notification that the organization account for <strong>${companyName}</strong> has been permanently removed from the Solar Flux Anomaly Tracker (SFAT) platform by an SFAT Administrator.</p>
                    <p>As part of this action, to ensure strict data security and compliance, <strong>all data associated with your organization has been immediately and permanently purged</strong>. This includes:</p>
                    <ul>
                        <li>All Operator, Analyst, and Supervisor workspaces</li>
                        <li>All recorded historical telemetry and Live Data streams</li>
                        <li>All logged space weather Anomalies and Threat Advisories</li>
                        <li>All internal Supervisor Instructions and Shift schedules</li>
                    </ul>
                    <p>Please notify your operational staff that they will no longer be able to access the SFAT platform.</p>
                    <p style="margin-top: 20px;">If you believe this action was taken in error or wish to establish a new tenant workspace, please contact SFAT Administration.</p>
                    <br/>
                    <p>Regards,<br/><strong>SFAT Platform Operations</strong></p>
                </div>
            `
        };

        await sgMail.send(mailOptions);
        console.log(`✅ Company deletion alert sent successfully to corporate email: ${email}`);

    } catch (err) {
        console.error('❌ Error sending company deletion email:', err);
    }
}