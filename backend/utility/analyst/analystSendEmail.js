import sgMail from '@sendgrid/mail';
import User from '../../models/users.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function analystSendEmail(anomaly) {
    try {
        const analysts = await User.find({ role: 'Analyst' });

        if (!analysts || analysts.length === 0) {
            console.warn('⚠️ No analysts found in the database to receive the X-Class alert.');
            return;
        }

        const analystEmails = analysts.map(analyst => analyst.email);

        const msg = {
            to: analystEmails,
            from: 'sfat.notification@gmail.com',
            subject: `🚨 CRITICAL ALERT: X-Class Solar Flare Detected`,
            text: `An X-Class Solar Flare has been detected. Flux: ${anomaly.flux} W/m². Immediate analysis required.`,
            html: `
                <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                    
                    <h2 style="color: #dc2626; border-bottom: 2px solid #fecaca; padding-bottom: 12px; margin-top: 0;">
                        🚨 CRITICAL EVENT: X-Class Flare Detected
                    </h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        <strong>Attention Analysis Team,</strong>
                    </p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        A critical X-Class solar flare has been logged by the operations team. Standard supervisor acknowledgment protocols have been bypassed for immediate review.
                    </p>
                    
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 24px 0;">
                        <h3 style="margin-top: 0; color: #111827; font-size: 18px;">Event Telemetry:</h3>
                        <ul style="list-style-type: none; padding-left: 0; margin: 0; color: #4b5563; line-height: 2;">
                            <li><strong>Classification:</strong> <span style="color: #dc2626; font-weight: bold;">${anomaly.classification}</span></li>
                            <li><strong>Peak Flux:</strong> ${anomaly.flux} W/m²</li>
                            <li><strong>Time Tag (UTC):</strong> ${anomaly.time_tag}</li>
                            <li><strong>Contamination:</strong> ${anomaly.electron_contaminaton ? 'Detected' : 'Clean'}</li>
                        </ul>
                    </div>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                        Please log in to the Solar Flux Anomaly Tracker immediately to generate the AI Micro-Analysis and determine downstream impact vectors.
                    </p>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/analyst" 
                       style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center;">
                        Access Dashboard Now
                    </a>
                    
                </div>
            `,
        };

        await sgMail.sendMultiple(msg);
        console.log(`✅ CRITICAL ALERT: X-Class flare email dispatched to ${analystEmails.length} analyst(s).`);

    } catch (error) {
        console.error('❌ Error sending X-Class alert email to analysts:', error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
};