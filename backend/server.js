import express from 'express'
import 'dotenv/config'
import { connectDB } from './config/db.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)

await connectDB()

app.listen(PORT, () => console.log(`Server is running on port http://localhost:${PORT}`))