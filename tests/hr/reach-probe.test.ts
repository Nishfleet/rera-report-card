import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { USER_AGENT, listUrl } from "../../src/states/hr/fetcher";

const workflow = readFileSync(new URL("../../.github/workflows/ci.yml", import.meta.url), "utf8");

const envValue = (name: string): string | null => {
  const found = new RegExp(`^\\s+${name}: (.+)$`, "m").exec(workflow);
  return found ? found[1].trim() : null;
};

describe("the live reach probe in ci.yml", () => {
  it("probes the page the live proof reads first", () => {
    expect(envValue("PORTAL")).toBe(listUrl("2"));
  });

  it("probes with the browser identity the fetcher sends", () => {
    expect(envValue("UA")).toBe(USER_AGENT);
  });
});
