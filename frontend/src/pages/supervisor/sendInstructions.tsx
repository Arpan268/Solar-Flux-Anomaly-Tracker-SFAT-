import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import ViewInstructions from "./viewInstructions";

interface Operator {
    userId: string;
    username: string;
}

export default function SendInstructions() {
    const { auth } = useAuth();
    const [operators, setOperators] = useState<Operator[]>([]);
    const [targetOperator, setTargetOperator] = useState<string>("All");
    const [message, setMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [refreshHistory, setRefreshHistory] = useState(0);

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

        setIsSubmitting(true);
        setStatusMsg(null);

        try {
            await axios.post(
                "/api/user/supervisor/send-instruction",
                { targetOperator, message },
                {
                    headers: { Authorization: `Bearer ${auth?.accessToken}` },
                    withCredentials: true,
                }
            );

            setStatusMsg({ type: "success", text: "Instruction sent successfully." });
            setMessage("");
            setRefreshHistory((prev) => prev + 1);

            setTimeout(() => setStatusMsg(null), 3000);
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
                <form onSubmit={handleSubmit} className="space-y-6">
                    {statusMsg && (
                        <div className={`p-4 rounded-lg border ${statusMsg.type === 'success' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-red-900/30 border-red-500/50 text-red-400'}`}>
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
                            className={`px-6 py-3 rounded-lg cursor-pointer font-bold transition-colors ${isSubmitting ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
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