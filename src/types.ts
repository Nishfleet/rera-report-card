// Shapes from docs/spec/PLAN.md sections 7.3 and 11.3. Times are UTC unix seconds.

export type FilingType =
  | "registration"
  | "qpr"
  | "extension"
  | "completion_date"
  | "complaint"
  | "order"
  | "progress"
  | "bank";

export interface Project {
  state: "hr";
  regno: string;
  name: string;
  promoter: string;
  district: string;
  locality: string;
  status: "registered" | "lapsed" | "unknown";
  // The portal's own status words, kept so nothing is guessed from them.
  statusText: string | null;
}

export interface Filing {
  type: FilingType;
  // null when the portal shows no readable date.
  effectiveDate: number | null;
  payload: Record<string, string | null>;
  sourceUrl: string;
  parserVersion: string;
}

export interface Unreadable {
  ok: false;
  unreadable: true;
  reason: string;
}

export type ParseResult<T> = { ok: true; value: T } | Unreadable;

export interface ProjectRecord {
  project: Project;
  filings: Filing[];
}

export interface RawBundle {
  url: string;
  status: number;
  html: string;
  fetchedAt: number;
}
