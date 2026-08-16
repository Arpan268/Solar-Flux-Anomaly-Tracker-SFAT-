import Instructions from '../../models/instructions.js';
import User from '../../models/users.js';
import Advisory from '../../models/advisories.js';
import { criticalEvent } from '../../events/addEvents.js';

export async function sendInstructions(req, res) {
    try {
        const { targetOperator, message, advisoryId } = req.body;
        const supervisorId = req.user.userId;

        let isAdvisoryDerived = false;
        let expiresAt = null;

        if (advisoryId) {
            isAdvisoryDerived = true;
            expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        if (targetOperator === 'All') {
            const operators = await User.find({ role: 'Operator', status: 'Approved', company: req.user.company });

            const broadcastData = operators.map(op => ({
                message: message,
                isRead: false,
                supervisorId: supervisorId,
                targetOperatorId: op.userId,
                source: process.env.DATA_SOURCE,
                advisoryId: advisoryId || null,
                isAdvisoryDerived: isAdvisoryDerived,
                expiresAt: expiresAt,
                company: req.user.company
            }));

            await Instructions.insertMany(broadcastData);
            criticalEvent.emit('new_instruction', { targetOperator: 'All' });

        }

        else {
            const instruction = new Instructions({
                message: message,
                isRead: false,
                supervisorId: supervisorId,
                targetOperatorId: targetOperator,
                source: process.env.DATA_SOURCE,
                advisoryId: advisoryId || null,
                isAdvisoryDerived: isAdvisoryDerived,
                expiresAt: expiresAt,
                company: req.user.company
            });

            await instruction.save();
            criticalEvent.emit('new_instruction', { targetOperator: targetOperator });
        }

        if (advisoryId) {
            await Advisory.findOneAndUpdate({_id: advisoryId, company: req.user.company}, {
                acknowledgedBySupervisorId: supervisorId
            }, {new: true});
            criticalEvent.emit('advisory-acknowledged');
        }

        res.status(201).json({ message: 'Instruction processed successfully' });

    } catch (err) {
        console.error('Error saving instruction:', err);
        res.status(500).json({ message: 'Server error' });
    }
}