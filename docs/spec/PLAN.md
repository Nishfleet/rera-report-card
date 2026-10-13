# RERA Report Card: product plan

Working title. Status: not started, no code exists. Updated 13 Oct 2026. This plan deepens `spec.html` in this folder. The spec holds the decisions. This file holds the detail an agent needs to build them.

Labels. A linked claim comes from our private evidence notes or from a page fetched while writing this plan. "Reasoning" marks our own inference. "Unverified" marks a claim we tried to confirm and could not. "Estimate" and "proposed" mark planning figures. Status words follow the house list: done, live, queued, running, blocked, not started.

## 1. Thesis and why now

RERA Report Card is a public report card for every under-construction housing project, graded from the project's own RERA filings. Each project gets one page with a letter grade from A to E and up to five plain reasons. Each reason cites the filing, its date and its source URL. A follow button on the page emails the reader when the record changes. The first states are Maharashtra and the National Capital Region (Haryana RERA for Gurugram and Panchkula, UP RERA and Delhi RERA). Other states come later.

The reader is a homebuyer who is about to pay a token or booking amount, or who already pays builder demand letters. A second reader is a channel partner, meaning a broker, who shares the page of a healthy project with clients.

### The one rule: cited facts only

Every line on a page is a fact from a filing, with its date and source. We write no opinion, no rumour and no advice. This is a product principle and not a style choice, for three reasons.

