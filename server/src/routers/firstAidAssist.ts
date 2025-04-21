import { Router } from "express";
import FirstAidReportController from "../controllers/FirstAidAssistController";
import HttpError from "../utils/HttpError";

export default Router()
  /**
   * @swagger
   * /api/first-aid/report:
   *   post:
   *     summary: Generate a patient report from responses
   *     tags: [First Aid]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sessionId
   *               - responderId
   *               - responses
   *             properties:
   *               sessionId:
   *                 type: string
   *               responderId:
   *                 type: string
   *               responses:
   *                 type: object
   *                 properties:
   *                   primarySymptom:
   *                     type: string
   *                   onsetTime:
   *                     type: string
   *                   severity:
   *                     type: string
   *                   additionalSymptoms:
   *                     type: string
   *                   remediesTaken:
   *                     type: string
   *     responses:
   *       201:
   *         description: Report created successfully
   *       500:
   *         description: Server error
   */
  .post("/report", async (req, res) => {
    try {
      const { sessionId, responderId, responses } = req.body;

      if (!sessionId || !responderId || !responses) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      const report = await FirstAidReportController.createReport({
        sessionId,
        responderId,
        responses,
      });

      return res.status(201).json(report);
    } catch (e) {
      const error = e as HttpError;
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  })

  /**
   * @swagger
   * /api/first-aid/report/{sessionId}:
   *   get:
   *     summary: Get a report by session ID
   *     tags: [First Aid]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         description: The session ID of the report to retrieve
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Report retrieved successfully
   *       404:
   *         description: Report not found
   */
  .get("/report/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ message: "Missing session ID." });
      }

      const report =
        await FirstAidReportController.getReportBySessionId(sessionId);

      if (!report) {
        return res.status(404).json({ message: "Report not found." });
      }

      return res.status(200).json(report);
    } catch (e) {
      const error = e as HttpError;
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  });

// /**
//  * @swagger
//  * /api/first-aid/guidance/{sessionId}:
//  *   get:
//  *     summary: Generate AI guidance steps based on a report
//  *     tags: [First Aid]
//  *     parameters:
//  *       - in: path
//  *         name: sessionId
//  *         required: true
//  *         description: The session ID of the report to generate guidance for
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Guidance steps generated successfully
//  *       404:
//  *         description: Report not found
//  *       500:
//  *         description: Server error
//  */
// .get("/guidance/:sessionId", async (req, res) => {
//   try {
//     const { sessionId } = req.params;

//     if (!sessionId) {
//       return res.status(400).json({ message: "Missing session ID." });
//     }

//     const steps =
//       await FirstAidReportController.generateGuidanceSteps(sessionId);

//     return res.status(200).json(steps);
//   } catch (e) {
//     const error = e as HttpError;
//     return res
//       .status(error.statusCode || 500)
//       .json({ message: error.message });
//   }
// });
