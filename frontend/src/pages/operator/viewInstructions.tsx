import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import axios from "axios";

interface Instruction {
    _id: string;
    message: string;
    isRead: boolean;
    supervisorId: string;
    targetOperatorId: string;
    createdAt: string;
}

export default function OperatorInstructions() {
    const { auth } = useAuth();
    const [unread, setUnread] = useState<Instruction[]>([]);
    const [read, setRead] = useState<Instruction[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUnread() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get("/api/user/operator/unread-instructions", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setUnread(res.data.instructions);
                setError(null);
            } catch (err) {
                setError("Failed to fetch pending instructions.");
            }
        }
        fetchUnread();
    }, [auth]);

    useEffect(() => {
        async function fetchRead() {
            if (!auth?.accessToken || !showHistory) return;
            try {
                const res = await axios.get(`/api/user/operator/read-instructions?page=${page}&limit=6`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setRead(res.data.instructions);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                setError("Failed to fetch historical instructions.");
            }
        }
        fetchRead();
    }, [auth, showHistory, page]);

    async function handleMarkAsRead(id: string) {
        if (!auth?.accessToken) return;
        try {
            await axios.put(`/api/user/operator/${id}/read-instruction`, {}, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            setUnread((prev) => prev.filter((inst) => inst._id !== id));

            if (showHistory) {
                const res = await axios.get(`/api/user/operator/read-instructions?page=${page}&limit=6`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setRead(res.data.instructions);
                setTotalPages(res.data.totalPages);
            }
        } catch (err) {
            setError("Failed to mark instruction as read.");
        }
    }

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Supervisor Instructions</h2>
                <p className="text-slate-400 mt-2">Review and acknowledge direct directives from your supervisor.</p>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 shadow-lg">
                    {error}
                </div>
            )}

            <div className="mb-12">
                <h3 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                    Action Required: Unread Instructions
                </h3>

                <div className="grid grid-cols-1 gap-4">
                    {unread.map((inst) => (
                        <div key={inst._id} className="bg-gray-900 rounded-xl shadow-2xl border border-yellow-900/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-900/30 text-yellow-500 border border-yellow-700/50">
                                        New Directive
                                    </span>
                                    <span className="text-sm text-slate-500 font-medium">
                                        {new Date(inst.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-slate-200 text-lg leading-relaxed">{inst.message}</p>
                                <p className="text-sm text-slate-500">From Supervisor ID: {inst.supervisorId}</p>
                            </div>

                            <button
                                onClick={() => handleMarkAsRead(inst._id)}
                                className="w-full md:w-auto whitespace-nowrap bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white border border-emerald-600/30 px-6 py-3 rounded-lg font-bold shadow-sm transition-colors"
                            >
                                Mark as Read
                            </button>
                        </div>
                    ))}

                    {unread.length === 0 && (
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-slate-500 font-medium">
                            No pending instructions at this time.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center mb-10">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="bg-gray-800 text-slate-300 hover:text-white px-8 py-3 rounded-lg font-semibold border border-gray-700 hover:border-gray-500 transition-all shadow-lg hover:shadow-gray-700/20 cursor-pointer transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {showHistory ? "Hide Instruction History" : "View Previous Instructions"}
                </button>
            </div>

            {showHistory && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-bold text-slate-300 mb-4">Read Instructions</h3>

                    <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                        <div className="grid grid-cols-1 divide-y divide-gray-800">
                            {read.map((inst) => (
                                <div key={inst._id} className="p-6 hover:bg-gray-800/30 transition-colors opacity-80">
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-slate-400 border border-gray-700">
                                                Acknowledged
                                            </span>
                                            <span className="text-sm text-slate-500 font-medium">
                                                {new Date(inst.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-300">{inst.message}</p>
                                        <p className="text-sm text-slate-600">From Supervisor ID: {inst.supervisorId}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {read.length === 0 && (
                            <div className="p-8 text-center text-slate-600">
                                No historical instructions found.
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