import mongoose from 'mongoose';

const advisorySchema = new mongoose.Schema({
    cclass: { type: Number, required: true },
    mclass: { type: Number, required: true },
    xclass: { type: Number, required: true },
    message: { type: String, required: true },
    analystId: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Acknowledged'], default: 'Pending' },
    acknowledgedBySupervisorId: { type: String, default: null },
    source: { type: String, enum: ['live', 'mock'], required: true }
}, { timestamps: true });

export default mongoose.model('Advisory', advisorySchema);