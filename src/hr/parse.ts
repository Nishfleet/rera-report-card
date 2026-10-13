import * as cheerio from "cheerio";
import type { Filing, ParseResult, Project, ProjectRecord, Unreadable } from "../types.js";

export const PARSER_VERSION = "hr-1";

const LIST_HEADERS = [
  "Registration Certificate Number",
  "Project ID",
  "Project Name",
  "Builder",
  "Project Location",
  "Project District",
  "Registered With",
  "Registration Up-to",
];

const unreadable = (reason: string): Unreadable => ({ ok: false, unreadable: true, reason });

// A CAPTCHA in visible text, an element id, name, class or alt text. Script and style bodies do not count.
function checkPage($: cheerio.CheerioAPI): Unreadable | null {
  $("script, style").remove();
  const marked = $("[id], [name], [class], [alt], [src]").filter((_, el) =>
    ["id", "name", "class", "alt", "src"].some((a) => /captcha/i.test($(el).attr(a) ?? "")),
  );
  if (marked.length > 0 || /captcha/i.test($.root().text())) return unreadable("captcha: page asks for a CAPTCHA");
  return null;
}

const clean = (text: string): string => text.replace(/\s+/g, " ").trim();

// "09.10.2020", "09-10-2020" and "09/10/2020" are day first. "31-Dec-2019" has a month name.
function toUnix(text: string): number | null {
  const num = /(\d{1,2})[./-](\d{1,2})[./-](\d{4})/.exec(text);
  if (num) return dateUtc(Number(num[3]), Number(num[2]), Number(num[1]));
  const named = /(\d{1,2})-([A-Za-z]{3})-(\d{4})/.exec(text);
  if (named) {
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(
      named[2].toLowerCase(),
    );
    if (month >= 0) return dateUtc(Number(named[3]), month + 1, Number(named[1]));
  }
  return null;
}

