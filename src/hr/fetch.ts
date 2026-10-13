import type { RawBundle } from "../types.js";

const BASE = "https://haryanarera.gov.in";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36";

// The portal's two registered-projects lists, by office. Ids as in tests/fixtures/hr/README.md.
export const LIST_URLS = {
  panchkula: `${BASE}/admincontrol/registered_projects/1`,
  gurugram: `${BASE}/admincontrol/registered_projects/2`,
} as const;

export const detailUrl = (detailId: string): string => `${BASE}/view_project/searchprojectDetail/${detailId}`;

// Returns the raw page and never parses it. A non-200 status throws so a failed fetch is loud.
export async function fetchPage(url: string, timeoutMs = 60_000): Promise<RawBundle> {
  const res = await fetch(url, {
    headers: { "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const html = await res.text();
  if (res.status !== 200) throw new Error(`fetch ${url}: HTTP ${res.status}`);
  return { url, status: res.status, html, fetchedAt: Math.floor(Date.now() / 1000) };
}
