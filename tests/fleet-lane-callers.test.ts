import { readFileSync, readdirSync } from "node:fs";

import { expect, it } from "vitest";

const workflows = new URL("../.github/workflows/", import.meta.url);

const callers = readdirSync(workflows)
  .filter((f) => f.endsWith(".yml"))
  .map((file) => ({ file, text: readFileSync(new URL(file, workflows), "utf8") }))
  .filter(({ text }) => text.includes("Nishfleet/fleet-ops/.github/workflows/"));

it("every fleet-ops caller pins @main, because the agent and reviewer runner groups admit only main", () => {
  for (const { file, text } of callers) {
    for (const line of text.split("\n").filter((l) => l.includes("uses: Nishfleet/fleet-ops/"))) {
      expect(line, `${file}: ${line.trim()}`).toMatch(/\.yml@main(\s|#|$)/);
    }
  }
});

it("no caller inherits the whole secret set", () => {
  for (const { file, text } of callers) {
    expect(text, file).not.toMatch(/^ {4}secrets: inherit$/m);
  }
});

it("the agent stub names each run with its engine, which the reviewer reads to pick another family", () => {
  const agent = readFileSync(new URL("agent.yml", workflows), "utf8");
  expect(agent).toMatch(/^run-name: "agent #\$\{\{ github\.event\.issue\.number \|\| inputs\.issue \}\} engine=/m);
});
