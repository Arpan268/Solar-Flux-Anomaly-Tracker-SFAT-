import Anomaly from '../../models/anomalies.js'
import { criticalEvent } from '../../events/addEvents.js'

export async function viewUnacknowledgedAnomalies(req, res) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const fetchAndSend = async () => {
        try {
            const filter = { isAcknowledged: false, source: process.env.DATA_SOURCE }
            const anomalies = await Anomaly.find(filter).sort({ createdAt: -1 })

            res.write(`data: ${JSON.stringify({ anomalies })}\n\n`)
        } catch (err) {
            console.error(err)
        }
    }

    await fetchAndSend()

    const updateListener = () => {
        fetchAndSend()
    }

    criticalEvent.on('new_anomaly_logged', updateListener)

    req.on('close', () => {
        criticalEvent.off('new_anomaly_logged', updateListener)
        res.end()
    })
}

export async function viewAcknowledgedAnomalies(req, res) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 6
        const skip = (page - 1) * limit

        const filter = { isAcknowledged: true, source: process.env.DATA_SOURCE }
        const total = await Anomaly.countDocuments(filter)
        const anomalies = await Anomaly.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 })

        res.status(200).json({
            anomalies, total, totalPages: Math.ceil(total / limit), currentPage: page
        })
    }

    catch (err) {
        console.error('Error fetching anomalies: ', err)
        return res.status(500).json({ message: 'Server error' })
    }
}