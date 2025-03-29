import ERBed, { ERBedStatus, IERBed } from '../models/ERBed'
import Hospital from '../models/Hospital'
import Patient, { IPatient } from '../models/Patient'
import { ROLES } from '../utils/Roles'
import UserConnections from '../utils/UserConnections'

// Type for patient data with bed information
interface PatientWithBedInfo extends Record<string, unknown> {
  patientId: string
  bedId: string
  priority: string
  requestedAt?: Date
  readyAt?: Date
  occupiedAt?: Date
  dischargedAt?: Date
}

class ERBedController {
  /**
   * Create a new ER bed in a hospital
   * @param hospitalId The ID of the hospital to create the bed in
   * @returns The newly created ER bed
   */
  async createBed(hospitalId: string): Promise<IERBed> {
    try {
      // Verify the hospital exists
      const hospital = await Hospital.findOne({ hospitalId })
      if (!hospital) {
        throw new Error('Hospital not found')
      }

      // Create new ER bed
      const newBed = new ERBed({
        hospitalId,
        status: ERBedStatus.READY,
        readyAt: new Date(),
      })
      await newBed.save()

      // Update hospital total beds count
      hospital.totalNumberERBeds = (hospital.totalNumberERBeds || 0) + 1
      await hospital.save()

      // Notify nurses about the new bed
      UserConnections.broadcaseToRole(ROLES.NURSE, 'erbed-update', {
        action: 'created',
        bed: newBed,
      })

      return newBed
    } catch (error: unknown) {
      console.error('Error creating ER bed:', error)
      throw new Error('Failed to create ER bed')
    }
  }

  /**
   * Request an ER bed for a patient
   * @param hospitalId The ID of the hospital
   * @param patientId The ID of the patient
   * @param requestedBy The ID of the user requesting the bed
   * @returns The updated ER bed
   */
  async requestBed(
    hospitalId: string,
    patientId: string,
    requestedBy: string,
  ): Promise<IERBed> {
    try {
      // Verify hospital exists
      const hospital = await Hospital.findOne({ hospitalId })
      if (!hospital) {
        throw new Error('Hospital not found')
      }

      // Verify patient exists
      const patient = await Patient.findOne({ patientId })
      if (!patient) {
        throw new Error('Patient not found')
      }

      // Check if patient already has a bed assigned
      const existingBed = await ERBed.findOne({
        patientId,
        status: { $ne: ERBedStatus.DISCHARGED },
      })
      if (existingBed) {
        throw new Error('Patient already has an ER bed assigned')
      }

      // Find an available bed
      const availableBed = await ERBed.findOne({
        hospitalId,
        status: ERBedStatus.READY,
        patientId: { $exists: false },
      })

      if (!availableBed) {
        throw new Error('No available ER beds in this hospital')
      }

      // Update bed status
      availableBed.patientId = patientId
      availableBed.status = ERBedStatus.REQUESTED
      availableBed.requestedAt = new Date()
      availableBed.requestedBy = requestedBy
      await availableBed.save()

      // Update patient record
      patient.hospitalId = hospitalId
      await patient.save()

      // Notify nurses about the bed request
      UserConnections.broadcaseToRole(ROLES.NURSE, 'erbed-update', {
        action: 'requested',
        bed: availableBed,
        patient,
      })

      return availableBed
    } catch (error: unknown) {
      console.error('Error requesting ER bed:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to request ER bed: ${error.message}`)
      }
      throw new Error('Failed to request ER bed')
    }
  }

  /**
   * Cancel a bed request
   * @param bedId The ID of the bed to cancel
   * @returns The updated bed
   */
  async cancelBedRequest(bedId: string): Promise<IERBed> {
    try {
      const bed = await ERBed.findOne({ bedId })
      if (!bed) {
        throw new Error('ER bed not found')
      }

      if (bed.status !== ERBedStatus.REQUESTED) {
        throw new Error('Cannot cancel a bed that is not in requested status')
      }

      // Store the patient ID before removing it
      const patientId = bed.patientId

      // Update the bed status
      bed.status = ERBedStatus.READY
      bed.patientId = undefined
      bed.requestedBy = undefined
      bed.requestedAt = undefined
      bed.readyAt = new Date()
      await bed.save()

      // Notify nurses about the cancelled request
      UserConnections.broadcaseToRole(ROLES.NURSE, 'erbed-update', {
        action: 'cancelled',
        bed,
        patientId,
      })

      return bed
    } catch (error: unknown) {
      console.error('Error cancelling bed request:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to cancel bed request: ${error.message}`)
      }
      throw new Error('Failed to cancel bed request')
    }
  }

