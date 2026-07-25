import User from '../../models/users.js'

export async function deleteOperator(req, res) {
    try {
        const deletedOperator = await User.findByIdAndDelete(req.params.id)

        if (!deletedOperator) {
            return res.status(404).json({ message: 'Operator not found' })
        }

        res.status(200).json({ message: 'Operator deleted successfully' })
    }

    catch (err) {
        console.error('Error deleting operator:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}