import LiveData from '../../models/LiveData.js'

export async function downloadData(req, res) {
    try {
        const { startDate, endDate } = req.query;

        let query = { source: process.env.DATA_SOURCE };

        if (startDate && endDate) {
            const start = new Date(`${startDate}T00:00:00.000`);
            const end = new Date(`${endDate}T23:59:59.999`);

            query.createdAt = { $gte: start, $lte: end };
        }

        const liveData = await LiveData.find(query).lean().sort({ createdAt: -1 });

        if (liveData.length === 0) {
            return res.status(404).json({ message: 'No data found in this range' });
        }

        const headers = Object.keys(liveData[0]).filter(key => key !== '__v' && key !== '_id');
        const csvRows = [headers.join(',')];

        for (const row of liveData) {
            const values = headers.map(header => {
                let val = row[header] ?? '';

                if (val instanceof Date) {
                    val = val.toLocaleString('en-IN', { hour12: false });
                }

                return `"${String(val).replace(/"/g, '""')}"`;
            });

            csvRows.push(values.join(','));
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="solar_flux_data.csv"');
        res.status(200).send(csvRows.join('\n'));

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
}