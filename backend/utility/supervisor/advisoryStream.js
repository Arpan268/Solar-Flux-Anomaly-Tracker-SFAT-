import Advisory from '../../models/advisories.js';

let supervisorClients = [];

export async function advisorySSEHandler(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    supervisorClients.push(res);

    try {
        const pendingCount = await Advisory.countDocuments({
            source: process.env.DATA_SOURCE,
            status: 'Pending'
        });

        res.write(`data: ${JSON.stringify({ type: 'SYNC_PENDING', count: pendingCount })}\n\n`);
    } catch (err) {
        console.error(err);
    }

    req.on('close', () => {
        supervisorClients = supervisorClients.filter(client => client !== res);
    });
}

export function broadcastNewAdvisory() {
    const payload = JSON.stringify({ type: 'NEW_ADVISORY' });
    supervisorClients.forEach(client => client.write(`data: ${payload}\n\n`));
}

export function broadcastAcknowledgedAdvisory() {
    const payload = JSON.stringify({ type: 'ADVISORY_ACKNOWLEDGED' });
    supervisorClients.forEach(client => client.write(`data: ${payload}\n\n`));
}