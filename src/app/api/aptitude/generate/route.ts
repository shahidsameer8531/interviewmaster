import { NextResponse } from "next/server";
import { z } from "zod";

import { GeminiNotConfiguredError, generateJson } from "@/lib/server/gemini";
import { isTopicId, topicLabel } from "@/data/aptitude";

export const runtime = "nodejs";

const bodySchema = z.object({
  topic: z.string().refine(isTopicId, "Unknown topic"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
  count: z.number().int().min(1).max(10).default(5),
  avoid: z.array(z.string().max(400)).max(40).default([]),
});

const responseSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(8).max(800),
        options: z.array(z.string().min(1).max(200)).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string().min(8).max(1200),
        hint: z.string().max(300).optional(),
        category: z.string().max(60).optional(),
      })
    )
    .min(1),
});

/**
 * POST /api/aptitude/generate
 * Optional "More questions" source once a company bank is used up. Each
 * question is validated; unusable output is an error, never a filler set.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const prompt = `Write ${body.count} ${body.difficulty.toLowerCase()} ${topicLabel(body.topic)} aptitude questions of the kind used in graduate hiring tests.
Each has exactly four options with one correct answer, a worked explanation in 2 to 4 numbered steps, and one short hint that does not give the answer away.
${body.avoid.length ? `Do not repeat these questions: ${body.avoid.map((a) => `"${a.slice(0, 120)}"`).join("; ")}` : ""}
Return JSON: {"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0-3, "explanation": "1. ... 2. ...", "hint": "...", "category": "..."}]}`;

  try {
    const raw = await generateJson<unknown>(prompt);
    const parsed = responseSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: "Couldn't get more questions. Try again." }, { status: 502 });
    return NextResponse.json(parsed.data);
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) return NextResponse.json({ error: err.message }, { status: 503 });
    console.error("[aptitude/generate]", err);
    return NextResponse.json({ error: "Couldn't get more questions. Try again." }, { status: 502 });
  }
}
