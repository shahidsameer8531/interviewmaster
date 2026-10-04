import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { sessionDelivery, sessionQuestion, sessionReport, sessionStatus } from "./schema";

/** Newest first. */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("interviewSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? 100);
  },
});

export const get = query({
  args: { id: v.id("interviewSessions") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) return null;
    return doc;
  },
});

export const create = mutation({
  args: {
    track: v.string(),
    role: v.string(),
    company: v.string(),
    level: v.string(),
    style: v.string(),
    lengthMin: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    return await ctx.db.insert("interviewSessions", {
      userId,
      ...args,
      status: "in_progress",
      startedAt: Date.now(),
      questions: [],
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("interviewSessions"),
    status: v.optional(sessionStatus),
    endedAt: v.optional(v.number()),
    questions: v.optional(v.array(sessionQuestion)),
    delivery: v.optional(sessionDelivery),
    report: v.optional(sessionReport),
  },
  handler: async (ctx, { id, ...patch }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("Session not found");
    const clean = Object.fromEntries(Object.entries(patch).filter(([, val]) => val !== undefined));
    await ctx.db.patch(id, clean);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("interviewSessions") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("Session not found");
    await ctx.db.delete(id);
  },
});
