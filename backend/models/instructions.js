import mongoose from 'mongoose'

const instructionSchema = new mongoose.Schema({
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    supervisorId: { type: String, required: true },
    targetOperatorId: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('Instructions', instructionSchema)