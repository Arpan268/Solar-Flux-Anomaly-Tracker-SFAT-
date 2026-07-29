import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "../context/authContext";

export interface LiveData {
    _id: string;
    time_tag: string;
    satellite: number;
    flux: number;
    observed_flux: number;
    electron_correction: number;
    electron_contaminaton: boolean;
    energy: string;
}

export interface AnomalyData extends LiveData {
    classification: string;
}

interface AnomalyContextType {
    liveData: LiveData[];
    anomalyData: AnomalyData[];
    error: string | null;
    countdown: number;
    currentTime: Date;
    removeAnomaly: (time_tag: string) => void;
}

export const AnomalyContext = createContext<AnomalyContextType | undefined>(undefined);

export function useAnomaly() {
    const context = useContext(AnomalyContext);
    if (!context) {
        throw new Error("useAnomaly must be used within an AnomalyProvider");
    }
    return context;
}

export function AnomalyProvider({ children }: { children: ReactNode }) {
    const { auth } = useAuth();

    const [liveData, setLiveData] = useState<LiveData[]>([]);
    const [anomalyData, setAnomalyData] = useState<AnomalyData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number>(60);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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

            } catch (err) {
                setError("Failed to parse live telemetry stream.");
            }
        };

        eventSource.addEventListener("anomaly_alert", (event) => {
            try {
                const alertData = JSON.parse(event.data);
                const newAnomaly = alertData._doc
                    ? { ...alertData._doc, classification: alertData.classification }
                    : alertData;

                setAnomalyData((prev) => {
                    if (prev.some(a => a.time_tag === newAnomaly.time_tag)) return prev;
                    return [...prev, newAnomaly];
                });
            } catch (err) {
                console.error(err);
            }
        });

        eventSource.addEventListener("new_instruction", () => {
            window.dispatchEvent(new Event("new_instruction_alert"));
        });

        eventSource.onerror = () => {
            setError("Connection to live telemetry lost. Attempting to reconnect...");
        };

        return () => {
            eventSource.close();
        };
    }, [auth]);

    const removeAnomaly = (time_tag: string) => {
        setAnomalyData((prev) => prev.filter(a => a.time_tag !== time_tag));
    };

    return (
        <AnomalyContext.Provider value={{ liveData, anomalyData, error, countdown, currentTime, removeAnomaly }}>
            {children}
        </AnomalyContext.Provider>
    );
}