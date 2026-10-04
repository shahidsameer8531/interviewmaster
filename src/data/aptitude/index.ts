/**
 * One typed view over the company question banks that live under
 * src/app/(marketing)/products/aptitude-ai/standard/<topic>/questions/.
 * The bank files stay where they are; this module only normalises them.
 */

import * as numTcs from "@/app/(marketing)/products/aptitude-ai/standard/numerical-ability/questions/tcs";
import * as numInfosys from "@/app/(marketing)/products/aptitude-ai/standard/numerical-ability/questions/infosys";
import * as numWipro from "@/app/(marketing)/products/aptitude-ai/standard/numerical-ability/questions/wipro";
import * as numAccenture from "@/app/(marketing)/products/aptitude-ai/standard/numerical-ability/questions/accenture";
import * as numCommon from "@/app/(marketing)/products/aptitude-ai/standard/numerical-ability/questions/common";
import * as verTcs from "@/app/(marketing)/products/aptitude-ai/standard/verbal-reasoning/questions/tcs";
import * as verInfosys from "@/app/(marketing)/products/aptitude-ai/standard/verbal-reasoning/questions/infosys";
import * as verWipro from "@/app/(marketing)/products/aptitude-ai/standard/verbal-reasoning/questions/wipro";
import * as verAccenture from "@/app/(marketing)/products/aptitude-ai/standard/verbal-reasoning/questions/accenture";
import * as verCommon from "@/app/(marketing)/products/aptitude-ai/standard/verbal-reasoning/questions/common";
import * as logTcs from "@/app/(marketing)/products/aptitude-ai/standard/logical-reasoning/questions/tcs";
import * as logInfosys from "@/app/(marketing)/products/aptitude-ai/standard/logical-reasoning/questions/infosys";
import * as logWipro from "@/app/(marketing)/products/aptitude-ai/standard/logical-reasoning/questions/wipro";
import * as logAccenture from "@/app/(marketing)/products/aptitude-ai/standard/logical-reasoning/questions/accenture";
import * as logCommon from "@/app/(marketing)/products/aptitude-ai/standard/logical-reasoning/questions/common";
import * as nvTcs from "@/app/(marketing)/products/aptitude-ai/standard/non-verbal-reasoning/questions/tcs";
import * as nvInfosys from "@/app/(marketing)/products/aptitude-ai/standard/non-verbal-reasoning/questions/infosys";
import * as nvWipro from "@/app/(marketing)/products/aptitude-ai/standard/non-verbal-reasoning/questions/wipro";
import * as nvAccenture from "@/app/(marketing)/products/aptitude-ai/standard/non-verbal-reasoning/questions/accenture";
import * as nvCommon from "@/app/(marketing)/products/aptitude-ai/standard/non-verbal-reasoning/questions/common";
import * as qaTcs from "@/app/(marketing)/products/aptitude-ai/standard/quantitative-aptitude/questions/tcs";
import * as qaInfosys from "@/app/(marketing)/products/aptitude-ai/standard/quantitative-aptitude/questions/infosys";
import * as qaWipro from "@/app/(marketing)/products/aptitude-ai/standard/quantitative-aptitude/questions/wipro";
import * as qaAccenture from "@/app/(marketing)/products/aptitude-ai/standard/quantitative-aptitude/questions/accenture";
import * as qaCommon from "@/app/(marketing)/products/aptitude-ai/standard/quantitative-aptitude/questions/common";
import * as diTcs from "@/app/(marketing)/products/aptitude-ai/standard/data-interpretation/questions/tcs";
import * as diInfosys from "@/app/(marketing)/products/aptitude-ai/standard/data-interpretation/questions/infosys";
import * as diWipro from "@/app/(marketing)/products/aptitude-ai/standard/data-interpretation/questions/wipro";
import * as diAccenture from "@/app/(marketing)/products/aptitude-ai/standard/data-interpretation/questions/accenture";
import * as diCommon from "@/app/(marketing)/products/aptitude-ai/standard/data-interpretation/questions/common";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type AptitudeQuestion = {
  id: string;
  topic: TopicId;
  company: CompanyId;
  question: string;
  /** Options without their "a) " prefixes. */
  options: string[];
  /** Index into `options`. */
  correctIndex: number;
  explanation: string;
  category: string;
  difficulty: Difficulty;
  hints: string[];
};

