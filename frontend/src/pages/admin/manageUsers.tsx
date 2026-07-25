import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import axios from "axios";

interface PendingUser {
    _id: string;
    username: string;
    email: string;
    role: string;
}

export default function ManageUsers() {
    const { auth } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPendingUsers() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get("/api/user/pending", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });

                const pending = res.data.users.filter((user: any) => user.status === 'Pending');
                setPendingUsers(pending);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Failed to load registration requests.");
            }
        }
        fetchPendingUsers();
    }, [auth]);

    async function handleApprove(id: string) {
        if (!auth?.accessToken) return;

        try {
            await axios.put(`/api/user/${id}/status`, { updatedStatus: 'Approved' }, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            setPendingUsers((prev) => prev.filter((user) => user._id !== id));
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to approve the registration.");
        }
    }

    async function handleReject(id: string) {
        if (!auth?.accessToken) return;

        if (!window.confirm("Are you sure you want to reject this access request?")) return;

        try {
            await axios.put(`/api/user/${id}/status`, { updatedStatus: 'Rejected' }, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            setPendingUsers((prev) => prev.filter((user) => user._id !== id));
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to reject the registration.");
        }
    }

    return (
        <div className="max-w-6xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Access Requests</h2>
                <p className="text-slate-400 mt-2">Review and approve pending registrations for the system.</p>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800 border-b border-gray-700 text-slate-300 uppercase text-sm tracking-wider">
                                <th className="p-4 font-semibold">Username</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Requested Role</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {pendingUsers?.map((user) => (
                                <tr
                                    key={user._id}
                                    className="hover:bg-gray-800/50 transition-colors group"
                                >
                                    <td className="p-4 text-slate-200 font-medium">{user.username}</td>
                                    <td className="p-4 text-slate-400">{user.email}</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-slate-300 border border-gray-600">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-3">
                                        <button
                                            onClick={() => handleReject(user._id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/30 px-4 py-1.5 rounded text-sm font-semibold shadow-sm cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(user._id)}
                                            className="bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white border border-emerald-600/30 px-4 py-1.5 rounded text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                                        >
                                            Approve
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pendingUsers?.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No pending registration requests at this time.
                    </div>
                )}
            </div>
        </div>
    );
}