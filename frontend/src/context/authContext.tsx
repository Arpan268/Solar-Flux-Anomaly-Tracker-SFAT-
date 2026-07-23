import { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios'
import type { AuthData, AuthContextType } from "../types/auth";

interface AuthProviderProps {
    children: React.ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
    const [auth, setAuth] = useState<AuthData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await axios.get('/api/auth/refresh', {
                    withCredentials: true
                })
                setAuth({ accessToken: res.data.accessToken, role: res.data.user.role })
            }

            catch {
                setAuth(null)
            }

            finally {
                setLoading(false)
            }
        }
        checkAuth()
    }, [])

    return (
        <AuthContext.Provider value={{ auth, setAuth, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}