import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface HazardRisk {
    normal_conditions: string;
    c_class_risk: string;
    m_class_risk: string;
    x_class_risk: string;
}

interface SinglePrediction {
    predicted_class: string;
    class_index: number;
    hazard_risk_indicators: HazardRisk;
}

interface PredictionResponse {
    status: string;
    total_records_analyzed: number;
    ml_results: SinglePrediction;
    message?: string;
}

export default function GeneratePrediction() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
    const navigate = useNavigate();

    const getFormattedDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const today = getFormattedDate(new Date());

    const handlePredict = async () => {
        if (!startDate || !endDate) {
            setError('Please select both a start and end date.');
            return;
        }

        setLoading(true);
        setError(null);
        setPrediction(null);

        try {
            const response = await axios.get<PredictionResponse>('/api/user/analyst/generate-prediction', {
                params: { startDate, endDate },
                withCredentials: true,
            });

            setPrediction(response.data);
        } catch (err: any) {
            console.error('Prediction Error:', err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to fetch prediction from the ML microservice.'
            );
        } finally {
            setLoading(false);
        }
    };

    const getForecastRisk = (riskType: keyof HazardRisk) => {
        if (!prediction || !prediction.ml_results) return 0;

        const riskString = prediction.ml_results.hazard_risk_indicators[riskType];
        return parseFloat(riskString.replace('%', '')) || 0;
    };

    const renderRiskBar = (label: string, percentage: number, colorClass: string) => (
        <div className="mt-4">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-300">{label} Peak Risk</span>
                <span className="text-sm font-bold text-white">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 border border-slate-700">
                <div
                    className={`h-2.5 rounded-full ${colorClass}`}
                    style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
                ></div>
            </div>
        </div>
    );

    const isInvalidDateRange = new Date(startDate) > new Date(endDate);

    return (
        <div className="w-full p-8 text-white min-h-screen mt-8 px-50">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-wide mb-1">AI Hazard Prediction</h1>
                    <p className="text-slate-400 text-sm">
                        Relative flare-risk estimates for the next <span className="font-bold text-blue-400">24 hours</span> based on the submitted telemetry using the Machine Learning microservice.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-700/40 p-4 rounded-2xl border border-slate-600 shadow-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-300 tracking-wider">FROM:</span>
                        <input
                            type="date"
                            value={startDate}
                            max={today}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-slate-800 text-white text-sm border border-slate-500 rounded-md px-3 py-1.5 focus:outline-none focus:border-cyan-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-300 tracking-wider">TO:</span>
                        <input
                            type="date"
                            value={endDate}
                            max={today}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-slate-800 text-white text-sm border border-slate-500 rounded-md px-3 py-1.5 focus:outline-none focus:border-cyan-400"
                        />
                    </div>
                    <button
                        onClick={handlePredict}
                        disabled={loading || isInvalidDateRange}
                        className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 cursor-pointer text-white text-sm font-bold px-5 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {loading ? 'Predicting...' : 'AI Prediction'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-6">
                    <p className="font-semibold">Analysis Failed</p>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
            )}

            {prediction && prediction.status === 'success' && (
                <div className="space-y-6">

                    <div className="bg-slate-700/40 border border-slate-600 rounded-2xl p-6 shadow-lg">
                        <h2 className="text-lg font-bold text-cyan-400 mb-2">Telemetry Processed</h2>
                        <p className="text-slate-300 text-sm">
                            Successfully pulled and analyzed <span className="text-white font-bold">{prediction.total_records_analyzed}</span> telemetry records from the database for this interval. Displaying peak risk probabilities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="bg-slate-700/40 border border-slate-600 rounded-2xl p-6 shadow-lg flex flex-col justify-center">
                            <h3 className="text-xl font-bold text-white mb-1">C-Class Flare</h3>
                            <p className="text-xs text-slate-400 mb-4">Minor structural anomalies. Low impact.</p>
                            {renderRiskBar('C-Class', getForecastRisk('c_class_risk'), 'bg-green-400')}
                        </div>

                        <div className="bg-slate-700/40 border border-slate-600 rounded-2xl p-6 shadow-lg flex flex-col justify-center">
                            <h3 className="text-xl font-bold text-white mb-1">M-Class Flare</h3>
                            <p className="text-xs text-slate-400 mb-4">Moderate telemetry disruption possible.</p>
                            {renderRiskBar('M-Class', getForecastRisk('m_class_risk'), 'bg-amber-500')}
                        </div>

                        <div className="bg-slate-700/40 border border-slate-600 rounded-2xl p-6 shadow-lg flex flex-col justify-center">
                            <h3 className="text-xl font-bold text-white mb-1">X-Class Flare</h3>
                            <p className="text-xs text-slate-400 mb-4">Severe hazard. Immediate operator attention required.</p>
                            {renderRiskBar('X-Class', getForecastRisk('x_class_risk'), 'bg-red-500')}
                        </div>

                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => {
                                navigate('/analyst/create-advisory', {
                                    state: {
                                        cclass: getForecastRisk('c_class_risk'),
                                        mclass: getForecastRisk('m_class_risk'),
                                        xclass: getForecastRisk('x_class_risk'),
                                    },
                                });
                            }}
                            className="flex items-center cursor-pointer gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold py-2.5 px-6 rounded-lg shadow-md border border-indigo-400/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            Create Advisory
                        </button>
                    </div>

                    <div className="mt-4 bg-slate-800/60 border-l-4 border-indigo-500 rounded-r-xl p-5 shadow-md">
                        <div className="flex items-start">
                            <svg className="w-6 h-6 text-indigo-400 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <h4 className="text-sm font-bold text-slate-200 mb-1">Operational Model Advisory</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    This predictive engine serves as an advanced decision-support tool designed to augment analyst capabilities. The underlying XGBoost model achieves 90.7% overall accuracy on historical test data and demonstrates an 83.4% recall for X-Class flares, successfully identifying approximately 4 out of every 5 actual X-Class events. Due to the highly volatile nature of solar magnetic fields, short-term predictions may not achieve absolute certainty, and the model is designed to prioritize the early identification of potentially significant flare activity.
                                </p>
                                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                                    The displayed class scores represent relative flare-risk estimates for the next 24 hours based on the submitted telemetry. As the model uses multiclass classification, higher-intensity flare signals may receive greater model confidence while comparatively reducing the scores assigned to lower-intensity classes. These scores should therefore be interpreted as model-based risk indicators rather than independent probabilities or definitive forecasts.
                                </p>
                                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                                    Due to the model's emphasis on detecting potentially severe events, elevated X-Class risk indications may occasionally result in false positives. Analysts should use such indications as an early-warning signal, verify them against current telemetry and satellite observations, and adjust monitoring or operational procedures accordingly.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {!prediction && !loading && !error && (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <svg className="w-16 h-16 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                    </svg>
                    <p className="text-lg font-medium text-slate-300">Awaiting Input Parameters</p>
                    <p className="text-sm text-slate-400">Select a date range to query the predictive model.</p>
                </div>
            )}
        </div>
    );
}