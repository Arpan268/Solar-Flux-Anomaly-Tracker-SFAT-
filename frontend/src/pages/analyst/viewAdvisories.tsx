import { useState, useEffect } from 'react';
import axios from 'axios';

interface Advisory {
    _id: string;
    cclass: number;
    mclass: number;
    xclass: number;
    message: string;
    status: 'Pending' | 'Acknowledged';
    createdAt: string;
}

export default function ViewAdvisories() {
    const [advisories, setAdvisories] = useState<Advisory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchAdvisories = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/user/analyst/view-advisories?page=${page}`, {
                withCredentials: true,
            });
            setAdvisories(response.data.advisories);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
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
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="w-full p-8 text-white min-h-screen mt-12">
            <div className="max-w-6xl mx-auto">

                <div className="mb-8 border-b border-slate-700/60 pb-4">
                    <h1 className="text-3xl font-extrabold tracking-wide mb-1">Issued Advisories</h1>
                    <p className="text-slate-400 text-sm">
                        Review the history and current status of your submitted operational threat assessments.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20 opacity-50">
                        <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : advisories.length === 0 ? (

                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-10 text-center shadow-xl">
                        <svg className="w-16 h-16 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-bold text-slate-300 mb-1">No Advisories Issued</h3>
                        <p className="text-slate-400 text-sm">You have not created any operational advisories yet.</p>
                    </div>
                ) : (

                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-800/60 border-b border-slate-700/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <div className="col-span-3">Time / ID</div>
                            <div className="col-span-5 text-center">Threat Profile (24H Risk)</div>
                            <div className="col-span-3 text-right">Status</div>
                            <div className="col-span-1 text-right">Details</div>
                        </div>

                        <div className="divide-y divide-slate-700/50">
                            {advisories.map((advisory) => (
                                <div key={advisory._id} className="flex flex-col">

                                    <div
                                        onClick={() => toggleExpand(advisory._id)}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer hover:bg-slate-700/30 transition-colors"
                                    >

                                        <div className="md:col-span-3 flex flex-col">
                                            <span className="text-sm font-semibold text-slate-200">{formatDate(advisory.createdAt)}</span>
                                            <span className="text-xs font-mono text-slate-500">ID: {advisory._id.slice(-6).toUpperCase()}</span>
                                        </div>

                                        <div className="md:col-span-5 flex justify-start md:justify-center items-center gap-3">
                                            <div className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-md border border-slate-700/40">
                                                <span className="text-xs text-slate-400">C:</span>
                                                <span className="text-sm font-bold text-green-400">{advisory.cclass}%</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-md border border-slate-700/40">
                                                <span className="text-xs text-slate-400">M:</span>
                                                <span className="text-sm font-bold text-amber-500">{advisory.mclass}%</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-md border border-slate-700/40">
                                                <span className="text-xs text-slate-400">X:</span>
                                                <span className="text-sm font-bold text-red-500">{advisory.xclass}%</span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-3 flex justify-start md:justify-end items-center">
                                            {advisory.status === 'Pending' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                                    AWAITING SUPERVISOR
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    ACKNOWLEDGED
                                                </span>
                                            )}
                                        </div>

                                        <div className="hidden md:flex col-span-1 justify-end text-slate-400">
                                            <svg
                                                className={`w-5 h-5 transition-transform duration-200 ${expandedId === advisory._id ? 'rotate-180 text-indigo-400' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {expandedId === advisory._id && (
                                        <div className="px-6 py-5 bg-slate-900/40 border-t border-slate-700/50 shadow-inner">
                                            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Analyst Assessment Note</h4>
                                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                {advisory.message}
                                            </p>
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && advisories.length > 0 && totalPages > 1 && (
                    <div className="mt-6 flex justify-between items-center bg-slate-800/40 border border-slate-700/50 px-6 py-4 rounded-xl">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-semibold cursor-pointer text-slate-300 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-slate-600/50"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-slate-400">
                            Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm font-semibold cursor-pointer text-slate-300 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-slate-600/50"
                        >
                            Next
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}