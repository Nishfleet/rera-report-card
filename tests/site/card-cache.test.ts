import { describe, expect, it } from "vitest";
import { cardCacheKey, isCacheableCard } from "../../src/site/card-cache";

describe("card cache", () => {
  it("keys a PNG card by origin and path, ignoring the query string", () => {
    const a = cardCacheKey(new Request("https://example.test/og/hr/some-project.png?r=1"));
    const b = cardCacheKey(new Request("https://example.test/og/hr/some-project.png?r=2"));
    expect(a?.url).toBe("https://example.test/og/hr/some-project.png");
    expect(b?.url).toBe(a?.url);
  });

  it("does not key anything that is not a GET for a PNG card", () => {
    expect(cardCacheKey(new Request("https://example.test/og/hr/some-project.svg"))).toBeNull();
    expect(cardCacheKey(new Request("https://example.test/p/hr/some-project"))).toBeNull();
    expect(cardCacheKey(new Request("https://example.test/og/hr/some-project.png", { method: "POST", body: "x" }))).toBeNull();
  });

  it("stores only a 200 PNG, never the SVG fallback or an error", () => {
    expect(isCacheableCard(new Response("x", { headers: { "content-type": "image/png" } }))).toBe(true);
    expect(isCacheableCard(new Response("x", { headers: { "content-type": "image/svg+xml; charset=utf-8" } }))).toBe(false);
    expect(isCacheableCard(new Response("x", { status: 404, headers: { "content-type": "image/png" } }))).toBe(false);
  });
});
