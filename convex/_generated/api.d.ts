/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aptitudeAttempts from "../aptitudeAttempts.js";
import type * as auth from "../auth.js";
import type * as coachingRequests from "../coachingRequests.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as importGuestData from "../importGuestData.js";
import type * as interviewSessions from "../interviewSessions.js";
import type * as payments from "../payments.js";
import type * as resumes from "../resumes.js";
import type * as stripe from "../stripe.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aptitudeAttempts: typeof aptitudeAttempts;
  auth: typeof auth;
  coachingRequests: typeof coachingRequests;
  emails: typeof emails;
  http: typeof http;
  importGuestData: typeof importGuestData;
  interviewSessions: typeof interviewSessions;
  payments: typeof payments;
  resumes: typeof resumes;
  stripe: typeof stripe;
  subscriptions: typeof subscriptions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
