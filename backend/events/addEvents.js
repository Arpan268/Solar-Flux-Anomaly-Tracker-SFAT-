import { EventEmitter } from 'node:events';
import { createAlert } from '../utility/operator/createAlert.js';
import { analystSendEmail } from '../utility/analyst/analystSendEmail.js';
import { broadcastXClassAlert } from '../utility/shared/sseManager.js';
import { sendRegistrationEmail, handleRegistrationEmail } from '../controller/email/registrationEmail.js';
import { sendAdvisoryMail } from '../utility/analyst/sendAdvisoryMail.js';
import { broadcastNewAdvisory, broadcastAcknowledgedAdvisory } from '../utility/supervisor/advisoryStream.js';
import { sendSuccessfulRegistrationEmail } from '../controller/email/successfulResistrationEmail.js';

export const criticalEvent = new EventEmitter();

criticalEvent.setMaxListeners(0);

criticalEvent.on('critical-event', createAlert);
criticalEvent.on('admin-email', handleRegistrationEmail);
criticalEvent.on('x-class-flare', analystSendEmail);
criticalEvent.on('x-class-flare', broadcastXClassAlert);
criticalEvent.on('registration-email', sendRegistrationEmail);
criticalEvent.on('advisory', sendAdvisoryMail);
criticalEvent.on('advisory', broadcastNewAdvisory);
criticalEvent.on('advisory-acknowledged', broadcastAcknowledgedAdvisory);
criticalEvent.on('registration-successful', sendSuccessfulRegistrationEmail)