import mongoose from 'mongoose'
import ERBed, { ERBedStatus } from '../../src/models/ERBed'

describe('ERBed Model', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect('mongodb://localhost:27017/erbed-test')
  }, 10000) // 10 second timeout for database connection

  afterAll(async () => {
    // Disconnect after tests
    await mongoose.connection.close()
  }, 10000) // 10 second timeout for database disconnection

  beforeEach(async () => {
    // Clear the database before each test
    await ERBed.deleteMany({})
  }, 10000) // 10 second timeout for database cleanup

  it('should create a new ER bed with default values', async () => {
    const erBed = new ERBed({
      hospitalId: 'hospital123',
    })

    const savedBed = await erBed.save()

    expect(savedBed).toBeTruthy()
    expect(savedBed.bedId).toBeDefined()
    expect(savedBed.hospitalId).toBe('hospital123')
    expect(savedBed.status).toBe(ERBedStatus.READY)
    expect(savedBed.patientId).toBeUndefined()
    expect(savedBed.requestedBy).toBeUndefined()
  }, 10000) // 10 second timeout for test

  it('should create a new ER bed with all values provided', async () => {
    const now = new Date()

    const erBed = new ERBed({
      bedId: 'bed123',
      hospitalId: 'hospital123',
      patientId: 'patient123',
      status: ERBedStatus.REQUESTED,
      requestedAt: now,
      requestedBy: 'user123',
    })

    const savedBed = await erBed.save()

    expect(savedBed).toBeTruthy()
    expect(savedBed.bedId).toBe('bed123')
    expect(savedBed.hospitalId).toBe('hospital123')
    expect(savedBed.patientId).toBe('patient123')
    expect(savedBed.status).toBe(ERBedStatus.REQUESTED)
    expect(savedBed.requestedAt).toEqual(now)
    expect(savedBed.requestedBy).toBe('user123')
  }, 10000) // 10 second timeout for test

  it('should not create an ER bed without a hospital ID', async () => {
    const erBed = new ERBed({
      // Missing required hospitalId
    })

    await expect(erBed.save()).rejects.toThrow()
  }, 10000) // 10 second timeout for test

  it('should not create an ER bed with an invalid status', async () => {
    const erBed = new ERBed({
      hospitalId: 'hospital123',
      status: 'invalid_status', // Not a valid enum value
    })

    await expect(erBed.save()).rejects.toThrow()
  }, 10000) // 10 second timeout for test

  it('should update an ER bed status correctly', async () => {
    const erBed = new ERBed({
      hospitalId: 'hospital123',
      status: ERBedStatus.REQUESTED,
      patientId: 'patient123',
      requestedAt: new Date(),
    })

    const savedBed = await erBed.save()

    // Update the status
    savedBed.status = ERBedStatus.IN_USE
    savedBed.occupiedAt = new Date()
    await savedBed.save()

    const updatedBed = await ERBed.findOne({ bedId: savedBed.bedId })

    expect(updatedBed).toBeTruthy()
    expect(updatedBed?.status).toBe(ERBedStatus.IN_USE)
    expect(updatedBed?.occupiedAt).toBeDefined()
  }, 10000) // 10 second timeout for test

  it('should remove patient from an ER bed', async () => {
    const erBed = new ERBed({
      hospitalId: 'hospital123',
      patientId: 'patient123',
      status: ERBedStatus.IN_USE,
      occupiedAt: new Date(),
    })

    const savedBed = await erBed.save()

    // Remove the patient
    savedBed.patientId = undefined
    savedBed.status = ERBedStatus.READY
    savedBed.readyAt = new Date()
    await savedBed.save()

    const updatedBed = await ERBed.findOne({ bedId: savedBed.bedId })

    expect(updatedBed).toBeTruthy()
    expect(updatedBed?.patientId).toBeUndefined()
    expect(updatedBed?.status).toBe(ERBedStatus.READY)
    expect(updatedBed?.readyAt).toBeDefined()
  }, 10000) // 10 second timeout for test

  it('should discharge a patient from an ER bed', async () => {
    const erBed = new ERBed({
      hospitalId: 'hospital123',
      patientId: 'patient123',
      status: ERBedStatus.IN_USE,
      occupiedAt: new Date(),
    })

    const savedBed = await erBed.save()

    // Discharge the patient
    savedBed.status = ERBedStatus.DISCHARGED
    savedBed.dischargedAt = new Date()
    await savedBed.save()

    const updatedBed = await ERBed.findOne({ bedId: savedBed.bedId })

    expect(updatedBed).toBeTruthy()
    expect(updatedBed?.patientId).toBe('patient123') // Keep patient ID for record
    expect(updatedBed?.status).toBe(ERBedStatus.DISCHARGED)
    expect(updatedBed?.dischargedAt).toBeDefined()
  }, 10000) // 10 second timeout for test
})
