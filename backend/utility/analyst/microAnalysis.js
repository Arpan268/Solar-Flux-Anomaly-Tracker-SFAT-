import Anomaly from '../../models/anomalies.js';
import Company from '../../models/companies.js';
import { generateAIReport } from '../../services/geminiSetup.js';

export async function microAnalysis(req, res) {
    try {
        const { id } = req.params;

        const anomaly = await Anomaly.findOne({ _id: id, company: req.user.company });
        const companyDoc = await Company.findById(req.user.company);

        if (!anomaly) {
            return res.status(404).json({ message: "Anomaly not found." });
        }

        if (!anomaly.analysis) {
            const companyType = companyDoc?.companyType || 'Other';
            const isGeneric = companyType === 'Other';

            const roleContext = isGeneric
                ? 'Act as an expert Space Weather Analyst and Solar Physicist.'
                : `Act as an expert Space Weather Analyst and Solar Physicist advising a ${companyType} organization.`;

            const taskContext = isGeneric
                ? 'Analyze the following individual solar flare anomaly data and generate a professional, structured micro-analysis report.'
                : `Analyze the following individual solar flare anomaly data and generate a professional, structured micro-analysis report tailored specifically to the ${companyType} industry.`;

            const impactContext = isGeneric
                ? 'The potential localized effects on satellite communications, GPS, power grids, and high-frequency radio.'
                : `The potential localized effects of this anomaly, focusing specifically on how it impacts ${companyType} operations, infrastructure, and communications.`;

            const recsContext = isGeneric
                ? 'Actionable mitigation strategies for operators and satellite controllers.'
                : `Actionable mitigation strategies for operators and controllers within the ${companyType} sector.`;

            const prompt = `
${roleContext}
${taskContext}

Anomaly Details:
- Classification: ${anomaly.classification}
- Peak Flux Level: ${anomaly.flux.toExponential(2)} W/m²
- Time Tag (UTC): ${anomaly.time_tag}
- Electron Contamination: ${anomaly.electron_contaminaton ? 'Contaminated' : 'Clean'}

Please provide the report in a professional, enterprise-grade format using Markdown. Do not use conversational filler. Use the following structure:
## 1. Executive Summary
A brief overview of the event and its severity.
## 2. Impact Analysis
${impactContext}
## 3. Recommended Next Steps
${recsContext}
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
        } else {
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
}