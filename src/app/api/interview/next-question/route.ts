import { NextResponse } from "next/server";
import { z } from "zod";

import { GeminiNotConfiguredError, generateJson } from "@/lib/server/gemini";

export const runtime = "nodejs";

const bodySchema = z.object({
  track: z.string().min(1),
  role: z.string().max(120).default(""),
  company: z.string().max(120).default(""),
  level: z.string().max(60).default(""),
  style: z.enum(["friendly", "neutral", "bar-raiser"]).default("neutral"),
  questionIndex: z.number().int().min(0).max(30),
  totalQuestions: z.number().int().min(1).max(30),
  jobDescription: z.string().max(6000).optional(),
  focus: z.string().max(120).optional(),
  previous: z
    .array(z.object({ question: z.string().max(1000), answer: z.string().max(8000) }))
    .max(30)
    .default([]),
});

const responseSchema = z.object({
  question: z.string().min(8).max(600),
  isFollowUp: z.boolean().default(false),
});

const TRACK_GUIDE: Record<string, string> = {
  behavioral: "behavioral questions about conflict, ownership, failure and influence; expect STAR-shaped answers",
  technical: "technical questions on coding and computer-science fundamentals, talked through rather than written",
  system: "system design questions about architecture, scale and trade-offs",
  leadership: "leadership questions about influence, hiring, performance and hard calls",
  product: "product questions about product sense, metrics and prioritisation",
};

const STYLE_GUIDE: Record<string, string> = {
  friendly: "You are warm. You nudge the candidate when they stall and rarely push back.",
  neutral: "You are polite and even. You give no hints and no reactions.",
  "bar-raiser": "You push back on vague claims and ask pointed follow-ups about specifics and numbers.",
};

/**
 * POST /api/interview/next-question
 * Returns the next question for a live round, or a follow-up to the last
 * answer. No fallback questions: if the model is unavailable or returns
 * something unusable, the caller gets an error and shows it.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const last = body.previous[body.previous.length - 1];
  const followUpBias = body.style === "bar-raiser" ? "often" : body.style === "friendly" ? "sometimes" : "rarely";
  const where = [body.role, body.company].filter(Boolean).join(" at ");

  const prompt = `You are a ${body.style} interviewer running a ${body.track} mock interview${where ? ` for a ${where} role` : ""}${body.level ? ` at ${body.level} level` : ""}.
${STYLE_GUIDE[body.style]}
This round covers ${TRACK_GUIDE[body.track] ?? body.track}.
${body.focus ? `The candidate is drilling "${body.focus}", so shape questions to exercise it.\n` : ""}${body.jobDescription ? `Job description, for context:\n"""\n${body.jobDescription.slice(0, 4000)}\n"""\n` : ""}
You are about to ask question ${body.questionIndex + 1} of ${body.totalQuestions}.
${body.previous.length ? `Questions and answers so far:\n${body.previous.map((p, i) => `Q${i + 1}: ${p.question}\nA${i + 1}: ${p.answer || "(no answer given)"}`).join("\n\n")}\n` : ""}
${last && last.answer ? `A ${body.style} interviewer ${followUpBias} asks a follow-up about the last answer when something was vague, unquantified or interesting. Decide whether to follow up or move to a new question.` : "Ask the opening question."}

Rules: ask exactly one question, spoken naturally in under 40 words, with no preamble and no numbering. Do not repeat a question already asked.
Return JSON: {"question": "...", "isFollowUp": true|false}`;

  try {
    const raw = await generateJson<unknown>(prompt);
    const parsed = responseSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Couldn't get the next question. Try again." }, { status: 502 });
    }
    return NextResponse.json(parsed.data);
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("[next-question]", err);
    return NextResponse.json({ error: "Couldn't get the next question. Try again." }, { status: 502 });
  }
}
