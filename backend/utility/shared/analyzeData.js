import LiveData from '../../models/liveData.js';
import Anomaly from '../../models/anomalies.js';

export async function analyzeData(req, res) {
    try {
        const currentSource = process.env.DATA_SOURCE || 'live';
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const recentAnomalies = await Anomaly.find({
            source: currentSource,
            time_tag: { $gte: twentyFourHoursAgo }
        });

        const peakReading = await LiveData.findOne({
            source: currentSource,
            time_tag: { $gte: twentyFourHoursAgo }
        }).sort({ flux: -1 });

        const totalAnomalies = recentAnomalies.length;
        const peakFlux = peakReading ? peakReading.flux : 0;

        const breakdown = {
            cClass: 0,
            mClass: 0,
            xClass: 0
        };

        let maxSeverity = 'Normal';
        let currentMaxLevel = 0;
        const severityHierarchy = {
            'Normal': 0,
            'C-Class Flare': 1,
            'M-Class Flare': 2,
            'X-Class Flare': 3
        };

        recentAnomalies.forEach(anomaly => {
            if (anomaly.classification === 'C-Class Flare') breakdown.cClass++;
            if (anomaly.classification === 'M-Class Flare') breakdown.mClass++;
            if (anomaly.classification === 'X-Class Flare') breakdown.xClass++;

            const level = severityHierarchy[anomaly.classification] || 0;
            if (level > currentMaxLevel) {
                currentMaxLevel = level;
                maxSeverity = anomaly.classification;
            }
        });

        res.status(200).json({
            timeframe: '24h',
            dataSource: currentSource,
            summary: {
                totalAnomalies,
                peakFlux,
                maxSeverity,
                breakdown
            }
        });

    } catch (error) {
        console.error('Error generating 24-hour analysis summary:', error);
        res.status(500).json({ error: 'Server error while analyzing telemetry data' });
    }
}