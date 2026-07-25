import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";

export default function LogAnomaly() {
    const location = useLocation();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [notes, setNotes] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [anomalyData, setAnomalyData] = useState<{
        time_tag: string;
        flux: number;
        classification: string;
        electron_contaminaton: boolean;
    } | null>(null);

    useEffect(() => {
        const stateData = location.state as {
            time_tag: string;
            flux: number;
            classification: string;
            electron_contaminaton: boolean;
        } | null;

        if (stateData) {
            setAnomalyData(stateData);
            return;
        }

        navigate("/operator");
    }, [location.state, navigate]);

    if (!anomalyData) {
        return (
            <div className="max-w-3xl mx-auto mt-12 p-6">
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-6 rounded-xl">
                    <h2 className="text-xl font-bold mb-2">No anomaly data was provided</h2>
                    <p className="mb-4">Return to the operator dashboard and try logging the anomaly again.</p>
                    <button
                        onClick={() => navigate("/operator")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!auth?.accessToken) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await axios.post(
                "/api/user/operator/log-data",
                {
                    time_tag: anomalyData?.time_tag,
                    flux: anomalyData?.flux,
                    classification: anomalyData?.classification,
                    electron_contaminaton: anomalyData?.electron_contaminaton,
                    notes: notes,
                },
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }
            );

            setSuccess(true);
            setTimeout(() => {
                navigate("/operator");
            }, 2000);
        } catch (err) {
            const message = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message
                : "Failed to log anomaly to the database. Please try again.";

            setError(message);
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Log Anomaly Event</h2>
                <p className="text-slate-400 mt-2">Review telemetry data and submit to the supervisor queue.</p>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {success ? (
                <div className="bg-emerald-900/30 border border-emerald-500/50 text-emerald-400 p-6 rounded-xl text-center shadow-lg shadow-emerald-900/20">
                    <h3 className="text-xl font-bold mb-2">Anomaly Logged Successfully</h3>
                    <p>Redirecting back to dashboard...</p>
                </div>
            ) : (
                <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                    Time Tag (UTC)
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={new Date(anomalyData.time_tag).toLocaleString()}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-slate-300 cursor-not-allowed focus:outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                    Classification
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={anomalyData.classification}
                                    className="w-full bg-red-900/20 border border-red-900/50 rounded-lg p-3 text-red-400 font-bold cursor-not-allowed focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                Peak Flux Level
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={anomalyData.flux.toExponential(4)}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-blue-400 font-mono text-lg cursor-not-allowed focus:outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                Operator Notes (Optional)
                            </label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add context, system observations, or related satellite conditions..."
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/operator")}
                                className="flex-1 bg-gray-800 text-slate-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 border border-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                {isSubmitting ? "Submitting..." : "Submit to Database"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}