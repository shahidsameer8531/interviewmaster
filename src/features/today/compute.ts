import type { AptitudeAttempt, CoachingRequest, InterviewSession, Resume, Target } from "@/features/app-data/types";
import { TRACK_LABELS, type Track } from "@/features/app-data/types";

const DAY = 86_400_000;

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const round = (x: number | null) => (x === null ? null : Math.round(x));

export const trackLabel = (track: string) => TRACK_LABELS[track as Track] ?? track;

export const scenarioOf = (s: InterviewSession) =>
  s.report?.scenario || [s.role, s.company].filter(Boolean).join(" at ") || trackLabel(s.track);

/** Sessions that finished and were scored, newest first. */
export const scoredSessions = (sessions: InterviewSession[]) =>
  sessions
    .filter((s) => s.status === "done" && s.report && typeof s.report.overall === "number")
    .sort((a, b) => (b.endedAt ?? b.startedAt) - (a.endedAt ?? a.startedAt));

/* ------------------------------ Readiness ------------------------------ */

export type TrackReadiness = { track: string; label: string; mean: number | null; count: number };
export type Readiness = {
  overall: number | null;
  change7d: number | null;
  tracks: TrackReadiness[];
  weakest: string | null;
};

const readinessAt = (scored: InterviewSession[], cutoff: number) => {
  const byTrack = new Map<string, number[]>();
  for (const s of scored) {
    if ((s.endedAt ?? s.startedAt) > cutoff) continue;
    const arr = byTrack.get(s.track) ?? [];
    if (arr.length < 5) arr.push(s.report!.overall);
    byTrack.set(s.track, arr);
  }
  const means = [...byTrack.values()].map((xs) => mean(xs)!).filter((x) => x !== null);
  return { byTrack, overall: round(mean(means)) };
};

export function computeReadiness(sessions: InterviewSession[], now: number): Readiness {
  const scored = scoredSessions(sessions);
  const current = readinessAt(scored, now);
  const past = readinessAt(scored, now - 7 * DAY);
  const tracksWithData = [...current.byTrack.keys()];
  const tracks: TrackReadiness[] = tracksWithData.map((t) => ({
    track: t,
    label: trackLabel(t),
    mean: round(mean(current.byTrack.get(t)!)),
    count: current.byTrack.get(t)!.length,
  }));
  tracks.sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0));
  const weakest = tracks.length >= 2 ? tracks[tracks.length - 1].track : null;
  const change7d = current.overall !== null && past.overall !== null ? current.overall - past.overall : null;
  return { overall: current.overall, change7d, tracks, weakest };
}

/* ------------------------------ Focus areas ------------------------------ */

export type FocusArea = { key: string; label: string; track: string; score: number; occurrences: number; sessionId: string };

/** The weakest dimension of each recent report, grouped by dimension. */
export function computeFocusAreas(sessions: InterviewSession[], limit = 3): FocusArea[] {
  const recent = scoredSessions(sessions).slice(0, 10);
  const map = new Map<string, FocusArea>();
  for (const s of recent) {
    const dims = s.report!.dimensions;
    if (!dims?.length) continue;
    const lowest = [...dims].sort((a, b) => a.score - b.score)[0];
    const k = `${s.track}:${lowest.key}`;
    const existing = map.get(k);
    if (existing) {
      existing.occurrences += 1;
    } else {
      map.set(k, { key: lowest.key, label: lowest.label, track: s.track, score: lowest.score, occurrences: 1, sessionId: s.id });
    }
  }
  return [...map.values()].sort((a, b) => b.occurrences - a.occurrences || a.score - b.score).slice(0, limit);
}

/* ------------------------------ This week ------------------------------ */

const startOfDay = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export type WeekDay = { date: number; label: string; practised: boolean; isToday: boolean; isFuture: boolean };
export type WeekSummary = {
  days: WeekDay[];
  streak: number;
  practiceMinutes: number;
  mockInterviews: number;
  questionsAnswered: number;
};

export function computeWeek(sessions: InterviewSession[], attempts: AptitudeAttempt[], now: number): WeekSummary {
  const today = startOfDay(now);
  const dow = (new Date(today).getDay() + 6) % 7; // Monday = 0
  const monday = today - dow * DAY;

  const activityDays = new Set<number>();
  for (const s of sessions) activityDays.add(startOfDay(s.endedAt ?? s.startedAt));
  for (const a of attempts) activityDays.add(startOfDay(a.at));

  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = monday + i * DAY;
    return {
      date,
      label: new Date(date).toLocaleDateString(undefined, { weekday: "narrow" }),
      practised: activityDays.has(date),
      isToday: date === today,
      isFuture: date > today,
    };
  });

  // Streak: consecutive active days ending today, or yesterday if today is still empty.
  let cursor = activityDays.has(today) ? today : today - DAY;
  let streak = 0;
  while (activityDays.has(cursor) && streak < 365) {
    streak += 1;
    cursor -= DAY;
  }

  const weekEnd = monday + 7 * DAY;
  const inWeek = (t: number) => t >= monday && t < weekEnd;
  const weekSessions = sessions.filter((s) => s.status === "done" && inWeek(s.endedAt ?? s.startedAt));
  const weekAttempts = attempts.filter((a) => inWeek(a.at));

  const sessionMinutes = weekSessions.reduce((acc, s) => acc + (s.endedAt ? (s.endedAt - s.startedAt) / 60_000 : 0), 0);
  const attemptMinutes = weekAttempts.reduce((acc, a) => acc + a.timeSec / 60, 0);

  return {
    days,
    streak,
    practiceMinutes: Math.round(sessionMinutes + attemptMinutes),
    mockInterviews: weekSessions.length,
    questionsAnswered: weekSessions.reduce((acc, s) => acc + s.questions.length, 0) + weekAttempts.length,
  };
}

