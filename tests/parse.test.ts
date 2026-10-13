import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { parseDetail, parseList, PARSER_VERSION } from "../src/hr/parse.js";

const dir = new URL("./fixtures/hr/", import.meta.url);
const raw = (name: string): Buffer => readFileSync(new URL(name, dir));
const text = (name: string): string => (name.endsWith(".gz") ? gunzipSync(raw(name)) : raw(name)).toString("utf8");
const meta = (name: string) => JSON.parse(raw(name).toString("utf8")) as { url: string; sha256: string };

describe("fixtures", () => {
  for (const [file, metaFile] of [
    ["gurugram-list.html.gz", "gurugram-list.meta.json"],
    ["panchkula-list.html.gz", "panchkula-list.meta.json"],
    ["detail-1129.html", "detail-1129.meta.json"],
  ]) {
    it(`${file} matches its recorded sha256`, () => {
      expect(createHash("sha256").update(text(file)).digest("hex")).toBe(meta(metaFile).sha256);
    });
  }
});

describe("parseList", () => {
  for (const [file, metaFile, count, prefix] of [
    ["gurugram-list.html.gz", "gurugram-list.meta.json", 1082, /^RERA-GRG-/],
    ["panchkula-list.html.gz", "panchkula-list.meta.json", 1109, /^RERA-PKL-/],
  ] as const) {
    it(`reads every row of ${file}`, () => {
      const res = parseList(text(file), meta(metaFile).url);
      if (!res.ok) throw new Error(res.reason);
      const { rows, skipped } = res.value;
      expect(rows.length + skipped.length).toBe(count);
      expect(rows.length).toBeGreaterThan(count - 60);
      expect(rows.every((r) => prefix.test(r.regno))).toBe(true);
      expect(new Set(rows.map((r) => r.regno)).size).toBe(rows.length);
      expect(skipped.every((s) => s.reason.length > 0)).toBe(true);
      for (const r of rows) {
        expect(r.record.project.name).not.toBe("");
        expect(r.record.filings).toHaveLength(1);
        expect(r.record.filings[0].parserVersion).toBe(PARSER_VERSION);
        expect(r.record.filings[0].sourceUrl).toBe(r.detailUrl);
      }
    });
  }

  it("turns a Gurugram row into a project and a registration filing", () => {
    const res = parseList(text("gurugram-list.html.gz"), meta("gurugram-list.meta.json").url);
    if (!res.ok) throw new Error(res.reason);
    const row = res.value.rows[0];
    expect(row.record.project).toEqual({
      state: "hr",
      regno: "RERA-GRG-741-2020",
      name: "102 EDEN ESTATE",
      promoter: "COUNTRYWIDE PROMOTERS PRIVATE LIMITED",
      district: "GURUGRAM",
      locality: "SECTOR 102 & 102 A GURUGRAM",
      status: "registered",
      statusText: null,
    });
    expect(row.detailUrl).toBe("https://haryanarera.gov.in/view_project/searchprojectDetail/1444");
    expect(row.record.filings[0]).toMatchObject({
      type: "registration",
      effectiveDate: Date.UTC(2020, 9, 9) / 1000,
      payload: { certificate: "GGM/415/147/2020/31 DATED 09.10.2020", registeredWith: "HRERA", validUpTo: "30/04/2024" },
    });
  });

  it("marks a lapsed project", () => {
    const res = parseList(text("gurugram-list.html.gz"), meta("gurugram-list.meta.json").url);
    if (!res.ok) throw new Error(res.reason);
    const lapsed = res.value.rows.find((r) => r.regno === "RERA-GRG-874-2021");
    expect(lapsed?.record.project.status).toBe("lapsed");
    expect(lapsed?.record.filings[0].payload.certificate).toBe("GGM/486/218/2021/54 DATED 21.09.2021");
  });

  it("returns unreadable on a CAPTCHA page", () => {
    const res = parseList("<html><body><img alt='captcha'><input name='captcha'></body></html>", "u");
    expect(res).toMatchObject({ ok: false, unreadable: true });
    if (!res.ok) expect(res.reason).toMatch(/^captcha/);
  });

  it("returns unreadable on an unknown layout", () => {
    const res = parseList("<html><body><table><tr><td>maintenance</td></tr></table></body></html>", "u");
    expect(res).toMatchObject({ ok: false, unreadable: true });
    if (!res.ok) expect(res.reason).toMatch(/^layout/);
  });

  it("returns unreadable when a column is missing", () => {
    const html = text("gurugram-list.html.gz").replace(/(<th[^>]*>)Builder</, "$1Owner<");
    const res = parseList(html, "u");
    expect(res).toMatchObject({ ok: false, unreadable: true });
    if (!res.ok) expect(res.reason).toBe('layout: missing column "Builder"');
  });
});

describe("parseDetail", () => {
  const url = meta("detail-1129.meta.json").url;

  it("reads the project and its registration filing", () => {
    const res = parseDetail(text("detail-1129.html"), url);
    if (!res.ok) throw new Error(res.reason);
    expect(res.value.project).toEqual({
      state: "hr",
      regno: "RERA-GRG-513-2019",
      name: "Brahma City- J Block",
      promoter: "Brahma City Private Limited",
      district: "GURUGRAM",
      locality: "Sector 63 Gurugram",
      status: "unknown",
      statusText: "Extension Certificate Uploaded",
    });
    expect(res.value.filings).toEqual([
      {
        type: "registration",
        effectiveDate: Date.UTC(2017, 9, 9) / 1000,
        payload: {
          certificate: "277 OF 2017 DATED 09.10.2017",
          receivingDate: "31-Dec-2019",
          onlineSubmissionDate: "27-Dec-2019",
          tehsil: "Wazirabad ST",
        },
        sourceUrl: url,
        parserVersion: PARSER_VERSION,
      },
    ]);
  });

  it("returns unreadable on a CAPTCHA page", () => {
    const res = parseDetail("<html><body>Enter the CAPTCHA</body></html>", url);
    expect(res).toMatchObject({ ok: false, unreadable: true });
  });

  it("returns unreadable on an unknown layout", () => {
    const res = parseDetail("<html><body>Site under maintenance</body></html>", url);
    expect(res).toMatchObject({ ok: false, unreadable: true });
    if (!res.ok) expect(res.reason).toMatch(/^layout/);
  });

  it("returns unreadable when the project id changes shape", () => {
    const html = text("detail-1129.html").replace("RERA-GRG-513-2019", "X-1");
    const res = parseDetail(html, url);
    expect(res).toMatchObject({ ok: false, unreadable: true });
  });
});
