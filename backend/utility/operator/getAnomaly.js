import { criticalEvent } from "../events/addEvents.js";

export async function getAnomaly(data) {
    const isAnomaly = data.flux >= 1e-5
    let classification = 'Normal'

    if (data.flux >= 1e-4) {
        classification = 'X-Class Flare'
    }
    else if (data.flux >= 1e-5) {
        classification = 'M-Class Flare'
    }
    else if (data.flux >= 1e-6) {
        classification = 'C-Class Flare'
    }

    if (isAnomaly) {
        criticalEvent.emit('critical-event', { ...data, classification })
    }
}