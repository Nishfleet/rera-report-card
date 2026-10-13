// The 1200 x 630 preview card (PLAN.md 4.3): project name, grade letter and the top reason.
// SVG here. Converting it to PNG for WhatsApp's crawler is a separate step (see issue tracker).
import type { Letter } from "../grade";
import { BRAND, esc } from "./render";

export interface CardInput {
  name: string;
  regno: string;
  sourceName: string;
  letter: Letter | null;
  topReason: string | null;
}

// Greedy word wrap by character count. Good enough for a fixed card at one font size.
export function wrap(text: string, max: number, lines: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= max) {
      line = next;
      continue;
    }
    if (line) out.push(line);
    line = word.length > max ? `${word.slice(0, max - 1)}…` : word;
    if (out.length === lines) break;
  }
  if (line && out.length < lines) out.push(line);
  if (out.length === lines && out.join(" ").length < text.trim().length) {
    const last = out[lines - 1];
    out[lines - 1] = `${last.length >= max ? last.slice(0, max - 1) : last}…`;
  }
  return out;
}

export function cardSvg(c: CardInput): string {
  const name = wrap(c.name, 26, 2);
  const reason = c.letter ? wrap(c.topReason ?? "No filing we read lowered the grade.", 44, 2) : ["Grade not available yet"];
  const letter = c.letter ?? "–";
  const nameLines = name.map((l, i) => `<tspan x="72" dy="${i === 0 ? 0 : 66}">${esc(l)}</tspan>`).join("");
  const reasonLines = reason.map((l, i) => `<tspan x="72" dy="${i === 0 ? 0 : 40}">${esc(l)}</tspan>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${esc(
    `${c.name}: ${c.letter ? `grade ${c.letter}` : "grade not available yet"}`,
  )}">
<rect width="1200" height="630" fill="#f5f4ef"/>
<rect x="40" y="40" width="1120" height="550" rx="36" fill="#ffffff" stroke="#e4e2da"/>
<g font-family="Inter, 'Noto Sans Devanagari', system-ui, sans-serif">
<rect x="72" y="76" width="44" height="44" rx="12" fill="#1d4ed8"/><text x="94" y="108" font-size="24" font-weight="800" fill="#ffffff" text-anchor="middle">R</text>
<text x="132" y="107" font-size="26" font-weight="700" fill="#15171c">${BRAND}</text>
<text x="72" y="236" font-size="58" font-weight="700" fill="#15171c" letter-spacing="-1">${nameLines}</text>
<text x="72" y="${name.length > 1 ? 352 : 290}" font-size="24" fill="#565b66" font-family="'JetBrains Mono', monospace">${esc(`${c.sourceName} ${c.regno}`)}</text>
<text x="72" y="470" font-size="30" fill="#15171c">${reasonLines}</text>
<circle cx="980" cy="250" r="128" fill="#e8eefc"/>
<text x="980" y="${c.letter ? 296 : 286}" font-size="${c.letter ? 150 : 110}" font-weight="700" fill="#1d4ed8" text-anchor="middle">${letter}</text>
<text x="980" y="430" font-size="24" font-weight="600" fill="#565b66" text-anchor="middle">${c.letter ? "Grade, A to E" : "No grade yet"}</text>
</g></svg>`;
}
