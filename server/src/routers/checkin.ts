import express from 'express'
import { checkInToday, getCheckInDates } from '../controllers/CheckInController'

const router = express.Router()

router.post('/', checkInToday)
router.get('/:userId/:exerciseId', getCheckInDates)

export default router
