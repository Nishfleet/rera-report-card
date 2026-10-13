import { describe, expect, it } from "vitest";
import { HaryanaFetcher } from "../../src/states/hr/fetcher";
import { detailUrl, parseDetail } from "../../src/states/hr/parse";

// Reach proof against the real portal. CI runs it with LIVE_FETCH=1 on a GitHub runner,
// which reaches haryanarera.gov.in. Skipped everywhere else.
describe.skipIf(!process.env.LIVE_FETCH)("live Haryana fetch", () => {
  it("reads the Gurugram list and one detail page", async () => {
    const f = new HaryanaFetcher();
    const list = await f.listProjects("2");
    expect(list.refs.length).toBeGreaterThan(500);
    const ref = list.refs[0];
    const bundle = await f.fetchProject(ref);
    expect(bundle.status).toBe("ok");
    const parsed = parseDetail(new TextDecoder().decode(bundle.files[0].bytes), detailUrl(ref.fetchKey));
    if (!parsed.ok) throw new Error(parsed.unreadable);
    expect(parsed.value.record.regno).toBe(ref.regno);
  }, 180_000);
});
