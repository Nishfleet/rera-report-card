import { describe, expect, it } from "vitest";
import { handle } from "../../src/site/worker";
import { CONFIRM_TTL_SEC } from "../../src/site/follow";
import { readFileSync } from "node:fs";
import { makeRasterizer } from "../../src/site/png";
import { env, memoryD1, sampleFilings, seed, SAMPLE } from "./helpers";

const ORIGIN = "https://example.test";
const PAGE = `${ORIGIN}/p/hr/${SAMPLE.slug}`;
const T0 = 1791900000;

const rasterizer = makeRasterizer({
  wasm: readFileSync("node_modules/@resvg/resvg-wasm/index_bg.wasm"),
  fonts: ["400Regular/Inter_400Regular", "700Bold/Inter_700Bold"].map((f) => readFileSync(`node_modules/@expo-google-fonts/inter/${f}.ttf`)),
});

function setup(filings = sampleFilings()) {
  const e = env();
  seed(e.DB, filings);
  let now = T0;
  const call = (path: string, init?: RequestInit & { ip?: string }) =>
    handle(new Request(`${ORIGIN}${path}`, { ...init, headers: { "cf-connecting-ip": init?.ip ?? "203.0.113.7", ...(init?.headers ?? {}) } }), e, () => now, rasterizer);
  const post = (path: string, fields: Record<string, string>, ip?: string) =>
    call(path, {
      method: "POST",
      body: new URLSearchParams(fields).toString(),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      ip,
    });
  return { e, call, post, tick: (sec: number) => (now += sec) };
}

const text = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

describe("project page", () => {
  it("renders the letter, reasons with sources and the checked list", async () => {
    const { call } = setup();
    const res = await call(`/p/hr/${SAMPLE.slug}`);
    expect(res.status).toBe(200);
    const html = await res.text();
    const t = text(html);
    expect(t).toContain("Example Heights, Phase 2");
    expect(t).toContain("Haryana RERA GGM/000/000/2099/00");
    expect(html).toContain('aria-label="Grade C on a scale from E to A"');
    expect(t).toContain("Mixed record");
    expect(t).toContain("Why it is a C");
    // Largest reason first, each with its source link and impact.
    expect(t.indexOf("Completion date moved")).toBeLessThan(t.indexOf("Quarterly report not filed"));
    expect(html).toContain('href="https://example.test/sample/cd1"');
    expect(t).toContain("High impact");
    expect(t).toContain("Checked, no effect on the grade");
    expect(t).toContain("Registration not lapsed and not revoked");
    expect(t).toContain("Read from Haryana RERA on 13 Oct 2026, 11:50 IST.");
    expect(t).toContain("It is not legal, financial or investment advice");
    expect(html).toContain(`<link rel="canonical" href="${PAGE}">`);
    expect(html).toContain('property="og:title" content="Example Heights, Phase 2: RERA grade C | RERA Report Card"');
    expect(html).not.toContain('content="noindex"');
  });

  it("sends a strict content security policy with a per-response nonce", async () => {
    const { call } = setup();
    const res = await call(`/p/hr/${SAMPLE.slug}`);
    const csp = res.headers.get("content-security-policy") ?? "";
    const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
    expect(nonce).toBeTruthy();
    expect(csp).toContain("default-src 'none'");
    const html = await res.text();
    for (const tag of html.match(/<(script|style)\b[^>]*>/g) ?? []) expect(tag).toContain(`nonce="${nonce}"`);
  });

  it("uses none of the banned words (PLAN.md section 9)", async () => {
    const { call } = setup();
    const t = text(await (await call(`/p/hr/${SAMPLE.slug}`)).text()).toLowerCase();
    for (const w of ["scam", "fraud", "cheat", "unsafe", "risky", "avoid", "blacklist", "defaulter", "bad builder", "good builder", "illegal", "you should", "we recommend"]) {
      expect(t).not.toContain(w);
    }
    expect(t).not.toMatch(/[;—]/);
  });

  it("withholds the letter and asks search engines not to index when too few inputs were read", async () => {
    const { call } = setup(sampleFilings().filter((f) => f.type === "registration"));
    const html = await (await call(`/p/hr/${SAMPLE.slug}`)).text();
    expect(html).toContain('aria-label="Grade not available yet"');
    expect(text(html)).toContain("We could read 1 of the 6 inputs a grade uses");
    expect(text(html)).toContain("We could not read");
    expect(html).toContain('content="noindex"');
  });

  it("escapes what the portal wrote", async () => {
    const e = env();
    seed(e.DB);
    e.DB.raw.prepare("UPDATE project SET name = ?").run(`<img src=x onerror=alert(1)> "Heights"`);
    const html = await (await handle(new Request(PAGE), e, () => T0)).text();
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt; &quot;Heights&quot;");
  });

  it("answers 404 for an unknown project", async () => {
    const { call } = setup();
    expect((await call("/p/hr/nope")).status).toBe(404);
    expect((await call("/nowhere")).status).toBe(404);
  });

  it("serves the preview card and the rule table", async () => {
    const { call } = setup();
    const card = await call(`/og/hr/${SAMPLE.slug}.svg`);
    expect(card.headers.get("content-type")).toContain("image/svg+xml");
    const svg = await card.text();
    expect(svg).toContain("Example Heights, Phase 2");
    expect(svg).toContain(">C</text>");
    expect((await call("/og/hr/nope.svg")).status).toBe(404);
    const rules = await (await call("/rules/v1")).json();
    expect(rules.version).toBe("v1");
    expect((await call("/rules/v9")).status).toBe(404);
  });

  it("serves the preview card as a 1200 x 630 PNG that crawlers can read, and points og:image at it", async () => {
    const { call } = setup();
    const card = await call(`/og/hr/${SAMPLE.slug}.png`);
    expect(card.headers.get("content-type")).toBe("image/png");
    const png = Buffer.from(await card.arrayBuffer());
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    expect((await call("/og/hr/nope.png")).status).toBe(404);
    const html = await (await call(`/p/hr/${SAMPLE.slug}`)).text();
    expect(html).toContain(`property="og:image" content="${ORIGIN}/og/hr/${SAMPLE.slug}.png"`);
  });

  it("links a WhatsApp share with one line naming the grade and the top reason", async () => {
    const { call } = setup();
    const html = await (await call(`/p/hr/${SAMPLE.slug}`)).text();
    const href = /href="(https:\/\/wa\.me\/\?text=[^"]+)"/.exec(html)?.[1] ?? "";
    const msg = decodeURIComponent(href.replace(/&amp;/g, "&").split("text=")[1]);
    expect(msg).toBe(`Example Heights, Phase 2: grade C. Completion date moved, 10 Jan 2026. ${PAGE}?s=wa`);
  });
});

