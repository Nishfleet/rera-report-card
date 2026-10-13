import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { grade, type RuleTable } from "../../src/grade";
import {
  detailUrl,
  pageProblem,
  parseDate,
  parseDetail,
  parseList,
  parseRegistrationCell,
  recordFromRow,
  registrationFiling,
  type HrListRow,
} from "../../src/states/hr/parse";

const dir = new URL("../fixtures/hr/", import.meta.url);
const bytes = (name: string) => {
  const b = readFileSync(new URL(name, dir));
  return name.endsWith(".gz") ? gunzipSync(b) : b;
};
const html = (name: string) => bytes(name).toString("utf8");
const meta = (name: string) => JSON.parse(readFileSync(new URL(name, dir), "utf8")) as { url: string; sha256: string };

const list = (name: string): HrListRow[] => {
  const r = parseList(html(name));
  if (!r.ok) throw new Error(r.unreadable);
  return r.value;
};
const gurugram = list("gurugram-list.html.gz");
const panchkula = list("panchkula-list.html.gz");
const byRegno = (rows: HrListRow[], regno: string) => rows.find((r) => r.regno === regno) as HrListRow;

describe("fixtures are the pages we captured", () => {
  for (const [file, m] of [
    ["gurugram-list.html.gz", "gurugram-list.meta.json"],
    ["panchkula-list.html.gz", "panchkula-list.meta.json"],
    ["detail-1129.html", "detail-1129.meta.json"],
    ["home.html", "home.meta.json"],
  ]) {
    it(`${file} matches its recorded sha256`, () => {
      expect(createHash("sha256").update(bytes(file)).digest("hex")).toBe(meta(m).sha256);
    });
  }
});

