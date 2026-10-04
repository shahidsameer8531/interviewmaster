import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { coachingStatus, sessionDelivery, sessionQuestion, sessionReport, sessionStatus } from "./schema";

/**
 * Moves everything a person practised as a guest into their account in one
 * mutation, so the import is all-or-nothing. The client clears the guest
 * store only after this succeeds.
 */
export const importGuest = mutation({
  args: {
    target: v.optional(
      v.object({
        targetRole: v.optional(v.string()),
        targetCompany: v.optional(v.string()),
        targetLevel: v.optional(v.string()),
        loopDate: v.optional(v.string()),
        planStartedAt: v.optional(v.number()),
      })
    ),
    sessions: v.array(
      v.object({
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
      })
    ),
    resumes: v.array(
      v.object({
        name: v.string(),
        version: v.number(),
        data: v.any(),
        jobDescription: v.optional(v.string()),
        atsScore: v.optional(v.number()),
        updatedAt: v.number(),
      })
    ),
    aptitude: v.array(
      v.object({
        topic: v.string(),
        company: v.string(),
        questionId: v.string(),
        correct: v.boolean(),
        timeSec: v.number(),
        at: v.number(),
      })
    ),
    coaching: v.array(
      v.object({
        service: v.string(),
        slots: v.array(v.string()),
        focus: v.string(),
        shareReports: v.boolean(),
        status: coachingStatus,
        createdAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    if (args.sessions.length + args.resumes.length + args.aptitude.length + args.coaching.length > 2000) {
      throw new Error("Too much guest data to import in one go");
    }

    if (args.target) {
      const user = await ctx.db.get(userId);
      // Keep whatever the account already has; fill only the gaps.
      await ctx.db.patch(userId, {
        targetRole: user?.targetRole ?? args.target.targetRole,
        targetCompany: user?.targetCompany ?? args.target.targetCompany,
        targetLevel: user?.targetLevel ?? args.target.targetLevel,
        loopDate: user?.loopDate ?? args.target.loopDate,
        planStartedAt: user?.planStartedAt ?? args.target.planStartedAt,
      });
    }

    for (const s of args.sessions) await ctx.db.insert("interviewSessions", { userId, ...s });
    for (const r of args.resumes) await ctx.db.insert("resumes", { userId, ...r });
    for (const a of args.aptitude) await ctx.db.insert("aptitudeAttempts", { userId, ...a });
    for (const c of args.coaching) await ctx.db.insert("coachingRequests", { userId, ...c });

    return {
      sessions: args.sessions.length,
      resumes: args.resumes.length,
      aptitude: args.aptitude.length,
      coaching: args.coaching.length,
    };
  },
});
