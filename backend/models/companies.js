import mongoose from "mongoose";

const companiesSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    companyType: { type: String, required: true, enum: ['Aviation', 'GNSS & Navigation', 'Satellite Operations', 'Power & Energy', 'Telecommunications', 'Maritime & Shipping', 'Space Research', 'Other'] },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    rejectedAt: { type: Date, default: null },
}, { timestamps: true });

companiesSchema.index({ rejectedAt: 1 }, { expireAfterSeconds: 604800 })

export default mongoose.model('Companies', companiesSchema);