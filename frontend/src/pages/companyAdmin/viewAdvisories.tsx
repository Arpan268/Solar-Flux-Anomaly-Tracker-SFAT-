import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import axios from 'axios';

interface Advisory {
    _id: string;
    advisoryType?: 'Prediction' | 'Anomaly';
    cclass?: number;
    mclass?: number;
    xclass?: number;
    flareDetails?: string | null;
    message: string;
    analystId?: string;
    acknowledgedBySupervisorId?: string | null;
    acknowledgedByCompanyAdminId?: string | null;
    createdAt: string;
}

export default function CompanyAdminViewAdvisories() {
    const { auth } = useAuth();

    const [pendingAdvisories, setPendingAdvisories] = useState<Advisory[]>([]);
    const [acknowledgedAdvisories, setAcknowledgedAdvisories] = useState<Advisory[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [historyLoading, setHistoryLoading] = useState<boolean>(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [showHistorical, setShowHistorical] = useState<boolean>(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchInitialData = async () => {
        if (!auth?.accessToken) return;
        setLoading(true);
        setError(null);

        try {
            const [pendingRes, ackRes] = await Promise.all([
                axios.get('/api/user/company-admin/view-pending-advisories', {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }),
                axios.get('/api/user/company-admin/view-acknowledged-advisories?page=1&limit=5', {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }),
            ]);

            const pendingList = pendingRes.data.advisories || pendingRes.data || [];
            const ackList = ackRes.data.advisories || ackRes.data || [];

            setPendingAdvisories(pendingList);
            setAcknowledgedAdvisories(ackList);
            setTotalPages(ackRes.data.totalPages || 1);
            setCurrentPage(ackRes.data.currentPage || 1);
        } catch (err: any) {
            console.error('Error fetching company advisories:', err);
            setError('Failed to load advisories. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoricalPage = async (page: number) => {
        if (!auth?.accessToken) return;
        setHistoryLoading(true);
        try {
            const ackRes = await axios.get(
                `/api/user/company-admin/view-acknowledged-advisories?page=${page}&limit=5`,
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }
            );
            setAcknowledgedAdvisories(ackRes.data.advisories || ackRes.data || []);
            setTotalPages(ackRes.data.totalPages || 1);
            setCurrentPage(ackRes.data.currentPage || page);
        } catch (err: any) {
            console.error('Error fetching historical advisories:', err);
            setError('Failed to load historical advisories.');
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [auth]);

    const handleAcknowledge = async (id: string) => {
        if (!auth?.accessToken) return;

        setActionLoadingId(id);
        setError(null);

        try {
            await axios.put(
                `/api/user/company-admin/${id}/acknowledge-advisory`,
                {},
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }
            );

            const acknowledgedItem = pendingAdvisories.find((item) => item._id === id);

            setPendingAdvisories((prev) => prev.filter((item) => item._id !== id));

            if (acknowledgedItem) {
                setAcknowledgedAdvisories((prev) => [
                    {
                        ...acknowledgedItem,
                        acknowledgedByCompanyAdminId: 'Signed',
                    },
                    ...prev,
                ]);
            }
        } catch (err: any) {
            console.error('Error acknowledging advisory:', err);
            setError(err.response?.data?.message || 'Failed to sign off advisory.');
        } finally {
            setActionLoadingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="w-full p-8 text-white min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="border-b border-slate-700/60 pb-4">
                    <h1 className="text-3xl font-extrabold tracking-wide mb-1 text-white">
                        Operational Threat Advisories
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Review critical space weather telemetry, assess operational risks, and record formal corporate acknowledgments.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 font-bold hover:text-white">
                            ✕
                        </button>
                    </div>
                )}

                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                        <h2 className="text-lg font-bold text-amber-300">Action Required: Pending Advisories</h2>
                        {pendingAdvisories.length > 0 && (
                            <span className="bg-amber-400/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                                {pendingAdvisories.length}
                            </span>
                        )}
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
                        {loading ? (
                            <div className="py-12 text-center text-slate-400 text-sm font-medium">
                                Loading advisory queue...
                            </div>
                        ) : pendingAdvisories.length === 0 ? (
                            <div className="py-12 text-center text-slate-400">
                                <p className="text-base font-semibold text-slate-300">All advisories resolved.</p>
                                <p className="text-xs text-slate-500 mt-1">No pending space weather alerts awaiting executive sign-off.</p>
                            </div>
                        ) : (
                            <div className="w-full text-left">
                                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-700/30 border-b border-slate-700/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="col-span-3">Time Tag (UTC) / ID</div>
                                    <div className="col-span-2 text-center">Advisory Source</div>
                                    <div className="col-span-4 text-center">Threat Profile</div>
                                    <div className="col-span-3 text-right">Actions</div>
                                </div>

                                <div className="divide-y divide-slate-700/50">
                                    {pendingAdvisories.map((advisory) => {
                                        const isAnomaly = advisory.advisoryType === 'Anomaly';

                                        return (
                                            <div key={advisory._id} className="flex flex-col">
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-700/20 transition-colors">
                                                    <div
                                                        className="col-span-3 flex flex-col cursor-pointer"
                                                        onClick={() => toggleExpand(advisory._id)}
                                                    >
                                                        <span className="text-sm font-semibold text-slate-200">
                                                            {formatDate(advisory.createdAt)}
                                                        </span>
                                                        <span className="text-xs font-mono text-slate-500">
                                                            ID: {advisory._id.slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>

                                                    <div
                                                        className="col-span-2 flex justify-center cursor-pointer"
                                                        onClick={() => toggleExpand(advisory._id)}
                                                    >
                                                        {isAnomaly ? (
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-900/30 text-amber-300 border border-amber-700/50">
                                                                Live Flare Anomaly
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-900/30 text-indigo-300 border border-indigo-700/50">
                                                                24H ML Forecast
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div
                                                        className="col-span-4 flex justify-center items-center gap-2 cursor-pointer"
                                                        onClick={() => toggleExpand(advisory._id)}
                                                    >
                                                        {isAnomaly ? (
                                                            <span
                                                                className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 px-3 py-1 rounded-md truncate max-w-xs"
                                                                title={advisory.flareDetails || 'Flare Telemetry Record'}
                                                            >
                                                                {advisory.flareDetails || 'Incident Flare Telemetry'}
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="bg-slate-900/60 px-2 py-1 rounded text-xs border border-slate-700/40">
                                                                    C: <strong className="text-green-400 font-mono">{advisory.cclass ?? 0}%</strong>
                                                                </span>
                                                                <span className="bg-slate-900/60 px-2 py-1 rounded text-xs border border-slate-700/40">
                                                                    M: <strong className="text-amber-400 font-mono">{advisory.mclass ?? 0}%</strong>
                                                                </span>
                                                                <span className="bg-slate-900/60 px-2 py-1 rounded text-xs border border-slate-700/40">
                                                                    X: <strong className="text-red-400 font-mono">{advisory.xclass ?? 0}%</strong>
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="col-span-3 flex justify-end gap-3 items-center">
                                                        <button
                                                            onClick={() => toggleExpand(advisory._id)}
                                                            className="text-xs font-semibold cursor-pointer text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700/40 transition-colors"
                                                        >
                                                            {expandedId === advisory._id ? 'Hide Note' : 'View Note'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleAcknowledge(advisory._id)}
                                                            disabled={actionLoadingId === advisory._id}
                                                            className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
                                                        >
                                                            {actionLoadingId === advisory._id ? 'Signing...' : 'Acknowledge'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {expandedId === advisory._id && (
                                                    <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-700/50 space-y-2">
                                                        {advisory.flareDetails && (
                                                            <div>
                                                                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                                                                    Telemetry Details
                                                                </h4>
                                                                <p className="text-xs font-mono text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                                                                    {advisory.flareDetails}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                            Analyst Assessment Note
                                                        </h4>
                                                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                            {advisory.message}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <div className="flex justify-center my-6">
                    <button
                        onClick={() => setShowHistorical(!showHistorical)}
                        className="px-6 py-2 cursor-pointer text-sm font-semibold text-slate-300 bg-slate-800/60 border border-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        {showHistorical ? 'Hide Historical Advisories' : 'View Historical Advisories'}
                    </button>
                </div>

                {showHistorical && (
                    <section className="animate-fadeIn">
                        <h2 className="text-lg font-bold text-slate-200 mb-4">Historical Sign-Off Records</h2>
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
                            {historyLoading ? (
                                <div className="py-8 text-center text-slate-400 text-sm">Loading history...</div>
                            ) : acknowledgedAdvisories.length === 0 ? (
                                <div className="py-8 text-center text-slate-400 text-sm">No historical advisories archived yet.</div>
                            ) : (
                                <div className="w-full text-left">
                                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-700/30 border-b border-slate-700/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <div className="col-span-3">Time Tag (UTC) / ID</div>
                                        <div className="col-span-3 text-center">Advisory Type</div>
                                        <div className="col-span-4 text-center">Threat Profile</div>
                                        <div className="col-span-2 text-right">Details</div>
                                    </div>

                                    <div className="divide-y divide-slate-700/50">
                                        {acknowledgedAdvisories.map((advisory) => {
                                            const isAnomaly = advisory.advisoryType === 'Anomaly';

                                            return (
                                                <div key={advisory._id} className="flex flex-col">
                                                    <div
                                                        onClick={() => toggleExpand(advisory._id)}
                                                        className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer hover:bg-slate-700/20 transition-colors"
                                                    >
                                                        <div className="col-span-3 flex flex-col">
                                                            <span className="text-sm font-medium text-slate-300">
                                                                {formatDate(advisory.createdAt)}
                                                            </span>
                                                            <span className="text-xs font-mono text-slate-500">
                                                                ID: {advisory._id.slice(-6).toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div className="col-span-3 text-center">
                                                            <span className="text-xs font-bold text-slate-400">
                                                                {isAnomaly ? 'Flare Anomaly' : 'ML Forecast'}
                                                            </span>
                                                        </div>

                                                        <div className="col-span-4 flex justify-center items-center gap-2 opacity-80">
                                                            {isAnomaly ? (
                                                                <span className="text-xs font-mono text-cyan-400 truncate max-w-xs">
                                                                    {advisory.flareDetails || 'Flare Telemetry Record'}
                                                                </span>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                                                    <span>C: {advisory.cclass ?? 0}%</span>
                                                                    <span>M: {advisory.mclass ?? 0}%</span>
                                                                    <span>X: {advisory.xclass ?? 0}%</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col-span-2 flex justify-end">
                                                            <span className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                                                                {expandedId === advisory._id ? 'Close' : 'View Report'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {expandedId === advisory._id && (
                                                        <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-700/50 space-y-2">
                                                            {advisory.flareDetails && (
                                                                <p className="text-xs font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                                                                    {advisory.flareDetails}
                                                                </p>
                                                            )}
                                                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                                {advisory.message}
                                                            </p>
                                                            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                                                                Status: <strong className="text-emerald-400 font-semibold">Acknowledged & Signed</strong>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/60 border-t border-slate-700/50">
                                            <button
                                                onClick={() => fetchHistoricalPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1 || historyLoading}
                                                className="px-4 py-2 text-xs cursor-pointer font-bold text-slate-300 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-xs font-semibold text-slate-400">
                                                Page <span className="text-white">{currentPage}</span> of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => fetchHistoricalPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages || historyLoading}
                                                className="px-4 py-2 text-xs cursor-pointer font-bold text-slate-300 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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