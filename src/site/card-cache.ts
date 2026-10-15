export interface EdgeCache {
  match(req: Request): Promise<Response | undefined>;
  put(req: Request, res: Response): Promise<void>;
}

const PNG_CARD = /^\/og\/[a-z]{2}\/[a-z0-9-]+\.png$/;

export function cardCacheKey(req: Request): Request | null {
  if (req.method !== "GET") return null;
  const url = new URL(req.url);
  if (!PNG_CARD.test(url.pathname)) return null;
  return new Request(url.origin + url.pathname);
}

export function isCacheableCard(res: Response): boolean {
  return res.status === 200 && res.headers.get("content-type") === "image/png";
}
