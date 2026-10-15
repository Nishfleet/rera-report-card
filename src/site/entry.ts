import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import inter400 from "@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf";
import inter700 from "@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf";
import { cardCacheKey, isCacheableCard, type EdgeCache } from "./card-cache";
import { makeRasterizer } from "./png";
import { handle, type Env } from "./worker";

const png = makeRasterizer({ wasm: resvgWasm, fonts: [new Uint8Array(inter400), new Uint8Array(inter700)] });

export default {
  async fetch(req: Request, env: Env, ctx: { waitUntil(promise: Promise<unknown>): void }): Promise<Response> {
    const key = cardCacheKey(req);
    if (!key) return handle(req, env, undefined, png);
    const cache = (caches as unknown as { default: EdgeCache }).default;
    const hit = await cache.match(key).catch(() => undefined);
    if (hit) return hit;
    const res = await handle(req, env, undefined, png);
    if (isCacheableCard(res)) ctx.waitUntil(cache.put(key, res.clone()).catch(() => undefined));
    return res;
  },
};
