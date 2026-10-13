# RERA Report Card

A public report card for under-construction housing projects in India. Each project gets a grade based on what its developer has filed with the state real estate regulator (RERA).

Every project has one page. The grade comes from public RERA filings, and every reason behind it cites the filing it came from, so a buyer can check the source.

The first scope is Maharashtra and the National Capital Region (NCR). Other states may follow once those work well.

Status: early build. Run `npm test`.

- `src/grade.ts` and `rules/`: the grader and the versioned rule table.
- `src/states/hr/`: the Haryana RERA fetcher and parsers, tested on `tests/fixtures/hr/`.
- `src/site/`: the public site as a Cloudflare Worker. Project page `/p/:state/:slug`, preview card, follow by email with double opt-in, one-click unfollow and a manage page. Schema in `db/schema.sql`, config in `wrangler.toml`.

To deploy the site: create a D1 database and load `db/schema.sql`, onboard the sending domain to Cloudflare Email Service, fill in `wrangler.toml`, set the `SECRET` secret, then `npx wrangler deploy`.
