// Bundle _test_entry.jsx (which imports the modular deck) to CJS and run it.
import { build } from "esbuild";
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(here, "out"), { recursive: true });
const outfile = path.join(here, "out", "_test_bundle.cjs");
await build({
  entryPoints: [path.join(here, "_test_entry.jsx")],
  bundle: true,
  outfile,
  absWorkingDir: here,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  loader: { ".jsx": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});
const r = spawnSync(process.execPath, [outfile], { encoding: "utf8" });
process.stdout.write(r.stdout || "");
if (r.stderr) process.stderr.write(r.stderr);
process.exit(r.status === null ? 1 : r.status);
