import Anomaly from '../../models/anomalies.js'

export async function viewUnacknowledgedAnomalies(req, res) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 6
        const skip = (page - 1) * limit

        const filter = { isAcknowledged: false }
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

export async function viewAcknowledgedAnomalies(req, res) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 6
        const skip = (page - 1) * limit

        const filter = { isAcknowledged: true }
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