import express from 'express'
import { handleLiveData } from '../utility/operator/handleLiveData.js'
import { logData } from '../utility/operator/logData.js'

const router = express.Router()

router.get('/live-data', handleLiveData)
router.post('/log-data', logData)

export default router