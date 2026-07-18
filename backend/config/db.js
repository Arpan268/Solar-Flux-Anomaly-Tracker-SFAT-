import mongoose from "mongoose"

export async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MonoDB connected: ${conn.connection.host}`)
    }
    catch (err) {
        console.error('Error connecting to MongoDB: ', err)
        process.exit(1)
    }
}