export const TOPICS = [
  { id: "numerical-ability", label: "Numerical ability", section: "Quantitative" },
  { id: "quantitative-aptitude", label: "Quantitative aptitude", section: "Quantitative" },
  { id: "data-interpretation", label: "Data interpretation", section: "Quantitative" },
  { id: "logical-reasoning", label: "Logical reasoning", section: "Reasoning" },
  { id: "non-verbal-reasoning", label: "Non-verbal reasoning", section: "Reasoning" },
  { id: "verbal-reasoning", label: "Verbal reasoning", section: "Verbal" },
] as const;
export type TopicId = (typeof TOPICS)[number]["id"];
export const isTopicId = (v: string): v is TopicId => TOPICS.some((t) => t.id === v);
export const topicLabel = (id: string) => TOPICS.find((t) => t.id === id)?.label ?? id;
export const topicSection = (id: string) => TOPICS.find((t) => t.id === id)?.section ?? "Aptitude";

export const COMPANIES = [
  { id: "common", label: "General" },
  { id: "tcs", label: "TCS" },
  { id: "infosys", label: "Infosys" },
  { id: "wipro", label: "Wipro" },
  { id: "accenture", label: "Accenture" },
] as const;
export type CompanyId = (typeof COMPANIES)[number]["id"];
export const isCompanyId = (v: string): v is CompanyId => COMPANIES.some((c) => c.id === v);
export const companyLabel = (id: string) => COMPANIES.find((c) => c.id === id)?.label ?? id;

/* ---------------- normalisation ---------------- */

type RawQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: string;
  answer?: string;
  explanation?: string;
  category?: string;
  difficulty?: string;
  hints?: string[];
};

const PREFIX = /^\s*[a-dA-D][).:]\s*/;
const stripPrefix = (o: string) => o.replace(PREFIX, "").trim();

function correctIndexOf(raw: RawQuestion, options: string[]): number {
  const letter = (raw.correctAnswer ?? raw.answer ?? "").trim();
  if (/^[a-dA-D]$/.test(letter)) return letter.toLowerCase().charCodeAt(0) - 97;
  const text = stripPrefix(letter).toLowerCase();
  const byText = options.findIndex((o) => o.toLowerCase() === text);
  if (byText >= 0) return byText;
  const m = letter.match(/^([a-dA-D])[).:]/);
  if (m) return m[1].toLowerCase().charCodeAt(0) - 97;
  return 0;
}

const normaliseDifficulty = (d?: string): Difficulty => {
  const v = (d ?? "").toLowerCase();
  if (v.startsWith("e")) return "Easy";
  if (v.startsWith("h")) return "Hard";
  return "Medium";
};

function normalise(topic: TopicId, company: CompanyId, raw: RawQuestion[]): AptitudeQuestion[] {
  return raw
    .filter((q) => q && q.question && Array.isArray(q.options) && q.options.length >= 2)
    .map((q) => {
      const options = q.options.map(stripPrefix);
      return {
        id: `${topic}:${company}:${q.id}`,
        topic,
        company,
        question: q.question,
        options,
        correctIndex: Math.min(options.length - 1, Math.max(0, correctIndexOf(q, options))),
        explanation: q.explanation ?? "",
        category: q.category ?? topicLabel(topic),
        difficulty: normaliseDifficulty(q.difficulty),
        hints: q.hints ?? [],
      };
    });
}

const firstArray = (mod: Record<string, unknown>): RawQuestion[] => {
  for (const v of Object.values(mod)) if (Array.isArray(v)) return v as RawQuestion[];
  return [];
};

const MODULES: Record<TopicId, Record<CompanyId, Record<string, unknown>>> = {
  "numerical-ability": { tcs: numTcs, infosys: numInfosys, wipro: numWipro, accenture: numAccenture, common: numCommon },
  "verbal-reasoning": { tcs: verTcs, infosys: verInfosys, wipro: verWipro, accenture: verAccenture, common: verCommon },
  "logical-reasoning": { tcs: logTcs, infosys: logInfosys, wipro: logWipro, accenture: logAccenture, common: logCommon },
  "non-verbal-reasoning": { tcs: nvTcs, infosys: nvInfosys, wipro: nvWipro, accenture: nvAccenture, common: nvCommon },
  "quantitative-aptitude": { tcs: qaTcs, infosys: qaInfosys, wipro: qaWipro, accenture: qaAccenture, common: qaCommon },
  "data-interpretation": { tcs: diTcs, infosys: diInfosys, wipro: diWipro, accenture: diAccenture, common: diCommon },
};

const cache = new Map<string, AptitudeQuestion[]>();

export function questionsFor(topic: TopicId, company: CompanyId): AptitudeQuestion[] {
  const key = `${topic}:${company}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const list = normalise(topic, company, firstArray(MODULES[topic][company]));
  cache.set(key, list);
  return list;
}

export function bankSize(topic: TopicId): number {
  return COMPANIES.reduce((n, c) => n + questionsFor(topic, c.id).length, 0);
}
