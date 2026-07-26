import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext";

export default function UpdateProfile() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();

    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        async function fetchCurrentData() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get("/api/user/me", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setUsername(res.data.username || "");
                setEmail(res.data.email || "");
            } catch (err) {
                setError("Failed to fetch account information.");
            }
        }
        fetchCurrentData();
    }, [auth]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!auth?.accessToken) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        const payload: { username?: string; email?: string; password?: string } = {};
        if (username.trim()) payload.username = username;
        if (email.trim()) payload.email = email;
        if (password.trim()) payload.password = password;

        try {
            await axios.put("/api/user/me/update", payload, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            setSuccess("Profile updated successfully!");
            setTimeout(() => {
                navigate(`/${auth.role}/view-profile`);
            }, 1500);
        } catch (err: any) {
            const message = err.response?.data?.message || "Failed to update profile.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Update Account</h2>
                <p className="text-slate-400 mt-2">
                    Updating settings for Account ID: <span className="text-blue-400 font-mono font-bold">{userId}</span>
                </p>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-900/30 border border-emerald-500/50 text-emerald-400 p-4 rounded-lg mb-6">
                    {success}
                </div>
            )}

            <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-slate-200 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-slate-200 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            New Password (Optional)
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave blank to keep current password"
                            className="w-full bg-gray-800 border border-gray-700 text-slate-200 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 cursor-pointer text-white font-semibold p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="bg-gray-800 cursor-pointer text-slate-300 border border-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}