import express from 'express'
import { viewUsers } from '../utility/companyAdmin/viewUsers.js'
import { getPendingUsers } from '../utility/companyAdmin/getPendingUsers.js'
import { viewPendingAdvisories } from '../utility/companyAdmin/viewAdvisories.js'
import { viewAcknowledgedAdvisories } from '../utility/companyAdmin/viewAdvisories.js'
import { handleStatus } from '../utility/companyAdmin/handleStatus.js'
import { getAvailableShifts } from '../utility/companyAdmin/getAvailableShifts.js'
import { deleteUser } from '../utility/companyAdmin/deleteUsers.js'
import { acknowledgeAdvisory } from '../utility/companyAdmin/acknowledgeAdvisories.js'
import { getProfile, updateProfile, deleteProfile } from '../controller/userController.js'

const router = express.Router()

router.get('/view-users', viewUsers)
router.get('/view-pending-users', getPendingUsers)
router.get('/view-pending-advisories', viewPendingAdvisories)
router.get('/view-acknowledged-advisories', viewAcknowledgedAdvisories)
router.put('/:id/status', handleStatus)
router.get('/shifts/available', getAvailableShifts)
router.delete(':id/delete', deleteUser)
router.put('/:id/acknowledge-advisory', acknowledgeAdvisory)
router.get('/me', getProfile)
router.put('/me/update', updateProfile)
router.delete('/me/delete', deleteProfile)

export default router