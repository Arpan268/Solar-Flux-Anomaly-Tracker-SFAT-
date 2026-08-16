import { generateForecast } from './generatePrediction.js';

export async function predictionHandler(req, res){
    try {
        const { startDate, endDate } = req.query;
        const company = req.user.company

        if (!startDate || !endDate) {
            return res.status(400).json({ 
                error: "Please provide both startDate and endDate query parameters." 
            });
        }

        const prediction = await generateForecast(startDate, endDate, company);
        
        if (prediction.status === "error") {
            return res.status(404).json(prediction);
        }

        res.status(200).json(prediction);
        
    } catch (error) {
        console.error('[ERROR] Prediction Handler:', error.message);
        res.status(500).json({ error: "Failed to handle prediction request." });
    }
}