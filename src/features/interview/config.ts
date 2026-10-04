import type { InterviewerStyle } from "@/features/app-data/types";

/** Round length in minutes to the number of main questions. */
export const QUESTIONS_FOR_LENGTH: Record<number, number> = { 15: 2, 30: 3, 45: 4, 60: 5 };
export const LENGTH_OPTIONS = [15, 30, 45, 60] as const;

export const STYLE_OPTIONS: { value: InterviewerStyle; title: string; description: string }[] = [
  { value: "friendly", title: "Friendly", description: "Warm, and nudges you when you stall" },
  { value: "neutral", title: "Neutral", description: "Polite and even. No hints" },
  { value: "bar-raiser", title: "Bar-raiser", description: "Pushes back and asks follow-ups" },
];

/** Delivery targets. Numbers before adjectives: every chip prints these. */
export const DELIVERY = {
  paceMin: 130,
  paceMax: 160,
  fillerMaxPerMin: 6,
  eyeContactMinPct: 60,
  answerMinSec: 120,
  answerMaxSec: 240,
  pauseThresholdMs: 1500,
};

export const FILLER_WORDS = ["um", "uh", "erm", "hmm", "like", "you know", "sort of", "kind of", "basically", "actually", "literally", "i mean", "right"];

/** Settings chosen on the setup screen that the room needs but the session row does not store. */
export type RoomOptions = {
  voiceAnalysis: boolean;
  cameraAnalysis: boolean;
  keepRecording: boolean;
  typedAnswers: boolean;
  cameraDeviceId?: string;
  micDeviceId?: string;
  jobDescription?: string;
  resumeId?: string;
  focus?: string;
  /** Exact first question, used by "Retry this question" from a report. */
  openingQuestion?: string;
};

export const DEFAULT_ROOM_OPTIONS: RoomOptions = {
  voiceAnalysis: true,
  cameraAnalysis: true,
  keepRecording: false,
  typedAnswers: false,
};

const roomKey = (sessionId: string) => `im.room.${sessionId}`;

export function saveRoomOptions(sessionId: string, options: RoomOptions) {
  try {
    sessionStorage.setItem(roomKey(sessionId), JSON.stringify(options));
  } catch {
    /* storage unavailable; the room falls back to defaults */
  }
}

export function loadRoomOptions(sessionId: string): RoomOptions {
  try {
    const raw = sessionStorage.getItem(roomKey(sessionId));
    return raw ? { ...DEFAULT_ROOM_OPTIONS, ...(JSON.parse(raw) as Partial<RoomOptions>) } : DEFAULT_ROOM_OPTIONS;
  } catch {
    return DEFAULT_ROOM_OPTIONS;
  }
}
