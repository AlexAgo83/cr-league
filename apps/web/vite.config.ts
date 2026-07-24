import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/")) return "vendor";
          // Keep the lazy facade (index.ts) out of the data chunk so only the dynamically-imported
          // route data lands in circuit-routes — otherwise the static facade drags it onto first paint.
          if (id.includes("/src/app/circuitRoutes/") && !id.includes("/circuitRoutes/index")) return "circuit-routes";
        }
      }
    }
  }
});
