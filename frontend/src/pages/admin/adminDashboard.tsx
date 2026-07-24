import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import axios from "axios";

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
}

export default function Dashboard() {
    const { auth } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUsers() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get(`/api/user?page=${page}&limit=10`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setUsers(res.data.users);
                setTotalPages(res.data.totalPages);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch users", err);
                setError("Failed to load user data.");
            }
        }
        fetchUsers();
    }, [page, auth]);

    async function handleDelete(id: string) {
        if (!auth?.accessToken) return;

        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await axios.delete(`/api/user/${id}`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            const res = await axios.get(`/api/user?page=${page}&limit=10`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            if (res.data.users.length === 0 && page > 1) {
                setPage(page - 1);
            } else {
                setUsers(res.data.users);
                setTotalPages(res.data.totalPages);
            }
        } catch (err) {
            console.error("Failed to delete user", err);
            setError("Failed to delete user.");
        }
    }

    return (
        <div className="max-w-6xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h2>
                <p className="text-slate-400 mt-2">Manage system access and user roles.</p>
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
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {users?.map((user) => (
                                <tr
                                    key={user._id}
                                    className="hover:bg-gray-800/50 transition-colors group"
                                >
                                    <td className="p-4 text-slate-200 font-medium">{user.username}</td>
                                    <td className="p-4 text-slate-400">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'Admin' ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50' :
                                            'bg-gray-800 text-slate-300 border border-gray-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {user.role !== "Admin" && (
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/30 px-4 py-1.5 rounded text-sm font-semibold shadow-sm"
                                            >
                                                Revoke Access
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users?.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No users found on this page.
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="bg-gray-900 border-t border-gray-700 p-4 flex justify-center gap-2">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index}
                                onClick={() => setPage(index + 1)}
                                className={`w-10 h-10 rounded font-semibold transition-colors ${page === index + 1
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                    : "bg-gray-800 text-slate-400 hover:bg-gray-700 hover:text-white border border-gray-700"
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}