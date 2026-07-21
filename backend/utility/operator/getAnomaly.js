import { criticalEvent } from "../events/addEvents.js";

let currentFlareClass = 'Normal'

export async function getAnomaly(data) {
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

    if (classification !== 'Normal' && classification !== currentFlareClass) {
        currentFlareClass = classification
        criticalEvent.emit('critical-event', { ...data, classification })
    }

    else if (classification === 'Normal' && currentFlareClass !== 'Normal') {
        currentFlareClass = 'Normal'
    }
}