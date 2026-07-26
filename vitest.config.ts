import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@cr-league/shared": new URL("./packages/shared/src/index.ts", import.meta.url).pathname
    }
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      thresholds: {
        branches: 80,
        functions: 90,
        lines: 91,
        statements: 88
      }
    },
    environment: "jsdom",
    include: ["apps/**/*.test.ts", "apps/**/*.test.tsx", "packages/**/*.test.ts"],
    passWithNoTests: false
  }
});
