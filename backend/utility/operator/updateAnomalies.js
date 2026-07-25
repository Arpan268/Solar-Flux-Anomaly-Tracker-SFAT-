import Anomaly from '../../models/anomalies.js'

export async function updateAnomalies(req, res) {
    try {
        const { time_tag, flux, classification, notes } = req.body
        const updateData = {}

        if (time_tag !== undefined) updateData.time_tag = time_tag
        if (flux !== undefined) updateData.flux = flux
        if (classification !== undefined) updateData.classification = classification
        if (notes !== undefined) updateData.notes = notes

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No update fields were provided.' })
        }

        const updatedAnomaly = await Anomaly.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        )

        if (!updatedAnomaly) {
            return res.status(404).json({ message: 'Anomaly not found' })
        }

        res.status(200).json({ message: 'Anomaly updated successfully', anomaly: updatedAnomaly })
    }

    catch (err) {
        console.error('Error updating anomaly: ', err)
        res.status(500).json({ message: 'Failed to update anomaly record. Please try again.' })
    }
}