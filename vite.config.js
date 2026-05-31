// Configure Vite for the static field-notebook site.
// Keep asset URLs relative so the build works under any GitHub Pages project subpath and when opened locally.
// Use hash-based routing so GitHub Pages can serve every route from index.html.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        // Split the lazy deck route into several cacheable pieces.
        // Keep total bytes about the same while improving cache granularity and parallel loading.
        // Load the deck only on the deck route.
        // Load deck-data on first paint too because the site Home imports the station catalog.
        //
        // Keep deck-base as the shared foundation for theme, icons, primitives, and hooks.
        // Avoid circular chunks by keeping deck-base independent of core and leaf chunks.
        manualChunks(id) {
          if (!id.includes("/src/deck/")) return;
          if (id.includes("/src/deck/components/demos/")) return "deck-demos";
          if (id.includes("/src/deck/components/extras/")) return "deck-extras";
          if (id.includes("/src/deck/data/")) return "deck-data";
          if (
            id.includes("/src/deck/theme") ||
            id.includes("/src/deck/icons") ||
            id.includes("/src/deck/ui/") ||
            id.includes("/src/deck/components/shared")
          ) return "deck-base";
          return "deck-core";
        },
      },
    },
  },
});
