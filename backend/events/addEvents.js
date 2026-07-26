import { EventEmitter } from 'node:events'
import { createAlert } from '../utility/operator/createAlert.js'
import { adminSendEmail } from '../controller/userController.js'

export const criticalEvent = new EventEmitter()

criticalEvent.on('critical-event', createAlert)
criticalEvent.on('admin-email', adminSendEmail)