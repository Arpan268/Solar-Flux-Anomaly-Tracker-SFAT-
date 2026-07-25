import { useEffect, useState } from "react";
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
}

export default function SupervisorAnomalies() {
    const { auth } = useAuth();
    const [unacknowledged, setUnacknowledged] = useState<Anomaly[]>([]);
    const [acknowledged, setAcknowledged] = useState<Anomaly[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!auth?.accessToken) return;

        const eventSource = new EventSource(`/api/user/supervisor/unacknowledged-anomalies?token=${auth.accessToken}`);

        eventSource.onmessage = (event) => {
            try {
                const parsedData = JSON.parse(event.data);
                setUnacknowledged(parsedData.anomalies);
                setError(null);
            } catch (err) {
                setError("Failed to parse real-time anomaly stream.");
            }
        };

        eventSource.onerror = () => {
            setError("Lost connection to the live anomaly queue. Attempting to reconnect...");
        };

        return () => {
            eventSource.close();
        };
    }, [auth]);

    useEffect(() => {
        async function fetchAcknowledged() {
            if (!auth?.accessToken || !showHistory) return;

            try {
                const res = await axios.get(`/api/user/supervisor/acknowledged-anomalies?page=${page}&limit=6`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setAcknowledged(res.data.anomalies);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                setError("Failed to fetch historical anomalies.");
            }
        }

        fetchAcknowledged();
    }, [auth, showHistory, page]);

    async function handleAcknowledge(id: string) {
        if (!auth?.accessToken) return;

        const anomalyToMove = unacknowledged.find((item) => item._id === id);

        try {
            await axios.put(`/api/user/supervisor/${id}/acknowledge-anomaly`, {}, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            setUnacknowledged((prev) => prev.filter((item) => item._id !== id));

            if (anomalyToMove) {
                const updatedAnomaly = { ...anomalyToMove, isAcknowledged: true };
                setAcknowledged((prev) => [updatedAnomaly, ...prev]);
            }

        } catch (err) {
            setError("Failed to acknowledge anomaly.");
        }
    }

    async function handleDelete(id: string) {
        if (!auth?.accessToken) return;

        if (!window.confirm("Are you sure you want to permanently delete this anomaly record?")) return;

        try {
            await axios.delete(`/api/user/supervisor/${id}/delete-anomaly`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            setUnacknowledged(prev => prev.filter(anomaly => anomaly._id !== id));
            setAcknowledged(prev => prev.filter(anomaly => anomaly._id !== id));
        } catch (err) {
            setError("Failed to delete anomaly.");
        }
    }

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Supervisor Operations</h2>
                <p className="text-slate-400 mt-2">Manage incoming anomaly reports and review historical logs.</p>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 shadow-lg">
                    {error}
                </div>
            )}

            <div className="mb-12">
                <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Action Required: Unacknowledged Anomalies
                </h3>

                <div className="bg-gray-900 rounded-xl shadow-2xl border border-red-900/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800/80 border-b border-gray-700 text-slate-300 uppercase text-sm tracking-wider">
                                    <th className="p-4 font-semibold">Time Tag (UTC)</th>
                                    <th className="p-4 font-semibold">Classification</th>
                                    <th className="p-4 font-semibold">Peak Flux</th>
                                    <th className="p-4 font-semibold">Logged By</th>
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
                                        <td className="p-4 text-blue-400 font-mono">
                                            {anomaly.flux.toExponential(4)}
                                        </td>
                                        <td className="p-4 text-slate-400">{anomaly.loggedBy}</td>
                                        <td className="p-4 text-right space-x-3">
                                            <button
                                                onClick={() => handleDelete(anomaly._id)}
                                                className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/30 px-4 py-2 rounded text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => handleAcknowledge(anomaly._id)}
                                                className="bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white border border-emerald-600/30 px-4 py-2 rounded text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                                            >
                                                Acknowledge
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {unacknowledged.length === 0 && (
                        <div className="p-8 text-center text-slate-500 font-medium">
                            Queue is clear. No unacknowledged anomalies at this time.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center mb-10">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="bg-gray-800 text-slate-300 hover:text-white px-8 py-3 cursor-pointer rounded-lg font-semibold border border-gray-700 hover:border-gray-500 transition-all shadow-lg hover:shadow-gray-700/20"
                >
                    {showHistory ? "Hide Historical Anomalies" : "View Previous Anomalies"}
                </button>
            </div>

            {showHistory && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-bold text-slate-300 mb-4">Historical Records</h3>

                    <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-800 border-b border-gray-700 text-slate-400 uppercase text-xs tracking-wider">
                                        <th className="p-4 font-semibold">Time Tag (UTC)</th>
                                        <th className="p-4 font-semibold">Classification</th>
                                        <th className="p-4 font-semibold">Peak Flux</th>
                                        <th className="p-4 font-semibold">Logged By</th>
                                        <th className="p-4 font-semibold">Acknowledged On</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {acknowledged.map((anomaly) => (
                                        <tr key={anomaly._id} className="hover:bg-gray-800/30 transition-colors opacity-80 group">
                                            <td className="p-4 text-slate-300">
                                                {new Date(anomaly.time_tag).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-slate-400 border border-gray-700">
                                                    {anomaly.classification}
                                                </span>
                                            </td>
                                            <td className="p-4 text-blue-400/80 font-mono">
                                                {anomaly.flux.toExponential(4)}
                                            </td>
                                            <td className="p-4 text-slate-500">{anomaly.loggedBy}</td>
                                            <td className="p-4 text-slate-500">
                                                {new Date(anomaly.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(anomaly._id)}
                                                    className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/30 px-3 py-1.5 rounded text-xs font-semibold shadow-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {acknowledged.length === 0 && (
                            <div className="p-8 text-center text-slate-600">
                                No historical records found.
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