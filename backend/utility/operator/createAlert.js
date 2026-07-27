import User from '../../models/users.js';
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function createAlert(data) {
    console.log('🚨 Solar Flare detected with details: ', data);

    try {
        const allOperators = await User.find({
            role: 'Operator',
            email: { $exists: true, $ne: null }
        }).populate('shift');

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const nowInMinutes = currentHour * 60 + currentMinute;

        const activeOperators = allOperators.filter(user => {

            if (!user.shift || !user.shift.startTime || !user.shift.endTime) return false;

            const [startH, startM] = user.shift.startTime.split(':').map(Number);
            const [endH, endM] = user.shift.endTime.split(':').map(Number);

            const startInMinutes = startH * 60 + startM;
            const endInMinutes = endH * 60 + endM;

            if (startInMinutes < endInMinutes) {
                return nowInMinutes >= startInMinutes && nowInMinutes < endInMinutes;
            } else {
                return nowInMinutes >= startInMinutes || nowInMinutes < endInMinutes;
            }
        });

        if (activeOperators.length === 0) {
            console.log('No operators are currently on shift to receive the alert.');
            return;
        }

        const emailList = activeOperators.map(user => user.email);

        const mailOptions = {
            from: 'sfat.notification@gmail.com',
            to: emailList,
            subject: `🚨 URGENT: ${data.classification} Solar Flare Detected!`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #ff4d4d; border-radius: 8px;">
                    <h2 style="color: #ff4d4d;">Solar Flux Anomaly Alert</h2>
                    <p>A critical solar flare has crossed the anomaly threshold and requires immediate attention.</p>
                    <h3>Anomaly Details:</h3>
                    <ul>
                        <li><strong>Classification:</strong> ${data.classification}</li>
                        <li><strong>Peak Flux:</strong> ${data.flux} W/m²</li>
                        <li><strong>Time (UTC):</strong> ${data.time_tag}</li>
                    </ul>
                    <p>Please log this anomaly in the SFAT Dashboard immediately.</p>
                    <a href='${process.env.FRONTEND_URL}' target='_blank>${process.env.FRONTEND_URL}</a>
                </div>
            `
        };

        await sgMail.send(mailOptions);
        console.log('✅ Alert email sent successfully to active operators:', emailList);

    } catch (error) {
        console.error('❌ Error sending alert email:', error);
    }
}