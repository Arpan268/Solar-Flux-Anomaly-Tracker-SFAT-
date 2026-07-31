import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";

interface Anomaly {
    _id: string;
    time_tag: string;
    flux: number;
    electron_contaminaton: boolean;
    classification: string;
    isAcknowledged: boolean;
    loggedBy: string;
    notes?: string;
    createdAt: string;
    acknowledgedBy?: string | null;
}

export default function OperatorViewAnomalies() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAnomalies() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get(`/api/user/operator/view-anomalies?page=${page}&limit=6`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setAnomalies(res.data.anomalies);
                setTotalPages(res.data.totalPages);
                setError(null);
            } catch (err) {
                setError("Failed to fetch anomaly logs.");
            }
        }
        fetchAnomalies();
    }, [auth, page]);

    function handleUpdateClick(anomaly: Anomaly) {
        navigate(`/operator/update-anomaly/${anomaly._id}`, { state: { anomaly } });
    }

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Anomaly Logs</h2>
                <p className="text-slate-400 mt-2">View all your logged telemetry anomalies and update pending reports.</p>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 shadow-lg">
                    {error}
                </div>
            )}

            <div className="mb-12">
                <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800/80 border-b border-gray-700 text-slate-300 uppercase text-sm tracking-wider">
                                    <th className="p-4 font-semibold">Time Tag (UTC)</th>
                                    <th className="p-4 font-semibold">Classification</th>
                                    <th className="p-4 font-semibold">Electron Contamination</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Notes</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {anomalies.map((anomaly) => (
                                    <tr key={anomaly._id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-slate-200 font-medium">
                                            {new Date(anomaly.time_tag).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-slate-300 border border-gray-700">
                                                {anomaly.classification}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {anomaly.electron_contaminaton ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-900/20 text-red-500 border border-red-800/30">
                                                    Contaminated
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-900/20 text-green-500 border border-green-800/30">
                                                    Clean
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {anomaly.isAcknowledged ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/20 text-emerald-500 border border-emerald-800/30">
                                                    Acknowledged
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-900/30 text-yellow-500 border border-yellow-700/50">
                                                    Unacknowledged
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-400 max-w-xs">
                                            <span className="block truncate" title={anomaly.notes}>
                                                {anomaly.notes || "-"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {!anomaly.isAcknowledged ? (
                                                <button
                                                    onClick={() => handleUpdateClick(anomaly)}
                                                    className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/30 px-4 py-2 rounded text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                                                >
                                                    Update
                                                </button>
                                            ) : (
                                                <span className="text-slate-600 text-sm italic mr-4">Locked</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {anomalies.length === 0 && (
                        <div className="p-8 text-center text-slate-500 font-medium">
                            No anomalies logged yet.
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="bg-gray-800/50 border-t border-gray-700 p-4 flex justify-center gap-2">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPage(index + 1)}
                                    className={`w-10 h-10 rounded cursor-pointer font-semibold transition-colors ${page === index + 1
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
        </div>
    );
}