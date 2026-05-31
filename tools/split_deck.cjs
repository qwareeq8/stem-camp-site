/*
 * split_deck.cjs -- modularize the monolithic STEM deck into src/deck/*.
 *
 * Strategy (zero behavior change): parse reference/Deck.mono.jsx, take each
 * top-level declaration as a VERBATIM source slice (component bodies are never
 * reauthored), compute each module's required imports from a scope-aware
 * ReferencedIdentifier pass (handles JSX refs and shadowing), and emit the
 * module tree plus an index.js that reconstructs the exact public surface.
 */
const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default || require("@babel/traverse");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "reference", "Deck.mono.jsx");
const OUT = path.join(ROOT, "src", "deck");

const code = fs.readFileSync(SRC, "utf8");
const ast = parser.parse(code, { sourceType: "module", plugins: ["jsx"] });

// ---- collect react / lucide import locals (with alias -> imported map) ----
const reactLocalToImported = {};
const lucideLocalToImported = {};
let publicExportNames = [];

const emitTops = []; // {names, namesSet, start, end, sliceStart, sliceEnd, isDefault}

for (const node of ast.program.body) {
  if (node.type === "ImportDeclaration") {
    const target = node.source.value === "react" ? reactLocalToImported
      : node.source.value === "lucide-react" ? lucideLocalToImported : null;
    if (target) {
      for (const s of node.specifiers) {
        if (s.type === "ImportSpecifier") target[s.local.name] = s.imported.name;
      }
    }
    continue;
  }
  if (node.type === "ExportNamedDeclaration" && !node.declaration && node.specifiers.length) {
    publicExportNames = node.specifiers.map((s) => s.exported.name); // the public surface
    continue;
  }
  if (node.type === "ExportNamedDeclaration" && node.declaration) {
    // e.g. `export const __AUDIT__ = true;` -- handled directly in index.js
    continue;
  }
  if (node.type === "ExportDefaultDeclaration") {
    // `export default function App() {...}` -> App.jsx
    const d = node.declaration;
    const name = d.id ? d.id.name : "App";
    emitTops.push({ names: [name], namesSet: new Set([name]), start: node.start, end: node.end, sliceStart: d.start, sliceEnd: d.end, isDefault: true });
    continue;
  }
  if (node.type === "FunctionDeclaration") {
    const name = node.id.name;
    emitTops.push({ names: [name], namesSet: new Set([name]), start: node.start, end: node.end, sliceStart: node.start, sliceEnd: node.end, isDefault: false });
    continue;
  }
  if (node.type === "VariableDeclaration") {
    const names = node.declarations.map((d) => d.id.name);
    emitTops.push({ names, namesSet: new Set(names), start: node.start, end: node.end, sliceStart: node.start, sliceEnd: node.end, isDefault: false });
    continue;
  }
}

emitTops.sort((a, b) => a.start - b.start);
emitTops.forEach((tp) => (tp.deps = new Set()));
const REACT = new Set(Object.keys(reactLocalToImported));
const LUCIDE = new Set(Object.keys(lucideLocalToImported));

function ownerIndexOf(pos) {
  let lo = 0, hi = emitTops.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const t = emitTops[mid];
    if (pos < t.start) hi = mid - 1;
    else if (pos >= t.end) lo = mid + 1;
    else return mid;
  }
  return null;
}

// ---- scope-aware reference pass to compute per-statement dependencies ----
let programScope = null;
traverse(ast, {
  Program(p) { programScope = p.scope; },
  ReferencedIdentifier(p) {
    const name = p.node.name;
    const binding = p.scope.getBinding(name);
    if (!binding) return;                       // global (Math, document, ...)
    if (binding.scope !== programScope) return; // local var/param or shadowed
    const i = ownerIndexOf(p.node.start);
    if (i == null) return;                      // reference sits in a skipped stmt
    if (!emitTops[i].namesSet.has(name)) emitTops[i].deps.add(name);
  },
});

// ---- module assignment ----
const STRUCTURAL = {
  T: "theme", CAMP: "theme", f: "theme",
  useRAF: "ui/hooks", useTimeouts: "ui/hooks", usePointerDrag: "ui/hooks",
  Btn: "ui/primitives", Slider: "ui/primitives", Tag: "ui/primitives", Corners: "ui/primitives", Field: "ui/primitives", Readout: "ui/primitives", Caption: "ui/primitives",
  CAT_ICON: "icons", DEMO_ICON: "icons", PHASE_ICON: "icons", IconChip: "icons",
  CATMAP: "data/decks", TREES_DECK: "data/decks", PY_DECK: "data/decks", TREESB_DECK: "data/decks", PYB_DECK: "data/decks",
  Ill: "components/shared",
  CAMPUS_MAP_LAYOUT: "components/shared", CAMPUS_BASE_TEMP: "components/shared", CAMPUS_TYPE_LABEL: "components/shared",
  campusGrid: "components/shared", heatColor: "components/shared", TYPE_CHIP_COLOR: "components/shared", TypeGlyph: "components/shared", HeatTile: "components/shared",
  DEMOS: "components/demos/index", EXTRAS: "components/extras/index",
  splitPts: "Presentation", SlideFrame: "Presentation", Presentation: "Presentation",
  HomeMotif: "Home", StationCard: "Home", BackupCard: "Home", Home: "Home",
  App: "App",
};
function moduleKey(name) {
  if (STRUCTURAL[name]) return STRUCTURAL[name];
  if (name.startsWith("Extra")) return "components/extras/" + name;
  if (name.startsWith("Demo")) return "components/demos/" + name;
  return "components/shared";
}
const FIXED_FILE = {
  theme: "theme.js",
  "ui/hooks": "ui/hooks.js",
  "ui/primitives": "ui/primitives.jsx",
  icons: "icons.jsx",
  "data/decks": "data/decks.js",
  "components/shared": "components/shared.jsx",
  "components/demos/index": "components/demos/index.js",
  "components/extras/index": "components/extras/index.js",
  Presentation: "Presentation.jsx",
  Home: "Home.jsx",
  App: "App.jsx",
};
function keyToFile(key) {
  if (FIXED_FILE[key]) return FIXED_FILE[key];
  if (key.startsWith("components/extras/")) return key + ".jsx";
  if (key.startsWith("components/demos/")) return key + ".jsx";
  throw new Error("no file for module key " + key);
}
const nameToFile = {};
for (const tp of emitTops) for (const n of tp.names) nameToFile[n] = keyToFile(moduleKey(n));

