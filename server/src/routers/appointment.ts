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
 * /api/appointments/{id}:
 *   get:
 *     summary: Get an appointment by ID
 *     description: Retrieves a specific appointment by its ID.
 *     tags:
 *       - Appointments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the appointment to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Appointment found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       '404':
 *         description: Appointment not found
 */
appointmentRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await AppointmentController.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    return res.status(200).json(appointment);
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
});

appointmentRouter.get("/active", async (_, res) => {
  try {
    const dayOfWeek = new Date().getDay();
    const hour = new Date().getHours();
    const appointments =
      await AppointmentController.findActiveAppointmentsByShiftHour(
        dayOfWeek,
        hour,
      );
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
 * /api/appointments/{id}:
 *   put:
 *     summary: Update an appointment
 *     description: Updates one or more fields of an existing appointment. Only the provided fields will be updated.
 *     tags:
 *       - Appointments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the appointment to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       '200':
 *         description: Appointment successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       '404':
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '400':
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
appointmentRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updated = await AppointmentController.update(id, updatedData);

    if (!updated) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.status(200).json(updated);
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentInput:
 *       type: object
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
 *         dayOfWeek:
 *           type: number
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

/**
 * @swagger
 * /api/appointments/slots/next6:
 *   get:
 *     summary: Get next 6 available nurse appointment slots
 *     description: Returns the next 6 available slots based on nurse shift schedule
 *     tags:
 *       - Appointments
 *     responses:
 *       '200':
 *         description: List of upcoming slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nurseId:
 *                     type: string
 *                   dayOfWeek:
 *                     type: integer
 *                   startHour:
 *                     type: integer
 *                   endHour:
 *                     type: integer
 */
appointmentRouter.get("/slots/next6", async (_, res) => {
  try {
    const slots = await AppointmentController.findNext6AvailableSlots();
    res.status(200).json(slots);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/appointments/user/{userId}/active:
 *   get:
 *     summary: Check if a user has an active appointment
 *     description: Returns true if a user has an unresolved and valid appointment
 *     tags:
 *       - Appointments
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Boolean result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasAppointment:
 *                   type: boolean
 */
appointmentRouter.get("/user/:userId/active", async (req, res) => {
  try {
    const { userId } = req.params;
    const has = await AppointmentController.hasActiveAppointment(userId);
    res.status(200).json({ hasAppointment: has });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});
