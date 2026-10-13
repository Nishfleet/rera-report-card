// Shapes shared by every state's fetcher and parser (PLAN.md 7.2, 7.3, 11.3).
import type { Filing } from "../grade";

export type StateCode = "mh" | "hr" | "up" | "dl";

export type ProjectStatus = "under_construction" | "lapsed" | "revoked" | "completed" | "unknown";

// One entry in a state's project list: enough to fetch the project's own pages.
export interface ProjectRef {
  regno: string;
  // The state-specific key the fetcher needs to load the project's pages.
  fetchKey: string;
}

export interface RawFile {
  name: string;
  kind: "html" | "pdf";
  bytes: Uint8Array;
  url: string;
  httpStatus: number;
}

export interface RawBundle {
  state: StateCode;
  regno: string;
  files: RawFile[];
  fetchedAt: string; // ISO UTC
  status: "ok" | "unreadable";
  reason?: string;
}

export interface StateFetcher {
  state: StateCode;
  listProjects(cursor: string | null): Promise<{ refs: ProjectRef[]; next: string | null }>;
  fetchProject(ref: ProjectRef): Promise<RawBundle>;
}

// The `project` row of PLAN.md 11.3, as a parser sees it.
export interface ProjectRecord {
  state: StateCode;
  regno: string;
  name: string;
  promoter: string;
  district: string;
  locality: string;
  status: ProjectStatus;
  sourceUrl: string;
  // Facts the state publishes that are not filings yet. Kept as read, never graded.
  facts: Record<string, string | number | boolean | null>;
}

// A parser never guesses: an unknown layout, a CAPTCHA or an empty page is unreadable.
export type ParseResult<T> = { ok: true; value: T } | { ok: false; unreadable: string };

export type { Filing };
