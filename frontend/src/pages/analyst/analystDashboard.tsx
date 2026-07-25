import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

export default function AnalystDashboard() {
    const { auth } = useAuth();
    const navigate = useNavigate();

    const analystName = (auth as any)?.username || "Analyst";

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">

            <div className="mb-12">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    Analysis Center
                </h1>
                <p className="text-slate-400 mt-2 text-lg">
                    Welcome back, {analystName}. Telemetry processing and visualization tools are online.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gray-900 border border-gray-700/50 rounded-lg p-5 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Data Pipeline</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-emerald-400 font-bold">STREAMING ACTIVE</p>
                    </div>
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

            <h2 className="text-xl font-bold text-white mb-6">Analytical Tools</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <div
                    onClick={() => navigate('/analyst/view-livedata')}
                    className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg group"
                >
                    <div className="mb-4">
                        <span className="bg-emerald-900/30 text-emerald-400 p-3 rounded-lg inline-block">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Live Telemetry</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Monitor incoming raw solar flux data, satellite parameters, and export to CSV.
                    </p>
                </div>

                <div
                    onClick={() => navigate('/analyst/view-graphs')}
                    className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-blue-500/50 transition-all cursor-pointer shadow-lg group"
                >
                    <div className="mb-4">
                        <span className="bg-blue-900/30 text-blue-400 p-3 rounded-lg inline-block">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Data Visualization</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Analyze flux density trends and moving averages using interactive charts.
                    </p>
                </div>

                <div
                    onClick={() => navigate('/analyst/view-anomalies')}
                    className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-purple-500/50 transition-all cursor-pointer shadow-lg group"
                >
                    <div className="mb-4">
                        <span className="bg-purple-900/30 text-purple-400 p-3 rounded-lg inline-block">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Verified Anomalies</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Review historical records of supervisor-acknowledged flux events.
                    </p>
                </div>

            </div>
        </div>
    );
}