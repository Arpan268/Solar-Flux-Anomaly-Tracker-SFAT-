import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SupervisorDashboard() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState<any>(null);
    const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [xClassAlert, setXClassAlert] = useState<any>(null);

    const [pendingAdvisoryCount, setPendingAdvisoryCount] = useState<number>(0);
    const [showAdvisoryToast, setShowAdvisoryToast] = useState<boolean>(false);

    const supervisorName = (auth as any)?.username || "Supervisor";

    useEffect(() => {
        const fetchSummary = async () => {
            if (!(auth as any)?.accessToken) return;
            try {
                const res = await axios.get('/api/user/shared/supervisor/analyze', {
                    headers: { Authorization: `Bearer ${(auth as any).accessToken}` },
                    withCredentials: true
                });
                setSummary(res.data.summary);
            } catch (error) {
                // Handle error quietly or log
            }
        };
        fetchSummary();
    }, [auth]);

    useEffect(() => {
        if (!(auth as any)?.accessToken) return;
        const eventSource = new EventSource(`/api/user/supervisor/live-data?token=${(auth as any).accessToken}`);

        eventSource.onopen = () => {
            setIsStreamActive(true);
            setError(null);
        };

        eventSource.onmessage = () => {
            setIsStreamActive(true);
            setError(null);
        };

        eventSource.onerror = () => {
            setIsStreamActive(false);
            setError('OFFLINE & INACTIVE');
        };

        return () => {
            eventSource.close();
        };
    }, [auth]);

    useEffect(() => {
        if (!(auth as any)?.accessToken) return;

        const notificationSource = new EventSource(`/api/user/shared/supervisor/notifications/stream?token=${(auth as any).accessToken}`);

        notificationSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'X_CLASS_FLARE_ALERT') {
                    setXClassAlert(data);
                } else if (data.type === 'CONNECTED') {
                    console.log(data.message);
                }
            } catch (err) {
                console.error("Error parsing notification stream:", err);
            }
        };

        return () => {
            notificationSource.close();
        };
    }, [auth]);

    useEffect(() => {
        if (!(auth as any)?.accessToken) return;

        const advisorySource = new EventSource(`/api/user/supervisor/advisory-stream?token=${(auth as any).accessToken}`);

        advisorySource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'SYNC_PENDING') {
                    setPendingAdvisoryCount(data.count);
                }
                else if (data.type === 'NEW_ADVISORY') {
                    setPendingAdvisoryCount(prev => prev + 1);
                    setShowAdvisoryToast(true);

                    setTimeout(() => setShowAdvisoryToast(false), 8000);
                }
                else if (data.type === 'ADVISORY_ACKNOWLEDGED') {
                    setPendingAdvisoryCount(prev => Math.max(0, prev - 1));
                }
            } catch (err) {
                console.error("Error parsing advisory stream:", err);
            }
        };

        return () => {
            advisorySource.close();
        };
    }, [auth]);

    const handleAcknowledgeAlert = async () => {
        try {
            await axios.delete('/api/user/shared/supervisor/notifications/clear-x-class', {
                headers: { Authorization: `Bearer ${(auth as any).accessToken}` },
                withCredentials: true
            });
            setXClassAlert(null);
        } catch (error) {
            console.error("Error clearing X-Class alert:", error);
            setXClassAlert(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">

            {showAdvisoryToast && (
                <div className="fixed top-24 right-8 bg-indigo-950/90 border border-indigo-500 rounded-xl p-5 shadow-2xl shadow-indigo-900/50 z-50 max-w-sm animate-in slide-in-from-right-8 fade-in duration-300 backdrop-blur-md">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                            <h3 className="text-white font-bold text-sm tracking-wide uppercase">New Advisory Received</h3>
                        </div>
                        <button onClick={() => setShowAdvisoryToast(false)} className="text-indigo-400 hover:text-white transition-colors">
                            <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p className="text-indigo-200 text-xs mb-4">
                        An analyst has just submitted a new predictive threat assessment requiring your review.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setShowAdvisoryToast(false);
                                navigate('/supervisor/view-advisories');
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors cursor-pointer shadow-md"
                        >
                            View Queue ({pendingAdvisoryCount})
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-12">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Command Center</h1>
                <p className="text-slate-400 mt-2 text-lg">Welcome back, {supervisorName}. System is working and ready for monitoring.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Telemetry Stream</p>
                    {error && (
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                            <p className="text-red-400 font-bold">{error}</p>
                        </div>
                    )}
                    {isStreamActive ? (
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-emerald-400 font-bold">ONLINE & NOMINAL</p>
                        </div>
                    ) : (
                        !error && (
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
                                <p className="text-yellow-400 font-bold">LOADING STATUS...</p>
                            </div>
                        )
                    )}
                </div>

                <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Database Connection</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <p className="text-blue-400 font-bold">SECURE</p>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Authorization</p>
                    <p className="text-slate-300 font-bold">LEVEL: SUPERVISOR</p>
                </div>
            </div>

            {summary && (
                <div>
                    <p className="text-slate-400 mt-2 text-lg mb-5">Summary of recent activities of last 24 hours and key metrics.</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Total Anomalies</p>
                            <p className="text-2xl text-white font-bold">{summary.totalAnomalies}</p>
                            {summary.anomalyPendingCount > 0 ? (
                                <span className="text-sm font-medium text-amber-500/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 mt-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                    {summary.anomalyPendingCount} Pending {summary.anomalyPendingCount === 1 ? 'Review' : 'Reviews'}
                                </span>
                            ) : (
                                <span className="text-sm font-medium text-emerald-500/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 mt-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Acknowledged
                                </span>
                            )}
                        </div>

                        <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Peak Flux (24H)</p>
                            <p className="text-2xl text-white font-bold">
                                {summary.peakFlux > 0 ? summary.peakFlux.toExponential(3) : "0"}
                            </p>
                        </div>

                        <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Advisories Issued</p>
                            <p className="text-2xl text-white font-bold">{summary.advisoryCount}</p>
                            {summary.advisoryPendingCount > 0 ? (
                                <span className="text-sm font-medium text-amber-500/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 mt-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                    {summary.advisoryPendingCount} Pending {summary.advisoryPendingCount === 1 ? 'Review' : 'Reviews'}
                                </span>
                            ) : (
                                <span className="text-sm font-medium text-emerald-500/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 mt-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Acknowledged
                                </span>
                            )}
                        </div>

                        <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Breakdown</p>
                            <div className="flex gap-3 text-sm font-semibold mt-1">
                                <span className="text-emerald-400">C: {summary.breakdown.cClass}</span>
                                <span className="text-orange-400">M: {summary.breakdown.mClass}</span>
                                <span className="text-red-500">X: {summary.breakdown.xClass}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => navigate('/supervisor/view-anomalies')} className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-blue-500 transition-all cursor-pointer group">
                    <span className="bg-blue-900/30 text-blue-400 p-3 rounded-lg inline-block mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Anomaly Queue</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Review, verify, and acknowledge pending solar flux anomalies logged by the operator team.</p>
                </div>

                <div onClick={() => navigate('/supervisor/send-instructions')} className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-emerald-500 transition-all cursor-pointer group">
                    <span className="bg-emerald-900/30 text-emerald-400 p-3 rounded-lg inline-block mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Broadcast Orders</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Send specific focus parameters or emergency instructions to operators and track read receipts.</p>
                </div>

                <div onClick={() => navigate('/supervisor/view-operators')} className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-purple-500 transition-all cursor-pointer group">
                    <span className="bg-purple-900/30 text-purple-400 p-3 rounded-lg inline-block mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Manage Roster</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">View the current list of active operators on duty and revoke system access if necessary.</p>
                </div>

                <div onClick={() => navigate('/supervisor/view-advisories')} className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-indigo-500 transition-all cursor-pointer group relative">
                    {pendingAdvisoryCount > 0 && (
                        <span className="absolute top-6 right-6 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 text-[10px] text-white font-bold items-center justify-center">
                                {pendingAdvisoryCount}
                            </span>
                        </span>
                    )}
                    <span className="bg-indigo-900/30 text-indigo-400 p-3 rounded-lg inline-block mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Advisory Queue</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Review predictive threat assessments from analysts and issue operational directives.</p>
                </div>
            </div>

            {xClassAlert && (
                <div className="fixed bottom-8 right-8 bg-red-950 border-2 border-red-500 rounded-xl p-6 shadow-2xl shadow-red-900/50 z-50 max-w-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-red-500 font-bold text-xl">⚠️</span>
                        <h3 className="text-white font-bold text-lg tracking-wide uppercase">X-Class Flare Bypassed</h3>
                    </div>
                    <p className="text-red-200 text-sm mb-4 leading-relaxed">
                        An X-Class flare (Flux: {xClassAlert.flux} W/m²) was just logged and routed directly to Analysts due to emergency protocols.
                    </p>
                    <button
                        onClick={handleAcknowledgeAlert}
                        className="w-full bg-transparent border border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer"
                    >
                        Acknowledge & Dismiss
                    </button>
                </div>
            )}
        </div>
    );
}