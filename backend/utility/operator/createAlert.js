import nodemailer from 'nodemailer'
import User from '../../models/users.js'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sfat.notification@gmail.com',
        pass: process.env.PASS
    }
})

export async function createAlert(data) {
    console.log('🚨 Solar Flare detected with details: ', data)

    try {
        const alertRecipients = await User.find({
            role: 'Operator',
            email: { $exists: true, $ne: null }
        })

        if (alertRecipients.length === 0) {
            console.log('No operators found with valid emails.')
            return
        }

        const emailList = alertRecipients.map(user => user.email)

        const mailOptions = {
            from: 'sfat.notification@gmail.com',
            bcc: emailList,
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
        </div>
      `
        }

        await transporter.sendMail(mailOptions)
        console.log('✅ Alert email sent successfully to:', emailList)

    } catch (error) {
        console.error('❌ Error sending alert email:', error)
    }
}