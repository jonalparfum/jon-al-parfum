const CANONICAL_APP_URL = "https://www.jonalparfum.com";
const LEGACY_APP_URL = "https://jonalparfum.com";

/** Normalize AUTH_URL when Vercel still has the non-www value. */
export function normalizeAuthEnv() {
  for (const key of ["AUTH_URL", "NEXT_PUBLIC_APP_URL"] as const) {
    const value = process.env[key]?.replace(/\/$/, "");
    if (value === LEGACY_APP_URL) {
      process.env[key] = CANONICAL_APP_URL;
    }
  }
}

normalizeAuthEnv();
