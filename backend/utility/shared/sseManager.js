let clients = [];

const analystAlertMemory = new Map();
const supervisorAlertMemory = new Map();

export function addClient(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    const company = req.user.company;
    const companyKey = company?.toString();
    const role = req.user.role;

    const newClient = { id: clientId, res, company, role };
    clients.push(newClient);

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Stream Active' })}\n\n`);

    const isSupervisor = req.originalUrl.includes('supervisor');
    const isAnalyst = req.originalUrl.includes('analyst');

    if (isSupervisor && supervisorAlertMemory.has(companyKey)) {
        res.write(`data: ${JSON.stringify(supervisorAlertMemory.get(companyKey))}\n\n`);
    } else if (isAnalyst && analystAlertMemory.has(companyKey)) {
        res.write(`data: ${JSON.stringify(analystAlertMemory.get(companyKey))}\n\n`);
    }

    const keepAlive = setInterval(() => {
        res.write(':\n\n');
    }, 30000);

    req.on('close', () => {
        clearInterval(keepAlive);
        clients = clients.filter(client => client.id !== clientId);
    });
}

export function broadcastXClassAlert(anomaly) {
    const companyKey = anomaly.company?.toString();

    const payload = {
        type: 'X_CLASS_FLARE_ALERT',
        message: 'EMERGENCY: X-Class Flare detected. Supervisor acknowledgment bypassed.',
        anomalyId: anomaly._id,
        classification: anomaly.classification,
        flux: anomaly.flux,
        company: anomaly.company
    };

    if (companyKey) {
        analystAlertMemory.set(companyKey, payload);
        supervisorAlertMemory.set(companyKey, payload);
    }

    clients.forEach(client => {
        if (client.company?.toString() === companyKey) {
            client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
        }
    });
}

export function clearXClassAlert(req, res) {
    const companyKey = req.user.company?.toString();
    const isSupervisor = req.originalUrl.includes('supervisor');
    const isAnalyst = req.originalUrl.includes('analyst');

    if (companyKey) {
        if (isSupervisor) {
            supervisorAlertMemory.delete(companyKey);
        }
        if (isAnalyst) {
            analystAlertMemory.delete(companyKey);
        }
    }

    return res.status(200).json({ message: 'Alert memory cleared for specific role.' });
}