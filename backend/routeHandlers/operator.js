import express from 'express'
import { handleLiveData } from '../utility/operator/handleLiveData.js'
import { logData } from '../utility/operator/logData.js'
import { viewAnomalies } from '../utility/operator/viewAnomalies.js'
import { updateAnomalies } from '../utility/operator/updateAnomalies.js'
import { viewReadInstructions, viewUnreadInstructions } from '../utility/operator/viewInstructions.js'
import { readInstructions } from '../utility/operator/readInstructions.js'
import { getProfile, updateProfile, deleteProfile } from '../controller/userController.js'

const router = express.Router()

router.get('/live-data', handleLiveData)
router.post('/log-data', logData)
router.get('/view-anomalies', viewAnomalies)
router.put('/:id/update-anomaly', updateAnomalies)
router.get('/unread-instructions', viewUnreadInstructions)
router.get('/read-instructions', viewReadInstructions)
router.put('/:id/read-instruction', readInstructions)
router.get('/me', getProfile)
router.put('/me/update', updateProfile)
router.delete('/me/delete', deleteProfile)

export default router