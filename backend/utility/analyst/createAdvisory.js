import { criticalEvent } from '../../events/addEvents.js';
import Advisory from '../../models/advisories.js';

export async function createPredictionAdvisory(req, res) {
    try {
        const company = req.user.company;
        const { cclass, mclass, xclass, message } = req.body;
        const analystId = req.user.userId;

        const newAdvisory = new Advisory({
            cclass,
            mclass,
            xclass,
            message,
            company,
            analystId,
            advisoryType: 'Prediction',
            source: process.env.DATA_SOURCE
        });

        await newAdvisory.save();

        criticalEvent.emit('advisory', newAdvisory);

        res.status(201).json(newAdvisory);
    } catch (error) {
        console.error('Error creating advisory:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function createAnomalyAdvisory(req, res) {
    try {
        const company = req.user.company;
        const { flareDetails, message } = req.body;
        const analystId = req.user.userId;

        const newAdvisory = new Advisory({
            flareDetails,
            message,
            company,
            analystId,
            advisoryType: 'Anomaly',
            source: process.env.DATA_SOURCE
        });

        await newAdvisory.save();

        criticalEvent.emit('advisory', newAdvisory);

        res.status(201).json(newAdvisory);
    } catch (error) {
        console.error('Error creating advisory:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}