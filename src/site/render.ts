import type { Grade, InputName, Letter, Reason } from "../grade";
import type { ProjectStatus, StateCode } from "../ingest/types";

export const BRAND = "RERA Report Card";

export const STATE_NAMES: Record<StateCode, string> = {
  mh: "Maharashtra",
  hr: "Haryana",
  dl: "Delhi",
  up: "Uttar Pradesh",
};

const GRADE_WORDS: Record<Letter, string> = {
  A: "Strong record",
  B: "Good record",
  C: "Mixed record",
  D: "Weak record",
  E: "Poor record",
};

const STATUS_WORDS: Record<ProjectStatus, string | null> = {
  under_construction: "Under construction",
  lapsed: "Registration lapsed",
  revoked: "Registration revoked",
  completed: "Completed",
  unknown: null,
};

const CLEAN_WORDS: Record<InputName, string> = {
  qpr: "Quarterly reports filed on time in the last 4 quarters",
  registration: "Registration not lapsed and not revoked",
  extensions: "No extension on file",
  completion_date: "Completion date not moved",
  complaints_orders: "No complaints or orders in the last 24 months",
  progress: "Reported progress rose between the last two reports",
};

const INPUT_WORDS: Record<InputName, string> = {
  qpr: "Quarterly reports",
  registration: "Registration",
  extensions: "Extensions",
  completion_date: "Completion date",
  complaints_orders: "Complaints and orders",
  progress: "Construction progress",
};

export const DISCLAIMER =
  `${BRAND} summarises public filings from state RERA websites. It is not legal, financial or investment advice. ` +
  "A grade is a summary of filings and says nothing about any person. Read the source before you decide.";
export const GRADE_NOTE = "A grade summarises filings. It is not advice on whether to buy or pay.";
export const FOLLOW_PROMISE = "One email when the record changes. One email each quarter. Nothing else.";

