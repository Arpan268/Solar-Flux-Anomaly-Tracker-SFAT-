import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

interface RawChartData {
    time_tag: string;
    flux: number;
    observed_flux: number;
    electron_correction: number;
}

interface ProcessedChartData {
    formattedTime: string;
    flux: number;
    observed_flux: number;
    electron_correction: number;
    movingAverage: number;
}

export default function AnalystViewGraphs() {
    const { auth } = useAuth();
    const [data, setData] = useState<ProcessedChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [timeValue, setTimeValue] = useState<number>(24);
    const [timeUnit, setTimeUnit] = useState<string>("hours");

    const formatSci = (tickItem: number) => {
        if (tickItem === 0) return "0";
        return tickItem.toExponential(2);
    };

    const fetchChartData = async () => {
        if (!auth?.accessToken) return;
        setLoading(true);
        try {
            const res = await axios.get("/api/user/analyst/view-diagrams", {
                params: { value: timeValue, unit: timeUnit, limit: 1000 },
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                withCredentials: true,
            });

            const rawData: RawChartData[] = res.data;

            const processed = rawData.map((curr, index, arr) => {
                const windowSlice = arr.slice(Math.max(0, index - 4), index + 1);
                const avg = windowSlice.reduce((sum, d) => sum + d.flux, 0) / windowSlice.length;

                return {
                    ...curr,
                    formattedTime: new Date(curr.time_tag).toLocaleString([], {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    }),
                    movingAverage: Number(avg.toFixed(10))
                };
            });

            setData(processed);
            setError(null);
        } catch (err) {
            setError("Failed to load telemetry diagram data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, [auth]);

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Telemetry Analytics</h2>
                    <p className="text-slate-400 mt-2">Visual analysis of solar flux behavior and corrections.</p>
                </div>

                <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700 flex flex-wrap items-center gap-3 shadow-lg">
                    <span className="text-slate-300 font-medium text-sm">Analyze past:</span>
                    <input
                        type="number"
                        min="1"
                        value={timeValue}
                        onChange={(e) => setTimeValue(Number(e.target.value))}
                        className="w-20 bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <select
                        value={timeUnit}
                        onChange={(e) => setTimeUnit(e.target.value)}
                        className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                    </select>
                    <button
                        onClick={fetchChartData}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm cursor-pointer shadow-lg"
                    >
                        Apply Filter
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 shadow-lg">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64 bg-gray-900 rounded-xl border border-gray-700">
                    <p className="text-slate-400 font-medium animate-pulse">Processing visualization data...</p>
                </div>
            ) : data.length > 0 ? (
                <div className="space-y-8">

                    <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-6">Correction Delta (Final vs Observed)</h3>
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data} margin={{ top: 5, right: 30, bottom: 25, left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="formattedTime" stroke="#9ca3af" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                                    <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={formatSci} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line type="monotone" dataKey="flux" name="Final Flux" stroke="#34d399" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="observed_flux" name="Observed Flux" stroke="#fbbf24" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-6">Electron Contamination Profile</h3>
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 5, right: 30, bottom: 25, left: 10 }}>
                                    <defs>
                                        <linearGradient id="colorCorrection" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="formattedTime" stroke="#9ca3af" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                                    <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={formatSci} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area type="monotone" dataKey="electron_correction" name="Correction Applied" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCorrection)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-6">Statistical Trend (5-Point Moving Avg)</h3>
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data} margin={{ top: 5, right: 30, bottom: 25, left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="formattedTime" stroke="#9ca3af" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                                    <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={formatSci} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="flux" name="Final Flux" barSize={15} fill="#4b5563" radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="movingAverage" name="Moving Average" stroke="#ef4444" strokeWidth={3} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="flex justify-center items-center h-64 bg-gray-900 rounded-xl border border-gray-700">
                    <p className="text-slate-500 font-medium">No diagram data available for this time range.</p>
                </div>
            )}
        </div>
    );
}