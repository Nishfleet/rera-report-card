// Haryana fetcher (PLAN.md 7.2). Loads raw pages and never parses project content;
// it only reads the list page enough to know which detail pages to load.
import type { ProjectRef, RawBundle, RawFile, StateFetcher } from "../../ingest/types";
import { BASE, OFFICES, detailUrl, pageProblem, parseList } from "./parse";

export const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36";

export const listUrl = (office: string) => `${BASE}/admincontrol/registered_projects/${office}`;

export type FetchLike = (url: string, init?: { headers?: Record<string, string>; signal?: AbortSignal }) => Promise<{
  status: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}>;

export interface HaryanaFetcherOptions {
  fetch?: FetchLike;
  timeoutMs?: number;
  now?: () => Date;
}

export async function getPage(url: string, opts: HaryanaFetcherOptions = {}): Promise<RawFile> {
  const doFetch = opts.fetch ?? (globalThis.fetch as unknown as FetchLike);
  const res = await doFetch(url, {
    headers: { "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(opts.timeoutMs ?? 60_000),
  });
  const bytes = new Uint8Array(await res.arrayBuffer());
  return { name: url.slice(BASE.length + 1).replace(/[^A-Za-z0-9]+/g, "-"), kind: "html", bytes, url, httpStatus: res.status };
}

const decode = (f: RawFile) => new TextDecoder().decode(f.bytes);

export class HaryanaFetcher implements StateFetcher {
  readonly state = "hr" as const;
  constructor(private readonly opts: HaryanaFetcherOptions = {}) {}

  // The cursor is the office id. One call reads one office's whole list.
  async listProjects(cursor: string | null) {
    const offices = Object.keys(OFFICES);
    const office = cursor ?? offices[0];
    const page = await getPage(listUrl(office), this.opts);
    if (page.httpStatus !== 200) throw new Error(`list ${office}: HTTP ${page.httpStatus}`);
    const parsed = parseList(decode(page));
    if (!parsed.ok) throw new Error(`list ${office}: ${parsed.unreadable}`);
    const refs: ProjectRef[] = parsed.value
      .filter((r) => r.detailId !== null)
      .map((r) => ({ regno: r.regno, fetchKey: r.detailId as string }));
    const next = offices[offices.indexOf(office) + 1] ?? null;
    return { refs, next };
  }

  async fetchProject(ref: ProjectRef): Promise<RawBundle> {
    const fetchedAt = (this.opts.now ?? (() => new Date()))().toISOString();
    const base = { state: this.state, regno: ref.regno, fetchedAt };
    let page: RawFile;
    try {
      page = await getPage(detailUrl(ref.fetchKey), this.opts);
    } catch (e) {
      return { ...base, files: [], status: "unreadable", reason: `fetch failed: ${(e as Error).message}` };
    }
    if (page.httpStatus !== 200) {
      return { ...base, files: [page], status: "unreadable", reason: `HTTP ${page.httpStatus}` };
    }
    const problem = pageProblem(decode(page));
    if (problem) return { ...base, files: [page], status: "unreadable", reason: problem };
    return { ...base, files: [page], status: "ok" };
  }
}
