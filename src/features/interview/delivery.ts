import { DELIVERY, FILLER_WORDS } from "./config";

/**
 * Delivery signals, computed in the browser from transcript timestamps and
 * face samples. Only the summaries leave the browser.
 */

export type TranscriptEvent = { at: number; text: string; isFinal: boolean };
export type FaceSample = { at: number; found: boolean; looking: boolean; centered: boolean };

const fillerPattern = new RegExp(`\\b(${FILLER_WORDS.map((w) => w.replace(/\s+/g, "\\s+")).join("|")})\\b`, "gi");

export const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);
export const countFillers = (text: string) => (text.match(fillerPattern) ?? []).length;

export type AnswerStats = {
  durationSec: number;
  words: number;
  wpm: number | null;
  fillers: number;
  fillerPerMin: number | null;
  longestPauseSec: number;
  eyeContactPct: number | null;
};

/**
 * Stats for one answer. `startedAt` is when listening began and `endedAt`
 * when the candidate finished. Pauses are gaps between recognition events.
 */
export function answerStats(
  transcript: string,
  events: TranscriptEvent[],
  faces: FaceSample[],
  startedAt: number,
  endedAt: number
): AnswerStats {
  const durationSec = Math.max(0, (endedAt - startedAt) / 1000);
  const minutes = durationSec / 60;
  const words = countWords(transcript);
  const fillers = countFillers(transcript);

  let longestPauseMs = 0;
  let prev = startedAt;
  for (const e of events) {
    longestPauseMs = Math.max(longestPauseMs, e.at - prev);
    prev = e.at;
  }
  if (events.length) longestPauseMs = Math.max(longestPauseMs, endedAt - prev);

  const samples = faces.filter((f) => f.at >= startedAt && f.at <= endedAt);
  const eyeContactPct = samples.length >= 3 ? Math.round((samples.filter((f) => f.found && f.looking).length / samples.length) * 100) : null;

  return {
    durationSec,
    words,
    wpm: minutes > 0.1 && words > 0 ? Math.round(words / minutes) : null,
    fillers,
    fillerPerMin: minutes > 0.1 ? Math.round((fillers / minutes) * 10) / 10 : null,
    longestPauseSec: Math.round(longestPauseMs / 100) / 10,
    eyeContactPct,
  };
}

/** Weighted roll-up across answers for the session row. */
export function sessionDelivery(perAnswer: AnswerStats[]) {
  const timed = perAnswer.filter((a) => a.durationSec > 0);
  const totalSec = timed.reduce((s, a) => s + a.durationSec, 0);
  const totalWords = timed.reduce((s, a) => s + a.words, 0);
  const totalFillers = timed.reduce((s, a) => s + a.fillers, 0);
  const minutes = totalSec / 60;
  const eye = timed.filter((a) => a.eyeContactPct !== null);
  return {
    wpm: minutes > 0 ? Math.round(totalWords / minutes) : 0,
    fillerPerMin: minutes > 0 ? Math.round((totalFillers / minutes) * 10) / 10 : 0,
    eyeContactPct: eye.length ? Math.round(eye.reduce((s, a) => s + (a.eyeContactPct ?? 0), 0) / eye.length) : undefined,
    longestPauseSec: timed.reduce((m, a) => Math.max(m, a.longestPauseSec), 0),
  };
}

/* ---------- Chip tones for the live panel. Text always accompanies colour. ---------- */

export type Tone = "neutral" | "sky" | "orange";

export const paceTone = (wpm: number | null): { tone: Tone; note: string } => {
  if (wpm === null) return { tone: "neutral", note: "measuring" };
  if (wpm < DELIVERY.paceMin) return { tone: "orange", note: `under ${DELIVERY.paceMin}` };
  if (wpm > DELIVERY.paceMax) return { tone: "orange", note: `over ${DELIVERY.paceMax}` };
  return { tone: "sky", note: "in range" };
};

export const fillerTone = (perMin: number | null): { tone: Tone; note: string } => {
  if (perMin === null) return { tone: "neutral", note: "measuring" };
  if (perMin > DELIVERY.fillerMaxPerMin) return { tone: "orange", note: `above target of ${DELIVERY.fillerMaxPerMin}` };
  return { tone: "sky", note: `target under ${DELIVERY.fillerMaxPerMin}` };
};

export const eyeTone = (pct: number | null): { tone: Tone; note: string } => {
  if (pct === null) return { tone: "neutral", note: "no camera signal" };
  if (pct < DELIVERY.eyeContactMinPct) return { tone: "orange", note: `under ${DELIVERY.eyeContactMinPct}%` };
  return { tone: "sky", note: "steady" };
};

export const lengthTone = (sec: number): { tone: Tone; note: string } => {
  if (sec < DELIVERY.answerMinSec) return { tone: "neutral", note: "aim for 2 to 4 min" };
  if (sec > DELIVERY.answerMaxSec) return { tone: "orange", note: "over 4 min" };
  return { tone: "sky", note: "in range" };
};

export const mmss = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/** Splits a transcript into tokens, marking filler words for the wavy underline. */
export function markFillers(text: string): { text: string; filler: boolean }[] {
  const parts: { text: string; filler: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(fillerPattern)) {
    const start = m.index ?? 0;
    if (start > last) parts.push({ text: text.slice(last, start), filler: false });
    parts.push({ text: m[0], filler: true });
    last = start + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), filler: false });
  return parts;
}
