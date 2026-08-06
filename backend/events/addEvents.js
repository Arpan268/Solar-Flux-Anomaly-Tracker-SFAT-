import { EventEmitter } from 'node:events'
import { createAlert } from '../utility/operator/createAlert.js'
import { adminSendEmail } from '../controller/userController.js'
import { analystSendEmail } from '../utility/analyst/analystSendEmail.js'
import { broadcastXClassAlert } from '../utility/shared/sseManager.js'
import { sendRegistrationEmail } from '../controller/registrationEmail.js'

export const criticalEvent = new EventEmitter()

criticalEvent.on('critical-event', createAlert)
criticalEvent.on('admin-email', adminSendEmail)
criticalEvent.on('x-class-flare', analystSendEmail)
criticalEvent.on('x-class-flare', broadcastXClassAlert)
criticalEvent.on('registration-email', sendRegistrationEmail)