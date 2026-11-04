# RERA Report Card

A public report card for under-construction housing projects in India. Each project gets a grade based on what its developer has filed with the state real estate regulator (RERA).

Every project has one page. The grade comes from public RERA filings, and every reason behind it cites the filing it came from, so a buyer can check the source.

The first scope is Maharashtra and the National Capital Region (NCR). Other states may follow once those work well.

Status: early build. Run `npm test`. Run the site locally with `npm run db:local` once, then `npm run dev` (cf dev, local D1 and email, no Cloudflare login).

- `src/grade.ts` and `rules/`: the grader and the versioned rule table.
- `src/states/hr/`: the Haryana RERA fetcher and parsers, tested on `tests/fixtures/hr/`.
- `src/site/`: the public site as a Cloudflare Worker. Project page `/p/:state/:slug`, preview card, follow by email with double opt-in, one-click unfollow and a manage page. Schema in `db/schema.sql`, config in `cloudflare.config.ts`. `wrangler.toml` stays until the deploy and preview workflows run on cf, because Wrangler does not read `cloudflare.config.ts`; change both files together.

Every merge to `main` deploys the site with `.github/workflows/deploy.yml`, and every pull request gets its own preview copy from the `preview` check (link pattern in the pull request template). Email sending still needs the sending domain onboarded to Cloudflare Email Service and the two `REPLACE_WITH_DOMAIN` values in `wrangler.toml` and `cloudflare.config.ts` filled in.
