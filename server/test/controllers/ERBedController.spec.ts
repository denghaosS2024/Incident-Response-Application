import ERBedController from '../../src/controllers/ERBedController'
import ERBed, { ERBedStatus } from '../../src/models/ERBed'
import Hospital from '../../src/models/Hospital'
import Patient from '../../src/models/Patient'
import { ROLES } from '../../src/utils/Roles'
import UserConnections from '../../src/utils/UserConnections'

// Mock dependencies
jest.mock('../../src/models/ERBed')
jest.mock('../../src/models/Hospital')
jest.mock('../../src/models/Patient')
jest.mock('../../src/utils/UserConnections', () => ({
  broadcaseToRole: jest.fn(),
}))

// Create interfaces for mocked objects
interface MockBed {
  bedId?: string
  hospitalId: string
  status: ERBedStatus
  patientId?: string
  requestedAt?: Date
  requestedBy?: string
  occupiedAt?: Date
  readyAt?: Date
  dischargedAt?: Date
  save: jest.Mock
  populate?: jest.Mock
  toObject?: () => Record<string, unknown>
}

interface MockHospital {
  hospitalId: string
  totalNumberERBeds?: number
  save: jest.Mock
}

interface MockPatient {
  patientId: string
  hospitalId?: string
  status?: string
  location?: string
  priority?: string
  save: jest.Mock
  toObject?: () => Record<string, unknown>
}

