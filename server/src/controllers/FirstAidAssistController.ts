import { OpenAI } from "openai";
import FirstAidReport from "../models/FirstAidReport";
import HttpError from "../utils/HttpError";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
}

export default new FirstAidReportController();
