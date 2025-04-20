import NurseShift, { INurseShift } from "../models/NurseShift";
import User from "../models/User";
import ROLES from "../utils/Roles";

class NurseShiftController {
  /**
   * Get all shifts for a nurse by day of the week
   * @param nurseId - Nurse's user ID
   * @param dayOfWeek - 0 (Sun) ~ 6 (Sat)
   * @returns List of time slot shifts
   */
  async getShiftsByNurseAndDay(
    nurseId: string,
    dayOfWeek: number,
  ): Promise<INurseShift[]> {
    return await NurseShift.find({ nurseId, dayOfWeek }).exec();
  }

  /**
   * Check if the nurse is currently on shift at this moment
   * @param nurseId - Nurse's user ID
   * @returns Boolean indicating if nurse is currently on shift
   */
  async isNurseOnShift(nurseId: string): Promise<boolean> {
    const now = new Date();
    const localTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
    );

    const currentDay = localTime.getDay();
    const currentHour = localTime.getHours();

    console.log(`[DEBUG] Local Time: ${localTime.toISOString()}`);
    console.log(`[DEBUG] Day=${currentDay}, Hour=${currentHour}`);

    const shifts = await NurseShift.find({
      nurseId,
      dayOfWeek: currentDay,
    }).exec();

    for (const shift of shifts) {
      console.log(
        `[DEBUG] Shift from ${shift.startHour} to ${shift.endHour} → Match? ${
          shift.startHour <= currentHour && shift.endHour > currentHour
        }`,
      );
    }

    const shift = await NurseShift.findOne({
      nurseId,
      dayOfWeek: currentDay,
      startHour: { $lte: currentHour },
      endHour: { $gt: currentHour },
    }).exec();

    console.log("[DEBUG] Final match shift found:", !!shift);
    return !!shift;
  }

  /**
   * Add new shifts (bulk insert by hour slot) for a nurse
   * @param nurseId - Nurse's user ID
   * @param dayOfWeek - 0 (Sun) ~ 6 (Sat)
   * @param hours - Array of hour numbers (e.g., [1, 3, 4] → 01:00–02:00, 03:00–04:00, etc.)
   * @returns The newly added shift entries
   */
  async addShifts(nurseId: string, dayOfWeek: number, hours: number[]) {
    const user = await User.findById(nurseId);
    if (!user) throw new Error("Nurse not found");
    if (user.role !== ROLES.NURSE) throw new Error("User is not a nurse");

    const shiftDocs = hours.map((hour) => ({
      nurseId,
      dayOfWeek,
      startHour: hour,
      endHour: hour + 1,
    }));

    return await NurseShift.insertMany(shiftDocs);
  }

  /**
   * Get all shifts of a nurse across the week
   * @param nurseId - Nurse's user ID
   * @returns All shift entries
   */
  async getAllShifts(nurseId: string): Promise<INurseShift[]> {
    return await NurseShift.find({ nurseId })
      .sort({ dayOfWeek: 1, startHour: 1 })
      .exec();
  }

  /**
   * Replace all shifts for a specific day with new set
   * @param nurseId - The nurse's user ID
   * @param dayOfWeek - Day of week (0–6)
   * @param hours - Array of hour values to keep (e.g., [1, 3, 5])
   */
  async updateShiftsForDay(
    nurseId: string,
    dayOfWeek: number,
    hours: number[],
  ) {
    // Clear existing shifts
    await NurseShift.deleteMany({ nurseId, dayOfWeek });

    // Add new ones
    const newShifts = hours.map((startHour) => ({
      nurseId,
      dayOfWeek,
      startHour,
      endHour: startHour + 1,
    }));

    return NurseShift.insertMany(newShifts);
  }
}

export default new NurseShiftController();
