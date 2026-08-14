import User from '../../models/users.js'

export async function handleStatus(req, res) {
    try {
        const { updatedStatus, shiftId } = req.body
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (user.company.toString() !== req.user.company.toString()) {
            return res.status(403).json({ message: 'Access denied. User does not belong to your organization.' });
        }
        
        user.status = updatedStatus

        if (updatedStatus === 'Rejected') {
            user.rejectedAt = new Date()
            user.shift = null
        } else {
            user.rejectedAt = null
            if (updatedStatus === 'Approved' && user.role === 'Operator' && shiftId) {
                user.shift = shiftId
            }
        }

        await user.save()

        if (updatedStatus === 'Approved') {
            return res.status(200).json({ message: 'User approved' })
        } else if (updatedStatus === 'Rejected') {
            return res.status(200).json({ message: 'User rejected' })
        }

        return res.status(200).json({ message: 'User status updated' })

    }

    catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}