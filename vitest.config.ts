import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/ingest/types.ts"],
      reporter: ["text", "json-summary"],
      thresholds: {
        "src/grade.ts": { branches: 100 },
      },
    },
  },
});
