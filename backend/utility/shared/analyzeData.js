import LiveData from '../../models/liveData.js';
import Anomaly from '../../models/anomalies.js';
import Advisory from '../../models/advisories.js';

export async function analyzeData(req, res) {
    try {
        const currentSource = process.env.DATA_SOURCE || 'live';
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const company = req.user.company;
        const role = req.user.role;

        let recentAnomalies = [];
        let anomalyPendingCount = 0;
        let advisoryPendingCount = 0;
        let advisoryCount = 0;

        if (role === 'Supervisor') {
            recentAnomalies = await Anomaly.find({
                source: currentSource,
                time_tag: { $gte: twentyFourHoursAgo.toISOString() },
                company: company
            });

            advisoryPendingCount = await Advisory.countDocuments({
                source: currentSource,
                createdAt: { $gte: twentyFourHoursAgo },
                advisoryType: 'Prediction',
                acknowledgedBySupervisorId: null,
                company: company
            });

            advisoryCount = await Advisory.countDocuments({
                source: currentSource,
                createdAt: { $gte: twentyFourHoursAgo },
                company: company
            });

            advisoryCount = advisoryCount/2;

        } else if (role === 'Analyst') {
            recentAnomalies = await Anomaly.find({
                source: currentSource,
                time_tag: { $gte: twentyFourHoursAgo.toISOString() },
                isAcknowledged: true,
                company: company
            });

            advisoryPendingCount = await Advisory.countDocuments({
                source: currentSource,
                createdAt: { $gte: twentyFourHoursAgo },
                company: company,
                $or: [
                    { advisoryType: 'Prediction', acknowledgedBySupervisorId: null },
                    { advisoryType: 'Anomaly', acknowledgedByCompanyAdminId: null }
                ]
            });

            advisoryCount = await Advisory.countDocuments({
                source: currentSource,
                createdAt: { $gte: twentyFourHoursAgo },
                company: company
            });

        } else {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        anomalyPendingCount = await Anomaly.countDocuments({
            source: currentSource,
            time_tag: { $gte: twentyFourHoursAgo.toISOString() },
            isAcknowledged: false,
            company: company
        });

        const peakReading = await LiveData.findOne({
            source: currentSource,
            time_tag: { $gte: twentyFourHoursAgo.toISOString() },
            company: company
        }).sort({ flux: -1 });

        const totalAnomalies = recentAnomalies.length;
        const peakFlux = peakReading ? peakReading.flux : 0;
        const breakdown = { cClass: 0, mClass: 0, xClass: 0 };

        const severityHierarchy = {
            'Normal': 0,
            'C-Class Flare': 1,
            'M-Class Flare': 2,
            'X-Class Flare': 3
        };

        let maxSeverity = 'Normal';
        let currentMaxLevel = 0;

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
                breakdown,
                anomalyPendingCount,
                advisoryCount,
                advisoryPendingCount
            }
        });
    } catch (error) {
        console.error('Error generating 24-hour analysis summary:', error);
        res.status(500).json({ error: 'Server error while analyzing telemetry data' });
    }
}