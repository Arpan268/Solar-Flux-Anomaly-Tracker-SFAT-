import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";

interface AdminMetrics {
    totalCompanies: number;
    pendingCompanies: number;
    approvedCompanies: number;
    totalCompanyAdmins: number;
}

interface User {
    _id: string;
    userId?: string;
    username: string;
    email: string;
    role: string;
    company?: {
        companyName: string;
    } | string;
}

interface Company {
    _id: string;
    companyName: string;
    email: string;
    companyType: string;
    status: string;
}

export default function AdminDashboard() {
    const { auth } = useAuth();

    const [metrics, setMetrics] = useState<AdminMetrics>({
        totalCompanies: 0,
        pendingCompanies: 0,
        approvedCompanies: 0,
        totalCompanyAdmins: 0,
    });

    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [companies, setCompanies] = useState<Company[]>([]);
    const [companyPage, setCompanyPage] = useState<number>(1);
    const [totalCompanyPages, setTotalCompanyPages] = useState<number>(1);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboardData() {
            if (!auth?.accessToken) return;
            setLoading(true);
            setError(null);

            try {
                const [metricsRes, usersRes, companiesRes] = await Promise.all([
                    axios.get("/api/user/admin/metrics", {
                        headers: { Authorization: `Bearer ${auth.accessToken}` },
                        withCredentials: true,
                    }),
                    axios.get(`/api/user/admin/get-users?page=${page}&limit=10`, {
                        headers: { Authorization: `Bearer ${auth.accessToken}` },
                        withCredentials: true,
                    }),
                    axios.get(`/api/user/admin/get-companies?page=${companyPage}&limit=10`, {
                        headers: { Authorization: `Bearer ${auth.accessToken}` },
                        withCredentials: true,
                    })
                ]);

                setMetrics(metricsRes.data);

                setUsers(usersRes.data.users || []);
                setTotalPages(usersRes.data.totalPages || 1);

                setCompanies(companiesRes.data.companies || []);
                setTotalCompanyPages(companiesRes.data.totalPages || 1);

            } catch (err: any) {
                console.error("Failed to load admin dashboard data:", err);
                setError("Failed to load platform metrics, user records, or companies.");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [page, companyPage, auth]);

    async function handleDeleteUser(id: string) {
        if (!auth?.accessToken) return;
        if (!window.confirm("Are you sure you want to revoke access for this user?")) return;

        try {
            await axios.delete(`/api/user/admin/${id}/delete`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            const usersRes = await axios.get(`/api/user/admin/get-users?page=${page}&limit=10`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            if (usersRes.data.users.length === 0 && page > 1) {
                setPage((p) => p - 1);
            } else {
                setUsers(usersRes.data.users || []);
                setTotalPages(usersRes.data.totalPages || 1);
            }
        } catch (err: any) {
            console.error("Failed to delete user:", err);
            setError("Failed to revoke access.");
        }
    }

    async function handleDeleteCompany(id: string) {
        if (!auth?.accessToken) return;
        if (!window.confirm("Are you sure you want to completely delete this company?")) return;

        try {
            await axios.delete(`/api/user/admin/company/${id}/delete`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            const compRes = await axios.get(`/api/user/admin/get-companies?page=${companyPage}&limit=10`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            if (compRes.data.companies.length === 0 && companyPage > 1) {
                setCompanyPage((p) => p - 1);
            } else {
                setCompanies(compRes.data.companies || []);
                setTotalCompanyPages(compRes.data.totalPages || 1);
            }
        } catch (err: any) {
            console.error("Failed to delete company:", err);
            setError("Failed to delete company.");
        }
    }

    return (
        <div className="max-w-7xl mx-auto mt-10 p-6 text-white min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-700/60 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        SFAT Platform Administration
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Global tenant overview, company registration triage, and system access control.
                    </p>
                </div>

                <Link
                    to="/admin/manage-users"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg transition-colors"
                >
                    <span>Manage Registrations & Companies</span>
                    {metrics.pendingCompanies > 0 && (
                        <span className="bg-amber-400 text-slate-950 text-xs px-2 py-0.5 rounded-full font-extrabold">
                            {metrics.pendingCompanies}
                        </span>
                    )}
                </Link>
            </div>

            {error && (
                <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm">
                    {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Registered</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-extrabold text-white font-mono">{metrics.totalCompanies}</span>
                        <span className="text-xs text-slate-400">Organizations</span>
                    </div>
                </div>

                <div className="bg-slate-800/40 border border-amber-500/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold text-amber-400 tracking-wider">Pending Approval</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-extrabold text-amber-300 font-mono">{metrics.pendingCompanies}</span>
                        <span className="text-xs text-amber-400/80">Action required</span>
                    </div>
                </div>

                <div className="bg-slate-800/40 border border-emerald-500/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Approved Tenants</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-extrabold text-emerald-300 font-mono">{metrics.approvedCompanies}</span>
                        <span className="text-xs text-emerald-400/80">Active</span>
                    </div>
                </div>

                <div className="bg-slate-800/40 border border-indigo-500/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Company Admins</p>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-3xl font-extrabold text-indigo-300 font-mono">{metrics.totalCompanyAdmins}</span>
                        <span className="text-xs text-indigo-400/80">Verified</span>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm mb-8">
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-700/20 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-200">Active Company Administrators</h2>
                    <span className="text-xs text-slate-400">Platform Tenants</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-700/30 border-b border-slate-700/50 text-slate-400 uppercase text-xs tracking-wider">
                                <th className="p-4">Username</th>
                                <th className="p-4">Corporate Email</th>
                                <th className="p-4">Organization</th>
                                <th className="p-4">Role</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/40">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                                        Loading administrator records...
                                    </td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map((user) => {
                                    const companyDisplay =
                                        typeof user.company === "object" && user.company !== null
                                            ? user.company.companyName
                                            : user.company || "SFAT Core";

                                    return (
                                        <tr key={user._id} className="hover:bg-slate-700/20 transition-colors">
                                            <td className="p-4 text-slate-200 font-semibold text-sm">
                                                {user.username}
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm font-mono">{user.email}</td>
                                            <td className="p-4">
                                                <span className="bg-slate-900/60 border border-slate-700 px-2.5 py-1 rounded text-xs font-medium text-cyan-300">
                                                    {companyDisplay}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-900/30 text-indigo-400 border border-indigo-700/50">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {user.role !== "Admin" && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/50 border border-red-800/30 px-3 py-1.5 rounded transition-colors"
                                                    >
                                                        Revoke Access
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                                        No active company administrators found.
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
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
                        >
                            Previous
                        </button>
                        <span className="text-slate-400 text-xs">
                            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Companies Table */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm mb-8">
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-700/20 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-200">Registered Companies</h2>
                    <span className="text-xs text-slate-400">All Approved Organizations</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-700/30 border-b border-slate-700/50 text-slate-400 uppercase text-xs tracking-wider">
                                <th className="p-4">Organization</th>
                                <th className="p-4">Contact Email</th>
                                <th className="p-4">Sector</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/40">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                                        Loading companies...
                                    </td>
                                </tr>
                            ) : companies.length > 0 ? (
                                companies.map((company) => (
                                    <tr key={company._id} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="p-4 text-slate-200 font-semibold text-sm">
                                            {company.companyName}
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm font-mono">{company.email}</td>
                                        <td className="p-4">
                                            <span className="bg-slate-900/60 border border-slate-700 px-2.5 py-1 rounded text-xs font-medium text-cyan-300">
                                                {company.companyType}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteCompany(company._id)}
                                                className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/50 border border-red-800/30 px-3 py-1.5 rounded transition-colors"
                                            >
                                                Delete Company
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                                        No approved companies found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalCompanyPages > 1 && (
                    <div className="p-4 bg-slate-800/60 border-t border-slate-700/50 flex justify-between items-center">
                        <button
                            onClick={() => setCompanyPage((p) => Math.max(1, p - 1))}
                            disabled={companyPage === 1}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
                        >
                            Previous
                        </button>
                        <span className="text-slate-400 text-xs">
                            Page <strong className="text-white">{companyPage}</strong> of <strong className="text-white">{totalCompanyPages}</strong>
                        </span>
                        <button
                            onClick={() => setCompanyPage((p) => Math.min(totalCompanyPages, p + 1))}
                            disabled={companyPage === totalCompanyPages}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}