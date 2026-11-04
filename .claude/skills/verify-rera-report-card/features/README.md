# rera-report-card verification map

This directory is the maintained source for verifying what a buyer can do on RERA Report Card. Read this index, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with [../SKILL.md](../SKILL.md): empty local D1, schema, the seeded Haryana project `277-of-2017`, `.dev.vars`, `cf dev --port $PORT`.
- The shell variables `B`, `EVIDENCE` and the `q` function from SKILL.md are set.
- Doctor passes.
- Never drive an instance this run did not start.

## Driving conventions

- Drive with `curl` against `$B`. Use route paths and form field names from `src/site/worker.ts`. Do not use page positions.
- POST forms as `application/x-www-form-urlencoded`, the way the browser form sends them.
- Read state back with `q` after every mutation.

## Proof and skip reporting

- Record the HTTP code, the page `<h1>` or `<title>`, and the stored state for each step.
- Report a step that cannot run with the command you tried and the precondition that was missing.
- Do not report a skipped entry point as verified through a different path.

## Features

| Feature | File | Entry points |
| --- | --- | --- |
| Project page | [project-page.md](project-page.md) | `/`, `/api/health`, `/p/:state/:slug` |
| Preview card | [og-card.md](og-card.md) | `/og/:state/:slug.png`, `.svg` |
| Follow by email | [follow-email.md](follow-email.md) | `POST /api/follow`, `/follow/confirm`, `/u/:token`, `/follows/:token`, `/follows/unfollow`, `/follows/delete` |

## Feature entry contract

Each feature file has an H1 title and one paragraph, then four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with curl`, `Gotchas`.
