import express from 'express'
import { viewLiveData } from '../utility/analyst/viewLivedata.js'
import { viewAnomalies } from '../utility/analyst/viewAnomalies.js'
import { downloadData } from '../utility/analyst/downloadData.js'
import { viewDiagrams } from '../utility/analyst/viewDiagrams.js'

const router = express.Router()

router.get('/view-livedata', viewLiveData)
router.get('/view-anomalies', viewAnomalies)
router.get('/download-data', downloadData)
router.get('/view-diagrams', viewDiagrams)

export default router