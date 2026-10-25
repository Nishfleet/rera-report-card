import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { getPage, HaryanaFetcher, listUrl, USER_AGENT, type FetchLike } from "../../src/states/hr/fetcher";
import { detailUrl } from "../../src/states/hr/parse";

const dir = new URL("../fixtures/hr/", import.meta.url);
const page = (name: string) => {
  const b = readFileSync(new URL(name, dir));
  return name.endsWith(".gz") ? gunzipSync(b) : b;
};

function fakePortal(pages: Record<string, { status: number; body: Buffer | string } | Error>) {
  const seen: { url: string; ua?: string }[] = [];
  const fetch: FetchLike = async (url, init) => {
    seen.push({ url, ua: init?.headers?.["user-agent"] });
    const p = pages[url];
    if (p === undefined) return { status: 404, arrayBuffer: async () => new ArrayBuffer(0) };
    if (p instanceof Error) throw p;
    const buf = typeof p.body === "string" ? Buffer.from(p.body) : p.body;
    return { status: p.status, arrayBuffer: async () => new Uint8Array(buf).buffer };
  };
  return { fetch, seen };
}

const now = () => new Date("2026-10-13T00:30:00Z");

describe("HaryanaFetcher", () => {
  it("walks both offices and lists projects that have a detail page", async () => {
    const { fetch, seen } = fakePortal({
      [listUrl("1")]: { status: 200, body: page("panchkula-list.html.gz") },
      [listUrl("2")]: { status: 200, body: page("gurugram-list.html.gz") },
    });
    const f = new HaryanaFetcher({ fetch, now });
    const first = await f.listProjects(null);
    expect(first.next).toBe("2");
    expect(first.refs).toHaveLength(1109 - 15);
    const second = await f.listProjects(first.next);
    expect(second.next).toBeNull();
    expect(second.refs[0]).toEqual({ regno: "GGM/415/147/2020/31", fetchKey: "1444" });
    expect(seen.every((s) => s.ua === USER_AGENT)).toBe(true);
  });

  it("fails loudly when a list cannot be read", async () => {
    const { fetch } = fakePortal({ [listUrl("1")]: { status: 200, body: "<html><body>captcha</body></html>" } });
    await expect(new HaryanaFetcher({ fetch }).listProjects("1")).rejects.toThrow(/CAPTCHA/);
    await expect(new HaryanaFetcher({ fetch }).listProjects("2")).rejects.toThrow(/HTTP 404/);
  });

  it("returns the raw detail page without parsing it", async () => {
    const { fetch } = fakePortal({ [detailUrl("1129")]: { status: 200, body: page("detail-1129.html") } });
    const b = await new HaryanaFetcher({ fetch, now }).fetchProject({ regno: "277 OF 2017", fetchKey: "1129" });
    expect(b).toMatchObject({ state: "hr", regno: "277 OF 2017", status: "ok", fetchedAt: "2026-10-13T00:30:00.000Z" });
    expect(b.files).toHaveLength(1);
    expect(b.files[0]).toMatchObject({ kind: "html", url: detailUrl("1129"), httpStatus: 200 });
    expect(Buffer.from(b.files[0].bytes).equals(page("detail-1129.html"))).toBe(true);
  });

  it("marks a detail page unreadable on CAPTCHA, HTTP error or network failure", async () => {
    const { fetch } = fakePortal({
      [detailUrl("1")]: { status: 200, body: "<html><body><img src='captcha.jpg'></body></html>" },
      [detailUrl("2")]: { status: 503, body: "" },
      [detailUrl("3")]: new Error("timeout"),
    });
    const f = new HaryanaFetcher({ fetch, now });
    expect(await f.fetchProject({ regno: "a", fetchKey: "1" })).toMatchObject({ status: "unreadable", reason: /CAPTCHA/ });
    expect(await f.fetchProject({ regno: "b", fetchKey: "2" })).toMatchObject({ status: "unreadable", reason: "HTTP 503" });
    expect(await f.fetchProject({ regno: "c", fetchKey: "3" })).toMatchObject({
      status: "unreadable",
      reason: "fetch failed: timeout",
      files: [],
    });
  });
});

describe("getPage retries", () => {
  const ok = { status: 200, arrayBuffer: async () => new ArrayBuffer(0) };
  const flaky = (failures: number) => {
    let calls = 0;
    const fetch: FetchLike = async () => {
      calls++;
      if (calls <= failures) throw new Error("connect timeout");
      return ok;
    };
    return { fetch, calls: () => calls };
  };

  it("attempts a timed-out fetch 3 times, waiting 30 s between attempts", async () => {
    const { fetch, calls } = flaky(2);
    const waits: number[] = [];
    const sleep = async (ms: number) => void waits.push(ms);
    const res = await getPage(listUrl("1"), { fetch, attempts: 3, retryDelayMs: 30_000, sleep });
    expect(res.httpStatus).toBe(200);
    expect(calls()).toBe(3);
    expect(waits).toEqual([30_000, 30_000]);
  });

  it("still fails when all 3 attempts fail", async () => {
    const { fetch, calls } = flaky(3);
    const sleep = async () => {};
    await expect(getPage(listUrl("1"), { fetch, attempts: 3, sleep })).rejects.toThrow(/connect timeout/);
    expect(calls()).toBe(3);
  });

  it("makes one attempt by default", async () => {
    const { fetch, calls } = flaky(1);
    await expect(getPage(listUrl("1"), { fetch })).rejects.toThrow(/connect timeout/);
    expect(calls()).toBe(1);
  });

  it("passes the retry options from HaryanaFetcher to getPage", async () => {
    const { fetch, calls } = flaky(2);
    const sleep = async () => {};
    const f = new HaryanaFetcher({ fetch, attempts: 3, sleep, now });
    const b = await f.fetchProject({ regno: "277 OF 2017", fetchKey: "1129" });
    expect(calls()).toBe(3);
    expect(b.files).toHaveLength(1);
  });
});
