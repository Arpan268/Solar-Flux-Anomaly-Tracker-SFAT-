import Advisory from '../../models/advisories.js';

let supervisorClients = [];

export async function advisorySSEHandler(req, res) {
    res.setHeader('Content-Type', 'text/stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const company = req.user.company;
    const clientObj = { res, company };
    supervisorClients.push(clientObj);

    try {
        const pendingCount = await Advisory.countDocuments({
            source: process.env.DATA_SOURCE,
            advisoryType: 'Prediction',
            acknowledgedBySupervisorId: null,
            company: company
        });

        res.write(`data: ${JSON.stringify({ type: 'SYNC_PENDING', count: pendingCount })}\n\n`);
    } catch (err) {
        console.error(err);
    }

    req.on('close', () => {
        supervisorClients = supervisorClients.filter(client => client !== clientObj);
    });
}

export function broadcastNewAdvisory(advisory) {
    const payload = JSON.stringify({ type: 'NEW_ADVISORY', advisory });
    supervisorClients.forEach(client => {
        if (advisory?.company && client.company.toString() === advisory.company.toString()) {
            client.res.write(`data: ${payload}\n\n`);
        }
    });
}

export function broadcastAcknowledgedAdvisory(advisory) {
    const payload = JSON.stringify({ type: 'ADVISORY_ACKNOWLEDGED', advisory });
    supervisorClients.forEach(client => {
        if (advisory?.company && client.company.toString() === advisory.company.toString()) {
            client.res.write(`data: ${payload}\n\n`);
        }
    });
}