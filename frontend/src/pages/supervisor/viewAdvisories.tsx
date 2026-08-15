import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Advisory {
    _id: string;
    advisoryType?: 'Prediction' | 'Anomaly';
    classification?: string;
    cclass?: number;
    mclass?: number;
    xclass?: number;
    message: string;
    status: 'Pending' | 'Acknowledged';
    acknowledgedBySupervisorId?: string;
    createdAt: string;
}

export default function SupervisorViewAdvisories() {
    const navigate = useNavigate();

    const [pendingAdvisories, setPendingAdvisories] = useState<Advisory[]>([]);
    const [acknowledgedAdvisories, setAcknowledgedAdvisories] = useState<Advisory[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [historyLoading, setHistoryLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [showAcknowledged, setShowAcknowledged] = useState<boolean>(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [pendingRes, ackRes] = await Promise.all([
                axios.get('/api/user/supervisor/pending-advisories', { withCredentials: true }),
                axios.get('/api/user/supervisor/acknowledged-advisories?page=1&limit=5', { withCredentials: true })
            ]);

            setPendingAdvisories(pendingRes.data.advisories || []);
            setAcknowledgedAdvisories(ackRes.data.advisories || []);
            setTotalPages(ackRes.data.totalPages || 1);
            setCurrentPage(ackRes.data.currentPage || 1);
        } catch (err: any) {
            console.error('Error fetching supervisor advisories:', err);
            setError('Failed to load the advisory queue. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoricalPage = async (page: number) => {
        setHistoryLoading(true);
        try {
            const ackRes = await axios.get(`/api/user/supervisor/acknowledged-advisories?page=${page}&limit=5`, { withCredentials: true });
            setAcknowledgedAdvisories(ackRes.data.advisories || []);
            setTotalPages(ackRes.data.totalPages || 1);
            setCurrentPage(ackRes.data.currentPage || 1);
        } catch (err: any) {
            console.error('Error fetching historical advisories:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchHistoricalPage(newPage);
        }
    };

    const handleIssueInstruction = (advisory: Advisory) => {
        navigate('/supervisor/send-instructions', {
            state: {
                advisoryId: advisory._id,
                advisoryType: advisory.advisoryType,
                classification: advisory.classification,
                cclass: advisory.cclass,
                mclass: advisory.mclass,
                xclass: advisory.xclass,
                message: advisory.message
            }
        });
    };

    return (
        <div className="w-full p-8 text-white min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Analyst Advisories</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Review threat assessments and issue actionable shift instructions.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <h2 className="text-lg font-bold text-red-400">Action Required: Pending Advisories</h2>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
                        {loading ? (
                            <div className="py-12 text-center text-slate-400">Loading queue...</div>
                        ) : pendingAdvisories.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 text-sm font-medium">
                                Queue is clear. No pending advisories at this time.
                            </div>
                        ) : (
                            <div className="w-full text-left border-collapse">
                                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-700/30 border-b border-slate-700/50 text-xs font-bold text-slate-400 uppercase">
                                    <div className="col-span-3">Time Tag (UTC)</div>
                                    <div className="col-span-4 text-center">Threat Profile</div>
                                    <div className="col-span-2 text-center">Status</div>
                                    <div className="col-span-3 text-right">Actions</div>
                                </div>

                                <div className="divide-y divide-slate-700/50 max-h-150 overflow-y-auto custom-scrollbar">
                                    {pendingAdvisories.map((advisory) => (
                                        <div key={advisory._id} className="flex flex-col">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-700/20 transition-colors">

                                                <div className="col-span-3 flex flex-col cursor-pointer" onClick={() => toggleExpand(advisory._id)}>
                                                    <span className="text-sm font-semibold text-slate-200">{formatDate(advisory.createdAt)}</span>
                                                    <span className="text-xs font-mono text-slate-500">ID: {advisory._id.slice(-6).toUpperCase()}</span>
                                                </div>

                                                <div className="col-span-4 flex justify-center items-center gap-2 cursor-pointer" onClick={() => toggleExpand(advisory._id)}>
                                                    {advisory.cclass !== undefined ? (
                                                        <>
                                                            <span className="bg-slate-900/50 px-2 py-1 rounded text-xs border border-slate-700/40">
                                                                C: <span className="text-green-400 font-bold">{advisory.cclass}</span>
                                                            </span>
                                                            <span className="bg-slate-900/50 px-2 py-1 rounded text-xs border border-slate-700/40">
                                                                M: <span className="text-amber-500 font-bold">{advisory.mclass}</span>
                                                            </span>
                                                            <span className="bg-slate-900/50 px-2 py-1 rounded text-xs border border-slate-700/40">
                                                                X: <span className="text-red-500 font-bold">{advisory.xclass}</span>
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="bg-red-900/30 text-red-300 border border-red-500/30 px-2.5 py-1 rounded text-xs font-semibold">
                                                            {advisory.classification || 'Flare Anomaly'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="col-span-2 flex justify-center cursor-pointer" onClick={() => toggleExpand(advisory._id)}>
                                                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                                        PENDING
                                                    </span>
                                                </div>

                                                <div className="col-span-3 flex justify-end gap-3">
                                                    <button
                                                        onClick={() => toggleExpand(advisory._id)}
                                                        className="text-xs font-semibold cursor-pointer text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700/40"
                                                    >
                                                        {expandedId === advisory._id ? 'Hide Note' : 'View Note'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleIssueInstruction(advisory)}
                                                        className="text-xs font-bold cursor-pointer text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-1.5 rounded-lg shadow-md transition-colors"
                                                    >
                                                        Issue Instruction
                                                    </button>
                                                </div>
                                            </div>

                                            {expandedId === advisory._id && (
                                                <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-700/50">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Analyst Assessment</h4>
                                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{advisory.message}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Historical Records Toggle */}
                <div className="flex justify-center my-6">
                    <button
                        onClick={() => setShowAcknowledged(!showAcknowledged)}
                        className="px-6 py-2 cursor-pointer text-sm font-semibold text-slate-300 bg-slate-800/60 border border-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        {showAcknowledged ? 'Hide Historical Advisories' : 'View Historical Advisories'}
                    </button>
                </div>

                {showAcknowledged && (
                    <section className="animate-fadeIn">
                        <h2 className="text-lg font-bold text-slate-200 mb-4">Historical Records</h2>
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
                            {historyLoading ? (
                                <div className="py-8 text-center text-slate-400">Loading history...</div>
                            ) : acknowledgedAdvisories.length === 0 ? (
                                <div className="py-8 text-center text-slate-400 text-sm">No historical advisories found.</div>
                            ) : (
                                <div className="w-full text-left">
                                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-700/30 border-b border-slate-700/50 text-xs font-bold text-slate-400 uppercase">
                                        <div className="col-span-3">Time Tag (UTC)</div>
                                        <div className="col-span-4 text-center">Threat Profile</div>
                                        <div className="col-span-3 text-center">Acknowledged By</div>
                                        <div className="col-span-2 text-right">Details</div>
                                    </div>

                                    <div className="divide-y divide-slate-700/50">
                                        {acknowledgedAdvisories.map((advisory) => (
                                            <div key={advisory._id} className="flex flex-col">
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer hover:bg-slate-700/20 transition-colors" onClick={() => toggleExpand(advisory._id)}>
                                                    <div className="col-span-3 flex flex-col">
                                                        <span className="text-sm font-medium text-slate-300">{formatDate(advisory.createdAt)}</span>
                                                    </div>

                                                    <div className="col-span-4 flex justify-center items-center gap-2 opacity-75">
                                                        {advisory.cclass !== undefined ? (
                                                            <>
                                                                <span className="text-xs text-slate-300">C: {advisory.cclass}</span>
                                                                <span className="text-xs text-slate-300">M: {advisory.mclass}</span>
                                                                <span className="text-xs text-slate-300">X: {advisory.xclass}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-slate-300">{advisory.classification || 'Flare Anomaly'}</span>
                                                        )}
                                                    </div>

                                                    <div className="col-span-3 text-center">
                                                        <span className="text-xs font-mono text-slate-400">
                                                            {advisory.acknowledgedBySupervisorId || 'Unknown'}
                                                        </span>
                                                    </div>

                                                    <div className="col-span-2 flex justify-end">
                                                        <span className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                                                            {expandedId === advisory._id ? 'Close' : 'View Report'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {expandedId === advisory._id && (
                                                    <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-700/50">
                                                        <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{advisory.message}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/60 border-t border-slate-700/50">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1 || historyLoading}
                                                className="px-4 py-2 text-xs cursor-pointer font-bold text-slate-300 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-xs font-semibold text-slate-400">
                                                Page <span className="text-white">{currentPage}</span> of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages || historyLoading}
                                                className="px-4 py-2 text-xs cursor-pointer font-bold text-slate-300 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}