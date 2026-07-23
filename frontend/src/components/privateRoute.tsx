import { useAuth } from "../context/authContext"
import { Navigate } from 'react-router-dom'

interface PrivateRouteProps {
    children: React.ReactNode
    allowedRoles?: string[]
}

export default function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
    const { auth, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>
    }

    if (!auth || !auth.accessToken) {
        return <Navigate to='/login' />
    }

    if (allowedRoles && !allowedRoles.includes(auth.role)) {
        return <Navigate to='/login' />
    }

    return <>{children}</>
}