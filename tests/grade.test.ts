import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { grade, renderableReasons, type Filing, type RuleTable } from "../src/grade";

const v1: RuleTable = JSON.parse(readFileSync(new URL("../rules/v1.json", import.meta.url), "utf8"));
const ASOF = new Date("2026-10-13");
const url = (id: string) => `https://example.test/t/${id}`;

function f(id: string, type: string, date: string, payload: Record<string, unknown> = {}): Filing {
  return { id, type, date, sourceUrl: url(id), payload };
}
const reg = (status = "active", validUntil = "2028-01-01") =>
  f("reg", "registration", "2021-01-01", { status, validUntil });
const qpr = (id: string, date: string, deadline: string, filedOn: string | null, noticeIssued = false) =>
  f(id, "qpr", date, { deadline, filedOn, noticeIssued });
const cd = (original: string, current: string) =>
  f("cd", "completion_date", "2021-01-01", { originalDate: original, currentDate: current });
const checked = (id: string, input: string) => f(id, "checked", "2026-10-01", { input });
const prog = (id: string, date: string, percent: number) => f(id, "progress", date, { percent });

const base = (): Filing[] => [
  reg(),
  qpr("q", "2026-07-20", "2026-07-31", "2026-07-20"),
  cd("2027-06-30", "2027-06-30"),
  prog("p1", "2026-01-20", 40),
  prog("p2", "2026-07-20", 50),
  checked("ck-e", "extensions"),
  checked("ck-c", "complaints_orders"),
];
const ids = (filings: Filing[], table = v1, asOf = ASOF) =>
  grade(table, filings, asOf).reasons.map((r) => r.ruleId);
const pointsOf = (filings: Filing[]) => grade(v1, filings, ASOF).points;

describe("determinism and versions", () => {
  it("gives the same bytes for the same input, whatever the filing order", () => {
    const a = JSON.stringify(grade(v1, base(), ASOF));
    const b = JSON.stringify(grade(v1, base().reverse(), ASOF));
    expect(a).toBe(b);
    expect(a).toBe(JSON.stringify(grade(v1, base(), ASOF)));
  });

  it("orders filings with equal dates by id", () => {
    const filings = [
      f("b", "extension", "2026-01-01"),
      f("a", "extension", "2026-01-01"),
      f("a", "extension", "2026-01-01"),
    ];
    expect(grade(v1, filings, ASOF).reasons.map((r) => r.filingId)).toEqual(["b", "a"]);
  });

  it("records a different table version in a different result", () => {
    const v2 = { ...v1, version: "v2", rules: v1.rules.map((r) => (r.id === "R8" ? { ...r, points: 5, cap: 10 } : r)) };
    const filings = [...base(), f("e", "extension", "2026-01-01")];
    const a = grade(v1, filings, ASOF);
    const b = grade(v2, filings, ASOF);
    expect([a.rulesVersion, a.points]).toEqual(["v1", 97]);
    expect([b.rulesVersion, b.points]).toEqual(["v2", 95]);
  });

  it("ignores filings dated after asOf", () => {
    const filings = [...base(), f("e", "extension", "2026-11-01")];
    expect(pointsOf(filings)).toBe(100);
  });

  it("rejects a rule kind it does not know", () => {
    const bad = { ...v1, rules: [{ ...v1.rules[0], id: "RX", kind: "nope" }] };
    expect(() => grade(bad, base(), ASOF)).toThrow("unknown rule kind nope in RX");
  });
});

describe("bands and impact", () => {
  it("grades 100 as A with every input clean", () => {
    const g = grade(v1, base(), ASOF);
    expect([g.letter, g.points, g.reasons, g.unread]).toEqual(["A", 100, [], []]);
    expect(g.clean).toEqual(["qpr", "registration", "extensions", "completion_date", "complaints_orders", "progress"]);
  });

  it("maps points to letters at the band edges", () => {
    const with_ = (n: number) => grade(v1, [...base(), ...Array.from({ length: n }, (_, i) => f(`e${i}`, "extension", "2026-01-01"))], ASOF);
    expect(with_(0).letter).toBe("A");
    const filings = [...base().filter((x) => x.id !== "cd"), cd("2024-01-31", "2026-06-30")];
    expect(grade(v1, filings, ASOF)).toMatchObject({ points: 78, letter: "B" });
  });

  it("labels impact High, Medium and Low by points", () => {
    const filings = [
      ...base().filter((x) => x.id !== "cd"),
      cd("2025-12-31", "2027-06-30"),
      f("o1", "order", "2026-06-01", { against: "project" }),
      f("e1", "extension", "2026-01-01"),
    ];
    const g = grade(v1, filings, ASOF);
    expect(g.reasons.map((r) => [r.ruleId, r.impact])).toEqual([
      ["R6", "High"],
      ["R8", "Low"],
      ["R12", "Medium"],
    ]);
  });
});

