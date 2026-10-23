# RERA Report Card

A public report card for under-construction housing projects in India. Each project gets a grade based on what its developer has filed with the state real estate regulator (RERA).

Every project has one page. The grade comes from public RERA filings, and every reason behind it cites the filing it came from, so a buyer can check the source.

The first scope is Maharashtra and the National Capital Region (NCR). Other states may follow once those work well.

Status: early build. Run `npm test`.

- `src/grade.ts` and `rules/`: the grader and the versioned rule table.
- `src/states/hr/`: the Haryana RERA fetcher and parsers, tested on `tests/fixtures/hr/`.
- `src/site/`: the public site as a Cloudflare Worker. Project page `/p/:state/:slug`, preview card, follow by email with double opt-in, one-click unfollow and a manage page. Schema in `db/schema.sql`, config in `wrangler.toml`.

To deploy the site: create a D1 database and load `db/schema.sql`, onboard the sending domain to Cloudflare Email Service, fill in `wrangler.toml`, set the `SECRET` secret, then `npx wrangler deploy`.

## Agent dispatch

`.github/workflows/agent-dispatch.yml` is the trigger stub for the automated workers. GitHub fires a workflow only on its own repo's events, so the triggers live here, while the dispatch logic lives once in `Nishfleet/fleet-ops`. It runs on issue, comment, pull-request and CI-completion events, every six hours, and on a manual run with an optional `issue=<N>`, then calls `Nishfleet/fleet-ops/.github/workflows/agent-dispatch.yml@main` and passes the repo variable `AGENT_MODE` through. It holds no logic and no credentials of its own.

**Switch it off:** delete the file in a PR. Every automated dispatch in this repo stops with it, and pull-request CI is unaffected. A repo enrolled in the fleet queue also needs its entry removed from `config/intake-repos.json` in `Nishfleet/fleet-ops`, because the fleet's hourly sweep runs this workflow by name and would fail without it.
