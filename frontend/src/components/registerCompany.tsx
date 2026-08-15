import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const COMPANY_TYPES = [
    'Aviation',
    'GNSS & Navigation',
    'Satellite Operations',
    'Power & Energy',
    'Telecommunications',
    'Maritime & Shipping',
    'Space Research',
    'Other'
];

interface CompanyForm {
    companyName: string;
    email: string;
    companyType: string;
}

export default function RegisterCompany() {
    const [form, setForm] = useState<CompanyForm>({
        companyName: '',
        email: '',
        companyType: 'Aviation'
    });

    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [otp, setOtp] = useState<string>('');
    const [otpSent, setOtpSent] = useState<boolean>(false);
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [otpLoading, setOtpLoading] = useState<boolean>(false);
    const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
    const [otpMessage, setOtpMessage] = useState<string | null>(null);

    const handleGenerateOTP = async () => {
        if (!form.email) {
            setOtpMessage('Please enter a corporate email first.');
            return;
        }

        setOtpLoading(true);
        setOtpMessage(null);
        try {
            await axios.post('/api/auth/generate-otp', { email: form.email }, { withCredentials: true });
            setOtpSent(true);
            setOtpMessage('An OTP has been sent to your corporate email.');
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
            setOtpMessage('Invalid or expired OTP. Please check your email.');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, email: e.target.value }));
        if (isVerified) setIsVerified(false);
        if (otpSent) setOtpSent(false);
        if (otpMessage) setOtpMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isVerified) return;

        setError(null);
        setIsLoading(true);

        try {
            await axios.post('/api/auth/register-company', form, { withCredentials: true });
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Company registration failed. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-md mx-auto mt-10 p-8 bg-gray-900 rounded-lg shadow-xl border border-gray-700 text-center">
                <h2 className="text-2xl font-bold mb-4 text-green-400">Registration Submitted</h2>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6 text-left">
                    <p className="text-slate-300 text-sm mb-2">
                        Company: <strong className="text-white">{form.companyName}</strong>
                    </p>
                    <p className="text-slate-300 text-sm mb-2">
                        Corporate Email: <strong className="text-white">{form.email}</strong>
                    </p>
                    <p className="text-slate-300 text-sm">
                        Industry Type: <strong className="text-white">{form.companyType}</strong>
                    </p>
                </div>

                <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded mb-6 text-left">
                    <p className="text-blue-200 text-sm">
                        Your organization is currently in <strong>Pending SFAT Admin Approval</strong>. You will receive an email confirmation once reviewed.
                    </p>
                </div>

                <Link
                    to="/login"
                    className="w-full block bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Return to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-6 p-8 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-slate-200">Register Organization</h2>

            {error && <p className="text-red-400 bg-red-900/30 p-2 rounded mb-4 text-sm">{error}</p>}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Company Name"
                        value={form.companyName}
                        onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                        required
                        className="w-full p-2 bg-gray-800 text-slate-200 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Corporate Email"
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
                                className="whitespace-nowrap px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {otpLoading ? 'Sending...' : 'Generate OTP'}
                            </button>
                        )}
                    </div>
                    {isVerified && <p className="text-green-400 text-sm mt-2 flex items-center gap-1">✓ Email Verified</p>}
                    {otpMessage && !isVerified && (
                        <p className="text-sm mt-2 text-blue-400">{otpMessage}</p>
                    )}
                </div>

                {otpSent && !isVerified && (
                    <div className="flex gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-2 bg-gray-800 text-slate-200 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-center tracking-widest"
                        />
                        <button
                            type="button"
                            onClick={handleVerifyOTP}
                            disabled={otp.length !== 6 || verifyLoading}
                            className="whitespace-nowrap px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {verifyLoading ? 'Checking...' : 'Verify OTP'}
                        </button>
                    </div>
                )}

                <div>
                    <label className="block text-slate-300 text-sm font-semibold mb-2">Industry Sector</label>
                    <select
                        value={form.companyType}
                        onChange={(e) => setForm(prev => ({ ...prev, companyType: e.target.value }))}
                        className="w-full p-2 bg-gray-800 text-slate-200 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                    >
                        {COMPANY_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !isVerified}
                    className="w-full bg-blue-600 text-white p-2 mt-4 rounded hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                    {isLoading ? 'Submitting...' : 'Register Company'}
                </button>
            </form>
        </div>
    );
}