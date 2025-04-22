// NurseShiftRouter handles operations related to nurse shifts.
// It interacts with the NurseShift model and supports CRUD operations for weekly time-based schedules.

import { Router } from "express";
import NurseShiftController from "../controllers/NurseShiftController";
import HttpError from "../utils/HttpError";

export default Router()
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
   * @swagger
   * /api/nurse-shifts/active:
   *   get:
   *     summary: Get the active hours and days for a nurse
   *     description: Get the active hours and days for a nurse
   *     tags: [NurseShift]
   *     parameters:
   *       - name: nurseId
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Active hours and days for the nurse
   *       400:
   *         description: Bad request
   */
  .get("/active", async (request, response) => {
    try {
      if (!request.query.nurseId) {
        throw new HttpError("Nurse ID is required", 400);
      }

      const nurseId = request.query.nurseId as string;
      const activeHours = await NurseShiftController.getActiveHours(nurseId);
      response.send(activeHours);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })

  /**
   * @swagger
   * /api/nurse-shifts/active:
   *   post:
   *     summary: Update the active hours and days for a nurse
   *     description: Update the active hours and days for a nurse
   *     tags: [NurseShift]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nurseId:
   *                 type: string
   *               days:
   *                 type: array
   *                 items:
   *                   type: number
   *               hours:
   *                 type: array
   *                 items:
   *                   type: number
   *     responses:
   *       200:
   *         description: Active hours updated successfully
   *       400:
   *         description: Bad request
   */
  .post("/active", async (request, response) => {
    try {
      if (!request.body.nurseId) {
        throw new HttpError("Nurse ID is required", 400);
      }

      const { nurseId, days, hours } = request.body;
      const result = await NurseShiftController.updateActiveHours(
        nurseId,
        days,
        hours,
      );

      if (!result) {
        throw new HttpError("Failed to update active hours", 400);
      }

      response.status(200).send({ message: "Active hours updated" });
    } catch (e) {
      const error = e as HttpError;
      response.status(error.statusCode || 400).send({ message: error.message });
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
