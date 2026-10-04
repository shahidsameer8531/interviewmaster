/**
 * The Next.js auth proxy catches every server-side auth error and answers
 * `null`; the client library then throws a TypeError reading `null.redirect`.
 * A genuine network failure throws a fetch error instead. Telling the two
 * apart is what lets the forms say something true.
 */
export type SignInFailure = "network" | "rejected";

export function classifySignInError(err: unknown): SignInFailure {
  const message = err instanceof Error ? err.message : String(err);
  if (/failed to fetch|networkerror|load failed|network request failed|ECONN|ENOTFOUND|timeout/i.test(message)) return "network";
  return "rejected";
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export const MESSAGES = {
  invalidEmail: "Enter a valid email address.",
  shortPassword: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  network: "The request never reached the server. Check your connection and try again.",
  signInRejected: "Couldn't sign you in. The email or password is wrong.",
  signUpExists: "An account with this email already exists. Sign in instead.",
  signUpRejected: "Couldn't create the account. Try a different email, or try again in a minute.",
};

/** Guest access ends the moment a real sign-in succeeds. The guest data in
 *  localStorage is kept so the import offer can move it into the account. */
export function clearGuestCookie() {
  try {
    document.cookie = "userStatus=; path=/; max-age=0; SameSite=Lax";
  } catch {
    /* ignore */
  }
}
