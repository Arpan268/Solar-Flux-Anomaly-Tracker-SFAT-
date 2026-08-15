import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import axios from "axios";

interface Shift {
    _id: string;
    name: string;
    startTime: string;
    endTime: string;
}

interface UserItem {
    _id: string;
    userId?: string;
    username: string;
    email: string;
    role: "Operator" | "Supervisor" | "Analyst" | "Company Admin";
    shift?: Shift | null;
    status?: string;
    createdAt: string;
}

export default function CompanyAdminManageUsers() {
    const { auth } = useAuth();
    const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");

    const [pendingUsers, setPendingUsers] = useState<UserItem[]>([]);
    const [activeUsers, setActiveUsers] = useState<UserItem[]>([]);
    const [availableShifts, setAvailableShifts] = useState<Shift[]>([]);
    const [selectedShifts, setSelectedShifts] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchInitialData = async () => {
        if (!auth?.accessToken) return;
        setLoading(true);
        setError(null);

        try {
            const [pendingRes, shiftsRes, activeRes] = await Promise.all([
                axios.get("/api/user/company-admin/view-pending-users", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }),
                axios.get("/api/user/company-admin/shifts/available", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }),
                axios.get(`/api/user/company-admin/view-users?page=${page}&limit=10`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }),
            ]);

            const pendingList = pendingRes.data.users || pendingRes.data || [];
            setPendingUsers(pendingList);

            const shiftList = shiftsRes.data.shifts || shiftsRes.data || [];
            setAvailableShifts(shiftList);

            const activeList = activeRes.data.users || activeRes.data || [];
            setActiveUsers(activeList);
            setTotalPages(activeRes.data.totalPages || 1);
        } catch (err: any) {
            console.error("Failed to load user management data:", err);
            setError("Failed to load member records and shift schedules.");
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveUsers = async (targetPage: number) => {
        if (!auth?.accessToken) return;
        setLoading(true);
        try {
            const res = await axios.get(
                `/api/user/company-admin/view-users?page=${targetPage}&limit=10`,
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }
            );
            setActiveUsers(res.data.users || res.data || []);
            setTotalPages(res.data.totalPages || 1);
            setPage(targetPage);
        } catch (err: any) {
            console.error("Failed to fetch active users:", err);
            setError("Failed to reload active member records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [auth]);

    const handleShiftSelect = (userId: string, shiftId: string) => {
        setSelectedShifts((prev) => ({
            ...prev,
            [userId]: shiftId,
        }));
    };

    const handleApprove = async (user: UserItem) => {
        if (!auth?.accessToken) return;

        if (user.role === "Operator" && !selectedShifts[user._id]) {
            setError(`Shift assignment is required before approving Operator ${user.username}.`);
            return;
        }

        setActionLoadingId(user._id);
        setError(null);

        const payload: { updatedStatus: string; shiftId?: string } = {
            updatedStatus: "Approved",
        };

        if (user.role === "Operator") {
            payload.shiftId = selectedShifts[user._id];
        }

        try {
            await axios.put(
                `/api/user/company-admin/${user._id}/status`,
                payload,
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }
            );

            setPendingUsers((prev) => prev.filter((u) => u._id !== user._id));
            setSelectedShifts((prev) => {
                const next = { ...prev };
                delete next[user._id];
                return next;
            });

            fetchActiveUsers(page);
        } catch (err: any) {
            console.error("Error approving registration:", err);
            setError(err.response?.data?.message || "Failed to approve member access.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!auth?.accessToken) return;
        if (!window.confirm("Are you sure you want to reject this registration request?")) return;

        setActionLoadingId(id);
        setError(null);

        try {
            await axios.put(
                `/api/user/company-admin/${id}/status`,
                { updatedStatus: "Rejected" },
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }
            );

            setPendingUsers((prev) => prev.filter((u) => u._id !== id));
        } catch (err: any) {
            console.error("Error rejecting registration:", err);
            setError(err.response?.data?.message || "Failed to reject registration.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!auth?.accessToken) return;
        if (!window.confirm("Are you sure you want to permanently revoke access for this user?")) return;

        setActionLoadingId(id);
        setError(null);

        try {
            await axios.delete(`/api/user/company-admin/${id}/delete`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            fetchActiveUsers(page);
        } catch (err: any) {
            console.error("Failed to delete user:", err);
            setError(err.response?.data?.message || "Failed to revoke access.");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto mt-10 p-6 text-white min-h-screen">
            <div className="mb-8 border-b border-slate-700/60 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        Personnel & Shift Administration
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Authorize team members, assign mandatory shift slots, and manage workspace access.
                    </p>
                </div>

                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700/60">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "pending"
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <span>Pending Requests</span>
                        {pendingUsers.length > 0 && (
                            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[10px] rounded-full font-black">
                                {pendingUsers.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab("active")}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "active"
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <span>Active Team Roster</span>
                        <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 text-[10px] rounded-full font-bold">
                            {activeUsers.length}
                        </span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 font-bold hover:text-white">✕</button>
                </div>
            )}

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm font-medium">
                        Loading personnel records...
                    </div>
                ) : activeTab === "pending" ? (
                    pendingUsers.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <p className="text-base font-semibold text-slate-300">All caught up!</p>
                            <p className="text-xs text-slate-500 mt-1">No pending employee sign-ups awaiting your approval.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-700/30 border-b border-slate-700/50 text-slate-400 uppercase text-xs tracking-wider">
                                        <th className="p-4">Applicant</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Requested Role</th>
                                        <th className="p-4">Shift Assignment (Operators)</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/40">
                                    {pendingUsers.map((user) => {
                                        const isOperator = user.role === "Operator";
                                        const isShiftSelected = Boolean(selectedShifts[user._id]);

                                        return (
                                            <tr key={user._id} className="hover:bg-slate-700/20 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-semibold text-white text-sm">{user.username}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono">
                                                        Requested: {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-300 text-sm font-mono">{user.email}</td>
                                                <td className="p-4">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === "Supervisor"
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
                                                    {isOperator ? (
                                                        <select
                                                            value={selectedShifts[user._id] || ""}
                                                            onChange={(e) => handleShiftSelect(user._id, e.target.value)}
                                                            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                                                        >
                                                            <option value="">-- Assign Shift Slot --</option>
                                                            {availableShifts.map((shift) => (
                                                                <option key={shift._id} value={shift._id}>
                                                                    {shift.name} ({shift.startTime} - {shift.endTime})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 italic">Not applicable</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleReject(user._id)}
                                                        disabled={actionLoadingId === user._id}
                                                        className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 border border-red-800/40 hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(user)}
                                                        disabled={
                                                            actionLoadingId === user._id ||
                                                            (isOperator && !isShiftSelected)
                                                        }
                                                        className={`text-xs font-bold px-4 py-1.5 rounded-lg shadow-md transition-colors ${isOperator && !isShiftSelected
                                                            ? "bg-slate-700 text-slate-500 border border-slate-600 cursor-not-allowed"
                                                            : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                                            }`}
                                                        title={isOperator && !isShiftSelected ? "Select a shift slot to enable approval" : ""}
                                                    >
                                                        {actionLoadingId === user._id ? "Approving..." : "Approve"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : activeUsers.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <p className="text-base font-semibold text-slate-300">No active members found.</p>
                        <p className="text-xs text-slate-500 mt-1">Approve pending applications to build your team.</p>
                    </div>
                ) : (
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-700/30 border-b border-slate-700/50 text-slate-400 uppercase text-xs tracking-wider">
                                        <th className="p-4">Team Member</th>
                                        <th className="p-4">Corporate Email</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Assigned Shift</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/40">
                                    {activeUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-slate-700/20 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-white text-sm">{user.username}</div>
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
                                                        disabled={actionLoadingId === user._id}
                                                        className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
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

                        {totalPages > 1 && (
                            <div className="p-4 bg-slate-800/60 border-t border-slate-700/50 flex justify-between items-center">
                                <button
                                    onClick={() => fetchActiveUsers(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold cursor-pointer"
                                >
                                    Previous
                                </button>
                                <span className="text-slate-400 text-xs">
                                    Page <strong className="text-white">{page}</strong> of <strong>{totalPages}</strong>
                                </span>
                                <button
                                    onClick={() => fetchActiveUsers(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}