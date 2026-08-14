import Advisory from '../../models/advisories.js'

export async function acknowledgeAdvisory(req, res) {
    try {
        const advisoryId = req.params.id
        const company = req.user.company
        const userId = req.user.userId || req.user.id

        const selectedAdvisory = await Advisory.findOne({ _id: advisoryId, company: company })

        if (!selectedAdvisory) {
            return res.status(404).json({ message: 'Advisory not found' })
        }

        selectedAdvisory.acknowledgedByCompanyAdminId = userId

        await selectedAdvisory.save()

        res.status(200).json({ message: 'Advisory acknowledged successfully', selectedAdvisory })
    }

    catch (err) {
        console.error('Error acknowledging advisory: ', err)
        res.status(500).json({ message: 'Server error' })
    }
}