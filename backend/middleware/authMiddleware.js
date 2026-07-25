import jwt from 'jsonwebtoken'
import User from '../models/users.js'

export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization
    const queryToken = req.query.token
    const cookieToken = req.cookies?.accesstoken

    let token

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
    } else if (queryToken) {
        token = queryToken
    } else if (cookieToken) {
        token = cookieToken
    }

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' })
        }

        try {
            const dbUser = await User.findOne({ userId: user.id || user.userId }).populate('shift')

            if (dbUser && dbUser.role === 'Operator' && dbUser.shift) {
                const { startTime, endTime } = dbUser.shift
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
                    return res.status(403).json({ message: 'Shift has ended. Access denied.' })
                }
            }

            req.user = user
            next()
        } catch (error) {
            return res.status(500).json({ message: 'Server error during authentication' })
        }
    })
}

export function verifyRole(role) {
    return (req, res, next) => {
        const userRole = req.user?.role

        if (role !== userRole) {
            return res.status(403).json({ message: 'Access denied' })
        }
        next()
    }
}