  /**
   * Update the status of an ER bed
   * @param bedId The ID of the bed to update
   * @param status The new status of the bed
   * @returns The updated bed
   */
  async updateBedStatus(bedId: string, status: ERBedStatus): Promise<IERBed> {
    try {
      const bed = await ERBed.findOne({ bedId })
      if (!bed) {
        throw new Error('ER bed not found')
      }

      // Validate status transition
      if (!this.isValidStatusTransition(bed.status, status)) {
        throw new Error(
          `Invalid status transition from ${bed.status} to ${status}`,
        )
      }

      // Update the status and timestamps
      bed.status = status

      if (status === ERBedStatus.READY) {
        bed.readyAt = new Date()
        bed.patientId = undefined // Clear the patient ID when marking as READY
      } else if (status === ERBedStatus.IN_USE) {
        bed.occupiedAt = new Date()
      } else if (status === ERBedStatus.DISCHARGED) {
        bed.dischargedAt = new Date()
      } else if (status === ERBedStatus.REQUESTED) {
        bed.requestedAt = new Date()
      }

      await bed.save()

      // Broadcast to relevant roles
      UserConnections.broadcaseToRole(ROLES.NURSE, 'erbed-update', {
        bed: bed.toObject(),
      })
      UserConnections.broadcaseToRole(ROLES.ADMINISTRATOR, 'erbed-update', {
        bed: bed.toObject(),
      })

      return bed
    } catch (error: unknown) {
      console.error('Error updating bed status:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to update bed status: ${error.message}`)
      }
      throw new Error('Failed to update bed status: Unknown error')
    }
  }

  /**
   * Assign a patient to an ER bed
   * @param bedId The ID of the bed
   * @param patientId The ID of the patient
   * @returns The updated bed
   */
  async assignPatientToBed(bedId: string, patientId: string): Promise<IERBed> {
    try {
      const bed = await ERBed.findOne({ bedId })
      if (!bed) {
        throw new Error('ER bed not found')
      }

      // Verify patient exists
      const patient = await Patient.findOne({ patientId })
      if (!patient) {
        throw new Error('Patient not found')
      }

      // Check if patient already has a bed assigned
      if (bed.patientId && bed.patientId !== patientId) {
        throw new Error('Bed already assigned to another patient')
      }

      // Update bed with patient
      bed.patientId = patientId

      // If the bed was previously in READY status, update to REQUESTED
      if (bed.status === ERBedStatus.READY) {
        bed.status = ERBedStatus.REQUESTED
        bed.requestedAt = new Date()
      }

      await bed.save()

      // Update patient record
      patient.hospitalId = bed.hospitalId
      patient.status = 'to_er' // Update as appropriate
      await patient.save()

      // Notify nurses about the patient assignment
      UserConnections.broadcaseToRole(ROLES.NURSE, 'erbed-update', {
        action: 'patientAssigned',
        bed,
        patient,
      })

      return bed
    } catch (error: unknown) {
      console.error('Error assigning patient to bed:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to assign patient to bed: ${error.message}`)
      }
      throw new Error('Failed to assign patient to bed')
    }
  }

  /**
   * Remove a patient from an ER bed
   * @param bedId The ID of the bed
   * @returns The updated bed
   */
  async removePatientFromBed(bedId: string): Promise<IERBed> {
    try {
      const bed = await ERBed.findOne({ bedId })
      if (!bed) {
        throw new Error('ER bed not found')
      }

      if (!bed.patientId) {
        throw new Error('No patient assigned to this bed')
      }

      // Store patient ID before removal
      const patientId = bed.patientId

      // Update the bed status
      if (bed.status !== ERBedStatus.DISCHARGED) {
        bed.status = ERBedStatus.READY
        bed.patientId = undefined
        bed.requestedAt = undefined
        bed.occupiedAt = undefined
        bed.readyAt = new Date()
      }

      await bed.save()

      // Notify nurses about the patient removal
      UserConnections.broadcaseToRole(ROLES.NURSE, 'erbed-update', {
        action: 'patientRemoved',
        bed,
        patientId,
      })

      return bed
    } catch (error: unknown) {
      console.error('Error removing patient from bed:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to remove patient from bed: ${error.message}`)
      }
      throw new Error('Failed to remove patient from bed')
    }
  }

  /**
   * Get all ER beds for a hospital
   * @param hospitalId The ID of the hospital
   * @returns Array of ER beds
   */
  async getHospitalBeds(hospitalId: string): Promise<IERBed[]> {
    try {
      return await ERBed.find({ hospitalId }).sort({
        status: 1,
        requestedAt: 1,
      })
    } catch (error: unknown) {
      console.error('Error fetching hospital beds:', error)
      throw new Error('Failed to fetch hospital beds')
    }
  }

