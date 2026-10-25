import { describe, expect, it } from "vitest";
import { HaryanaFetcher } from "../../src/states/hr/fetcher";
import { detailUrl, parseDetail } from "../../src/states/hr/parse";

describe.skipIf(!process.env.LIVE_FETCH)("live Haryana fetch", () => {
  it("reads the Gurugram list and one detail page", async () => {
    const f = new HaryanaFetcher({ attempts: 3, retryDelayMs: 30_000, timeoutMs: 15_000 });
    const list = await f.listProjects("2");
    expect(list.refs.length).toBeGreaterThan(500);
    const ref = list.refs[0];
    const bundle = await f.fetchProject(ref);
    expect(bundle.status).toBe("ok");
    const parsed = parseDetail(new TextDecoder().decode(bundle.files[0].bytes), detailUrl(ref.fetchKey));
    if (!parsed.ok) throw new Error(parsed.unreadable);
    expect(parsed.value.record.regno).toBe(ref.regno);
  }, 300_000);
});
