// Grader for PLAN.md section 7.4: one pure function, no clock, no I/O.
// Dates are ISO "YYYY-MM-DD" strings. Months are calendar months, days ignored.

export type Letter = "A" | "B" | "C" | "D" | "E";
export type Impact = "High" | "Medium" | "Low";
export type InputName =
  | "qpr"
  | "registration"
  | "extensions"
  | "completion_date"
  | "complaints_orders"
  | "progress";

export interface Filing {
  id: string;
  // registration | qpr | extension | completion_date | complaint | order | progress | bank | unreadable
  type: string;
  date: string;
  sourceUrl: string;
  payload: Record<string, unknown>;
}

export interface Rule {
  id: string;
  input: InputName;
  kind: string;
  points: number;
  cap: number;
  title: string;
  detail: string;
  maxLetter?: Letter;
  impact?: Impact;
  [param: string]: unknown;
}

export interface RuleTable {
  version: string;
  minReadableInputs: number;
  bands: { letter: Letter; min: number; max: number }[];
  impact: { high: number; medium: number };
  rules: Rule[];
}

export interface Reason {
  ruleId: string;
  points: number;
  impact: Impact;
  title: string;
  detail: string;
  filingId: string;
  filingDate: string;
  sourceUrl: string;
}

export interface Unread {
  input: InputName;
  reason: string;
}

export interface Grade {
  rulesVersion: string;
  asOf: string;
  letter: Letter | null;
  points: number | null;
  reasons: Reason[];
  unread: Unread[];
  clean: InputName[];
}

const INPUTS: InputName[] = [
  "qpr",
  "registration",
  "extensions",
  "completion_date",
  "complaints_orders",
  "progress",
];

const INPUT_OF_TYPE: Record<string, InputName> = {
  registration: "registration",
  qpr: "qpr",
  extension: "extensions",
  completion_date: "completion_date",
  complaint: "complaints_orders",
  order: "complaints_orders",
  progress: "progress",
};

// Inputs that must have a filing on record to count as read.
// Extensions and complaints/orders read as zero when there are none.
const NEEDS_FILING: Partial<Record<InputName, string>> = {
  registration: "registration",
  qpr: "qpr",
  completion_date: "completion_date",
};

