import Instructions from '../../models/instructions.js'
import User from '../../models/users.js'

export async function sendInstructions(req, res) {
    try {
        const { targetOperator, message } = req.body
        const supervisorId = req.user.userId

        if (targetOperator === 'All') {
            const operators = await User.find({ role: 'Operator', status: 'Approved' })

            const broadcastData = operators.map(op => ({
                message: message,
                isRead: false,
                supervisorId: supervisorId,
                targetOperatorId: op.userId
            }))

            await Instructions.insertMany(broadcastData)

            res.status(201).json({ message: 'Broadcast sent successfully' })
        }
        else {
            const instruction = new Instructions({
                message: message,
                isRead: false,
                supervisorId: supervisorId,
                targetOperatorId: targetOperator
            })

            await instruction.save()

            res.status(201).json({ message: 'Instruction saved successfully' })
        }
    }

    catch (err) {
        console.error('Error saving instruction: ', err)
        res.status(500).json({ message: 'Server error' })
    }
}