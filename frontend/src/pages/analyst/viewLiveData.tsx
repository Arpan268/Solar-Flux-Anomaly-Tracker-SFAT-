import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";

interface LiveDataRecord {
    _id: string;
    time_tag: string;
    satellite: number;
    energy: string;
    observed_flux: number;
    flux: number;
    electron_contaminaton: boolean;
    electron_correction: number;
}

export default function AnalystViewLiveData() {
    const { auth } = useAuth();

    const getFormattedDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [liveData, setLiveData] = useState<LiveDataRecord[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const today = getFormattedDate(new Date());

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return getFormattedDate(d);
    });

    const [endDate, setEndDate] = useState(() => {
        return getFormattedDate(new Date());
    });

    const isInvalidDateRange = new Date(startDate) > new Date(endDate);

    const formatSciNum = (val: number | undefined | null) => {
        if (val == null) return "-";
        if (val === 0) return "0";
        return val.toExponential(4);
    };

    const shortenId = (id: string) => {
        if (!id) return "-";
        return `${id.slice(0, 6)}...${id.slice(-4)}`;
    };

    useEffect(() => {
        async function fetchLiveData() {
            if (!auth?.accessToken) return;
            setLoading(true);
            try {
                const res = await axios.get(`/api/user/analyst/view-livedata?page=${page}&limit=100`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setLiveData(res.data.liveData);
                setTotalPages(res.data.totalPages);
                setError(null);
            } catch (err) {
                setError("Failed to load live telemetry data.");
            } finally {
                setLoading(false);
            }
        }
        fetchLiveData();
    }, [auth, page]);

    async function handleDownload() {
        if (!auth?.accessToken || isInvalidDateRange) return;
        setDownloading(true);

        try {
            let url = '/api/user/analyst/download-data';

            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                responseType: 'blob',
                withCredentials: true,
            });

            const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', 'solar_flux_data.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                setError("No data available for the selected date range.");
            }
            else {
                setError("Failed to download CSV data.");
            }
        } finally {
            setDownloading(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div className="mb-2 md:mb-0">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Live Telemetry Data</h2>
                    <p className="text-slate-400 mt-2">Raw solar flux readings currently stored in the system.</p>
                </div>

                <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700 shadow-inner flex flex-col gap-3 min-w-[320px]">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CSV Export Range</span>
                        {isInvalidDateRange && (
                            <span className="text-[10px] font-bold text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-800/50">
                                PLEASE ENTER VALID DATES
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-medium text-sm">From:</span>
                        <input
                            type="date"
                            value={startDate}
                            max={today}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-gray-900 text-slate-300 px-3 py-2 rounded-lg border border-gray-600 outline-none focus:border-blue-500 transition-colors cursor-pointer text-sm w-36"
                        />
                        <span className="text-slate-500 font-medium text-sm">to:</span>
                        <input
                            type="date"
                            value={endDate}
                            max={today}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-gray-900 text-slate-300 px-3 py-2 rounded-lg border border-gray-600 outline-none focus:border-blue-500 transition-colors cursor-pointer text-sm w-36"
                        />
                        <button
                            onClick={handleDownload}
                            disabled={downloading || liveData.length === 0 || isInvalidDateRange}
                            className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-bold transition-colors shadow-lg cursor-pointer text-sm ${downloading || liveData.length === 0 || isInvalidDateRange
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20"
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {downloading ? "Exporting..." : "Export"}
                        </button>
                    </div>
                </div>
            </div>

            {(error && error === "No data available for the selected date range.") ? (
                <div className="bg-yellow-900/30 border border-yellow-400/50 text-yellow-300 p-4 rounded-lg mb-6 shadow-lg">
                    {error}
                </div>
            ) : (error && error !== "No data available for the selected date range.") ? (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 shadow-lg">
                    {error}
                </div>
            ) : null}

            <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-800/80 border-b border-gray-700 text-slate-300 uppercase text-xs tracking-wider">
                                <th className="p-4 font-semibold">Record ID</th>
                                <th className="p-4 font-semibold">Time Tag (UTC)</th>
                                <th className="p-4 font-semibold">Satellite</th>
                                <th className="p-4 font-semibold">Energy</th>
                                <th className="p-4 font-semibold">E-Contamination</th>
                                <th className="p-4 font-semibold text-right">E-Correction</th>
                                <th className="p-4 font-semibold text-right">Observed Flux</th>
                                <th className="p-4 font-semibold text-right">Final Flux</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                                        Loading live telemetry data...
                                    </td>
                                </tr>
                            ) : liveData.length > 0 ? (
                                liveData.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-slate-500 font-mono text-xs" title={record._id}>
                                            {shortenId(record._id)}
                                        </td>
                                        <td className="p-4 text-slate-300 font-mono text-sm">
                                            {new Date(record.time_tag).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-slate-300 text-sm">
                                            {record.satellite ?? "-"}
                                        </td>
                                        <td className="p-4 text-slate-300 text-sm">
                                            {record.energy || "-"}
                                        </td>
                                        <td className="p-4 text-slate-300 text-sm">
                                            {record.electron_contaminaton !== undefined ? String(record.electron_contaminaton) : "-"}
                                        </td>
                                        <td className="p-4 text-slate-300 font-mono text-sm">
                                            {formatSciNum(record.electron_correction)}
                                        </td>
                                        <td className="p-4 text-yellow-400 font-bold font-mono text-right text-sm">
                                            {formatSciNum(record.observed_flux)}
                                        </td>
                                        <td className="p-4 text-emerald-400 font-bold font-mono text-right text-sm">
                                            {formatSciNum(record.flux)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                                        No live data available in the database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-between items-center">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Previous
                        </button>
                        <span className="text-slate-400 text-sm">
                            Page <strong className="text-white">{page}</strong> of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}