  /**
   * Get ER beds by status for a hospital
   * @param hospitalId The ID of the hospital
   * @param status The status of beds to retrieve
   * @returns Array of ER beds with the specified status
   */
  async getHospitalBedsByStatus(
    hospitalId: string,
    status: ERBedStatus,
  ): Promise<IERBed[]> {
    try {
      return await ERBed.find({ hospitalId, status })
    } catch (error: unknown) {
      console.error(
        `Error fetching hospital beds with status ${status}:`,
        error,
      )
      throw new Error(`Failed to fetch hospital beds with status ${status}`)
    }
  }

  /**
   * Get the number of available ER beds in a hospital
   * @param hospitalId The ID of the hospital
   * @returns The number of available beds
   */
  async getAvailableBedCount(hospitalId: string): Promise<number> {
    try {
      return await ERBed.countDocuments({
        hospitalId,
        status: ERBedStatus.READY,
        patientId: { $exists: false },
      })
    } catch (error: unknown) {
      console.error('Error counting available beds:', error)
      throw new Error('Failed to count available beds')
    }
  }

  /**
   * Get the ER bed for a specific patient
   * @param patientId The ID of the patient
   * @returns The patient's ER bed, or null if not found
   */
  async getPatientBed(patientId: string): Promise<IERBed | null> {
    try {
      return await ERBed.findOne({
        patientId,
        status: { $ne: ERBedStatus.DISCHARGED },
      })
    } catch (error: unknown) {
      console.error('Error fetching patient bed:', error)
      throw new Error('Failed to fetch patient bed')
    }
  }

  /**
   * Delete an ER bed
   * @param bedId The ID of the bed to delete
   * @returns true if successful
   */
  async deleteBed(bedId: string): Promise<boolean> {
    try {
      const bed = await ERBed.findOne({ bedId })
      if (!bed) {
        throw new Error('ER bed not found')
      }

      // Check if the bed has a patient
      if (bed.patientId && bed.status !== ERBedStatus.DISCHARGED) {
        throw new Error('Cannot delete a bed with an assigned patient')
      }

      // Delete the bed
      await ERBed.deleteOne({ bedId })

      // Update hospital total beds count
      const hospital = await Hospital.findOne({ hospitalId: bed.hospitalId })
      if (hospital) {
        hospital.totalNumberERBeds = Math.max(
          0,
          (hospital.totalNumberERBeds || 0) - 1,
        )
        await hospital.save()
      }

      // Notify nurses about the deleted bed
      UserConnections.broadcaseToRole(ROLES.NURSE, 'erbed-update', {
        action: 'deleted',
        bedId,
      })

      return true
    } catch (error: unknown) {
      console.error('Error deleting ER bed:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to delete ER bed: ${error.message}`)
      }
      throw new Error('Failed to delete ER bed')
    }
  }

  /**
   * Helper method to validate status transitions
   * @param currentStatus Current bed status
   * @param newStatus New bed status
   * @returns true if the transition is valid, false otherwise
   */
  private isValidStatusTransition(
    currentStatus: ERBedStatus,
    newStatus: ERBedStatus,
  ): boolean {
    // Define valid transitions
    const validTransitions: Record<ERBedStatus, ERBedStatus[]> = {
      [ERBedStatus.READY]: [ERBedStatus.REQUESTED],
      [ERBedStatus.REQUESTED]: [ERBedStatus.READY, ERBedStatus.IN_USE],
      [ERBedStatus.IN_USE]: [ERBedStatus.DISCHARGED],
      [ERBedStatus.DISCHARGED]: [ERBedStatus.READY],
    }

    return validTransitions[currentStatus]?.includes(newStatus) || false
  }

