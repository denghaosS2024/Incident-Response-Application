import dotenv from "dotenv";
import { OpenAI } from "openai";
import FirstAidAssistController from "../../src/controllers/FirstAidAssistController";
dotenv.config({ path: ".env" });

jest.mock("openai");

// Provide mock implementation of OpenAI
const mockCreate = jest.fn();

// Cast OpenAI to `unknown` first, then to `jest.Mock`
(OpenAI as unknown as jest.Mock).mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
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
});
