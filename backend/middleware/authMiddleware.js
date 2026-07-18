import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' })
    }
    const token = authHeader.split(' ')[1]
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
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Access denied' })
        }
        next()
    }
}