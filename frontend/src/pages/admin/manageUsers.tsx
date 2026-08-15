import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import axios from "axios";

interface PendingCompany {
    _id: string;
    companyName: string;
    email: string;
    companyType: string;
    createdAt: string;
}

interface PendingUser {
    _id: string;
    userId?: string;
    username: string;
    email: string;
    role: string;
    company?: {
        companyName: string;
    } | string;
    createdAt: string;
}

export default function ManageUsers() {
    const { auth } = useAuth();
    const [activeTab, setActiveTab] = useState<"companies" | "users">("companies");

    const [pendingCompanies, setPendingCompanies] = useState<PendingCompany[]>([]);
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const fetchPendingData = async () => {
        if (!auth?.accessToken) return;
        setLoading(true);
        setError(null);

        try {
            const [companiesRes, usersRes] = await Promise.all([
                axios.get("/api/user/admin/get-pending-companies", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }),
                axios.get("/api/user/admin/get-pending-users", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }),
            ]);

            const compData = Array.isArray(companiesRes.data)
                ? companiesRes.data
                : companiesRes.data.companies || [];
            setPendingCompanies(compData.filter((c: any) => c.status === "Pending" || !c.status));

            const userData = Array.isArray(usersRes.data)
                ? usersRes.data
                : usersRes.data.users || [];
            setPendingUsers(userData.filter((u: any) => u.status === "Pending"));
        } catch (err) {
            console.error("Failed to load registration queues:", err);
            setError("Failed to fetch pending registration requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingData();
    }, [auth]);

    const handleCompanyStatus = async (id: string, updatedStatus: "Approved" | "Rejected") => {
        if (!auth?.accessToken) return;
        if (!window.confirm(`Are you sure you want to set this organization to ${updatedStatus}?`)) return;

        setActionLoadingId(id);
        try {
            await axios.put(
                `/api/user/admin/${id}/handle-company-status`,
                { updatedStatus },
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }
            );
            setPendingCompanies((prev) => prev.filter((c) => c._id !== id));
        } catch (err: any) {
            console.error("Error updating company status:", err);
            setError(err.response?.data?.message || "Failed to update company status.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleUserStatus = async (id: string, updatedStatus: "Approved" | "Rejected") => {
        if (!auth?.accessToken) return;
        if (!window.confirm(`Are you sure you want to set this user to ${updatedStatus}?`)) return;

        setActionLoadingId(id);
        try {
            await axios.put(
                `/api/user/admin/${id}/handle-status`,
                { updatedStatus },
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }
            );
            setPendingUsers((prev) => prev.filter((u) => u._id !== id));
        } catch (err: any) {
            console.error("Error updating user status:", err);
            setError(err.response?.data?.message || "Failed to update user status.");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto mt-10 p-6 text-white min-h-screen">
            <div className="mb-8 border-b border-slate-700/60 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        Registration & Access Triage
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Review incoming corporate tenant applications and direct user access requests.
                    </p>
                </div>

                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700/60">
                    <button
                        onClick={() => setActiveTab("companies")}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "companies"
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <span>Organizations</span>
                        {pendingCompanies.length > 0 && (
                            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[10px] rounded-full font-black">
                                {pendingCompanies.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab("users")}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "users"
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <span>User Accounts</span>
                        {pendingUsers.length > 0 && (
                            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[10px] rounded-full font-black">
                                {pendingUsers.length}
                            </span>
                        )}
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
                        Loading approval queue...
                    </div>
                ) : activeTab === "companies" ? (
                    pendingCompanies.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <p className="text-base font-semibold text-slate-300">No pending company registrations.</p>
                            <p className="text-xs text-slate-500 mt-1">All organization onboarding requests have been reviewed.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-700/30 border-b border-slate-700/50 text-slate-400 uppercase text-xs tracking-wider">
                                        <th className="p-4">Organization Name</th>
                                        <th className="p-4">Corporate Email</th>
                                        <th className="p-4">Industry Sector</th>
                                        <th className="p-4">Submitted Date</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/40">
                                    {pendingCompanies.map((company) => (
                                        <tr key={company._id} className="hover:bg-slate-700/20 transition-colors">
                                            <td className="p-4 text-white font-bold text-sm">
                                                {company.companyName}
                                            </td>
                                            <td className="p-4 text-slate-300 text-sm font-mono">{company.email}</td>
                                            <td className="p-4">
                                                <span className="bg-cyan-950/40 border border-cyan-700/50 text-cyan-300 px-2.5 py-1 rounded text-xs font-semibold">
                                                    {company.companyType || "Enterprise"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 text-xs">
                                                {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "Recent"}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleCompanyStatus(company._id, "Rejected")}
                                                    disabled={actionLoadingId === company._id}
                                                    className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 border border-red-800/40 hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleCompanyStatus(company._id, "Approved")}
                                                    disabled={actionLoadingId === company._id}
                                                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    {actionLoadingId === company._id ? "Processing..." : "Approve Organization"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    pendingUsers.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <p className="text-base font-semibold text-slate-300">No pending user registrations.</p>
                            <p className="text-xs text-slate-500 mt-1">All user accounts have been resolved.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-700/30 border-b border-slate-700/50 text-slate-400 uppercase text-xs tracking-wider">
                                        <th className="p-4">Username</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Assigned Company</th>
                                        <th className="p-4">Requested Role</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/40">
                                    {pendingUsers.map((user) => {
                                        const compName =
                                            typeof user.company === "object" && user.company !== null
                                                ? user.company.companyName
                                                : user.company || "SFAT Platform";

                                        return (
                                            <tr key={user._id} className="hover:bg-slate-700/20 transition-colors">
                                                <td className="p-4 text-white font-semibold text-sm">{user.username}</td>
                                                <td className="p-4 text-slate-300 text-sm font-mono">{user.email}</td>
                                                <td className="p-4">
                                                    <span className="bg-slate-900/60 border border-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs font-mono">
                                                        {compName}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-900/30 text-indigo-400 border border-indigo-700/50">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleUserStatus(user._id, "Rejected")}
                                                        disabled={actionLoadingId === user._id}
                                                        className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 border border-red-800/40 hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleUserStatus(user._id, "Approved")}
                                                        disabled={actionLoadingId === user._id}
                                                        className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
                                                    >
                                                        {actionLoadingId === user._id ? "Processing..." : "Approve Access"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}