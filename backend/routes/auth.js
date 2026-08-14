import express from 'express'
import { generateOtp, login, logout, refreshToken, registerCompany, registerUser, verifyOtp } from '../controller/authController.js'

const router = express.Router()

router.post('/register-company', registerCompany)
router.post('/register-user', registerUser)
router.post('/login', login)
router.get('/refresh', refreshToken)
router.post('/logout', logout)
router.post('/generate-otp', generateOtp)
router.post('/verify-otp', verifyOtp)

export default router