// src/utils/openaiClient.ts
import { OpenAI } from "openai";

let openaiInstance: OpenAI | null = null;

export function getOpenAIClient() {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}
