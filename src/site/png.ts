// SVG to PNG for the preview card: link crawlers (WhatsApp, X) do not render SVG og:image.
import { initWasm, Resvg } from "@resvg/resvg-wasm";

export type Rasterizer = (svg: string) => Promise<Uint8Array>;

export interface RasterAssets {
  wasm: WebAssembly.Module | BufferSource; // @resvg/resvg-wasm/index_bg.wasm
  fonts: Uint8Array[]; // a Worker has no system fonts, so the card's fonts ship with it
}

export function makeRasterizer(assets: RasterAssets): Rasterizer {
  let ready: Promise<void> | undefined;
  return async (svg) => {
    ready ??= initWasm(assets.wasm).catch((e) => {
      ready = undefined; // a failed init must not poison the isolate
      throw e;
    });
    await ready;
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
      font: { fontBuffers: assets.fonts, defaultFontFamily: "Inter", loadSystemFonts: false },
    });
    try {
      const image = resvg.render();
      try {
        return image.asPng();
      } finally {
        image.free();
      }
    } finally {
      resvg.free();
    }
  };
}
