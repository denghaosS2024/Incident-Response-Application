import { Router } from 'express'
import { Types } from 'mongoose'
import { Alert } from '../models/AlertQueue'
import AlertService from '../services/AlertService'

const alertQueueRouter = Router()

alertQueueRouter.post('/:id', async (req, res) => {
    const channelId = new Types.ObjectId(req.params.id)
    const alertService = AlertService
    const { id,senderId, patientId, patientName, priority, numNurses, createdAt } = req.body
  
    // const parsedContent = parseAlertContent(content)
    const alert = {
        id: id, // Generate a temporary ID
        patientId: patientId,
        patientName: patientName,
        numNurse: numNurses,
        priority: priority,
        groupId: channelId.toString(),
        createdAt: createdAt,
        senderId: senderId,
        numNurseAccepted: 0,
    } as Alert;
    
    const result = await alertService.queueOrSendAlert(alert)
    
    res.json({
        message: result,
        alert: alert
    })
})

export default alertQueueRouter