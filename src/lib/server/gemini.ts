import { GoogleGenerativeAI, type GenerationConfig } from "@google/generative-ai";

/**
 * Server-side Gemini access for the Prep Room routes.
 *
 * Reads GEMINI_API_KEY first. Falls back to NEXT_PUBLIC_GEMINI_API_KEY (the
 * key the old client code uses) with one warning per process, so the app
 * keeps working on an existing deployment while the key is being moved.
 */

let warned = false;

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super("The AI interviewer is not configured on this server. Add GEMINI_API_KEY.");
    this.name = "GeminiNotConfiguredError";
  }
}

/**
 * gemini-2.0-flash was shut down on 1 June 2026, so the default is the
 * current flash model. GEMINI_MODEL overrides it.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
// Logged once when the server first loads this module.
console.info(`[gemini] using model ${GEMINI_MODEL}${process.env.GEMINI_MODEL ? " (from GEMINI_MODEL)" : " (default)"}`);

export function getGeminiKey(): string {
  const primary = process.env.GEMINI_API_KEY;
  if (primary) return primary;
  const fallback = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (fallback) {
    if (!warned) {
      warned = true;
      console.warn("[gemini] GEMINI_API_KEY is not set; falling back to NEXT_PUBLIC_GEMINI_API_KEY. Move the key server-side.");
    }
    return fallback;
  }
  throw new GeminiNotConfiguredError();
}

export function getGeminiModel(generationConfig?: GenerationConfig) {
  const genAI = new GoogleGenerativeAI(getGeminiKey());
  return genAI.getGenerativeModel({ model: GEMINI_MODEL, generationConfig });
}

/** Ask for JSON and parse it. Strips code fences in case the model adds them. */
export async function generateJson<T>(prompt: string): Promise<T> {
  const model = getGeminiModel({ responseMimeType: "application/json", temperature: 0.7 });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned) as T;
}
