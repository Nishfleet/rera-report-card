import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import inter400 from "@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf";
import inter700 from "@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf";
import { makeRasterizer } from "./png";
import { handle, type Env } from "./worker";

const png = makeRasterizer({ wasm: resvgWasm, fonts: [new Uint8Array(inter400), new Uint8Array(inter700)] });

interface EdgeCache {
  match(req: Request): Promise<Response | undefined>;
  put(req: Request, res: Response): Promise<void>;
}

const PNG_CARD = /^\/og\/[a-z]{2}\/[a-z0-9-]+\.png$/;

export default {
  async fetch(req: Request, env: Env, ctx: { waitUntil(promise: Promise<unknown>): void }): Promise<Response> {
    const cacheable = req.method === "GET" && PNG_CARD.test(new URL(req.url).pathname);
    if (!cacheable) return handle(req, env, undefined, png);
    const cache = (caches as unknown as { default: EdgeCache }).default;
    const hit = await cache.match(req);
    if (hit) return hit;
    const res = await handle(req, env, undefined, png);
    if (res.status === 200 && res.headers.get("content-type") === "image/png") ctx.waitUntil(cache.put(req, res.clone()));
    return res;
  },
};
