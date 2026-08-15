import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";

interface CompanyMetrics {
    totalEmployees: number;
    pendingUsers: number;
    pendingAdvisories: number;
    acknowledgedAdvisories: number;
}

interface ShiftInfo {
    _id: string;
    name: string;
    startTime: string;
    endTime: string;
}

interface User {
    _id: string;
    userId?: string;
    username: string;
    email: string;
    role: string;
    shift?: ShiftInfo | null;
    createdAt: string;
}

export default function CompanyAdminDashboard() {
    const { auth } = useAuth();

    const [metrics, setMetrics] = useState<CompanyMetrics>({
        totalEmployees: 0,
        pendingUsers: 0,
        pendingAdvisories: 0,
        acknowledgedAdvisories: 0,
    });

    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboardData() {
            if (!auth?.accessToken) return;
            setLoading(true);
            setError(null);

            try {
                const [metricsRes, usersRes] = await Promise.all([
                    axios.get("/api/user/company-admin/metrics", {
                        headers: { Authorization: `Bearer ${auth.accessToken}` },
                        withCredentials: true,
                    }),
                    axios.get(`/api/user/company-admin/view-users?page=${page}&limit=5`, {
                        headers: { Authorization: `Bearer ${auth.accessToken}` },
                        withCredentials: true,
                    }),
                ]);

                setMetrics(metricsRes.data);
                setUsers(usersRes.data.users || []);
                setTotalPages(usersRes.data.totalPages || 1);
            } catch (err: any) {
                console.error("Failed to load company dashboard data:", err);
                setError("Failed to load company metrics and active personnel records.");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [page, auth]);

    async function handleDeleteUser(id: string) {
        if (!auth?.accessToken) return;
        if (!window.confirm("Are you sure you want to revoke access for this team member?")) return;

        try {
            await axios.delete(`/api/user/company-admin/${id}/delete`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            const usersRes = await axios.get(
                `/api/user/company-admin/view-users?page=${page}&limit=5`,
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }
            );

            if (usersRes.data.users.length === 0 && page > 1) {
                setPage((p) => p - 1);
            } else {
                setUsers(usersRes.data.users || []);
                setTotalPages(usersRes.data.totalPages || 1);
            }

            setMetrics((prev) => ({
                ...prev,
                totalEmployees: Math.max(0, prev.totalEmployees - 1),
            }));
        } catch (err: any) {
            console.error("Failed to delete user:", err);
            setError(err.response?.data?.message || "Failed to revoke member access.");
        }
    }

    return (
        <div className="max-w-7xl mx-auto mt-10 p-6 text-white min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-700/60 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        Workspace Command Center
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage organization personnel, monitor space weather advisories, and triage team requests.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/company-admin/view-advisories"
                        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                        <span>Review Advisories</span>
                        {metrics.pendingAdvisories > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                                {metrics.pendingAdvisories}
                            </span>
                        )}
                    </Link>

                    <Link
                        to="/company-admin/manage-users"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer"
                    >
                        <span>Manage Access & Shifts</span>
                        {metrics.pendingUsers > 0 && (
                            <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                                {metrics.pendingUsers}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 font-bold hover:text-white">✕</button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active Personnel</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-extrabold text-white font-mono">{metrics.totalEmployees}</span>
                        <span className="text-xs text-slate-400">Team members</span>
                    </div>
                </div>

                <div className="bg-slate-800/40 border border-amber-500/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold text-amber-400 tracking-wider">Pending Approvals</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-extrabold text-amber-300 font-mono">{metrics.pendingUsers}</span>
                        <span className="text-xs text-amber-400/80">Awaiting role/shift</span>
                    </div>
                </div>

                <div className="bg-slate-800/40 border border-red-500/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold text-red-400 tracking-wider">Action Advisories</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-extrabold text-red-400 font-mono">{metrics.pendingAdvisories}</span>
                        <span className="text-xs text-red-400/80">Pending signature</span>
                    </div>
                </div>

                <div className="bg-slate-800/40 border border-indigo-500/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Signed Advisories</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-extrabold text-indigo-300 font-mono">{metrics.acknowledgedAdvisories}</span>
                        <span className="text-xs text-indigo-400/80">Archived</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-700/20 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-200">Organization Roster</h2>
                        <p className="text-xs text-slate-400">Approved members operating within your workspace</p>
                    </div>
                    <Link
                        to="/company-admin/manage-users"
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                        View Full List & Shifts →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-700/30 border-b border-slate-700/50 text-slate-400 uppercase text-xs tracking-wider">
                                <th className="p-4">Staff Member</th>
                                <th className="p-4">Contact Email</th>
                                <th className="p-4">Assigned Role</th>
                                <th className="p-4">Assigned Shift</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/40">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 text-sm font-medium">
                                        Loading personnel roster...
                                    </td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-200 text-sm">{user.username}</div>
                                            {user.userId && (
                                                <div className="text-xs font-mono text-slate-500">ID: {user.userId}</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-300 text-sm font-mono">{user.email}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === "Company Admin"
                                                    ? "bg-purple-900/30 text-purple-400 border-purple-700/50"
                                                    : user.role === "Supervisor"
                                                        ? "bg-amber-900/30 text-amber-400 border-amber-700/50"
                                                        : user.role === "Analyst"
                                                            ? "bg-blue-900/30 text-blue-400 border-blue-700/50"
                                                            : "bg-emerald-900/30 text-emerald-400 border-emerald-700/50"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {user.shift ? (
                                                <span className="text-xs font-mono text-cyan-300 bg-slate-900/60 border border-slate-700 px-2.5 py-1 rounded">
                                                    {user.shift.name} ({user.shift.startTime} - {user.shift.endTime})
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-500 italic">No shift assigned</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {user.role !== "Company Admin" && (
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    Revoke Access
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                                        No active personnel found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalPages > 1 && (
                    <div className="p-4 bg-slate-800/60 border-t border-slate-700/50 flex justify-between items-center">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold cursor-pointer"
                        >
                            Previous
                        </button>
                        <span className="text-slate-400 text-xs">
                            Page <strong className="text-white">{page}</strong> of <strong>{totalPages}</strong>
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}