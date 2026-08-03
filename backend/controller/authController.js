import User from '../models/users.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { criticalEvent } from '../events/addEvents.js'
import EmailVerification from '../models/emailVerification.js'
import { sendOtp } from './sendOtp.js'

function getCookieOptions(maxAge) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        ...(maxAge !== undefined ? { maxAge } : {}),
    }
}

export async function register(req, res) {
    const { username, email, role, password } = req.body

    if (!username || !email || !role || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    try {
        const prefix = role.substring(0, 3).toUpperCase()
        const randomDigits = Math.floor(1000 + Math.random() * 9000)
        const customUserId = `${prefix}-${randomDigits}`

        const verificationRecord = await EmailVerification.findOne({ email })

        if (!verificationRecord || !verificationRecord.isVerified) {
            return res.status(400).json({ message: 'Email not verified. Please verify your email before registering.' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({
            username,
            email,
            userId: customUserId,
            role,
            password: hashedPassword
        })
        await user.save()

        await EmailVerification.findOneAndDelete({ email })

        const { password: dbPassword, ...userWithoutPassword } = user.toObject()
        criticalEvent.emit('admin-email', { userWithoutPassword })

        res.status(201).json({
            message: 'User successfully registered',
            userId: user.userId,
            user: {
                id: user.userId,
                email: user.email,
                username: user.username,
                role: user.role
            }
        })
    }

    catch (err) {
        console.error('Error registering user:', err)

        if (err.code === 11000) {
            const duplicateField = err.keyValue ? Object.keys(err.keyValue)[0] : 'field'
            const fieldLabel = duplicateField === 'email' ? 'Email' : duplicateField === 'userId' ? 'User ID' : 'Value'
            return res.status(409).json({ message: `${fieldLabel} already exists` })
        }

        return res.status(500).json({ message: 'Server error' })
    }
}


export async function login(req, res) {
    const { userId, password } = req.body

    if (!userId || !password) {
        return res.status(400).json({ message: 'User ID and password are required' })
    }

    try {
        const user = await User.findOne({ userId }).populate('shift')

        if (!user) {
            return res.status(400).json({ message: 'User not found' })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' })
        }

        if (user.status === 'Pending') {
            return res.status(403).json({ message: 'Login failed. Your account is pending admin approval' })
        } else if (user.status === 'Rejected') {
            return res.status(403).json({ message: 'Login failed. Your account approval is rejected by the admin. You can try registering again after 7 days' })
        }

        if (user.role === 'Operator' && user.shift) {
            const { startTime, endTime } = user.shift
            const now = new Date()

            const currentHours = now.getHours()
            const currentMinutes = now.getMinutes()
            const currentAbsolute = currentHours + (currentMinutes / 60)

            const [startH, startM] = startTime.split(':').map(Number)
            const [endH, endM] = endTime.split(':').map(Number)

            const startAbsolute = startH + (startM / 60)
            const endAbsolute = endH + (endM / 60)

            let isWithinShift = false

            if (endAbsolute <= startAbsolute) {
                if (currentAbsolute >= startAbsolute || currentAbsolute < endAbsolute) {
                    isWithinShift = true
                }
            } else {
                if (currentAbsolute >= startAbsolute && currentAbsolute < endAbsolute) {
                    isWithinShift = true
                }
            }

            if (!isWithinShift) {
                return res.status(403).json({ message: `Access denied. Your assigned shift is ${startTime} to ${endTime}. Please log in during your time slot.` })
            }
        }

        const tokenPayload = {
            id: user.userId,
            userId: user.userId,
            role: user.role,
        }

        const accessToken = jwt.sign(
            tokenPayload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign(
            tokenPayload,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )

        res.cookie('accesstoken', accessToken, getCookieOptions())
        res.cookie('refreshtoken', refreshToken, getCookieOptions())

        res.status(200).json({
            accessToken,
            user: {
                id: user.userId,
                username: user.username,
                role: user.role,
            }
        })

    } catch (err) {
        console.error('Error logging in user:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}


export async function refreshToken(req, res) {
    const token = req.cookies.refreshtoken
    const cookieOptions = getCookieOptions()

    if (!token) {
        res.clearCookie('refreshtoken', cookieOptions)
        return res.status(401).json({ message: 'No refresh token provided' })
    }

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findOne({ userId: decoded.id })

        if (!user) {
            res.clearCookie('refreshtoken', cookieOptions)
            return res.status(404).json({ message: 'User not found' })
        }

        if (user.status !== 'Approved') {
            res.clearCookie('refreshtoken', cookieOptions)
            return res.status(403).json({ message: 'Access denied. Account is no longer approved' })
        }

        const tokenPayload = {
            id: user.userId,
            userId: user.userId,
            role: user.role,
        }

        const newAccessToken = jwt.sign(
            tokenPayload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )

        res.cookie('accesstoken', newAccessToken, getCookieOptions())

        res.status(200).json({
            accessToken: newAccessToken,
            user: {
                id: user.userId,
                username: user.username,
                role: user.role,
            },
        })
    }

    catch (err) {
        console.error('Error refreshing token:', err)
        res.clearCookie('refreshtoken', cookieOptions)
        return res.status(403).json({ message: 'Server error' })
    }
}


export async function logout(req, res) {
    try {
        const cookieOptions = getCookieOptions()

        res.clearCookie('accesstoken', cookieOptions)
        res.clearCookie('refreshtoken', cookieOptions)

        res.status(200).json({ message: 'Logged out successfully' })
    }

    catch (err) {
        console.error('Error logging out user:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function generateOtp(req, res) {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ message: 'Email is required' })
    }
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 15) // OTP expires in 15 minutes

        await EmailVerification.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, returnDocument: 'after' }
        )

        const sent = await sendOtp({ email, otp })

        if (!sent) {
            return res.status(500).json({ message: 'Failed to send OTP' })
        }

        res.status(200).json({ message: 'OTP generated successfully' })
    } catch (err) {
        console.error('Error generating OTP:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function verifyOtp(req, res) {
    const { email, otp } = req.body

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' })
    }

    try {
        const user = await EmailVerification.findOne({ email })
        if (!user || user.otp !== otp || user.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Invalid OTP' })
        }
        user.isVerified = true
        await user.save()

        res.status(200).json({ message: 'OTP verified successfully' })
    } catch (err) {
        console.error('Error verifying OTP:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}