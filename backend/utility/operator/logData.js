import Anomaly from '../../models/anomalies.js'

export async function logData(req, res) {
    const { time_tag, flux, classification, notes } = req.body

    try {
        const anomaly = new Anomaly({
            time_tag,
            flux,
            classification,
            notes,
            loggedBy: req.user.userId
        })

        await anomaly.save()
        res.status(201).json({ message: 'Anomally logged successfully', anomaly })
    }

    catch (err) {
        console.error('Error saving anomaly: ', err)
        res.status(500).json({ message: 'Server error' })
    }
}