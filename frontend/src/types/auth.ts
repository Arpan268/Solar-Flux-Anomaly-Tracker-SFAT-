export interface AuthData {
    accessToken: string,
    role: 'Operator' | 'Supervisor' | 'Analyst' | 'Admin'
}

export interface AuthContextType {
    auth: AuthData | null,
    setAuth: React.Dispatch<React.SetStateAction<AuthData | null>>,
    loading: boolean
}