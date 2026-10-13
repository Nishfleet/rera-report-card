import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { grade } from "../src/grade";

const dir = new URL("../fixtures/replay/", import.meta.url);

describe("replay: stored filings grade to the stored result", () => {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const fixture = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
    it(fixture.name, () => {
      const rules = JSON.parse(
        readFileSync(new URL(`../../rules/${fixture.stored.rulesVersion}.json`, dir), "utf8"),
      );
      const result = grade(rules, fixture.filings, new Date(fixture.asOf));
      expect(JSON.stringify(result)).toBe(JSON.stringify(fixture.stored));
    });
  }
});
