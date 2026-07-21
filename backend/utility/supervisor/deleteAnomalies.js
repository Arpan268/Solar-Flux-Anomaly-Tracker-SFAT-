import Anomaly from '../../models/anomalies.js'

export async function deleteAnomaly(req, res) {
    try {
        const deletedAnomaly = await Anomaly.findByIdAndDelete(req.params.id)

        if (!deletedAnomaly) {
            return res.status(404).json({ message: 'Anomaly not found' })
        }

        res.status(200).json({ message: 'Anomaly deleted successfully' })
    }

    catch (err) {
        console.error('Error deleting anomaly:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}