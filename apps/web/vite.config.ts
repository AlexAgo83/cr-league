import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// ChangelogView globs ../../changelogs, which sits outside this Vite root and is therefore not
// watched: a release note added while the dev server runs stayed invisible until a restart, and
// the changelog page silently lagged behind the repo.
const changelogsDir = fileURLToPath(new URL("../../changelogs", import.meta.url));

/** Adds the out-of-root changelogs directory to the watcher and reloads when one is added. */
function watchChangelogs(): Plugin {
  return {
    name: "crl-watch-changelogs",
    apply: "serve",
    configureServer(server) {
      server.watcher.add(changelogsDir);
      const reload = (file: string) => {
        if (!file.startsWith(changelogsDir)) return;
        const view = server.moduleGraph.getModulesByFile(fileURLToPath(new URL("./src/features/ChangelogView.tsx", import.meta.url)));
        for (const mod of view ?? []) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", reload);
      server.watcher.on("unlink", reload);
      server.watcher.on("change", reload);
    }
  };
}

export default defineConfig({
  plugins: [react(), watchChangelogs()],
  resolve: {
    dedupe: ["react", "react-dom"]
  },
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
