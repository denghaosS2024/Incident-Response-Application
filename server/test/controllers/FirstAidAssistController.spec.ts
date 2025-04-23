import dotenv from "dotenv";
import FirstAidAssistController from "../../src/controllers/FirstAidAssistController";
import AiSession from "../../src/models/AiSession";
import FirstAidReport from "../../src/models/FirstAidReport";
 
// after each test we want to restore any spyOn stubs to their original methods
afterEach(() => {
  jest.restoreAllMocks();
});

dotenv.config({ path: ".env" });

const mockCreate = jest.fn();

// Mock OpenAI client
jest.mock("../../src/utils/openaiClient", () => ({
  getOpenAIClient: () => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }),
}));

describe("generateGuidanceSteps", () => {
  const sessionId = "test-session";
  const mockReport = {
    sessionId,
    primarySymptom: "Bleeding",
    onsetTime: "10 minutes ago",
    severity: "Severe",
    additionalSymptoms: "Dizziness",
    remediesTaken: "Applied pressure",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error if AI returns invalid JSON", async () => {
    jest
      .spyOn(FirstAidAssistController, "getReportBySessionId")
      .mockResolvedValue(mockReport as any);

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "not json" } }],
    });

    await expect(
      FirstAidAssistController.generateGuidanceSteps(sessionId)
    ).rejects.toThrow("Failed to generate AI guidance steps");
  });

  it(
    "should generate guidance and save it to AiSession",
    async () => {
      const parsedResponse = [
        { id: "1", text: "Apply direct pressure to bleeding area." },
        { id: "2", text: "Call emergency services if bleeding is severe." },
      ];

      jest
        .spyOn(FirstAidAssistController, "getReportBySessionId")
        .mockResolvedValue(mockReport as any);

      jest
        .spyOn(AiSession, "findOneAndUpdate")
        .mockResolvedValue({ sessionId } as any);

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(parsedResponse) } }],
      });

      const result = await FirstAidAssistController.generateGuidanceSteps(
        sessionId
      );
      expect(result).toEqual(parsedResponse);
    },
    10000 // timeout to avoid false failures
  );
});

describe("sendMessage", () => {
  const sessionId = "test-session";
  const userMessage = "What if the bleeding doesn't stop?";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reply using chat history", async () => {
    const mockSession = {
      sessionId,
      messages: [
        { role: "user", content: "How to treat bleeding?" },
        { role: "assistant", content: "Apply pressure." },
      ],
      save: jest.fn(),
    };

    jest.spyOn(AiSession, "findOne").mockResolvedValue(mockSession as any);

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "You should seek medical help." } }],
    });

    const result = await FirstAidAssistController.sendMessage({
      sessionId,
      sender: "user",
      content: userMessage,
    });

    expect(result).toEqual({ response: "You should seek medical help." });
    expect(mockSession.save).toHaveBeenCalled();
    expect(mockSession.messages.length).toBe(4); // 2 initial + 1 user + 1 assistant
  });

  it("should throw if session not found", async () => {
    jest.spyOn(AiSession, "findOne").mockResolvedValue(null);

    await expect(
      FirstAidAssistController.sendMessage({
        sessionId,
        sender: "user",
        content: userMessage,
      })
    ).rejects.toThrow("Session not found. Generate guidance first.");
  });
});

describe("createReport", () => {
  it("should create and return a structured report", async () => {
    const questions = ["What happened?", "When did it start?"];
    const answers = ["Bleeding from head", "10 minutes ago"];

    const mockContent = JSON.stringify({
      primarySymptom: "Bleeding",
      onsetTime: "10 minutes ago",
      severity: "Severe",
      additionalSymptoms: "Dizziness",
      remediesTaken: "Applied pressure",
    });

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: mockContent } }],
    });

    jest.mock("uuid", () => ({
      v4: jest.fn(() => "generated-session-id"),
    }));
    const mockSave = jest.fn();
    jest.spyOn(FirstAidReport.prototype, "save").mockImplementation(mockSave);

    const report = await FirstAidAssistController.createReport({
      questions,
      answers,
    });

    expect(report.primarySymptom).toBe("Bleeding");
    expect(mockSave).toHaveBeenCalled();
  });

  it("should throw HttpError if AI returns malformed JSON", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "{ invalid json" } }],
    });

    await expect(
      FirstAidAssistController.createReport({
        questions: ["Q1"],
        answers: ["A1"],
      })
    ).rejects.toThrow("Failed to generate report");
  });
});

describe("getReportBySessionId", () => {
  it("should return report by sessionId", async () => {
    const mockReport = {
      sessionId: "abc123",
      primarySymptom: "Bleeding",
      onsetTime: "10 minutes ago",
      severity: "Severe",
      additionalSymptoms: "Dizziness",
      remediesTaken: "Applied pressure",
    };
  
    jest.spyOn(FirstAidReport, "findOne").mockResolvedValue(mockReport as any);
  
    const result = await FirstAidAssistController.getReportBySessionId("abc123");
    expect(result).toEqual(mockReport);
  });  

  it("should throw HttpError on DB error", async () => {
    jest.spyOn(FirstAidReport, "findOne").mockRejectedValue(new Error("DB error"));
  
    await expect(
      FirstAidAssistController.getReportBySessionId("abc123")
    ).rejects.toThrow("Failed to retrieve report");
  });
  
});

describe("generateReportPDF", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  it("should return Base64 PDF data and filename", async () => {
    const mockBuffer = Buffer.from("pdf content");
    const mockReport = {
      sessionId: "test-session",
      reportId: "report-1",
      createdAt: new Date(),
      questions: [],
      answers: [],
      primarySymptom: "",
      onsetTime: "",
      severity: "",
      additionalSymptoms: "",
      remediesTaken: "",
    };

    jest
      .spyOn(FirstAidAssistController, "getReportBySessionId")
      .mockResolvedValue(mockReport as any);

    jest
      .spyOn(FirstAidAssistController as any, "createPDFBuffer")
      .mockResolvedValue(mockBuffer);

    const result = await FirstAidAssistController.generateReportPDF("test-session");

    expect(result.filename).toBe("report-report-1.pdf");
    expect(result.pdfDataUrl.startsWith("data:application/pdf;base64,")).toBe(true);
  });

  it("should throw if report not found", async () => {
    jest
  .spyOn(FirstAidAssistController, "getReportBySessionId")
   .mockResolvedValue(null as any);
  
      await expect(
        FirstAidAssistController.generateReportPDF("test-session")
      ).rejects.toThrow("Failed to generate PDF report");
  });
  
});

describe("getReportPDFPath", () => {
  it("should return the correct path", () => {
    const filename = "report-1.pdf";
    const pathResult = FirstAidAssistController.getReportPDFPath(filename);
    expect(pathResult.endsWith(`uploads/${filename}`)).toBe(true);
  });
});
