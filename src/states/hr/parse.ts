// Haryana RERA (haryanarera.gov.in) parsers. Pure functions from page HTML to records.
// Layouts read from the fixtures in tests/fixtures/hr, captured 13 Oct 2026.
// Any layout we do not recognise is unreadable with a reason, never a partial guess.
import { load, type CheerioAPI } from "cheerio";
import type { Filing, ParseResult, ProjectRecord } from "../../ingest/types";

export const PARSER_VERSION = "hr-1";
export const BASE = "https://haryanarera.gov.in";

export const LIST_HEADERS = [
  "Serial No.",
  "Registration Certificate Number",
  "Project ID",
  "Project Name",
  "Builder",
  "Project Location",
  "Project District",
  "Registered With",
  "Details of Project(Form A-H)",
  "Registration Up-to",
  "View Certificate",
  "View Quarterly Progress",
  "Monitoring Orders",
  "View OC/CC/PCC",
];

const LOCATION_HEADERS = ["Project Name", "Project Location", "Project District", "Project Tehsil", "Promoter Name"];
const DETAIL_HEADERS_START = ["Project Registration Number", "Project Id", "Receiving Date", "Online Submission Date", "Current Status"];
const HEARING_HEADERS = ["Date of Hearing", "Proceedings of the day", "Status", "Order"];

// The list pages are per office. 1 is Panchkula, 2 is Gurugram (checked against the fixtures).
export const OFFICES: Record<string, string> = { "1": "Panchkula", "2": "Gurugram" };

export interface HrListRow {
  regno: string;
  detailId: string | null;
  projectId: string | null;
  name: string;
  promoter: string;
  locality: string;
  district: string;
  registeredWith: string;
  registeredOn: string | null; // ISO date
  validUntil: string | null; // ISO date
  lapsed: boolean;
  suspended: boolean;
  inAbeyance: boolean;
  supersededBy: string | null;
  supersedes: string | null;
  qprStatus: "view" | "not_uploaded" | "na" | "other";
  certificateUrl: string | null;
  formUrl: string | null;
}

export interface HrHearing {
  date: string | null;
  proceedings: string;
  status: string;
  orderUrl: string | null;
}

