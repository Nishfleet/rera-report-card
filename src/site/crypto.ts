const enc = new TextEncoder();

export function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromB64url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) return null;
  const pad = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
  try {
    return Uint8Array.from(atob(pad), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

export async function sha256(text: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}

export function randomToken(bytes = 32): string {
  return b64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export function newId(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(16)));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

export async function hmac(secret: string, message: string): Promise<string> {
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(message))));
}

function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signToken(secret: string, purpose: string, id: string): Promise<string> {
  const payload = b64url(enc.encode(`${purpose}:${id}`));
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifyToken(secret: string, purpose: string, token: string): Promise<string | null> {
  const [payload, mac, extra] = token.split(".");
  if (!payload || !mac || extra !== undefined) return null;
  if (!sameString(mac, await hmac(secret, payload))) return null;
  const bytes = fromB64url(payload);
  if (!bytes) return null;
  const text = new TextDecoder().decode(bytes);
  const prefix = `${purpose}:`;
  return text.startsWith(prefix) ? text.slice(prefix.length) : null;
}

async function aesKey(secret: string) {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(`email-key:${secret}`));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encrypt(secret: string, text: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(secret), enc.encode(text)));
  return `${b64url(iv)}.${b64url(data)}`;
}

export async function decrypt(secret: string, sealed: string): Promise<string> {
  const [iv, data] = sealed.split(".").map(fromB64url);
  if (!iv || !data) throw new Error("bad sealed value");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, await aesKey(secret), data);
  return new TextDecoder().decode(plain);
}
