import { Router } from "express";
import PatientPlanController from "../controllers/PatientPlanController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PatientPlan
 *   description: Manage medication and exercise plans for discharged patients
 */

/**
 * @swagger
 * /api/patientPlan/by-user/{username}:
 *   get:
 *     summary: Get a patient's plan by their username
 *     tags: [PatientPlan]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the patient
 *     responses:
 *       200:
 *         description: Patient plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patientId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 medications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Medication'
 *                 exercises:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Patient plan not found
 *       500:
 *         description: Server error
 */

router.get("/by-user/:username", PatientPlanController.getPatientByUsername);

/**
 * @swagger
 * /api/patientPlan/{patientId}:
 *   get:
 *     summary: Get the plan of a patient
 *     tags: [PatientPlan]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the patient
 *     responses:
 *       200:
 *         description: Patient plan found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PatientPlan"
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.get("/:patientId", PatientPlanController.getPatientPlan);

/**
 * @swagger
 * /api/patientPlan/{patientId}/medications:
 *   post:
 *     summary: Add a medication to a patient's plan
 *     tags: [PatientPlan]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - frequency
 *               - time
 *               - route
 *             properties:
 *               name:
 *                 type: string
 *               frequency:
 *                 type: string
 *               time:
 *                 type: string
 *               route:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medication added successfully
 *       500:
 *         description: Server error
 */
router.post("/:patientId/medications", PatientPlanController.addMedication);

/**
 * @swagger
 * /api/patientPlan/{patientId}/medications/{index}:
 *   delete:
 *     summary: Remove a medication from a patient's plan by index
 *     tags: [PatientPlan]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the patient
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of the medication in the list
 *     responses:
 *       200:
 *         description: Medication removed successfully
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.delete("/:patientId/medications/:index", PatientPlanController.removeMedication);

/**
 * @swagger
 * /api/patientPlan/{patientId}/medications/{index}:
 *   put:
 *     summary: Update an existing medication by index
 *     tags: [PatientPlan]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               frequency: { type: string }
 *               time: { type: string }
 *               route: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Medication updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.put("/:patientId/medications/:index", PatientPlanController.updateMedication);

/**
 * @swagger
 * /api/patientPlan/{patientId}/exercises:
 *   put:
 *     summary: Update exercise list for a patient plan
 *     tags: [PatientPlan]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Exercise list updated
 *       404:
 *         description: Patient plan not found
 *       500:
 *         description: Server error
 */
router.put("/:patientId/exercises", PatientPlanController.updateExercises);

export default router;
