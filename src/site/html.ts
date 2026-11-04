declare const safe: unique symbol;

export interface SafeHtml {
  readonly [safe]: true;
  readonly value: string;
  toString(): string;
}

type Interpolation = SafeHtml | string | number | boolean | null | undefined | readonly Interpolation[];

class Html {
  constructor(readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function raw(value: string): SafeHtml {
  return new Html(value) as unknown as SafeHtml;
}

function part(value: Interpolation): string {
  if (value instanceof Html) return value.value;
  if (Array.isArray(value)) return value.map(part).join("");
  if (value === null || value === undefined || value === false) return "";
  return esc(value);
}

export function html(strings: TemplateStringsArray, ...values: Interpolation[]): SafeHtml {
  return raw(strings.reduce((out, s, i) => out + s + (i < values.length ? part(values[i]) : ""), ""));
}
