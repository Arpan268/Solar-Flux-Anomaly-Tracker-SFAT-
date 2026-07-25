import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";

interface Operator {
    _id: string;
    username: string;
    email: string;
    createdAt: string;
}

export default function ViewOperators() {
    const { auth } = useAuth();
    const [operators, setOperators] = useState<Operator[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        async function fetchOperators() {
            if (!auth?.accessToken) return;
            setLoading(true);
            try {
                const res = await axios.get(`/api/user/supervisor/view-operators?page=${page}&limit=5`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });

                setOperators(res.data.users);
                setTotalPages(res.data.totalPages);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch operators", err);
                setError("Failed to load the operator roster.");
            } finally {
                setLoading(false);
            }
        }

        fetchOperators();
    }, [auth, page]);

    async function handleDelete(operatorId: string) {
        const confirmDelete = window.confirm("CRITICAL ACTION: Are you sure you want to remove this operator? This cannot be undone.");
        if (!confirmDelete) return;

        try {
            await axios.delete(`/api/user/supervisor/${operatorId}/delete-operator`, {
                headers: { Authorization: `Bearer ${auth?.accessToken}` },
                withCredentials: true,
            });

            setOperators((prev) => prev.filter((op) => op._id !== operatorId));
            setActionMessage({ type: "success", text: "Operator removed from the roster successfully." });

            if (operators.length === 1 && page > 1) {
                setPage((prev) => prev - 1);
            }

        } catch (err) {
            console.error("Failed to delete operator", err);
            setActionMessage({ type: "error", text: "Failed to remove operator. Please check server logs." });
        } finally {
            setTimeout(() => setActionMessage(null), 3000);
        }
    }

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Active Roster</h2>
                <p className="text-slate-400 mt-2">Manage your operator team and revoke access if necessary.</p>
            </div>

            {actionMessage && (
                <div className={`p-4 rounded-lg border mb-6 shadow-lg ${actionMessage.type === 'success'
                        ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400'
                        : 'bg-red-900/30 border-red-500/50 text-red-400'
                    }`}>
                    {actionMessage.text}
                </div>
            )}

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 shadow-lg">
                    {error}
                </div>
            )}

            <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/80 border-b border-gray-700 text-slate-300 uppercase text-sm tracking-wider">
                                <th className="p-4 font-semibold">Operator ID</th>
                                <th className="p-4 font-semibold">Username</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Joined Date</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading && operators.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                                        Loading personnel data...
                                    </td>
                                </tr>
                            ) : operators.length > 0 ? (
                                operators.map((op) => (
                                    <tr key={op._id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-slate-400 font-mono text-sm">
                                            {op._id}
                                        </td>
                                        <td className="p-4 text-blue-400 font-bold">
                                            {op.username}
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            {op.email}
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm">
                                            {new Date(op.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(op._id)}
                                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-800/50 transition-colors shadow-sm cursor-pointer"
                                            >
                                                Revoke Access
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                                        No active operators found in the database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-between items-center">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-slate-400 text-sm">
                            Page <strong className="text-white">{page}</strong> of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}