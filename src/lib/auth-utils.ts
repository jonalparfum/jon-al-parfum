/** Client-safe auth helpers (no server/database imports). */

export function sanitizeCallbackUrl(url: string): string {
  if (!url.startsWith("/") || url.startsWith("//")) return "/";
  return url;
}
