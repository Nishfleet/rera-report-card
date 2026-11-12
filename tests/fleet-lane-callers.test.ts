import { readFileSync, readdirSync } from "node:fs";

import { expect, it } from "vitest";

const workflows = new URL("../.github/workflows/", import.meta.url);

// upstream: workflow_call secrets of Nishfleet/fleet-ops/.github/workflows, read 2026-11-09; a caller that forgets one still runs and reads "" with no error (#88 hit it twice on review.yml, #91 once on agent.yml)
const REQUIRED_SECRETS: Record<string, string[]> = {
  "agent.yml": ["APP_PRIVATE_KEY"],
  "answer.yml": [],
  "review.yml": ["APPROVER_TOKEN"],
};

const callers = readdirSync(workflows)
  .filter((f) => f.endsWith(".yml"))
  .map((file) => ({ file, text: readFileSync(new URL(file, workflows), "utf8") }))
  .filter(({ text }) => text.includes("Nishfleet/fleet-ops/.github/workflows/"));

const calleesOf = (text: string) =>
  [...text.matchAll(/uses: Nishfleet\/fleet-ops\/\.github\/workflows\/([a-z-]+\.yml)@/g)].map((m) => m[1]);

const secretsPassed = (text: string) =>
  [...text.matchAll(/^ {6}([A-Z_]+): \$\{\{ secrets\.[A-Z_]+ \}\}$/gm)].map((m) => m[1]);

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

it("each caller passes exactly the secrets its fleet-ops callee declares", () => {
  for (const { file, text } of callers) {
    for (const callee of calleesOf(text)) {
      expect(Object.keys(REQUIRED_SECRETS), `${file} calls ${callee}, unknown to this test`).toContain(callee);
      const required = REQUIRED_SECRETS[callee];
      const passed = secretsPassed(text);
      expect(passed.filter((s) => !required.includes(s)), `${file} passes a secret ${callee} does not declare, which fails the run`).toEqual([]);
      expect(required.filter((s) => !passed.includes(s)), `${file} drops a secret ${callee} requires, which reads "" silently`).toEqual([]);
    }
  }
});
