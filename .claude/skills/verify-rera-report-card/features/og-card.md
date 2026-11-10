# Preview card

Every project has a 1200 x 630 preview card that chat apps and social sites show when someone shares the project link. The Worker draws it as SVG and turns it into PNG with resvg and the bundled Inter fonts.

## Sub-features

- `og-png` returns the card as PNG.
- `og-svg` returns the same card as SVG.
- `og-missing` returns 404 for an unknown project.

## How to get to it (user POV)

- Share `/p/hr/<slug>` in a chat app. The app fetches the `og:image` URL named in the page head.
- Open `/og/hr/<slug>.png` directly.

## Driving it with curl

Preconditions:

- Doctor passes and the seeded project exists.

- **PNG.** Run `curl -s -o "$EVIDENCE/card.png" -w '%{http_code} %{content_type}\n' "$B/og/hr/277-of-2017.png"`, then `file "$EVIDENCE/card.png"`. Result: `200 image/png` and `PNG image data, 1200 x 630`.
- **SVG.** Run `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' "$B/og/hr/277-of-2017.svg"`. Result: `200 image/svg+xml; charset=utf-8`.
- **Missing.** Run `curl -s -o /dev/null -w '%{http_code}\n' "$B/og/hr/no-such.png"`. Result: `404`.

## Gotchas

- If PNG drawing throws, the Worker falls back to SVG with `cache-control: no-store` under the `.png` URL. Check the content type, not only the 200.
- The fonts bundle through the `.ttf` Data rule in `cloudflare.config.ts`. A build that drops that rule breaks this route.