describe("rules", () => {
  it("R1 takes 8 per missed report in the last 4 quarters, up to 24", () => {
    const missed = (i: number, deadline: string) => qpr(`m${i}`, deadline, deadline, null);
    const four = [missed(1, "2026-04-30"), missed(2, "2026-01-31"), missed(3, "2025-10-31"), missed(4, "2025-10-14")];
    const g = grade(v1, [...base(), ...four], ASOF);
    expect(g.reasons.filter((r) => r.ruleId === "R1").map((r) => r.filingId)).toEqual(["m1", "m2", "m3"]);
    expect(g.points).toBe(76);
  });

  it("R1 ignores a missed report older than 4 quarters", () => {
    expect(ids([...base(), qpr("old", "2025-06-01", "2025-06-01", null)])).toEqual([]);
  });

  it("R2 takes 2 once, only for a missed report with a notice", () => {
    const two = [qpr("n1", "2026-05-04", "2026-04-30", null, true), qpr("n2", "2026-02-04", "2026-01-31", null, true)];
    expect(ids([...base(), ...two])).toEqual(["R1", "R1", "R2"]);
    expect(ids([...base(), qpr("n3", "2026-02-04", "2026-01-31", null, false)])).toEqual(["R1"]);
    expect(ids([...base(), qpr("n4", "2026-02-04", "2026-01-31", "2026-02-01", true)])).toEqual(["R3"]);
  });

  it("R3 takes 3 per late report, up to 9, and skips reports filed on time", () => {
    const late = ["a", "b", "c", "d"].map((x, i) => qpr(x, `2026-0${i + 1}-15`, `2026-0${i + 1}-10`, `2026-0${i + 1}-14`));
    expect(ids([...base(), ...late])).toEqual(["R3", "R3", "R3"]);
    expect(ids([...base(), qpr("ok", "2026-02-01", "2026-02-10", "2026-02-01")])).toEqual([]);
  });

  it.each([
    ["2026-01-31", "2026-01-31", []],
    ["2026-01-01", "2026-02-28", ["R4"]],
    ["2026-01-01", "2026-07-31", ["R4"]],
    ["2026-01-01", "2026-08-01", ["R5"]],
    ["2026-01-01", "2027-01-31", ["R5"]],
    ["2026-01-01", "2027-02-01", ["R6"]],
    ["2026-01-01", "2028-01-31", ["R6"]],
    ["2026-01-01", "2028-02-01", ["R7"]],
    ["2026-01-01", "2031-02-01", ["R7"]],
  ])("completion %s to %s", (original, current, expected) => {
    const filings = [...base().filter((x) => x.id !== "cd"), cd(original, current)];
    expect(ids(filings)).toEqual(expected);
  });

  it("uses the newest completion date filing", () => {
    const later = f("cd2", "completion_date", "2026-02-01", { originalDate: "2026-01-01", currentDate: "2026-03-01" });
    expect(ids([...base(), later])).toEqual(["R4"]);
  });

  it("R8 takes 3 per extension, up to 6, of any age", () => {
    const ext = ["2020-01-01", "2023-01-01", "2026-01-01"].map((d, i) => f(`e${i}`, "extension", d));
    const g = grade(v1, [...base(), ...ext], ASOF);
    expect(g.reasons.map((r) => r.filingId)).toEqual(["e2", "e1"]);
  });

  it.each([
    [1, "R9"],
    [2, "R9"],
    [3, "R10"],
    [5, "R10"],
    [6, "R11"],
    [9, "R11"],
  ])("%i complaints give %s", (count, rule) => {
    const complaints = Array.from({ length: count }, (_, i) => f(`c${i}`, "complaint", `2026-0${(i % 9) + 1}-01`));
    const g = grade(v1, [...base(), ...complaints], ASOF);
    expect(g.reasons.map((r) => r.ruleId)).toEqual([rule]);
    expect(g.reasons[0].filingId).toBe(complaints.sort((a, b) => (a.date < b.date ? 1 : -1))[0].id);
  });

  it("R9 to R11 count only the last 24 months", () => {
    expect(ids([...base(), f("c", "complaint", "2024-10-12")])).toEqual([]);
    expect(ids([...base(), f("c", "complaint", "2024-10-13")])).toEqual(["R9"]);
  });

  it("R12 takes 6 per order, up to 18, and labels promoter orders", () => {
    const orders = ["project", "promoter", "project", "project"].map((a, i) => f(`o${i}`, "order", `2026-0${i + 1}-01`, { against: a }));
    const g = grade(v1, [...base(), ...orders], ASOF);
    expect(g.reasons.map((r) => r.filingId)).toEqual(["o3", "o2", "o1"]);
    expect(g.reasons[2].detail).toContain("Against the promoter.");
    expect(g.reasons[0].detail).not.toContain("promoter.");
  });

  it("R13 takes 4 when percent complete did not rise between the last two reports", () => {
    const rest = base().filter((x) => !x.id.startsWith("p"));
    expect(ids([...rest, prog("p1", "2026-01-20", 55), prog("p2", "2026-07-20", 55)])).toEqual(["R13"]);
    expect(ids([...rest, prog("p1", "2026-01-20", 60), prog("p2", "2026-07-20", 55)])).toEqual(["R13"]);
    expect(ids([...rest, prog("p0", "2025-01-20", 70), prog("p1", "2026-01-20", 55), prog("p2", "2026-07-20", 61)])).toEqual([]);
  });

  it("R14 caps the grade at D and R15 forces E, even when points are high", () => {
    const rest = base().filter((x) => x.id !== "reg");
    expect(grade(v1, [...rest, reg("active", "2026-10-12")], ASOF)).toMatchObject({ letter: "D", points: 59 });
    expect(grade(v1, [...rest, reg("active", "2026-10-13")], ASOF)).toMatchObject({ letter: "A" });
    expect(ids([...rest, reg("revoked", "2026-01-01")])).toEqual(["R15"]);
    expect(grade(v1, [...rest, reg("revoked", "2030-01-01")], ASOF)).toMatchObject({ letter: "E", points: 39 });
  });

  it("R14 does not apply when an extension is on file", () => {
    const rest = base().filter((x) => x.id !== "reg");
    expect(ids([...rest, reg("active", "2026-01-01"), f("e", "extension", "2025-12-01")])).toEqual(["R8"]);
  });

  it("R14 is skipped when the extensions input is unread", () => {
    const rest = base().filter((x) => x.id !== "reg");
    const noSource = { ...f("e", "extension", "2026-01-01"), sourceUrl: "" };
    const g = grade(v1, [...rest, reg("active", "2026-01-01"), noSource], ASOF);
    expect(g.reasons).toEqual([]);
    expect(g.unread).toEqual([{ input: "extensions", reason: "filing e has no source URL" }]);
  });

  it("does not treat an inherited property name as a filing type", () => {
    expect(ids([...base(), f("k", "constructor", "2026-01-01")])).toEqual([]);
  });

  it("never goes below 0 and applies the stricter of two ceilings", () => {
    const rest = base().filter((x) => x.id !== "reg");
    const heavy = [reg("revoked", "2026-01-01"), ...Array.from({ length: 9 }, (_, i) => f(`c${i}`, "complaint", "2026-01-01"))];
    const dual = { ...v1, rules: v1.rules.map((r) => (r.id === "R9" || r.id === "R10" ? { ...r, points: 0, cap: 0 } : r.id === "R11" ? { ...r, points: 200, cap: 200, maxLetter: "C" as const } : r)) };
    const g = grade(dual, [...rest, ...heavy], ASOF);
    expect(g).toMatchObject({ letter: "E", points: 0 });
    const ceilings = grade({ ...dual, rules: dual.rules.filter((r) => r.id !== "R15") }, [...rest, reg(), ...heavy.slice(1)], ASOF);
    expect(ceilings).toMatchObject({ letter: "E", points: 0 });
  });

  it("keeps the first ceiling when a later rule is more lenient", () => {
    const rest = base().filter((x) => x.id !== "reg");
    const lenient = { ...v1, rules: [...v1.rules.filter((r) => r.id === "R15"), ...v1.rules.filter((r) => r.id === "R14")] };
    expect(grade(lenient, [...rest, reg("revoked", "2026-01-01")], ASOF).letter).toBe("E");
  });
});

