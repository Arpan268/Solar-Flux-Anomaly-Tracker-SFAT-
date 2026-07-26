import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext";

interface UserProfile {
    userId: string;
    username: string;
    email: string;
    role: string;
    shift?: {
        name: string;
        startTime: string;
        endTime: string;
    } | null;
}

export default function ViewProfile() {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get("/api/user/me", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setProfile(res.data);
            } catch (err) {
                setError("Failed to fetch profile information.");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [auth]);

    async function handleDelete() {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );
        if (!confirmDelete) return;

        try {
            await axios.delete("/api/user/me/delete", {
                headers: { Authorization: `Bearer ${auth?.accessToken}` },
                withCredentials: true,
            });
            await logout();
            navigate("/login");
        } catch (err) {
            setError("Failed to delete account. Please try again.");
        }
    }

    function handleUpdateNavigation() {
        if (profile?.userId) {
            navigate(`/${profile.role}/profile/update/${profile.userId}`);
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto mt-12 p-6 text-center text-slate-400">
                Loading profile details...
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">User Profile</h2>
                <p className="text-slate-400 mt-2">Manage your account details and security settings.</p>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {profile && (
                <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden p-6 mb-8">
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">User ID</p>
                            <p className="text-blue-400 font-mono font-bold text-lg">{profile.userId}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Username</p>
                            <p className="text-slate-200 font-medium text-lg">{profile.username}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Email Address</p>
                            <p className="text-slate-200 font-medium">{profile.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Role</p>
                            <p className="text-slate-200 font-medium">{profile.role}</p>
                        </div>

                        {profile.role === "Operator" && (
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Assigned Shift</p>
                                {profile.shift ? (
                                    <p className="text-emerald-400 font-medium">
                                        {profile.shift.name} ({profile.shift.startTime} - {profile.shift.endTime})
                                    </p>
                                ) : (
                                    <p className="text-slate-500 italic">Unassigned</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between gap-4">
                        <button
                            onClick={handleUpdateNavigation}
                            className="bg-blue-600/20 cursor-pointer text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/30 px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                            Update Profile
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600/20 cursor-pointer text-red-400 hover:bg-red-600 hover:text-white border border-red-600/30 px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}