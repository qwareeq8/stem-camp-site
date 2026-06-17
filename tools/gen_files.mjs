// Content import: copy the real camp documents from the consolidated archive
// into public/files/ and (re)generate src/data/files.json with rich metadata.
//
// This is a one-time content tool, not part of the build. The archive is a
// read-only snapshot on this workstation; once the PDFs are vendored into
// public/files/ the site builds and ships them without it. Re-run only when the
// source documents change:
//   node tools/gen_files.mjs
//
// Output model (one flat entry per downloadable file, consumed by Files.jsx and
// the admin FilesEditor):
//   { id, name, desc, type, size, path, camp, code, category, kind }
//     camp:     "trees" | "pystem" | ""        ("" = program-wide)
//     code:     "TTT-01".. | "TTB-01".. | ""   (per-activity docs only)
//     category: "Activity" | "Packet" | "Scoring" | "Signage" | "Program" | "Logistics"
//     kind:     "handout" | "guide" | ""        (per-activity docs only)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");
const ARCHIVE = "/data/projects/10_Final_Reviewed_PY_STEM";
const outDir = path.join(repo, "public", "files");
const outJson = path.join(repo, "src", "data", "files.json");

if (!fs.existsSync(ARCHIVE)) {
  process.stderr.write(`archive not found: ${ARCHIVE}\n`);
  process.exit(1);
}

// Human-readable size string, matching FilesEditor.AutoSizeField so the admin
// HEAD-check agrees with the bundled metadata.
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

// Find one file in dir whose name starts with prefix and ends with suffix.
function findOne(dir, prefix, suffix) {
  const abs = path.join(ARCHIVE, dir);
  const hit = fs.readdirSync(abs).find((n) => n.startsWith(prefix) && n.endsWith(suffix));
  if (!hit) throw new Error(`no match for ${prefix}*${suffix} in ${dir}`);
  return path.join(dir, hit);
}

const { TREES_DECK, PY_DECK, TREESB_DECK, PYB_DECK } =
  await import(pathToFileURL(path.join(repo, "src", "deck", "data", "decks.js")).href);

const entries = [];
const copies = []; // { src (rel to ARCHIVE), dest basename }

function pushCopy(srcRel) {
  const base = path.basename(srcRel);
  copies.push({ src: srcRel, dest: base });
  return `files/${base}`;
}

function ext(p) {
  return path.extname(p).slice(1).toLowerCase();
}

// ---- program-wide documents -------------------------------------------------
const PROGRAM = [
  {
    id: "doc-master",
    name: "Master Curriculum and Operations Guide",
    desc: "The full 2026 program: both camps, all stations, the design loop, scoring, and day-by-day operations.",
    category: "Program",
    src: "01_Master_Guides/2026_STEM_Camps_Master_Curriculum_and_Operations_Guide.pdf",
  },
  {
    id: "doc-rewards",
    name: "Reward and Competition Kit",
    desc: "Printable award certificates, the eight camp awards, and the best-9-of-12 competition rules.",
    category: "Program",
    src: "05_Rewards_and_Competition/Printable_Reward_and_Competition_Kit.pdf",
  },
  {
    id: "doc-safety",
    name: "Staff Setup, Prep, and Safety Checklist",
    desc: "Room setup, materials prep, and the safety checklist every facilitator runs before campers arrive.",
    category: "Program",
    src: "06_Safety_and_Setup/Staff_Setup_Prep_and_Safety_Checklist.pdf",
  },
];
// The library serves only camper- and facilitator-facing materials. Procurement
// and cost artifacts (the procurement workbook and the materials buy list) are
// kept local to the operator and are intentionally not published here.
for (const d of PROGRAM) {
  entries.push({
    id: d.id, name: d.name, desc: d.desc, type: ext(d.src),
    size: "", path: pushCopy(d.src), camp: "", code: "", category: d.category, kind: "",
  });
}