describe("unread inputs and withholding", () => {
  it("lists an input with no filing as unread and skips its rules", () => {
    const g = grade(v1, base().filter((x) => x.id !== "cd"), ASOF);
    expect(g.unread).toEqual([{ input: "completion_date", reason: "no filing on record" }]);
    expect(g.letter).toBe("A");
  });

  it("lists progress with fewer than two reports as unread", () => {
    const g = grade(v1, base().filter((x) => x.id !== "p2"), ASOF);
    expect(g.unread).toEqual([{ input: "progress", reason: "fewer than two reports on record" }]);
  });

  it("does not count extensions or complaints as clean unless their source was read", () => {
    const unchecked = base().filter((x) => x.type !== "checked");
    const g = grade(v1, unchecked, ASOF);
    expect(g.unread).toEqual([
      { input: "extensions", reason: "source not read" },
      { input: "complaints_orders", reason: "source not read" },
    ]);
    const withOrder = grade(v1, [...unchecked, f("o1", "order", "2026-06-01")], ASOF);
    expect(withOrder.unread.map((u) => u.input)).toEqual(["extensions"]);
  });

  it("withholds a grade when only the registration was read", () => {
    const g = grade(v1, [reg("active", "2024-01-01")], ASOF);
    expect([g.letter, g.points, g.reasons]).toEqual([null, null, []]);
  });

  it("takes the parser's reason for an unreadable input", () => {
    const u = f("u", "unreadable", "2026-09-01", { input: "qpr", reason: "CAPTCHA page" });
    const g = grade(v1, [...base(), u, qpr("m", "2026-04-30", "2026-04-30", null)], ASOF);
    expect(g.unread).toEqual([{ input: "qpr", reason: "CAPTCHA page" }]);
    expect(g.reasons).toEqual([]);
  });

  it("does not grade a filing without a source URL and lists its input as unread", () => {
    const bad = { ...f("x", "order", "2026-06-01", { against: "project" }), sourceUrl: "" };
    const g = grade(v1, [...base(), bad], ASOF);
    expect(g.unread).toEqual([{ input: "complaints_orders", reason: "filing x has no source URL" }]);
    expect(g.reasons).toEqual([]);
  });

  it("ignores bank filings", () => {
    const bank = { ...f("b", "bank", "2026-06-01"), sourceUrl: "" };
    expect(grade(v1, [...base(), bank], ASOF).unread).toEqual([]);
  });

  const unreadable = (id: string, input: string) => f(id, "unreadable", "2026-01-01", { input, reason: "layout" });
  const twoReadable = () => [
    reg(),
    qpr("q", "2026-07-20", "2026-07-31", "2026-07-20"),
    unreadable("u1", "extensions"),
    unreadable("u2", "complaints_orders"),
  ];

  it("withholds the grade when fewer than 3 of 6 inputs are readable", () => {
    const g = grade(v1, twoReadable(), ASOF);
    expect([g.letter, g.points]).toEqual([null, null]);
    expect(g.unread.map((u) => u.input)).toEqual(["extensions", "completion_date", "complaints_orders", "progress"]);
  });

  it("grades when exactly 3 of 6 inputs are readable", () => {
    const g = grade(v1, [...twoReadable(), cd("2027-06-30", "2027-06-30")], ASOF);
    expect([g.letter, g.points]).toEqual(["A", 100]);
  });

  it("still lists reasons for a withheld grade", () => {
    const g = grade(v1, [...twoReadable().slice(2), reg("revoked", "2026-01-01")], ASOF);
    expect(g.letter).toBeNull();
    expect(g.reasons.map((r) => r.ruleId)).toEqual(["R15"]);
  });
});

