import { describe, expect, it } from "vitest";
import { html, raw } from "../../src/site/html";

describe("html tag", () => {
  it("escapes every interpolated string and number", () => {
    expect(html`<p title="${`"x" & 'y'`}">${"<script>alert(1)</script>"}</p>`.value).toBe(
      '<p title="&quot;x&quot; &amp; &#39;y&#39;">&lt;script&gt;alert(1)&lt;/script&gt;</p>',
    );
  });

  it("keeps nested SafeHtml and arrays of it as markup", () => {
    const items = ["a<b", "c"].map((s) => html`<li>${s}</li>`);
    expect(html`<ul>${items}</ul>`.value).toBe("<ul><li>a&lt;b</li><li>c</li></ul>");
  });

  it("renders null, undefined and false as nothing", () => {
    expect(html`${null}${undefined}${false}|${0}`.value).toBe("|0");
  });

  it("passes raw markup through unchanged", () => {
    expect(html`<style>${raw("a>b{}")}</style>`.value).toBe("<style>a>b{}</style>");
  });
});
