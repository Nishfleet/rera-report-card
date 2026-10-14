import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import inter400 from "@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf";
import inter700 from "@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf";
import { makeRasterizer } from "./png";
import { handle, type Env } from "./worker";

const png = makeRasterizer({ wasm: resvgWasm, fonts: [new Uint8Array(inter400), new Uint8Array(inter700)] });

export default {
  fetch: (req: Request, env: Env) => handle(req, env, undefined, png),
};
