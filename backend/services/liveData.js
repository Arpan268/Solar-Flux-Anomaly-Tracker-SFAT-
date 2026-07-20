export async function liveData() {
    try {
        const response = await fetch('https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json')
        const data = await response.json()

        const latestData = data[data.length - 1]

        return latestData
    }

    catch (err) {
        console.error('Error fetching from NOAA: ', err)
        return null
    }
}