describe("every reason carries its source", () => {
  it("has rule id, points, filing id, filing date and source URL on each reason", () => {
    const filings = [...base(), f("e", "extension", "2026-01-01"), f("o", "order", "2026-02-01", { against: "project" })];
    for (const r of grade(v1, filings, ASOF).reasons) {
      expect(r.ruleId).toMatch(/^R\d+$/);
      expect(typeof r.points).toBe("number");
      expect(r.filingId).not.toBe("");
      expect(r.filingDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("does not render a reason without a source URL", () => {
    const g = grade(v1, [...base(), f("e", "extension", "2026-01-01")], ASOF);
    expect(renderableReasons(g)).toHaveLength(1);
    const stripped = { ...g, reasons: [{ ...g.reasons[0], sourceUrl: "" }] };
    expect(renderableReasons(stripped)).toEqual([]);
  });
});

describe("dates", () => {
  it("clamps month ends and handles year turns in windows", () => {
    const asOf = new Date("2026-03-31");
    expect(ids([...base(), f("c", "complaint", "2024-03-31")], v1, asOf)).toContain("R9");
    expect(ids([...base(), f("c", "complaint", "2024-03-30")], v1, asOf)).not.toContain("R9");
    expect(ids([...base(), f("c", "complaint", "2023-02-28")], v1, new Date("2024-02-29"))).toContain("R9");
  });
});