// ---- per-camp packets, score sheets, and signage ----------------------------
const CAMP_DOCS = [
  { camp: "trees", dir: "02_From_Trees_to_Tech", file: "From_Trees_to_Tech" },
  { camp: "pystem", dir: "03_PY_STEM", file: "PY_STEM" },
];
for (const c of CAMP_DOCS) {
  const set = [
    { id: `pk-${c.camp}-handout`, name: "Student Handout Packet", category: "Packet",
      desc: "All twelve station handouts for campers in one printable booklet.",
      src: `${c.dir}/Student_Handouts/${c.file}_Student_Handout_Packet.pdf` },
    { id: `pk-${c.camp}-guide`, name: "Instructor Guide Packet", category: "Packet",
      desc: "Facilitation arc, materials, timing, and debrief for every station.",
      src: `${c.dir}/Instructor_Guides/${c.file}_Instructor_Guide_Packet.pdf` },
    { id: `pk-${c.camp}-scores`, name: "Score Sheets and Leaderboard", category: "Scoring",
      desc: "Printable rubric score sheets; every station rubric sums to 100 points.",
      src: `${c.dir}/Score_Sheets/${c.file}_Score_Sheets_and_Leaderboard.pdf` },
    { id: `pk-${c.camp}-signs`, name: "Station Signs", category: "Signage",
      desc: "Printable signs for each station bench.",
      src: `${c.dir}/Station_Signs/${c.file}_Station_Signs.pdf` },
  ];
  for (const d of set) {
    entries.push({
      id: d.id, name: d.name, desc: d.desc, type: ext(d.src),
      size: "", path: pushCopy(d.src), camp: c.camp, code: "", category: d.category, kind: "",
    });
  }
}

// ---- per-activity handouts and instructor guides ----------------------------
// Match source files by code prefix so title-slug differences never matter.
const ACTIVITY_SETS = [
  { deck: TREES_DECK, camp: "trees",
    hDir: "02_From_Trees_to_Tech/Student_Handouts/Individual_PDFs",
    gDir: "02_From_Trees_to_Tech/Instructor_Guides/Individual_PDFs" },
  { deck: PY_DECK, camp: "pystem",
    hDir: "03_PY_STEM/Student_Handouts/Individual_PDFs",
    gDir: "03_PY_STEM/Instructor_Guides/Individual_PDFs" },
  { deck: TREESB_DECK, camp: "trees",
    hDir: "07_Backup_Activities/From_Trees_to_Tech",
    gDir: "07_Backup_Activities/From_Trees_to_Tech" },
  { deck: PYB_DECK, camp: "pystem",
    hDir: "07_Backup_Activities/PY_STEM",
    gDir: "07_Backup_Activities/PY_STEM" },
];
for (const s of ACTIVITY_SETS) {
  for (const a of s.deck) {
    const prefix = a.code.replace("-", "_") + "_"; // "TTT-01" -> "TTT_01_"
    const hSrc = findOne(s.hDir, prefix, "_Student_Handout.pdf");
    const gSrc = findOne(s.gDir, prefix, "_Instructor_Guide.pdf");
    entries.push({
      id: `${a.code}-handout`, name: a.t, desc: a.sub, type: "pdf",
      size: "", path: pushCopy(hSrc), camp: s.camp, code: a.code, category: "Activity", kind: "handout",
    });
    entries.push({
      id: `${a.code}-guide`, name: a.t, desc: a.sub, type: "pdf",
      size: "", path: pushCopy(gSrc), camp: s.camp, code: a.code, category: "Activity", kind: "guide",
    });
  }
}

// ---- copy files and stamp real sizes ----------------------------------------
fs.mkdirSync(outDir, { recursive: true });
// Replace the library wholesale with the current document set.
for (const n of fs.readdirSync(outDir)) {
  fs.rmSync(path.join(outDir, n));
}
const sizeByPath = {};
for (const { src, dest } of copies) {
  const srcAbs = path.join(ARCHIVE, src);
  const destAbs = path.join(outDir, dest);
  fs.copyFileSync(srcAbs, destAbs);
  sizeByPath[`files/${dest}`] = formatBytes(fs.statSync(destAbs).size);
}
for (const e of entries) e.size = sizeByPath[e.path] || "";

fs.writeFileSync(outJson, JSON.stringify(entries, null, 2) + "\n");
process.stdout.write(`wrote ${outJson} (${entries.length} entries), copied ${copies.length} files into public/files/\n`);
