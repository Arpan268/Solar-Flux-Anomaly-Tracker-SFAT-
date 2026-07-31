import { criticalEvent } from '../../events/addEvents.js'
import Anomaly from '../../models/anomalies.js'

export async function logData(req, res) {
    const { time_tag, flux, classification, electron_contaminaton, notes } = req.body

    try {
        const loggedBy = req.user?.userId || req.user?.id

        if (!loggedBy) {
            return res.status(401).json({ message: 'User identity missing. Please log in again.' })
        }

        if (classification === 'X-Class Flare') {
            const anomaly = new Anomaly({
                time_tag,
                flux,
                classification,
                electron_contaminaton,
                notes,
                loggedBy,
                source: process.env.DATA_SOURCE,
                isAcknowledged: true
            })
            criticalEvent.emit('x-class-flare', anomaly)

            await anomaly.save()

            return res.status(201).json({ message: 'Anomally logged successfully', anomaly })
        }
        else {
            const anomaly = new Anomaly({
                time_tag,
                flux,
                classification,
                electron_contaminaton,
                notes,
                loggedBy,
                source: process.env.DATA_SOURCE
            })

            await anomaly.save()

            return res.status(201).json({ message: 'Anomally logged successfully', anomaly })
        }
    }

    catch (err) {
        console.error('Error saving anomaly: ', err)
        res.status(500).json({ message: 'Failed to log anomaly to the database. Please try again.' })
    }
}