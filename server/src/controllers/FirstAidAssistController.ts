import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources/chat/completions";
import path from "path";
import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";
import AiSession from "../models/AiSession";
import FirstAidReport from "../models/FirstAidReport";
import HttpError from "../utils/HttpError";
import { getOpenAIClient } from "../utils/openaiClient";

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

      const content = completion.choices[0].message?.content ?? "{}";
      const parsed = JSON.parse(content);

      // Ensure array↔string normalization
      const primarySymptom = this.ensureString(
        parsed.primarySymptom,
        "Not provided",
      );
      const onsetTime = this.ensureString(parsed.onsetTime, "Not provided");
      const severity = this.ensureString(parsed.severity, "Not provided");
      const additionalSymptoms = this.ensureString(
        parsed.additionalSymptoms,
        "Not provided",
      );
      const remediesTaken = this.ensureString(
        parsed.remediesTaken,
        "Not provided",
      );

      const newReport = new FirstAidReport({
        sessionId,
        questions: data.questions,
        answers: data.answers,
        primarySymptom,
        onsetTime,
        severity,
        additionalSymptoms,
        remediesTaken,
      });

      await newReport.save();
      return newReport;
    } catch (error) {
      console.error("Error creating report:", error);
      throw new HttpError("Failed to generate report", 500);
    }
  }

  /** Convert arrays → comma-lists and all other values → strings */
  private ensureString(value: any, defaultValue: string): string {
    if (value == null) return defaultValue;
    return Array.isArray(value) ? value.join(", ") : String(value);
  }

  /** Fetch a saved report by its sessionId */
  async getReportBySessionId(sessionId: string) {
    try {
      return await FirstAidReport.findOne({ sessionId });
    } catch (error) {
      console.error("Error fetching report:", error);
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
      content:
        "You are a medical assistant guiding a responder through first aid.",
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
        { upsert: true, new: true },
      );

      return parsed;
    } catch (error) {
      console.error("Error generating AI guidance steps:", error);
      throw new HttpError("Failed to generate AI guidance steps", 500);
    }
  }

  /**
   * Generate a PDF and return it as a Base64 data URL + a filename
   */
  async generateReportPDF(sessionId: string) {
    try {
      const report = await this.getReportBySessionId(sessionId);

      if (!report) {
        throw new HttpError("No report found for this session", 404);
      }

      // Generate PDF in memory as a buffer
      const pdfBuffer = await this.createPDFBuffer(report);

      // Convert to Base64
      const base64Pdf = pdfBuffer.toString("base64");

      // Create a data URL for direct downloading
      const dataUrl = `data:application/pdf;base64,${base64Pdf}`;

      return {
        pdfDataUrl: dataUrl,
        filename: `report-${report.reportId}.pdf`,
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new HttpError("Failed to generate PDF report", 500);
    }
  }

  /**
   * Create a PDF document as a buffer in memory
   */
  private createPDFBuffer(report: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create a PDF document with an in-memory buffer
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        // Capture chunks of data
        doc.on("data", (chunk) => chunks.push(chunk));

        // When document is finished, resolve with the complete buffer
        doc.on("end", () => {
          const result = Buffer.concat(chunks);
          resolve(result);
        });

        // Add content to the PDF
        this.addHeader(doc);
        this.addMetadata(doc, report);
        this.addAssessment(doc, report);
        this.addQAndA(doc, report);

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add header to the PDF
   */
  private addHeader(doc: typeof PDFDocument.prototype): void {
    doc
      .fontSize(24)
      .fillColor("#202124")
      .text("First Aid Report", { align: "center" })
      .moveDown();
  }

  /**
   * Add metadata to the PDF
   */
  private addMetadata(doc: typeof PDFDocument.prototype, report: any): void {
    doc
      .fontSize(12)
      .fillColor("#5f6368")
      .text(`Report ID: ${report.reportId}`)
      .text(`Session ID: ${report.sessionId}`)
      .text(`Generated: ${this.formatDate(report.createdAt)}`)
      .moveDown();
  }

  /**
   * Add patient assessment to the PDF
   */
  private addAssessment(doc: typeof PDFDocument.prototype, report: any): void {
    doc
      .fontSize(16)
      .fillColor("#202124")
      .text("Patient Assessment", { underline: true })
      .moveDown(0.5);

    // Create a simple table for assessment data
    const assessmentData = [
      { label: "Primary Symptoms", value: report.primarySymptom },
      { label: "Onset Time", value: report.onsetTime },
      { label: "Severity", value: report.severity },
      { label: "Additional Symptoms", value: report.additionalSymptoms },
      { label: "Remedies Taken", value: report.remediesTaken },
    ];

    // Table settings
    const startX = 50;
    const startY = doc.y;
    const rowHeight = 30;
    const colWidth = 450 / 3;

    // Draw table
    assessmentData.forEach((row, i) => {
      const y = startY + i * rowHeight;

      // Add a light background for even rows
      if (i % 2 === 0) {
        doc.rect(startX, y, 450, rowHeight).fillAndStroke("#f8f9fa", "#e0e0e0");
      }

      // Add label
      doc
        .fontSize(10)
        .fillColor("#5f6368")
        .text(row.label, startX + 10, y + 10, { width: colWidth });

      // Add value
      doc
        .fontSize(10)
        .fillColor("#202124")
        .text(row.value, startX + colWidth + 10, y + 10, {
          width: colWidth * 2,
        });
    });

    // Add some space after the table
    doc.moveDown(2);
  }

  /**
   * Add Q&A record to the PDF, flush‐left to the page margins
   */
  private addQAndA(doc: typeof PDFDocument.prototype, report: any): void {
    // grab your PDF margins
    const startX = doc.page.margins.left;
    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // Section title, underlined, at left margin
    doc
      .fontSize(16)
      .fillColor("#202124")
      .text("Question and Answer Record", startX, doc.y, {
        width: pageWidth,
        underline: true,
      })
      .moveDown(0.5);

    report.questions.forEach((question: string, index: number) => {
      // Question line
      doc
        .fontSize(12)
        .fillColor("#202124")
        .text(`Q: ${question}`, startX, doc.y, {
          width: pageWidth,
          align: "left",
        })
        .moveDown(0.2);

      // Answer line
      doc
        .fontSize(10)
        .fillColor("#5f6368")
        .text(`A: ${report.answers[index]}`, startX + 10, doc.y, {
          width: pageWidth - 10,
          align: "left",
        })
        .moveDown(0.8);
    });
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  /**
   * Get the path to a generated PDF file
   * @param filename string
   * @returns Path to the PDF file
   */
  getReportPDFPath(filename: string) {
    try {
      const pdfPath = path.join(process.cwd(), "uploads", filename);
      return pdfPath;
    } catch (error) {
      console.error("Error getting PDF path:", error);
      throw new HttpError("Failed to get PDF path", 500);
    }
  }

  /**
   * Push a user message into the session and get AI’s next reply
   */
  async sendMessage(data: {
    sessionId: string;
    sender: "user";
    content: string;
  }) {
    const { sessionId, sender, content } = data;
    const session = await AiSession.findOne({ sessionId });
    if (!session)
      throw new HttpError("Session not found. Generate guidance first.", 400);

    session.messages.push({ role: sender, content });
    await session.save();

    const messages = session.messages.map((m) => {
      const base = { role: m.role as any, content: m.content as string };
      switch (m.role) {
        case "system":
          return base as ChatCompletionSystemMessageParam;
        case "user":
          return base as ChatCompletionUserMessageParam;
        default:
          return base as ChatCompletionAssistantMessageParam;
      }
    });

    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0].message?.content ?? "";
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
