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
                    <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value as any }))}
                        required
                        className="w-full p-2 bg-gray-800 text-slate-200 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                    />
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