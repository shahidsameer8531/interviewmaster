/**
 * Turns an untrusted `callbackUrl` into a same-origin path.
 *
 * `startsWith("/")` is not enough: "/\\evil.com" passes it and browsers read
 * it as "//evil.com". Parsing against the current origin and requiring the
 * origin to match catches every variant, and only the path, query and hash
 * are kept.
 */
export function safeRedirectPath(raw: string | null | undefined, origin: string, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  let url: URL;
  try {
    url = new URL(raw, origin);
  } catch {
    return fallback;
  }
  if (url.origin !== origin) return fallback;
  const path = `${url.pathname}${url.search}${url.hash}`;
  // Never bounce back into the auth screen itself.
  if (url.pathname === "/auth") return fallback;
  return path || fallback;
}
