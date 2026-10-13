import { describe, expect, it } from "vitest";
import { detailUrl, fetchPage, LIST_URLS } from "../src/hr/fetch.js";
import { parseDetail, parseList } from "../src/hr/parse.js";

// Reach proof. Runs only with LIVE_FETCH=1, because the portal does not answer from every network.
describe.skipIf(!process.env.LIVE_FETCH)("live Haryana fetch", () => {
  it("loads a list page and one detail page and parses both", async () => {
    const list = await fetchPage(LIST_URLS.gurugram);
    const parsed = parseList(list.html, list.url);
    if (!parsed.ok) throw new Error(parsed.reason);
    expect(parsed.value.rows.length).toBeGreaterThan(0);
    const detail = await fetchPage(detailUrl(parsed.value.rows[0].detailId));
    const rec = parseDetail(detail.html, detail.url);
    if (!rec.ok) throw new Error(rec.reason);
    expect(rec.value.project.regno).toBe(parsed.value.rows[0].regno);
  }, 180_000);
});
