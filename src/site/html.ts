class SafeHtml {
  readonly #value: string;
  constructor(value: string) {
    this.#value = value;
  }
  get value(): string {
    return this.#value;
  }
  toString(): string {
    return this.#value;
  }
}

export type { SafeHtml };

type Interpolation = SafeHtml | string | number | boolean | null | undefined | readonly Interpolation[];

export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function raw(value: string): SafeHtml {
  return new SafeHtml(value);
}

function part(value: Interpolation): string {
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(part).join("");
  if (value === null || value === undefined || value === false) return "";
  return esc(value);
}

export function html(strings: TemplateStringsArray, ...values: Interpolation[]): SafeHtml {
  return raw(strings.reduce((out, s, i) => out + s + (i < values.length ? part(values[i]) : ""), ""));
}
