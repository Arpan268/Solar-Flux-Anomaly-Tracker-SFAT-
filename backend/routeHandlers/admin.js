import express from 'express'
import { deleteUser, getCompanies, getPendingCompanies, getPendingUsers, getUsers, handleCompanyStatus, handleStatus, getProfile, updateProfile, deleteProfile, getAdminMetrics } from '../controller/userController.js'

const router = express.Router()

router.get('/get-companies', getCompanies)
router.get('/get-pending-companies', getPendingCompanies)
router.put('/:id/handle-company-status', handleCompanyStatus)
router.get('/get-users', getUsers)
router.get('/get-pending-users', getPendingUsers)
router.delete('/:id/delete', deleteUser)
router.put('/:id/handle-status', handleStatus)
router.get('/metrics', getAdminMetrics)
router.get('/me', getProfile)
router.put('/me/update', updateProfile)
router.delete('/me/delete', deleteProfile)

export default router