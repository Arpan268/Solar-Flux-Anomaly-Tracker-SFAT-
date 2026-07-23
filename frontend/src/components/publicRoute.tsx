import { useAuth } from "../context/authContext";
import { Navigate } from 'react-router-dom'

interface PublicRouteProps {
    children: React.ReactNode
}

export default function PublicRoute({ children }: PublicRouteProps) {
    const { auth, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>
    }

    if (auth && auth.accessToken) {
        return <Navigate to='/' />
    }

    return <>{children}</>
}