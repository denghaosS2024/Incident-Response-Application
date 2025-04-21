// import { OpenAI } from "openai";
import PDFDocument from "pdfkit";
import FirstAidReport from "../models/FirstAidReport";
import HttpError from "../utils/HttpError";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY ?? (() => {
//     throw new Error("Missing OPENAI_API_KEY");
//   })(),
// });

class FirstAidReportController {
  /**
   * Create a structured first aid report from user responses
   */
  async createReport(data: {
    sessionId: string;
    responderId: string;
    responses: {
      primarySymptom: string;
      onsetTime: string;
      severity: string;
      additionalSymptoms: string;
      remediesTaken: string;
    };
  }) {
    try {
      const newReport = new FirstAidReport({
        sessionId: data.sessionId,
        responderId: data.responderId,
        ...data.responses,
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
   * Generate AI guidance steps based on a report (mocked)
   * @param sessionId string
   * @returns An array of step-by-step guidance instructions
   */

  // async generateGuidanceSteps(sessionId: string) {
  //   const report = await this.getReportBySessionId(sessionId);
  //   if (!report) {
  //     throw new HttpError("No report found for this session", 404);
  //   }

  //   const prompt = `Given the following patient report, provide step-by-step first aid guidance.
  //   \nPrimary Symptom: ${report.primarySymptom}
  //   \nOnset Time: ${report.onsetTime}
  //   \nSeverity: ${report.severity}
  //   \nAdditional Symptoms: ${report.additionalSymptoms}
  //   \nRemedies Taken: ${report.remediesTaken}
  //   \nRespond in JSON format as an array of objects with fields: id and text.`;

  //   try {
  //     const completion = await openai.chat.completions.create({
  //       model: "gpt-4",
  //       messages: [{ role: "user", content: prompt }],
  //       temperature: 0.7,
  //     });

  //     const content = completion.choices[0].message?.content;
  //     const parsed = JSON.parse(content || "[]");

  //     if (!Array.isArray(parsed)) {
  //       throw new Error("Invalid AI response format");
  //     }

  //     return parsed;
  //   } catch (error) {
  //     console.error("Error generating AI guidance steps:", error);
  //     throw new HttpError("Failed to generate AI guidance steps", 500);
  //   }
  // }

  /**
   * Generate a PDF version of the first aid report
   * @param sessionId The session ID of the report to generate PDF for
   * @returns PDF document as a Buffer
   */
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

          // Patient Symptoms Section
          doc.fontSize(16).font("Helvetica-Bold").text("Patient Symptoms");
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

          if (parseInt(report.severity) >= 8) {
            recommendedAction = "Call emergency services (911) immediately";
          } else if (parseInt(report.severity) >= 5) {
            recommendedAction = "Seek medical attention as soon as possible";
          }

          doc.fontSize(12).font("Helvetica-Bold").text("Immediate Action:");

          // Highlight critical recommendations
          if (parseInt(report.severity) >= 8) {
            doc.fillColor("red").font("Helvetica").text(recommendedAction);
            doc.fillColor("black");
          } else {
            doc.font("Helvetica").text(recommendedAction);
          }

          // Add footer
          const pageCount = doc.bufferedPageRange().count;
          for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);

            // Save the current y position
            const originalY = doc.y;

            // Move to the bottom of the page
            doc
              .fontSize(10)
              .text(
                `First Aid Report - Generated on ${new Date().toLocaleString()}`,
                doc.page.margins.left,
                doc.page.height - 50,
                { align: "center" },
              );

            // Move back to the saved y position
            doc.y = originalY;
          }

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
