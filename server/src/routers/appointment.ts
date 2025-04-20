import { Router } from "express";
import AppointmentController from "../controllers/AppointmentController";
import { IAppointment } from "../models/Appointment";
const appointmentRouter = Router();

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     description: Creates a new appointment and assigns it to the specified user and nurse.
 *     tags:
 *       - Appointments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       '201':
 *         description: Appointment successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       '400':
 *         description: Bad request, invalid input or user does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
appointmentRouter.post("/", async (req, res) => {
  try {
    const appointmentData: IAppointment = req.body;
    const newAppointment = await AppointmentController.create(appointmentData);
    res.status(201).json(newAppointment);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/appointments/past:
 *   get:
 *     summary: Get resolved (past) appointments for a user
 *     description: Retrieves appointments marked as resolved for a specific user, using their ID from query parameter.
 *     tags:
 *       - Appointments
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to fetch past appointments for
 *     responses:
 *       '200':
 *         description: A list of resolved appointments for the specified user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       '400':
 *         description: Bad request, invalid userId or user does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
appointmentRouter.get("/past", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const appointments = await AppointmentController.findByUserId(userId, true);
    res.status(200).json(appointments);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/appointments/{id}/resolve:
 *   put:
 *     summary: Mark an appointment as resolved
 *     description: Sets the isResolved flag to true for a specific appointment.
 *     tags:
 *       - Appointments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the appointment to resolve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Appointment successfully marked as resolved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       '404':
 *         description: Appointment not found
 *       '400':
 *         description: Invalid request
 */
appointmentRouter.put("/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await AppointmentController.update(id, {
      isResolved: true,
      closedDate: new Date(Date.now()),
    });

    if (!updated) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.status(200).json(updated);
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
});

export default appointmentRouter;

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentInput:
 *       type: object
 *       required:
 *         - userId
 *         - issueName
 *         - startHour
 *         - endHour
 *       properties:
 *         userId:
 *           type: string
 *         nurseId:
 *           type: string
 *         issueName:
 *           type: string
 *         severityIndex:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         startHour:
 *           type: number
 *           minimum: 0
 *           maximum: 23
 *         endHour:
 *           type: number
 *           minimum: 0
 *           maximum: 23
 *
 *     Appointment:
 *       allOf:
 *         - $ref: '#/components/schemas/AppointmentInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *             createDate:
 *               type: string
 *               format: date-time
 *             updateDate:
 *               type: string
 *               format: date-time
 *             closedDate:
 *               type: string
 *               format: date-time
 *               nullable: true
 *             note:
 *               type: string
 *             isResolved:
 *               type: boolean
 *             feedback:
 *               type: string
 *             valid:
 *               type: boolean
 */
