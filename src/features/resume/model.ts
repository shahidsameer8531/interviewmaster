import type { ResumeData } from "@/app/(marketing)/products/resume-builder/features/ai-resume/context/ResumeContext";

export type { ResumeData, Experience, Education, Project, Certification, Language, Achievement, VolunteerWork, PersonalInfo } from "@/app/(marketing)/products/resume-builder/features/ai-resume/context/ResumeContext";

export const SECTION_KEYS = [
  "personalInfo",
  "experiences",
  "education",
  "skills",
  "projects",
  "certifications",
  "achievements",
  "languages",
  "volunteer",
  "declaration",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  personalInfo: "Contact and summary",
  experiences: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements",
  languages: "Languages",
  volunteer: "Volunteering",
  declaration: "Declaration",
};

export const DEFAULT_ORDER: SectionKey[] = ["personalInfo", "experiences", "education", "skills", "projects"];

/** The stored shape: the existing ResumeData plus the section order and template. */
export type ResumeDoc = ResumeData & { sectionOrder?: SectionKey[]; template?: "modern" | "minimal" };

export const emptyResume = (): ResumeDoc => ({
  personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", summary: "" },
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  achievements: [],
  volunteer: [],
  declaration: "",
  templateId: 1,
  sectionOrder: [...DEFAULT_ORDER],
  template: "modern",
});

export const orderOf = (r: ResumeDoc): SectionKey[] => {
  const order = (r.sectionOrder ?? DEFAULT_ORDER).filter((k) => SECTION_KEYS.includes(k));
  return order.includes("personalInfo") ? order : ["personalInfo", ...order];
};

export const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export const LIMITS = { summaryWords: 90, bulletWords: 35, bulletsPerRole: 6 };

export type SectionStatus = { kind: "complete" | "empty" | "too-long"; label: string };

export function sectionStatus(r: ResumeDoc, key: SectionKey): SectionStatus {
  switch (key) {
    case "personalInfo":
      if (!r.personalInfo.fullName.trim() || !r.personalInfo.email.trim()) return { kind: "empty", label: "Empty" };
      if (countWords(r.personalInfo.summary) > LIMITS.summaryWords) return { kind: "too-long", label: "Too long" };
      return { kind: "complete", label: "Complete" };
    case "experiences": {
      if (r.experiences.length === 0) return { kind: "empty", label: "Empty" };
      const long = r.experiences.some((e) => e.description.length > LIMITS.bulletsPerRole || e.description.some((b) => countWords(b) > LIMITS.bulletWords));
      return long ? { kind: "too-long", label: "Too long" } : { kind: "complete", label: "Complete" };
    }
    case "declaration":
      return r.declaration?.trim() ? { kind: "complete", label: "Complete" } : { kind: "empty", label: "Empty" };
    default: {
      const arr = r[key] as unknown[];
      return arr.length ? { kind: "complete", label: "Complete" } : { kind: "empty", label: "Empty" };
    }
  }
}

const RESULT_WORDS = /\b(increas|reduc|cut|grew|growth|improv|saved|deliver|launch|led to|result|boost|achiev|doubl|tripl|faster|decreas|rais|lower|shipp|won|exceed)/i;

/** A bullet with no number and no result verb gets the "No result or number yet" chip. */
export const needsResult = (bullet: string) => bullet.trim().length > 0 && !/\d/.test(bullet) && !RESULT_WORDS.test(bullet);

export const timeAgo = (t: number, now = Date.now()) => {
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
};

/** Plain text of the resume, for keyword matching and prompts. */
export function resumeText(r: ResumeDoc): string {
  const p = r.personalInfo;
  return [
    p.fullName,
    p.summary,
    ...r.experiences.flatMap((e) => [e.position, e.company, ...e.description, ...(e.technologies ?? [])]),
    ...r.education.flatMap((e) => [e.degree, e.field, e.institution]),
    ...r.skills,
    ...r.projects.flatMap((x) => [x.name, x.description, ...x.technologies]),
    ...r.certifications.map((c) => c.name),
    ...r.achievements.flatMap((a) => [a.title, a.description]),
    ...r.languages.map((l) => l.name),
    ...r.volunteer.flatMap((v) => [v.role, v.organization, v.description]),
    r.declaration ?? "",
  ]
    .filter(Boolean)
    .join("\n");
}
