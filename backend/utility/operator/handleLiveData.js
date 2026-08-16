import { criticalEvent } from "../../events/addEvents.js";
import { liveData } from "../../services/liveData.js";
import { getAnomaly } from "./getAnomaly.js";

export async function handleLiveData(req, res) {
    try {
        const company = req.user.company;
        const role = req.user?.role || req.user?.userRole;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const initialData = await liveData(role, company);
        res.write(`data: ${JSON.stringify(initialData)}\n\n`);

        const alertListener = (alertData) => {
            if (alertData?.company && alertData.company.toString() === company.toString()) {
                res.write(`event: anomaly_alert\ndata: ${JSON.stringify(alertData)}\n\n`);
            }
        };
        criticalEvent.on('critical-event', alertListener);

        const instructionListener = (data) => {
            const currentUserId = req.user?.userId || req.user?.id;

            const isSameCompany = data.company && data.company.toString() === company.toString();

            if ((data.targetOperator === 'All' || data.targetOperator === currentUserId) && isSameCompany) {
                res.write(`event: new_instruction\ndata: {"hasUnread": true}\n\n`);
            }
        };
        criticalEvent.on('new_instruction', instructionListener);

        if (initialData) {
            getAnomaly(initialData, company);
        }

        const intervalId = setInterval(async () => {
            const latestData = await liveData(role, company);

            if (!latestData) {
                console.warn('Skipping interval: No data received from NOAA');
                return;
            }

            try {
                res.write(`data: ${JSON.stringify(latestData)}\n\n`);
                getAnomaly(latestData, company);
            } catch (err) {
                console.error('Error processing anomaly logic', err);
            }
        }, 60000);

        req.on('close', () => {
            clearInterval(intervalId);
            criticalEvent.off('critical-event', alertListener);
            criticalEvent.off('new_instruction', instructionListener);
            res.end();
        });

    } catch (err) {
        console.error('Error establishing live data connection: ', err);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Server error initializing stream' });
        } else {
            res.end();
        }
    }
}