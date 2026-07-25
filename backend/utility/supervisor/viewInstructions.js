import Instructions from '../../models/instructions.js';

export async function viewInstructions(req, res) {
    try {
        const supervisorId = req.user?.userId
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 6
        const skip = (page - 1) * limit

        const filter = { source: process.env.DATA_SOURCE, supervisorId: supervisorId }
        const total = await Instructions.countDocuments(filter)
        const instructions = await Instructions.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).select('-supervisorId')

        res.status(200).json({
            instructions, total, totalPages: Math.ceil(total / limit), currentPage: page
        })
    }

    catch (err) {
        res.status(500).json({ message: 'Error retrieving instructions', error: err.message });
    }
}