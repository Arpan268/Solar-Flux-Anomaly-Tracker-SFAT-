import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function Landing() {
    return (
        <div className="min-h-screen bg-gray-900 text-slate-200 flex flex-col items-center pt-10 px-8">
            <div className="max-w-5xl w-full text-center space-y-8">

                <img src={logo} alt="SFAT Logo" className="mx-auto w-92 h-48 hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all ease-out hover:scale-105 transform duration-300" />
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                    🚀 Solar Flux <span className="text-blue-500">Anomaly Tracker</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                    Advanced real-time monitoring, anomaly detection, and team coordination for solar flux activity. Secure, role-based, and built for precision.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <Link
                        to="/login"
                        className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 transition-all"
                    >
                        Login to Dashboard
                    </Link>
                    <Link
                        to="/register"
                        className="w-full sm:w-auto px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold rounded-lg transition-all"
                    >
                        Request Access
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20 text-left">
                    <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl hover:border-blue-500/50 transition-colors hover:scale-105 transform duration-300">
                        <div className="text-blue-400 text-2xl mb-3">📡</div>
                        <h3 className="text-xl font-bold text-white mb-2">Live Telemetry</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Monitor solar flux data in real-time with high-precision graphs and instant updates fetched directly from the NOAA API.
                        </p>
                    </div>

                    <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl hover:border-blue-500/50 transition-colors hover:scale-105 transform duration-300">
                        <div className="text-blue-400 text-2xl mb-3">⚠️</div>
                        <h3 className="text-xl font-bold text-white mb-2">Anomaly Detection</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Automated logging and supervisor alert systems for unacknowledged flux spikes and critical space weather events.
                        </p>
                    </div>

                    <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl hover:border-blue-500/50 transition-colors hover:scale-105 transform duration-300">
                        <div className="text-blue-400 text-2xl mb-3">🔐</div>
                        <h3 className="text-xl font-bold text-white mb-2">Role-Based Access</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Secure architecture with dedicated workflows, dashboards, and permissions for Operators, Supervisors, and Analysts.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}