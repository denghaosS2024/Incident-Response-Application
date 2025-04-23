import { Request, Response } from 'express'
import CheckIn from '../models/CheckIn'

export const checkInToday = async (req: Request, res: Response) => {
  const { userId, exerciseId, date } = req.body

  if (!userId || !exerciseId || !date) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    const existing = await CheckIn.findOne({ userId, exerciseId, date })
    if (existing) {
      return res.status(200).json({ message: 'Already checked in' })
    }

    const newCheckIn = await CheckIn.create({ userId, exerciseId, date })
    return res.status(201).json(newCheckIn)
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err })
  }
}

export const getCheckInDates = async (req: Request, res: Response) => {
  const { userId, exerciseId } = req.params

  try {
    const checkIns = await CheckIn.find({ userId, exerciseId })
    const dates = checkIns.map(ci => ci.date)
    return res.status(200).json(dates)
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving check-ins', error: err })
  }
}
