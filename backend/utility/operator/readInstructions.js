import Instructions from '../../models/instructions.js'

export async function readInstructions(req, res) {
    try {
        const selectedInstruction = await Instructions.findById(req.params.id)

        if (!selectedInstruction) {
            return res.status(404).json({ message: 'Instruction not found' })
        }

        selectedInstruction.isRead = true

        await selectedInstruction.save()

        res.status(200).json({ message: 'Instruction read successfully', selectedInstruction })
    }

    catch (err) {
        console.error('Error reading instruction: ', err)
        res.status(500).json({ message: 'Server error' })
    }
}