function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = total % 12;
  const last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
  const day = Math.min(d, last);
  return `${String(ny).padStart(4, "0")}-${String(nm + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function monthsBetween(fromIso: string, toIso: string): number {
  const [fy, fm] = fromIso.split("-").map(Number);
  const [ty, tm] = toIso.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

function byDateThenId(a: Filing, b: Filing): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

function newestFirst(a: Filing, b: Filing): number {
  return byDateThenId(b, a);
}

interface Ctx {
  asOf: string;
  filings: Filing[]; // usable filings, sorted oldest first
  unread: Map<InputName, string>;
}

function ofType(ctx: Ctx, type: string): Filing[] {
  return ctx.filings.filter((f) => f.type === type);
}

function inWindow(iso: string, ctx: Ctx, months: number): boolean {
  return iso >= addMonths(ctx.asOf, -months) && iso <= ctx.asOf;
}

function windowed(ctx: Ctx, type: string, rule: Rule): Filing[] {
  const months = rule.windowMonths;
  const all = ofType(ctx, type);
  if (months === null) return all;
  return all.filter((f) => inWindow(f.date, ctx, months as number));
}

function qprsInWindow(ctx: Ctx, rule: Rule): Filing[] {
  return ofType(ctx, "qpr").filter((f) =>
    inWindow(f.payload.deadline as string, ctx, rule.windowMonths as number),
  );
}

type Handler = (rule: Rule, ctx: Ctx) => Filing[];

const HANDLERS: Record<string, Handler> = {
  qpr_missed: (rule, ctx) =>
    qprsInWindow(ctx, rule).filter((f) => f.payload.filedOn === null),
  qpr_notice: (rule, ctx) =>
    qprsInWindow(ctx, rule).filter(
      (f) => f.payload.filedOn === null && f.payload.noticeIssued === true,
    ),
  qpr_late: (rule, ctx) =>
    qprsInWindow(ctx, rule).filter(
      (f) =>
        f.payload.filedOn !== null &&
        (f.payload.filedOn as string) > (f.payload.deadline as string),
    ),
  delay_between: (rule, ctx) => {
    const latest = ofType(ctx, "completion_date").sort(newestFirst)[0];
    const months = monthsBetween(
      latest.payload.originalDate as string,
      latest.payload.currentDate as string,
    );
    const max = rule.maxMonths as number | null;
    const inRange = months >= (rule.minMonths as number) && (max === null || months <= max);
    return inRange ? [latest] : [];
  },
  each: (rule, ctx) => windowed(ctx, rule.filingType as string, rule),
  count_between: (rule, ctx) => {
    const found = windowed(ctx, rule.filingType as string, rule);
    const max = rule.max as number | null;
    const inRange = found.length >= (rule.min as number) && (max === null || found.length <= max);
    return inRange ? [found.sort(newestFirst)[0]] : [];
  },
  progress_flat: (_rule, ctx) => {
    const reports = ofType(ctx, "progress");
    const last = reports[reports.length - 1];
    const previous = reports[reports.length - 2];
    return (last.payload.percent as number) <= (previous.payload.percent as number) ? [last] : [];
  },
  registration_lapsed: (_rule, ctx) => {
    // Without a readable extensions input, "no extension on file" is unknown.
    if (ctx.unread.has("extensions")) return [];
    const latest = ofType(ctx, "registration").sort(newestFirst)[0];
    const lapsed =
      latest.payload.status !== "revoked" &&
      (latest.payload.validUntil as string) < ctx.asOf &&
      ofType(ctx, "extension").length === 0;
    return lapsed ? [latest] : [];
  },
  registration_revoked: (_rule, ctx) => {
    const latest = ofType(ctx, "registration").sort(newestFirst)[0];
    return latest.payload.status === "revoked" ? [latest] : [];
  },
};

function impactOf(rule: Rule, points: number, table: RuleTable): Impact {
  if (rule.impact !== undefined) return rule.impact;
  if (points >= table.impact.high) return "High";
  if (points >= table.impact.medium) return "Medium";
  return "Low";
}

function band(table: RuleTable, letter: Letter) {
  return table.bands.find((b) => b.letter === letter) as RuleTable["bands"][number];
}

function bandOfPoints(table: RuleTable, points: number): Letter {
  return (table.bands.find((b) => points >= b.min && points <= b.max) as RuleTable["bands"][number])
    .letter;
}

function hasSource(url: string): boolean {
  return /^https?:\/\/\S+$/.test(url);
}

// Pure and deterministic: the same inputs give the same bytes.
// A filing with no source URL cannot be cited, so it is never graded;
// its input is listed as unread instead.
export function grade(rules: RuleTable, filings: Filing[], asOf: Date): Grade {
  const asOfIso = asOf.toISOString().slice(0, 10);
  const known = filings.filter((f) => f.date <= asOfIso);

  const unreadReason = new Map<InputName, string>();
  const usable: Filing[] = [];
  for (const f of known) {
    if (f.type === "unreadable") {
      unreadReason.set(f.payload.input as InputName, f.payload.reason as string);
    } else if (Object.hasOwn(INPUT_OF_TYPE, f.type) && !hasSource(f.sourceUrl)) {
      unreadReason.set(INPUT_OF_TYPE[f.type], `filing ${f.id} has no source URL`);
    } else {
      usable.push(f);
    }
  }
  usable.sort(byDateThenId);
  const ctx: Ctx = { asOf: asOfIso, filings: usable, unread: unreadReason };

  for (const input of INPUTS) {
    if (unreadReason.has(input)) continue;
    const needed = NEEDS_FILING[input];
    if (needed !== undefined && ofType(ctx, needed).length === 0) {
      unreadReason.set(input, "no filing on record");
    }
  }
  if (!unreadReason.has("progress") && ofType(ctx, "progress").length < 2) {
    unreadReason.set("progress", "fewer than two reports on record");
  }

  const reasons: Reason[] = [];
  const triggered = new Set<InputName>();
  let total = 0;
  let ceiling: Letter = "A";
  for (const rule of rules.rules) {
    if (unreadReason.has(rule.input)) continue;
    const handler = HANDLERS[rule.kind];
    if (handler === undefined) throw new Error(`unknown rule kind ${rule.kind} in ${rule.id}`);
    let used = 0;
    for (const f of handler(rule, ctx).sort(newestFirst)) {
      if (used + rule.points > rule.cap) break;
      used += rule.points;
      triggered.add(rule.input);
      const detail =
        f.payload.against === "promoter" ? `${rule.detail} Against the promoter.` : rule.detail;
      reasons.push({
        ruleId: rule.id,
        points: rule.points,
        impact: impactOf(rule, rule.points, rules),
        title: rule.title,
        detail,
        filingId: f.id,
        filingDate: f.date,
        sourceUrl: f.sourceUrl,
      });
      if (rule.maxLetter !== undefined && rule.maxLetter > ceiling) ceiling = rule.maxLetter;
    }
    total += used;
  }

  const unread: Unread[] = INPUTS.filter((i) => unreadReason.has(i)).map((input) => ({
    input,
    reason: unreadReason.get(input) as string,
  }));
  const clean = INPUTS.filter((i) => !unreadReason.has(i) && !triggered.has(i));

  if (INPUTS.length - unread.length < rules.minReadableInputs) {
    return { rulesVersion: rules.version, asOf: asOfIso, letter: null, points: null, reasons, unread, clean };
  }
  const points = Math.min(Math.max(0, 100 - total), band(rules, ceiling).max);
  return {
    rulesVersion: rules.version,
    asOf: asOfIso,
    letter: bandOfPoints(rules, points),
    points,
    reasons,
    unread,
    clean,
  };
}

// A reason without a source URL does not render.
export function renderableReasons(g: Grade): Reason[] {
  return g.reasons.filter((r) => hasSource(r.sourceUrl));
}
