import { EventEmitter } from 'node:events'
import { createAlert } from '../utility/operator/createAlert.js'

export const criticalEvent = new EventEmitter()

criticalEvent.on('critical-event', createAlert)