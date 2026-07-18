import mongoose from 'mongoose'

const anomalySchema = new mongoose.Schema({
    time_tag: { type: String, required: true },
    flux: { type: Number, required: true },
    classification: { type: String, required: true },
    isAcknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: String, default: null },
    notes: { type: String, default: '' },
    loggedBy: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('Anomaly', anomalySchema)