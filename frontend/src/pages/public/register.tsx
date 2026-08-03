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
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [otp, setOtp] = useState<string>('');
    const [otpSent, setOtpSent] = useState<boolean>(false);
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [otpLoading, setOtpLoading] = useState<boolean>(false);
    const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
    const [otpMessage, setOtpMessage] = useState<string | null>(null);

    const handleGenerateOTP = async () => {
        if (!form.email) {
            setOtpMessage('Please enter an email first.');
            return;
        }

        setOtpLoading(true);
        setOtpMessage(null);
        try {
            await axios.post('/api/auth/generate-otp', { email: form.email }, { withCredentials: true });
            setOtpSent(true);
            setOtpMessage('An email has gone to your account. If you cannot view it, please check the spam folder.');
        } catch (err: any) {
            setOtpMessage(err.response?.data?.message || 'Failed to send OTP. Try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) return;

        setVerifyLoading(true);
        setOtpMessage(null);
        try {
            await axios.post('/api/auth/verify-otp', { email: form.email, otp }, { withCredentials: true });
            setIsVerified(true);
            setOtpMessage(null);
        } catch (err: any) {
            setOtpMessage('Please check your email and try again. Invalid or expired OTP.');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, email: e.target.value as any }));
        if (isVerified) setIsVerified(false);
        if (otpSent) setOtpSent(false);
        if (otpMessage) setOtpMessage(null);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isVerified) return;

        setError(null);
        setIsLoading(true);

        try {
            const res = await axios.post('/api/auth/register', form, { withCredentials: true });
            setRegisteredUserId(res.data.userId || res.data.user?.id);
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
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6 flex flex-col items-center">
                    <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Your User ID</p>

                    <div
                        onClick={() => {
                            navigator.clipboard.writeText(registeredUserId);
                            alert("User ID copied to clipboard!");
                        }}
                        className="flex items-center gap-3 cursor-pointer group hover:bg-gray-700 p-2 rounded transition-colors active:scale-95"
                        title="Click to copy"
                    >
                        <p className="text-4xl font-mono text-white font-bold tracking-widest">
                            {registeredUserId}
                        </p>

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                        </svg>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">Click the ID to copy</p>
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
        <div className="max-w-md mx-auto mt-20 p-8 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
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
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleEmailChange}
                            required
                            className="w-full p-2 bg-gray-800 text-slate-200 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                        />
                        {!isVerified && (
                            <button
                                type="button"
                                onClick={handleGenerateOTP}
                                disabled={!form.email || otpLoading}
                                className="whitespace-nowrap px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {otpLoading ? 'Sending...' : 'Generate OTP'}
                            </button>
                        )}
                    </div>

                    {isVerified && <p className="text-green-400 text-sm mt-2 flex items-center gap-1">✓ Email Verified</p>}
                    {otpMessage && !isVerified && (
                        <p className={`text-sm mt-2 ${otpMessage.includes('account') ? 'text-blue-400' : 'text-red-400'}`}>
                            {otpMessage}
                        </p>
                    )}
                </div>

                {otpSent && !isVerified && (
                    <div className="flex gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Strips out non-numbers
                            className="w-full p-2 bg-gray-800 text-slate-200 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-center tracking-widest"
                        />
                        <button
                            type="button"
                            onClick={handleVerifyOTP}
                            disabled={otp.length !== 6 || verifyLoading}
                            className="whitespace-nowrap px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {verifyLoading ? 'Checking...' : 'Verify OTP'}
                        </button>
                    </div>
                )}

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
                    disabled={isLoading || !isVerified}
                    className="w-full bg-blue-600 text-white p-2 mt-4 rounded hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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