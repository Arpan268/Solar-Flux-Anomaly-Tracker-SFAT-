import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { useAnomaly, type AnomalyData } from "../../context/anomalyProvider";

interface ShiftDetails {
    startTime: string;
    endTime: string;
}

export default function OperatorDashboard() {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();

    const { liveData, anomalyData, error, countdown, currentTime, removeAnomaly } = useAnomaly();

    const [shift, setShift] = useState<ShiftDetails | null>(null);
    const [shiftTimeRemaining, setShiftTimeRemaining] = useState<string>("");

    const [hasUnreadInstructions, setHasUnreadInstructions] = useState<boolean>(false);

    useEffect(() => {
        async function fetchProfile() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get('/api/user/me', {
                    headers: { Authorization: `Bearer ${auth.accessToken}` }
                });
                const userData = res.data.user || res.data;
                if (userData?.shift && typeof userData.shift === 'object' && userData.shift.startTime) {
                    setShift(userData.shift);
                }
            } catch (err) {
                console.error("Failed to load profile/shift details:", err);
            }
        }
        fetchProfile();
    }, [auth]);

    useEffect(() => {
        async function checkUnreadInstructions() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get("/api/user/operator/unread-instructions", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });

                if (res.data.instructions && res.data.instructions.length > 0) {
                    setHasUnreadInstructions(true);
                }
            } catch (err) {
                console.error("Failed to fetch pending instructions:", err);
            }
        }
        checkUnreadInstructions();

        const handleNewInstruction = () => setHasUnreadInstructions(true);
        window.addEventListener("new_instruction_alert", handleNewInstruction);

        return () => window.removeEventListener("new_instruction_alert", handleNewInstruction);
    }, [auth]);

    useEffect(() => {
        if (!shift) return;

        const updateTimer = () => {
            const now = new Date();
            const [startH, startM] = shift.startTime.split(':').map(Number);
            const [endH, endM] = shift.endTime.split(':').map(Number);

            let startDate = new Date(now);
            startDate.setHours(startH, startM, 0, 0);

            let endDate = new Date(now);
            endDate.setHours(endH, endM, 0, 0);

            if (endH < startH || (endH === startH && endM <= startM)) {
                if (now.getHours() < endH || (now.getHours() === endH && now.getMinutes() < endM)) {
                    startDate.setDate(startDate.getDate() - 1);
                } else {
                    endDate.setDate(endDate.getDate() + 1);
                }
            }

            const remainingMs = endDate.getTime() - now.getTime();

            if (remainingMs <= 0) {
                setShiftTimeRemaining("0h 0m 0s");
                setTimeout(() => {
                    alert("Your shift has ended. You have been automatically logged out.");
                    logout();
                }, 100);
            } else {
                const h = Math.floor(remainingMs / 3600000);
                const m = Math.floor((remainingMs % 3600000) / 60000);
                const s = Math.floor((remainingMs % 60000) / 1000);
                setShiftTimeRemaining(`${h}h ${m}m ${s}s`);
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [shift]);

    const latestData = liveData.length > 0 ? liveData[0] : null;

    const getDataAge = () => {
        if (!latestData) return 0;
        const dataTime = new Date(latestData.time_tag).getTime();
        const ageMs = currentTime.getTime() - dataTime;
        return Math.floor(ageMs / 1000);
    };

    function handleLogAnomaly(anomaly: AnomalyData) {
        const anomalyPayload = {
            time_tag: anomaly.time_tag,
            flux: anomaly.flux,
            classification: anomaly.classification,
            electron_contaminaton: anomaly.electron_contaminaton,
        };

        removeAnomaly(anomaly.time_tag);

        navigate("/operator/log-anomaly", {
            state: anomalyPayload
        });
    }

    return (
        <div className="max-w-6xl mx-auto mt-12 p-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Operator Dashboard</h2>
                    <p className="text-slate-400 mt-2">Live NOAA Telemetry & Anomaly Detection</p>
                </div>
                {shiftTimeRemaining && (
                    <div className="bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg text-slate-300 text-sm font-mono flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Shift Ends In: <span className="text-white font-bold">{shiftTimeRemaining}</span>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {hasUnreadInstructions && (
                <div className="bg-blue-900/20 border border-blue-600/50 rounded-xl p-6 shadow-lg shadow-blue-900/20 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                        <div>
                            <h3 className="text-xl font-bold text-blue-400 mb-1">
                                New Instruction Received
                            </h3>
                            <p className="text-blue-300/80 text-sm">
                                A supervisor has assigned a new instruction. Please review it immediately.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/operator/view-instructions")}
                        className="w-full sm:w-auto cursor-pointer whitespace-nowrap bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors"
                    >
                        View Instructions
                    </button>
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
                            <p className="text-yellow-400 mt-1 text-xs">Data age: {getDataAge()}s</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 lg:col-span-2 text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Primary Flux</p>
                            <p className="text-blue-400 font-bold text-xl">{latestData.flux ? Number(latestData.flux).toExponential(2) : "N/A"}</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Observed Flux</p>
                            <p className="text-slate-300 font-medium">{latestData.observed_flux ? Number(latestData.observed_flux).toExponential(2) : "N/A"}</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Electron Correction</p>
                            <p className="text-slate-300 font-medium">{latestData.electron_correction ? Number(latestData.electron_correction).toExponential(2) : "N/A"}</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Satellite ID</p>
                            <p className="text-slate-200 font-medium">{latestData.satellite || "N/A"}</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Energy Band</p>
                            <p className="text-slate-200 font-medium">{latestData.energy || "N/A"}</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Electron Contamination</p>
                            <p className={`font-bold ${latestData.electron_contaminaton ? 'text-red-400' : 'text-emerald-400'}`}>
                                {latestData.electron_contaminaton ? "CONTAMINATED" : "CLEAN"}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                !error && (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center text-slate-400 mb-8">
                        Awaiting live telemetry stream...
                    </div>
                )
            )}

            {anomalyData.map((anomaly) => (
                <div key={anomaly.time_tag} className="bg-red-900/20 border border-red-600/50 rounded-xl p-6 shadow-lg shadow-red-900/20 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-red-500 mb-2">
                            Critical {anomaly.classification} Detected
                        </h3>
                        <p className="text-red-400/80 text-sm">
                            Telemetry recorded a flux level of {anomaly.flux ? Number(anomaly.flux).toExponential(2) : "N/A"} at {new Date(anomaly.time_tag).toLocaleTimeString()}. This requires immediate logging.
                        </p>
                    </div>

                    <button
                        onClick={() => handleLogAnomaly(anomaly)}
                        className="w-full sm:w-auto cursor-pointer whitespace-nowrap bg-red-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-red-600/30 hover:bg-red-700 transition-colors"
                    >
                        Log Anomaly
                    </button>
                </div>
            ))}
        </div>
    );
}