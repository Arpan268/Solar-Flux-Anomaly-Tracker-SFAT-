import User from '../../models/users.js'

export async function viewOperators(req, res) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page - 1) * limit

        const filter = { role: 'Operator', status: 'Approved' }
        const total = await User.countDocuments(filter)
        const users = await User.find(filter).skip(skip).limit(limit).select('-password -status -rejectedAt -role')

        res.status(200).json({
            users, total, totalPages: Math.ceil(total / limit), currentPage: page
        })
    }

    catch (err) {
        console.error('Error fetching operators:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}