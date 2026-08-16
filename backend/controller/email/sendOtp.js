import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function sendOtp(data) {
    const { email, otp } = data

    try {
        const mailOptions = {
            from: 'sfat.notification@gmail.com',
            to: email,
            subject: `🔔 Your OTP for SFAT`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px;">
                    <h2 style="color: #3b82f6;">Your OTP for SFAT</h2>
                    <p>Your one-time password (OTP) is: <strong>${otp}</strong></p>
                    <p>Please use this OTP to complete your verification process.</p>
                </div>
            `
        };

        await sgMail.send(mailOptions)
        console.log(`OTP sent to ${email}`)
        return true

    } catch (error) {
        console.error('Error sending OTP:', error)
        throw new Error('Failed to send OTP')
    }
}