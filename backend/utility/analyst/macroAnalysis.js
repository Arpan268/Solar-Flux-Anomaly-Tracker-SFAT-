import Anomaly from '../../models/anomalies.js';
import Company from '../../models/companies.js';
import { generateAIReport } from '../../services/geminiSetup.js';

export async function macroAnalysis(req, res) {
    try {
        let hours = parseInt(req.query.hours) || 24;
        if (hours > 36) hours = 36;
        if (hours <= 0) hours = 24;

        const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
        const currentSource = process.env.DATA_SOURCE || 'live';

        const anomalies = await Anomaly.find({
            source: currentSource,
            time_tag: { $gte: timeThreshold },
            isAcknowledged: true,
            company: req.user.company
        });

        if (anomalies.length === 0) {
            return res.status(200).json({
                success: true,
                timeframe: `${hours} hours`,
                report: `## Macro Analysis Complete\nNo acknowledged anomalies were detected in the last ${hours} hours. System operating within normal parameters.`
            });
        }

        const companyDoc = await Company.findById(req.user.company);

        const companyType = companyDoc?.companyType || 'Other';
        const isGeneric = companyType === 'Other';

        let peakFlux = 0;
        let cClassCount = 0;
        let mClassCount = 0;
        let xClassCount = 0;

        anomalies.forEach(a => {
            if (a.flux > peakFlux) peakFlux = a.flux;
            if (a.classification === 'C-Class Flare') cClassCount++;
            if (a.classification === 'M-Class Flare') mClassCount++;
            if (a.classification === 'X-Class Flare') xClassCount++;
        });

        const roleContext = isGeneric
            ? 'Act as an expert Space Weather Analyst and Solar Physicist.'
            : `Act as an expert Space Weather Analyst and Solar Physicist advising a ${companyType} organization.`;

        const taskContext = isGeneric
            ? `You are generating a Macro-Analysis Report for solar flare activity over the last ${hours} hours.`
            : `You are generating a Macro-Analysis Report for solar flare activity over the last ${hours} hours, tailored specifically to the operational needs of the ${companyType} industry.`;

        const impactContext = isGeneric
            ? 'The cumulative effects on global telecommunications, satellite drag, atmospheric ionization, and potential geomagnetic storms.'
            : `The cumulative effects of these events, focusing specifically on global and systemic risks to ${companyType} operations, assets, and telecommunications.`;

        const recsContext = isGeneric
            ? 'Broad, systemic actions for command-and-control to mitigate risks over the next 24-48 hours.'
            : `Broad, systemic actions for command-and-control to mitigate risks over the next 24-48 hours, specifically designed for the ${companyType} sector.`;

        const prompt = `
${roleContext}
${taskContext}

Telemetry Summary:
- Total Acknowledged Anomalies: ${anomalies.length}
- Peak Flux Recorded: ${peakFlux.toExponential(2)} W/m²
- X-Class Flares: ${xClassCount}
- M-Class Flares: ${mClassCount}
- C-Class Flares: ${cClassCount}

Please provide a highly professional, enterprise-grade report using Markdown. Do not use conversational filler. Use the following structure:
## 1. Macro Executive Summary
A high-level overview of the shift's overall solar activity, threat level, and the frequency of the events.
## 2. Aggregate Impact Analysis
${impactContext}
## 3. Trend Analysis & Forecasting
Based on the distribution of X, M, and C class flares, what this cluster of activity indicates for the near future.
## 4. Strategic Recommendations
${recsContext}
    `;

        const aiReport = await generateAIReport(prompt);

        return res.status(200).json({
            success: true,
            timeframe: `${hours} hours`,
            metrics: {
                total: anomalies.length,
                peakFlux,
                xClassCount,
                mClassCount,
                cClassCount
            },
            report: aiReport
        });

    } catch (error) {
        console.error("Error in macro analysis:", error);
        res.status(500).json({ message: "Server error during macro analysis generation." });
    }
}