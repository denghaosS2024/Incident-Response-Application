import { Router } from 'express'
import { Types } from 'mongoose'
import { Alert } from '../models/AlertQueue'
import AlertService from '../services/AlertService'
import { parseAlertContent } from '../utils/AlertParser'

const alertQueueRouter = Router()

alertQueueRouter.post('/:id', async (req, res) => {
    // const groupId = req.body.groupId
    const alertService = AlertService
    const senderId = new Types.ObjectId(
        req.headers['x-application-uid'] as string,
      )
      const { content, isAlert, responders } = req.body
  
      const channelId = new Types.ObjectId(req.params.id)
    const parsedContent = parseAlertContent(content)
    const alert = {
        id: new Types.ObjectId().toString(), // Generate a temporary ID
        patientId: parsedContent!.selectedPatientId,
        patientName: parsedContent!.patientName,
        numNurse: parsedContent!.actualNurseCount,
        priority: content.startsWith('E HELP') ? 'E' :
                         content.startsWith('U HELP') ? 'U' : 'H',
        groupId: channelId.toString(),
        status: 'waiting',
        createdAt: new Date(),
        content: content,
        senderId: senderId.toString(),
        channelId: channelId.toString(),
        isAlert: isAlert,
        responders: responders,
    } as Alert;
    
    const result = await alertService.queueOrSendAlert(alert)
    res.json(result)
})

export default alertQueueRouter