import mongoose from 'mongoose'

const anomalySchema = new mongoose.Schema({
    time_tag: { type: String, required: true },
    flux: { type: Number, required: true },
    classification: { type: String, required: true },
    electron_contaminaton: { type: Boolean, default: false },
    isAcknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: String, default: null },
    notes: { type: String, default: '' },
    loggedBy: { type: String, required: true },
    source: { type: String, enum: ['live', 'mock'], required: true }
}, { timestamps: true })

export default mongoose.model('Anomaly', anomalySchema)