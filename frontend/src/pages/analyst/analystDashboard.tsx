import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AnalystDashboard() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState<any>(null);
    const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [xClassAlert, setXClassAlert] = useState<any>(null);

    const analystName = (auth as any)?.username || "Analyst";

    useEffect(() => {
        const fetchSummary = async () => {
            if (!(auth as any)?.accessToken) return;
            try {
                const res = await axios.get('/api/user/shared/analyst/analyze', {
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
        if (!(auth as any)?.accessToken) return;
        const eventSource = new EventSource(`/api/user/analyst/live-data?token=${(auth as any).accessToken}`);

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
            setError('STREAMING INACTIVE');
        };

        return () => {
            eventSource.close();
        };
    }, [auth]);

    useEffect(() => {
        if (!(auth as any)?.accessToken) return;
        
        const notificationSource = new EventSource(`/api/user/shared/analyst/notifications/stream?token=${(auth as any).accessToken}`);

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

    const handleReviewAnomaly = async () => {
        try {
            await axios.delete('/api/user/shared/analyst/notifications/clear-x-class', {
                headers: { Authorization: `Bearer ${(auth as any).accessToken}` },
                withCredentials: true
            });
            setXClassAlert(null);
            navigate('/analyst/view-anomalies');
        } catch (error) {
            console.error("Error clearing X-Class alert:", error);
            navigate('/analyst/view-anomalies');
        }
    };

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="mb-12">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Analysis Center</h1>
                <p className="text-slate-400 mt-2 text-lg">Welcome back, {analystName}. Telemetry data and visualization tools are ready for analysis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Data Pipeline</p>
                    {error && (
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                            <p className="text-red-400 font-bold">{error}</p>
                        </div>
                    )}
                    {isStreamActive ? (
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-emerald-400 font-bold">STREAMING ACTIVE</p>
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
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Visualization Engine</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <p className="text-blue-400 font-bold">READY</p>
                    </div>
                </div>
                <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Authorization</p>
                    <p className="text-slate-300 font-bold">LEVEL: ANALYST</p>
                </div>
            </div>

            {summary && (
                <div>
                    <p className="text-slate-400 mt-2 text-lg mb-5">Summary of recent activities of last 24 hours and key metrics.</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Total Anomalies</p>
                            <p className="text-2xl text-white font-bold">{summary.totalAnomalies}</p>
                            {summary.pendingCount > 0 ? (
                                <span className="text-sm font-medium text-amber-500/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 mt-1.75">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                    {summary.pendingCount} Pending {summary.pendingCount === 1 ? 'Review' : 'Reviews'} by Supervisor
                                </span>
                            ) : (
                                <span className="text-sm font-medium text-emerald-500/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 mt-1.75">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Acknowledged
                                </span>
                            )}
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
                </div>
            )}

            <h2 className="text-xl font-bold text-white mb-6">Analytical Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div onClick={() => navigate('/analyst/view-live-data')} className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-emerald-500 transition-colors cursor-pointer group">
                    <div className="mb-4">
                        <span className="bg-emerald-900/30 text-emerald-400 p-3 rounded-lg inline-block">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4s-8-1.79-8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Live Telemetry</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Monitor incoming raw solar flux data, satellite parameters, and export to CSV.</p>
                </div>

                <div onClick={() => navigate('/analyst/view-graphs')} className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-blue-500 transition-colors cursor-pointer group">
                    <div className="mb-4">
                        <span className="bg-blue-900/30 text-blue-400 p-3 rounded-lg inline-block">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Data Visualization</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Analyze flux density trends and moving averages using interactive charts.</p>
                </div>

                <div onClick={() => navigate('/analyst/view-anomalies')} className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-purple-500 transition-colors cursor-pointer group">
                    <div className="mb-4">
                        <span className="bg-purple-900/30 text-purple-400 p-3 rounded-lg inline-block">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Verified Anomalies</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Review historical records of supervisor-acknowledged flux events.</p>
                </div>
            </div>

            {xClassAlert && (
                <div className="fixed bottom-8 right-8 bg-red-950 border-2 border-red-500 rounded-xl p-6 shadow-2xl shadow-red-900/50 z-50 max-w-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-red-500 font-bold text-xl">🚨</span>
                        <h3 className="text-white font-bold text-lg tracking-wide uppercase">Critical Event</h3>
                    </div>
                    <p className="text-red-200 text-sm mb-4 leading-relaxed">
                        {xClassAlert.message} <br/>
                        <strong className="text-white mt-1 block">Peak Flux: {xClassAlert.flux} W/m²</strong>
                    </p>
                    <button 
                        onClick={handleReviewAnomaly}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer"
                    >
                        Review Anomaly Now
                    </button>
                </div>
            )}
        </div>
    );
}