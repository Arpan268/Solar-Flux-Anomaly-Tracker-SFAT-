import express from 'express'
import { viewLiveData } from '../utility/analyst/viewLiveData.js'
import { viewAnomalies } from '../utility/analyst/viewAnomalies.js'
import { downloadData } from '../utility/analyst/downloadData.js'
import { viewDiagrams } from '../utility/analyst/viewDiagrams.js'
import { handleLiveData } from '../utility/operator/handleLiveData.js'

const router = express.Router()

router.get('/view-livedata', viewLiveData)
router.get('/view-anomalies', viewAnomalies)
router.get('/download-data', downloadData)
router.get('/view-diagrams', viewDiagrams)
router.get('/live-data', handleLiveData)

export default router