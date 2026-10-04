import { NextResponse } from "next/server";
import { z } from "zod";

import { GeminiNotConfiguredError, generateJson } from "@/lib/server/gemini";

export const runtime = "nodejs";

const bodySchema = z.object({
  bullet: z.string().min(3).max(600),
  role: z.string().max(120).optional(),
  company: z.string().max(120).optional(),
  jobDescription: z.string().max(4000).optional(),
  /** Earlier suggestions to avoid repeating, for "Try another". */
  avoid: z.array(z.string().max(600)).max(5).default([]),
});

const responseSchema = z.object({
  rewrite: z.string().min(10).max(400),
});

/**
 * POST /api/resume/rewrite-bullet
 * Rewrites one resume bullet into a result-led sentence. Numbers the model
 * does not know are written as bracket placeholders such as [X%] or [N users];
 * it must never invent them.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const prompt = `Rewrite this resume bullet so it leads with the action and ends with a measurable result.
${body.role || body.company ? `Context: ${[body.role, body.company].filter(Boolean).join(" at ")}.` : ""}
${body.jobDescription ? `The target job description, for vocabulary:\n"""\n${body.jobDescription.slice(0, 2500)}\n"""` : ""}

Bullet: "${body.bullet}"

Hard rules:
- Keep every fact from the original. Add nothing the original does not say.
- Where a number or outcome is missing, write a bracket placeholder the person will fill in, like [X%], [N customers], [$X], [X weeks]. Never invent a number.
- One sentence, 12 to 28 words, no first person, no trailing period needed.
${body.avoid.length ? `- Do not reuse these earlier suggestions: ${body.avoid.map((a) => `"${a}"`).join(", ")}` : ""}

Return JSON: {"rewrite": "..."}`;

  try {
    const raw = await generateJson<unknown>(prompt);
    const parsed = responseSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: "Couldn't rewrite this bullet. Try again." }, { status: 502 });
    return NextResponse.json(parsed.data);
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) return NextResponse.json({ error: err.message }, { status: 503 });
    console.error("[rewrite-bullet]", err);
    return NextResponse.json({ error: "Couldn't rewrite this bullet. Try again." }, { status: 502 });
  }
}