describe("parseList", () => {
  it("reads every row of both office lists, with unique registration numbers", () => {
    expect(gurugram).toHaveLength(1082);
    expect(panchkula).toHaveLength(1109);
    for (const rows of [gurugram, panchkula]) {
      expect(new Set(rows.map((r) => r.regno)).size).toBe(rows.length);
      for (const r of rows) {
        expect(r.regno).not.toBe("");
        expect(r.name).not.toBe("");
        expect(r.validUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("turns a Gurugram row into fields", () => {
    expect(gurugram[0]).toEqual({
      regno: "GGM/415/147/2020/31",
      detailId: "1444",
      projectId: "RERA-GRG-741-2020",
      name: "102 EDEN ESTATE",
      promoter: "COUNTRYWIDE PROMOTERS PRIVATE LIMITED",
      locality: "SECTOR 102 & 102 A GURUGRAM",
      district: "GURUGRAM",
      registeredWith: "HRERA",
      registeredOn: "2020-10-09",
      validUntil: "2024-04-30",
      lapsed: false,
      suspended: false,
      inAbeyance: false,
      supersededBy: null,
      supersedes: null,
      qprStatus: "view",
      certificateUrl: "https://haryanarera.gov.in/view_project/view_certificate/ODQ0",
      formUrl: "https://haryanarera.gov.in/view_project/project_preview_open/1444",
    });
  });

  it("reads the portal's notes on a registration", () => {
    expect(byRegno(gurugram, "GGM/486/218/2021/54")).toMatchObject({ lapsed: true, detailId: "1634" });
    expect(byRegno(gurugram, "GGM/602/334/2022/77").supersededBy).toBe("GGM/790/522/2024/17");
    expect(byRegno(gurugram, "GGM/697/429/2023/41")).toMatchObject({ suspended: true, qprStatus: "not_uploaded" });
    expect(gurugram.filter((r) => r.lapsed).length).toBeGreaterThan(150);
  });

  it("keeps rows that have no detail page or project id", () => {
    const old = byRegno(gurugram, "119 OF 2017");
    expect(old).toMatchObject({ detailId: null, projectId: null, registeredWith: "INTERIM RERA" });
  });

  it("reads Panchkula numbers, which carry no registration date", () => {
    const pk = panchkula.find((r) => r.regno.startsWith("HRERA-PKL-")) as HrListRow;
    expect(pk.registeredOn).toBeNull();
    expect(panchkula[0]).toMatchObject({ regno: "211 OF 2017", district: "AMBALA", registeredOn: "2017-09-18" });
  });

  it("is unreadable when the project table's columns change", () => {
    const changed = html("gurugram-list.html.gz").replace(">Registration Up-to</th>", ">Valid Till</th>");
    const r = parseList(changed);
    expect(r).toMatchObject({ ok: false });
    if (!r.ok) expect(r.unreadable).toMatch(/unknown list layout/);
  });

  it("is unreadable when a row does not fit the columns", () => {
    const page = html("gurugram-list.html.gz");
    const at = page.indexOf("<td>1082</td>");
    const broken = page.slice(0, at) + "<td>1082</td><td>extra</td>" + page.slice(at + "<td>1082</td>".length);
    const r = parseList(broken);
    expect(r).toMatchObject({ ok: false });
    if (!r.ok) expect(r.unreadable).toMatch(/unknown row layout/);
  });

  it("is unreadable on a CAPTCHA, a maintenance page and an empty page", () => {
    const captcha = parseList("<html><body><form><img src='/captcha.png'><input name='code'></form></body></html>");
    expect(captcha).toEqual({ ok: false, unreadable: "page asks for a CAPTCHA; we do not solve CAPTCHAs" });
    expect(parseList("<html><body>Site under maintenance</body></html>")).toEqual({
      ok: false,
      unreadable: "portal shows a maintenance page",
    });
    expect(parseList("  ")).toEqual({ ok: false, unreadable: "empty page" });
  });

  it("does not take the home page for a list", () => {
    expect(pageProblem(html("home.html"))).toBeNull();
    expect(parseList(html("home.html")).ok).toBe(false);
  });
});

describe("parseDetail", () => {
  const url = detailUrl("1129");
  it("reads the detail fixture into a project record", () => {
    const r = parseDetail(html("detail-1129.html"), url);
    if (!r.ok) throw new Error(r.unreadable);
    expect(r.value.record).toEqual({
      state: "hr",
      regno: "277 OF 2017",
      name: "Brahma City- J Block",
      promoter: "Brahma City Private Limited",
      district: "GURUGRAM",
      locality: "Sector 63 Gurugram",
      status: "under_construction",
      sourceUrl: url,
      facts: {
        projectId: "RERA-GRG-513-2019",
        tehsil: "Wazirabad ST",
        registeredOn: "2017-10-09",
        receivedOn: "2019-12-31",
        submittedOn: "2019-12-27",
        portalStatus: "Extension Certificate Uploaded",
        supersededBy: null,
        formUrl: "https://haryanarera.gov.in/view_project/project_preview_open/1129",
        certificateUrl: "https://haryanarera.gov.in/view_project/view_certificate/MzQz",
      },
    });
    expect(r.value.hearings).toEqual([]);
  });

  it("reads hearing rows", () => {
    const withHearing = html("detail-1129.html").replace(
      /(<th align="center">Order<\/th>[\s\S]*?<tbody>)/,
      `$1<tr><td>05-Mar-2026</td><td>Arguments heard</td><td>Disposed</td><td><a href="https://haryanarera.gov.in/x/order.pdf">View</a></td></tr>`,
    );
    const r = parseDetail(withHearing, url);
    if (!r.ok) throw new Error(r.unreadable);
    expect(r.value.hearings).toEqual([
      { date: "2026-03-05", proceedings: "Arguments heard", status: "Disposed", orderUrl: "https://haryanarera.gov.in/x/order.pdf" },
    ]);
  });

  it("is unreadable when a table changes", () => {
    const page = html("detail-1129.html");
    for (const [from, to, why] of [
      ["Project Tehsil", "Tehsil", /location table/],
      ["Receiving Date", "Received", /detail table/],
      ["Proceedings of the day", "Proceedings", /hearing table/],
    ] as const) {
      const r = parseDetail(page.replace(from, to), url);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.unreadable).toMatch(why);
    }
    const shortRow = page.replace("<td>Wazirabad ST</td>", "");
    expect(parseDetail(shortRow, url)).toMatchObject({ ok: false });
    const badHearing = page.replace(
      /(<th align="center">Order<\/th>[\s\S]*?<tbody>)/,
      "$1<tr><td>05-Mar-2026</td></tr>",
    );
    expect(parseDetail(badHearing, url)).toMatchObject({ ok: false });
    const noRegno = page.replace("277 OF 2017 DATED 09.10.2017", " ");
    expect(parseDetail(noRegno, url)).toEqual({ ok: false, unreadable: "detail page has no registration number" });
    expect(parseDetail("<html><body>captcha</body></html>", url).ok).toBe(false);
  });
});

describe("registration cell and dates", () => {
  it("splits the number from the portal's notes", () => {
    expect(parseRegistrationCell("GGM/602/334/2022/77 DATED 17.08.2022 (SUPERSEDED BY GGM/790/522/2024/17 DATED 01.03.2024)")).toEqual({
      regno: "GGM/602/334/2022/77",
      registeredOn: "2022-08-17",
      lapsed: false,
      suspended: false,
      inAbeyance: false,
      supersededBy: "GGM/790/522/2024/17",
      supersedes: null,
    });
    expect(parseRegistrationCell("GGM/832/564/2024/59 DATED 03.06.2024 (SUPERSEDES GGM/661/393/2023/05 DATED 12.01.2023)").supersedes).toBe(
      "GGM/661/393/2023/05",
    );
    expect(parseRegistrationCell("HRERA-PKL-SNP-123-2019 Lapsed Project")).toMatchObject({ regno: "HRERA-PKL-SNP-123-2019", lapsed: true, registeredOn: null });
    expect(parseRegistrationCell("12 OF 2018 DATED 01.02.2018 (IN ABEYANCE)").inAbeyance).toBe(true);
    expect(parseRegistrationCell("GGM/1/2/2020/3 DATED-04.05.2020").registeredOn).toBe("2020-05-04");
  });

  it("reads the portal's date formats and rejects impossible dates", () => {
    expect(parseDate("31/12/2026")).toBe("2026-12-31");
    expect(parseDate("9.1.2017")).toBe("2017-01-09");
    expect(parseDate("31-Dec-2019")).toBe("2019-12-31");
    expect(parseDate("31/02/2026")).toBeNull();
    expect(parseDate("31-Foo-2019")).toBeNull();
    expect(parseDate("soon")).toBeNull();
  });
});

describe("from list row to grader input", () => {
  const rules: RuleTable = JSON.parse(readFileSync(new URL("../../rules/v1.json", import.meta.url), "utf8"));
  const listUrl = "https://haryanarera.gov.in/admincontrol/registered_projects/2";

  it("builds the project record and the registration filing", () => {
    const row = byRegno(gurugram, "GGM/486/218/2021/54");
    expect(recordFromRow(row, listUrl)).toMatchObject({ regno: row.regno, status: "lapsed", sourceUrl: detailUrl("1634") });
    expect(registrationFiling(row, listUrl, "2026-10-13")).toMatchObject({
      type: "registration",
      date: "2021-09-21",
      sourceUrl: listUrl,
      payload: { status: "lapsed", dateIsReadDate: false },
    });
    const old = byRegno(gurugram, "119 OF 2017");
    expect(recordFromRow(old, listUrl)).toMatchObject({ status: "under_construction", sourceUrl: listUrl });
    expect(registrationFiling(byRegno(gurugram, "GGM/697/429/2023/41"), listUrl, "2026-10-13")?.payload.status).toBe("suspended");
    expect(registrationFiling({ ...old, validUntil: null }, listUrl, "2026-10-13")).toBeNull();
    const pk = panchkula.find((r) => r.registeredOn === null) as HrListRow;
    expect(registrationFiling(pk, listUrl, "2026-10-13")).toMatchObject({ date: "2026-10-13", payload: { dateIsReadDate: true } });
  });

  it("the grader accepts it and withholds a grade when only the registration was read", () => {
    const filing = registrationFiling(gurugram[0], listUrl, "2026-10-13");
    const g = grade(rules, filing ? [filing] : [], new Date("2026-10-13"));
    expect(g.letter).toBeNull();
    expect(g.clean).toContain("registration");
  });
});
