import type { Filing } from "../grade";

export type StateCode = "mh" | "hr" | "up" | "dl";

export type ProjectStatus = "under_construction" | "lapsed" | "revoked" | "completed" | "unknown";

export interface ProjectRef {
  regno: string;
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
  fetchedAt: string;
  status: "ok" | "unreadable";
  reason?: string;
}

export interface StateFetcher {
  state: StateCode;
  listProjects(cursor: string | null): Promise<{ refs: ProjectRef[]; next: string | null }>;
  fetchProject(ref: ProjectRef): Promise<RawBundle>;
}

export interface ProjectRecord {
  state: StateCode;
  regno: string;
  name: string;
  promoter: string;
  district: string;
  locality: string;
  status: ProjectStatus;
  sourceUrl: string;
  facts: Record<string, string | number | boolean | null>;
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; unreadable: string };

export type { Filing };
