import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import axios from "axios";
import { useAuth } from "../../context/authContext";
import DownloadPdf from "../../components/downloadpdf";

interface MacroMetrics {
    total: number;
    peakFlux: number;
    xClassCount: number;
    mClassCount: number;
    cClassCount: number;
}

export default function MacroAnalysis() {
    const [searchParams] = useSearchParams();
    const hours = searchParams.get("hours") || "24";

    const { auth } = useAuth();
    const navigate = useNavigate();

    const [report, setReport] = useState<string>("");
    const [metrics, setMetrics] = useState<MacroMetrics | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMacroAnalysis() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get(`/api/user/analyst/macro-analysis?hours=${hours}`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                });
                setReport(res.data.report);
                if (res.data.metrics) setMetrics(res.data.metrics);
            } catch (err) {
                setError("Failed to generate AI macro-analysis report.");
            } finally {
                setLoading(false);
            }
        }
        fetchMacroAnalysis();
    }, [auth?.accessToken, hours]);

    return (
        <div className="max-w-5xl mx-auto mt-12 p-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Macro Analysis</h2>
                    <p className="text-slate-400 mt-2">Aggregated Gemini evaluation for the last <strong className="text-purple-400">{Number(hours) > 36 ? '36' : `${hours}`} Hours</strong>.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/analyst/view-anomalies')}
                        className="bg-gray-700 hover:bg-gray-600 cursor-pointer text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Back
                    </button>
                    {report && <DownloadPdf title={`Macro-Analysis Report (${hours} Hours)`} content={report} />}
                </div>
            </div>

            {loading ? (
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-purple-400 font-medium">Gemini AI is analyzing telemetry trends...</p>
                </div>
            ) : error ? (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-6 rounded-xl shadow-lg text-center">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {metrics && (
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Peak Flux</p>
                                <p className="text-blue-400 font-bold text-xl">{metrics.peakFlux.toExponential(2)}</p>
                            </div>
                            <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Events</p>
                                <p className="text-white font-bold text-xl">{metrics.total}</p>
                            </div>
                            <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Class Breakdown</p>
                                <div className="space-y-2 text-sm font-medium">
                                    <div className="flex justify-between text-red-400"><span>X-Class:</span> <span>{metrics.xClassCount}</span></div>
                                    <div className="flex justify-between text-orange-400"><span>M-Class:</span> <span>{metrics.mClassCount}</span></div>
                                    <div className="flex justify-between text-emerald-400"><span>C-Class:</span> <span>{metrics.cClassCount}</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 shadow-2xl lg:col-span-3">
                        <div className="text-slate-300 leading-relaxed">
                            <ReactMarkdown
                                components={{
                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 border-b border-gray-700 pb-2" {...props} />,
                                    p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                                    strong: ({ node, ...props }) => <strong className="font-bold text-blue-400" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 mb-4" {...props} />,
                                    li: ({ node, ...props }) => <li className="text-slate-300" {...props} />
                                }}
                            >
                                {report}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}