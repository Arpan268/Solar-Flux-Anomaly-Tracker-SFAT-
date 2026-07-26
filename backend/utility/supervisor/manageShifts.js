import User from '../../models/users.js'
import Shift from '../../models/shifts.js'

export async function getAllShifts(req, res) {
    try {
        const shifts = await Shift.find()
        res.status(200).json(shifts)
    } catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function bulkReassignShifts(req, res) {
    try {
        const { assignments } = req.body

        const shiftIds = assignments.map(a => a.shiftId).filter(id => id !== null)
        const uniqueShiftIds = new Set(shiftIds)

        if (shiftIds.length !== uniqueShiftIds.size) {
            return res.status(400).json({ message: 'Duplicate shifts detected. Each shift can only be assigned to one operator.' })
        }

        const operatorIds = assignments.map(a => a.operatorId)

        for (const shiftId of uniqueShiftIds) {
            const existingUser = await User.findOne({
                shift: shiftId,
                status: 'Approved',
                _id: { $nin: operatorIds }
            })
            if (existingUser) {
                return res.status(400).json({ message: 'Shift overlap detected with an operator not in this update.' })
            }
        }

        for (const { operatorId, shiftId } of assignments) {
            await User.findByIdAndUpdate(operatorId, { shift: shiftId || null })
        }

        res.status(200).json({ message: 'Shifts updated successfully' })
    } catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}