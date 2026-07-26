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

    const logout = async () => {
        try {
            await axios.post("/api/auth/logout", {}, { withCredentials: true });
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setAuth(null);
            sessionStorage.removeItem("is_logged_in");
        }
    };

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
        if (auth?.role !== 'Operator') return;

        let intervalId: ReturnType<typeof setInterval>;

        const enforceShiftTime = async () => {
            try {
                const res = await axios.get('/api/user/me', {
                    headers: { Authorization: `Bearer ${auth.accessToken}` }
                });

                const shift = res.data.shift;
                if (!shift) return;

                intervalId = setInterval(() => {
                    const now = new Date();
                    const [startH, startM] = shift.startTime.split(':').map(Number);
                    const [endH, endM] = shift.endTime.split(':').map(Number);

                    const currentAbsolute = now.getHours() + (now.getMinutes() / 60);
                    const startAbsolute = startH + (startM / 60);
                    const endAbsolute = endH + (endM / 60);

                    let isWithinShift = false;

                    if (endAbsolute <= startAbsolute) {
                        if (currentAbsolute >= startAbsolute || currentAbsolute < endAbsolute) {
                            isWithinShift = true;
                        }
                    } else {
                        if (currentAbsolute >= startAbsolute && currentAbsolute < endAbsolute) {
                            isWithinShift = true;
                        }
                    }

                    if (!isWithinShift) {
                        clearInterval(intervalId);
                        logout();
                        alert("Your shift has ended. You have been automatically logged out.");
                    }
                }, 60000);

            } catch (err) {
                console.error("Failed to fetch shift for timer", err);
            }
        };

        enforceShiftTime();

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [auth]);

    useEffect(() => {
        if (auth) {
            sessionStorage.setItem("is_logged_in", "true");
        } else if (!loading) {
            sessionStorage.removeItem("is_logged_in");
        }
    }, [auth, loading]);

    return (
        <AuthContext.Provider value={{ auth, setAuth, loading, logout }}>
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