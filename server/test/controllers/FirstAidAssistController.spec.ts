import dotenv from "dotenv";
import FirstAidAssistController from "../../src/controllers/FirstAidAssistController";
import AiSession from "../../src/models/AiSession";

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
