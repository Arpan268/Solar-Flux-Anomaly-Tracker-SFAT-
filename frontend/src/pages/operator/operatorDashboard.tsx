import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

interface LiveData {
    _id: string;
    time_tag: string;
    satellite: number;
    flux: number;
    observed_flux: number;
    electron_correction: number;
    electron_contaminaton: boolean;
    energy: string;
}

interface AnomalyData extends LiveData {
    classification: string;
}

export default function OperatorDashboard() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [liveData, setLiveData] = useState<LiveData[]>([]);
    const [anomalyData, setAnomalyData] = useState<AnomalyData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number>(60);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    useEffect(() => {
        if (!auth?.accessToken) return;

        const eventSource = new EventSource(`/api/user/operator/live-data?token=${auth.accessToken}`);

        eventSource.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                const parsedData = Array.isArray(payload) ? payload : [payload];

                setLiveData(parsedData);
                setError(null);
                setCountdown(60);
                setCurrentTime(new Date());

                if (parsedData.length > 0 && parsedData[0].flux < 0.000001) {
                    setAnomalyData(null);
                }
            } catch (err) {
                setError("Failed to parse live telemetry stream.");
            }
        };

        eventSource.addEventListener("anomaly_alert", (event) => {
            try {
                const alertData = JSON.parse(event.data);
                setAnomalyData(alertData);
            } catch (err) {
                console.error(err);
            }
        });

        eventSource.onerror = () => {
            setError("Connection to live telemetry lost. Attempting to reconnect...");
        };

        return () => {
            eventSource.close();
        };
    }, [auth]);

    const latestData = liveData.length > 0 ? liveData[0] : null;

    useEffect(() => {
        if (!latestData) {
            setCountdown(60)
            return
        }

        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, [latestData]);

    const getDataAge = () => {
        if (!latestData) return 0;
        const dataTime = new Date(latestData.time_tag).getTime();
        const ageMs = currentTime.getTime() - dataTime;
        return Math.floor(ageMs / 1000);
    };

    function handleLogAnomaly() {
        if (!anomalyData) return;

        const anomalyPayload = {
            time_tag: anomalyData.time_tag,
            flux: anomalyData.flux,
            classification: anomalyData.classification
        };

        navigate("/operator/log-anomaly", {
            state: anomalyPayload
        });
    }

    return (
        <div className="max-w-6xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Operator Dashboard</h2>
                <p className="text-slate-400 mt-2">Live NOAA Telemetry & Anomaly Detection</p>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {latestData ? (
                <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden mb-8">
                    <div className="bg-gray-800 border-b border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Current Reading</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Next update in --- <span className="text-blue-400 font-bold text-base">{countdown}s</span></p>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Observation Time (IST)</p>
                            <p className="text-slate-200 font-medium">{new Date(latestData.time_tag).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                            <p className="text-xs text-yellow-400 mt-1">Data age: {getDataAge()}s</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Primary Flux</p>
                            <p className="text-blue-400 font-bold text-xl">{latestData.flux.toExponential(2)}</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Satellite ID</p>
                            <p className="text-slate-200 font-medium">{latestData.satellite || "N/A"}</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Energy Band</p>
                            <p className="text-slate-200 font-medium">{latestData.energy || "N/A"}</p>
                        </div>
                    </div>
                </div>
            ) : (
                !error && (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center text-slate-400">
                        Awaiting live telemetry stream...
                    </div>
                )
            )}

            {anomalyData && (
                <div className="bg-red-900/20 border border-red-600/50 rounded-xl p-6 shadow-lg shadow-red-900/20 flex flex-col sm:flex-row items-center justify-between gap-6 animate-pulse">
                    <div>
                        <h3 className="text-xl font-bold text-red-500 mb-2">
                            Critical {anomalyData.classification} Detected
                        </h3>
                        <p className="text-red-400/80 text-sm">
                            Telemetry recorded a flux level of {anomalyData.flux.toExponential(2)} at {new Date(anomalyData.time_tag).toLocaleTimeString()}. This requires immediate logging and supervisor review.
                        </p>
                    </div>

                    <button
                        onClick={handleLogAnomaly}
                        className="w-full sm:w-auto whitespace-nowrap bg-red-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-red-600/30 hover:bg-red-700 transition-colors transform hover:scale-105 cursor-pointer"
                    >
                        Log Anomaly
                    </button>
                </div>
            )}
        </div>
    );
}