export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function day(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function istTime(unix: number): string {
  const t = new Date((unix + 5.5 * 3600) * 1000);
  const hh = String(t.getUTCHours()).padStart(2, "0");
  const mm = String(t.getUTCMinutes()).padStart(2, "0");
  return `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]} ${t.getUTCFullYear()}, ${hh}:${mm} IST`;
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const svg = (path: string, size = 20, stroke = 1.7) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

const ICONS: Record<InputName | "check" | "info" | "bell" | "share" | "search", string> = {
  qpr: '<path d="M12 3.5l9 16H3l9-16z"/><path d="M12 10v4.5M12 17.2v.01"/>',
  completion_date: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  complaints_orders: '<path d="M14 3.5H7a2 2 0 00-2 2v13a2 2 0 002 2h10a2 2 0 002-2V8.5l-5-5z"/><path d="M14 3.5v5h5M9 13h6M9 16.5h4"/>',
  extensions: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  progress: '<path d="M4 19h16M7 16V11M12 16V7M17 16v-3"/>',
  registration: '<path d="M7 3.5h10a1.5 1.5 0 011.5 1.5v15l-6.5-3.5L5.5 20V5A1.5 1.5 0 017 3.5z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15l1.5-2zM10 21h4"/>',
  share: '<path d="M12 15V4M8 8l4-4 4 4M5 13v5.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V13"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
};

const ARCS: Record<Letter, string> = {
  E: "M26.0 126.8 A104 104 0 0 1 44.0 71.5",
  D: "M47.8 66.3 A104 104 0 0 1 94.9 32.1",
  C: "M100.9 30.2 A104 104 0 0 1 159.1 30.2",
  B: "M165.1 32.1 A104 104 0 0 1 212.2 66.3",
  A: "M216.0 71.5 A104 104 0 0 1 234.0 126.8",
};
const LABELS: [Letter, number, number][] = [
  ["E", 10.2, 99],
  ["D", 55.9, 36],
  ["C", 130, 12],
  ["B", 204.1, 36],
  ["A", 249.8, 99],
];

export function gauge(letter: Letter | null): string {
  const label = letter ? `Grade ${letter} on a scale from E to A` : "Grade not available yet";
  const arcs = (Object.keys(ARCS) as Letter[])
    .map((l) => `<path stroke="${l === letter ? "var(--accent)" : "var(--line)"}" d="${ARCS[l]}"/>`)
    .join("");
  const labels = LABELS.map(
    ([l, x, y]) => `<text x="${x}" y="${y}"${l === letter ? ' fill="var(--accent)"' : ""}>${l}</text>`,
  ).join("");
  return (
    `<svg viewBox="0 0 260 150" role="img" aria-label="${label}">` +
    `<g fill="none" stroke-width="14" stroke-linecap="round">${arcs}</g>` +
    `<g font-size="12" font-weight="600" fill="var(--ink-2)" text-anchor="middle">${labels}</g></svg>`
  );
}

const CSS = `
:root{--canvas:#f5f4ef;--surface:#fff;--ink:#15171c;--ink-2:#565b66;--ink-3:#8b909b;--line:#e4e2da;--line-soft:#eeece6;--chip:#eeede7;--accent:#1d4ed8;--accent-ink:#fff;--accent-wash:#e8eefc}
@media (prefers-color-scheme:dark){:root{--canvas:#111318;--surface:#1a1d24;--ink:#eceae4;--ink-2:#a9adb6;--ink-3:#6b707a;--line:#2c3039;--line-soft:#242832;--chip:#242832;--accent:#7aa2ff;--accent-ink:#0b1020;--accent-wash:#1c2a4d}}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{background:var(--canvas);color:var(--ink);font-family:"Inter","Noto Sans Devanagari","Nirmala UI","Kohinoor Devanagari",system-ui,-apple-system,"Segoe UI",sans-serif;font-size:15px;line-height:22px;-webkit-font-smoothing:antialiased;overflow-wrap:anywhere}
svg{display:block;flex:none}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px;border-radius:6px}
.mono{font-family:"JetBrains Mono","DejaVu Sans Mono",ui-monospace,monospace;font-size:13px;line-height:20px}
.label{font-size:12px;line-height:16px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2)}
.small{font-size:13px;line-height:20px;color:var(--ink-2)}
.ink2{color:var(--ink-2)}
.skip{position:absolute;left:-999px}.skip:focus{left:16px;top:8px;z-index:9;background:var(--surface);padding:8px 12px}
.top{height:56px;background:var(--surface);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:16px;letter-spacing:-.01em;color:var(--ink)}
.mark{width:28px;height:28px;border-radius:8px;background:var(--accent);color:var(--accent-ink);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px}
.iconbtn{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--ink)}
.page{width:100%;max-width:1120px;margin:0 auto;padding:12px 16px 112px}
.note{display:flex;gap:8px;align-items:flex-start;background:var(--chip);border-radius:12px;padding:10px 12px;font-size:13px;line-height:18px;color:var(--ink-2)}
.note b{color:var(--ink)}
.card{background:var(--surface);border:1px solid var(--line-soft);border-radius:20px;box-shadow:0 1px 2px rgba(21,23,28,.04)}
h1{font-size:24px;line-height:30px;font-weight:700;letter-spacing:-.02em}
h2.label{margin:28px 4px 10px}
.pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;background:var(--chip);color:var(--ink);font-size:13px;line-height:16px;font-weight:600;padding:6px 12px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:600;font-size:15px;padding:0 20px;cursor:pointer;text-decoration:none}
.btn:hover{text-decoration:none}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.btn svg{width:20px;height:20px}
.src{font-size:12px;line-height:16px;color:var(--ink-2)}.src a{font-weight:600}
.head{padding:16px 4px 12px}.head h1{margin:2px 0 4px}
.grade{padding:20px 20px 16px;margin-top:4px;text-align:center}.grade .label{text-align:left}
.gauge{position:relative;width:260px;height:150px;margin:6px auto 0}.gauge svg{width:260px;height:150px}
.gcenter{position:absolute;left:0;right:0;top:56px;display:flex;flex-direction:column;align-items:center}
.letter{font-size:72px;line-height:72px;font-weight:700;letter-spacing:-.04em}
.letter.none{font-size:20px;line-height:72px;color:var(--ink-2);font-weight:600;letter-spacing:0}
.gword{font-size:15px;line-height:20px;font-weight:600;margin-top:2px}
.center{text-align:center;margin-top:10px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:16px;padding-top:14px;border-top:1px solid var(--line-soft)}
.stats div{padding:0 4px}.stats div+div{border-left:1px solid var(--line-soft)}
.stats dt{font-size:20px;line-height:26px;font-weight:700}.stats dd{font-size:12px;line-height:16px;color:var(--ink-2)}
.head2{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.head2 .asof{text-transform:none;letter-spacing:0;font-weight:500;font-size:12px}
.summary{margin:8px 0 0;font-size:14px;line-height:21px;color:var(--ink-2)}
.reasons{list-style:none;display:grid;gap:10px}
.reason{padding:16px}
.r-top{display:flex;gap:12px}
.ic{flex:none;width:36px;height:36px;border-radius:50%;background:var(--accent-wash);color:var(--accent);display:flex;align-items:center;justify-content:center}
.rt{font-size:16px;line-height:22px;font-weight:600}
.rd{font-size:14px;line-height:21px;color:var(--ink-2);margin-top:4px}
.r-bot{display:flex;flex-direction:column;gap:8px;align-items:flex-start;margin-top:12px;padding-top:12px;border-top:1px solid var(--line-soft)}
.imp{order:-1;display:flex;align-items:center;gap:8px;font-size:13px;line-height:16px;font-weight:600;white-space:nowrap}
.dots{display:flex;gap:3px}.dots i{width:8px;height:8px;border-radius:50%;background:var(--line);display:block}.dots i.on{background:var(--accent)}
.more{margin-top:10px}.more summary{cursor:pointer;padding:8px 4px;font-weight:600;color:var(--accent)}.more .reasons{margin-top:10px}
.list{margin-top:10px;padding:16px}.list ul{list-style:none;margin-top:8px}
.list li{display:flex;gap:10px;align-items:flex-start;padding:8px 0;font-size:14px;line-height:20px}
.list li+li{border-top:1px solid var(--line-soft)}.list li svg{color:var(--accent);margin-top:1px}
.list.unread li svg{color:var(--ink-2)}
.how{padding:16px;display:grid;gap:10px}
.dock{position:sticky;bottom:0;z-index:5;display:flex;gap:8px;align-items:flex-end;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--canvas) 94%,transparent);border-top:1px solid var(--line)}
.dock>.follow{flex:1}
.follow summary{list-style:none;width:100%}.follow[open] summary.btn.primary{background:var(--surface);border-color:var(--line);color:var(--ink)}.follow summary::-webkit-details-marker{display:none}
.sheet{position:absolute;left:16px;right:16px;bottom:calc(100% + 8px);padding:16px;display:grid;gap:10px;box-shadow:0 8px 24px rgba(21,23,28,.12)}
.sheet label{font-weight:600}
.sheet input[type=email]{min-height:48px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;padding:0 14px;width:100%}
.hp{position:absolute;left:-9999px}
.msg{max-width:560px;margin:48px auto;padding:24px;display:grid;gap:14px}
.manage li{display:flex;justify-content:space-between;align-items:center;gap:12px}
footer.foot{max-width:1120px;margin:0 auto;padding:0 20px 32px;font-size:12px;line-height:18px;color:var(--ink-2)}
@media (min-width:900px){
.page{padding:24px 32px 96px}
.layout{display:grid;grid-template-columns:380px minmax(0,1fr);gap:32px;align-items:start}
.col-a{position:sticky;top:16px}
.col-b>.head2:first-child{margin-top:6px}
.reasons{grid-template-columns:1fr 1fr}
.dock{position:fixed;right:32px;bottom:24px;background:none;border:0;padding:0;width:auto;flex-direction:row-reverse}
.dock .sheet{left:auto;right:0;width:360px}
.dock>.follow{position:relative;flex:none}
}
@media (prefers-reduced-motion:no-preference){.btn{transition:transform .12s ease}.btn:active{transform:scale(.98)}}
`;

export interface Meta {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: unknown[];
}

export function layout(meta: Meta, body: string, nonce: string): string {
  const ld = (meta.jsonLd ?? [])
    .map((o) => `<script type="application/ld+json" nonce="${esc(nonce)}">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`)
    .join("");
  const img = meta.image
    ? `<meta property="og:image" content="${esc(meta.image)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:image" content="${esc(meta.image)}">`
    : "";
  return `<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${esc(meta.canonical)}">
${meta.noindex ? '<meta name="robots" content="noindex">' : ""}
<meta name="theme-color" content="#f5f4ef">
<meta property="og:type" content="website"><meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${esc(meta.canonical)}"><meta name="twitter:card" content="summary_large_image">
${img}${ld}
<style nonce="${esc(nonce)}">${CSS}</style></head><body>
<a class="skip" href="#main">Skip to content</a>
<header class="top"><a class="brand" href="/"><span class="mark" aria-hidden="true">R</span>${BRAND}</a>
<a class="iconbtn" href="/" aria-label="Search projects">${svg(ICONS.search, 22, 1.8)}</a></header>
${body}
<footer class="foot"><p>${esc(DISCLAIMER)}</p></footer>
</body></html>`;
}

export interface ProjectView {
  origin: string;
  state: StateCode;
  slug: string;
  regno: string;
  name: string;
  promoter: string;
  district: string;
  locality: string;
  status: ProjectStatus;
  sourceName: string;
  sourceUrl: string;
  readAt: number | null;
  grade: Grade | null;
  filingsRead: number;
  ruleInputs: Record<string, InputName>;
  sample?: boolean;
  followState?: "sent" | "invalid" | "limited" | null;
}

export function pageUrl(v: Pick<ProjectView, "origin" | "state" | "slug">): string {
  return `${v.origin}/p/${v.state}/${v.slug}`;
}

export function sortedReasons(g: Grade): Reason[] {
  return g.reasons
    .filter((r) => /^https?:\/\//.test(r.sourceUrl))
    .slice()
    .sort((a, b) => b.points - a.points || (a.filingDate < b.filingDate ? 1 : a.filingDate > b.filingDate ? -1 : 0));
}

export function shareLine(v: ProjectView): string {
  const g = v.grade;
  if (!g || g.letter === null) return `${v.name}: grade not available yet.`;
  const top = sortedReasons(g)[0];
  return top ? `${v.name}: grade ${g.letter}. ${top.title}, ${day(top.filingDate)}.` : `${v.name}: grade ${g.letter}. No reasons lowered the grade.`;
}

function reasonCard(r: Reason, input: InputName | undefined): string {
  const dots = { High: 3, Medium: 2, Low: 1 }[r.impact];
  return `<li class="card reason">
<div class="r-top"><span class="ic">${svg(ICONS[input ?? "registration"])}</span>
<div><p class="rt">${esc(r.title)}</p><p class="rd">${esc(r.detail)}</p></div></div>
<div class="r-bot"><p class="src">${esc(input ? INPUT_WORDS[input] : "Filing")} record, ${esc(day(r.filingDate))}<br><a href="${esc(r.sourceUrl)}" rel="nofollow noopener" target="_blank">${esc(domainOf(r.sourceUrl))}</a></p>
<p class="imp"><span class="dots" aria-hidden="true">${[1, 2, 3].map((i) => `<i${i <= dots ? ' class="on"' : ""}></i>`).join("")}</span>${esc(r.impact)} impact</p></div></li>`;
}

function followDock(v: ProjectView, nonce: string): string {
  const url = `${pageUrl(v)}?s=wa`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${shareLine(v)} ${url}`)}`;
  const share = `<a class="btn" id="share" href="${esc(wa)}" target="_blank" rel="noopener">${svg(ICONS.share)}Share</a>`;
  if (v.status === "completed") return `<div class="dock">${share}</div>`;
  const state = v.followState;
  const status =
    state === "sent"
      ? '<p role="status"><b>Check your email to confirm.</b> The follow starts when you press the button in that email.</p>'
      : state === "invalid"
        ? '<p role="alert">That email address does not look right. Check it and try again.</p>'
        : state === "limited"
          ? '<p role="alert">Too many follow requests from this connection. Try again in an hour.</p>'
          : "";
  return `<div class="dock">
<details class="follow"${state ? " open" : ""}><summary class="btn primary">${svg(ICONS.bell)}Follow this project</summary>
<form class="card sheet" method="post" action="/api/follow">
${status}
<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com">
<input type="hidden" name="state" value="${esc(v.state)}"><input type="hidden" name="slug" value="${esc(v.slug)}">
<label class="hp" aria-hidden="true">Leave empty <input name="website" tabindex="-1" autocomplete="off"></label>
<button class="btn primary" type="submit">Follow</button>
<p class="small">${FOLLOW_PROMISE} No account and no password.</p>
</form></details>
${share}</div>
<script nonce="${esc(nonce)}">(function(){var a=document.getElementById("share");if(!a||!navigator.share)return;a.addEventListener("click",function(e){e.preventDefault();navigator.share({title:document.title,text:${JSON.stringify(shareLine(v)).replace(/</g, "\\u003c")},url:${JSON.stringify(`${pageUrl(v)}?s=share`).replace(/</g, "\\u003c")}}).catch(function(){});});})();</script>`;
}

export function renderProject(v: ProjectView, nonce: string): string {
  const g = v.grade;
  const letter = g?.letter ?? null;
  const statusWord = STATUS_WORDS[v.status];
  const stateName = STATE_NAMES[v.state];
  const reasons = g ? sortedReasons(g) : [];
  const top = reasons.slice(0, 5);
  const rest = reasons.slice(5);
  const readLine = v.readAt ? `Read from ${esc(v.sourceName)} on ${esc(istTime(v.readAt))}.` : `Not read from ${esc(v.sourceName)} yet.`;
  const readable = g ? 6 - g.unread.length : 0;

  const gradeCard = `<section class="card grade" aria-labelledby="g-title">
<p class="label" id="g-title">Report card grade</p>
<div class="gauge">${gauge(letter)}<div class="gcenter">${
    letter ? `<span class="letter">${letter}</span><span class="gword">${GRADE_WORDS[letter]}</span>` : '<span class="letter none">Not available yet</span>'
  }</div></div>
<p class="small center">${readLine}</p>
<dl class="stats"><div><dt>${reasons.length}</dt><dd>reasons</dd></div><div><dt>${v.filingsRead}</dt><dd>filings read</dd></div><div><dt>${esc(g?.rulesVersion ?? "v1")}</dt><dd>rule table</dd></div></dl>
<p class="small center">${GRADE_NOTE}</p></section>`;

  let why: string;
  if (letter && g) {
    why = `<h2 class="label head2">Why it is ${letter === "A" || letter === "E" ? "an" : "a"} ${letter} <span class="asof">as of ${esc(day(g.asOf))}</span></h2>`;
    why += top.length
      ? `<ul class="reasons">${top.map((r) => reasonCard(r, v.ruleInputs[r.ruleId])).join("")}</ul>`
      : '<p class="summary">No filing we read lowered the grade.</p>';
    if (rest.length) {
      why += `<details class="more"><summary>${rest.length} more ${rest.length === 1 ? "reason" : "reasons"}</summary><ul class="reasons">${rest
        .map((r) => reasonCard(r, v.ruleInputs[r.ruleId]))
        .join("")}</ul></details>`;
    }
  } else {
    why = `<h2 class="label head2">Why there is no grade yet</h2>
<div class="card how"><p>We could read ${readable} of the 6 inputs a grade uses. A grade needs at least 3. We never score what we could not read.</p></div>`;
  }

  const clean = g?.clean.length
    ? `<div class="card list"><p class="label">Checked, no effect on the grade</p><ul>${g.clean
        .map((i) => `<li>${svg(ICONS.check, 18, 2)}${esc(CLEAN_WORDS[i])}</li>`)
        .join("")}</ul></div>`
    : "";
  const unread = g?.unread.length
    ? `<div class="card list unread"><p class="label">We could not read</p><ul>${g.unread
        .map((u) => `<li>${svg(ICONS.info, 18, 1.8)}<span><b>${esc(INPUT_WORDS[u.input])}.</b> ${esc(sentence(u.reason))}</span></li>`)
        .join("")}</ul></div>`
    : "";

  const sample = v.sample
    ? `<p class="note">${svg(ICONS.info, 18, 1.8)}<span><b>Sample data.</b> The facts on this page are invented. They are not the record of any real project.</span></p>`
    : "";

  const body = `<main class="page" id="main">${sample}
<div class="layout"><div class="col-a">
<section class="head">
<p class="small">${esc(stateName)} · ${esc(titleCase(v.district))} · ${esc(v.locality)}</p>
<h1>${esc(v.name)}</h1>
<p class="mono ink2">${esc(v.sourceName)} ${esc(v.regno)}</p>
<p class="small">Promoter: ${esc(v.promoter)}${statusWord ? ` · ${statusWord}` : ""}</p>
<p class="summary">${esc(summary(v))}</p>
</section>
${gradeCard}</div>
<div class="col-b">${why}${clean}${unread}
<h2 class="label head2">How the grade works</h2>
<div class="card how"><p>Every reason is a fact from a public filing, with its date and source. We add no opinions. The rules are public and the same for every project.</p>
<p class="small">A fact is wrong? Send the filing that shows it.</p>
<p><a href="/rules/${esc(g?.rulesVersion ?? "v1")}">Read rule table ${esc(g?.rulesVersion ?? "v1")}</a> · <a href="${esc(v.sourceUrl)}" rel="nofollow noopener" target="_blank">Open the ${esc(v.sourceName)} page</a></p></div>
</div></div></main>
${followDock(v, nonce)}`;

  const url = pageUrl(v);
  return layout(
    {
      title: letter ? `${v.name}: RERA grade ${letter} | ${BRAND}` : `${v.name}: RERA record | ${BRAND}`,
      description: `${summary(v)} ${letter ? "Every reason cites the public filing it came from." : ""}`.trim(),
      canonical: url,
      image: `${v.origin}/og/${v.state}/${v.slug}.svg`,
      noindex: !letter || v.sample === true,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${v.name} RERA report card`,
          url,
          description: summary(v),
          dateModified: v.readAt ? new Date(v.readAt * 1000).toISOString() : undefined,
          about: {
            "@type": "Place",
            name: v.name,
            identifier: v.regno,
            address: { "@type": "PostalAddress", addressLocality: v.locality, addressRegion: stateName, addressCountry: "IN" },
          },
        },
      ],
    },
    body,
    nonce,
  );
}

export function summary(v: ProjectView): string {
  const g = v.grade;
  const where = `${v.name} is a project by ${v.promoter} in ${v.locality}, registered with ${v.sourceName} as ${v.regno}.`;
  if (!g || g.letter === null) return `${where} We do not have enough readable filings to grade it yet.`;
  const reasons = sortedReasons(g);
  const tail = reasons.length
    ? `The largest reason is "${reasons[0].title}" (${day(reasons[0].filingDate)}).`
    : "No filing we read lowered the grade.";
  return `${where} Its grade is ${g.letter}, ${GRADE_WORDS[g.letter].toLowerCase()}, from ${v.filingsRead} public filings as of ${day(g.asOf)}. ${tail}`;
}

const sentence = (s: string) => {
  const t = s.trim();
  return t ? `${t[0].toUpperCase()}${t.slice(1)}${/[.!?]$/.test(t) ? "" : "."}` : "";
};
const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

export function renderMessage(origin: string, title: string, paragraphs: string[], nonce: string, action?: string): string {
  return layout(
    { title: `${title} | ${BRAND}`, description: paragraphs[0] ?? title, canonical: `${origin}/`, noindex: true },
    `<main class="page" id="main"><section class="card msg"><h1>${esc(title)}</h1>${paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}${action ?? ""}</section></main>`,
    nonce,
  );
}

export function postButton(action: string, fields: Record<string, string>, label: string, primary = true): string {
  const inputs = Object.entries(fields)
    .map(([k, val]) => `<input type="hidden" name="${esc(k)}" value="${esc(val)}">`)
    .join("");
  return `<form method="post" action="${esc(action)}">${inputs}<button class="btn${primary ? " primary" : ""}" type="submit">${esc(label)}</button></form>`;
}

export function renderManage(
  origin: string,
  token: string,
  follows: { follow_id: string; state: string; slug: string; name: string }[],
  nonce: string,
): string {
  const rows = follows.length
    ? `<ul class="list manage">${follows
        .map(
          (f) =>
            `<li><a href="/p/${esc(f.state)}/${esc(f.slug)}">${esc(f.name)}</a>${postButton("/follows/unfollow", { t: token, f: f.follow_id }, "Unfollow", false)}</li>`,
        )
        .join("")}</ul>`
    : "<p>You do not follow any project.</p>";
  return renderMessage(
    origin,
    "Projects you follow",
    ["Each project sends one email when its record changes and one each quarter."],
    nonce,
    `${rows}${postButton("/follows/delete", { t: token }, "Unfollow all and delete my email", false)}`,
  );
}
