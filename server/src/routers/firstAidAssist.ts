import { Router } from "express";
import FirstAidReportController from "../controllers/FirstAidAssistController";
import HttpError from "../utils/HttpError";

export default Router()
  /**
   * @swagger
   * /api/first-aid/report:
   *   post:
   *     summary: Generate a patient report from Q&A responses
   *     tags: [First Aid]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - questions
   *               - answers
   *             properties:
   *               sessionId:
   *                 type: string
   *                 description: Optional - if not provided, will be generated by the server
   *               questions:
   *                 type: array
   *                 items:
   *                   type: string
   *               answers:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       201:
   *         description: Report created successfully
   *       500:
   *         description: Server error
   */
  .post("/report", async (req, res) => {
    try {
      const { sessionId, questions, answers } = req.body;

      if (!questions || !answers) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      // Validate that questions and answers arrays have matching lengths
      if (questions.length !== answers.length) {
        return res.status(400).json({
          message: "Questions and answers arrays must have the same length.",
        });
      }

      const report = await FirstAidReportController.createReport({
        sessionId,
        questions,
        answers,
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
})

  /**
   * @swagger
   * /api/first-aid/guidance/{sessionId}:
   *   get:
   *     summary: Generate AI guidance steps based on a report
   *     tags: [First Aid]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         description: The session ID of the report to generate guidance for
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Guidance steps generated successfully
   *       404:
   *         description: Report not found
   *       500:
   *         description: Server error
   */
  .get("/guidance/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ message: "Missing session ID." });
      }

      const steps =
        await FirstAidReportController.generateGuidanceSteps(sessionId);

      return res.status(200).json(steps);
    } catch (e) {
      const error = e as HttpError;
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  })

  /**
   * @swagger
   * /api/first-aid/generate-pdf/{sessionId}:
   *   get:
   *     summary: Generate a PDF report from a first aid report
   *     tags: [First Aid]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         description: The session ID of the report to generate PDF for
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: PDF generated successfully
   *       404:
   *         description: Report not found
   *       500:
   *         description: Server error
   */
  .get("/generate-pdf/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
  
      if (!sessionId) {
        return res.status(400).json({ message: "Missing session ID." });
      }
  
      const pdfData = await FirstAidReportController.generateReportPDF(sessionId);
      return res.status(200).json(pdfData);
    } catch (e) {
      const error = e as HttpError;
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  })

  /**
   * @swagger
   * /api/first-aid/download/{filename}:
   *   get:
   *     summary: Download a generated PDF report
   *     tags: [First Aid]
   *     parameters:
   *       - in: path
   *         name: filename
   *         required: true
   *         description: The filename of the PDF to download
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: PDF file
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: PDF not found
   *       500:
   *         description: Server error
   */
  .get("/download/:filename", async (req, res) => {
    try {
      const { filename } = req.params;

      if (!filename) {
        return res.status(400).json({ message: "Missing filename." });
      }

      const pdfPath = FirstAidReportController.getReportPDFPath(filename);
      
      // Set the appropriate headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Send the file
      return res.download(pdfPath, filename, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).json({ message: "Failed to download file" });
          return; 
        }
      });
    } catch (e) {
      const error = e as HttpError;
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  })

  /**
 * @swagger
 * /api/first-aid/conversation:
 *   post:
 *     summary: Continue a conversation with the AI based on session context
 *     tags: [First Aid]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - content
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: The session ID of the conversation
 *               content:
 *                 type: string
 *                 description: The user message to send to the AI
 *     responses:
 *       200:
 *         description: AI response returned successfully
 *       400:
 *         description: Missing session or message content
 *       500:
 *         description: Server error
 */
.post("/conversation", async (req, res) => {
  try {
    const { sessionId, content } = req.body;

    if (!sessionId || !content) {
      return res.status(400).json({ message: "Missing sessionId or content." });
    }

    const result = await FirstAidReportController.sendMessage({
      sessionId,
      sender: "user",
      content,
    });

    return res.status(200).json(result);
  } catch (e) {
    const error = e as HttpError;
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message });
  }
});