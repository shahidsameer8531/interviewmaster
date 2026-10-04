import type { AptitudeAttempt } from "@/features/app-data/types";
import { TOPICS, topicLabel, type TopicId } from "@/data/aptitude";

export type TopicMastery = { topic: TopicId; label: string; attempts: number; accuracy: number | null; avgTimeSec: number | null };

/** Accuracy over the last 30 attempts per topic. */
export function computeMastery(attempts: AptitudeAttempt[]): TopicMastery[] {
  return TOPICS.map((t) => {
    const recent = attempts.filter((a) => a.topic === t.id).slice(0, 30);
    const correct = recent.filter((a) => a.correct).length;
    return {
      topic: t.id,
      label: t.label,
      attempts: recent.length,
      accuracy: recent.length ? Math.round((correct / recent.length) * 100) : null,
      avgTimeSec: recent.length ? Math.round(recent.reduce((s, a) => s + a.timeSec, 0) / recent.length) : null,
    };
  });
}

/** The topic with the lowest accuracy among those practised at least 5 times. */
export function nextFocus(mastery: TopicMastery[]): TopicId | null {
  const practised = mastery.filter((m) => m.attempts >= 5 && m.accuracy !== null);
  if (practised.length < 2) return null;
  return [...practised].sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))[0].topic;
}

export const labelOf = topicLabel;
