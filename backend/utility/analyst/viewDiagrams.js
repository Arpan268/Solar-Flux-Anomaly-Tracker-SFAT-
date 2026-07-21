import LiveData from '../../models/liveData.js'

export async function viewDiagrams(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 500

        const data = await LiveData.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('time_tag flux classification -_id')
            .lean()

        const chartData = data.reverse()

        res.status(200).json(chartData)

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}