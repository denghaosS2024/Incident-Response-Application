import { Router } from "express";
import MissingPersonController from "../controllers/MissingPersonController";
import type { IMissingPerson } from "../models/MissingPerson";
import UserConnections from "../utils/UserConnections";

export default Router()
  /**
   * @swagger
   * /api/missing-person/register:
   *   post:
   *     summary: Register a new missing person report
   *     description: Create a new missing person record. Broadcasts the new report (without the photo) to connected clients.
   *     tags: [MissingPerson]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - age
   *               - race
   *               - gender
   *               - dateLastSeen
   *             properties:
   *               name:
   *                 type: string
   *               age:
   *                 type: number
   *               race:
   *                 type: string
   *                 description: One of the predefined race enums
   *               gender:
   *                 type: string
   *                 description: One of the predefined gender enums
   *               dateLastSeen:
   *                 type: string
   *                 format: date
   *               weight:
   *                 type: number
   *               height:
   *                 type: number
   *               eyeColor:
   *                 type: string
   *               description:
   *                 type: string
   *               locationLastSeen:
   *                 type: string
   *               photo:
   *                 type: string
   *                 format: uri
   *     responses:
   *       201:
   *         description: Missing person report created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MissingPerson'
   *       400:
   *         description: Bad request — mandatory fields missing
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: name, age, race, gender, and dateLastSeen are mandatory fields.
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  .post("/register", async (request, response) => {
    try {
      const missingPersonData = request.body as Partial<IMissingPerson>;
      if (!isValidMissingPersonData(missingPersonData)) {
        return response.status(400).send({
          message:
            "name, age, race, gender, and dateLastSeen are mandatory fields.",
        });
      }
      const result = await MissingPersonController.create(missingPersonData);
      const plainResult = result.toObject();

      const { photo, ...resultWithoutPhoto } = plainResult;
      UserConnections.broadcast("missingPerson", resultWithoutPhoto);
      return response.status(201).send(result);
    } catch (e) {
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  })

  /**
   * @swagger
   * /api/missing-person/report:
   *   get:
   *     summary: Retrieve missing person reports
   *     description: Returns all reports sorted by name. If an `id` query parameter is provided, returns the single report matching that ID.
   *     tags: [MissingPerson]
   *     parameters:
   *       - in: query
   *         name: id
   *         schema:
   *           type: string
   *         description: Optional report ID to fetch a specific record
   *     responses:
   *       200:
   *         description: One or more missing person reports retrieved
   *         content:
   *           application/json:
   *             schema:
   *               oneOf:
   *                 - type: array
   *                   items:
   *                     $ref: '#/components/schemas/MissingPerson'
   *                 - $ref: '#/components/schemas/MissingPerson'
   *       404:
   *         description: Report not found for the given ID
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Missing person report not found.
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  .get("/report", async (request, response) => {
    try {
      const { id } = request.query;
      if (id) {
        const result = await MissingPersonController.getMissingPersonById(
          id as string,
        );
        if (!result) {
          return response.status(404).send({
            message: "Missing person report not found.",
          });
        }
        return response.status(200).send(result);
      } else {
        const result = await MissingPersonController.getAllMissingPersons();
        return response.status(200).send(result);
      }
    } catch (e) {
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  })

  .get("/:id", async (request, response) => {
    try {
      const { id } = request.params;
      const result = await MissingPersonController.getMissingPersonById(id);
      if (!result) {
        return response.status(404).send({
          message: "Missing person report not found.",
        });
      }
      return response.status(200).send(result);
    } catch (e) {
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  })

  .put("/:id", async (request, response) => {
    try {
      const { id } = request.params;
      const updateData = request.body as Partial<IMissingPerson>;

      const result = await MissingPersonController.updateMissingPerson(
        id,
        updateData,
      );
      if (!result) {
        return response.status(404).send({
          message: "Missing person report not found.",
        });
      }

      return response.status(200).send(result);
    } catch (e) {
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  })

  .patch("/:id/found", async (request, response) => {
    try {
      const { id } = request.params;

      const result = await MissingPersonController.markAsFound(id);
      if (!result) {
        return response.status(404).send({
          message: "Missing person report not found.",
        });
      }

      return response.status(200).send(result);
    } catch (e) {
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  });

/**
 * Validate missing person register request.
 *
 * @param data Partial missing person data from the request.
 * @returns true if all mandatory fields are present, otherwise false.
 */
function isValidMissingPersonData(data: Partial<IMissingPerson>): boolean {
  return !!(
    data.name &&
    data.age != null &&
    data.race &&
    data.gender &&
    data.dateLastSeen
  );
}