function relImport(fromFile, toFile) {
  const fromDir = path.posix.dirname(fromFile);
  let rel = path.posix.relative(fromDir, toFile);
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}
function importList(localNames, localToImported) {
  return localNames.slice().sort().map((l) => {
    const imp = localToImported[l];
    return imp && imp !== l ? `${imp} as ${l}` : l;
  }).join(", ");
}

const HEADERS = {
  "theme.js": "// Theme tokens, camp palettes (Trees / PY-STEM), and font helpers shared across the deck.",
  "ui/hooks.js": "// Shared React hooks for the deck: animation frame loop, managed timeouts, and pointer drag.",
  "ui/primitives.jsx": "// Low-level UI primitives shared by every deck component (buttons, sliders, frames, readouts).",
  "icons.jsx": "// Lucide icon imports plus the category, demo, and phase icon maps and the IconChip coin badge.",
  "data/decks.js": "// Activity data for both camps: the four deck arrays and the category map.",
  "components/shared.jsx": "// Illustration helper and the campus heat-grid helpers shared by a few science components.",
  "components/demos/index.js": "// Routing map of demo id -> Demo component.",
  "components/extras/index.js": "// Routing map of science-slide title -> Extra component.",
  "Presentation.jsx": "// The slide presentation shell: slide frame, index side-tab, and navigation.",
  "Home.jsx": "// The field-notebook home screen: camp toggle, station grid, and home motifs.",
  "App.jsx": "// Root application component wiring the home screen to the presentation.",
};

// ---- group and emit ----
const groups = new Map(); // key -> [tops]
for (const tp of emitTops) {
  const key = moduleKey(tp.names[0]);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(tp);
}

fs.rmSync(OUT, { recursive: true, force: true });
const manifest = [];
for (const [key, tops] of groups) {
  const file = keyToFile(key);
  tops.sort((a, b) => a.start - b.start);
  const defined = new Set();
  for (const tp of tops) tp.names.forEach((n) => defined.add(n));
  const deps = new Set();
  for (const tp of tops) tp.deps.forEach((d) => { if (!defined.has(d)) deps.add(d); });

  const reactRefs = [...deps].filter((d) => REACT.has(d));
  const lucideRefs = [...deps].filter((d) => LUCIDE.has(d));
  const otherRefs = [...deps].filter((d) => !REACT.has(d) && !LUCIDE.has(d));

  const byFile = new Map();
  for (const r of otherRefs) {
    const f = nameToFile[r];
    if (!f) throw new Error("unresolved dependency " + r + " in module " + key);
    if (!byFile.has(f)) byFile.set(f, []);
    byFile.get(f).push(r);
  }

  const lines = [];
  const header = HEADERS[file] || `// ${tops[0].names[0]} component for the STEM Camp interactive deck.`;
  lines.push(header);
  if (reactRefs.length) lines.push(`import { ${importList(reactRefs, reactLocalToImported)} } from "react";`);
  if (lucideRefs.length) lines.push(`import { ${importList(lucideRefs, lucideLocalToImported)} } from "lucide-react";`);
  [...byFile.keys()].sort().forEach((f) => {
    lines.push(`import { ${byFile.get(f).slice().sort().join(", ")} } from "${relImport(file, f)}";`);
  });
  lines.push("");
  for (const tp of tops) lines.push(code.slice(tp.sliceStart, tp.sliceEnd));
  lines.push("");
  if (key === "App") {
    lines.push("export default App;");
  } else {
    lines.push(`export { ${[...defined].join(", ")} };`);
  }

  const full = path.join(OUT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, lines.join("\n") + "\n");
  manifest.push({ file, defines: [...defined], imports: { react: reactRefs.length, lucide: lucideRefs.length, modules: byFile.size } });
}

// ---- index.js: reconstruct the exact public export surface ----
const idxByFile = new Map();
for (const name of publicExportNames) {
  const f = nameToFile[name];
  if (!f) throw new Error("public export with no file: " + name);
  if (!idxByFile.has(f)) idxByFile.set(f, []);
  idxByFile.get(f).push(name);
}
const idx = [];
idx.push("// Public surface of the modular deck: default App plus every named export the tooling and site import.");
idx.push('import App from "./App.jsx";');
idx.push("export default App;");
[...idxByFile.keys()].sort().forEach((f) => {
  idx.push(`export { ${idxByFile.get(f).slice().sort().join(", ")} } from "./${f}";`);
});
idx.push("export const __AUDIT__ = true;");
fs.writeFileSync(path.join(OUT, "index.js"), idx.join("\n") + "\n");

console.log("modules written:", manifest.length + 1);
console.log("public exports re-exported:", publicExportNames.length, "(+ default App, + __AUDIT__)");
const reactMiss = emitTops.filter((t) => false).length; // placeholder
fs.writeFileSync(path.join(OUT, "_MANIFEST.json"), JSON.stringify({ modules: manifest, publicExportNames }, null, 2));
console.log("wrote src/deck/_MANIFEST.json");
