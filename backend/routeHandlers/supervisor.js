import express from 'express'
import { viewAcknowledgedAnomalies, viewUnacknowledgedAnomalies } from '../utility/supervisor/viewAnomalies.js'
import { deleteAnomaly } from '../utility/supervisor/deleteAnomalies.js'
import { acknowledgeAnomaly } from '../utility/supervisor/acknowledgeAnomalies.js'
import { viewOperators } from '../utility/supervisor/viewOperators.js'
import { sendInstructions } from '../utility/supervisor/sendInstructions.js'
import { deleteOperator } from '../utility/supervisor/deleteOperators.js'
import { viewInstructions } from '../utility/supervisor/viewInstructions.js'
import { getAllShifts, reassignShift } from '../utility/supervisor/manageShifts.js'

const router = express.Router()

router.get('/unacknowledged-anomalies', viewUnacknowledgedAnomalies)
router.get('/acknowledged-anomalies', viewAcknowledgedAnomalies)
router.delete('/:id/delete-anomaly', deleteAnomaly)
router.delete('/:id/delete-operator', deleteOperator)
router.put('/:id/acknowledge-anomaly', acknowledgeAnomaly)
router.get('/view-operators', viewOperators)
router.post('/send-instruction', sendInstructions)
router.get('/view-instructions', viewInstructions)
router.get('/shifts', getAllShifts)
router.put('/:id/reassign-shift', reassignShift)

export default router