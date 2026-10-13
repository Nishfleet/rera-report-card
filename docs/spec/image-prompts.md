# Image prompts for RERA Report Card

No paid image tool was used. Both screens are hand-written HTML in `spec-assets/src/`, derived from real app screens on Mobbin, and rendered with headless Chrome. This file holds the source references, the screen briefs and the render commands. The written requirements in `spec.html` win over the images.

## Source references

Each reference image is saved in full resolution in `spec-assets/refs/`. We took shape and behaviour from them and no brand colour, icon or copy.

Grade page shape (screen 1):
- Credit Karma score page. https://mobbin.com/screens/dfcabcd8-a9aa-4771-9e56-0ce6aed1872e. File `refs/credit-karma.webp`. Taken: large score, "next update" line, three-stat strip, tinted updates band.
- Rocket Money gauge, history and letter-graded factors. https://mobbin.com/screens/cc0bea8c-01ee-4301-916e-445f810aaf8e. File `refs/rocket-money.webp`. Taken: arc gauge in a white card, history card, capital-letter section labels.
- One factors list. https://mobbin.com/screens/2fdcc0ed-6e23-4371-adc9-2cc3dffbd0c7. File `refs/one-score.webp`. Taken: factor rows with the status word on the right and the measured value under the name.
- CRED score decreased with impact cards. https://mobbin.com/screens/b4c37acb-ae4d-4c71-b04f-623b94abd545. File `refs/cred.webp`. Taken: a card that states the change in one sentence and an "impact" word with a dot.

Filing timeline shape (screen 2):
- Wise transaction updates. https://mobbin.com/screens/ea2fde3e-8b3e-4ef8-92d9-ea5dc9e51fda. File `refs/wise.webp`. Taken: vertical stepper with timestamps and one bold final state.
- Better Stack incident timeline. https://mobbin.com/screens/76f87fea-775d-47e6-b97a-b2d234f6c46b. File `refs/better-stack.webp`. Taken: rail with typed icons, right-aligned times, muted system events.
- incident.io subscribed button and status stepper. https://mobbin.com/screens/8d27748b-e522-40ba-a951-f718beb76799. File `refs/incident-io.webp`. Taken: the "Subscribed" button with a check in the header.

Search landing shape (not rendered, specified in `PLAN.md` section 4.1):
- Perplexity Patents. https://mobbin.com/screens/764b4870-3557-4a3b-a76a-b8dc57e74914. File `refs/perplexity-patents.webp`. Taken: one large input, mode chips, a collapsible how-to card.

## Shared direction

Phone first, 390 pixels wide, drawn at 2x. Grey-white canvas `#f5f4ef`, white cards with 20 pixel radius and a 1 pixel soft line. Inter with "Noto Sans Devanagari" in the stack. One accent colour, `#1d4ed8`, for the current gauge segment, the primary button, links, impact dots and the "Following" state. No red and green. No gradients, illustrations or stock photos. All people, companies and numbers are sample data. Every screen carries a "Sample data" notice. The registration number P52100000000 and the promoter Example Realty LLP are fictional, and the notice states that the facts are invented.

## Screen 1: main value screen (grade page)

File: `spec-assets/main-value-screen.png`, source `spec-assets/src/main-value-screen.html`.

- *User:* a homebuyer about to pay a token for a flat in Pune.
- *Purpose:* in under ten seconds see the grade and why, with a source for each reason.
- *Content, top to bottom:* top bar with wordmark "RERA Report Card" and a search icon. Notice "Sample data." Breadcrumb "Maharashtra · Pune · Hadapsar (हडपसर, पुणे)". Title "Aarohi Greens, Phase 2". Mono line "MahaRERA P52100000000". Promoter line "Promoter: Example Realty LLP · Under construction". Grade card with five-segment gauge E to A, letter "C", word "Mixed record", pill "Down from B on 4 May 2026", line "Read from MahaRERA on 13 Oct 2026, 06:10 IST. Next read tonight." and a strip "4 reasons", "11 filings read", "v1 rule table".
- *Reasons, each with a source line and an impact label:* "Completion date moved from Dec 2025 to Jun 2027" (High impact). "Missed Jan to Mar 2026 quarterly report, notice issued 4 May 2026" (High impact). "2 complaints, 1 order dated 18 Feb 2026" (Medium impact). "1 extension granted, to 30 Jun 2027" (Low impact).
- *Then:* a card "Checked, no effect on the grade" with three lines. A grade history strip B, C, C, C, C, C for Apr to Sep. A card "How the grade works" with two links.
- *Actions:* primary "Follow this project", secondary "Share".
- *State:* graded, not following.

## Screen 2: main action screen (filing timeline and follow)

File: `spec-assets/main-action-screen.png`, source `spec-assets/src/main-action-screen.html`.

- *User:* the same buyer, after pressing Follow.
- *Purpose:* confirm what they follow, what comes next and what the email looks like. Show the cited filing history.
- *Content, top to bottom:* header with back arrow, project name, number and a "Following" button with a check. Card "You follow this project" with "Grade C, Mixed record", "Next expected" and "Emails go to r***@example.com". Card "Last email we sent you" with a copy of the 4 May 2026 email. Section "Filing timeline", newest first, in five month groups with events on 13 Oct 2026, 9 Jul 2026, 4 May 2026, 18 Feb 2026 and 22 Dec 2025. Events that caused an email carry "Emailed to followers". Card "We email you when" with six lines. Link "Stop following this project".
- *State:* following, email confirmed.

## Render commands

Run from `spec-assets/`. The 844 pixel command is the one in the brief. The tall renders use the measured page height so that the whole page shows.

```
/usr/bin/google-chrome --headless=new --virtual-time-budget=8000 --window-size=390,844 --force-device-scale-factor=2 --screenshot=main-value-screen-fold.png src/main-value-screen.html
/usr/bin/google-chrome --headless=new --hide-scrollbars --virtual-time-budget=8000 --window-size=390,2428 --force-device-scale-factor=2 --screenshot=main-value-screen.png src/main-value-screen.html
/usr/bin/google-chrome --headless=new --hide-scrollbars --virtual-time-budget=8000 --window-size=1440,1320 --force-device-scale-factor=2 --screenshot=main-value-screen-1440.png src/main-value-screen.html
```

The same three commands apply to `main-action-screen` with heights 844, 2262 and 1317.
