import { Router } from "express";
import GroupController from "../controllers/GroupController";


export default Router()
    .get('/', (_request, response) => {
        try{
            const groups = GroupController.getAllGroups()
            return response.status(200).json(groups)
        }catch(e){
            const error = e as Error
            return response.status(404).json({ message: error.message })
        }
    })
    .get('/:userId', (request, response) => {
        try{
            const groups = GroupController.getGroupsByUser(request.params.userId as string)
            return response.status(200).json(groups)
        }catch(e){
            const error = e as Error
            return response.status(404).json({ message: error.message })
        }
    })
    .get('/:groupId', (request, response) => {
        try{
            const group = GroupController.getGroupById(request.params.groupId as string)
            return response.status(200).json(group)
        }catch(e){
            const error = e as Error
            return response.status(404).json({ message: error.message })
        }
    })
    .post('/', (request, response) => {
        try{
            const group = GroupController.createGroup(request.body)
            return response.status(200).json(group)
        }catch(e){
            const error = e as Error
            return response.status(404).json({ message: error.message })
        }
    })
