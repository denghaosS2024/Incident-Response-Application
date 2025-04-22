import { OpenAI } from "openai";
import PDFDocument from "pdfkit";
import FirstAidReport from "../models/FirstAidReport";
import HttpError from "../utils/HttpError";

let openaiInstance: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

class FirstAidReportController {
  /**
   * Create a structured first aid report from user Q&A responses
   */
  async createReport(data: {
    sessionId: string;
    responderId: string;
    questions: string[];
    answers: string[];
  }) {
    try {
      // Map the Q&A to the structured fields based on question content
      // This assumes the questions array maintains a consistent order
      const primarySymptomIndex = data.questions.findIndex((q) =>
        q.includes("primary symptoms"),
      );
      const onsetTimeIndex = data.questions.findIndex((q) =>
        q.includes("first start showing these symptoms"),
      );
      const severityIndex = data.questions.findIndex(
        (q) => q.includes("scale from 1 to 10") || q.includes("how severe"),
      );
      const additionalSymptomsIndex = data.questions.findIndex((q) =>
        q.includes("other symptoms"),
      );
      const remediesTakenIndex = data.questions.findIndex(
        (q) =>
          q.includes("alleviate these symptoms") ||
          q.includes("medication or home remedies"),
      );

      // Create the new report with mapped fields
      const newReport = new FirstAidReport({
        sessionId: data.sessionId,
        responderId: data.responderId,
        questions: data.questions,
        answers: data.answers,
        primarySymptom:
          primarySymptomIndex >= 0
            ? data.answers[primarySymptomIndex]
            : "Not provided",
        onsetTime:
          onsetTimeIndex >= 0 ? data.answers[onsetTimeIndex] : "Not provided",
        severity:
          severityIndex >= 0 ? data.answers[severityIndex] : "Not provided",
        additionalSymptoms:
          additionalSymptomsIndex >= 0
            ? data.answers[additionalSymptomsIndex]
            : "Not provided",
        remediesTaken:
          remediesTakenIndex >= 0
            ? data.answers[remediesTakenIndex]
            : "Not provided",
      });

      await newReport.save();
      return newReport;
    } catch (error) {
      console.error("Error creating report:", error);
      throw new HttpError("Failed to generate report", 500);
    }
  }

  async getReportBySessionId(sessionId: string) {
    try {
      const report = await FirstAidReport.findOne({ sessionId });
      return report;
    } catch (error) {
      console.error("Error fetching report by sessionId:", error);
      throw new HttpError("Failed to retrieve report", 500);
    }
  }

  /**
   * Generate AI guidance steps based on a report
   * @param sessionId string
   * @returns An array of step-by-step guidance instructions
   */
  async generateGuidanceSteps(sessionId: string) {
    const report = await this.getReportBySessionId(sessionId);
    if (!report) {
      throw new HttpError("No report found for this session", 404);
    }

    const prompt = `Given the following patient report, provide step-by-step first aid guidance.
    \nPrimary Symptom: ${report.primarySymptom}
    \nOnset Time: ${report.onsetTime}
    \nSeverity: ${report.severity}
    \nAdditional Symptoms: ${report.additionalSymptoms}
    \nRemedies Taken: ${report.remediesTaken}
    \nRespond in JSON format as an array of objects with fields: id and text.`;

    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const content = completion.choices[0].message?.content;
      const parsed = JSON.parse(content || "[]");

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid AI response format");
      }

