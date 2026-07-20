import { criticalEvent } from "../../events/addEvents.js"
import { liveData } from "../../services/liveData.js"
import { getAnomaly } from "./getAnomaly.js"

export async function handleLiveData(req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const initialData = await liveData()

    res.write(`data: ${JSON.stringify(initialData)}\n\n`)

    const alertListener = (alertData) => {
        res.write(`event: anomaly_alert\ndata: ${JSON.stringify(alertData)}\n\n`)
    }
    criticalEvent.on('critical-event', alertListener)

    const intervalId = setInterval(() => {
        const latestData = await liveData()
        
        res.write(`data: ${JSON.stringify(latestData)}\n\n`)
        getAnomaly(latestData)
    }, 60000)

    req.on('close', () => {
        clearInterval(intervalId)
        criticalEvent.off('critical-event', alertListener)
        res.end()
    })
}