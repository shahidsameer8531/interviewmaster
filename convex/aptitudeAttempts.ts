import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

/** Newest first, capped so Today and the aptitude hub stay cheap. */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("aptitudeAttempts")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? 500);
  },
});

export const record = mutation({
  args: {
    topic: v.string(),
    company: v.string(),
    questionId: v.string(),
    correct: v.boolean(),
    timeSec: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    return await ctx.db.insert("aptitudeAttempts", { userId, ...args, at: Date.now() });
  },
});
