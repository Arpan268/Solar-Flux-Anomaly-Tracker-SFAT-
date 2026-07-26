import LiveData from "../models/liveData.js"
import mockData from "../data/mockData.json" with { type: "json" }

export async function liveData() {
    if (process.env.DATA_SOURCE === 'live') {
        try {
            const response = await fetch('https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json')
            const data = await response.json()

            const latestData = data[data.length - 1]

            await LiveData.findOneAndUpdate(
                {
                    time_tag: latestData.time_tag,
                    energy: latestData.energy,
                    source: process.env.DATA_SOURCE
                },
                {
                    $setOnInsert: {
                        time_tag: latestData.time_tag,
                        satellite: latestData.satellite,
                        flux: latestData.flux,
                        observed_flux: latestData.observed_flux,
                        electron_correction: latestData.electron_correction,
                        electron_contaminaton: latestData.electron_contaminaton,
                        energy: latestData.energy,
                        source: process.env.DATA_SOURCE
                    }
                },
                {
                    upsert: true,
                    returnDocument: 'after'
                }
            )

            return latestData
        }
        catch (err) {
            console.error('Error fetching from NOAA: ', err)
            return null
        }
    }
    else if (process.env.DATA_SOURCE === 'mock') {
        try {
            const currentTime = new Date().toISOString().split('.')[0] + 'Z'
            const randomIndex = Math.floor(Math.random() * mockData.length)
            const mockDataEntry = mockData[randomIndex]

            const newMockRecord = await LiveData.findOneAndUpdate(
                {
                    time_tag: currentTime,
                    energy: mockDataEntry.energy,
                    source: process.env.DATA_SOURCE
                },
                {
                    $setOnInsert: {
                        time_tag: currentTime,
                        satellite: mockDataEntry.satellite,
                        flux: mockDataEntry.flux,
                        observed_flux: mockDataEntry.observed_flux,
                        electron_correction: mockDataEntry.electron_correction,
                        electron_contaminaton: mockDataEntry.electron_contaminaton,
                        energy: mockDataEntry.energy,
                        source: process.env.DATA_SOURCE
                    }
                },
                {
                    upsert: true,
                    returnDocument: 'after'
                }
            )

            return newMockRecord
        }
        catch (err) {
            console.error('Error fetching Mock data: ', err)
            return null
        }
    }
}