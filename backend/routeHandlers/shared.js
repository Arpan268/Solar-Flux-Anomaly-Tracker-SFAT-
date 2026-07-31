import express from 'express'
import { getDataSource } from '../utility/shared/dataSource.js'
import { verifyRole } from '../middleware/authMiddleware.js'
import { analyzeData } from '../utility/shared/analyzeData.js'
import { addClient, clearXClassAlert } from '../utility/shared/sseManager.js'

const router = express.Router()

router.get('/data-source', getDataSource)
router.get('/supervisor/analyze', verifyRole('Supervisor'), analyzeData)
router.get('/analyst/analyze', verifyRole('Analyst'), analyzeData)
router.get('/supervisor/notifications/stream', verifyRole('Supervisor'), addClient)
router.delete('/supervisor/notifications/clear-x-class', verifyRole('Supervisor'), clearXClassAlert)
router.get('/analyst/notifications/stream', verifyRole('Analyst'), addClient)
router.delete('/analyst/notifications/clear-x-class', verifyRole('Analyst'), clearXClassAlert)

export default router