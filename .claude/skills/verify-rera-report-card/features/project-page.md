# Project page

A buyer opens a project link and sees the project's RERA record, its grade and the source filing link. The home page explains the site, and an unknown project gets a 404 page.

## Sub-features

- `home` renders the landing page.
- `health` reports whether the Worker can read D1.
- `project` renders one project from D1 with its latest grade.
- `not-found` returns 404 for an unknown slug.

## How to get to it (user POV)

- Open `/`.
- Open a shared project link `/p/hr/<slug>`.
- Uptime checks call `/api/health`.

## Driving it with curl

Preconditions:

- Doctor passes and `q "SELECT slug FROM project"` returns `277-of-2017`.

- **Home.** Run `curl -s -o "$EVIDENCE/home.html" -w '%{http_code}\n' "$B/"`. Result: `200`, and the `<title>` starts with `RERA Report Card`.
- **Health.** Run `curl -s -w ' %{http_code}\n' "$B/api/health"`. Result: `{"status":"ok","db":"connected"} 200`.
- **Project.** Run `curl -s -o "$EVIDENCE/project.html" -w '%{http_code}\n' "$B/p/hr/277-of-2017"`. Result: `200`, the `<title>` is `Brahma City- J Block: RERA record | RERA Report Card`, and the page names `Haryana RERA 277 OF 2017`.
- **Not found.** Run `curl -s -o /dev/null -w '%{http_code}\n' "$B/p/hr/no-such"`. Result: `404`.

## Gotchas

- Health passes on an empty database, because it only runs `SELECT 1`. Use the project page to prove the seed.
- The `detail-1129` fixture yields no filings, so its grade has no letter (`letter` and `points` are NULL) and the page says `no grade yet`. That is the parser's real output, not a seed bug.
- The project page is cached for 300 seconds (`cache-control: public, max-age=300`) unless `?f=` is set.
