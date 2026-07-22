import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/")) return "vendor";
          if (id.includes("/src/app/circuitRoutes/")) return "circuit-routes";
        }
      }
    }
  }
});
