import Instructions from '../../models/instructions.js'

export async function viewUnreadInstructions(req, res) {
    try {
        const operatorId = req.user.userId

        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 6
        const skip = (page - 1) * limit

        const filter = { isRead: false, targetOperatorId: operatorId }
        const total = await Instructions.countDocuments(filter)
        const instructions = await Instructions.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 })

        res.status(200).json({
            instructions, total, totalPages: Math.ceil(total / limit), currentPage: page
        })
    }

    catch (err) {
        console.error('Error fetching instructions: ', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function viewReadInstructions(req, res) {
    try {
        const operatorId = req.user.userId

        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 6
        const skip = (page - 1) * limit

        const filter = { isRead: true, targetOperatorId: operatorId }
        const total = await Instructions.countDocuments(filter)
        const instructions = await Instructions.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 })

        res.status(200).json({
            instructions, total, totalPages: Math.ceil(total / limit), currentPage: page
        })
    }

    catch (err) {
        console.error('Error fetching instructions: ', err)
        return res.status(500).json({ message: 'Server error' })
    }
}