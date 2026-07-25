import LiveData from "../models/LiveData.js"

export async function liveData() {
    if (process.env.DATA_SOURCE === 'live') {
        try {
            const response = await fetch('https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json')
            const data = await response.json()

            const latestData = data[data.length - 1]

            const newRecord = new LiveData({
                time_tag: latestData.time_tag,
                satellite: latestData.satellite,
                flux: latestData.flux,
                observed_flux: latestData.observed_flux,
                electron_correction: latestData.electron_correction,
                electron_contaminaton: latestData.electron_contaminaton,
                energy: latestData.energy,
                source: process.env.DATA_SOURCE
            })

            await newRecord.save()

            return latestData
        }

        catch (err) {
            console.error('Error fetching from NOAA: ', err)
            return null
        }
    }

    else if (process.env.DATA_SOURCE === 'mock') {
        //mock data logic goes here
    }
}