import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";

interface Anomaly {
    _id: string;
    time_tag: string;
    flux: number;
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
    const [unacknowledged, setUnacknowledged] = useState<Anomaly[]>([]);
    const [acknowledged, setAcknowledged] = useState<Anomaly[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUnacknowledged() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get("/api/user/operator/view-anomalies?isAcknowledged=false", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setUnacknowledged(res.data.anomalies || res.data);
                setError(null);
            } catch (err) {
                setError("Failed to fetch unacknowledged anomalies.");
            }
        }
        fetchUnacknowledged();
    }, [auth]);

    useEffect(() => {
        async function fetchAcknowledged() {
            if (!auth?.accessToken || !showHistory) return;
            try {
                const res = await axios.get(`/api/user/operator/view-anomalies?isAcknowledged=true&page=${page}&limit=6`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setAcknowledged(res.data.anomalies);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                setError("Failed to fetch acknowledged anomalies.");
            }
        }
        fetchAcknowledged();
    }, [auth, showHistory, page]);

    function handleUpdateClick(anomaly: Anomaly) {
        navigate(`/operator/update-anomaly/${anomaly._id}`, { state: { anomaly } });
    }

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Anomaly Logs</h2>
                <p className="text-slate-400 mt-2">Track the status of your logged anomalies and update pending reports.</p>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 shadow-lg">
                    {error}
                </div>
            )}

            <div className="mb-12">
                <h3 className="text-xl font-bold text-yellow-500 mb-4">Pending Supervisor Review</h3>

                <div className="bg-gray-900 rounded-xl shadow-2xl border border-yellow-900/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800/80 border-b border-gray-700 text-slate-300 uppercase text-sm tracking-wider">
                                    <th className="p-4 font-semibold">Time Tag (UTC)</th>
                                    <th className="p-4 font-semibold">Classification</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Notes</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {unacknowledged.map((anomaly) => (
                                    <tr key={anomaly._id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-slate-200 font-medium">
                                            {new Date(anomaly.time_tag).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-900/30 text-red-400 border border-red-800/50">
                                                {anomaly.classification}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-900/30 text-yellow-500 border border-yellow-700/50">
                                                Unacknowledged
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 max-w-xs truncate">
                                            {anomaly.notes || "No notes provided"}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleUpdateClick(anomaly)}
                                                className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/30 px-4 py-2 rounded text-sm font-semibold shadow-sm transition-colors"
                                            >
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {unacknowledged.length === 0 && (
                        <div className="p-8 text-center text-slate-500 font-medium">
                            No pending anomalies.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center mb-10">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="bg-gray-800 text-slate-300 hover:text-white px-8 py-3 rounded-lg font-semibold border border-gray-700 hover:border-gray-500 transition-all shadow-lg hover:shadow-gray-700/20 cursor-pointer transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {showHistory ? "Hide Acknowledged Anomalies" : "View Acknowledged Anomalies"}
                </button>
            </div>

            {showHistory && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-bold text-slate-300 mb-4">Acknowledged Records</h3>

                    <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-800 border-b border-gray-700 text-slate-400 uppercase text-xs tracking-wider">
                                        <th className="p-4 font-semibold">Time Tag (UTC)</th>
                                        <th className="p-4 font-semibold">Classification</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Notes</th>
                                        <th className="p-4 font-semibold">Acknowledged By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {acknowledged.map((anomaly) => (
                                        <tr key={anomaly._id} className="hover:bg-gray-800/30 transition-colors opacity-80">
                                            <td className="p-4 text-slate-300">
                                                {new Date(anomaly.time_tag).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-slate-400 border border-gray-700">
                                                    {anomaly.classification}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/20 text-emerald-500 border border-emerald-800/30">
                                                    Acknowledged
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500 max-w-xs truncate">
                                                {anomaly.notes || "None"}
                                            </td>
                                            <td className="p-4 text-slate-500">
                                                {anomaly.acknowledgedBy || "Supervisor"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {acknowledged.length === 0 && (
                            <div className="p-8 text-center text-slate-600">
                                No acknowledged records found.
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="bg-gray-800/50 border-t border-gray-700 p-4 flex justify-center gap-2">
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
            )}
        </div>
    );
}