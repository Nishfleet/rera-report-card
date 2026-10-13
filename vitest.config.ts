import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/grade.ts"],
      reporter: ["text", "json-summary"],
      thresholds: { branches: 100 },
    },
  },
});