function dateUtc(y: number, m: number, d: number): number | null {
  const ms = Date.UTC(y, m - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return null;
  return ms / 1000;
}

// The text after the word DATED holds the registration date. The whole text, date included, is kept as the certificate.
function certificate(text: string): { number: string; date: number | null; lapsed: boolean } {
  const lapsed = /Lapsed Project/i.test(text);
  const base = clean(text.replace(/Lapsed Project/i, ""));
  const at = base.search(/DATED/i);
  const date = at >= 0 ? toUnix(base.slice(at)) : null;
  return { number: base, date, lapsed };
}

export interface ListRow {
  regno: string;
  detailId: string;
  detailUrl: string;
  record: ProjectRecord;
}

export interface ListPage {
  rows: ListRow[];
  // Rows left out one by one, each with its reason. Never guessed into a record.
  skipped: { serial: string; reason: string }[];
}

export function parseList(html: string, pageUrl: string): ParseResult<ListPage> {
  const $ = cheerio.load(html);
  const blocked = checkPage($);
  if (blocked) return blocked;
  const table = $("table#compliant_hearing");
  if (table.length !== 1) return unreadable("layout: no single table#compliant_hearing");
  const heads = table
    .find("thead th")
    .map((_, th) => clean($(th).text()))
    .get();
  const col: Record<string, number> = {};
  for (const name of LIST_HEADERS) {
    const at = heads.indexOf(name);
    if (at < 0) return unreadable(`layout: missing column "${name}"`);
    col[name] = at;
  }
  const rows: ListRow[] = [];
  const skipped: ListPage["skipped"] = [];
  table.find("tbody tr").each((_, tr) => {
    const td = $(tr).children("td");
    const serial = clean(td.eq(0).text());
    if (td.length !== heads.length) {
      skipped.push({ serial, reason: `row has ${td.length} cells, expected ${heads.length}` });
      return;
    }
    const cell = (name: string) => td.eq(col[name]);
    const regno = clean(cell("Project ID").text());
    if (!/^RERA-[A-Z]+-\d+-\d{4}$/.test(regno)) {
      skipped.push({ serial, reason: `no readable project id: "${regno}"` });
      return;
    }
    const rawHref = cell("Project ID").find("a").attr("href");
    const href = rawHref ? new URL(rawHref, pageUrl).href : null;
    const detail = href ? /\/searchprojectDetail\/(\d+)$/.exec(href) : null;
    if (!href || !detail) {
      skipped.push({ serial, reason: `${regno}: no detail link` });
      return;
    }
    const cert = certificate(cell("Registration Certificate Number").text());
    const upTo = clean(cell("Registration Up-to").text());
    const project: Project = {
      state: "hr",
      regno,
      name: clean(cell("Project Name").text()),
      promoter: clean(cell("Builder").text()),
      district: clean(cell("Project District").text()),
      locality: clean(cell("Project Location").text()),
      status: cert.lapsed ? "lapsed" : "registered",
      statusText: cert.lapsed ? "Lapsed Project" : null,
    };
    const filing: Filing = {
      type: "registration",
      effectiveDate: cert.date,
      payload: {
        certificate: cert.number,
        registeredWith: clean(cell("Registered With").text()),
        validUpTo: upTo || null,
        validUpToUnix: toUnix(upTo)?.toString() ?? null,
      },
      sourceUrl: href,
      parserVersion: PARSER_VERSION,
    };
    rows.push({ regno, detailId: detail[1], detailUrl: href, record: { project, filings: [filing] } });
  });
  if (rows.length === 0) return unreadable(`layout: no readable rows in ${pageUrl} (${skipped.length} skipped)`);
  return { ok: true, value: { rows, skipped } };
}

// Finds the first table whose header row holds every wanted name, and returns its first body row by header.
function rowBy($: cheerio.CheerioAPI, wanted: string[]): Record<string, string> | null {
  let found: Record<string, string> | null = null;
  $("table").each((_, t) => {
    if (found) return;
    const heads = $(t)
      .find("thead th")
      .map((__, th) => clean($(th).text()))
      .get();
    if (!wanted.every((w) => heads.includes(w))) return;
    const td = $(t).find("tbody tr").first().children("td");
    if (td.length !== heads.length) return;
    found = {};
    heads.forEach((h, i) => {
      (found as Record<string, string>)[h] = clean(td.eq(i).text());
    });
  });
  return found;
}

export function parseDetail(html: string, pageUrl: string): ParseResult<ProjectRecord> {
  const $ = cheerio.load(html);
  const blocked = checkPage($);
  if (blocked) return blocked;
  if (!/Comprehensive Project Details/.test($("body").text())) {
    return unreadable("layout: no 'Comprehensive Project Details' heading");
  }
  const where = rowBy($, ["Project Name", "Project Location", "Project District", "Promoter Name"]);
  if (!where) return unreadable("layout: no project location table");
  const detail = rowBy($, ["Project Registration Number", "Project Id", "Current Status"]);
  if (!detail) return unreadable("layout: no project detail table");
  const regno = detail["Project Id"];
  if (!/^RERA-[A-Z]+-\d+-\d{4}$/.test(regno)) return unreadable(`layout: unreadable project id "${regno}"`);
  const cert = certificate(detail["Project Registration Number"]);
  const statusText = detail["Current Status"] || null;
  const project: Project = {
    state: "hr",
    regno,
    name: where["Project Name"],
    promoter: where["Promoter Name"],
    district: where["Project District"],
    locality: where["Project Location"],
    status: cert.lapsed ? "lapsed" : "unknown",
    statusText,
  };
  const filing: Filing = {
    type: "registration",
    effectiveDate: cert.date,
    payload: {
      certificate: cert.number,
      receivingDate: detail["Receiving Date"] || null,
      onlineSubmissionDate: detail["Online Submission Date"] || null,
      tehsil: where["Project Tehsil"] || null,
    },
    sourceUrl: pageUrl,
    parserVersion: PARSER_VERSION,
  };
  return { ok: true, value: { project, filings: [filing] } };
}
