import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";

interface Shift {
    _id: string;
    name: string;
    startTime: string;
    endTime: string;
}

interface Operator {
    _id: string;
    username: string;
    email: string;
    createdAt: string;
    shift?: Shift | null;
}

export default function ViewOperators() {
    const { auth } = useAuth();
    const [operators, setOperators] = useState<Operator[]>([]);
    const [allShifts, setAllShifts] = useState<Shift[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [isEditingShifts, setIsEditingShifts] = useState(false);
    const [draftShifts, setDraftShifts] = useState<Record<string, string>>({});

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
                setError("Failed to load the operator roster.");
            } finally {
                setLoading(false);
            }
        }

        async function fetchShifts() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get(`/api/user/supervisor/shifts`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setAllShifts(res.data);
            } catch (err) {
            }
        }

        fetchOperators();
        fetchShifts();
    }, [auth, page]);

    async function handleDelete(operatorId: string) {
        if (!auth?.accessToken) return;
        const confirmDelete = window.confirm("CRITICAL ACTION: Are you sure you want to remove this operator? This cannot be undone.");
        if (!confirmDelete) return;

        try {
            await axios.delete(`/api/user/supervisor/${operatorId}/delete-operator`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            setOperators((prev) => prev.filter((op) => op._id !== operatorId));
            setActionMessage({ type: "success", text: "Operator removed from the roster successfully." });

            if (operators.length === 1 && page > 1) {
                setPage((prev) => prev - 1);
            }
        } catch (err) {
            setActionMessage({ type: "error", text: "Failed to remove operator. Please check server logs." });
        } finally {
            setTimeout(() => setActionMessage(null), 5000);
        }
    }

    function handleEditToggle() {
        if (isEditingShifts) {
            setIsEditingShifts(false);
            setDraftShifts({});
        } else {
            const initialDrafts: Record<string, string> = {};
            operators.forEach(op => {
                initialDrafts[op._id] = op.shift?._id || "";
            });
            setDraftShifts(initialDrafts);
            setIsEditingShifts(true);
        }
    }

    function handleDraftChange(operatorId: string, shiftId: string) {
        setDraftShifts(prev => ({ ...prev, [operatorId]: shiftId }));
    }

    async function handleBulkSave() {
        if (!auth?.accessToken) return;

        const assignments = Object.keys(draftShifts).map(operatorId => ({
            operatorId,
            shiftId: draftShifts[operatorId] === "" ? null : draftShifts[operatorId]
        }));

        try {
            await axios.put(`/api/user/supervisor/bulk-reassign-shifts`,
                { assignments },
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }
            );

            setOperators((prev) => prev.map((op) => ({
                ...op,
                shift: draftShifts[op._id] ? allShifts.find(s => s._id === draftShifts[op._id]) || null : null
            })));

            setActionMessage({ type: "success", text: "All shifts updated successfully." });
            setIsEditingShifts(false);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Failed to update shifts.";
            setActionMessage({ type: "error", text: errorMsg });
        } finally {
            setTimeout(() => setActionMessage(null), 5000);
        }
    }

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Active Roster</h2>
                    <p className="text-slate-400 mt-2">Manage your operator team and revoke access if necessary.</p>
                </div>
                <div>
                    {isEditingShifts ? (
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleBulkSave}
                                className="bg-emerald-600/20 text-emerald-500 cursor-pointer hover:bg-emerald-600 hover:text-white border border-emerald-600/50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={handleEditToggle}
                                className="bg-gray-600/20 text-gray-400 cursor-pointer hover:bg-gray-600 hover:text-white border border-gray-600/50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleEditToggle}
                            className="px-4 py-2 text-sm cursor-pointer font-semibold rounded-lg bg-blue-900/20 text-blue-500 hover:bg-blue-600 hover:text-white border border-blue-600/30 transition-colors"
                        >
                            Change Shifts
                        </button>
                    )}
                </div>
            </div>

            {actionMessage && (
                <div className={`p-4 rounded-lg mb-6 shadow-lg ${actionMessage.type === 'success' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-red-900/30 border-red-500/50 text-red-400'}`}>
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
                                <th className="p-4 font-semibold">Shift Slot</th>
                                <th className="p-4 font-semibold">Joined Date</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading && operators.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
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
                                        <td className="p-4">
                                            {isEditingShifts ? (
                                                <select
                                                    className="bg-gray-800 text-sm text-slate-200 border border-gray-600 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                                                    value={draftShifts[op._id] || ""}
                                                    onChange={(e) => handleDraftChange(op._id, e.target.value)}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {allShifts.map((s) => (
                                                        <option key={s._id} value={s._id}>
                                                            {s.name} ({s.startTime} - {s.endTime})
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : op.shift ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-900/30 text-indigo-400 border border-indigo-700/50">
                                                    {op.shift.name} ({op.shift.startTime} - {op.shift.endTime})
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 text-sm italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm">
                                            {new Date(op.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(op._id)}
                                                disabled={isEditingShifts}
                                                className="px-4 py-2 text-sm font-semibold cursor-pointer rounded-lg bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Revoke Access
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
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
                            disabled={page === 1 || isEditingShifts}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Previous
                        </button>
                        <span className="text-slate-400 text-sm">
                            Page <strong className="text-white">{page}</strong> of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || isEditingShifts}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}