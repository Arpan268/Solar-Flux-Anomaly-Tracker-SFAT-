import { criticalEvent } from "../../events/addEvents.js";

const companyFlareState = new Map();

export async function getAnomaly(data, company) {
    let classification = 'Normal';
    const companyKey = company?.toString();
    const currentFlareClass = companyFlareState.get(companyKey) || 'Normal';

    if (data.flux >= 1e-4) {
        classification = 'X-Class Flare';
    } else if (data.flux >= 1e-5) {
        classification = 'M-Class Flare';
    } else if (data.flux >= 1e-6) {
        classification = 'C-Class Flare';
    }

    if (process.env.DATA_SOURCE === 'mock') {
        if (classification !== 'Normal') {
            criticalEvent.emit('critical-event', {
                time_tag: data.time_tag,
                flux: data.flux,
                classification,
                company
            });
        }
    } else {
        if (classification !== 'Normal' && classification !== currentFlareClass) {
            companyFlareState.set(companyKey, classification);
            criticalEvent.emit('critical-event', {
                time_tag: data.time_tag,
                flux: data.flux,
                classification,
                company
            });
        } else if (classification === 'Normal' && currentFlareClass !== 'Normal') {
            companyFlareState.set(companyKey, 'Normal');
        }
    }
}