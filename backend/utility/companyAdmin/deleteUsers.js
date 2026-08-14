import User from '../../models/users.js'

export async function deleteUser(req, res) {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (user.company.toString() !== req.user.company.toString()) {
            return res.status(403).json({ message: 'Access denied. User does not belong to your organization.' });
        }

        if (user.role === 'Company Admin') {
            return res.status(403).json({ message: 'Cannot delete admin users' })
        }

        await User.findByIdAndDelete(req.params.id)

        res.status(200).json({ message: 'User deleted successfully' })
    }

    catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}