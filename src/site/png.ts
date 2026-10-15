import { initWasm, Resvg } from "@resvg/resvg-wasm";

export type Rasterizer = (svg: string) => Promise<Uint8Array>;

export interface RasterAssets {
  wasm: WebAssembly.Module | BufferSource;
  fonts: Uint8Array[];
}

let wasmReady: Promise<void> | undefined;

function ensureWasm(wasm: RasterAssets["wasm"]): Promise<void> {
  wasmReady ??= initWasm(wasm).catch((e) => {
    if (/already initialized/i.test(String(e))) return;
    wasmReady = undefined;
    throw e;
  });
  return wasmReady;
}

export function makeRasterizer(assets: RasterAssets): Rasterizer {
  return async (svg) => {
    await ensureWasm(assets.wasm);
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
