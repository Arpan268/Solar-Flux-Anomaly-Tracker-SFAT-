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

export async function reassignShift(req, res) {
    try {
        const { shiftId } = req.body
        const operatorId = req.params.id

        const existingAssignment = await User.findOne({ shift: shiftId, _id: { $ne: operatorId }, status: 'Approved' })
        if (existingAssignment) {
            return res.status(400).json({ message: 'Shift overlap detected: This shift is currently assigned to another operator.' })
        }

        const operator = await User.findById(operatorId)
        if (!operator || operator.role !== 'Operator') {
            return res.status(404).json({ message: 'Operator not found' })
        }

        operator.shift = shiftId
        await operator.save()

        res.status(200).json({ message: 'Shift updated successfully' })
    } catch (err) {
        return res.status(500).json({ message: 'Server error' })
    }
}