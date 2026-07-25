import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    }
});

export default mongoose.models.Shift || mongoose.model('Shift', shiftSchema);