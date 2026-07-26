import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";

interface Instruction {
    _id: string;
    targetOperatorId: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

interface ViewInstructionsProps {
    refreshTrigger: number;
}

export default function ViewInstructions({ refreshTrigger }: ViewInstructionsProps) {
    const { auth } = useAuth();
    const [instructions, setInstructions] = useState<Instruction[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInstructions() {
            if (!auth?.accessToken) return;
            setLoading(true);
            try {
                const res = await axios.get(
                    `/api/user/supervisor/view-instructions?page=${page}&limit=6`,
                    {
                        headers: { Authorization: `Bearer ${auth.accessToken}` },
                        withCredentials: true,
                    }
                );
                setInstructions(res.data.instructions);
                setTotalPages(res.data.totalPages);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch instructions", err);
                setError("Failed to load transmission history.");
            } finally {
                setLoading(false);
            }
        }
        fetchInstructions();
    }, [auth, page, refreshTrigger]);

    if (loading && instructions.length === 0) {
        return <div className="text-slate-400 p-4 text-center">Loading history...</div>;
    }

    if (error) {
        return (
            <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-800/80 border-b border-gray-700 text-slate-300 uppercase text-sm tracking-wider">
                            <th className="p-4 font-semibold">Date Sent (UTC)</th>
                            <th className="p-4 font-semibold">Target Operator</th>
                            <th className="p-4 font-semibold w-1/2">Message</th>
                            <th className="p-4 font-semibold text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {instructions.length > 0 ? (
                            instructions.map((inst) => (
                                <tr key={inst._id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 text-slate-300">
                                        {new Date(inst.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-blue-400 font-medium">
                                        {inst.targetOperatorId === "All" ? "BROADCAST (ALL)" : inst.targetOperatorId}
                                    </td>
                                    <td className="p-4 text-slate-400 wrap-break-word">
                                        {inst.message}
                                    </td>
                                    <td className="p-4 text-right">
                                        {inst.isRead ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/20 text-emerald-500 border border-emerald-800/50">
                                                Read
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-900/20 text-yellow-500 border border-yellow-800/50">
                                                Unread
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                                    No instructions sent yet.
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
                        className="px-4 py-2 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-slate-400 text-sm">
                        Page <strong className="text-white">{page}</strong> of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}