  /**
   * Get patients grouped by bed category for a hospital
   * This specifically supports the Nurse Patient Directory view
   * @param hospitalId The ID of the hospital
   * @returns Object with patients grouped by category
   */
  async getPatientsByCategory(hospitalId: string): Promise<{
    requesting: PatientWithBedInfo[]
    ready: PatientWithBedInfo[]
    inUse: PatientWithBedInfo[]
    discharged: PatientWithBedInfo[]
  }> {
    try {
      // Get all beds for this hospital
      const beds = await ERBed.find({ hospitalId })

      // Get all patient IDs from the beds
      const patientIds = beds
        .filter((bed) => bed.patientId)
        .map((bed) => bed.patientId)
        .filter(Boolean) as string[]

      // Get all the patients in one query
      const patients =
        patientIds.length > 0
          ? await Patient.find({ patientId: { $in: patientIds } })
          : []

      // Create a map of patientId to patient data for quick lookups
      const patientMap = new Map<string, IPatient>()
      patients.forEach((patient) => {
        patientMap.set(patient.patientId, patient)
      })

      const requesting = beds
        .filter((bed) => bed.status === ERBedStatus.REQUESTED && bed.patientId)
        .map((bed) => {
          const patient = patientMap.get(bed.patientId as string)
          const patientData = patient ? patient.toObject() : {}
          return {
            ...patientData,
            bedId: bed.bedId,
            requestedAt: bed.requestedAt,
          } as PatientWithBedInfo
        })
        .sort((a, b) => this.comparePriority(a.priority, b.priority))

      const ready = beds
        .filter((bed) => bed.status === ERBedStatus.READY && bed.patientId)
        .map((bed) => {
          const patient = patientMap.get(bed.patientId as string)
          const patientData = patient ? patient.toObject() : {}
          return {
            ...patientData,
            bedId: bed.bedId,
            readyAt: bed.readyAt,
          } as PatientWithBedInfo
        })
        .sort((a, b) => this.comparePriority(a.priority, b.priority))

      const inUse = beds
        .filter((bed) => bed.status === ERBedStatus.IN_USE && bed.patientId)
        .map((bed) => {
          const patient = patientMap.get(bed.patientId as string)
          const patientData = patient ? patient.toObject() : {}
          return {
            ...patientData,
            bedId: bed.bedId,
            occupiedAt: bed.occupiedAt,
          } as PatientWithBedInfo
        })
        .sort((a, b) => this.comparePriority(a.priority, b.priority))

      const discharged = beds
        .filter((bed) => bed.status === ERBedStatus.DISCHARGED && bed.patientId)
        .map((bed) => {
          const patient = patientMap.get(bed.patientId as string)
          const patientData = patient ? patient.toObject() : {}
          return {
            ...patientData,
            bedId: bed.bedId,
            dischargedAt: bed.dischargedAt,
          } as PatientWithBedInfo
        })
        .sort((a, b) => this.comparePriority(a.priority, b.priority))

      return {
        requesting,
        ready,
        inUse,
        discharged,
      }
    } catch (error: unknown) {
      console.error('Error getting patients by category:', error)
      throw new Error('Failed to get patients by category')
    }
  }

  /**
   * Move a patient from one bed category to another
   * This specifically supports the "Change Patient Category" user story
   * @param bedId The ID of the bed
   * @param targetStatus The target status to move to
   * @returns The updated bed
   */
  async movePatientToCategory(
    bedId: string,
    targetStatus: ERBedStatus,
  ): Promise<IERBed> {
    try {
      const bed = await ERBed.findOne({ bedId })
      if (!bed) {
        throw new Error('ER bed not found')
      }

      if (!bed.patientId) {
        throw new Error('No patient assigned to this bed')
      }

      // Verify if the transition is valid - you can only move to the next category
      if (!this.isValidStatusTransition(bed.status, targetStatus)) {
        throw new Error(
          `Invalid status transition from ${bed.status} to ${targetStatus}`,
        )
      }

      // Get patient information for updating if needed
      const patient = await Patient.findOne({ patientId: bed.patientId })
      if (!patient) {
        throw new Error('Patient not found')
      }

      // Handle special cases for each transition
      const oldStatus = bed.status
      bed.status = targetStatus

      // Update patient data based on new status
      if (targetStatus === ERBedStatus.IN_USE) {
        // Update patient location to ER when moved to IN_USE
        patient.location = 'ER'
        await patient.save()
      } else if (targetStatus === ERBedStatus.DISCHARGED) {
        // Update any patient fields needed for discharge
        if (patient.status === 'at_er') {
          patient.status = 'others'
          await patient.save()
        }
      }

      switch (targetStatus) {
        case ERBedStatus.READY:
          bed.readyAt = new Date()
          // If moving from DISCHARGED to READY, remove patient reference
          if (oldStatus === ERBedStatus.DISCHARGED) {
            bed.patientId = undefined
          }
          break
        case ERBedStatus.IN_USE:
          bed.occupiedAt = new Date()
          break
        case ERBedStatus.DISCHARGED:
          bed.dischargedAt = new Date()
          break
      }

      await bed.save()

      // Broadcast to roles
      UserConnections.broadcaseToRole(ROLES.NURSE, 'bed_category_updated', {
        bed: bed.toObject(),
        patient: patient.toObject(),
        oldStatus,
      })

      return bed
    } catch (error: unknown) {
      console.error('Error moving patient to category:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to move patient to category: ${error.message}`)
      }
      throw new Error('Failed to move patient to category')
    }
  }

  /**
   * Helper method to compare patient priorities for sorting
   * @param a First priority
   * @param b Second priority
   * @returns Comparison result for sorting
   */
  private comparePriority(a: string, b: string): number {
    const priorityOrder: Record<string, number> = {
      E: 0,
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
    }

    const priorityA = priorityOrder[a] ?? 999
    const priorityB = priorityOrder[b] ?? 999

    return priorityA - priorityB
  }
}

export default new ERBedController()
