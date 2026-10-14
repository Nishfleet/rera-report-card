// Types for the imports wrangler bundles: .wasm as a compiled module, .ttf as raw bytes (wrangler.toml [[rules]]).
declare module "*.wasm" {
  const module: WebAssembly.Module;
  export default module;
}
declare module "*.ttf" {
  const bytes: ArrayBuffer;
  export default bytes;
}
