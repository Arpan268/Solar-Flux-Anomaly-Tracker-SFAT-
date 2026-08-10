import Advisory from '../../models/advisories.js';

export async function viewPendingAdvisories(req, res) {
    try {
        const advisories = await Advisory.find({ source: process.env.DATA_SOURCE, status: 'Pending' }).sort({ createdAt: -1 })

        res.status(200).json({ advisories })
    } catch (err) {
        console.error('Error fetching pending advisories: ', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function viewAcknowledgedAdvisories(req, res) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit
        const total = await Advisory.countDocuments({ source: process.env.DATA_SOURCE, status: 'Acknowledged' })
        const advisories = await Advisory.find({ source: process.env.DATA_SOURCE, status: 'Acknowledged' }).skip(skip).limit(limit).sort({ createdAt: -1 })

        res.status(200).json({
            advisories, total, totalPages: Math.ceil(total / limit), currentPage: page
        })
    } catch (err) {
        console.error('Error fetching acknowledged advisories: ', err)
        return res.status(500).json({ message: 'Server error' })
    }
}