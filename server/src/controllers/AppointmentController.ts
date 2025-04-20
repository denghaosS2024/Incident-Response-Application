import { Appointment, IAppointment } from "../models/Appointment";
import UserController from "./UserController";

class AppointmentController {
  /**
   * Create a new appointment
   * @param appointment - The appointment to create
   * @returns The created appointment
   */
  async create({
    userId,
    issueName,
    nurseId = undefined,
    severityIndex = 0,
    startHour,
    endHour,
  }: IAppointment) {
    // Check for existing user
    await UserController.getExistingUser(userId);

    if (nurseId !== undefined) {
      await UserController.getExistingUser(nurseId);
    }

    const doc = new Appointment({
      userId,
      nurseId,
      issueName,
      severityIndex,
      startHour,
      endHour,
    });

    await doc.save();

    return doc;
  }

  /**
   * Find appointments by user ID
   * @param userId - The ID of the user
   * @param resolved - Whether the appointment has been resolved
   * @returns The appointments
   */
  async findByUserId(userId: string, resolved = false) {
    return await Appointment.find({ userId, isResolved: resolved });
  }

  /**
   * Find appointments by nurse ID
   * @param nurseId - The ID of the nurse
   * @param resolved - Whether the appointment has been resolved
   * @returns The appointments
   */
  async findByNurseId(nurseId: string, resolved = false) {
    return await Appointment.find({ nurseId, isResolved: resolved });
  }

  /**
   * Update an appointment
   * @param itemId - The ID of the appointment
   * @param updateData - The data to update
   * @returns The updated appointment
   */
  async update(itemId: string, updateData: Partial<IAppointment>) {
    return await Appointment.findByIdAndUpdate({ _id: itemId }, updateData, {
      upsert: true,
      new: true,
    });
  }

  /**
   * Delete an appointment
   * @param itemId - The ID of the appointment
   * @returns The deleted appointment
   */
  async delete(itemId: string) {
    return await Appointment.findOneAndUpdate(
      { _id: itemId },
      { valid: false },
    );
  }
}

export default new AppointmentController();
