/**
 * Which OAuth buttons to show. Each provider also needs AUTH_<PROVIDER>_ID
 * and AUTH_<PROVIDER>_SECRET on the Convex deployment; without them the
 * provider's sign-in URL returns 500, so the button stays hidden until the
 * matching build-time flag is set.
 */
export type OAuthProvider = "google" | "github";

export const OAUTH_PROVIDERS: OAuthProvider[] = [
  ...(process.env.NEXT_PUBLIC_AUTH_GOOGLE === "1" ? (["google"] as const) : []),
  ...(process.env.NEXT_PUBLIC_AUTH_GITHUB === "1" ? (["github"] as const) : []),
];