export interface HrDetail {
  record: ProjectRecord;
  hearings: HrHearing[];
  filings: Filing[];
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function iso(y: number, m: number, d: number): string | null {
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

// Reads "31/12/2026", "09.10.2017", "9.1.2017" and "31-Dec-2019". Anything else is null.
export function parseDate(text: string): string | null {
  const t = clean(text);
  let m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(t);
  if (m) return iso(Number(m[3]), Number(m[2]), Number(m[1]));
  m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(t);
  if (m && MONTHS[m[2].toLowerCase()] !== undefined) return iso(Number(m[3]), MONTHS[m[2].toLowerCase()], Number(m[1]));
  return null;
}

// Returns why a page cannot be read at all, or null if it looks like a normal portal page.
export function pageProblem(html: string): string | null {
  if (clean(html) === "") return "empty page";
  const $ = load(html);
  const text = clean($("body").text()).toLowerCase();
  const hasCaptcha =
    /captcha/i.test($("img, input, form, div").map((_, el) => $.html(el)).get().join(" ")) ||
    text.includes("captcha");
  if (hasCaptcha) return "page asks for a CAPTCHA; we do not solve CAPTCHAs";
  if (/under maintenance|service unavailable|temporarily unavailable/.test(text)) return "portal shows a maintenance page";
  return null;
}

function headersOf($: CheerioAPI, table: Parameters<CheerioAPI>[0]): string[] {
  return $(table)
    .find("thead th")
    .map((_, th) => clean($(th).text()))
    .get()
    .filter((h) => h !== "");
}

function findTable($: CheerioAPI, first: string) {
  return $("table")
    .filter((_, t) => headersOf($, t)[0] === first)
    .first();
}

function sameHeaders(got: string[], want: string[]): boolean {
  return got.length === want.length && want.every((h, i) => got[i] === h);
}

function href($: CheerioAPI, cell: Parameters<CheerioAPI>[0], pattern: RegExp): string | null {
  const a = $(cell)
    .find("a[href], form[action]")
    .map((_, el) => $(el).attr("href") ?? $(el).attr("action") ?? "")
    .get()
    .find((u) => pattern.test(u));
  return a ?? null;
}

// Splits the registration cell into the number and the notes the portal appends to it.
export function parseRegistrationCell(text: string) {
  const t = clean(text);
  const lapsed = /lapsed project/i.test(t);
  const suspended = /registration suspended/i.test(t);
  const inAbeyance = /in abeyance/i.test(t);
  const by = /SUPERSEDED BY (?:RC NO\.?\s*)?([^)]+?)(?:\s+DATED[^)]*)?(?:\)|$)/i.exec(t);
  const sup = /\(SUPERSEDES ([^)]+?)(?:\s+DATED[^)]*)?\)/i.exec(t);
  const dated = /^[^(]*?\bDATED[- ]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i.exec(t);
  const regno = clean(t.split(/\s+DATED\b|\s*\(|\s+Lapsed Project|\s+IS HEREBY/i)[0]);
  return {
    regno,
    registeredOn: dated ? parseDate(dated[1]) : null,
    lapsed,
    suspended,
    inAbeyance,
    supersededBy: by ? clean(by[1]) : null,
    supersedes: sup ? clean(sup[1]) : null,
  };
}

function qprStatus(text: string): HrListRow["qprStatus"] {
  const t = clean(text).toLowerCase();
  if (t === "view") return "view";
  if (t === "qpr not uploaded") return "not_uploaded";
  if (t === "na") return "na";
  return "other";
}

// Parses one office's "registered projects" list page.
export function parseList(html: string): ParseResult<HrListRow[]> {
  const problem = pageProblem(html);
  if (problem) return { ok: false, unreadable: problem };
  const $ = load(html);
  const table = findTable($, "Serial No.");
  const tables = $("table").filter((_, t) => sameHeaders(headersOf($, t), LIST_HEADERS));
  if (tables.length !== 1) {
    const seen = table.length ? headersOf($, table.get(0)).join(" | ") : "none";
    return { ok: false, unreadable: `unknown list layout: expected the 14-column project table, saw headers ${seen}` };
  }
  const rows: HrListRow[] = [];
  const bad: number[] = [];
  tables
    .find("tbody > tr")
    .each((i, tr) => {
      const td = $(tr).children("td").get();
      if (td.length !== LIST_HEADERS.length) {
        bad.push(i + 1);
        return;
      }
      const reg = parseRegistrationCell($(td[1]).text());
      const detail = href($, td[2], /searchprojectDetail\/\d+/) ?? href($, td[1], /searchprojectDetail\/\d+/);
      const projectId = clean($(td[2]).text());
      const upto = clean($(td[9]).text());
      const validUntil = upto === "" ? null : parseDate(upto);
      if (reg.regno === "" || (upto !== "" && validUntil === null)) {
        bad.push(i + 1);
        return;
      }
      rows.push({
        regno: reg.regno,
        detailId: detail ? (/searchprojectDetail\/(\d+)/.exec(detail) as RegExpExecArray)[1] : null,
        projectId: projectId === "" || projectId === "NA" ? null : projectId,
        name: clean($(td[3]).text()),
        promoter: clean($(td[4]).text()),
        locality: clean($(td[5]).text()),
        district: clean($(td[6]).text()),
        registeredWith: clean($(td[7]).text()),
        registeredOn: reg.registeredOn,
        validUntil,
        lapsed: reg.lapsed,
        suspended: reg.suspended,
        inAbeyance: reg.inAbeyance,
        supersededBy: reg.supersededBy,
        supersedes: reg.supersedes,
        qprStatus: qprStatus($(td[11]).text()),
        certificateUrl: href($, td[10], /view_certificate\//),
        formUrl: href($, td[8], /project_preview_open\//),
      });
    });
  if (bad.length > 0) {
    return { ok: false, unreadable: `unknown row layout in list rows ${bad.slice(0, 5).join(", ")}${bad.length > 5 ? " and more" : ""}` };
  }
  if (rows.length === 0) return { ok: false, unreadable: "list page has no project rows" };
  return { ok: true, value: rows };
}

export function detailUrl(detailId: string): string {
  return `${BASE}/view_project/searchprojectDetail/${detailId}`;
}

// The registration filing the grader reads (input "registration").
// Haryana marks a lapse on the list page, so the list row is the source.
export function registrationFiling(row: HrListRow, sourceUrl: string, readOn: string): Filing | null {
  if (row.validUntil === null) return null;
  return {
    id: `hr:${row.regno}:registration`,
    type: "registration",
    date: row.registeredOn ?? readOn,
    sourceUrl,
    payload: {
      status: row.lapsed ? "lapsed" : row.suspended ? "suspended" : "active",
      validUntil: row.validUntil,
      dateIsReadDate: row.registeredOn === null,
      supersededBy: row.supersededBy,
    },
  };
}

// Turns a list row into the project record. Status follows the portal's own label only.
export function recordFromRow(row: HrListRow, sourceUrl: string): ProjectRecord {
  return {
    state: "hr",
    regno: row.regno,
    name: row.name,
    promoter: row.promoter,
    district: row.district,
    locality: row.locality,
    status: row.lapsed ? "lapsed" : "under_construction",
    sourceUrl: row.detailId ? detailUrl(row.detailId) : sourceUrl,
    facts: {
      projectId: row.projectId,
      registeredWith: row.registeredWith,
      registeredOn: row.registeredOn,
      validUntil: row.validUntil,
      suspended: row.suspended,
      inAbeyance: row.inAbeyance,
      supersededBy: row.supersededBy,
      supersedes: row.supersedes,
      qprStatus: row.qprStatus,
      certificateUrl: row.certificateUrl,
      formUrl: row.formUrl,
    },
  };
}

// Parses one project detail page (view_project/searchprojectDetail/:id).
export function parseDetail(html: string, sourceUrl: string): ParseResult<HrDetail> {
  const problem = pageProblem(html);
  if (problem) return { ok: false, unreadable: problem };
  const $ = load(html);

  const loc = findTable($, "Project Name");
  const det = findTable($, "Project Registration Number");
  if (!loc.length || !sameHeaders(headersOf($, loc.get(0)), LOCATION_HEADERS)) {
    return { ok: false, unreadable: "unknown detail layout: project location table missing or changed" };
  }
  if (!det.length || !sameHeaders(headersOf($, det.get(0)).slice(0, DETAIL_HEADERS_START.length), DETAIL_HEADERS_START)) {
    return { ok: false, unreadable: "unknown detail layout: project detail table missing or changed" };
  }
  const locCells = loc.find("tbody > tr").first().children("td").get();
  const detHeaders = headersOf($, det.get(0));
  const detCells = det.find("tbody > tr").first().children("td").get();
  if (locCells.length !== LOCATION_HEADERS.length || detCells.length !== detHeaders.length) {
    return { ok: false, unreadable: "unknown detail layout: row does not match its headers" };
  }
  const cell = (name: string) => clean($(detCells[detHeaders.indexOf(name)]).text());
  const reg = parseRegistrationCell(cell("Project Registration Number"));
  if (reg.regno === "") return { ok: false, unreadable: "detail page has no registration number" };

  const hearings: HrHearing[] = [];
  const hear = findTable($, "Date of Hearing");
  if (hear.length) {
    if (!sameHeaders(headersOf($, hear.get(0)), HEARING_HEADERS)) {
      return { ok: false, unreadable: "unknown detail layout: hearing table changed" };
    }
    let badHearing = false;
    hear.find("tbody > tr").each((_, tr) => {
      const td = $(tr).children("td").get();
      if (td.length !== HEARING_HEADERS.length) {
        badHearing = true;
        return;
      }
      hearings.push({
        date: parseDate($(td[0]).text()),
        proceedings: clean($(td[1]).text()),
        status: clean($(td[2]).text()),
        orderUrl: href($, td[3], /./),
      });
    });
    if (badHearing) return { ok: false, unreadable: "unknown detail layout: hearing row does not match its headers" };
  }

  const projectId = cell("Project Id");
  const record: ProjectRecord = {
    state: "hr",
    regno: reg.regno,
    name: clean($(locCells[0]).text()),
    promoter: clean($(locCells[4]).text()),
    district: clean($(locCells[2]).text()),
    locality: clean($(locCells[1]).text()),
    status: reg.lapsed ? "lapsed" : "under_construction",
    sourceUrl,
    facts: {
      projectId: projectId === "" || projectId === "NA" ? null : projectId,
      tehsil: clean($(locCells[3]).text()),
      registeredOn: reg.registeredOn,
      receivedOn: parseDate(cell("Receiving Date")),
      submittedOn: parseDate(cell("Online Submission Date")),
      portalStatus: cell("Current Status"),
      supersededBy: reg.supersededBy,
      formUrl: href($, detCells, /project_preview_open\//),
      certificateUrl: href($, detCells, /view_certificate\//),
    },
  };
  // Hearing outcomes are free text on this portal. We store them and grade nothing from them
  // until we have read enough of them to map them to complaints and orders.
  return { ok: true, value: { record, hearings, filings: [] } };
}
