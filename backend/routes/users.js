import express from 'express'
import { verifyRole, verifyToken } from '../middleware/authMiddleware.js'
import handleAdmin from '../routeHandlers/admin.js'
import handleOperator from '../routeHandlers/operator.js'
import handleSupervisor from '../routeHandlers/supervisor.js'
import handleAnalyst from '../routeHandlers/analyst.js'
import handleCompanyAdmin from '../routeHandlers/companyAdmin.js'
import sharedResources from '../routeHandlers/shared.js'

const router = express.Router()

router.use('/admin', verifyToken, verifyRole('Admin'), handleAdmin)
router.use('/operator', verifyToken, verifyRole('Operator'), handleOperator)
router.use('/supervisor', verifyToken, verifyRole('Supervisor'), handleSupervisor)
router.use('/analyst', verifyToken, verifyRole('Analyst'), handleAnalyst)
router.use('/company-admin', verifyToken, verifyRole('Company Admin'), handleCompanyAdmin)
router.use('/shared', verifyToken, sharedResources)

export default router