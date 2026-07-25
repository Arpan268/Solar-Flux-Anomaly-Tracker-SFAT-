import User from '../models/users.js'

export async function getUsers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page - 1) * limit

        const filter = { status: 'Approved' }
        const total = await User.countDocuments(filter)
        const users = await User.find(filter).skip(skip).limit(limit).select('-password')

        res.status(200).json({
            users, total, totalPages: Math.ceil(total / limit), currentPage: page
        })
    }

    catch (err) {
        console.error('Error fetching users:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}


export async function deleteUser(req, res) {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (user.role === 'Admin') {
            return res.status(403).json({ message: 'Cannot delete admin users' })
        }

        await User.findByIdAndDelete(req.params.id)

        res.status(200).json({ message: 'User deleted successfully' })
    }

    catch (err) {
        console.error('Error deleting user:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function getPendingUsers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page - 1) * limit

        const filter = { status: 'Pending' }
        const total = await User.countDocuments(filter)
        const users = await User.find(filter).skip(skip).limit(limit).select('-password')

        res.status(200).json({
            users, total, totalPages: Math.ceil(total / limit), currentPage: page
        })
    }

    catch (err) {
        console.error('Error fetching users:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function handleStatus(req, res) {
    try {
        const { updatedStatus } = req.body
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        user.status = updatedStatus

        if (updatedStatus === 'Rejected') {
            user.rejectedAt = new Date()
        }
        else {
            user.rejectedAt = null
        }

        await user.save()

        if (updatedStatus === 'Approved') {
            return res.status(200).json({ message: 'User approved' })
        }
        else if (updatedStatus === 'Rejected') {
            return res.status(200).json({ message: 'User rejected' })
        }

        return res.status(200).json({ message: 'User status updated' })
    }

    catch (err) {
        console.error('Error updating user status:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function getProfile(req, res) {
    try {
        const user = await User.findById({ userId: req.user.id }).select('-password')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.status(200).json(user)
    }

    catch (err) {
        console.error('Error fetching user profile:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}