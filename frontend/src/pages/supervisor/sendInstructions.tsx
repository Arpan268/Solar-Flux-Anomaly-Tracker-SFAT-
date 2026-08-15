import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import ViewInstructions from "./viewInstructions";

interface Operator {
    userId: string;
    username: string;
}

interface AdvisoryState {
    advisoryId: string;
    advisoryType?: 'Prediction' | 'Anomaly';
    classification?: string;
    cclass?: number;
    mclass?: number;
    xclass?: number;
    message: string;
}

export default function SendInstructions() {
    const { auth } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const advisoryState = location.state as AdvisoryState | null;

    const [operators, setOperators] = useState<Operator[]>([]);
    const [targetOperator, setTargetOperator] = useState<string>("All");
    const [message, setMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [refreshHistory, setRefreshHistory] = useState<number>(0);

    useEffect(() => {
        async function fetchOperators() {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get("/api/user/supervisor/view-operators", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                });
                setOperators(res.data.users || []);
            } catch (err) {
                console.error("Failed to fetch operators", err);
            }
        }
        fetchOperators();
    }, [auth]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!message.trim()) return;
        if (!auth?.accessToken) return;

        setIsSubmitting(true);
        setStatusMsg(null);

        try {
            await axios.post(
                "/api/user/supervisor/send-instruction",
                {
                    targetOperator,
                    message,
                    advisoryId: advisoryState?.advisoryId,
                },
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    withCredentials: true,
                }
            );

            setStatusMsg({ type: "success", text: "Instruction sent successfully." });
            setMessage("");
            setRefreshHistory((prev) => prev + 1);

            if (advisoryState) {
                setTimeout(() => {
                    navigate("/supervisor/view-advisories", { replace: true });
                }, 2000);
            } else {
                setTimeout(() => setStatusMsg(null), 3000);
            }
        } catch (err) {
            setStatusMsg({ type: "error", text: "Failed to send instruction. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto mt-12 p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Command Center</h2>
                <p className="text-slate-400 mt-2">Broadcast orders or message operators directly.</p>
            </div>

            <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-6 mb-12">
                {/* Linked Advisory Snapshot */}
                {advisoryState && (
                    <div className="mb-8 bg-slate-800/50 border border-indigo-500/30 rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                                Advisory Reference
                            </h3>
                        </div>

                        {/* Threat Profile Tags */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            {advisoryState.cclass !== undefined ? (
                                <>
                                    <span className="bg-gray-900 px-3 py-1.5 rounded border border-gray-700 text-xs text-slate-300">
                                        C-Class: <strong className="text-green-400">{advisoryState.cclass}%</strong>
                                    </span>
                                    <span className="bg-gray-900 px-3 py-1.5 rounded border border-gray-700 text-xs text-slate-300">
                                        M-Class: <strong className="text-amber-500">{advisoryState.mclass}%</strong>
                                    </span>
                                    <span className="bg-gray-900 px-3 py-1.5 rounded border border-gray-700 text-xs text-slate-300">
                                        X-Class: <strong className="text-red-500">{advisoryState.xclass}%</strong>
                                    </span>
                                </>
                            ) : (
                                <span className="bg-red-900/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded text-xs font-semibold">
                                    {advisoryState.classification || 'Flare Anomaly Incident'}
                                </span>
                            )}
                        </div>

                        {/* Analyst Note Body */}
                        <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                Analyst Note
                            </span>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{advisoryState.message}</p>
                        </div>
                    </div>
                )}

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {statusMsg && (
                        <div
                            className={`p-4 rounded-lg border text-sm font-semibold ${statusMsg.type === "success"
                                    ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-400"
                                    : "bg-red-900/30 border-red-500/50 text-red-400"
                                }`}
                        >
                            {statusMsg.text}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Select Target Operator
                        </label>
                        <select
                            value={targetOperator}
                            onChange={(e) => setTargetOperator(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="All">Broadcast to ALL Operators</option>
                            {operators.map((op) => (
                                <option key={op.userId} value={op.userId}>
                                    {op.userId} - {op.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Instruction Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            placeholder="Enter orders or telemetry focus parameters..."
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                            required
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-3 rounded-lg cursor-pointer font-bold transition-colors ${isSubmitting
                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-500 text-white"
                                }`}
                        >
                            {isSubmitting ? "Sending..." : "Transmit Instruction"}
                        </button>
                    </div>
                </form>
            </div>

            <h3 className="text-xl font-bold text-white mb-4">Transmission History</h3>
            <ViewInstructions refreshTrigger={refreshHistory} />
        </div>
    );
}