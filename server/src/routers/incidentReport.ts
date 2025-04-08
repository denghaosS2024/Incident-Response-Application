import { Router } from "express";
import IncidentReport from "../models/IncidentReport";

const incidentReportRouter = Router();

/**
 * @swagger
 * /api/incidentReports:
 *   post:
 *     summary: Create or update an incident report
 *     tags: [IncidentReports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [incidentId]
 *             properties:
 *               incidentId:
 *                 type: string
 *               effectiveness:
 *                 type: number
 *               resourceAllocation:
 *                 type: number
 *               team:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     rating:
 *                       type: number
 *               additionalInfo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report saved successfully
 *       400:
 *         description: Missing required fields
 */
incidentReportRouter.post("/", async (req, res) => {
  try {
    const {
      incidentId,
      effectiveness,
      resourceAllocation,
      team,
      additionalInfo,
    } = req.body;

    if (!incidentId) {
      res.status(400).json({ message: "incidentId is required" });
      return;
    }

    const result = await IncidentReport.findOneAndUpdate(
      { incidentId },
      { effectiveness, resourceAllocation, team, additionalInfo },
      { upsert: true, new: true },
    );

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to save report" });
  }
});

/**
 * @swagger
 * /api/incidentReports/{incidentId}:
 *   get:
 *     summary: Get report by incident ID
 *     tags: [IncidentReports]
 *     parameters:
 *       - in: path
 *         name: incidentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report found
 *       404:
 *         description: Report not found
 */
incidentReportRouter.get("/:incidentId", async (req, res) => {
  try {
    const report = await IncidentReport.findOne({
      incidentId: req.params.incidentId,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json(report);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch report" });
  }
});

export default incidentReportRouter;