/* ------------------------------ Next up and plan ------------------------------ */

export type NextUp = {
  isNewUser: boolean;
  track: string;
  title: string;
  why: string | null;
  lengthMin: number;
  style: string;
  setupHref: string;
};

export function computeNextUp(sessions: InterviewSession[], target: Target | null, readiness: Readiness): NextUp {
  const latest = scoredSessions(sessions)[0];
  if (!latest) {
    return {
      isNewUser: true,
      track: "behavioral",
      title: "Start with a 15-minute behavioral round",
      why: null,
      lengthMin: 15,
      style: "friendly",
      setupHref: "/dashboard/interview/new?track=behavioral&length=15",
    };
  }
  const track = readiness.weakest ?? latest.track;
  const role = target?.targetRole || latest.role;
  const company = target?.targetCompany || latest.company;
  const where = [role, company].filter(Boolean).join(" at ");
  const params = new URLSearchParams({ track, length: String(latest.lengthMin), style: latest.style });
  return {
    isNewUser: false,
    track,
    title: where ? `${trackLabel(track)} round for ${where}` : `${trackLabel(track)} round`,
    why: latest.report!.biggestFix || null,
    lengthMin: latest.lengthMin,
    style: latest.style,
    setupHref: `/dashboard/interview/new?${params.toString()}`,
  };
}

export type PlanItem = { id: string; label: string; href: string; done: boolean };

export function computePlan(
  sessions: InterviewSession[],
  attempts: AptitudeAttempt[],
  nextUp: NextUp,
  focus: FocusArea[],
  now: number
): PlanItem[] {
  const today = startOfDay(now);
  const attemptsToday = attempts.some((a) => startOfDay(a.at) === today);
  const roundDoneToday = sessions.some((s) => s.status === "done" && s.track === nextUp.track && startOfDay(s.endedAt ?? s.startedAt) === today);
  const items: PlanItem[] = [];
  if (!attemptsToday) items.push({ id: "aptitude", label: "Aptitude warm-up, 10 questions", href: "/dashboard/aptitude", done: false });
  items.push({ id: "round", label: nextUp.title, href: nextUp.setupHref, done: roundDoneToday });
  if (focus[0]) {
    const f = focus[0];
    items.push({
      id: "focus",
      label: `Drill ${f.label.toLowerCase()} in a ${trackLabel(f.track).toLowerCase()} round`,
      href: `/dashboard/interview/new?track=${f.track}&focus=${encodeURIComponent(f.key)}`,
      done: false,
    });
  }
  items.push({ id: "coding", label: "One coding set", href: "/products/coding-practice", done: false });
  return items.slice(0, 4);
}

/* ------------------------------ Coming up ------------------------------ */

export type ComingUpItem = { id: string; label: string; detail: string; href?: string; tone?: "sky" | "orange" | "neutral" };

export function computeComingUp(requests: CoachingRequest[], resumes: Resume[], target: Target | null, now: number): ComingUpItem[] {
  const items: ComingUpItem[] = [];
  for (const r of requests.filter((r) => r.status !== "cancelled").slice(0, 3)) {
    items.push({
      id: r.id,
      label: r.service,
      detail: r.status === "confirmed" ? `Confirmed · ${r.slots[0] ?? ""}` : `Requested · ${r.slots.length} time${r.slots.length === 1 ? "" : "s"} offered`,
      href: "/dashboard/coaching",
      tone: r.status === "confirmed" ? "sky" : "neutral",
    });
  }
  if (target?.loopDate) {
    const loop = new Date(target.loopDate + "T00:00:00").getTime();
    const daysLeft = Math.ceil((loop - startOfDay(now)) / DAY);
    items.push({
      id: "loop",
      label: "Interview loop",
      detail:
        daysLeft > 1 ? `${daysLeft} days left` : daysLeft === 1 ? "Tomorrow" : daysLeft === 0 ? "Today" : `${Math.abs(daysLeft)} days ago`,
      href: "/settings",
      tone: daysLeft >= 0 && daysLeft <= 3 ? "orange" : "neutral",
    });
  }
  const scoredResume = resumes.find((r) => typeof r.atsScore === "number");
  if (scoredResume) {
    items.push({
      id: scoredResume.id,
      label: `Resume · ${scoredResume.name}`,
      detail: `Match ${scoredResume.atsScore} of 100`,
      href: `/dashboard/resume/${scoredResume.id}`,
      tone: "neutral",
    });
  }
  return items;
}

/* ------------------------------ Recent sessions ------------------------------ */

export type RecentRow = {
  id: string;
  scenario: string;
  track: string;
  date: number;
  lengthMin: number;
  score: number;
  change: number | null;
};

export function computeRecent(sessions: InterviewSession[], limit = 8): RecentRow[] {
  const scored = scoredSessions(sessions);
  return scored.slice(0, limit).map((s, i) => {
    const prev = scored.slice(i + 1).find((p) => p.track === s.track);
    return {
      id: s.id,
      scenario: scenarioOf(s),
      track: s.track,
      date: s.endedAt ?? s.startedAt,
      lengthMin: s.endedAt ? Math.max(1, Math.round((s.endedAt - s.startedAt) / 60_000)) : s.lengthMin,
      score: s.report!.overall,
      change: prev ? s.report!.overall - prev.report!.overall : null,
    };
  });
}

export const greetingFor = (hour: number) => (hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
