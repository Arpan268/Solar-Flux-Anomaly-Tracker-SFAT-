import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";

interface Anomaly {
    _id: string;
    time_tag: string;
    flux: number;
    classification: string;
    loggedBy: string;
    notes?: string;
    createdAt: string;
}

export default function AnalystViewAnomalies() {
    const { auth } = useAuth();
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAnomalies() {
            if (!auth?.accessToken) return;
            setLoading(true);
            try {
                const res = await axios.get(`/api/user/analyst/view-anomalies?page=${page}&limit=10`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });

                setAnomalies(res.data.anomalies);
                setTotalPages(res.data.totalPages);
                setError(null);
            } catch (err) {
                setError("Failed to load verified anomaly data.");
            } finally {
                setLoading(false);
            }
        }

        fetchAnomalies();
    }, [auth, page]);

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Verified Anomalies</h2>
                <p className="text-slate-400 mt-2">Historical database of all supervisor-acknowledged solar flux events.</p>
            </div>

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
                                <th className="p-4 font-semibold">Event Time (UTC)</th>
                                <th className="p-4 font-semibold">Flux Value</th>
                                <th className="p-4 font-semibold">Classification</th>
                                <th className="p-4 font-semibold">Logged By</th>
                                <th className="p-4 font-semibold">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                                        Loading telemetry records...
                                    </td>
                                </tr>
                            ) : anomalies.length > 0 ? (
                                anomalies.map((anomaly) => (
                                    <tr key={anomaly._id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-slate-300 font-mono text-sm">
                                            {new Date(anomaly.time_tag).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-emerald-400 font-bold font-mono">
                                            {anomaly.flux}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-900/20 text-purple-400 border border-purple-800/50">
                                                {anomaly.classification}
                                            </span>
                                        </td>
                                        <td className="p-4 text-blue-400 font-medium">
                                            {anomaly.loggedBy}
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm max-w-xs truncate">
                                            {anomaly.notes || "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                                        No verified anomalies found in the database.
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
                            className="px-4 py-2 bg-gray-700 cursor-pointer hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-slate-400 text-sm">
                            Page <strong className="text-white">{page}</strong> of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-700 cursor-pointer hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}