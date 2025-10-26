import { openai } from "@ai-sdk/openai"

// Centralized model config: change AI_MODEL env or default to gpt-5
export const MODEL = openai(process.env.AI_MODEL || "gpt-5")

export default MODEL
