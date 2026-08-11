const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:8000';

export async function predictSolarFlares(telemetryPayload) {
    try {
        const response = await fetch(`${ML_SERVER_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(telemetryPayload),
        });

        if (!response.ok) {
            throw new Error(`ML Server Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[ERROR] ML Prediction Service:', error.message);
        throw new Error('Failed to communicate with the ML Microservice.');
    }
}