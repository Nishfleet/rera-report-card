import { readFileSync, readdirSync } from "node:fs";

const dir = new URL("../.github/workflows/", import.meta.url);
const callers = readdirSync(dir)
  .filter((file) => file.endsWith(".yml"))
  .map((file) => ({ file, text: readFileSync(new URL(file, dir), "utf8") }))
  .filter(({ text }) => text.includes("Nishfleet/fleet-ops/.github/workflows/"));
const problems = [];

for (const { file, text } of callers) {
  for (const line of text.split("\n").filter((l) => l.includes("uses: Nishfleet/fleet-ops/"))) {
    if (!/\.yml@main(\s|#|$)/.test(line)) {
      problems.push(`${file}: ${line.trim()} must pin @main, the only ref the fleet runner groups admit`);
    }
  }
  if (/^ {4}secrets: inherit$/m.test(text)) {
    problems.push(`${file}: secrets: inherit passes every repository secret to the callee; name the secrets it declares`);
  }
}

const agent = readFileSync(new URL("agent.yml", dir), "utf8");
if (!/^run-name: "agent #\$\{\{ github\.event\.issue\.number \|\| inputs\.issue \}\} engine=/m.test(agent)) {
  problems.push("agent.yml: run-name must carry the issue number and engine=, because review.yml reads the engine to pick another model family");
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
