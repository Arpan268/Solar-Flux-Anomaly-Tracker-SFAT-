import mongoose from 'mongoose'

const liveDataSchema = new mongoose.Schema({
    time_tag: { type: String, required: true },
    satellite: { type: Number },
    flux: { type: Number, required: true },
    observed_flux: { type: Number },
    electron_correction: { type: Number },
    electron_contaminaton: { type: Boolean },
    energy: { type: String },
    source: { type: String, enum: ['live', 'mock'], required: true }
}, { timestamps: true })

export default mongoose.models.LiveData || mongoose.model('LiveData', liveDataSchema)