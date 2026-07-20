import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Operator', 'Supervisor', 'Analyst', 'Admin'] }
}, { timestamps: true })

export default mongoose.model('Users', userSchema)