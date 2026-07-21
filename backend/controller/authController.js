import User from '../models/users.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function register(req, res) {
    const { username, email, role, password } = req.body

    if (!username || !email || !role || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    try {
        const prefix = role.substring(0, 3).toUpperCase()
        const randomDigits = Math.floor(1000 + Math.random() * 9000)
        const customUserId = `${prefix}-${randomDigits}`

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({
            username,
            email,
            userId: customUserId,
            role,
            password: hashedPassword
        })
        await user.save()
        res.status(201).json({
            message: 'User successfully registered',
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
        return res.status(500).json({ message: 'Server error' })
    }
}


export async function login(req, res) {
    const { userId, password } = req.body

    if (!userId || !password) {
        return res.status(400).json({ message: 'User ID and password are required' })
    }

    try {
        const user = await User.findOne({ userId })

        if (!user) {
            return res.status(400).json({ message: 'User not found' })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' })
        }

        if (user.status === 'Pending') {
            return res.status(403).json({ message: 'Login failed. Your account is pending admin approval' })
        }
        else if (user.status === 'Rejected') {
            return res.status(403).json({ message: 'Login failed. Your account approval is rejected by the admin' })
        }

        const accessToken = jwt.sign(
            {
                id: user.userId,
                role: user.role,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '15m'
            }
        )

        const refreshToken = jwt.sign(
            {
                id: user.userId,
                role: user.role,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: '7d'
            }
        )

        res.cookie('refreshtoken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            accessToken,
            user: {
                id: user.userId,
                username: user.username,
                role: user.role,
            },
        })
    }

    catch (err) {
        console.error('Error logging in user:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}


export async function refreshToken(req, res) {
    const token = req.cookies.refreshtoken

    if (!token) {
        return res.status(401).json({ message: 'No refresh token provided' })
    }

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findOne({ userId: decoded.id })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (user.status !== 'Approved') {
            return res.status(403).json({ message: 'Access denied. Account is no longer approved' })
        }

        const newAccessToken = jwt.sign(
            { id: user.userId, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )

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
        return res.status(403).json({ message: 'Server error' })
    }
}


export async function logout(req, res) {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
        }

        res.clearCookie('refreshtoken', cookieOptions)

        res.status(200).json({ message: 'Logged out successfully' })
    }

    catch (err) {
        console.error('Error logging out user:', err)
        return res.status(500).json({ message: 'Server error' })
    }
}