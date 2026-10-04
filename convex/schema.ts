import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";

export const PRODUCT_TYPE = v.union(v.literal("Starter Kit"), v.literal("Premium Kit"));

/* ---------------- Prep Room validators (shared with the app layer) ---------------- */

export const sessionStatus = v.union(v.literal("in_progress"), v.literal("done"), v.literal("abandoned"));

export const sessionQuestion = v.object({
  text: v.string(),
  startedAt: v.number(),
  durationSec: v.number(),
  transcript: v.string(),
  score: v.optional(v.number()),
});

export const sessionDelivery = v.object({
  wpm: v.number(),
  fillerPerMin: v.number(),
  eyeContactPct: v.optional(v.number()),
  longestPauseSec: v.number(),
});

export const reportDimension = v.object({
  key: v.string(),
  label: v.string(),
  score: v.number(),
});

export const reportQuestion = v.object({
  index: v.number(),
  score: v.number(),
  landed: v.array(v.string()),
  fix: v.array(v.string()),
  strongerAnswer: v.array(v.string()),
  /** Verbatim phrases from the answer that landed, for the sky highlights. */
  highlights: v.optional(v.array(v.string())),
});

export const sessionReport = v.object({
  scenario: v.string(),
  overall: v.number(),
  dimensions: v.array(reportDimension),
  biggestWin: v.string(),
  biggestFix: v.string(),
  /** One sentence on where the candidate stands against the bar. */
  summary: v.optional(v.string()),
  questions: v.array(reportQuestion),
  generatedAt: v.number(),
});

export const coachingStatus = v.union(v.literal("requested"), v.literal("confirmed"), v.literal("cancelled"));

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    selectedTemplate: v.optional(v.string()),
    hasPurchasedPremium: v.optional(v.boolean()),
    hasPurchasedStarter: v.optional(v.boolean()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    // Prep Room target. Drives Today, the sidebar card and interview setup.
    targetRole: v.optional(v.string()),
    targetCompany: v.optional(v.string()),
    targetLevel: v.optional(v.string()),
    loopDate: v.optional(v.string()),
    planStartedAt: v.optional(v.number()),
  }).index("email", ["email"]),

  payments: defineTable({
    amount: v.number(),
    userId: v.id("users"),
    productType: PRODUCT_TYPE,
    stripePaymentStatus: v.string(),
    stripePaymentIntentId: v.string(),
  }).index("userId", ["userId"]),

  subscriptions: defineTable({
    email: v.string(),
  }),

  interviewSessions: defineTable({
    userId: v.id("users"),
    track: v.string(),
    role: v.string(),
    company: v.string(),
    level: v.string(),
    style: v.string(),
    lengthMin: v.number(),
    status: sessionStatus,
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    questions: v.array(sessionQuestion),
    delivery: v.optional(sessionDelivery),
    report: v.optional(sessionReport),
  }).index("userId", ["userId", "startedAt"]),

  resumes: defineTable({
    userId: v.id("users"),
    name: v.string(),
    version: v.number(),
    data: v.any(),
    jobDescription: v.optional(v.string()),
    atsScore: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("userId", ["userId", "updatedAt"]),

  aptitudeAttempts: defineTable({
    userId: v.id("users"),
    topic: v.string(),
    company: v.string(),
    questionId: v.string(),
    correct: v.boolean(),
    timeSec: v.number(),
    at: v.number(),
  }).index("userId", ["userId", "at"]),

  coachingRequests: defineTable({
    userId: v.id("users"),
    service: v.string(),
    slots: v.array(v.string()),
    focus: v.string(),
    shareReports: v.boolean(),
    status: coachingStatus,
    createdAt: v.number(),
  }).index("userId", ["userId", "createdAt"]),
});

export default schema;
