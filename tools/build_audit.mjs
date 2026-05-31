// Browser-bundle the modular audit page.
import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(here, "out"), { recursive: true });
const r = await build({
  entryPoints: [path.join(here, "audit_entry.jsx")],
  bundle: true,
  outfile: path.join(here, "out", "audit_bundle.js"),
  absWorkingDir: here,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  loader: { ".jsx": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
  metafile: true,
});
console.log("audit_bundle.js bytes=" + Object.values(r.metafile.outputs)[0].bytes);
