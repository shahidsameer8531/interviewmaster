import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { coachingStatus } from "./schema";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("coachingRequests")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    service: v.string(),
    slots: v.array(v.string()),
    focus: v.string(),
    shareReports: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    return await ctx.db.insert("coachingRequests", {
      userId,
      ...args,
      status: "requested",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: { id: v.id("coachingRequests"), status: coachingStatus },
  handler: async (ctx, { id, status }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("Request not found");
    await ctx.db.patch(id, { status });
    return id;
  },
});
