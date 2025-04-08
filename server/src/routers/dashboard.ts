import { Router } from "express";
import {
  createChart,
  deleteChart,
  getChart,
  getCharts,
  modifyChart,
} from "../controllers/DashboardController";

export default Router()
  /**
   * @swagger
   * /api/charts:
   *   post:
   *     summary: Create a new Chart
   *     description: Creates a new chart with aggregated incident data.
   *     tags:
   *       - Charts
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *                 description: The ID of the user creating the chart.
   *                 example: "67e372a4d23e4f090025474c"
   *               name:
   *                 type: string
   *                 description: The name of the chart.
   *                 example: "Incident Type Overview"
   *               type:
   *                 type: string
   *                 enum: [Pie, Bar, Line]
   *                 description: The type of the chart.
   *                 example: "Pie"
   *               dataType:
   *                 type: string
   *                 enum: ["Incident Type"]
   *                 description: The data type used for the chart.
   *                 example: "Incident Type"
   *               startDate:
   *                 type: string
   *                 format: date-time
   *                 description: (Optional) The start date for the data (ISO format).
   *                 example: "2025-03-20T00:00:00.000Z"
   *               endDate:
   *                 type: string
   *                 format: date-time
   *                 description: (Optional) The end date for the data (ISO format).
   *                 example: "2025-03-25T00:00:00.000Z"
   *     responses:
   *       201:
   *         description: Chart created successfully.
   *       400:
   *         description: Validation error or bad request.
   *       500:
   *         description: Internal server error.
   */
  .post("/", async (request, response) => {
    try {
      await createChart(request, response);
    } catch (e) {
      const error = e as Error;
      if (!response.headersSent) {
        response.status(400).send({ message: error.message });
      }
    }
  })

  /**
   * @swagger
   * /api/charts/{chartId}:
   *   get:
   *     summary: Get chart data by ID
   *     description: Retrieves a saved chart and returns the aggregated data.
   *     tags:
   *       - Charts
   *     parameters:
   *       - in: path
   *         name: chartId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the chart to retrieve.
   *     responses:
   *       200:
   *         description: Successfully retrieved chart data.
   *       404:
   *         description: Chart not found.
   *       500:
   *         description: Internal server error.
   */
  .get("/:chartId", async (request, response) => {
    try {
      await getChart(request, response);
    } catch (e) {
      const error = e as Error;
      if (!response.headersSent) {
        response.status(400).send({ message: error.message });
      }
    }
  })

  /**
   * @swagger
   * /api/charts/user/{userId}:
   *   get:
   *     summary: Get all charts for a user
   *     description: Retrieves all saved charts for a user.
   *     tags:
   *       - Charts
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the user to retrieve charts for.
   *     responses:
   *       200:
   *         description: Successfully retrieved user's charts.
   *       500:
   *         description: Internal server error.
   */
  .get("/user/:userId", async (request, response) => {
    try {
      await getCharts(request, response);
    } catch (e) {
      const error = e as Error;
      if (!response.headersSent) {
        response.status(400).send({ message: error.message });
      }
    }
  })

  /**
   * @swagger
   * /api/charts/{chartId}:
   *   put:
   *     summary: Modify an existing chart
   *     description: Updates an existing chart's name, type, or date range.
   *     tags:
   *       - Charts
   *     parameters:
   *       - in: path
   *         name: chartId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the chart to modify.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: The new name of the chart.
   *               type:
   *                 type: string
   *                 enum: [Pie, Bar, Line]
   *                 description: The new chart type.
   *               dataType:
   *                 type: string
   *                 enum: ["Incident Type"]
   *                 description: The new data type used for the chart.
   *               startDate:
   *                 type: string
   *                 format: date-time
   *                 description: (Optional) The updated start date.
   *               endDate:
   *                 type: string
   *                 format: date-time
   *                 description: (Optional) The updated end date.
   *     responses:
   *       200:
   *         description: Chart updated successfully.
   *       404:
   *         description: Chart not found.
   *       500:
   *         description: Internal server error.
   */
  .put("/:chartId", async (request, response) => {
    try {
      await modifyChart(request, response);
    } catch (e) {
      const error = e as Error;
      if (!response.headersSent) {
        response.status(400).send({ message: error.message });
      }
    }
  })

  /**
   * @swagger
   * /api/charts/{chartId}:
   *   delete:
   *     summary: Delete a chart by ID
   *     description: Deletes a chart from the database.
   *     tags:
   *       - Charts
   *     parameters:
   *       - in: path
   *         name: chartId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the chart to delete.
   *     responses:
   *       200:
   *         description: Chart deleted successfully.
   *       404:
   *         description: Chart not found.
   *       500:
   *         description: Internal server error.
   */
  .delete("/:chartId", async (request, response) => {
    try {
      await deleteChart(request, response);
    } catch (e) {
      const error = e as Error;
      if (!response.headersSent) {
        response.status(400).send({ message: error.message });
      }
    }
  });
