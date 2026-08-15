import { useState, useEffect } from 'react';
import axios from 'axios';

interface Advisory {
    _id: string;
    advisoryType?: 'Prediction' | 'Anomaly';
    cclass?: number;
    mclass?: number;
    xclass?: number;
    flareDetails?: string | null;
    message: string;
    acknowledgedBySupervisorId?: string | null;
    acknowledgedByCompanyAdminId?: string | null;
    createdAt: string;
}

export default function AnalystViewAdvisories() {
    const [advisories, setAdvisories] = useState<Advisory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchAdvisories = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `/api/user/analyst/view-advisories?page=${page}`,
                { withCredentials: true }
            );
            setAdvisories(response.data.advisories || []);
            setTotalPages(response.data.totalPages || 1);
            setCurrentPage(response.data.currentPage || page);
        } catch (err: any) {
            console.error('Error fetching advisories:', err);
            setError('Failed to load advisories. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdvisories(currentPage);
    }, [currentPage]);

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
        <div className="w-full p-8 text-white min-h-screen mt-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="border-b border-slate-700/60 pb-4">
                    <h1 className="text-3xl font-extrabold tracking-wide mb-1 text-white">
                        Issued Operational Advisories
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Monitor target recipients, threat summaries, and acknowledgment tracking across all operations.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    ) : advisories.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            <svg className="w-16 h-16 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-bold text-slate-300 mb-1">No Advisories Issued</h3>
                            <p className="text-slate-400 text-sm">You have not generated any incident or predictive advisories yet.</p>
                        </div>
                    ) : (
                        <div className="w-full text-left">
                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-700/30 border-b border-slate-700/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <div className="col-span-3">Time Tag (UTC) / ID</div>
                                <div className="col-span-2 text-center">Advisory For</div>
                                <div className="col-span-3 text-center">Threat Profile</div>
                                <div className="col-span-3 text-center">Acknowledgment Status</div>
                                <div className="col-span-1 text-right">Details</div>
                            </div>

                            <div className="divide-y divide-slate-700/50">
                                {advisories.map((advisory) => {
                                    const isAnomaly = advisory.advisoryType === 'Anomaly';

                                    return (
                                        <div key={advisory._id} className="flex flex-col">
                                            <div
                                                onClick={() => toggleExpand(advisory._id)}
                                                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer hover:bg-slate-700/20 transition-colors"
                                            >
                                                <div className="col-span-3 flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-200">
                                                        {formatDate(advisory.createdAt)}
                                                    </span>
                                                    <span className="text-xs font-mono text-slate-500">
                                                        ID: {advisory._id.slice(-6).toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="col-span-2 flex justify-center">
                                                    {isAnomaly ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                                            Company Admin
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                            Supervisor & Admin
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="col-span-3 flex justify-center items-center gap-2">
                                                    {isAnomaly ? (
                                                        <span
                                                            className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 px-3 py-1 rounded-md truncate max-w-xs"
                                                            title={advisory.flareDetails || 'Incident Flare Telemetry'}
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

                                                <div className="col-span-3 flex flex-col items-center justify-center gap-1.5">
                                                    {!isAnomaly && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="text-slate-400 text-[11px] w-20 text-right">Supervisor:</span>
                                                            {advisory.acknowledgedBySupervisorId ? (
                                                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded text-[11px]">
                                                                    ✓ Signed
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded text-[11px] animate-pulse">
                                                                    ⏳ Awaiting
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-slate-400 text-[11px] w-20 text-right">Co. Admin:</span>
                                                        {advisory.acknowledgedByCompanyAdminId ? (
                                                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded text-[11px]">
                                                                ✓ Signed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded text-[11px] animate-pulse">
                                                                ⏳ Awaiting
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-span-1 flex justify-end">
                                                    <svg
                                                        className={`w-5 h-5 text-indigo-400 transition-transform duration-200 ${expandedId === advisory._id ? 'rotate-180' : ''
                                                            }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {expandedId === advisory._id && (
                                                <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-700/50 space-y-3">
                                                    {advisory.flareDetails && (
                                                        <div>
                                                            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                                                                Telemetry Payload Details
                                                            </h4>
                                                            <p className="text-xs font-mono text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                                                                {advisory.flareDetails}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                            Analyst Assessment Note
                                                        </h4>
                                                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                            {advisory.message}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800 text-xs text-slate-400">
                                                        {advisory.acknowledgedBySupervisorId && (
                                                            <span>
                                                                Supervisor Acknowledger ID:{' '}
                                                                <strong className="text-slate-200 font-mono">
                                                                    {advisory.acknowledgedBySupervisorId}
                                                                </strong>
                                                            </span>
                                                        )}
                                                        {advisory.acknowledgedByCompanyAdminId && (
                                                            <span>
                                                                Company Admin Acknowledger ID:{' '}
                                                                <strong className="text-slate-200 font-mono">
                                                                    {advisory.acknowledgedByCompanyAdminId}
                                                                </strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {!loading && advisories.length > 0 && totalPages > 1 && (
                    <div className="mt-6 flex justify-between items-center bg-slate-800/40 border border-slate-700/50 px-6 py-4 rounded-xl">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-semibold cursor-pointer text-slate-300 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-slate-400">
                            Page <strong className="text-white">{currentPage}</strong> of{' '}
                            <strong className="text-white">{totalPages}</strong>
                        </span>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm font-semibold cursor-pointer text-slate-300 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}