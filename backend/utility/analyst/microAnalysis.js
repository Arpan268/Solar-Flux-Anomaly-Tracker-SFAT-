import Anomaly from '../../models/anomalies.js';
import { generateAIReport } from '../../services/geminiSetup.js';

export async function microAnalysis(req, res) {
    try {
        const { id } = req.params;
        const anomaly = await Anomaly.findById(id);

        if (!anomaly) {
            return res.status(404).json({ message: "Anomaly not found." });
        }

        if (!anomaly.analysis) {
            const prompt = `
        Act as an expert Space Weather Analyst and Solar Physicist.
        Analyze the following individual solar flare anomaly data and generate a professional, structured micro-analysis report.

        Anomaly Details:
        - Classification: ${anomaly.classification}
        - Peak Flux Level: ${anomaly.flux.toExponential(2)} W/m²
        - Time Tag (UTC): ${anomaly.time_tag}
        - Electron Contamination: ${anomaly.electron_contaminaton ? 'Contaminated' : 'Clean'}

        Please provide the report in a professional, enterprise-grade format using Markdown. Do not use conversational filler. Use the following structure:
        ## 1. Executive Summary
        A brief overview of the event and its severity.
        ## 2. Impact Analysis
        The potential localized effects on satellite communications, GPS, power grids, and high-frequency radio.
        ## 3. Recommended Next Steps
        Actionable mitigation strategies for operators and satellite controllers.
        ## 4. Scientific Context
        A brief explanation of what this specific flare classification signifies.
        `;

            const aiReport = await generateAIReport(prompt);

            anomaly.analysis = aiReport;

            await anomaly.save();

            return res.status(200).json({
                success: true,
                anomalyId: anomaly._id,
                report: aiReport
            });
        }

        else {
            return res.status(200).json({
                success: true,
                anomalyId: anomaly._id,
                report: anomaly.analysis
            });
        }

    } catch (error) {
        console.error("Error in micro analysis:", error);
        res.status(500).json({ message: "Server error during micro analysis generation." });
    }
};