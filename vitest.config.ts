import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@cr-league/shared": new URL("./packages/shared/src/index.ts", import.meta.url).pathname
    }
  },
  test: {
    environment: "jsdom",
    include: ["apps/**/*.test.ts", "apps/**/*.test.tsx", "packages/**/*.test.ts"],
    passWithNoTests: false
  }
});
