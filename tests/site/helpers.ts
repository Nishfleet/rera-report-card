import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { grade, type Filing, type RuleTable } from "../../src/grade";
import type { Mailer } from "../../src/site/email";
import type { D1Like } from "../../src/site/store";
import type { Env } from "../../src/site/worker";

export function memoryD1(): D1Like & { raw: DatabaseSync } {
  const raw = new DatabaseSync(":memory:");
  raw.exec("PRAGMA foreign_keys = ON");
  raw.exec(readFileSync(new URL("../../db/schema.sql", import.meta.url), "utf8"));
  return {
    raw,
    prepare(sql: string) {
      return {
        bind(...values: unknown[]) {
          const stmt = () => raw.prepare(sql);
          const args = values as (string | number | null)[];
          return {
            async first<T>() {
              return (stmt().get(...args) as T | undefined) ?? null;
            },
            async all<T>() {
              return { results: stmt().all(...args) as T[] };
            },
            async run() {
              return stmt().run(...args);
            },
          };
        },
      };
    },
  };
}

export function fakeMailer() {
  const sent: Parameters<Mailer["send"]>[0][] = [];
  const mailer: Mailer & { sent: typeof sent; fail: boolean } = {
    sent,
    fail: false,
    async send(m) {
      if (this.fail) throw new Error("mail down");
      sent.push(m);
      return { messageId: `m${sent.length}` };
    },
  };
  return mailer;
}

export const rules: RuleTable = JSON.parse(readFileSync(new URL("../../rules/v1.json", import.meta.url), "utf8"));

export const SAMPLE = {
  id: "proj-sample",
  state: "hr",
  regno: "GGM/000/000/2099/00",
  slug: "ggm-000-000-2099-00",
  name: "Example Heights, Phase 2",
  promoter: "Example Realty LLP",
  district: "GURUGRAM",
  locality: "Sector 0, Gurugram",
  status: "under_construction",
  source_url: "https://example.test/sample/project",
  source_name: "Haryana RERA",
  last_read_at: 1791872400,
};

export function sampleFilings(): Filing[] {
  const fixture = JSON.parse(readFileSync(new URL("../../fixtures/replay/sample-p52100000000.json", import.meta.url), "utf8"));
  return fixture.filings as Filing[];
}

export function seed(db: ReturnType<typeof memoryD1>, filings: Filing[] = sampleFilings()) {
  const p = SAMPLE;
  db.raw
    .prepare(
      "INSERT INTO project (id, state, regno, slug, name, promoter, district, locality, status, source_url, source_name, last_read_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    )
    .run(p.id, p.state, p.regno, p.slug, p.name, p.promoter, p.district, p.locality, p.status, p.source_url, p.source_name, p.last_read_at);
  const g = grade(rules, filings, new Date("2026-10-13"));
  db.raw
    .prepare(
      "INSERT INTO grade (id, project, rules_version, letter, points, as_of, input_hash, filings_read, computed_at, grade_json) VALUES (?,?,?,?,?,?,?,?,?,?)",
    )
    .run("g1", p.id, g.rulesVersion, g.letter, g.points, g.asOf, "hash", filings.length, p.last_read_at, JSON.stringify(g));
  return g;
}

export function env(db = memoryD1(), mailer = fakeMailer()): Env & { DB: ReturnType<typeof memoryD1>; EMAIL: ReturnType<typeof fakeMailer> } {
  return { DB: db, EMAIL: mailer, SECRET: "test-secret-0123456789", FROM_ADDRESS: "follow@example.test", PUBLIC_ORIGIN: "https://example.test" };
}