describe('ERBedController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createBed', () => {
    it('should create a new ER bed', async () => {
      // Mock data
      const hospitalId = 'hospital123'

      // Create mock hospital
      const mockHospital = {
        hospitalId,
        totalNumberERBeds: 5,
        save: jest.fn().mockResolvedValue(undefined),
      }

      // Create mock ER bed
      const mockBed = {
        hospitalId,
        status: ERBedStatus.READY,
        readyAt: new Date(),
        save: jest.fn().mockResolvedValue(undefined),
      }

      // Setup Hospital.findOne mock
      jest.spyOn(Hospital, 'findOne').mockResolvedValue(mockHospital as any)

      // Setup ERBed constructor and save method
      const mockERBedInstance = mockBed
      jest
        .spyOn(ERBed.prototype, 'save')
        .mockResolvedValue(mockERBedInstance as any)
      jest
        .spyOn(ERBed.prototype, 'constructor')
        .mockReturnValue(mockERBedInstance as any)

      // Mock UserConnections.broadcaseToRole
      jest.spyOn(UserConnections, 'broadcaseToRole').mockImplementation()

      // Execute
      const result = await ERBedController.createBed(hospitalId)

      // Verify
      expect(Hospital.findOne).toHaveBeenCalledWith({ hospitalId })
      expect(mockHospital.totalNumberERBeds).toBe(6)
      expect(mockHospital.save).toHaveBeenCalled()
      expect(result).toBeDefined()
      expect(result.hospitalId).toBe(hospitalId)
      expect(result.status).toBe(ERBedStatus.READY)
      expect(UserConnections.broadcaseToRole).toHaveBeenCalledWith(
        ROLES.NURSE,
        'erbed-update',
        expect.objectContaining({
          action: 'created',
          bed: expect.anything(),
        }),
      )
    })

    it('should throw an error if hospital not found', async () => {
      // Setup mocks
      Hospital.findOne = jest.fn().mockResolvedValue(null)

      // Execute and verify
      await expect(
        ERBedController.requestBed('invalid_hospital', 'patient123', 'user123'),
      ).rejects.toThrow('Hospital not found')
    })
  })

  describe('requestBed', () => {
    it('should request an ER bed for a patient', async () => {
      // Mock data
      const hospitalId = 'hospital123'
      const patientId = 'patient123'
      const requestedBy = 'user123'

      const mockHospital: MockHospital = {
        hospitalId,
        save: jest.fn(),
      }

      const mockPatient: MockPatient = {
        patientId,
        hospitalId: '',
        save: jest.fn(),
      }

      const mockBed: MockBed = {
        hospitalId,
        status: ERBedStatus.READY,
        patientId: undefined,
        requestedAt: undefined,
        requestedBy: undefined,
        save: jest.fn(),
      }

      // Setup mocks
      Hospital.findOne = jest.fn().mockResolvedValue(mockHospital)
      Patient.findOne = jest.fn().mockResolvedValue(mockPatient)
      ERBed.findOne = jest.fn().mockImplementation((query) => {
        if (query.patientId === patientId) {
          return null // Patient doesn't have a bed yet
        }
        return mockBed // Available bed
      })

      // Execute
      const result = await ERBedController.requestBed(
        hospitalId,
        patientId,
        requestedBy,
      )

      // Verify
      expect(Hospital.findOne).toHaveBeenCalledWith({ hospitalId })
      expect(Patient.findOne).toHaveBeenCalledWith({ patientId })
      expect(ERBed.findOne).toHaveBeenCalledWith({
        patientId,
        status: { $ne: ERBedStatus.DISCHARGED },
      })
      expect(ERBed.findOne).toHaveBeenCalledWith({
        hospitalId,
        status: ERBedStatus.READY,
        patientId: { $exists: false },
      })

      expect(mockBed.patientId).toBe(patientId)
      expect(mockBed.status).toBe(ERBedStatus.REQUESTED)
      expect(mockBed.requestedAt).toBeInstanceOf(Date)
      expect(mockBed.requestedBy).toBe(requestedBy)
      expect(mockBed.save).toHaveBeenCalled()

      expect(mockPatient.hospitalId).toBe(hospitalId)
      expect(mockPatient.save).toHaveBeenCalled()

      expect(result).toEqual(mockBed)
    })

    it('should throw an error if patient already has a bed', async () => {
      // Mock data
      const hospitalId = 'hospital123'
      const patientId = 'patient123'
      const requestedBy = 'user123'

      const mockHospital: MockHospital = {
        hospitalId,
        save: jest.fn(),
      }

      const mockPatient: MockPatient = {
        patientId,
        save: jest.fn(),
      }

      const mockExistingBed = { patientId }

      // Setup mocks
      Hospital.findOne = jest.fn().mockResolvedValue(mockHospital)
      Patient.findOne = jest.fn().mockResolvedValue(mockPatient)
      ERBed.findOne = jest.fn().mockResolvedValue(mockExistingBed) // Patient already has a bed

      // Execute and verify
      await expect(
        ERBedController.requestBed(hospitalId, patientId, requestedBy),
      ).rejects.toThrow('Patient already has an ER bed assigned')
    })

    it('should throw an error if no available beds', async () => {
      // Mock data
      const hospitalId = 'hospital123'
      const patientId = 'patient123'
      const requestedBy = 'user123'

      const mockHospital: MockHospital = {
        hospitalId,
        save: jest.fn(),
      }

      const mockPatient: MockPatient = {
        patientId,
        save: jest.fn(),
      }

      // Setup mocks
      Hospital.findOne = jest.fn().mockResolvedValue(mockHospital)
      Patient.findOne = jest.fn().mockResolvedValue(mockPatient)
      ERBed.findOne = jest.fn().mockImplementation((query) => {
        if (query.patientId === patientId) {
          return null // Patient doesn't have a bed yet
        }
        return null // No available beds
      })

      // Execute and verify
      await expect(
        ERBedController.requestBed(hospitalId, patientId, requestedBy),
      ).rejects.toThrow('No available ER beds in this hospital')
    })
  })

  describe('updateBedStatus', () => {
    it('should update bed status', async () => {
      // Mock data
      const bedId = 'bed123'
      const mockBed: MockBed = {
        bedId,
        status: ERBedStatus.REQUESTED,
        hospitalId: 'hospital123',
        patientId: 'patient123',
        occupiedAt: undefined,
        save: jest.fn(),
      }

      // Setup mocks
      ERBed.findOne = jest.fn().mockResolvedValue(mockBed)
      Hospital.findOne = jest.fn().mockResolvedValue({
        hospitalId: 'hospital123',
        save: jest.fn(),
      })
      Patient.findOne = jest.fn().mockResolvedValue({
        patientId: 'patient123',
        status: 'to_er',
        save: jest.fn(),
      })

      // Use type assertion to access private method
      const spyTarget = ERBedController as unknown as {
        isValidStatusTransition: (
          current: ERBedStatus,
          next: ERBedStatus,
        ) => boolean
      }
      const isValidTransitionSpy = jest.spyOn(
        spyTarget,
        'isValidStatusTransition',
      )
      isValidTransitionSpy.mockReturnValue(true)

      // Execute
      const result = await ERBedController.updateBedStatus(
        bedId,
        ERBedStatus.IN_USE,
      )

      // Verify
      expect(ERBed.findOne).toHaveBeenCalledWith({ bedId })
      expect(isValidTransitionSpy).toHaveBeenCalledWith(
        ERBedStatus.REQUESTED,
        ERBedStatus.IN_USE,
      )
      expect(mockBed.status).toBe(ERBedStatus.IN_USE)
      expect(mockBed.occupiedAt).toBeInstanceOf(Date)
      expect(mockBed.save).toHaveBeenCalled()
      expect(result).toEqual(mockBed)

      // Restore spy
      isValidTransitionSpy.mockRestore()
    })

    it('should throw an error for invalid status transition', async () => {
      // Mock data
      const bedId = 'bed123'
      const mockBed: MockBed = {
        bedId,
        status: ERBedStatus.READY,
        hospitalId: 'hospital123',
        save: jest.fn(),
      }

      // Setup mocks
      ERBed.findOne = jest.fn().mockResolvedValue(mockBed)

      // Use type assertion to access private method
      const spyTarget = ERBedController as unknown as {
        isValidStatusTransition: (
          current: ERBedStatus,
          next: ERBedStatus,
        ) => boolean
      }
      const isValidTransitionSpy = jest.spyOn(
        spyTarget,
        'isValidStatusTransition',
      )
      isValidTransitionSpy.mockReturnValue(false)

      // Execute and verify
      await expect(
        ERBedController.updateBedStatus(bedId, ERBedStatus.DISCHARGED),
      ).rejects.toThrow(
        `Invalid status transition from ${ERBedStatus.READY} to ${ERBedStatus.DISCHARGED}`,
      )

      // Restore spy
      isValidTransitionSpy.mockRestore()
    })
  })

  describe('getHospitalBeds', () => {
    it('should get all beds for a hospital', async () => {
      // Mock data
      const hospitalId = 'hospital123'
      const mockBeds = [
        { bedId: 'bed1', hospitalId, status: ERBedStatus.READY },
        { bedId: 'bed2', hospitalId, status: ERBedStatus.IN_USE },
      ]

      // Setup mocks
      const mockSort = {
        sort: jest.fn().mockResolvedValue(mockBeds),
      }
      ERBed.find = jest.fn().mockReturnValue(mockSort)

      // Execute
      const result = await ERBedController.getHospitalBeds(hospitalId)

      // Verify
      expect(ERBed.find).toHaveBeenCalledWith({ hospitalId })
      expect(mockSort.sort).toHaveBeenCalledWith({ status: 1, requestedAt: 1 })
      expect(result).toEqual(mockBeds)
    })
  })

  describe('getAvailableBedCount', () => {
    it('should count available beds', async () => {
      // Mock data
      const hospitalId = 'hospital123'
      const availableBeds = 5

      // Setup mocks
      ERBed.countDocuments = jest.fn().mockResolvedValue(availableBeds)

      // Execute
      const result = await ERBedController.getAvailableBedCount(hospitalId)

      // Verify
      expect(ERBed.countDocuments).toHaveBeenCalledWith({
        hospitalId,
        status: ERBedStatus.READY,
        patientId: { $exists: false },
      })
      expect(result).toBe(availableBeds)
    })
  })

  describe('isValidStatusTransition', () => {
    it('should validate status transitions correctly', () => {
      // Access the private method directly for testing using type assertion
      const testController = ERBedController as unknown as {
        isValidStatusTransition: (
          current: ERBedStatus,
          next: ERBedStatus,
        ) => boolean
      }
      const isValidTransition =
        testController.isValidStatusTransition.bind(ERBedController)

      // Valid transitions
      expect(isValidTransition(ERBedStatus.READY, ERBedStatus.REQUESTED)).toBe(
        true,
      )
      expect(isValidTransition(ERBedStatus.REQUESTED, ERBedStatus.IN_USE)).toBe(
        true,
      )
      expect(
        isValidTransition(ERBedStatus.IN_USE, ERBedStatus.DISCHARGED),
      ).toBe(true)
      expect(isValidTransition(ERBedStatus.DISCHARGED, ERBedStatus.READY)).toBe(
        true,
      )

      // Invalid transitions
      expect(isValidTransition(ERBedStatus.READY, ERBedStatus.IN_USE)).toBe(
        false,
      )
      expect(isValidTransition(ERBedStatus.READY, ERBedStatus.DISCHARGED)).toBe(
        false,
      )
      expect(
        isValidTransition(ERBedStatus.REQUESTED, ERBedStatus.DISCHARGED),
      ).toBe(false)
      expect(isValidTransition(ERBedStatus.IN_USE, ERBedStatus.REQUESTED)).toBe(
        false,
      )
      expect(
        isValidTransition(ERBedStatus.DISCHARGED, ERBedStatus.IN_USE),
      ).toBe(false)
    })
  })

  describe('getPatientsByCategory', () => {
    it('should group patients by bed category', async () => {
      // Mock data
      const hospitalId = 'hospital123'

      // Create mock beds with populated patient data
      const mockPatient1 = {
        patientId: 'patient1',
        name: 'Patient 1',
        priority: 'E',
        toObject: jest.fn().mockReturnValue({
          patientId: 'patient1',
          name: 'Patient 1',
          priority: 'E',
        }),
      }

      const mockPatient2 = {
        patientId: 'patient2',
        name: 'Patient 2',
        priority: '1',
        toObject: jest.fn().mockReturnValue({
          patientId: 'patient2',
          name: 'Patient 2',
          priority: '1',
        }),
      }

      const mockPatient3 = {
        patientId: 'patient3',
        name: 'Patient 3',
        priority: '2',
        toObject: jest.fn().mockReturnValue({
          patientId: 'patient3',
          name: 'Patient 3',
          priority: '2',
        }),
      }

      const mockBeds = [
        {
          bedId: 'bed1',
          hospitalId,
          status: ERBedStatus.REQUESTED,
          patientId: mockPatient1,
          requestedAt: new Date(),
        },
        {
          bedId: 'bed2',
          hospitalId,
          status: ERBedStatus.READY,
          patientId: mockPatient2,
          readyAt: new Date(),
        },
        {
          bedId: 'bed3',
          hospitalId,
          status: ERBedStatus.IN_USE,
          patientId: mockPatient3,
          occupiedAt: new Date(),
        },
      ]

      // Setup mocks
      const mockPopulate = jest.fn().mockResolvedValue(mockBeds)
      ERBed.find = jest.fn().mockReturnValue({ populate: mockPopulate })

      // Execute
      const result = await ERBedController.getPatientsByCategory(hospitalId)

      // Verify
      expect(ERBed.find).toHaveBeenCalledWith({ hospitalId })
      expect(mockPopulate).toHaveBeenCalledWith('patientId')

      expect(result).toHaveProperty('requesting')
      expect(result).toHaveProperty('ready')
      expect(result).toHaveProperty('inUse')
      expect(result).toHaveProperty('discharged')

      expect(result.requesting.length).toBe(1)
      expect(result.requesting[0].patientId).toBe('patient1')
      expect(result.requesting[0].priority).toBe('E')

      expect(result.ready.length).toBe(1)
      expect(result.ready[0].patientId).toBe('patient2')
      expect(result.ready[0].priority).toBe('1')

      expect(result.inUse.length).toBe(1)
      expect(result.inUse[0].patientId).toBe('patient3')
      expect(result.inUse[0].priority).toBe('2')

      expect(result.discharged.length).toBe(0)
    })
  })

  describe('movePatientToCategory', () => {
    it('should move a patient to IN_USE category and update location', async () => {
      // Mock data
      const bedId = 'bed123'
      const mockBed: MockBed = {
        bedId,
        status: ERBedStatus.REQUESTED,
        hospitalId: 'hospital123',
        patientId: 'patient123',
        occupiedAt: undefined,
        save: jest.fn(),
      }

      const mockPatient: MockPatient = {
        patientId: 'patient123',
        hospitalId: '',
        location: '',
        save: jest.fn(),
      }

      // Setup mocks
      ERBed.findOne = jest.fn().mockResolvedValue(mockBed)
      Patient.findOne = jest.fn().mockResolvedValue(mockPatient)

      // Spy on the private method
      const spyTarget = ERBedController as unknown as {
        isValidStatusTransition: (
          current: ERBedStatus,
          next: ERBedStatus,
        ) => boolean
      }
      const isValidTransitionSpy = jest.spyOn(
        spyTarget,
        'isValidStatusTransition',
      )
      isValidTransitionSpy.mockReturnValue(true)

      // Execute
      const result = await ERBedController.movePatientToCategory(
        bedId,
        ERBedStatus.IN_USE,
      )

      // Verify
      expect(ERBed.findOne).toHaveBeenCalledWith({ bedId })
      expect(Patient.findOne).toHaveBeenCalledWith({ patientId: 'patient123' })
      expect(isValidTransitionSpy).toHaveBeenCalledWith(
        ERBedStatus.REQUESTED,
        ERBedStatus.IN_USE,
      )
      expect(mockBed.status).toBe(ERBedStatus.IN_USE)
      expect(mockBed.occupiedAt).toBeInstanceOf(Date)
      expect(mockBed.save).toHaveBeenCalled()

      // Check that patient location is updated
      expect(mockPatient.location).toBe('ER')
      expect(mockPatient.hospitalId).toBe('hospital123')
      expect(mockPatient.save).toHaveBeenCalled()

      expect(result).toEqual(mockBed)

      // Restore spy
      isValidTransitionSpy.mockRestore()
    })

    it('should move a patient to DISCHARGED category', async () => {
      // Mock data
      const bedId = 'bed123'
      const mockBed: MockBed = {
        bedId,
        status: ERBedStatus.IN_USE,
        hospitalId: 'hospital123',
        patientId: 'patient123',
        dischargedAt: undefined,
        save: jest.fn(),
      }

      const mockPatient: MockPatient = {
        patientId: 'patient123',
        hospitalId: 'hospital123',
        save: jest.fn(),
      }

      const mockHospital: MockHospital = {
        hospitalId: 'hospital123',
        save: jest.fn(),
      }

      // Setup mocks
      ERBed.findOne = jest.fn().mockResolvedValue(mockBed)
      Patient.findOne = jest.fn().mockResolvedValue(mockPatient)
      Hospital.findOne = jest.fn().mockResolvedValue(mockHospital)

      // Spy on the private method
      const spyTarget = ERBedController as unknown as {
        isValidStatusTransition: (
          current: ERBedStatus,
          next: ERBedStatus,
        ) => boolean
      }
      const isValidTransitionSpy = jest.spyOn(
        spyTarget,
        'isValidStatusTransition',
      )
      isValidTransitionSpy.mockReturnValue(true)

      // Execute
      const result = await ERBedController.movePatientToCategory(
        bedId,
        ERBedStatus.DISCHARGED,
      )

      // Verify
      expect(ERBed.findOne).toHaveBeenCalledWith({ bedId })
      expect(Hospital.findOne).toHaveBeenCalledWith({
        hospitalId: 'hospital123',
      })
      expect(mockBed.status).toBe(ERBedStatus.DISCHARGED)
      expect(mockBed.dischargedAt).toBeInstanceOf(Date)
      expect(mockBed.save).toHaveBeenCalled()

      // Check that hospital was updated
      expect(mockHospital.save).toHaveBeenCalled()

      expect(result).toEqual(mockBed)

      // Restore spy
      isValidTransitionSpy.mockRestore()
    })

    it('should throw an error for invalid status transition', async () => {
      // Mock data
      const bedId = 'bed123'
      const mockBed: MockBed = {
        bedId,
        status: ERBedStatus.READY,
        hospitalId: 'hospital123',
        patientId: 'patient123',
        save: jest.fn(),
      }

      // Setup mocks
      ERBed.findOne = jest.fn().mockResolvedValue(mockBed)
      Patient.findOne = jest.fn().mockResolvedValue({
        patientId: 'patient123',
        save: jest.fn(),
      })

      // Spy on the private method
      const spyTarget = ERBedController as unknown as {
        isValidStatusTransition: (
          current: ERBedStatus,
          next: ERBedStatus,
        ) => boolean
      }
      const isValidTransitionSpy = jest.spyOn(
        spyTarget,
        'isValidStatusTransition',
      )
      isValidTransitionSpy.mockReturnValue(false)

      // Execute and verify
      await expect(
        ERBedController.movePatientToCategory(bedId, ERBedStatus.DISCHARGED),
      ).rejects.toThrow(
        `Invalid status transition from ${ERBedStatus.READY} to ${ERBedStatus.DISCHARGED}`,
      )

      // Restore spy
      isValidTransitionSpy.mockRestore()
    })
  })
})
