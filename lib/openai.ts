import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

export const OPENAI_CONFIG = {
  model: "gpt-4o-mini",
  timeout: 30000,
  maxRetries: 1,
};
