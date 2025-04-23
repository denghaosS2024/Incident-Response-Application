import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources/chat/completions";
import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";
import AiSession from "../models/AiSession";
import FirstAidReport from "../models/FirstAidReport";
import HttpError from "../utils/HttpError";
import { getOpenAIClient } from "../utils/openAiClient";


class FirstAidReportController {
  /**
   * Create a structured first aid report from user Q&A responses
   */
  async createReport(data: {
    sessionId?: string;
    questions: string[];
    answers: string[];
  }) {
    try {
      const sessionId = data.sessionId || uuidv4();
      const openai = getOpenAIClient();
  
      const prompt = `
  You are a medical assistant AI. Given the following Q&A, extract and summarize key patient information into a structured format.
  
  Respond only in valid JSON with the following fields:
  - primarySymptom
  - onsetTime
  - severity
  - additionalSymptoms
  - remediesTaken
  
  Q&A:
  ${data.questions.map((q, i) => `Q: ${q}\nA: ${data.answers[i]}`).join("\n\n")}
  
  Example Output:
  {
    "primarySymptom": "...",
    "onsetTime": "...",
    "severity": "...",
    "additionalSymptoms": "...",
    "remediesTaken": "..."
  }
      `.trim();
  
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      });
  
      const content = completion.choices[0].message?.content;
      const parsed = JSON.parse(content || "{}");
  
      const newReport = new FirstAidReport({
        sessionId,
        questions: data.questions,
        answers: data.answers,
        primarySymptom: parsed.primarySymptom || "Not provided",
        onsetTime: parsed.onsetTime || "Not provided",
        severity: parsed.severity || "Not provided",
        additionalSymptoms: parsed.additionalSymptoms || "Not provided",
        remediesTaken: parsed.remediesTaken || "Not provided",
      });
  
      await newReport.save();
      return newReport;
    } catch (error) {
      console.error("Error creating report:", error);
      throw new HttpError("Failed to generate report", 500);
    }
  }
  

  // The rest of the controller methods stay the same
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

    const systemPrompt: ChatCompletionMessageParam = {
      role: "system",
      content: "You are a medical assistant guiding a responder through first aid.",
    };

    const userPrompt: ChatCompletionMessageParam = {
      role: "user",
      content: `Given the following patient report, provide step-by-step first aid guidance.
Primary Symptom: ${report.primarySymptom}
Onset Time: ${report.onsetTime}
Severity: ${report.severity}
Additional Symptoms: ${report.additionalSymptoms}
Remedies Taken: ${report.remediesTaken}
Respond in JSON format as an array of objects with fields: id and text.`,
    };

    try {
      const openai = getOpenAIClient();

      const messages: ChatCompletionMessageParam[] = [systemPrompt, userPrompt];

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
        temperature: 0.7,
      });

      const content = completion.choices[0].message?.content ?? "";
      const parsed = JSON.parse(content || "[]");

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid AI response format");
      }

      await AiSession.findOneAndUpdate(
        { sessionId },
        {
          $setOnInsert: {
            sessionId,
            startedAt: new Date(),
          },
          $set: { lastUpdated: new Date() },
          $push: {
            messages: {
              $each: [
                systemPrompt,
                userPrompt,
                { role: "assistant", content: content },
              ],
            },
          },
        },
        { upsert: true, new: true }
      );

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

  async sendMessage(data: {
    sessionId: string;
    sender: "user";
    content: string;
  }) {
    const { sessionId, sender, content } = data;

    const session = await AiSession.findOne({ sessionId });
    if (!session) {
      throw new HttpError("Session not found. Generate guidance first.", 400);
    }

    session.messages.push({ role: sender, content });
    await session.save();

    const messages: ChatCompletionMessageParam[] = session.messages.map((msg) => {
      if (msg.role === "system") {
        return {
          role: "system",
          content: msg.content as string,
        } satisfies ChatCompletionSystemMessageParam;
      } else if (msg.role === "user") {
        return {
          role: "user",
          content: msg.content as string,
        } satisfies ChatCompletionUserMessageParam;
      } else {
        return {
          role: "assistant",
          content: msg.content as string,
        } satisfies ChatCompletionAssistantMessageParam;
      }
    });

    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0].message?.content;
      if (!aiResponse) throw new Error("Empty response from OpenAI");

      session.messages.push({ role: "assistant", content: aiResponse });
      session.lastUpdated = new Date();
      await session.save();

      return { response: aiResponse };
    } catch (error) {
      console.error("Error sending message to AI:", error);
      throw new HttpError("Failed to get response from AI", 500);
    }
  }
}

export default new FirstAidReportController();
