import LiveData from '../../models/liveData.js'; 
import { predictSolarFlares } from '../../services/mlPredictionService.js';

export async function generateForecast(startDate, endDate, company) {
    try {
        const telemetryRecords = await LiveData.find({
            time_tag: { 
                $gte: startDate + "T00:00:00.000Z",
                $lte: endDate + "T23:59:59.999Z"
            },
            source: process.env.DATA_SOURCE || 'live',
            company: company
        }).sort({ time_tag: 1 });

        if (!telemetryRecords || telemetryRecords.length === 0) {
            return { status: "error", message: "No telemetry data found for this date range." };
        }

        const latestRecord = telemetryRecords[telemetryRecords.length - 1];
        const currentFlux = latestRecord.flux || latestRecord.observed_flux || 0.0;
        const currentTime = new Date(latestRecord.time_tag).getTime();

        function getPastFlux(minutesAgo) {
            const targetTime = currentTime - (minutesAgo * 60 * 1000);
            const maxGapTolerance = 60 * 60 * 1000; 
            
            let closestFlux = currentFlux; 
            let minDiff = Infinity;

            for (let j = telemetryRecords.length - 2; j >= 0; j--) {
                const pastTime = new Date(telemetryRecords[j].time_tag).getTime();
                const diff = Math.abs(pastTime - targetTime);

                if (diff < minDiff && diff <= maxGapTolerance) {
                    minDiff = diff;
                    closestFlux = telemetryRecords[j].flux || telemetryRecords[j].observed_flux || 0.0;
                }
            }
            return closestFlux; 
        }

        const forecastingPayload = {
            electron_correction: latestRecord.electron_correction || 0.0,
            electron_contaminaton: latestRecord.electron_contaminaton ? 1 : 0,
            delta_flux_15m: currentFlux - getPastFlux(15),
            delta_flux_30m: currentFlux - getPastFlux(30),
            delta_flux_60m: currentFlux - getPastFlux(60)
        };

        console.log("SENDING PAYLOAD TO ML:", forecastingPayload);
        const mlResponse = await predictSolarFlares(forecastingPayload);

        return {
            status: "success",
            total_records_analyzed: telemetryRecords.length,
            ml_results: mlResponse.result
        };

    } catch (error) {
        console.error('[ERROR] Generate Prediction Utility:', error.message);
        throw new Error('Failed to generate solar flare forecast.');
    }
}