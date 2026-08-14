import mongoose from 'mongoose';

const advisorySchema = new mongoose.Schema({
    advisoryType: { type: String, enum: ['Prediction', 'Anomaly'], required: true },
    cclass: { type: Number },
    mclass: { type: Number },
    xclass: { type: Number },
    flareDetails: { type: String, default: null },
    message: { type: String, required: true },
    analystId: { type: String, required: true },
    acknowledgedBySupervisorId: { type: String, default: null },
    acknowledgedByCompanyAdminId: { type: String, default: null },
    company: { type: mongoose.SchemaTypes.ObjectId, ref: 'Companies', default: null },
    source: { type: String, enum: ['live', 'mock'], required: true }
}, { timestamps: true });

export default mongoose.model('Advisory', advisorySchema);