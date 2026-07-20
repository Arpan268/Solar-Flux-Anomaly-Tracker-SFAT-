import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization
    const queryToken = req.query.token

    let token

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
    } else if (queryToken) {
        token = queryToken
    }

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' })
        }
        req.user = user
        next()
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