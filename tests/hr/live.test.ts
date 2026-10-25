import { describe, expect, it } from "vitest";
import { HaryanaFetcher, LIVE_ATTEMPTS, LIVE_RETRY_DELAY_MS, LIVE_TIMEOUT_MS } from "../../src/states/hr/fetcher";
import { detailUrl, parseDetail } from "../../src/states/hr/parse";

describe.skipIf(!process.env.LIVE_FETCH)("live Haryana fetch", () => {
  it("reads the Gurugram list and one detail page", async () => {
    const f = new HaryanaFetcher({ attempts: LIVE_ATTEMPTS, retryDelayMs: LIVE_RETRY_DELAY_MS, timeoutMs: LIVE_TIMEOUT_MS });
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
