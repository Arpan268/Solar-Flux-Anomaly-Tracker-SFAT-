import Anomaly from '../../models/anomalies.js'

export async function acknowledgeAnomaly(req, res) {
    try {
        const selectedAnomaly = await Anomaly.findById(req.params.id)
        const supervisorId = req.user.userId

        if (!selectedAnomaly) {
            return res.status(404).json({ message: 'Anomaly not found' })
        }

        selectedAnomaly.isAcknowledged = true
        selectedAnomaly.acknowledgedBy = supervisorId

        await selectedAnomaly.save()

        res.status(200).json({ message: 'Anomaly acknowledged successfully', selectedAnomaly })
    }

    catch (err) {
        console.error('Error acknowledging anomaly: ', err)
        res.status(500).json({ message: 'Server error' })
    }
}