import mongoose from 'mongoose'

const instructionSchema = new mongoose.Schema({
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    supervisorId: { type: String, required: true },
    targetOperatorId: { type: String, required: true },
    advisoryId: { type: String, default: null },
    isAdvisoryDerived: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    source: { type: String, enum: ['live', 'mock'], required: true }
}, { timestamps: true })

export default mongoose.model('Instructions', instructionSchema)