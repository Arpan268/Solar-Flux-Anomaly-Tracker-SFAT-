import LiveData from '../../models/liveData.js'

export async function viewDiagrams(req, res) {
    try {
        const { limit = 500, value, unit } = req.query;
        let query = { source: process.env.DATA_SOURCE };

        if (value && unit) {
            const numValue = parseInt(value);
            const pastDate = new Date();

            if (unit === 'hours') pastDate.setHours(pastDate.getHours() - numValue);
            if (unit === 'days') pastDate.setDate(pastDate.getDate() - numValue);
            if (unit === 'months') pastDate.setMonth(pastDate.getMonth() - numValue);
            if (unit === 'years') pastDate.setFullYear(pastDate.getFullYear() - numValue);

            query.time_tag = { $gte: pastDate.toISOString() };
        }

        const data = await LiveData.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('time_tag flux observed_flux electron_correction -_id')
            .lean();

        const chartData = data.reverse();
        res.status(200).json(chartData);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
}