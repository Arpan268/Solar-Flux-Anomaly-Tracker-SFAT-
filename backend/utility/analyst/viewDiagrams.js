import LiveData from '../../models/liveData.js'

export async function viewDiagrams(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 500

        const data = await LiveData.find({ source: process.env.DATA_SOURCE })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('time_tag flux -_id')
            .lean()

        const chartData = data.reverse()

        res.status(200).json(chartData)

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}