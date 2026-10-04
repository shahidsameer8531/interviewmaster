/**
 * The one Gemini model name used across the codebase.
 *
 * gemini-2.0-flash-exp and gemini-2.0-flash were shut down on 1 June 2026.
 * Server code overrides with GEMINI_MODEL; client code, which still calls
 * Gemini directly in the older features, can override with
 * NEXT_PUBLIC_GEMINI_MODEL. Both fall back to the current flash model.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-3.6-flash";
