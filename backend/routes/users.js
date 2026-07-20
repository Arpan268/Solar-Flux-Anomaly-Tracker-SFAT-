import express from 'express'
import { verifyRole, verifyToken } from '../middleware/authMiddleware.js'
import { deleteUser, getProfile, getUsers } from '../controller/userController.js'
import handleOperator from '../routeHandlers/operator.js'
import handleSupervisor from '../routeHandlers/supervisor.js'
import handleAnalyst from '../routeHandlers/analyst.js'

const router = express.Router()

router.get('/', verifyToken, verifyRole('Admin'), getUsers)
router.delete('/:id', verifyToken, verifyRole('Admin'), deleteUser)
router.get('/me', verifyToken, getProfile)
router.use('/operator', verifyToken, verifyRole('Operator'), handleOperator)
router.use('/supervisor', verifyToken, verifyRole('Supervisor'), handleSupervisor)
router.use('/analyst', verifyToken, verifyRole('Analyst'), handleAnalyst)

export default router