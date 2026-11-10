---
name: verify-rera-report-card
description: Drive the RERA Report Card Worker locally with cf dev and a local D1, the way a buyer uses it, and capture proof. Use to prove a change to the project page, the preview card PNG, or the follow-by-email flow (follow, confirm, unfollow, delete) works before a PR, or when asked to run or verify rera-report-card.
---

# Verify rera-report-card

The surface is HTTP: server-rendered pages and form POSTs from one Cloudflare Worker (`src/site/entry.ts`). Drive it with `curl`. Local D1 and the email binding run inside `cf dev`, so no Cloudflare login is needed. Feature recipes live in [features/README.md](features/README.md).

Run every command from the repo root. Set these once per run:

```sh
PORT=8792
RUN_ID=$(date +%Y%m%d-%H%M%S)
EVIDENCE=${TMPDIR:-/tmp}/verify-rera-$RUN_ID
DB_ID=1dc0ddec-8c0a-4a96-bf7e-29672a53516a
B=http://localhost:$PORT
q() { npx cf d1 raw "$DB_ID" --local --persist-to .cloudflare/state --sql "$1"; }
mkdir -p "$EVIDENCE"
```

`q` reads the same local D1 file that `cf dev` uses: the Cloudflare Vite plugin, which `cf dev` delegates to, persists dev data under `.cloudflare/state` (the path set in `vite.config.ts`) and `cf d1 raw --local` reads `<persist-to>/v3`. Without `--persist-to`, `cf` writes to a shared directory in your home folder that the dev server never reads.

## Launch

1. `npm ci` once.
2. Start from an empty database: `rm -rf .cloudflare/state`, then `npm run db:local`. It prints `"success": true`.
3. Seed one Haryana project through the real parser. The fixture is `tests/fixtures/hr/detail-1129.html`, and its slug is `277-of-2017`:

   ```sh
   SEED=$(node --input-type=module <<'EOF'
   import { readFileSync } from "node:fs";
   import { parseDetail, detailUrl } from "./src/states/hr/parse.ts";
   import { slugOf } from "./src/site/store.ts";
   import { grade } from "./src/grade.ts";
   const r = parseDetail(readFileSync("tests/fixtures/hr/detail-1129.html", "utf8"), detailUrl("1129"));
   if (!r.ok) throw new Error(r.unreadable);
   const { record: p, filings } = r.value;
   const g = grade(JSON.parse(readFileSync("rules/v1.json", "utf8")), filings, new Date("2026-10-13T00:00:00Z"));
   const q = (v) => (v === null || v === undefined ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replaceAll("'", "''")}'`);
   const id = `hr:${p.regno}`;
   const now = Math.floor(Date.now() / 1000);
   console.log(
     `INSERT OR REPLACE INTO project VALUES (${[id, p.state, p.regno, slugOf(p.regno), p.name, p.promoter, p.district, p.locality, p.status, p.sourceUrl, "Haryana RERA", now].map(q).join(",")});` +
       `INSERT OR REPLACE INTO grade VALUES (${[`${id}:v1`, id, g.rulesVersion, g.letter, g.points, g.asOf, "fixture-detail-1129", filings.length, now, JSON.stringify(g)].map(q).join(",")});`,
   );
   EOF
   )
   q "$SEED"
   ```

   No script in the repo writes `project` rows yet, so this one-off block is the seed. It uses Node's built-in type stripping (Node 22.18 or later), which works because these files only import types.
4. Local secrets: `(umask 077; printf 'SECRET=%s\nPUBLIC_ORIGIN=%s\n' "$(openssl rand -hex 32)" "$B" > .dev.vars)`. `cf dev` loads `.dev.vars`, and git ignores it. `PUBLIC_ORIGIN` makes the email links point at this instance instead of `REPLACE_WITH_DOMAIN`.
5. Start the server as the leader of its own process group, and keep the group ID:

   ```sh
   setsid -f sh -c 'echo $$ > "$1/dev.pid"; exec npx cf dev --port "$2" > "$1/dev.log" 2>&1' sh "$EVIDENCE" "$PORT"
   until grep -qs "http://localhost:$PORT" "$EVIDENCE/dev.log"; do sleep 1; done
   ```

   Do not use `setsid npx ... & echo $!`. `setsid` forks when its caller leads a process group, so `$!` names a process that has already exited, and cleanup misses the server.

   Ready means the log prints `Local:   http://localhost:$PORT` (the Vite dev server's ready line) and `curl -s "$B/api/health"` returns 200. If `/api/health` is not 200, run the Doctor below; a follow request that always errors usually means `.dev.vars` (step 4, the `SECRET`) is missing.

## Doctor

Read-only. Run it first whenever anything looks wrong:

```sh
ss -ltnp | grep ":$PORT "
curl -s -w ' %{http_code}\n' "$B/api/health"
q "SELECT slug FROM project"
```

Healthy: the port belongs to a `workerd` started from this checkout, health prints `{"status":"ok","db":"connected"}` with 200, and the query returns `277-of-2017`. Health only runs `SELECT 1`, so it passes on an empty database. The project query proves the seed.

Isolation: one instance per checkout, because every instance in a checkout shares `.cloudflare/state`. If the port is taken by a process you did not start, pick another `PORT`. Never drive or kill it.

## Drive

Follow the feature files:

- [project-page.md](features/project-page.md): `/`, `/api/health`, `/p/hr/277-of-2017`, 404.
- [og-card.md](features/og-card.md): `/og/hr/277-of-2017.png`.
- [follow-email.md](features/follow-email.md): `POST /api/follow`, `/follow/confirm`, `/u/<token>`, `/follows/<token>`, delete.

## Evidence

Everything goes to `$EVIDENCE`: `dev.log`, response bodies, `card.png`, and the `follow` rows before and after each step. Proof standards:

- Use the real user path: the form POSTs and the links in the email the Worker sent. Never insert `follow` or `follower` rows by hand.
- Capture the action and the result: the HTTP code, the page `<h1>`, and the row state read back with `q`.
- The email is a real side effect. Local `send_email` writes each message under `.cloudflare/tmp/email/`, and `dev.log` prints its path on a `Text:` line. Copy the file into `$EVIDENCE`.
- The links in the email carry signed tokens. Keep them out of PR text and public comments.

## Cleanup

```sh
kill -- -"$(cat "$EVIDENCE/dev.pid")"
rm -rf .cloudflare/state .cloudflare/tmp .dev.vars
```

This stops only the process group you started. It never kills by name. `$EVIDENCE` stays. Check it with `ls "$EVIDENCE"` after cleanup.