      return parsed;
    } catch (error) {
      console.error("Error generating AI guidance steps:", error);
      throw new HttpError("Failed to generate AI guidance steps", 500);
    }
  }

  async generateReportPDF(sessionId: string): Promise<Buffer> {
    try {
      const report = await this.getReportBySessionId(sessionId);

      if (!report) {
        throw new HttpError("No report found for this session", 404);
      }

      // Create a promise to handle the asynchronous PDF generation
      return new Promise((resolve, reject) => {
        try {
          // Create a PDF document
          const doc = new PDFDocument();
          const buffers: Buffer[] = [];

          // Collect data chunks
          doc.on("data", (chunk) => buffers.push(chunk));

          // Resolve promise with the complete PDF data
          doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
          });

          // Add content to the PDF
          // Header
          doc
            .fontSize(20)
            .font("Helvetica-Bold")
            .text("First Aid Report", { align: "center" });
          doc.moveDown();

          // Report metadata
          doc.fontSize(12).font("Helvetica");
          doc.text(`Report ID: ${report.reportId}`);
          doc.text(`Session ID: ${report.sessionId}`);
          doc.text(`Created: ${new Date(report.createdAt).toLocaleString()}`);
          doc.moveDown();

          // Q&A Section
          doc.fontSize(16).font("Helvetica-Bold").text("Assessment Responses");
          doc.moveDown(0.5);

          // Display each question and answer pair
          report.questions.forEach((question, index) => {
            const answer = report.answers[index] || "Not answered";

            doc.fontSize(12).font("Helvetica-Bold").text(`Q: ${question}`);
            doc.fontSize(12).font("Helvetica").text(`A: ${answer}`);
            doc.moveDown(0.5);
          });
          doc.moveDown();

          // Patient Symptoms Section
          doc
            .fontSize(16)
            .font("Helvetica-Bold")
            .text("Interpretation Summary");
          doc.moveDown(0.5);

          doc.fontSize(12).font("Helvetica-Bold").text("Primary Symptom:");
          doc.font("Helvetica").text(report.primarySymptom);
          doc.moveDown(0.5);

          doc.fontSize(12).font("Helvetica-Bold").text("Onset Time:");
          doc.font("Helvetica").text(report.onsetTime);
          doc.moveDown(0.5);

          doc.fontSize(12).font("Helvetica-Bold").text("Severity Level:");
          doc.font("Helvetica").text(report.severity);
          doc.moveDown(0.5);

          // Additional Information Section
          doc
            .fontSize(16)
            .font("Helvetica-Bold")
            .text("Additional Information");
          doc.moveDown(0.5);

          doc.fontSize(12).font("Helvetica-Bold").text("Additional Symptoms:");
          doc
            .font("Helvetica")
            .text(report.additionalSymptoms || "Not provided");
          doc.moveDown(0.5);

          doc.fontSize(12).font("Helvetica-Bold").text("Remedies Taken:");
          doc.font("Helvetica").text(report.remediesTaken || "Not provided");
          doc.moveDown();

          // Recommended Actions Section
          doc.fontSize(16).font("Helvetica-Bold").text("Recommended Actions");
          doc.moveDown(0.5);

          // Determine recommended action based on severity
          let recommendedAction =
            "Monitor symptoms and seek medical attention if condition worsens";

          // Try to parse the severity - handle cases where it might be textual
          let severityValue = 0;
          try {
            // Try to find a number in the severity response
            const severityMatch = report.severity.match(/\d+/);
            if (severityMatch) {
              severityValue = parseInt(severityMatch[0]);
            } else if (
              report.severity.toLowerCase().includes("severe") ||
              report.severity.toLowerCase().includes("extreme") ||
              report.severity.toLowerCase().includes("bad")
            ) {
              severityValue = 8; // Treat as high severity
            } else if (
              report.severity.toLowerCase().includes("moderate") ||
              report.severity.toLowerCase().includes("medium")
            ) {
              severityValue = 5; // Treat as medium severity
            }
          } catch (e) {
            console.error("Error parsing severity:", e);
          }

          if (severityValue >= 8) {
            recommendedAction = "Call emergency services (911) immediately";
          } else if (severityValue >= 5) {
            recommendedAction = "Seek medical attention as soon as possible";
          }

          doc.fontSize(12).font("Helvetica-Bold").text("Immediate Action:");

          // Highlight critical recommendations
          if (severityValue >= 8) {
            doc.fillColor("red").font("Helvetica").text(recommendedAction);
            doc.fillColor("black");
          } else {
            doc.font("Helvetica").text(recommendedAction);
          }

          // Add footer
          doc
            .fontSize(10)
            .text(
              `First Aid Report - Generated on ${new Date().toLocaleString()}`,
              doc.page.margins.left,
              doc.page.height - 50,
              { align: "center" },
            );

          // Finalize the PDF
          doc.end();
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error("Error generating PDF report:", error);
      throw new HttpError("Failed to generate PDF report", 500);
    }
  }
}

export default new FirstAidReportController();
