import { criticalEvent } from "../../events/addEvents.js";

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

    if (process.env.DATA_SOURCE === 'mock') {
        if (classification !== 'Normal') {
            criticalEvent.emit('critical-event', { time_tag: data.time_tag, flux: data.flux, classification });
        }

    } else {

        if (classification !== 'Normal' && classification !== currentFlareClass) {
            currentFlareClass = classification;
            criticalEvent.emit('critical-event', { time_tag: data.time_tag, flux: data.flux, classification });
        } else if (classification === 'Normal' && currentFlareClass !== 'Normal') {
            currentFlareClass = 'Normal';
        }

    }
}