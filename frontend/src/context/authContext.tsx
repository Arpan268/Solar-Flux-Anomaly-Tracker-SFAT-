import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import axios from "axios";
import type { AuthData, AuthContextType } from "../types/auth";

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [auth, setAuth] = useState<AuthData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function initializeAuth() {

            const hasActiveTabSession = sessionStorage.getItem("is_logged_in") === "true";

            if (!hasActiveTabSession) {
                try {
                    await axios.post("/api/auth/logout", {}, { withCredentials: true });
                } catch (err) {
                }

                setAuth(null);
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get("/api/auth/refresh", {
                    withCredentials: true,
                });
                setAuth({ accessToken: res.data.accessToken, role: res.data.user.role });
            } catch (err) {
                console.error("Session refresh failed:", err);
                setAuth(null);
                sessionStorage.removeItem("is_logged_in");
            } finally {
                setLoading(false);
            }
        }

        initializeAuth();
    }, []);

    useEffect(() => {
        if (auth) {
            sessionStorage.setItem("is_logged_in", "true");
        } else if (!loading) {
            sessionStorage.removeItem("is_logged_in");
        }
    }, [auth, loading]);

    return (
        <AuthContext.Provider value={{ auth, setAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}