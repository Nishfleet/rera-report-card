import { readFileSync, readdirSync } from "node:fs";
import { expect, it } from "vitest";

const read = (url: URL) => JSON.parse(readFileSync(url, "utf8"));
const rulesDir = new URL("../rules/", import.meta.url);
const replayDir = new URL("../fixtures/replay/", import.meta.url);

it("every rule in every rule table moves the grade of at least one replay fixture", () => {
  const fired = new Set(
    readdirSync(replayDir)
      .filter((f) => f.endsWith(".json"))
      .flatMap((f) => {
        const { stored } = read(new URL(f, replayDir));
        return stored.reasons.map((r: { ruleId: string }) => `${stored.rulesVersion}/${r.ruleId}`);
      }),
  );
  const rules = readdirSync(rulesDir)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => {
      const table = read(new URL(f, rulesDir));
      return table.rules.map((r: { id: string }) => `${table.version}/${r.id}`);
    });
  expect(rules.filter((id) => !fired.has(id)), "add a fixture under fixtures/replay/ that this rule changes").toEqual([]);
});
