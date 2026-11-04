# Agent notes for rera-report-card

Launch stage: 0 (day one). Next trigger: the follow-by-email page goes public and stores its first follower's address (stage 1).

Success: confirmed followers, people who finished the double opt-in and still follow at least one project (PLAN.md section 12 targets 2,000 within 90 days of public launch). Baseline: 0 on 2026-10-15. The Worker deploys on every merge to main since 2026-11-03, and the follow page is not public yet. Measured by: `npx cf d1 query 1dc0ddec-8c0a-4a96-bf7e-29672a53516a --sql "SELECT COUNT(DISTINCT follower) FROM follow WHERE state = 'active'"` (read-only, once deployed).

## Run it and prove it

Live: <https://rera-report-card.nishant345.workers.dev>, the workers.dev address, until a custom domain exists.

- Run: `npm run typecheck`, `npm run lint` and `npm test`.
- Prove: after the deploy on main, `curl -s https://rera-report-card.nishant345.workers.dev/api/health` prints `{"status":"ok","db":"connected"}` with status 200. A 503 with `{"status":"error","db":"error"}` means the D1 read failed, so the database binding is broken.
- Test login: none, because the site has no accounts.
