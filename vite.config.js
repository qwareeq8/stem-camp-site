// Configure Vite for the static field-notebook site.
// Keep asset URLs relative so the build works under any GitHub Pages project subpath and when opened locally.
// Use hash-based routing so GitHub Pages can serve every route from index.html.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DECK_CHUNK_PREFIX = "deck-";

function guardDeckRouteBoundary() {
  return {
    name: "guard-deck-route-boundary",
    apply: "build",
    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle).filter((item) => item.type === "chunk");
      const entry = chunks.find((chunk) => chunk.isEntry);
      if (!entry) {
        this.error(
          "Cannot verify the lazy deck boundary: no application entry chunk was emitted.",
        );
      }

      const byFileName = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
      const visited = new Set();
      const pending = [...entry.imports];
      while (pending.length) {
        const fileName = pending.pop();
        if (visited.has(fileName)) continue;
        visited.add(fileName);
        const chunk = byFileName.get(fileName);
        if (chunk) pending.push(...chunk.imports);
      }

      const eagerDeckChunks = chunks
        .filter(
          (chunk) => (
            chunk.name.startsWith(DECK_CHUNK_PREFIX) && visited.has(chunk.fileName)
          ),
        )
        .map((chunk) => chunk.fileName)
        .sort();
      if (eagerDeckChunks.length) {
        this.error(
          `Public entry eagerly imports deck chunks: ${eagerDeckChunks.join(", ")}`,
        );
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), guardDeckRouteBoundary()],
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1800,
    rolldownOptions: {
      // Explicit groups below leave each group's shared dependencies in the
      // automatic graph. This preserves the /deck dynamic-import boundary;
      // recursively capturing React/lucide would make the public entry depend
      // on deck chunks and force Vite to preload them on every route.
      preserveEntrySignatures: "allow-extension",
      output: {
        // Split the lazy deck route into several cacheable pieces.
        // Keep total bytes about the same while improving cache granularity and parallel loading.
        // Load the deck only on the deck route.
        // The public site uses its own tiny, test-verified station-count module,
        // so every deck chunk remains behind the lazy /deck route boundary.
        //
        // Keep deck-base as the shared foundation for theme, icons, primitives, and hooks.
        // Avoid circular chunks by keeping deck-base independent of core and leaf chunks.
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            {
              name: "deck-demos",
              test: /[\\/]src[\\/]deck[\\/]components[\\/]demos[\\/]/,
              priority: 20,
            },
            {
              name: "deck-extras",
              test: /[\\/]src[\\/]deck[\\/]components[\\/]extras[\\/]/,
              priority: 20,
            },
            {
              name: "deck-data",
              test: /[\\/]src[\\/]deck[\\/]data[\\/]/,
              priority: 20,
            },
            {
              name: "deck-base",
              test: (id) => (
                /[\\/]src[\\/]deck[\\/](?:theme|icons)(?:\.[^/]+)?$/.test(id) ||
                /[\\/]src[\\/]deck[\\/]ui[\\/]/.test(id) ||
                /[\\/]src[\\/]deck[\\/]components[\\/]shared/.test(id)
              ),
              priority: 10,
            },
            {
              name: "deck-core",
              test: /[\\/]src[\\/]deck[\\/]/,
            },
          ],
        },
        strictExecutionOrder: true,
      },
    },
  },
});
