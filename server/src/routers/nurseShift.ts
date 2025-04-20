// NurseShiftRouter handles operations related to nurse shifts.
// It interacts with the NurseShift model and supports CRUD operations for weekly time-based schedules.

import { Router } from "express";
import NurseShiftController from "../controllers/NurseShiftController";
import HttpError from "../utils/HttpError";

const router = Router();

router
  /**
   * Check if the nurse is currently on shift
   * @route GET /api/nurse-shifts/:nurseId/on-shift
   * @param {string} request.params.nurseId - The ID of the nurse
   * @returns {Object} { onShift: true | false }
   */
  .get("/:nurseId/on-shift", async (request, response) => {
    try {
      const { nurseId } = request.params;
      const onShift = await NurseShiftController.isNurseOnShift(nurseId);
      response.send({ onShift });
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })

  /**
   * Get all shifts of a nurse on a specific day of the week
   * @route GET /api/nurse-shifts/:nurseId/day/:dayOfWeek
   * @param {string} request.params.nurseId - Nurse ID
   * @param {number} request.params.dayOfWeek - Day (0 for Sunday to 6 for Saturday)
   * @returns {Array} Array of shift time slots for the day
   */
  .get("/:nurseId/day/:dayOfWeek", async (request, response) => {
    try {
      const { nurseId, dayOfWeek } = request.params;
      const shifts = await NurseShiftController.getShiftsByNurseAndDay(
        nurseId,
        parseInt(dayOfWeek),
      );
      response.send(shifts);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })

  /**
   * Get all shifts across the entire week for a nurse
   * @route GET /api/nurse-shifts/:nurseId
   * @returns {Array} List of shift slots grouped by weekday
   */
  .get("/:nurseId", async (request, response) => {
    try {
      const { nurseId } = request.params;
      const allShifts = await NurseShiftController.getAllShifts(nurseId);
      response.send(allShifts);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })

  /**
   * Add shifts (multiple hour slots) for a nurse on a day
   * @route POST /api/nurse-shifts/:nurseId/day/:dayOfWeek
   * @param {number[]} request.body.hours - Array of hours to create shifts for (e.g., [1, 3, 5])
   * @returns {Array} The newly created shift entries
   */
  .post("/:nurseId/day/:dayOfWeek", async (request, response) => {
    try {
      const { nurseId, dayOfWeek } = request.params;
      const { hours } = request.body;

      if (!Array.isArray(hours)) {
        throw new HttpError("Missing or invalid 'hours' array", 400);
      }

      const result = await NurseShiftController.addShifts(
        nurseId,
        parseInt(dayOfWeek),
        hours,
      );

      response.status(201).send(result);
    } catch (e) {
      const error = e as HttpError;
      response.status(error.statusCode || 400).send({ message: error.message });
    }
  })

  /**
   * Update all shifts for a nurse on a specific day
   * This replaces the existing shifts for that day
   * @route PUT /api/nurse-shifts/:nurseId/day/:dayOfWeek
   * @param {number[]} request.body.hours - Array of hours to keep for the day
   * @returns {Array} Updated shift entries
   */
  .put("/:nurseId/day/:dayOfWeek", async (request, response) => {
    try {
      const { nurseId, dayOfWeek } = request.params;
      const { hours } = request.body;

      if (!Array.isArray(hours)) {
        throw new HttpError("Missing or invalid 'hours' array", 400);
      }

      const result = await NurseShiftController.updateShiftForDay(
        nurseId,
        parseInt(dayOfWeek),
        hours,
      );

      response.status(200).send(result);
    } catch (e) {
      const error = e as HttpError;
      response.status(error.statusCode || 400).send({ message: error.message });
    }
  });

export default router;
