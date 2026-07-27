import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SupervisorDashboard() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState<any>(null);
    const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null)

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
            }
        };
        fetchSummary();
    }, [auth]);

    useEffect(() => {
        if (!auth?.accessToken) return;
        const eventSource = new EventSource(`/api/user/supervisor/live-data?token=${auth.accessToken}`);

        eventSource.onopen = () => {
            setIsStreamActive(true);
            setError(null)
        };

        eventSource.onmessage = () => {
            setIsStreamActive(true);
            setError(null)
        };

        eventSource.onerror = () => {
            setIsStreamActive(false);
            setError('OFFLINE & INACTIVE')
        };

        return () => {
            eventSource.close();
        };
    }, [auth]);

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="mb-12">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Command Center</h1>
                <p className="text-slate-400 mt-2 text-lg">Welcome back, {supervisorName}. System is working and ready for monitoring.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Telemetry Stream</p>
                    {error && (<div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                        <p className="text-red-400 font-bold">{error}</p>
                    </div>)}
                    {isStreamActive ? (<div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-emerald-400 font-bold">ONLINE & NOMINAL</p>
                    </div>)
                        :
                        !error && (<div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
                            <p className="text-yellow-400 font-bold">LOADING STATUS...</p>
                        </div>)}
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

            <p className="text-slate-400 mt-2 text-lg mb-5">Summary of recent activities of last 24 hours and key metrics.</p>
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Total Anomalies</p>
                        <p className="text-2xl text-white font-bold">{summary.totalAnomalies}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Peak Flux (24h)</p>
                        <p className="text-2xl text-blue-400 font-bold">
                            {summary.peakFlux ? summary.peakFlux.toExponential(2) : "0"}
                        </p>
                    </div>
                    <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Max Severity</p>
                        <p className={`text-xl font-bold ${summary.maxSeverity.includes('X') ? 'text-red-500' : summary.maxSeverity.includes('M') ? 'text-orange-400' : 'text-emerald-400'}`}>
                            {summary.maxSeverity}
                        </p>
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
            )}

            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div onClick={() => navigate('/supervisor/view-anomalies')} className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-blue-500/50 transition-all cursor-pointer shadow-lg group">
                    <div className="mb-4">
                        <span className="bg-blue-900/30 text-blue-400 p-3 rounded-lg inline-block">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Anomaly Queue</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Review, verify, and acknowledge pending solar flux anomalies logged by the operator team.</p>
                </div>

                <div onClick={() => navigate('/supervisor/send-instructions')} className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg group">
                    <div className="mb-4">
                        <span className="bg-emerald-900/30 text-emerald-400 p-3 rounded-lg inline-block">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                            </svg>
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Broadcast Orders</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Send specific focus parameters or emergency instructions to operators and track read receipts.</p>
                </div>

                <div onClick={() => navigate('/supervisor/view-operators')} className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-purple-500/50 transition-all cursor-pointer shadow-lg group">
                    <div className="mb-4">
                        <span className="bg-purple-900/30 text-purple-400 p-3 rounded-lg inline-block">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Manage Roster</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">View the current list of active operators on duty and revoke system access if necessary.</p>
                </div>
            </div>
        </div>
    );
}