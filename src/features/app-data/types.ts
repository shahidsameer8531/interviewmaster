/**
 * Shapes shared by Convex (signed in) and localStorage (guest). They mirror
 * convex/schema.ts; `id` is a Convex document id or a guest id (`g_...`).
 */

export const TRACKS = ["behavioral", "technical", "system", "leadership", "product"] as const;
export type Track = (typeof TRACKS)[number];

export const TRACK_LABELS: Record<Track, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  system: "System design",
  leadership: "Leadership",
  product: "Product",
};

export const TRACK_BLURBS: Record<Track, string> = {
  behavioral: "Conflict, ownership and failure stories",
  technical: "Coding and CS fundamentals, talked through",
  system: "Architecture, scale and trade-offs",
  leadership: "Influence, hiring and hard calls",
  product: "Product sense, metrics and priorities",
};

export const INTERVIEWER_STYLES = ["friendly", "neutral", "bar-raiser"] as const;
export type InterviewerStyle = (typeof INTERVIEWER_STYLES)[number];
export const STYLE_LABELS: Record<InterviewerStyle, string> = {
  friendly: "Friendly",
  neutral: "Neutral",
  "bar-raiser": "Bar-raiser",
};

export const LEVELS = ["Intern", "Junior", "SDE I", "SDE II", "Senior", "Staff", "Manager"] as const;
export type Level = (typeof LEVELS)[number];

export type SessionStatus = "in_progress" | "done" | "abandoned";

export type SessionQuestion = {
  text: string;
  startedAt: number;
  durationSec: number;
  transcript: string;
  score?: number;
};

export type SessionDelivery = {
  wpm: number;
  fillerPerMin: number;
  eyeContactPct?: number;
  longestPauseSec: number;
};

export type ReportDimension = { key: string; label: string; score: number };

export type ReportQuestion = {
  index: number;
  score: number;
  landed: string[];
  fix: string[];
  strongerAnswer: string[];
};

export type SessionReport = {
  scenario: string;
  overall: number;
  dimensions: ReportDimension[];
  biggestWin: string;
  biggestFix: string;
  questions: ReportQuestion[];
  generatedAt: number;
};

export type InterviewSession = {
  id: string;
  track: string;
  role: string;
  company: string;
  level: string;
  style: string;
  lengthMin: number;
  status: SessionStatus;
  startedAt: number;
  endedAt?: number;
  questions: SessionQuestion[];
  delivery?: SessionDelivery;
  report?: SessionReport;
};

export type NewSession = Pick<InterviewSession, "track" | "role" | "company" | "level" | "style" | "lengthMin">;
export type SessionPatch = Partial<Pick<InterviewSession, "status" | "endedAt" | "questions" | "delivery" | "report">>;

export type Resume = {
  id: string;
  name: string;
  version: number;
  data: unknown;
  jobDescription?: string;
  atsScore?: number;
  updatedAt: number;
};

export type AptitudeAttempt = {
  id: string;
  topic: string;
  company: string;
  questionId: string;
  correct: boolean;
  timeSec: number;
  at: number;
};

export type CoachingStatus = "requested" | "confirmed" | "cancelled";

export type CoachingRequest = {
  id: string;
  service: string;
  slots: string[];
  focus: string;
  shareReports: boolean;
  status: CoachingStatus;
  createdAt: number;
};

export type Target = {
  targetRole?: string;
  targetCompany?: string;
  targetLevel?: string;
  /** ISO date (yyyy-mm-dd) of the interview loop. */
  loopDate?: string;
  planStartedAt?: number;
};
