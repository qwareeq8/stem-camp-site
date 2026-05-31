// Browser-bundle the full modular deck App.
import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(here, "out"), { recursive: true });
const r = await build({
  entryPoints: [path.join(here, "preview_entry.jsx")],
  bundle: true,
  outfile: path.join(here, "out", "preview_bundle.js"),
  absWorkingDir: here,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  loader: { ".jsx": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
  metafile: true,
});
console.log("preview_bundle.js bytes=" + Object.values(r.metafile.outputs)[0].bytes);
