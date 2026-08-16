import express from 'express'
import { viewLiveData } from '../utility/analyst/viewLiveData.js'
import { viewAnomalies } from '../utility/analyst/viewAnomalies.js'
import { downloadData } from '../utility/analyst/downloadData.js'
import { viewDiagrams } from '../utility/analyst/viewDiagrams.js'
import { handleLiveData } from '../utility/operator/handleLiveData.js'
import { microAnalysis } from '../utility/analyst/microAnalysis.js'
import { macroAnalysis } from '../utility/analyst/macroAnalysis.js'
import { predictionHandler } from '../utility/analyst/predictionHandler.js'
import { viewAdvisories } from '../utility/analyst/viewAdvisories.js'
import { createAnomalyAdvisory, createPredictionAdvisory } from '../utility/analyst/createAdvisory.js'
import { getProfile, updateProfile, deleteProfile } from '../controller/userController.js'

const router = express.Router()

router.get('/view-livedata', viewLiveData)
router.get('/view-anomalies', viewAnomalies)
router.get('/download-data', downloadData)
router.get('/view-diagrams', viewDiagrams)
router.get('/live-data', handleLiveData)
router.get('/micro-analysis/:id', microAnalysis)
router.get('/macro-analysis', macroAnalysis)
router.get('/generate-prediction', predictionHandler)
router.get('/view-advisories', viewAdvisories)
router.post('/create-prediction-advisory', createPredictionAdvisory)
router.post('/create-anomaly-advisory', createAnomalyAdvisory)
router.get('/me', getProfile)
router.put('/me/update', updateProfile)
router.delete('/me/delete', deleteProfile)

export default router