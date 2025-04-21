import { Router } from "express";
import mongoose from "mongoose";
import MissingPersonController from "../controllers/MissingPersonController";
import MissingPersonFollowUpController from "../controllers/MissingPersonFollowUpController";
import { IMissingFollowUpBase, IMissingFollowUpReqBody } from "../models/MissingFollowUp";


export default Router()
/**
   * @swagger
   * /api/missing-person-followup:
   *   post:
   *     summary: Create a new followup information
   *     description: Check if a reference report exist, if so, create a followup information
   *     tags: [MissingPersonFollowUp]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reportId:
   *                 type: string
   *               isSpotted:
   *                 type: boolean
   *               locationSpotted:
   *                 type: string
   *               datetimeSpotted:
   *                 type: string
   *               additionalComment:
   *                 type: string
   *     responses:
   *       201:
   *         description: Followup info created successfully
   *       404:
   *         description: No Reference Report Exist for this Followup info
   *       500:
   *         description: Server error
   */
    .post('/', async (request, response) => {
        try {
            const followUpData = request.body as Partial<IMissingFollowUpReqBody>;
            const refReport = await MissingPersonController.getMissingPersonById(followUpData.reportId!);

            if (!refReport) {
                return response.status(404).send({
                    message: "Cannot add Followup to non-existent reference report",
                });
            }

            const newFollowUpInput: IMissingFollowUpBase = {
                reportId: new mongoose.Types.ObjectId(followUpData.reportId!),
                isSpotted: followUpData.isSpotted!,
                locationSpotted: followUpData.locationSpotted!,
                datetimeSpotted: new Date(followUpData.datetimeSpotted!),
                additionalComment: followUpData.additionalComment || ""
            };

            const createdFollowUp = await MissingPersonFollowUpController.addFollowUp(newFollowUpInput);
  
            return response.status(201).send(createdFollowUp);

        } catch (error) {
            if (error instanceof Error && error.message.includes("Failed to fetch missing person record")) {
                return response.status(400).send({
                    message: "Cannot add Followup due to bad format reference report id"
                })
            }
        }
    })