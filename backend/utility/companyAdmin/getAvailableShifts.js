import User from '../../models/users.js'
import Shift from '../../models/shifts.js'

export async function getAvailableShifts(req, res) {
    try {
        const company = req.user.company
        const allShifts = await Shift.find({ company: company })
        const assignedUsers = await User.find({ role: 'Operator', status: 'Approved', shift: { $ne: null }, company: company })
        const assignedShiftIds = assignedUsers.map(u => u.shift.toString())
        const availableShifts = allShifts.filter(s => !assignedShiftIds.includes(s._id.toString()))

        res.status(200).json(availableShifts)
    }

    catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}