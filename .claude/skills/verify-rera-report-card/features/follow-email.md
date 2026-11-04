# Follow by email

A buyer enters an email address on a project page to follow it. The Worker sends a confirmation email (double opt-in). The follow becomes active only after the buyer presses the button behind the link. Each email has a one-click unfollow link and a manage link, and the manage page can delete the address.

## Sub-features

- `follow-request` stores a pending follow and sends the confirmation email.
- `follow-confirm` turns pending into active through the emailed link, once.
- `unfollow` sets the follow to unfollowed through the one-click link.
- `manage` lists active follows for the address.
- `delete` removes the follower and every follow.

## How to get to it (user POV)

- The follow form on `/p/hr/<slug>` (fields `state`, `slug`, `email`, and the hidden honeypot `website`).
- The confirm link in the email, `/follow/confirm?t=<token>`. GET shows a button that POSTs `t`.
- The unfollow link in the email, `/u/<token>`. GET shows a button that POSTs.
- The manage link in the email, `/follows/<token>`. Its delete form POSTs `t` to `/follows/delete`.

## Driving it with curl

Preconditions:

- Doctor passes and `.dev.vars` sets `SECRET` and `PUBLIC_ORIGIN=$B`.
- `q "SELECT COUNT(*) FROM follow"` returns 0.

- **Request.** Run `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -X POST -d 'state=hr&slug=277-of-2017&email=verify%40example.com' "$B/api/follow"`. Result: `303` to `/p/hr/277-of-2017?f=sent`. Then `q "SELECT state FROM follow"` returns `pending`.
- **Read the email.** Run `until T=$(grep '^Text: ' "$EVIDENCE/dev.log" | tail -1 | cut -c7-) && [ -s "$T" ]; do sleep 1; done; cp "$T" "$EVIDENCE/confirm-email.txt"`. The file holds the `/follow/confirm?t=`, `/u/` and `/follows/` links, all on `$B`.
- **Confirm.** Run `C=$(grep -o "$B/follow/confirm?t=[^ ]*" "$T" | head -1)`, then `curl -s -o /dev/null -w '%{http_code}\n' "$C"` (200), then `curl -s -X POST --data-urlencode "t=${C#*t=}" "$B/follow/confirm" | grep -o '<h1>[^<]*'`. Result: `You follow this project`. `q "SELECT state FROM follow"` returns `active`. Posting the same token again returns `400`.
- **Manage.** Run `M=$(grep -o "$B/follows/[^ ]*" "$T" | head -1); curl -s -o /dev/null -w '%{http_code}\n' "$M"`. Result: `200`.
- **Unfollow.** Run `U=$(grep -o "$B/u/[^ ]*" "$T" | head -1); curl -s -X POST "$U" | grep -o '<h1>[^<]*'`. Result: `You no longer follow this project`, and `q "SELECT state FROM follow"` returns `unfollowed`.
- **Delete.** Run `curl -s -X POST --data-urlencode "t=${M##*/}" "$B/follows/delete" | grep -o '<h1>[^<]*'`. Result: `Your email is deleted`, and `q "SELECT (SELECT COUNT(*) FROM follower), (SELECT COUNT(*) FROM follow)"` returns `0, 0`.

## Gotchas

- Without `SECRET` in `.dev.vars` the follow request fails. Without `PUBLIC_ORIGIN` the email links point at `REPLACE_WITH_DOMAIN`.
- A form with `website` set is treated as a bot. It redirects to `?f=sent` and stores nothing.
- Requests are rate limited per address and client (`rate_hit` table). Repeat runs on the same database can return `?f=limited`. Start from an empty database.
- The email is sent after the 303 returns, so its file can appear a second later. Wait for the `Text:` path in `dev.log`, and take the last one, which is the newest email.
- Local email never leaves the machine. It proves the Worker built and sent the message, not that a real inbox receives it.