- **The regulator stopped grading for lack of power.** MahaRERA paused its own project grading in November 2024. A senior official said the Act [does not authorize a regulatory body to grade projects](https://propnewstime.com/latestnewsstories/MTIxNDc=/maharera-halts-real-estate-project-grading-initiative-due-to-legal-constraints) and that going ahead could cause legal problems. The state CREDAI president said the Act has no such provision. We read that page on 13 Oct 2026.
- **Builders can sue a private grader.** A grade built on opinion invites a defamation claim (reasoning, not legal advice). A grade built only on cited filings gives the builder nothing to dispute except the filing itself.

The grade is a formula over those facts. The rule table is public and versioned. Section 7 holds the table and Section 10 holds the legal posture.

### Why now

- **Regulators are visibly behind.** MahaRERA sent notices to [8,212 projects](https://www.outlookmoney.com/invest/maharera-flags-8212-projects-for-missing-qpr-deadline-gives-regulatory-warning) for missing the Jan to Mar 2026 quarterly progress report (QPR). Outlook Money published that on 4 May 2026 and gave 20 Apr 2026 as the filing deadline. The report said developers had 60 days to reply. The constructionworld piece in our evidence note dates the same notices 8 May 2026, so sources differ on the exact notice date.
- **Lapsed registrations are common.** MahaRERA sent 10,773 lapsed-project notices and received 5,324 replies by January 2025, according to [Punekar News](https://www.punekarnews.in/mahareras-crackdown-over-5300-developers-respond-to-lapsed-project-notices/). Our fetch was blocked (HTTP 403) on 13 Oct 2026, so this figure comes from the evidence brief and is unverified here.
- **Complaints are a large queue.** MahaRERA reports 3,743 complaints filed and 5,267 resolved between October 2024 and July 2025 (figure from the brief, source page not re-fetched).
- **Advertising now carries the number.** MahaRERA requires a QR code and the registration number on every ad (order of 8 Apr 2025). It [fined 628 projects](https://housing.com/news/maharera-fines-628-projects-for-not-displaying-qr-code-registration-number/) in July 2024 for not showing them. Our fetch of that page returned HTTP 406 on 13 Oct 2026, so the figure is unverified here. The effect is that buyers now see a RERA number on almost every hoarding and WhatsApp forward. They have a key to type, and no one tells them what to look up.
- **Brokers sell most flats.** Channel partners drive 32% of buying across India (ANAROCK, 2024) and about 60% in the Mumbai region (CREDAI-MCHI). Maharashtra had 50,673 registered agents and 31,980 active ones in May 2025. A broker who shares a clean page does our distribution work.
- **The portals leave out the hard facts.** We checked the Square Yards page of one Pune project on 13 Oct 2026. It shows the RERA number, start and completion dates, an overall progress figure of 21% with stage figures, and the bank name and IFSC code. It shows no lapse status, no missed quarterly report, no complaint and no extension. Housing.com shows the same kind of fields (reasoning, not re-fetched).
- **The nearest tool covers NCR only and has no public score.** reratracker.com covers Noida, Gurugram, Greater Noida, Sohna, Ghaziabad and Delhi. Its own roadmap lists a "Trust Score" as coming soon. That is a race we should expect (Section 14).
- **Dubai shows the destination.** The Dubai Land Department puts a Madmoun QR code on ads to verify permits. It had issued 411,608 permits by December 2023. India has the QR code. It lacks the layer on top that says what the record means.

### What we do not claim

- We do not claim buyers will pay. The evidence note says willingness to pay is unverified. Monetization is outside this plan (Section 15).
- We do not claim a grade predicts delivery. It is a record of filings and not a forecast.
- We do not claim every portal publishes every input. Milestone 0 maps the fields.

### The four strength tests

The owner's tests for a product idea, answered once here and again in the spec.

1. **Sits on a money or decision moment.** Yes. The reader decides whether to pay a token or a demand letter, and the page answers one question at that moment.
2. **One party can adopt it alone.** Yes. The reader needs no builder consent and no regulator integration, because every input is already public.
3. **Repeat use or share loop.** Partly. The share loop is strong because the page is built to be forwarded on WhatsApp. Repeat use per buyer is weak because a family buys one flat. Quarterly follow emails supply four touches a year.
4. **Data compounds over time.** Yes. Each nightly read adds a dated snapshot, and a portal shows only the current state (reasoning, to confirm in Milestone 0). History we store today cannot be rebuilt later.

Section 3 explains the weak point on test 3 and what we do about it.

## 2. Personas

Built from the evidence and from reasoning. We have not interviewed anyone. Ten interviews are in Milestone 1.

**A. Meera, 34, Pune, about to pay a token.**
- *Arrives:* a sales manager sends a brochure and a payment link on WhatsApp. The message ends with the RERA number.
- *Holds:* the number, the project name and a deadline to "block the unit before the price goes up".
- *Fears:* paying for a project that has stopped filing reports, and learning later.
- *Searches:* "[project name] RERA" or the number itself.
- *Done:* she reads five lines, sees the grade and the missed report, and forwards the page to her husband in a family group.

**B. Ravi, 41, Gurugram, two years in.**
- *Arrives:* a demand letter says the "slab" stage is complete and asks for the next instalment.
- *Holds:* a payment plan, five letters and an allottee WhatsApp group with 60 members.
- *Fears:* paying for a stage that is not built and hearing about a new date only after the builder announces it.
- *Done:* he follows the project, shares the page in the group and receives an email when the next report is filed or missed.

**C. Imran, 29, channel partner, Mumbai and Pune.**
- *Arrives:* a client asks "is this project safe". He wants a neutral page he can send.
- *Done:* he sends the page for his A and B projects. For a C or lower, he warns the client first and keeps the relationship.

**D. Sunil, 45, compliance manager at a promoter (not a user, a stakeholder).**
- *Arrives:* a client calls to say their project has a C on a public site.
- *Holds:* the filings. He knows which fact is old, wrong or already fixed.
- *Fears:* a public grade that costs him bookings for a reason he can fix.
- *Done:* he opens the correction form, attaches the filing and sees the fact re-read within two working days.

## 3. Promise and jobs to be done

**Promise.** For any project, in under ten seconds: what the filings say, graded A to E, with a source for every line. Then, as time passes: an email the day the filings change.

**Jobs to be done.**
- *Before paying:* "Tell me if this project is keeping up with its legal filings."
- *While paying:* "Tell me when something changes, so that I am not the last to know."
- *To share:* "Give me a link that my family or my group will understand without a lecture."
- *To sell, for brokers:* "Give me a page that shows my healthy project is healthy, with proof."
- *To correct, for promoters:* "Let me show that a fact is wrong or fixed, and have it re-read."

**What we promise not to do.**
- We do not say a builder is good or bad. We say what the filings show.
- We do not tell anyone to buy, wait or stop paying.
- We do not accept money to change a grade, and the grade function has no input for it.
- We do not show a promoter grade in v1 (Section 15 gives the reason).

**The weak point on test 3 and the fix.**
- A buyer rarely returns after the first read. One flat per family is a thin repeat-use story.
- The fix is the follow email. Every follower receives at least one message each quarter. A quarterly check email says "filed on time" or "not filed" for the latest QPR window, even if nothing else changed.

## 4. End-to-end journeys

Every route is public and needs no sign-in, because reading is free and anonymous. The only account-like object is a follow, which uses an email address and a signed link.

### 4.1 Search landing, route `/`

Shape taken from Perplexity Patents: one large input, a few mode chips and one short "how to use" card.

- The page shows the wordmark, one input and three chips. The hint text in the input reads "Project name or RERA number".
- A typed RERA number that matches a known pattern goes straight to its page on Enter.
- A project name shows up to 8 suggestions. Each suggestion shows project name, promoter, district and current grade letter.
- A number that is not in our records shows "We do not have this registration yet. We read new projects every night." and a link "Tell us the number" that stores it for the next run.

### 4.2 Project grade page, route `/p/:state/:regno`

This is the main value screen. The two screens in `spec-assets/` follow Sections 4.2 and 4.6.

Top of page.
- A breadcrumb shows state, district and locality. Marathi, Hindi or English names show as filed, in the system font stack.
- The project name is the page title. Under it the RERA number shows in monospace. Under that the promoter name links to the promoter page.
- A status word follows. It is one of "Under construction", "Registration lapsed", "Registration revoked" or "Completed".

Grade card.
- A five-segment gauge runs from E on the left to A on the right. The current letter's segment is filled in the accent colour.
- The letter shows at 72 pixels with a word under it. The words are "Strong record", "Good record", "Mixed record", "Weak record" and "Poor record".
- A pill shows the last change, for example "Down from B on 4 May 2026". A grade that never changed shows no pill.
- A line shows "Read from MahaRERA on 13 Oct 2026, 06:10 IST. Next read tonight."
- A strip of three numbers shows reasons count, filings read and rule table version.

Reasons.
- A list shows up to five reasons that lowered the grade. They are sorted by points taken off, largest first.
- Each reason shows an icon, a one-line title in plain words, one line of detail, a source line and an impact label.
- The source line holds the filing name, its date and the source domain as a link to the exact URL.
- The impact label is "High impact", "Medium impact" or "Low impact", with three dots, filled to match. It comes from the points in the rule table.
- If the grade has more than five reasons, the page shows the five largest and a line "2 more reasons in the full list". The full list is on the timeline page.
- A card titled "Checked, no effect on the grade" lists the inputs that were read and found clean, in plain words.
- An input that we could not read shows in a third card titled "We could not read" with the reason, for example "UP RERA page was down on 12 Oct 2026". We never score what we could not read.

Grade history.
- Six cells show the grade at the start of each of the last six months. A change is marked.

Rule note.
- A card says "Every reason is a fact from a public filing, with its date and source. We add no opinions." Links go to the rule table and to "Report a wrong fact".

Bottom dock.
- The primary button is "Follow this project". Next to it sits "Share".
- On a screen of 900 pixels or more the dock floats at the lower right.

### 4.3 Share, from the grade page

- "Share" opens the system share sheet on a phone. On desktop it copies the link.
- A second button on the sheet reads "Share on WhatsApp". It opens `https://wa.me/?text=` with the page URL and one line of text.
- The one line reads "Aarohi Greens, Phase 2: grade C. Missed Jan to Mar 2026 quarterly report, notice 4 May 2026." The reason shown is the one that took off the most points.
- The link carries `?s=wa` so that we can count visits that came from a share. We store the count only.
- The page's preview card is made of the project name, the grade letter and the top reason.
- The card is a 1200 by 630 image at a stable URL, and the page links it in `og:image`. The tags `og:title` and `og:description` hold the same text as the card.
- The card is drawn once, when the grade or the top reason changes. It is stored in R2. WhatsApp's crawler therefore never waits for a render.
- A project with no grade shows a plain card with the project name and "Grade not available yet".

### 4.4 Follow, route `/p/:state/:regno` and `/follow/confirm`

- "Follow this project" opens a sheet with one email field and the button "Follow". The sheet states what we send: "One email when the record changes. One email each quarter. Nothing else."
- A valid email stores a pending follow and sends one confirmation email. The sheet then reads "Check your email to confirm."
- The confirmation link opens `/follow/confirm` with one button, "Confirm and follow". Only the button activates the follow, so mail scanners cannot burn the link.
- After confirming, the page shows "You follow this project" and offers "Follow another project".
- A visitor who already follows sees "Following" with a check on the button. A tap opens a menu with "Unfollow".
- A link older than 7 days says "This link has expired. Follow again from the project page."
- There is no account, no password and no profile. The management page `/follows/:token` lists followed projects with an unfollow button for each. The token is in every email footer.

### 4.5 Change emails and quarterly emails

What triggers a change email.
- A quarterly report is newly filed.
- A quarterly report is missed after its deadline.
- The registration lapses or is revoked, or a lapse is cleared.
- An extension is applied for or granted.
- A new complaint or order is listed against the project or its promoter.
- The completion date changes.

How the email behaves.
- A change must show in two consecutive nightly reads before we send. One-off portal glitches therefore do not email anyone.
- Each follower gets at most one email per day. Several changes on one day come in one email.
- The email goes out between 08:00 and 21:00 IST.
- The email subject names the project and the fact, for example "Aarohi Greens, Phase 2: grade is now C, down from B".
- The body has the changed fact, its date, its source, the old and new grade, one button and an unfollow link.
- An email never recommends an action.

The quarterly email.
- A fixed time after each state's QPR deadline, we send every follower of an under-construction project one email, even if nothing else changed.
- The subject is "Aarohi Greens, Phase 2: quarterly report filed" or "Aarohi Greens, Phase 2: quarterly report not filed".
- The email shows the grade and links to the timeline.
- The deadline per state sits in a table in the repo. MahaRERA's Jan to Mar 2026 deadline was 20 Apr 2026 according to Outlook Money. We take the other states' deadlines from their orders in Milestone 0, and until then we mark them unverified.
- This is the built-in quarterly cadence. It gives a follower at least four emails a year.

### 4.6 Filing timeline, route `/p/:state/:regno/timeline`

This is the main action screen. It shapes itself on the Wise updates stepper, the Better Stack incident timeline and the incident.io subscribed button.

- The header shows a back arrow, the project name, the registration number and a "Following" button with a check when the reader follows.
- A card, "You follow this project", shows the current grade, the date it last changed, the next expected filing and the masked email.
- A second card, "Last email we sent you", shows a copy of the latest email so the reader knows what to expect.
- The timeline lists filings newest first, grouped by month. Each event shows a marker, a date, a title, one line and a source line.
- Markers use a check for a filed report, a dark exclamation for a missed report, a document for an order, a calendar for a date change and a dot for a nightly check with no change.
- An event that caused an email carries a small tag "Emailed to followers".
- A list titled "We email you when" shows the six triggers from Section 4.5.
- A quiet link reads "Stop following this project".
- A reader who is not following sees "Follow" in the header and no private cards. The timeline stays public.

### 4.7 Promoter page, route `/promoter/:state/:slug`

- The page lists the promoter's projects with grade, status and last change.

### 4.8 District page, route `/d/:state/:district`

- The page lists under-construction projects in the district, sorted by last change, then by name.
- A filter bar shows grade letters A to E and a text box for name.

### 4.9 Correction request, route `/correct/:regno`

- Anyone can open it from a project page. The form asks for the fact in dispute, the filing that shows the correct fact, a link or file, and a contact email.
- A promoter's request shows on the project page as "A correction request is under review since 14 Oct 2026". It shows no claim about who is right.
- We re-read the source portal within two working days. If the filing agrees with the request, we change the fact and the grade at the next run. If it does not, we reply with the filing that supports the page.
- We never change a fact because someone asks. We change it only because a filing says so.

### 4.10 Unfollow and data removal

- Every email has a one-click unfollow link and the `List-Unsubscribe` header.
- The manage page has "Unfollow all and delete my email". It deletes the follower row at once.

### 4.11 Data states

Every project page is in exactly one of these states.

| State | When | What the page shows |
| --- | --- | --- |
| Graded | At least 3 of the 6 inputs were readable in the last run | Grade, reasons, timeline, follow |
| Not enough filings | Fewer than 3 inputs readable | "Grade not available yet", the facts we have, no letter, `noindex` |
| Stale | The last good read is older than 14 days | Grade stays, with a banner "We could not read MahaRERA since 29 Sep 2026" |
| Lapsed | Registration validity has passed with no extension on file | Grade rule for lapse applies, status word "Registration lapsed" |
| Revoked | The portal lists revocation | Grade E, status word "Registration revoked" |
| Completed | The portal lists a completion or occupancy certificate | Grade shown as of completion, no follow button, timeline kept |
| Not found | No such number | Search page with the number filled in |

## 5. Information architecture and navigation

Top bar. Wordmark on the left, which links to `/`. A search icon on the right opens the same input as the landing page. There is no sign-in, no menu of settings and no avatar. On a screen of 900 pixels or more the top bar adds links "Districts" and "How grading works".

```
/                               search landing
/p/:state/:regno                project grade page
/p/:state/:regno/:slug          same page with a name in the URL (301 to the canonical)
/p/:state/:regno/timeline       filing timeline
/promoter/:state/:slug          promoter page
/d/:state/:district             district page
/rules                          current rule table and its change history
/rules/v1                       one version of the rule table
/follow/confirm                 confirm button for a follow
/follows/:token                 manage follows for one email
/correct/:regno                 correction request
/corrections                    public log of correction requests
/about                          who we are, what we do and do not do
/sitemap-:n.xml                 sitemap shards of at most 50,000 URLs
/og/:state/:regno.png           preview card for sharing
```

State codes are `mh` for Maharashtra, `hr` for Haryana, `up` for Uttar Pradesh and `dl` for Delhi. Every public route returns plain HTML that works without JavaScript. Follow, share and the search suggestions use small scripts.

Canonical rules.
- The canonical URL for a project is `/p/:state/:regno`. The same page at a slug URL answers with a redirect.

## 6. Feature spec and acceptance criteria

An agent with a browser and the Milestone 1 fixtures can test each line. Fixtures are stored raw pages and a fake portal that serves them.

**Search**
- SR-1. Typing `P52100000000` and pressing Enter loads `/p/mh/P52100000000` without a second keypress.
- SR-3. A name query returns at most 8 suggestions, each with project, promoter, district and grade letter.
- SR-4. A number not in the database shows the "We do not have this registration yet" line and stores the number once.

**Grade page**
- GP-1. The page shows exactly one grade letter, and the letter equals the grade stored for the latest run.
- GP-2. Each reason shows a filing name, a date and a link. A reason without all three never renders.
- GP-3. Every source link equals the URL stored with the raw object. The fixture check confirms that URL appears in the raw page.
- GP-4. The page shows at most five reasons. With six or more, the count of the rest shows.
- GP-6. A project with fewer than 3 readable inputs shows "Grade not available yet" and the `noindex` tag.
- GP-7. The banned-word list (Section 9) matches nothing in rendered text across the fixture set.

**Grader**
- GR-1. `grade(rules, filings, asOf)` is a pure function. Two calls with the same input return byte-identical output.
- GR-2. For every stored grade, replaying its stored filings under its stored rule version returns the same letter, points and reasons.
- GR-3. Adding a negative fact never raises the grade. A property test checks this over random fact sets.
- GR-5. A revoked registration returns E whatever the other points.
- GR-6. A lapsed registration returns at most D.

**Share**
- SH-1. The page has `og:title`, `og:description`, `og:image` and `og:url` tags with absolute URLs.
- SH-2. `og:image` returns a 1200 by 630 PNG in under 300 KB (proposed limit) with a cache header of at least one day.

**Follow**
- FL-2. A valid email sends one confirmation. A second request within 10 minutes sends none and shows the same message.
- FL-3. A GET on the confirm link does not activate the follow. Only the button does.
- FL-6. Unfollow from an email footer works with one click and shows "You no longer follow this project."

**Change emails**
- EM-1. A change seen in one run and gone in the next sends nothing.
- EM-2. A change seen in two consecutive runs sends exactly one email to each confirmed follower.
- EM-5. No email leaves outside 08:00 to 21:00 IST. A change confirmed at 23:00 waits for 08:00.
- EM-6. The quarterly email goes to every follower of an under-construction project 3 days after the state's QPR deadline (proposed), even when nothing changed.
- EM-8. Every email has an unfollow link and a `List-Unsubscribe` header.
- EM-10. An email body contains no word from the banned list and no recommendation verb ("should", "avoid", "wait").

**Timeline**
- TL-1. Events sit newest first, grouped by month.

**Corrections**
- CR-1. A submitted request shows on the project page as "A correction request is under review since [date]".
- CR-3. A request closes only with a note that cites a filing.

**Ingest**
- IN-1. One fetch job per state runs behind one interface. A fake state added in a test needs no change to the other code.
- IN-2. Every parsed filing points to a raw object by key and SHA-256.
- IN-4. A captcha page, a timeout or a maintenance page stores an unreadable marker and never a guess.
- IN-5. A page that parses to a field set with a required field missing is stored as unreadable and never compared.

## 7. The engine

### 7.1 Fetch, the first risk

Section 11 holds the access results and the options. In short, our servers outside India cannot reach MahaRERA, and the fetcher must run in India. Everything in this section assumes an India-located fetcher exists.

### 7.2 One fetch job per state

Interface, written once, implemented four times.

```
interface StateFetcher {
  state: "mh" | "hr" | "up" | "dl"
  listProjects(cursor): { regnos: string[], next: cursor | null }
  fetchProject(regno): RawBundle
}
RawBundle = { regno, files: [{ name, kind: "html" | "pdf", bytes, url }], fetchedAt, status }
```

- `listProjects` walks the state's public search, for example MahaRERA's home search with the Registered and Revoked toggle, district and completion-date filters. The check from India on 13 Oct 2026 saw all of these and a "View Projects on Map" action.
- `fetchProject` returns the raw pages for one project and never parses them.
- The job writes each raw file to R2 and returns a manifest. A Worker ingest endpoint records the manifest in D1.
- We do not solve CAPTCHA. A page with a CAPTCHA is unreadable, as IN-4 says (proposed rule, see Section 10).

### 7.3 Parser

- One parser per state and per page type. A parser is a pure function from raw bytes and parser version to a list of filings.
- A filing has a type, a date, a payload and a source URL. Types are `registration`, `qpr`, `extension`, `completion_date`, `complaint`, `order`, `progress` and `bank`.
- HTML parsers use a stock HTML library. PDF filings are stored and linked. The first version reads text from HTML tables only.
- A parser that sees an unknown layout returns `unreadable` with the reason and never a partial guess.

### 7.4 Grader

The grader is one function.

```
grade(rules: RuleTable, filings: Filing[], asOf: Date) -> Grade
Grade = { letter, points, reasons: Reason[], unread: Input[], clean: Input[] }
Reason = { ruleId, points, impact, title, detail, filingId, filingDate, sourceUrl }
```

Rules.
- The rule table is versioned JSON in the repo. A new version is a new file and never an edit.
- Every grade row stores its rule table version and an input hash.
- Replay is a command: pick a project and a version, load the stored filings and grade again. The output must match the stored grade.
- A rule table change needs a changelog line and a re-grade of every project. Changes show on `/rules`.

**Rule table v1, proposed.** Weights are a first guess and need review against real projects in Milestone 1 and against an advocate's reading before launch.

| Id | Input | Rule | Points off |
| --- | --- | --- | --- |
| R1 | QPR | Each missed quarterly report in the last 4 quarters (after the deadline, not filed) | 8, up to 24 |
| R2 | QPR | A notice issued for a missed report, once | 2 |
| R3 | QPR | Each report filed after the deadline in the last 4 quarters | 3, up to 9 |
| R4 | Dates | Completion date later than the original filed date by 1 to 6 months | 3 |
| R5 | Dates | By 7 to 12 months | 8 |
| R6 | Dates | By 13 to 24 months | 14 |
| R7 | Dates | By more than 24 months | 22 |
| R8 | Extensions | Each extension granted | 3, up to 6 |
| R9 | Complaints | 1 to 2 complaints against the project in the last 24 months | 2 |
| R10 | Complaints | 3 to 5 complaints | 5 |
| R11 | Complaints | 6 or more | 9 |
| R12 | Orders | Each order against the project or its promoter in the last 24 months | 6, up to 18 |
| R13 | Progress | Reported percent complete did not rise between the last two filed reports | 4 |
| R14 | Registration | Registration lapsed (validity passed, no extension on file) | 25 and grade at most D |
| R15 | Registration | Registration revoked | Grade E |

Bands. A is 90 to 100. B is 75 to 89. C is 60 to 74. D is 40 to 59. E is 0 to 39.

Impact. 10 or more points is High. 5 to 9 is Medium. Under 5 is Low.

Notes on the rules.
- The bank account number is shown as a fact on the page, with the label "Bank account published" or "Bank account not published". It takes no points in v1, because we cannot tell from a filing whether it is wrong.
- Complaints count against the project. Orders count against the project or its promoter. A promoter-level order shows with the label "against the promoter".
- A rule that lacks data is skipped and the input is listed under "We could not read".
- A grade is withheld when fewer than 3 of the 6 inputs (QPR, registration, extensions, completion date, complaints and orders, progress) were readable.

**Worked example, using the sample project.**
- Completion moved from Dec 2025 to Jun 2027 is 18 months. R6 takes 14.
- One missed report takes 8 under R1 and a notice takes 2 under R2. Together 10.
- Two complaints take 2 under R9. One order takes 6 under R12. Together 8.
- One extension takes 3 under R8.
- The total taken off is 35. The grade is 100 minus 35, which is 65. That is a C.
- Before the 4 May 2026 notice, the total was 25, the score was 75 and the letter was B. That is why the page says "Down from B on 4 May 2026".
- The registration is active until 30 Jun 2027, so R14 and R15 do not apply. The reported percent rose from 55 to 61, so R13 does not apply.

The sample numbers are invented. The registration number on the sample screens, P52100000000, is fictional, and so is the promoter, Example Realty LLP. The screens carry a visible "Sample data" notice.

### 7.5 Change detection

- After each parse, the engine compares the new filing set to the stored one. A difference becomes a change candidate.
- A candidate has a kind, an old value, a new value and the run it was first seen in.
- A candidate seen in two consecutive runs becomes a confirmed change and enters the email queue.
- A candidate not seen in the second run is dropped and logged.

### 7.6 Page rendering and sharing assets

- A Worker renders each page from D1 rows. The page is HTML with inline CSS and no framework.
- The rendered HTML is cached for 6 hours (proposed) and purged when the project's grade, status or timeline changes.
- The preview image is built when a grade or top reason changes, using a stock SVG-to-PNG library, and stored in R2.

### 7.7 Email delivery

- Email goes through Cloudflare's email sending from a Worker. We do not use Resend.
- Cloudflare's current sending limits, pricing and delivery to Indian mail providers are unverified. Milestone 0 sends test messages to five inboxes: Gmail, Outlook, Yahoo, Zoho and one ISP address.

## 8. Design system

### 8.1 Direction and where it comes from

The owner called the earlier HTML screens generic. This time both screens start from eight real app screens from Mobbin. We downloaded each image in full resolution to `spec-assets/refs/`. `image-prompts.md` cites each Mobbin link. We took shape and behaviour from them and no brand colour, icon or copy.

| Reference | What we took | Where it shows |
| --- | --- | --- |
| Credit Karma score page | A large number or letter, "next update" line, a three-stat strip, a tinted "latest updates" band | Grade card, stat strip, "Read from MahaRERA" line |
| Rocket Money gauge, history and letter-graded factors | An arc gauge in a white card on a grey page, a history card and capital-letter section labels | Gauge, grade history, `label` style |
| One factors list | Factor rows with a status word on the right and the measured value under the name | Reason rows (name, evidence line, impact) |
| CRED score decreased | Impact cards that state the change in a sentence and carry an "impact" word with a dot | Reason cards, impact dots |
| Wise transaction updates | A vertical stepper with a timestamp and one bold final state | Timeline events |
| Better Stack incident timeline | A rail with small typed icons and right-aligned times, plus system events in a muted style | Timeline markers, muted nightly check |
| incident.io subscribed button and status stepper | A "Subscribed" button with a check, in the page header | "Following" button in the timeline header |
| Perplexity Patents | One large input, mode chips and a collapsible how-to card on an empty page | Search landing |

**Direction.** A clear, quiet public record. The page is a calm grey-white sheet and the one blue accent marks only what the reader can act on or what is current. The grade letter is large and plain. Every claim sits next to its source. Words carry meaning before colour does, so the page reads in greyscale.

**Principles.**
- **Source beside every claim.** A reason without a filing name, a date and a link does not render.
- **Words before colour.** Impact is a word and three dots. The grade is a letter. No red and green traffic lights.
- **One action per screen.** The grade page's action is Follow. The timeline page's action is Following. Share is secondary.

**Review test.** Turn colour off and the page must still say what the grade is and why. Count the filled accent buttons on a screen. The answer is one.

### 8.2 Type, colour, space

The face is Inter, with "Noto Sans Devanagari", "Nirmala UI" and "Kohinoor Devanagari" in the stack, so Marathi and Hindi names render. System fonts follow. Mono uses "JetBrains Mono" then "DejaVu Sans Mono" for registration numbers.

Type scale.
- Grade letter: 72/72 at 700
- Page title: 24/30 at 700, -0.02em
- Section title in a card: 16/22 at 600
- Body: 15/22
- Detail: 14/21
- Small: 13/20
- Label: 12/16 at 600, +0.08em, upper case
- Mono: 13/20

Colour tokens, light theme.
- canvas `#f5f4ef`, surface `#ffffff`
- ink `#15171c` (about 17 to 1 on canvas)
- ink-2 `#565b66` for all secondary text (about 6.4 to 1)
- ink-3 `#8b909b` for decoration and borders only, because it fails text contrast
- line `#e4e2da`, line-soft `#eeece6`, chip `#eeede7`
- accent `#1d4ed8` with white text (about 6.7 to 1), accent wash `#e8eefc`

Contrast ratios are our estimates from the hex values and need a tool check in Milestone 1.

The accent is the only hue. It marks the current gauge segment, the primary button, links, impact dots, the "Following" state and the "Emailed to followers" tag. The missed-report marker uses ink, not red.


Space and shape.
- Base 8 pixels with a 4 pixel half step: 4, 8, 12, 16, 24, 32, 48
- Radius: 12 for inputs and chips, 14 for the email preview, 20 for cards, pill for buttons
- Page width: full width on a phone, 1120 pixels maximum on desktop, with a 380 pixel left column and a flexible right column from 900 pixels

Layout.
- Phone first, 390 pixels wide. Cards stack in one column.
- From 900 pixels the grade card sticks on the left and the reasons sit in two columns on the right.
- The follow dock sticks to the bottom on a phone and floats at the lower right on desktop.

### 8.3 Components and states

- **Gauge.** Five arcs, E to A. States: graded, withheld. A withheld gauge shows five grey arcs and "Not available yet". The `svg` has `role="img"` and an `aria-label` of "Grade C on a scale from E to A".
- **Reason card.** Icon, title, detail, impact row, source row. States: default, expanded. Expanded shows the stored filing excerpt (a short text from the raw page).
- **Grade history strip.** Six cells with a letter and a month. Current-grade cells use the accent wash.
- **Follow button.** States: default, sheet open, pending confirmation, following. Following shows a check and the word "Following".
- **Follow sheet.** One email field, one button, one line of promise. Errors show under the field.
- **Timeline event.** Marker, date line, title, detail, source. Variants: filed, missed, order, date change, nightly check.
- **Emailed tag.** A small pill on an event that caused an email.
- **Email preview.** A bordered box in the follower's card that mirrors the real email.
- **Search input.** One large input, suggestions list, mode chips. States: empty, typing, no match.

### 8.4 Motion, icons, access

- Icons are outline, 1.7 to 2.2 stroke, 16 to 22 pixels, inline `svg`. They always sit beside a word.

## 9. Copy and voice guide

The voice is a careful clerk. It says what a filing says and when. It never says what a filing means for the builder's character.

Words we use: filed, not filed, missed, notice, order, extension, granted, moved, lapsed, revoked, complaint.

Words we never use: scam, fraud, cheat, unsafe, risky, avoid, blacklist, defaulter, bad builder, good builder, illegal, "you should", "we recommend". A build test fails on a match (GP-7, EM-10).

Grade words: Strong record, Good record, Mixed record, Weak record, Poor record.

Standard lines.
- Under every grade: "A grade summarises filings. It is not advice on whether to buy or pay."
- Follow promise: "One email when the record changes. One email each quarter. Nothing else."
- Correction: "A fact is wrong? Send the filing that shows it."

Email subject patterns.
- Change: "[Project]: [what changed]". Example: "Aarohi Greens, Phase 2: extension granted".
- Grade change: "[Project]: grade is now C, down from B".
- Quarterly: "[Project]: quarterly report filed" or "[Project]: quarterly report not filed".

Rules.
- Plain words. Short sentences. No semicolons, no em dashes.
- No Hindi or Marathi interface text in v1. That is a candidate for a later milestone (Section 15).

## 10. Trust, privacy, legal

**Public-record posture.** Every fact comes from a page the state shows to anyone. We read it, store it with its date and show it with a link. We do not scrape behind a login.

**Defamation posture.** Not legal advice.
- Only cited filings and arithmetic over them appear on a page.
- The rule table is public and the same for every project.
- A builder can see exactly why a grade is what it is, and can send the filing that corrects it.
- An advocate reviews the copy, the rule table and the correction process before public launch. That review is a gate in Milestone 5.
- MahaRERA's own pause (Section 1) concerned its power as a regulator. It does not decide whether a private site may summarise public filings. We have no legal source on that and flag it as unverified.

**Fetching posture.**
- One request stream per portal, at least 5 seconds apart (proposed).
- We identify the fetcher with a plain user agent string and a contact address.
- We read `robots.txt` and the terms of every portal. We have not read any state's terms. MahaRERA's site did not respond from outside India on 13 Oct 2026, so those terms are unverified. Reading them is a gate in Milestone 0.
- Bihar RERA allows reproduction only with permission ([copyright page](https://rera.bihar.gov.in/Copyright.aspx)). Bihar is not in scope.
- We do not solve CAPTCHA or bypass a block. A block marks the page unreadable and the fetcher backs off (proposed).
- We never use a paid residential proxy unless the owner approves it (Section 11).

**Personal data.**
- We store an email address, the projects it follows, the consent time and a hashed IP for abuse limits.
- India's data protection law probably applies to the email list (reasoning, no source fetched). Get advice before launch.

**Disclaimer, on every grade page.** "RERA Report Card summarises public filings from state RERA websites. It is not legal, financial or investment advice. A grade is a summary of filings and says nothing about any person. Read the source before you decide."

**Independence.** The grade function has no input for money, advertising or relationships. Brokers and promoters cannot pay to change, hide or highlight a grade. The code makes this checkable, and the rule table says so.

## 11. Technical architecture

### 11.1 The first risk: ingestion

The data lives on state portals. Three of the four we need do not answer from our servers outside India or from Cloudflare. We proved this on 13 Oct 2026.

| Source | From | Result |
| --- | --- | --- |
| maharera.maharashtra.gov.in | our server outside India | The name resolves, then the connection times out after 15 seconds |
| maharera.maharashtra.gov.in | Cloudflare Workers, two European edge locations | Times out |
| Delhi RERA | Cloudflare Workers | Times out |
| rera.mohua.gov.in | Cloudflare Workers | Times out |
| haryanarera.gov.in | Cloudflare Workers | Loads, HTTP 200 |
| up-rera.in/projects | Cloudflare Workers | Redirects to a maintenance page |
| maharera.maharashtra.gov.in | A machine in India | Loads. No CAPTCHA on the home search form. The form has a Registered or Revoked toggle and searches by name, registration number, pincode, completion date and district. It has "View Projects on Map" |

What this means.
- Maharashtra and Delhi need a fetcher inside India.
- Haryana loads from Cloudflare, so it is the cheapest state to start with.
- A cloud address in India is untested too. A home connection loaded the page, and a data centre address may be treated differently (reasoning).
- GitHub-hosted runners are untested at the time of writing. They probably fail like our servers outside India (reasoning).

**Options for an India-located fetcher.**

| Option | Cost | Trade-off |
| --- | --- | --- |
| (a) Small Indian cloud VM as a GitHub self-hosted runner. DigitalOcean Bangalore or AWS Mumbai | About USD 4 to 6 a month | Always on and a stable address. Needs updates and a locked-down runner. Data centre addresses may still be blocked |
| (a2) Oracle Cloud always-free VM in Mumbai | USD 0, with card verification | Free. Needs a verification card and an account step. Reports say idle free instances can be reclaimed (unverified here) |
| (b) Exit node on a machine in India | USD 0 | Proven to load the portal. Works only while that machine is awake and online. Not a service |
| (c) GitHub-hosted runners | USD 0 within plan limits | Untested. Probably blocked like our servers outside India |
| (d) Paid residential proxy | Per GB, price not fetched | Rejected unless (a) fails. Adds a third party and a policy risk |

**Recommendation: (a), on DigitalOcean Bangalore, tested first for one day.** A droplet billed by the hour costs cents to test, and the test is the cheapest way to learn whether MahaRERA answers a data-centre address. Use (b) as a one-off route for the very first manual proof and for fixtures. Do not run the product on (b). Pick Oracle (a2) only if the monthly cost matters more than the account steps. This is the owner's decision because it spends money (Section 15).

Everything else runs on our own servers or on Cloudflare as usual.

### 11.2 Architecture

| Layer | Choice | Why |
| --- | --- | --- |
| India fetcher | One VM in India with a self-hosted GitHub runner, private repo only. Scheduled workflow runs one fetch job per state. Uploads raw files through a signed Worker endpoint | Only part that must be in India |
| Raw storage | Cloudflare R2. Keys `raw/{state}/{regno}/{date}/{name}` with SHA-256 | Provenance. Any grade can be replayed from stored filings |
| Parse and grade | TypeScript package of pure functions. Runs in a Worker queue consumer on new raw objects. Also runs in CI and on our own servers for replay | One code path in production and in tests |
| Database | Cloudflare D1 | See below |
| Public site | Cloudflare Workers rendering HTML. Cache API for pages. Static assets for CSS | Edge reads for search traffic. No server to run |
| Preview images | SVG to PNG in a Worker when the grade changes. Stored in R2 | WhatsApp reads a ready image |
| Email | Cloudflare email sending from a Worker. Never Resend | House default. Test delivery in Milestone 0 |
| Jobs | Cron Triggers and Queues | Stock tools |
| Backfill and replay | a server outside India, using the R2 S3 API | Heavy work stays off the edge |
| Tests | Unit and property tests in CI. Playwright against the fake portal. One real run per milestone | See 11.5 |

**Database choice: D1 over Postgres on our own server.**
- The public pages are read at the edge by Workers. D1 sits next to them. A Postgres on the our server outside India adds a network hop per page and a single machine to keep up.
- The rows are small. Raw pages go to R2, so D1 holds parsed filings and grades only.
- Replay does not need Postgres features. SQLite's dialect is enough.
- The cost is D1's size and write limits, which we have not fetched and must check in Milestone 0. Exit: D1 exports to SQL and moves to Postgres without a schema change. We keep the SQL plain for that reason.

Agent-agnostic machinery. Every job is a script with a command line, a test and a log. No job depends on one coding agent's session, skill or hook.

### 11.3 Data model

Ids are ULIDs. Times are UTC integers. Public tables are readable by the site. Private tables are readable only by the Worker.

- `state_source` (state, base_url, fetcher_version, terms_url, terms_checked_on). Public
- `promoter` (id, state, name, slug). Public
- `project` (id, state, regno unique, name, promoter, district, locality, status, first_seen, last_read_at). Public
- `fetch_run` (id, state, started_at, finished_at, ok_count, fail_count, runner_id). Server
- `raw_object` (id, project, run, r2_key, sha256, kind, source_url, fetched_at, http_status, normalised_sha). Public metadata, private bytes
- `filing` (id, project, raw_object, type, effective_date, payload_json, source_url, parser_version). Public
- `rule_table` (version, json, published_at, changelog). Public
- `grade` (id, project, rules_version, letter, points, as_of, input_hash, computed_at). Public
- `grade_reason` (grade, rank, rule_id, points, impact, title, detail, filing, filing_date, source_url). Public
- `grade_unread` (grade, input, reason). Public
- `change_candidate` (id, project, kind, old, new, first_seen_run, state). Server
- `change_event` (id, candidate, project, kind, old, new, filing, confirmed_at). Public
- `follower` (id, email_hash, email_enc, verified_at, consent_at, unsub_token_hash). Server
- `follow` (id, follower, project, created_at, last_emailed_at, state). Server
- `email_send` (id, follow, template, change_events, sent_at, attempts, status, bounce). Server
- `correction_request` (id, project, fact, evidence_url, contact_hash, opened_at, closed_at, outcome_note). Public view without contact
- `share_count` (project, day, source, count). Public aggregate
- `event` (name, at, project, source). Server, no personal data

Access. The site reads public tables with a read-only binding. Writes go through one Worker. Follower rows are never exposed. Email addresses are encrypted at rest and compared by hash.

### 11.4 Routes and APIs

Public pages are in Section 5. API routes, JSON:
- `GET /api/search?q=`
- `GET /api/projects/:state/:regno`
- `GET /api/projects/:state/:regno/timeline`
- `POST /api/follow` with email and project
- `POST /api/follow/confirm` with token
- `POST /api/follow/unfollow` with token and project
- `POST /api/follows/delete` with token
- `POST /api/corrections`
- `POST /api/ingest/manifest`, signed, from the fetcher only
- `GET /api/rules/:version`

Rate limits: search 60 a minute per address, follow 5 an hour per address, corrections 3 a day per address.

### 11.5 Tests

- Parser unit tests on stored raw pages for each state, three or more per page type.
- Grader tests: examples from the rule table, the replay test (GR-2) and the monotonic property test (GR-3).
- Banned-word test over rendered text and email text.
- Playwright against a fake portal that serves stored pages, including a CAPTCHA page, a timeout and a maintenance page.
- Overflow test at 390 and 1440 pixels on the three page types.
- CI runs all of the above on every change.
- One real run per milestone. The India fetcher reads three real projects per state, and the result is parsed, graded and shown. The proof is the log and the page.

### 11.6 Cost

Prices of Cloudflare services and the email product were not fetched. They appear as units.

- The fetcher VM costs about USD 4 to 6 a month, or nothing on Oracle.
- The grade path uses no language model, so it has no per-page model cost.
- Raw storage is about 150 KB a page, kept only when content changes. At 40,000 projects that is about 6 GB for the first snapshot (estimate, project count not sourced).
- A fetch stream at one request per 5 seconds reads 17,280 pages a day. Followed projects are read nightly and the rest every 14 days, about 2,900 pages a day at 40,000 projects (estimate).

## 12. Operations

**Target metrics.** Exactly three, all proposed. Revisit after 30 days of real traffic.
- *Output:* 2,000 confirmed followers within 90 days of public launch.
- *Input 1:* 90% of under-construction projects in Maharashtra and NCR have a readable grade.
- *Input 2:* 5 or more share taps per 100 grade-page views.

**Monitoring.** One channel, an email to the owner, with a daily summary even when all is green. Thresholds are proposed.
- Fetch success under 90% of a run
- Unreadable parses over 5% of a run
- A state with no good read for 3 days
- Oldest queued job over 30 minutes
- Email bounces over 3%
- Banned-word or replay test failing in CI

**Support.** One address in every footer, and a first reply to corrections within 2 working days (proposed).

**Abuse.**

## 13. Milestones

No dates. Each milestone names its demo and a done condition.

**0. Reach the portals.** Status: not started.
- *Done when:* The owner decides the fetcher (Section 15). One real MahaRERA project and one Haryana project load through it. Each state's terms are read and recorded. A field map shows which of the six inputs each state publishes. Test emails reach five inboxes. D1 limits are read.
- *Demo:* run the fetch from the India runner and show the raw files in R2.

**1. Grade one state, end to end.** Status: not started.
- *Done when:* MahaRERA ingestion, parser and grader work for 200 Pune projects. Replay passes. The rule table v1 is reviewed against 20 real projects by hand. The grade page and timeline render. Ten buyer interviews are logged.
- *Demo:* open a real project, read its grade, open each source link and replay the grade from stored filings.

**2. Follow and email.** Status: not started.
- *Done when:* double opt-in, change emails, the quarterly email and unfollow pass the EM checks on fixtures and once on a real project.
- *Demo:* follow a project, replay two stored snapshots with a moved date, show that no email goes after run 1 and one goes after run 2.

**3. NCR states.** Status: not started.
- *Done when:* Haryana (Gurugram and Panchkula) works first because it loads from Cloudflare. Delhi and UP RERA follow as the portals allow. Each state passes IN-1 to IN-5 and has one real run.
- *Demo:* one project per state with a grade.

**4. Pages at scale and sharing.** Status: not started.
- *Done when:* project, promoter and district pages, sitemaps, the preview image and the share text work. A real WhatsApp preview shows for three pages. Search Console shows the sitemaps accepted.
- *Demo:* forward a page on WhatsApp and show the card.

**5. Launch gate.** Status: not started.
- *Done when:* an advocate has reviewed copy, rule table and corrections. A data protection check is done. The dark-launch run shows fewer than 2 wrong facts in 100 sampled reasons.
- *Demo:* public URL live and the correction log open.

## 14. Risks and kill criteria

Ratings are reasoning.

- **No India route works** (medium, high). Test in Milestone 0. If (a) and (b) both fail and (d) is rejected, stop or pivot to the manual flow of user-pasted pages.
- **Portal terms forbid automated reading** (unknown, high). Read them in Milestone 0. If forbidden, ask for written permission or drop the state.
- **A defamation claim** (medium, high). Cited facts only, a public rule table and a correction path. If an advocate rejects the wording, no launch until fixed.
- **A wrong fact on a page** (medium, high). Parser tests and a two-run rule for emails. More than 2 wrong facts in 100 sampled reasons pauses publishing.
- **Thin pages hurt search** (medium, medium). Pages with fewer than 3 readable inputs are `noindex`. If indexing stays under 30% of submitted pages after 8 weeks, change the page mix.
- **reratracker adds a Trust Score** (medium, medium). Our edge is cited sources, history and the follow loop. If they ship first with public scores in NCR, we lead with Maharashtra.
- **Email lands in spam** (medium, high). Test in Milestone 0. If inbox placement is under 80% in the five-inbox test, add a second channel.
- **Buyers do not come back** (high, medium). Quarterly email and share loop. If under 20% of followers open a quarterly email, rethink retention.
- **One owner and no on-call** (certain, medium). Daily summary and breakers. Pause fetching if the summary is red and the owner is away.

## 15. Open decisions

| Decision | Options and next step | Owner and date |
| --- | --- | --- |
| India fetcher choice (money) | (a) Indian VM runner, (a2) Oracle free, (b) India machine exit node, (c) GitHub runners, (d) residential proxy. Recommended (a) on DigitalOcean Bangalore with a one-day test. Next: approve about USD 4 to 6 a month | Owner, 2026-10-20 |
| Brand name | RERA Report Card (working), Flatcheck, Nigrani, Allottee Desk, plus two new ones: Sthiti (Hindi and Marathi for status) and Tapasni (Marathi for inspection). Next: check domain and trademark for each | Owner, 2026-10-26 |
| Promoter-level grades in v1 | Recommend no. A promoter grade needs rules for joint ventures, shell entities and old projects, which a project grade avoids. It also raises the defamation risk the most, because it speaks about a company and not a filing. Show promoter pages with lists of cited orders only. Next: revisit after Milestone 5 with real data | Owner, 2026-11-09 |
| Sample registration number | Done. The design screens use the fictional number P52100000000 and the promoter Example Realty LLP. Next: none | Closed, 2026-10-13 |
| Wording reviewer | One advocate for copy, rule table and corrections. Next: name a person | Owner, 2026-11-09 |
| Rule table weights | v1 is a first guess. Next: review against 20 real projects in Milestone 1 | Owner, after Milestone 1 |
| Interface language | English only in v1. Marathi and Hindi pages are a later option. Next: check demand in interviews | Owner, 2026-12-14 |
| Monetization | Out of scope for this plan. No evidence on willingness to pay | Owner, no date |

## Appendix A: verification record

- *Outlook Money, 4 May 2026:* fetched on 13 Oct 2026. Confirms 8,212 projects, 20 Apr 2026 deadline, 60-day reply window and a listed penalty of Rs 50,000.
- *propnewstime, MahaRERA grading halted:* fetched on 13 Oct 2026. Confirms the pause reported on 6 Nov 2024 and the reasons.
- *Square Yards page of one Pune project:* fetched on 13 Oct 2026. Shows 21% progress, the bank name and IFSC, and original and revised dates that match. It shows no lapse, missed report, complaint or extension fields.
- *Punekar News (10,773 and 5,324):* HTTP 403 on 13 Oct 2026. **Unverified here.**
- *Housing.com (628 projects, QR code):* HTTP 406 on 13 Oct 2026. **Unverified here.**
- *Complaints 3,743 and 5,267, agents 50,673 and 31,980, ANAROCK 32%, CREDAI-MCHI about 60%, Dubai 411,608:* taken from the brief. **Source pages not fetched.**
- *Portal access results:* tested by us on 13 Oct 2026, as listed in Section 11.1.
- *Contrast ratios in Section 8:* estimates. A tool check is part of Milestone 1.
- *Cloudflare email sending, D1 limits and prices:* **unverified.** Milestone 0 reads them.
