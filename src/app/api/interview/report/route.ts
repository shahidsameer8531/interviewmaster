import { NextResponse } from "next/server";
import { z } from "zod";

import { GeminiNotConfiguredError, generateJson } from "@/lib/server/gemini";
import { barFor, dimensionsFor } from "@/features/interview/scoring";

export const runtime = "nodejs";

const bodySchema = z.object({
  track: z.string().min(1),
  role: z.string().max(120).default(""),
  company: z.string().max(120).default(""),
  level: z.string().max(60).default(""),
  style: z.string().max(40).default("neutral"),
  questions: z
    .array(
      z.object({
        text: z.string().max(1000),
        transcript: z.string().max(10000),
        durationSec: z.number().min(0).max(7200),
      })
    )
    .min(1)
    .max(30),
  delivery: z
    .object({
      wpm: z.number(),
      fillerPerMin: z.number(),
      eyeContactPct: z.number().optional(),
      longestPauseSec: z.number(),
    })
    .optional(),
});

const score = z.number().min(0).max(100);

const modelSchema = z.object({
  scenario: z.string().min(3).max(120),
  overall: score,
  dimensions: z.array(z.object({ key: z.string(), score })).min(1),
  biggestWin: z.string().min(3).max(400),
  biggestFix: z.string().min(3).max(400),
  summary: z.string().min(3).max(400),
  questions: z
    .array(
      z.object({
        index: z.number().int().min(0),
        score,
        landed: z.array(z.string().max(300)).max(6),
        fix: z.array(z.string().max(300)).max(6),
        strongerAnswer: z.array(z.string().max(400)).min(1).max(8),
        highlights: z.array(z.string().max(200)).max(6).default([]),
      })
    )
    .min(1),
});

/**
 * POST /api/interview/report
 * Scores a finished round from its transcripts. Every number comes from the
 * model's read of the transcript; on any failure the caller gets an error,
 * never a fabricated score.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const answered = body.questions.filter((q) => q.transcript.trim().length > 0);
  if (answered.length === 0) {
    return NextResponse.json({ error: "Nothing to score: no answers were recorded in this round." }, { status: 422 });
  }

  const dims = dimensionsFor(body.track);
  const bar = barFor(body.level);
  const where = [body.role, body.company].filter(Boolean).join(" at ");

  const prompt = `You are scoring a ${body.track} mock interview${where ? ` for a ${where} role` : ""}${body.level ? ` at ${body.level} level` : ""}. The interviewer style was ${body.style}.
A candidate at this level is expected to score ${bar} or above on each dimension.

Score every dimension and every question from 0 to 100 using only what is in the transcripts. Be specific and name the question when you give feedback. Do not invent facts the candidate did not say. An unanswered question scores 0 to 10.

Dimensions (use these keys exactly): ${dims.map((d) => `${d.key} = ${d.label}`).join("; ")}.

Questions and transcripts:
${body.questions.map((q, i) => `Q${i + 1} (${Math.round(q.durationSec)}s): ${q.text}\nA${i + 1}: ${q.transcript.trim() || "(no answer)"}`).join("\n\n")}
${body.delivery ? `\nDelivery signals measured on the candidate's device: ${body.delivery.wpm} words a minute, ${body.delivery.fillerPerMin} filler words a minute${body.delivery.eyeContactPct !== undefined ? `, ${body.delivery.eyeContactPct}% eye contact` : ""}, longest pause ${body.delivery.longestPauseSec}s.` : ""}

Return JSON only, in this shape:
{
  "scenario": "a 3 to 8 word title for this round, e.g. 'Ownership and conflict stories'",
  "overall": 0-100,
  "dimensions": [{"key": "<dimension key>", "score": 0-100}, ... one per dimension],
  "biggestWin": "one concrete sentence naming the question where the candidate did best and why",
  "biggestFix": "one concrete sentence naming the question and the single most valuable change",
  "summary": "one sentence on where the candidate stands against the bar of ${bar}",
  "questions": [
    {
      "index": 0,
      "score": 0-100,
      "landed": ["what worked, one short item each"],
      "fix": ["what to change, one short item each"],
      "strongerAnswer": ["move 1", "move 2", "move 3"],
      "highlights": ["verbatim phrases from the answer that landed, copied exactly"]
    }
  ]
}`;

  try {
    const raw = await generateJson<unknown>(prompt);
    const parsed = modelSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[report] model JSON failed validation", parsed.error.issues.slice(0, 3));
      return NextResponse.json({ error: "Couldn't score this round. Try again." }, { status: 502 });
    }
    const m = parsed.data;

    // Keep only the known dimensions, in the configured order; refuse if any is missing.
    const byKey = new Map(m.dimensions.map((d) => [d.key, Math.round(d.score)]));
    const dimensions = dims.map((d) => ({ key: d.key, label: d.label, score: byKey.get(d.key) }));
    if (dimensions.some((d) => d.score === undefined)) {
      return NextResponse.json({ error: "Couldn't score this round. Try again." }, { status: 502 });
    }

    const questions = body.questions.map((_, i) => {
      const q = m.questions.find((x) => x.index === i) ?? m.questions[i];
      if (!q) return null;
      return {
        index: i,
        score: Math.round(q.score),
        landed: q.landed,
        fix: q.fix,
        strongerAnswer: q.strongerAnswer,
        highlights: q.highlights,
      };
    });
    if (questions.some((q) => q === null)) {
      return NextResponse.json({ error: "Couldn't score this round. Try again." }, { status: 502 });
    }

    return NextResponse.json({
      scenario: m.scenario,
      overall: Math.round(m.overall),
      dimensions: dimensions as { key: string; label: string; score: number }[],
      biggestWin: m.biggestWin,
      biggestFix: m.biggestFix,
      summary: m.summary,
      questions,
      generatedAt: Date.now(),
    });
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("[report]", err);
    return NextResponse.json({ error: "Couldn't score this round. Try again." }, { status: 502 });
  }
}
