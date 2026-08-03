import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authContext';

interface LoginForm {
    userId: string;
    password: '';
}

export default function Login() {
    const { setAuth } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState<LoginForm>({
        userId: '',
        password: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await axios.post('/api/auth/login', form, { withCredentials: true });
            setAuth({ accessToken: res.data.accessToken, role: res.data.user.role });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-slate-200">Login</h2>

            {error && <p className="text-red-400 bg-red-900/30 p-2 rounded mb-4">{error}</p>}

            <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                    <input
                        type="text"
                        placeholder="User ID"
                        value={form.userId}
                        onChange={(e) => setForm(prev => ({ ...prev, userId: e.target.value }))}
                        required
                        className="w-full p-2 bg-gray-800 text-slate-200 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={form.password}
                            onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value as any }))}
                            required
                            className="w-full p-2 bg-gray-800 text-slate-200 border border-gray-700 rounded focus:outline-none focus:border-blue-500 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors cursor-pointer"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white p-2 mt-4 rounded hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-colors"
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className="mt-4 text-center text-slate-400 text-sm">
                Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Register</Link>
            </div>
        </div>
    );
}