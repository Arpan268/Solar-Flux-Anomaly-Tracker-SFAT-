import express from 'express'
import { getDataSource } from '../utility/shared/dataSource.js'
import { verifyRole } from '../middleware/authMiddleware.js'
import { analyzeData } from '../utility/shared/analyzeData.js'

const router = express.Router()

router.get('/data-source', getDataSource)
router.get('/supervisor/analyze', verifyRole('Supervisor'), analyzeData)
router.get('/analyst/analyze', verifyRole('Analyst'), analyzeData)

export default router