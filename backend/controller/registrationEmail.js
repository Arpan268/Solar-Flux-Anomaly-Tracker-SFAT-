import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function sendRegistrationEmail(data) {
    const newUser = data.userWithoutPassword

    try {
        const mailOptions = {
            from: 'sfat.notification@gmail.com',
            to: newUser.email,
            subject: `🔔 Successful Registration`,
            html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px;">
                        <h2 style="color: #3b82f6;">Successful Registration</h2>
                        <p>Hello ${newUser.username},</p>
                        <p>You have successfully registered for SFAT.</p>
                        <p>Your account details:</p>
                        <ul>
                            <li><strong>User ID:</strong> ${newUser.userId}</li>
                            <li><strong>Role:</strong> ${newUser.role}</li>
                        </ul>
                        <p>Note: Your account is currently in <strong>Pending</strong> status. An admin will review your registration and approve it if everything is in order</p>
                        <p>Please note the user ID, as it will be required for logging in once your account is approved. We appreciate your patience!</p>
                        <p>Thank you for joining us!</p>
                    </div>
                `
        };

        await sgMail.send(mailOptions)
        console.log(`Registration email sent to ${newUser.email}`)
        return true

    } catch (error) {
        console.error('Error sending registration email:', error)
        throw new Error('Failed to send registration email')
    }
}