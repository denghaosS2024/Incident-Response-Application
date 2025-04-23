import request from 'supertest'
import mongoose from 'mongoose'
import app from '../../src/app'
import CheckIn from '../../src/models/CheckIn'

describe('CheckInController Integration & Unit Tests', () => {
  let server: any

  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/test-db")
    server = app
  })

  afterEach(async () => {
    await CheckIn.deleteMany({})
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  it('should return 400 if any field is missing', async () => {
    const res = await request(server)
      .post('/api/checkin')
      .send({ userId: 'u1', date: '2025-04-23' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Missing required fields')
  })

  it('should create a new check-in if not already exists', async () => {
    const res = await request(server)
      .post('/api/checkin')
      .send({ userId: 'u1', exerciseId: 'e1', date: '2025-04-23' })

    expect(res.status).toBe(201)
    expect(res.body.userId).toBe('u1')
    expect(res.body.exerciseId).toBe('e1')
    expect(res.body.date).toBe('2025-04-23')
  })

  it('should return 200 and "Already checked in" if duplicate', async () => {
    await CheckIn.create({ userId: 'u1', exerciseId: 'e1', date: '2025-04-23' })

    const res = await request(server)
      .post('/api/checkin')
      .send({ userId: 'u1', exerciseId: 'e1', date: '2025-04-23' })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Already checked in')
  })

  it('should return check-in dates for a user and exercise', async () => {
    await CheckIn.create({ userId: 'u1', exerciseId: 'e1', date: '2025-04-23' })
    await CheckIn.create({ userId: 'u1', exerciseId: 'e1', date: '2025-04-24' })

    const res = await request(server).get('/api/checkin/u1/e1')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(expect.arrayContaining(['2025-04-23', '2025-04-24']))
  })
})
