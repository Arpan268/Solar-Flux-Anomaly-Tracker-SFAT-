let clients = [];

let analystAlertMemory = null;
let supervisorAlertMemory = null;

export function addClient(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };

    clients.push(newClient);
    console.log(`📡 New dashboard connected to SSE. Total clients: ${clients.length}`);

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Stream Active' })}\n\n`);

    const isSupervisor = req.originalUrl.includes('supervisor');
    const isAnalyst = req.originalUrl.includes('analyst');

    if (isSupervisor && supervisorAlertMemory) {
        res.write(`data: ${JSON.stringify(supervisorAlertMemory)}\n\n`);
    } else if (isAnalyst && analystAlertMemory) {
        res.write(`data: ${JSON.stringify(analystAlertMemory)}\n\n`);
    }

    const keepAlive = setInterval(function () {
        res.write(':\n\n');
    }, 30000);

    req.on('close', function () {
        clearInterval(keepAlive);
        clients = clients.filter(function (client) {
            return client.id !== clientId;
        });
        console.log(`🔌 Dashboard disconnected. Total clients: ${clients.length}`);
    });
}

export function broadcastXClassAlert(anomaly) {
    const payload = {
        type: 'X_CLASS_FLARE_ALERT',
        message: 'EMERGENCY: X-Class Flare detected. Supervisor acknowledgment bypassed.',
        anomalyId: anomaly._id,
        classification: anomaly.classification,
        flux: anomaly.flux
    };

    analystAlertMemory = payload;
    supervisorAlertMemory = payload;

    clients.forEach(function (client) {
        client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    });

    console.log(`🚀 Real-time X-Class alert broadcasted to ${clients.length} active dashboards.`);
}

export function clearXClassAlert(req, res) {
    const isSupervisor = req.originalUrl.includes('supervisor');
    const isAnalyst = req.originalUrl.includes('analyst');

    if (isSupervisor) {
        supervisorAlertMemory = null;
        console.log('✅ Supervisor acknowledged the X-Class alert. (Analyst alert remains active)');
    }

    if (isAnalyst) {
        analystAlertMemory = null;
        console.log('✅ Analyst reviewed the X-Class alert. (Supervisor alert remains active)');
    }

    return res.status(200).json({ message: 'Alert memory cleared for specific role.' });
}