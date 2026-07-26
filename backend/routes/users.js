import express from 'express'
import { verifyRole, verifyToken } from '../middleware/authMiddleware.js'
import { deleteUser, getPendingUsers, getProfile, getUsers, handleStatus, updateProfile, deleteProfile, getAvailableShifts } from '../controller/userController.js'
import handleOperator from '../routeHandlers/operator.js'
import handleSupervisor from '../routeHandlers/supervisor.js'
import handleAnalyst from '../routeHandlers/analyst.js'
import sharedResources from '../routeHandlers/shared.js'

const router = express.Router()

router.get('/', verifyToken, verifyRole('Admin'), getUsers)
router.delete('/:id', verifyToken, verifyRole('Admin'), deleteUser)
router.get('/pending', verifyToken, verifyRole('Admin'), getPendingUsers)
router.put('/:id/status', verifyToken, verifyRole('Admin'), handleStatus)
router.get('/shifts/available', verifyToken, verifyRole('Admin'), getAvailableShifts)
router.get('/me', verifyToken, getProfile)
router.put('/me/update', verifyToken, updateProfile)
router.delete('/me/delete', verifyToken, deleteProfile)
router.use('/operator', verifyToken, verifyRole('Operator'), handleOperator)
router.use('/supervisor', verifyToken, verifyRole('Supervisor'), handleSupervisor)
router.use('/analyst', verifyToken, verifyRole('Analyst'), handleAnalyst)
router.use('/shared', verifyToken, sharedResources)

export default router