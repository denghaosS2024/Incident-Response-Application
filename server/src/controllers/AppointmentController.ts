import { Appointment, IAppointment } from "../models/Appointment";
import NurseShift from "../models/NurseShift";
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
    dayOfWeek,
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
      dayOfWeek,
      startHour,
      endHour,
    });

    await doc.save();

    return doc;
  }

  async findById(itemId: string) {
    return await Appointment.findById(itemId);
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

  /**
   * Find all active appointments for a specific nurse (appointments within his/her shifts)
   * @param nurseId - The ID of the nurse
   * @param resolved - Whether the appointment has been resolved
   * @returns The active appointments
   */
  // async findActiveAppointments(nurseId: string, resolved = false) {
  //   // Todo: Implement logic to find active appointments for a specific nurse
  //   console.log("nurseId", nurseId);
  //   console.log("resolved", resolved);
  //   return;
  // }

  /**
   * Find all active appointments
   * @returns The active appointments
   */
  async findActiveAppointmentsByShiftHour(
    dayOfWeek: number,
    startHour: number,
  ) {
    return await Appointment.find({
      valid: true,
      isResolved: false,
      dayOfWeek,
      startHour,
    }).sort({
      severityIndex: -1, // Sort by severity index desc (2, then 1, then 0)
      dayOfWeek: 1, // Then sort by dayOfWeek asc (earlier first)
      startHour: 1, // Then sort by startHour asc (earlier first)
    });
  }

  async findNext6AvailableSlots(): Promise<
    { nurseId: string; dayOfWeek: number; startHour: number; endHour: number }[]
  > {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sun) - 6 (Sat)
    const currentHour = now.getHours(); // 0 - 23

    const allShifts = await NurseShift.find({})
      .sort({ dayOfWeek: 1, startHour: 1 })
      .exec();

    const sorted = allShifts
      .filter((s) => {
        if (s.dayOfWeek > currentDay) return true;
        if (s.dayOfWeek === currentDay && s.startHour > currentHour)
          return true;
        return false;
      })
      .concat(
        allShifts.filter((s) => {
          if (s.dayOfWeek < currentDay) return true;
          if (s.dayOfWeek === currentDay && s.startHour <= currentHour)
            return true;
          return false;
        }),
      )
      .slice(0, 6);

    return sorted.map((shift) => ({
      nurseId: shift.nurseId,
      dayOfWeek: shift.dayOfWeek,
      startHour: shift.startHour,
      endHour: shift.endHour,
    }));
  }

  /**
   * Check if the user already has an active (valid + not resolved) appointment
   * @param userId - The ID of the user
   * @returns true if exists, false otherwise
   */
  async hasActiveAppointment(userId: string): Promise<boolean> {
    const existing = await Appointment.findOne({
      userId,
      isResolved: false,
      valid: true,
    }).exec();
    return !!existing;
  }
}

export default new AppointmentController();
