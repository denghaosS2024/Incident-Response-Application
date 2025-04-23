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
    const user = await UserController.getExistingUser(userId);

    if (nurseId !== undefined) {
      await UserController.getExistingUser(nurseId);
    }

    const doc = new Appointment({
      userId,
      username: user.username,
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
   * Find all active appointments
   * @param nurseId - The ID of the nurse
   * @returns The active appointments
   */
  async findActiveAppointmentsByShiftHour(nurseId: string) {
    const nurseShifts = await NurseShift.find({ nurseId, valid: true });
    const allAppointments: IAppointment[] = [];
    for (const shift of nurseShifts) {
      const { dayOfWeek, startHour } = shift;
      const appointments = await Appointment.find({
        valid: true,
        isResolved: false,
        dayOfWeek,
        startHour,
      });
      allAppointments.push(...appointments);
    }

    // Sort by severity index desc (2, then 1, then 0)
    allAppointments.sort((a, b) => {
      // First sort by severity index (higher severity first)
      if (a.severityIndex > b.severityIndex) return -1;
      if (a.severityIndex < b.severityIndex) return 1;

      // If severity is the same, sort by day of week (earlier days first)
      if (a.dayOfWeek < b.dayOfWeek) return -1;
      if (a.dayOfWeek > b.dayOfWeek) return 1;

      // If day is the same too, sort by start hour (earlier hours first)
      if (a.startHour < b.startHour) return -1;
      if (a.startHour > b.startHour) return 1;

      return 0;
    });

    return allAppointments;
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

    const orderedShifts = allShifts
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
      );

    const uniqueTimeSet = new Set<string>();
    const uniqueSlots: {
      nurseId: string;
      dayOfWeek: number;
      startHour: number;
      endHour: number;
    }[] = [];

    for (const shift of orderedShifts) {
      const key = `${shift.dayOfWeek}-${shift.startHour}`;
      if (!uniqueTimeSet.has(key)) {
        uniqueTimeSet.add(key);
        uniqueSlots.push({
          nurseId: shift.nurseId,
          dayOfWeek: shift.dayOfWeek,
          startHour: shift.startHour,
          endHour: shift.endHour,
        });
      }
      if (uniqueSlots.length === 6) break;
    }

    return uniqueSlots;
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

  /**
   * Get the active (valid + not resolved) appointment for a user
   */
  async getActiveAppointment(userId: string): Promise<IAppointment | null> {
    return await Appointment.findOne({
      userId,
      isResolved: false,
      valid: true,
    }).exec();
  }

  async cancelActiveAppointment(userId: string) {
    const appointment = await Appointment.findOneAndUpdate(
      { userId, isResolved: false, valid: true },
      { valid: false },
      { new: true },
    );

    return appointment;
  }
}

export default new AppointmentController();
