import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Operator', 'Supervisor', 'Analyst', 'Admin'] },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    rejectedAt: { type: Date, default: null }
}, { timestamps: true })

userSchema.index({ rejectedAt: 1 }, { expireAfterSeconds: 604800 })

export default mongoose.model('Users', userSchema)