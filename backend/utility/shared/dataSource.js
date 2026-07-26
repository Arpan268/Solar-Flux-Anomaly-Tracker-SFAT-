export function getDataSource(req, res) {
    try {
        const dataSource = process.env.DATA_SOURCE || 'live'

        res.status(200).json({ dataSource })
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve data source' })
    }
}