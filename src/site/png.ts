import { initWasm, Resvg } from "@resvg/resvg-wasm";

export type Rasterizer = (svg: string) => Promise<Uint8Array>;

export interface RasterAssets {
  wasm: WebAssembly.Module | BufferSource;
  fonts: Uint8Array[];
}

export function makeRasterizer(assets: RasterAssets): Rasterizer {
  let ready: Promise<void> | undefined;
  return async (svg) => {
    ready ??= initWasm(assets.wasm).catch((e) => {
      ready = undefined;
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
