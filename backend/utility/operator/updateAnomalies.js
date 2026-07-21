import Anomaly from '../../models/anomalies.js'

export async function updateAnomalies(req, res) {
    try {
        const { time_tag, flux, classification, notes } = req.body
        const selectedAnomaly = await Anomaly.findById(req.params.id)

        if (!selectedAnomaly) {
            return res.status(404).json({ message: 'Anomaly not found' })
        }

        selectedAnomaly.time_tag = time_tag
        selectedAnomaly.flux = flux
        selectedAnomaly.classification = classification
        selectedAnomaly.notes = notes

        await selectedAnomaly.save()

        res.status(200).json({ message: 'Anomaly updated successfully', selectedAnomaly })
    }

    catch (err) {
        console.error('Error updating anomaly: ', err)
        res.status(500).json({ message: 'Server error' })
    }
}