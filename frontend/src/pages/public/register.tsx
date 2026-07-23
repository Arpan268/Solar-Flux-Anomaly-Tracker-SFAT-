import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface RegisterForm {
    username: '';
    email: '';
    password: '';
    role: 'Operator' | 'Supervisor' | 'Analyst';
}

export default function Register() {
    const [form, setForm] = useState<RegisterForm>({
        username: '',
        email: '',
        password: '',
        role: 'Operator'
    });

    const [error, setError] = useState<string | null>(null);
    const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await axios.post('/api/auth/register', form, { withCredentials: true });
            setRegisteredUserId(res.data.userId);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    if (registeredUserId) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 bg-gray-900 rounded-lg shadow-xl border border-gray-700 text-center">
                <h2 className="text-2xl font-bold mb-4 text-green-400">Registration Submitted</h2>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                    <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Your User ID</p>
                    <p className="text-4xl font-mono text-white font-bold tracking-widest">{registeredUserId}</p>
                </div>

                <div className="bg-red-900/30 border border-red-500/50 p-4 rounded mb-8">
                    <p className="text-red-400 font-bold mb-2">⚠️ Important!</p>
                    <p className="text-red-200 text-sm">
                        Please note down this User ID immediately. You will not be able to log in without it.
                    </p>
                </div>
                <p className="text-slate-300 mb-8">
                    Your account has been created successfully, but it requires Admin approval before you can log in.
                    Please contact your system administrator to activate your role as {form.role}.
                </p>
                <Link
                    to="/login"
                    className="w-full block bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Go to Login Page
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-slate-200">Register Account</h2>

            {error && <p className="text-red-400 bg-red-900/30 p-2 rounded mb-4">{error}</p>}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value as any }))}
                        required
                        className="w-full p-2 bg-gray-800 text-slate-200 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value as any }))}
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

                <div className="pt-2">
                    <p className="text-slate-300 mb-2 font-semibold">Requested Role:</p>
                    <div className="flex gap-4">
                        {['Operator', 'Supervisor', 'Analyst'].map((roleOption) => (
                            <label key={roleOption} className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value={roleOption}
                                    checked={form.role === roleOption}
                                    onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value as any }))}
                                    className="cursor-pointer accent-blue-500"
                                />
                                <span>{roleOption}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white p-2 mt-4 rounded hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-colors"
                >
                    {isLoading ? 'Submitting...' : 'Register'}
                </button>

            </form>

            <div className="mt-4 text-center text-slate-400 text-sm">
                Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Log in</Link>
            </div>
        </div>
    );
}