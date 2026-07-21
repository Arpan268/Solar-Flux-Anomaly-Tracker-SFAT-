import LiveData from '../../models/liveData.js'

export async function downloadData(req, res) {
    try {
        const liveData = await LiveData.find().lean().sort({ createdAt: -1 })

        if (liveData.length === 0) {
            return res.status(404).json({ message: 'No data found' })
        }

        const headers = Object.keys(liveData[0]).filter(key => key !== '__v' && key !== '_id')
        const csvRows = [headers.join(',')]

        for (const row of liveData) {
            const values = headers.map(header => {
                const val = row[header] ?? ''
                return `"${String(val).replace(/"/g, '""')}"`
            })
            csvRows.push(values.join(','))
        }

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="solar_flux_data.csv"')
        res.status(200).send(csvRows.join('\n'))

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}