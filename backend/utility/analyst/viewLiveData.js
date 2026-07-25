import LiveData from '../../models/liveData.js'

export async function viewLiveData(req, res) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 100
        const skip = (page - 1) * limit
        const total = await LiveData.countDocuments({ source: process.env.DATA_SOURCE })
        const liveData = await LiveData.find({ source: process.env.DATA_SOURCE }).skip(skip).limit(limit).sort({ createdAt: -1 })

        res.status(200).json({
            liveData, total, totalPages: Math.ceil(total / limit), currentPage: page
        })
    }

    catch (err) {
        console.error('Error fetching live data: ', err)
        return res.status(500).json({ message: 'Server error' })
    }
}