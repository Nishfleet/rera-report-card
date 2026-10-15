# Agent notes for rera-report-card

Launch stage: 0 (day one). Next trigger: the follow-by-email page goes public and stores its first follower's address (stage 1).

Success: confirmed followers, people who finished the double opt-in and still follow at least one project (PLAN.md section 12 targets 2,000 within 90 days of public launch). Baseline: 0 on 2026-10-15 (never deployed: `wrangler.toml` still has `REPLACE_WITH_D1_DATABASE_ID`). Measured by: `npx wrangler d1 execute rera-report-card --remote --command "SELECT COUNT(DISTINCT follower) FROM follow WHERE state = 'active'"` (read-only, once deployed).
