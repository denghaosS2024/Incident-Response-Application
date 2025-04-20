import FirstAidReport from "../models/FirstAidReport";
import HttpError from "../utils/HttpError";

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

    // TODO: Replace with real AI logic later
    const mockSteps = [
      { id: 1, text: "Check pulse" },
      { id: 2, text: "Ensure airway is clear" },
      { id: 3, text: "Apply pressure to visible wounds" },
      { id: 4, text: "Monitor breathing every 30 seconds" },
      { id: 5, text: "Prepare patient for transport" },
    ];

    return mockSteps;
  }
}

export default new FirstAidReportController();