describe("follow by email", () => {
  const follow = (s: ReturnType<typeof setup>, email = "Buyer@Example.com", ip?: string) =>
    s.post("/api/follow", { email, state: "hr", slug: SAMPLE.slug }, ip);
  const confirmLink = (s: ReturnType<typeof setup>) => {
    const m = s.e.EMAIL.sent.at(-1);
    return /\/follow\/confirm\?t=([A-Za-z0-9_-]+)/.exec(m?.text ?? "")?.[1] ?? "";
  };
  const followState = (s: ReturnType<typeof setup>) =>
    (s.e.DB.raw.prepare("SELECT state FROM follow").get() as { state: string } | undefined)?.state;

  it("sends one confirmation email and stores nothing active until the button is pressed", async () => {
    const s = setup();
    const res = await follow(s);
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`/p/hr/${SAMPLE.slug}?f=sent`);
    expect(s.e.EMAIL.sent).toHaveLength(1);
    const mail = s.e.EMAIL.sent[0];
    expect(mail.to).toBe("buyer@example.com");
    expect(mail.subject).toBe("Confirm: follow Example Heights, Phase 2");
    expect(followState(s)).toBe("pending");

    // The address is stored encrypted, never in plain text.
    const row = s.e.DB.raw.prepare("SELECT * FROM follower").get() as Record<string, string>;
    expect(JSON.stringify(row)).not.toContain("buyer@example.com");

    const token = confirmLink(s);
    const page = await s.call(`/follow/confirm?t=${token}`);
    expect(text(await page.text())).toContain("Confirm and follow");
    expect(followState(s)).toBe("pending"); // opening the link alone does nothing

    const done = await s.post("/follow/confirm", { t: token });
    expect(text(await done.text())).toContain("You follow this project");
    expect(followState(s)).toBe("active");

    const again = await s.post("/follow/confirm", { t: token });
    expect(again.status).toBe(400);
  });

  it("shows the sent state on the page", async () => {
    const s = setup();
    const html = await (await s.call(`/p/hr/${SAMPLE.slug}?f=sent`)).text();
    expect(text(html)).toContain("Check your email to confirm.");
    expect(html).toContain('<details class="follow" open>');
  });

  it("expires a confirmation link after 7 days", async () => {
    const s = setup();
    await follow(s);
    s.tick(CONFIRM_TTL_SEC + 1);
    const res = await s.post("/follow/confirm", { t: confirmLink(s) });
    expect(res.status).toBe(410);
    expect(text(await res.text())).toContain("This link has expired");
  });

  it("answers the same for an address that already follows, and sends nothing", async () => {
    const s = setup();
    await follow(s);
    await s.post("/follow/confirm", { t: confirmLink(s) });
    const res = await follow(s, "buyer@example.com");
    expect(res.headers.get("location")).toContain("f=sent");
    expect(s.e.EMAIL.sent).toHaveLength(1);
  });

  it("rejects a bad address, ignores the honeypot and limits requests per connection", async () => {
    const s = setup();
    expect((await follow(s, "not-an-email")).headers.get("location")).toContain("f=invalid");
    const bot = await s.post("/api/follow", { email: "bot@example.com", state: "hr", slug: SAMPLE.slug, website: "x" });
    expect(bot.headers.get("location")).toContain("f=sent");
    expect(s.e.EMAIL.sent).toHaveLength(0);
    for (let i = 0; i < 5; i++) await follow(s, `p${i}@example.com`, "198.51.100.1");
    expect((await follow(s, "p6@example.com", "198.51.100.1")).headers.get("location")).toContain("f=limited");
    expect((await s.post("/api/follow", { email: "a@example.com", state: "hr", slug: "nope" })).status).toBe(404);
  });

  it("sends at most 3 confirmation emails a day to one address", async () => {
    const s = setup();
    for (let i = 0; i < 5; i++) await follow(s, "buyer@example.com", `192.0.2.${i}`);
    expect(s.e.EMAIL.sent).toHaveLength(3);
  });

  it("still answers sent when the mail service fails, and logs the failure", async () => {
    const s = setup();
    s.e.EMAIL.fail = true;
    expect((await follow(s)).headers.get("location")).toContain("f=sent");
    expect(s.e.DB.raw.prepare("SELECT status FROM email_send").get()).toEqual({ status: "failed" });
  });

  it("manages follows from the signed link: unfollow one, then delete the address", async () => {
    const s = setup();
    await follow(s);
    await s.post("/follow/confirm", { t: confirmLink(s) });
    const manage = /\/follows\/([A-Za-z0-9_.-]+)/.exec(s.e.EMAIL.sent[0].text)?.[1] ?? "";
    const page = await (await s.call(`/follows/${manage}`)).text();
    expect(text(page)).toContain("Example Heights, Phase 2");
    const followId = /name="f" value="([^"]+)"/.exec(page)?.[1] ?? "";

    expect((await s.post("/follows/unfollow", { t: manage, f: followId })).status).toBe(303);
    expect(followState(s)).toBe("unfollowed");
    expect(text(await (await s.call(`/follows/${manage}`)).text())).toContain("You do not follow any project");

    expect((await s.call("/follows/forged.token")).status).toBe(400);
    expect((await s.post("/follows/delete", { t: "forged.token" })).status).toBe(400);
    const del = await s.post("/follows/delete", { t: manage });
    expect(text(await del.text())).toContain("Your email is deleted");
    expect(s.e.DB.raw.prepare("SELECT COUNT(*) AS n FROM follower").get()).toEqual({ n: 0 });
  });

  it("unfollows in one click from an email link, and a GET only shows the button", async () => {
    const s = setup();
    await follow(s);
    await s.post("/follow/confirm", { t: confirmLink(s) });
    const { unfollowUrl } = await import("../../src/site/follow");
    const followId = (s.e.DB.raw.prepare("SELECT id FROM follow").get() as { id: string }).id;
    const url = await unfollowUrl({ db: s.e.DB, mailer: s.e.EMAIL, secret: s.e.SECRET, from: "", origin: ORIGIN, now: () => T0 }, followId);
    const path = url.slice(ORIGIN.length);
    expect(text(await (await s.call(path)).text())).toContain("Unfollow");
    expect(followState(s)).toBe("active");
    const res = await s.post(path, { "List-Unsubscribe": "One-Click" });
    expect(text(await res.text())).toContain("You no longer follow this project");
    expect(followState(s)).toBe("unfollowed");
    expect((await s.post("/u/bad.token", {})).status).toBe(400);
  });
});

describe("store helpers", () => {
  it("slugs registration numbers for URLs", async () => {
    const { slugOf } = await import("../../src/site/store");
    expect(slugOf("GGM/415/147/2020/31")).toBe("ggm-415-147-2020-31");
    expect(slugOf("277 OF 2017")).toBe("277-of-2017");
    expect(slugOf("HRERA-PKL-SNP-123-2019")).toBe("hrera-pkl-snp-123-2019");
  });

  it("runs the schema twice without error", () => {
    expect(() => memoryD1()).not.toThrow();
  });
});
