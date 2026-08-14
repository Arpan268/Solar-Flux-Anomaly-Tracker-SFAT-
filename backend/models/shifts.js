import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    company: { type: mongoose.SchemaTypes.ObjectId, ref: 'Companies', default: null },
});

shiftSchema.index({ name: 1, company: 1 }, { unique: true });

export default mongoose.models.Shift || mongoose.model('Shift', shiftSchema);