import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import axios from "axios";
import { useAuth } from "../../context/authContext";
import DownloadPdf from "../../components/downloadpdf";

export default function MicroAnalysis() {
    const { id } = useParams<{ id: string }>();
    const { auth } = useAuth();
    const navigate = useNavigate();

    const [report, setReport] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMicroAnalysis() {
            if (!auth?.accessToken || !id) return;
            try {
                const res = await axios.get(`/api/user/analyst/micro-analysis/${id}`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                });
                setReport(res.data.report);
            } catch (err) {
                setError("Failed to generate AI micro-analysis report.");
            } finally {
                setLoading(false);
            }
        }
        fetchMicroAnalysis();
    }, [auth?.accessToken, id]);

    return (
        <div className="max-w-4xl mx-auto mt-12 p-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Micro Analysis</h2>
                    <p className="text-slate-400 mt-2">Targeted Gemini evaluation of isolated solar flare event.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/analyst/view-anomalies')}
                        className="bg-gray-700 hover:bg-gray-600 cursor-pointer text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Back
                    </button>
                    {report && <DownloadPdf title="Solar Flare Micro-Analysis Report" content={report} />}
                </div>
            </div>

            {loading ? (
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-blue-400 font-medium">Gemini AI is generating report...</p>
                </div>
            ) : error ? (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-6 rounded-xl shadow-lg text-center">
                    {error}
                </div>
            ) : (
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 shadow-2xl">
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
            )}
        </div>
    );
}