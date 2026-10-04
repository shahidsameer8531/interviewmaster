import { v } from "convex/values";
import { PRODUCT_TYPE } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, mutation, query } from "./_generated/server";

/**
 * Query current authenticated user's data
 *
 * @returns User object if authenticated, null otherwise
 */
export const currentUser = query({
    handler: async (ctx, _args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) return null;
        return await ctx.db.get(userId)
    }
});

/**
 * Save the Prep Room target (role, company, level, loop date).
 * planStartedAt is set the first time a target is saved and kept afterwards,
 * so "Day n of your plan" counts from the first save.
 */
export const updateTarget = mutation({
    args: {
        targetRole: v.optional(v.string()),
        targetCompany: v.optional(v.string()),
        targetLevel: v.optional(v.string()),
        loopDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Not signed in");
        const user = await ctx.db.get(userId);
        await ctx.db.patch(userId, {
            ...args,
            planStartedAt: user?.planStartedAt ?? Date.now(),
        });
        return userId;
    },
});

/**
 * Update user details after successful purchase
 * Internal mutation called by stripe webhook handler
 */
export const updateUserAfterPurchase = internalMutation({
    args: {
        userId: v.id("users"),
        productType: PRODUCT_TYPE,
        selectedTemplate: v.optional(v.string()),
    },
    handler: async (ctx, {
        userId,
        productType,
        selectedTemplate,
    }) => {
        const updates: Record<string, unknown> = {};
        if (productType === "Premium Kit") {
            updates.hasPurchasedPremium = true;
        } else if (productType === "Starter Kit") {
            updates.hasPurchasedStarter = true;
            if (selectedTemplate) {
                updates.selectedTemplate = selectedTemplate;
            }
        };

        await ctx.db.patch(userId, updates)
        return userId;
    }
})
