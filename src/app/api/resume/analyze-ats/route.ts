import { NextResponse } from "next/server";
import { z } from "zod";

import { GeminiNotConfiguredError, generateJson } from "@/lib/server/gemini";

export const runtime = "nodejs";

const bodySchema = z.object({
  resumeData: z.object({
    personalInfo: z.object({
      fullName: z.string().default(""),
      email: z.string().default(""),
      phone: z.string().default(""),
      location: z.string().default(""),
      summary: z.string().default(""),
    }),
    experiences: z.array(z.object({ company: z.string().default(""), position: z.string().default(""), startDate: z.string().default(""), endDate: z.string().default(""), current: z.boolean().default(false), description: z.array(z.string()).default([]), technologies: z.array(z.string()).optional() })).default([]),
    education: z.array(z.object({ institution: z.string().default(""), degree: z.string().default(""), field: z.string().default(""), startDate: z.string().default(""), endDate: z.string().default(""), gpa: z.string().optional() })).default([]),
    skills: z.array(z.string()).default([]),
    projects: z.array(z.object({ name: z.string().default(""), description: z.string().default(""), technologies: z.array(z.string()).default([]) })).default([]),
  }),
  jobDescription: z.string().max(8000).optional(),
});

const responseSchema = z.object({
  score: z.number().min(0).max(100),
  found: z.array(z.string().max(60)).max(30).default([]),
  missing: z.array(z.string().max(60)).max(30).default([]),
  checks: z.array(z.object({ label: z.string().max(80), ok: z.boolean() })).max(10).default([]),
});

/**
 * POST /api/resume/analyze-ats
 * Scores a resume against a job description. Returns the score with the
 * keywords found and missing and a few format checks. Fails with an error
 * status when the model cannot score; no default score is ever returned.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const r = body.resumeData;

  const formatted = `
Name: ${r.personalInfo.fullName}
Email: ${r.personalInfo.email} · Phone: ${r.personalInfo.phone} · Location: ${r.personalInfo.location}
Summary: ${r.personalInfo.summary}

Experience:
${r.experiences.map((e) => `- ${e.position} at ${e.company} (${e.startDate} to ${e.current ? "present" : e.endDate})\n${e.description.map((d) => `  • ${d}`).join("\n")}${e.technologies?.length ? `\n  Technologies: ${e.technologies.join(", ")}` : ""}`).join("\n")}

Education:
${r.education.map((e) => `- ${e.degree} in ${e.field}, ${e.institution} (${e.startDate} to ${e.endDate})${e.gpa ? `, GPA ${e.gpa}` : ""}`).join("\n")}

Skills: ${r.skills.join(", ")}

Projects:
${r.projects.map((p) => `- ${p.name}: ${p.description}${p.technologies.length ? ` (${p.technologies.join(", ")})` : ""}`).join("\n")}`;

  const prompt = `You are an applicant tracking system reviewer.
${body.jobDescription ? `Job description:\n"""\n${body.jobDescription.slice(0, 6000)}\n"""\n` : "No job description was given; score general ATS readiness."}
Resume:
"""
${formatted}
"""

Score the match from 0 to 100 using keyword relevance (30%), formatting and structure (20%), clear sections (15%), quantified achievements (15%), relevant skills (10%), contact completeness (5%) and education (5%).
List up to 12 important keywords or skills from the job description that appear in the resume ("found") and up to 12 that do not ("missing"), each 1 to 4 words. Add up to 6 format checks with a short label and whether the resume passes.

Return JSON: {"score": 0-100, "found": [...], "missing": [...], "checks": [{"label": "...", "ok": true|false}]}`;

  try {
    const raw = await generateJson<unknown>(prompt);
    const parsed = responseSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: "Couldn't score this resume. Try again." }, { status: 502 });
    return NextResponse.json({ ...parsed.data, score: Math.round(parsed.data.score) });
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) return NextResponse.json({ error: err.message }, { status: 503 });
    console.error("[analyze-ats]", err);
    return NextResponse.json({ error: "Couldn't score this resume. Try again." }, { status: 502 });
  }
}
