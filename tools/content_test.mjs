// Cross-cutting content and data-contract tests that run without a browser.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateCollection } from "../src/site/lib/schemas.js";
import { rankedTeamTotalsByCamp, splitScores, withCompetitionRanks } from "../src/site/lib/scoring.js";
import { isScheduleComplete, upcomingSchedule } from "../src/site/lib/scheduleTiming.js";
import { TREES_DECK, PY_DECK, TREESB_DECK, PYB_DECK } from "../src/deck/data/decks.js";
import {
  BACKUP_STATION_COUNT,
  PRIMARY_STATION_COUNT,
  PRIMARY_STATIONS_BY_CAMP,
} from "../src/site/lib/stationCounts.js";
import { changeScheduleDayCamp, newScheduleBlock } from "../src/site/pages/admin/scheduleEditorLogic.js";
import {
  hasTeamReferences,
  removedTeamReferenceSummaries,
  resolveAchievementRecipients,
  teamReferenceSummary,
} from "../src/site/lib/crossCollectionIntegrity.js";
import { normalizeLegacyScores } from "../src/site/lib/liveDataCompatibility.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");
const readText = (relative) => fs.readFileSync(path.join(repo, relative), "utf8");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(repo, relative), "utf8"));
const collections = ["teams", "members", "scores", "tickets", "catalog", "schedule", "achievements", "prizes", "files", "config"];

test("all bundled collections satisfy structural and semantic validation", () => {
  for (const name of collections) {
    const errors = validateCollection(name, readJson(`src/data/${name}.json`));
    assert.deepEqual(errors, [], `${name}: ${errors.join("; ")}`);
  }
});

test("only counselors may save an unassigned roster entry", () => {
  const counselor = { id: "member-c", name: "Coach", teamId: "", role: "counselor" };
  assert.deepEqual(validateCollection("members", [counselor]), []);
  assert.deepEqual(validateCollection("members", [{ ...counselor, teamId: "   " }]), []);

  const camperErrors = validateCollection("members", [
    { id: "member-p", name: "Sparky", teamId: "", role: "camper" },
  ]).join("\n");
  assert.match(camperErrors, /only counselors may be unassigned/);
});

test("score validation enforces bounds and one row per team and score code", () => {
  const invalid = [
    { teamId: "team-a", code: "TTT-01", points: 101 },
    { teamId: "team-a", code: "ttt-01", points: 80 },
    { teamId: "team-b", code: "CRANK", points: 301 },
  ];
  const errors = validateCollection("scores", invalid).join("\n");
  assert.match(errors, /duplicate team and station pair/);
  assert.match(errors, /between 0 and 100/);
  assert.match(errors, /between 0 and 300/);
});

test("legacy 2026 PYS-03 Crank results hydrate under the canonical score key", () => {
  const ordinary = { teamId: "team-a", code: "PYS-01", points: 90 };
  const legacyRows = [215, 232, 237, 261, 265, 274].map((points, index) => ({
    teamId: `team-${index + 1}`,
    code: index === 0 ? " PYS-03 " : "PYS-03",
    points,
  }));
  const source = [ordinary, ...legacyRows];
  const normalized = normalizeLegacyScores(source);

  assert.equal(normalized.length, source.length);
  assert.equal(normalized[0], ordinary, "unrelated score rows retain object identity");
  assert.equal(normalized.filter((score) => score.code === "CRANK").length, 6);
  assert.equal(
    normalized.reduce((sum, score) => sum + score.points, 0),
    source.reduce((sum, score) => sum + score.points, 0),
    "normalization preserves every point",
  );
  assert.deepEqual(validateCollection("scores", normalized), []);
  assert.equal(normalizeLegacyScores(normalized), normalized, "normalization is idempotent");

  const { counted, dropped } = splitScores([
    { code: "A", points: 10 },
    { code: "B", points: 20 },
    { code: "C", points: 30 },
    { code: "D", points: 40 },
    normalized[1],
  ]);
  assert.deepEqual(dropped.map((score) => score.code), ["A"]);
  assert.ok(counted.includes(normalized[1]), "normalized Crank result always counts");
});

test("legacy score compatibility fails closed outside the known six-team batch", () => {
  const isolated = [{ teamId: "team-a", code: "PYS-03", points: 101 }];
  assert.equal(normalizeLegacyScores(isolated), isolated);
  assert.match(validateCollection("scores", isolated).join("\n"), /between 0 and 100/);

  const batch = [215, 232, 237, 261, 265, 274].map((points, index) => ({
    teamId: `team-${index + 1}`,
    code: "PYS-03",
    points,
  }));
  const withCanonicalCrank = [
    ...batch,
    { teamId: "team-1", code: "CRANK", points: 215 },
  ];
  assert.equal(normalizeLegacyScores(withCanonicalCrank), withCanonicalCrank);
  assert.match(validateCollection("scores", withCanonicalCrank).join("\n"), /between 0 and 100/);

  const duplicateTeamBatch = batch.map((score, index) => (
    index === 5 ? { ...score, teamId: "team-1" } : score
  ));
  assert.equal(normalizeLegacyScores(duplicateTeamBatch), duplicateTeamBatch);

  const outOfRangeBatch = batch.map((score, index) => (
    index === 5 ? { ...score, points: 301 } : score
  ));
  assert.equal(normalizeLegacyScores(outOfRangeBatch), outOfRangeBatch);

  const differentSixTeamBatch = [101, 102, 103, 104, 105, 106].map((points, index) => ({
    teamId: `team-${index + 1}`,
    code: "PYS-03",
    points,
  }));
  assert.equal(normalizeLegacyScores(differentSixTeamBatch), differentSixTeamBatch);
  assert.match(
    validateCollection("scores", differentSixTeamBatch).join("\n"),
    /between 0 and 100/,
  );
});

test("2026 live scoring cancels the lowest quarter and always counts CRANK", () => {
  const { counted, dropped } = splitScores([
    { code: "A", points: 10 },
    { code: "B", points: 20 },
    { code: "C", points: 30 },
    { code: "D", points: 40 },
    { code: " CRANK ", points: 5 },
  ]);
  assert.deepEqual(dropped.map((score) => score.code), ["A"]);
  assert.ok(counted.some((score) => score.code.trim() === "CRANK"));
  assert.deepEqual(
    withCompetitionRanks([{ total: 100 }, { total: 100 }, { total: 90 }, { total: 80 }]).map((row) => row.rank),
    [1, 1, 3, 4],
  );
  assert.deepEqual(
    withCompetitionRanks([
      { raw: 100.004, total: 100 },
      { raw: 100.003, total: 100 },
      { raw: 90, total: 90 },
      { raw: 90, total: 90 },
    ]).map((row) => row.rank),
    [1, 2, 3, 3],
  );
});

test("leaderboard ranks independently within each camp", () => {
  const teams = [
    { id: "tree-a", name: "Tree A", camp: "trees" },
    { id: "tree-b", name: "Tree B", camp: "trees" },
    { id: "py-a", name: "PY A", camp: "pystem" },
    { id: "py-b", name: "PY B", camp: "pystem" },
  ];
  const scores = [
    { teamId: "tree-a", code: "TTT-01", points: 90 },
    { teamId: "tree-b", code: "TTT-01", points: 80 },
    { teamId: "py-a", code: "CRANK", points: 300 },
    { teamId: "py-b", code: "CRANK", points: 200 },
  ];
  assert.deepEqual(
    rankedTeamTotalsByCamp(teams, scores).map((row) => [row.id, row.rank]),
    [["tree-a", 1], ["tree-b", 2], ["py-a", 1], ["py-b", 2]],
  );
});

test("team deletion dependencies include every related collection", () => {
  const members = [
    { id: "member-a", teamId: "team-a" },
    { id: "member-b", teamId: "team-b" },
  ];
  const summary = teamReferenceSummary("team-a", {
    members,
    scores: [
      { teamId: "team-a", code: "A", points: 10 },
      { teamId: "team-b", code: "A", points: 20 },
    ],
    tickets: [{ id: "ticket-a", teamId: "team-a", amount: 1 }],
    achievements: [
      { earnedBy: ["team-a", { type: "member", id: "member-a" }, { teamId: "team-b" }] },
    ],
  });

  assert.deepEqual(summary, {
    members: 1,
    scores: 1,
    tickets: 1,
    achievementRecipients: 2,
  });
  assert.equal(hasTeamReferences(summary), true);
  assert.equal(hasTeamReferences({ members: 0, scores: 0, tickets: 0, achievementRecipients: 0 }), false);
});

test("whole-team replacement finds references to every removed team", () => {
  const blocked = removedTeamReferenceSummaries(
    [{ id: "team-a", name: "A" }, { id: "team-b", name: "B" }],
    [{ id: "team-b", name: "B" }],
    {
      members: [{ id: "member-a", teamId: "team-a" }],
      scores: [{ teamId: "team-a", code: "PYS-01", points: 80 }],
      tickets: [],
      achievements: [{ earnedBy: [{ type: "member", id: "member-a", count: 1 }] }],
    },
  );
  assert.equal(blocked.length, 1);
  assert.equal(blocked[0].team.id, "team-a");
  assert.deepEqual(blocked[0].summary, {
    members: 1,
    scores: 1,
    tickets: 0,
    achievementRecipients: 1,
  });
});

test("achievement recipient resolution preserves unresolved IDs visibly", () => {
  const recipients = resolveAchievementRecipients([
    "team-a",
    { type: "member", id: "missing-member", count: 2 },
    { type: "team", id: "missing-team" },
    "legacy-missing",
  ], [{ id: "team-a", name: "Team A", camp: "trees" }], []);

  assert.equal(recipients[0].name, "Team A");
  assert.equal(recipients[0].missing, false);
  assert.deepEqual(
    recipients.slice(1).map(({ name, count, missing }) => ({ name, count, missing })),
    [
      { name: "Missing member reference: missing-member", count: 2, missing: true },
      { name: "Missing team reference: missing-team", count: 1, missing: true },
      { name: "Missing recipient reference: legacy-missing", count: 1, missing: true },
    ],
  );
});

test("achievement validation rejects malformed recipient records", () => {
  const invalid = [{
    id: "award-1",
    name: "Award",
    earnedBy: [
      "",
      { type: "camper", id: "alias-1", count: 1 },
      { type: "member", id: "", count: 1 },
      { type: "team", id: "team-1", count: 1.5 },
    ],
  }];
  const errors = validateCollection("achievements", invalid).join("\n");
  assert.match(errors, /legacy recipient id cannot be blank/);
  assert.match(errors, /expected "team" or "member"/);
  assert.match(errors, /recipient id cannot be blank/);
  assert.match(errors, /positive integer/);
});

test("schedule exposes unique operational score codes including CRANK", () => {
  const schedule = readJson("src/data/schedule.json");
  const blocks = schedule.flatMap((day) => day.blocks || []);
  const scoreCodes = blocks.map((block) => block.scoreCode || block.code).filter(Boolean);
  assert.equal(new Set(scoreCodes).size, scoreCodes.length);
  assert.ok(scoreCodes.includes("PYS-02R"));
  assert.ok(scoreCodes.includes("CRANK"));
  assert.equal(blocks.find((block) => block.code === "CRANK")?.note.includes("live addition"), true);
});

test("schedule validation requires the camp join key used by the public page", () => {
  const [first, ...rest] = readJson("src/data/schedule.json");
  const withoutCamp = { ...first };
  delete withoutCamp.camp;
  assert.match(validateCollection("schedule", [withoutCamp, ...rest]).join("\n"), /schedule\[0\]\.camp: missing required key/);
});

test("schedule editor keeps block camp inheritance stable when a day changes camp", () => {
  const added = newScheduleBlock(() => "block-1");
  assert.equal(added.camp, "");

  const changed = changeScheduleDayCamp({
    camp: "trees",
    blocks: [
      { id: "inherited", camp: "" },
      { id: "legacy-copy", camp: "trees" },
      { id: "intentional-override", camp: "pystem" },
    ],
  }, "pystem");
  assert.equal(changed.camp, "pystem");
  assert.deepEqual(changed.blocks.map((block) => block.camp), ["", "", "pystem"]);
});

test("the landing page closes the schedule after the final block in Eastern time", () => {
  const finalDay = [{
    day: "Fri, Jul 10",
    date: "2026-07-10",
    theme: "Final showcase",
    blocks: [{ start: "14:00", end: "15:00", title: "Awards" }],
  }];
  const beforeClose = new Date("2026-07-10T18:59:00Z");
  const afterClose = new Date("2026-07-10T19:01:00Z");

  assert.equal(upcomingSchedule(finalDay, 2026, beforeClose)?.blocks[0].title, "Awards");
  assert.equal(isScheduleComplete(finalDay, 2026, beforeClose), false);
  assert.equal(upcomingSchedule(finalDay, 2026, afterClose), null);
  assert.equal(isScheduleComplete(finalDay, 2026, afterClose), true);
});

test("every deck activity has exactly one handout and one guide", () => {
  const files = readJson("src/data/files.json");
  const deck = [...TREES_DECK, ...PY_DECK, ...TREESB_DECK, ...PYB_DECK].filter((activity) => !activity.welcome);
  for (const activity of deck) {
    const docs = files.filter((file) => file.code === activity.code && file.category === "Activity");
    assert.equal(docs.filter((file) => file.kind === "handout").length, 1, `${activity.code} handout`);
    assert.equal(docs.filter((file) => file.kind === "guide").length, 1, `${activity.code} guide`);
  }
  const scheduleCodes = new Set(readJson("src/data/schedule.json").flatMap((day) => day.blocks || []).map((block) => block.code));
  for (const welcome of [...TREES_DECK, ...PY_DECK].filter((activity) => activity.welcome)) {
    assert.equal(scheduleCodes.has(welcome.code), false, `${welcome.code} collides with a schedule code`);
  }
});

test("public station counts match the canonical lazy deck catalog", () => {
  const primaryDecks = { trees: TREES_DECK, pystem: PY_DECK };
  for (const [camp, deck] of Object.entries(primaryDecks)) {
    assert.equal(
      PRIMARY_STATIONS_BY_CAMP[camp],
      deck.filter((activity) => !activity.welcome).length,
      `${camp} primary station count`,
    );
  }
  assert.equal(
    PRIMARY_STATION_COUNT,
    Object.values(PRIMARY_STATIONS_BY_CAMP).reduce((total, count) => total + count, 0),
  );
  assert.equal(BACKUP_STATION_COUNT, TREESB_DECK.length + PYB_DECK.length);
  assert.doesNotMatch(readText("src/site/pages/Home.jsx"), /(?:from|import\()\s*["'][^"']*\/deck\//);
});

test("published file metadata matches the shipped library", () => {
  const files = readJson("src/data/files.json");
  const publicDir = path.join(repo, "public", "files");
  const pdfNames = fs.readdirSync(publicDir).filter((name) => name.endsWith(".pdf")).sort();
  assert.equal(files.length, pdfNames.length);
  for (const file of files) {
    const absolute = path.join(repo, "public", file.path);
    assert.equal(fs.statSync(absolute).size, file.bytes, file.path);
  }
  assert.match(
    files.find((file) => file.id === "TTT-10-handout")?.desc || "",
    /practice-card.*real climate reconstruction/i,
  );
  assert.match(
    files.find((file) => file.id === "TTT-12-guide")?.desc || "",
    /standardized density.*counts alone.*water use/i,
  );
  assert.equal(
    files.some((file) => /Instructor_Answer_Keys/.test(file.path) || /answer.?keys/i.test(file.id)),
    false,
    "staff-only answer keys must not appear in public file metadata",
  );
  assert.equal(
    fs.existsSync(path.join(publicDir, "From_Trees_to_Tech_Instructor_Answer_Keys.pdf")),
    false,
    "Trees staff-only answer key must not be published",
  );
});

test("file validation blocks paths that have not resolved to a shipped file", () => {
  const files = readJson("src/data/files.json");
  const missingBytes = { ...files[0] };
  delete missingBytes.bytes;
  assert.match(validateCollection("files", [missingBytes]).join("\n"), /missing required key/);
});

test("deck manifest records all 66 component exports", () => {
  const manifest = readJson("src/deck/_MANIFEST.json");
  const components = manifest.publicExportNames.filter((name) => /^(Demo|Extra)/.test(name));
  assert.equal(components.length, 66);
  assert.ok(components.includes("ExtraCipherRule"));
  assert.ok(components.includes("ExtraEncode"));
  assert.deepEqual(
    manifest.modules.find((entry) => entry.file === "Home.jsx")?.defines,
    ["StationCard", "BackupCard", "Home"],
  );
  const extrasIndex = readText("src/deck/components/extras/index.js");
  const demosIndex = readText("src/deck/components/demos/index.js");
  for (const [file, source] of [
    ["components/extras/index.js", extrasIndex],
    ["components/demos/index.js", demosIndex],
  ]) {
    const importCount = source.split("\n").filter((line) => line.startsWith("import ")).length;
    const indexManifest = manifest.modules.find((entry) => entry.file === file);
    assert.equal(indexManifest.imports.modules, importCount, file);
  }
});

test("known mismatched protected visuals stay disconnected from science slides", () => {
  const demoIndex = readText("src/deck/components/demos/index.js");
  const extraIndex = readText("src/deck/components/extras/index.js");
  const demoRoutes = new Set(
    [...demoIndex.matchAll(/^\s*([a-z][a-z0-9]*)\s*:\s*Demo\w+\s*,?$/gm)]
      .map((match) => match[1]),
  );
  const extraRoutes = new Set(
    [...extraIndex.matchAll(/^\s*"([^"]+)"\s*:\s*Extra\w+\s*,?$/gm)]
      .map((match) => match[1]),
  );
  const science = [TREES_DECK, PY_DECK, TREESB_DECK, PYB_DECK]
    .flat()
    .flatMap((activity) => activity.science || []);

  const disabledDemos = [
    "mudwatt", "capillary", "oobleck", "samara", "lotus", "magnet", "pinhole", "bookbot",
  ];
  for (const key of disabledDemos) {
    assert.equal(demoRoutes.has(key), false, `${key} demo must remain unrouted`);
    assert.equal(science.some((slide) => slide.demo === key), false, `${key} demo key returned to deck data`);
  }

  const disabledExtras = [
    "Completing the circuit",
    "Microclimate varies in meters",
    "Evidence-based siting",
    "Material and geometry",
    "Evidence from the tour",
    "Bilayer biomimicry",
    "Observation as evidence",
    "Sound transmission",
    "Heart rate and recovery",
    "Median and improvement",
    "The aperture tradeoff",
    "Mapping forces",
    "Glide versus control",
    "Slope and runoff",
    "Angles give height",
    "Urban heat and shade",
    "Data-backed routing",
    "Controlled variables",
    "Pressure vs force",
    "Spreading stress",
    "Signals travel in a chain",
    "Gaps and insulation",
    "Mechanical advantage",
    "Force and direction",
    "Check digits catch errors",
    "Claim, evidence, reasoning",
    "Stomata: pores for gas exchange",
  ];
  for (const title of disabledExtras) {
    assert.ok(science.some((slide) => slide.t === title), `${title} corrected science text disappeared`);
    assert.equal(extraRoutes.has(title), false, `${title} protected visual must remain unrouted`);
  }

  const treeRingSlide = science.find((slide) => slide.t === "Rings as proxy data");
  assert.match(treeRingSlide?.b || "", /cross-date many trees/i);
  assert.match(treeRingSlide?.b || "", /depends on species and site/i);
  assert.match(treeRingSlide?.b || "", /authored practice-card code/i);
  assert.doesNotMatch(treeRingSlide?.b || "", /Wide rings mean a good growing season/i);

  const treeRingActivity = TREES_DECK.find((activity) => activity.code === "TTT-10");
  assert.match(treeRingActivity?.sub || "", /stylized rings as proxy evidence/i);
  assert.match(treeRingActivity?.mission || "", /authored ring-card code/i);
  assert.match(treeRingActivity?.scoring || "", /practice-card code/i);
  assert.match(treeRingActivity?.steps?.[0]?.b || "", /alternating light and dark fill only separates/i);
  assert.match(treeRingActivity?.steps?.[2]?.b || "", /not as proof of a specific real event/i);
  assert.equal(treeRingActivity?.compete?.[0], "Practice-code inferences: 40");

  const stomataActivity = TREES_DECK.find((activity) => activity.code === "TTT-12");
  assert.match(stomataActivity?.mission || "", /standardized field of view/i);
  assert.match(stomataActivity?.science?.[0]?.b || "", /Counts alone cannot rank actual water use/i);
  assert.match(stomataActivity?.scoring || "", /standardized density comparison/i);
  assert.match(stomataActivity?.source || "", /PMC6414756/);
  assert.match(stomataActivity?.source || "", /PMC11565199/);
  assert.doesNotMatch(stomataActivity?.sub || "", /rank leaves by water strategy/i);
});

test("restored deck visuals encode the current public activity models", () => {
  const demoIndex = readText("src/deck/components/demos/index.js");
  const extraIndex = readText("src/deck/components/extras/index.js");
  assert.match(demoIndex, /^\s*treering:\s*DemoTreering,?$/m);
  assert.match(extraIndex, /^\s*"Sampling and counting":\s*ExtraSampling,?$/m);
  assert.match(extraIndex, /^\s*"Routing and search":\s*ExtraSearch,?$/m);
  assert.match(extraIndex, /^\s*"Criteria and constraints":\s*ExtraDecision,?$/m);

  const treeRingActivity = TREES_DECK.find((activity) => activity.code === "TTT-10");
  assert.equal(treeRingActivity?.science?.[0]?.demo, "treering");

  const treeRingSource = readText("src/deck/components/demos/DemoTreering.jsx");
  assert.match(treeRingSource, /widths:\s*\[2, 3, 2, 2, 1, 1, 2, 3\],\s*mark:\s*4/);
  assert.match(treeRingSource, /widths:\s*\[3, 2, 1, 1, 2, 3, 1, 2\],\s*mark:\s*6/);
  assert.match(treeRingSource, /model-favorable/);
  assert.match(treeRingSource, /model-stress/);
  assert.match(treeRingSource, /model-disturbance/);
  assert.match(treeRingSource, /cross-date/i);
  assert.match(treeRingSource, /local weather/i);
  assert.match(treeRingSource, /species and site/i);
  assert.doesNotMatch(treeRingSource, /wet warm year|fire scar|const y0\s*=|const drought\s*=/i);

  const samplingSource = readText("src/deck/components/extras/ExtraSampling.jsx");
  assert.match(samplingSource, /counts:\s*\[18, 22, 16, 20, 19, 23\]/);
  assert.match(samplingSource, /counts:\s*\[11, 14, 13, 12, 16, 10\]/);
  assert.match(samplingSource, /same leaf surface/i);
  assert.match(samplingSource, /mean and range/i);
  assert.match(samplingSource, /at\s+least\s+three\s+fields/i);
  assert.match(samplingSource, /counts alone cannot rank actual water use/i);
  assert.doesNotMatch(samplingSource, /whole-leaf truth|percent error|Ttrue|estimate the whole leaf/i);

  const routeSource = readText("src/deck/components/extras/ExtraSearch.jsx");
  assert.match(routeSource, /const ROW_LABELS\s*=\s*\["A", "B", "C", "D"\]/);
  assert.match(routeSource, /const COLUMN_LABELS\s*=\s*\[1, 2, 3, 4, 5, 6\]/);
  assert.match(routeSource, /PRACTICE_REQUEST\s*=\s*Object\.freeze\(\["A6", "C2", "D5"\]\)/);
  assert.match(routeSource, /visitOrder:\s*Object\.freeze\(\["C2", "D5", "A6"\]\)/);
  assert.match(routeSource, /hasIllegalMove/);
  assert.match(routeSource, /DEPOT is immediately left/i);
  assert.match(routeSource, /one orthogonal edge per move/i);
  assert.doesNotMatch(routeSource, /nearest-neighbor|diagonal moves|smart route/i);

  const address = (value) => ({
    row: value.charCodeAt(0) - 65,
    column: Number(value.slice(1)) - 1,
  });
  const practiceMoveCount = (order) => {
    const cells = order.map(address);
    const depotDistance = (cell) => 1 + cell.row + cell.column;
    return depotDistance(cells[0])
      + cells.slice(1).reduce((sum, cell, index) => (
        sum
        + Math.abs(cell.row - cells[index].row)
        + Math.abs(cell.column - cells[index].column)
      ), 0)
      + depotDistance(cells.at(-1));
  };
  assert.equal(practiceMoveCount(["A6", "C2", "D5"]), 24);
  assert.equal(practiceMoveCount(["C2", "D5", "A6"]), 18);

  const decisionSource = readText("src/deck/components/extras/ExtraDecision.jsx");
  const clientPattern = /id:\s*"([A-D])",\s*name:\s*"([^"]+)",\s*riseCm:\s*(\d+),\s*runPerRise:\s*(\d+),\s*weightPieces:\s*(\d+),\s*foldPanels:\s*(\d+),\s*maxPanelCm:\s*(\d+)/g;
  const clients = [...decisionSource.matchAll(clientPattern)].map((match) => ({
    id: match[1],
    name: match[2],
    riseCm: Number(match[3]),
    runPerRise: Number(match[4]),
    weightPieces: Number(match[5]),
    foldPanels: Number(match[6]),
    maxPanelCm: Number(match[7]),
  }));
  assert.deepEqual(clients, [
    { id: "A", name: "Community school", riseCm: 5, runPerRise: 12, weightPieces: 1, foldPanels: 2, maxPanelCm: 31 },
    { id: "B", name: "Public library", riseCm: 4, runPerRise: 14, weightPieces: 2, foldPanels: 2, maxPanelCm: 29 },
    { id: "C", name: "Health clinic", riseCm: 6, runPerRise: 12, weightPieces: 3, foldPanels: 3, maxPanelCm: 25 },
    { id: "D", name: "Science museum", riseCm: 4, runPerRise: 16, weightPieces: 4, foldPanels: 2, maxPanelCm: 33 },
  ]);
  assert.deepEqual(
    clients.map((client) => {
      const runCm = client.riseCm * client.runPerRise;
      const exactDeckCm = Math.hypot(runCm, client.riseCm);
      const cutDeckCm = Math.ceil(exactDeckCm);
      return [runCm, exactDeckCm.toFixed(1), cutDeckCm, (cutDeckCm / client.foldPanels).toFixed(1)];
    }),
    [
      [60, "60.2", 61, "30.5"],
      [56, "56.1", 57, "28.5"],
      [72, "72.2", 73, "24.3"],
      [64, "64.1", 65, "32.5"],
    ],
  );
  assert.match(decisionSource, /unwound car/i);
  assert.match(decisionSource, /mid-span/i);
  assert.match(decisionSource, /cannot\s+predict\s+prototype\s+strength/i);
  assert.doesNotMatch(decisionSource, /loadLb|quadratic|250\s*lb|35\s*lb|capacity formula/i);

  const rampSource = readText("src/deck/components/demos/DemoRamp.jsx");
  assert.match(rampSource, /unwound, unweighted cart/i);
  assert.match(rampSource, /not an accessibility-compliance verdict/i);
  assert.doesNotMatch(rampSource, /loadLb|\blbf\b|push force|mech\. advantage/i);

  for (const source of [treeRingSource, samplingSource, routeSource, decisionSource, rampSource]) {
    assert.match(source, /prefers-reduced-motion/);
    assert.match(source, /role="img"/);
  }
  const presentationSource = readText("src/deck/Presentation.jsx");
  assert.match(presentationSource, /button, input, select, textarea/);
  assert.match(presentationSource, /role=\"slider\"/);

  const rampActivity = PY_DECK.find((activity) => activity.code === "PYS-12");
  assert.match(rampActivity?.mission || "", /portable tabletop ramp/i);
  assert.match(rampActivity?.science?.[0]?.b || "", /not a compliance review/i);
  assert.match(rampActivity?.science?.[1]?.b || "", /unwound cart/i);
  assert.match(rampActivity?.science?.[1]?.b || "", /hanging at mid-span/i);
  assert.match(rampActivity?.source || "", /U\.S\. Access Board/);
});

test("dangerous legacy regeneration commands are retired", () => {
  const pkg = readJson("package.json");
  assert.equal(pkg.scripts["deck:split"], undefined);
  assert.match(readText("tools/split_deck.cjs"), /retired/i);
  assert.match(readText("tools/gen_files.mjs"), /retired/i);
});

test("public metadata uses the canonical custom domain", () => {
  const html = fs.readFileSync(path.join(repo, "index.html"), "utf8");
  assert.match(html, /https:\/\/campnotebook\.org\/og-card\.png/);
  assert.doesNotMatch(html, /qwareeq8\.github\.io/);
});

test("corrected public documents contain current safety and materials guidance", (t) => {
  try {
    execFileSync("pdftotext", ["-v"], { stdio: "ignore" });
  } catch {
    t.skip("pdftotext is unavailable");
    return;
  }
  const pdfCache = new Map();
  const pdfText = (filename) => {
    if (!pdfCache.has(filename)) {
      const text = execFileSync(
        "pdftotext",
        [path.join(repo, "public", "files", filename), "-"],
      ).toString().replace(/\s+/g, " ");
      pdfCache.set(filename, text);
    }
    return pdfCache.get(filename);
  };
  const pdfPageText = (filename, page) => execFileSync(
    "pdftotext",
    ["-f", String(page), "-l", String(page), path.join(repo, "public", "files", filename), "-"],
  ).toString().replace(/\s+/g, " ");
  const pdfSection = (filename, startText, endText) => {
    const text = pdfText(filename);
    const start = text.indexOf(startText);
    assert.ok(start >= 0, `${filename} is missing section start: ${startText}`);
    const end = text.indexOf(endText, start + startText.length);
    assert.ok(end > start, `${filename} is missing section end: ${endText}`);
    return text.slice(start, end);
  };
  const ttb04 = pdfText("TTB_04_Photosynthesis_Float_Off_Playoffs_Instructor_Guide.pdf");
  assert.doesNotMatch(ttb04, /MISSING from the buy list|borrow 4, or share/);

  for (const filename of [
    "PYS_01_Magnetic_Capsule_Maze_Cup_Student_Handout.pdf",
    "PY_STEM_Student_Handout_Packet.pdf",
  ]) {
    const text = pdfText(filename);
    assert.match(text, /may have swallowed a magnet, tell an adult immediately and get medical help/i);
    assert.doesNotMatch(text, /Swallowing two magnets/);
  }

  for (const filename of [
    "PYS_02_Oobleck_Armor_Arena_Instructor_Guide.pdf",
    "PY_STEM_Instructor_Guide_Packet.pdf",
  ]) {
    assert.doesNotMatch(pdfText(filename), /test weights/);
  }

  for (const filename of [
    "PYS_03_Cardboard_Automata_Arcade_Student_Handout.pdf",
    "PY_STEM_Student_Handout_Packet.pdf",
  ]) {
    assert.match(pdfText(filename), /low-temperature hot glue is staff-only/i);
  }

  const heartLog = pdfText("PYS_04_Heart_Rate_Recovery_Log.pdf");
  assert.match(heartLog, /radial pulse at the wrist only/i);
  assert.match(heartLog, /not a fitness or medical test/i);
  for (const filename of [
    "PYS_04_Stethoscope_Sprint_and_Recovery_Challenge_Instructor_Guide.pdf",
    "PY_STEM_Instructor_Guide_Packet.pdf",
  ]) {
    const text = pdfText(filename);
    assert.match(text, /repeated pulse counts use the same method and conditions/i);
    assert.doesNotMatch(text, /what does a fast recovery suggest/i);
  }

  for (const filename of [
    "PYS_06_SONAR_Slinky_Showdown_Student_Handout.pdf",
    "PY_STEM_Student_Handout_Packet.pdf",
  ]) {
    const text = pdfText(filename);
    assert.match(text, /total distance = 2 × L × N/i);
    assert.match(text, /goggles whenever the slinky is stretched/i);
    assert.doesNotMatch(text, /count 4 to 6 reflections/i);
  }
  const slinkyCards = pdfText("PYS_06_Slinky_Station_Cards.pdf");
  // The two-column card PDF can interleave adjacent-column text at a line
  // wrap, so assert both halves of the printed equation independently.
  assert.match(slinkyCards, /total distance = 2 × L ×/i);
  assert.match(slinkyCards, /N\. Divide that distance by the total time/i);

  const hovercraftRules = pdfText("PYS_09_Hovercraft_Target_and_Rules.pdf");
  assert.match(hovercraftRules, /field-best distance/i);
  assert.match(hovercraftRules, /raw five-shot total ÷ 6/i);

  for (const filename of [
    "PYS_11_BookBot_Bin_Logic_Challenge_Student_Handout.pdf",
    "PYS_11_BookBot_Bin_Logic_Challenge_Instructor_Guide.pdf",
    "PY_STEM_Student_Handout_Packet.pdf",
    "PY_STEM_Instructor_Guide_Packet.pdf",
  ]) {
    const text = pdfText(filename);
    assert.match(text, /DEPOT/i);
    assert.match(text, /Efficiency versus card optimum/i);
    assert.doesNotMatch(text, /traffic jams|What made one route faster/i);
  }
  const pystemScores = pdfText("PY_STEM_Score_Sheets_and_Leaderboard.pdf");
  assert.match(pystemScores, /Legal complete route/i);
  assert.match(pystemScores, /Efficiency versus card optimum/i);
  assert.doesNotMatch(pystemScores, /Low traffic conflicts/i);

  const neuronHandout = pdfText("PYB_02_Domino_Neuron_Relay_Student_Handout.pdf");
  assert.match(neuronHandout, /limited model of signal propagation along one axon/i);
  assert.match(neuronHandout, /not a literal synapse or myelin sheath/i);
  assert.match(neuronHandout, /one shared backup track/i);
  assert.match(neuronHandout, /about 16 tiles total; teams rotate/i);
  assert.match(neuronHandout, /shared rulers/i);
  assert.doesNotMatch(neuronHandout, /myelin-cluster/i);
  const pystemInstructorPacket = pdfText("PY_STEM_Instructor_Guide_Packet.pdf");
  assert.match(pystemInstructorPacket, /Dominoes: about 16 tiles for one shared backup track/i);
  assert.match(pystemInstructorPacket, /Rulers: shared at the backup track/i);

  const staleStudentTemplate = /The ONE variable we are testing|Baseline result|After redesign|DEFEND YOUR DESIGN|What evidence made you change your design|ONE thing you would change/i;
  const staleGuideTemplate = /controlling one variable|redesign improved|change one variable at a time|before any redesign|log a baseline|Phase 4 Build or solve|Phase 6 Redesign|Tier 2 \(building but not reasoning\)|changes exactly one variable|compare against baseline|PPE off|quantify their improvement|single change could improve|isolates a different variable|Stage only the activity-specific safety controls|Put out PPE/i;
  const stalePacketGuide = /one variable at a time|before redesign|standard test for a baseline|Redesign one variable|compare to baseline/i;

  const pystemStudentPacket = "PY_STEM_Student_Handout_Packet.pdf";
  const pystemGuidePacket = "PY_STEM_Instructor_Guide_Packet.pdf";
  const pystemActivities = [
    {
      code: "PYS-06",
      nextCode: "PYS-07",
      handout: "PYS_06_SONAR_Slinky_Showdown_Student_Handout.pdf",
      guide: "PYS_06_SONAR_Slinky_Showdown_Instructor_Guide.pdf",
      handoutPositive: /Measured lane length L.*DEFEND YOUR WAVE MODEL/is,
      guidePositive: /Phase 6 Evidence defense.*total distance = 2 x L x N/is,
      guideTemplatePositive: /Phase 4 Run fixed wave stations.*Tier 2 \(measuring but not reasoning\)/is,
      packetPositive: /total distance = 2 × L × N/i,
      guidePacketPositive: /Fixed protocol: predict each station first/i,
    },
    {
      code: "PYS-08",
      nextCode: "PYS-09",
      handout: "PYS_08_Low_Ropes_Force_Map_Relay_Student_Handout.pdf",
      guide: "PYS_08_Low_Ropes_Force_Map_Relay_Instructor_Guide.pdf",
      handoutPositive: /four fixed challenges.*EXPLAIN YOUR FORCE MAP/is,
      guidePositive: /four fixed challenge cards.*Phase 6 Evidence defense/is,
      guideTemplatePositive: /Phase 4 Run fixed challenges.*Tier 2 \(completing challenges but not reasoning\)/is,
      packetPositive: /next to a clear wall/i,
      guidePacketPositive: /Rotate through the four fixed challenge cards/i,
    },
    {
      code: "PYS-10",
      nextCode: "PYS-11",
      handout: "PYS_10_Spectra_Sleuth_Showdown_Student_Handout.pdf",
      guide: "PYS_10_Spectra_Sleuth_Showdown_Instructor_Guide.pdf",
      handoutPositive: /Proposed source match and visible evidence.*DEFEND YOUR MATCHES/is,
      guidePositive: /observe, sketch, match, and justify.*Phase 6 Evidence check/is,
      guideTemplatePositive: /Phase 4 Observe and match spectra.*Tier 2 \(matching but not reasoning\)/is,
      packetPositive: /Sketch the spectra.*Match to clue cards/is,
      guidePacketPositive: /observe, sketch, match, and justify/i,
    },
    {
      code: "PYS-11",
      nextCode: "PYS-12",
      handout: "PYS_11_BookBot_Bin_Logic_Challenge_Student_Handout.pdf",
      guide: "PYS_11_BookBot_Bin_Logic_Challenge_Instructor_Guide.pdf",
      handoutPositive: /card minimum.*DEFEND YOUR ROUTE/is,
      guidePositive: /Phase 6 Algorithm defense.*card minimum/is,
      guideTemplatePositive: /Phase 4 Run the shared-mat route.*Tier 2 \(routing but not reasoning\)/is,
      packetPositive: /DEPOT.*orthogonally adjacent/is,
      guidePacketPositive: /Shared-mat rules.*card's verified optimum/is,
    },
    {
      code: "PYB-04",
      nextCode: "PYB-05",
      handout: "PYB_04_Barcode_Checksum_Rescue_Student_Handout.pdf",
      guide: "PYB_04_Barcode_Checksum_Rescue_Instructor_Guide.pdf",
      handoutPositive: /12-digit UPC-A.*DEFEND YOUR VERDICT/is,
      guidePositive: /verify and classify 12-digit UPC-A codes.*Phase 6 Verification audit/is,
      guideTemplatePositive: /Phase 4 Verify UPC-A codes.*Tier 2 \(calculating but not reasoning\)/is,
      packetPositive: /odd positions.*multiply.*by 3/i,
      guidePacketPositive: /UPC-A rule: verify 12 digits from the left/i,
    },
  ];
  for (const activity of pystemActivities) {
    const handout = pdfText(activity.handout);
    const guide = pdfText(activity.guide);
    const studentPacketSection = pdfSection(
      pystemStudentPacket,
      `ACTIVITY ${activity.code}`,
      `ACTIVITY ${activity.nextCode}`,
    );
    const guidePacketSection = pdfSection(
      pystemGuidePacket,
      `INSTRUCTOR · ${activity.code}`,
      `INSTRUCTOR · ${activity.nextCode}`,
    );
    assert.match(handout, activity.handoutPositive);
    assert.match(guide, activity.guidePositive);
    assert.match(guide, activity.guideTemplatePositive);
    assert.match(studentPacketSection, activity.packetPositive);
    assert.match(guidePacketSection, activity.guidePacketPositive);
    assert.match(handout, /HOW TO RUN IT/i);
    assert.match(studentPacketSection, /RUN IT/i);
    assert.doesNotMatch(handout, staleStudentTemplate);
    assert.doesNotMatch(guide, staleGuideTemplate);
    assert.doesNotMatch(studentPacketSection, staleStudentTemplate);
    assert.doesNotMatch(guidePacketSection, stalePacketGuide);
    assert.doesNotMatch(handout, /HOW TO BUILD AND RUN IT/i);
    assert.doesNotMatch(studentPacketSection, /BUILD AND RUN IT/i);
  }
  const balanceHandout = pdfText("PYS_08_Low_Ropes_Force_Map_Relay_Student_Handout.pdf");
  assert.doesNotMatch(balanceHandout, /every challenge.*back and heels touching/i);

  const pystemSigns = pdfText("PY_STEM_Station_Signs.pdf");
  const hovercraftHandout = pdfText("PYS_09_Hovercraft_Hockey_Hackathon_Student_Handout.pdf");
  const hovercraftPacketSection = pdfSection(
    pystemStudentPacket,
    "ACTIVITY PYS-09",
    "ACTIVITY PYS-10",
  );
  const hovercraftSignSection = pdfSection(
    "PY_STEM_Station_Signs.pdf",
    "PYS-09",
    "PYS-10",
  );
  for (const text of [hovercraftHandout, hovercraftPacketSection, hovercraftSignSection]) {
    assert.match(text, /Highest normalized glide and five-shot target scores/i);
    assert.doesNotMatch(text, /Best glide plus control/i);
  }
  const signChecks = [
    ["PYS-06", "PYS-07", /SEND PULSE.*TIME N TRIPS.*CALCULATE.*DEFEND/is],
    ["PYS-08", "PYS-09", /TEST FIXED CARD.*MAP FORCES.*COMPARE.*SCORE/is],
    ["PYS-10", "PYS-11", /OBSERVE.*SKETCH.*MATCH.*JUSTIFY/is],
    ["PYS-11", "PYS-12", /PLAN.*RUN SHARED MAT.*COUNT MOVES.*CHECK OPTIMUM.*DEFEND/is],
    ["PYB-04", "PYB-05", /LEARN RULE.*CALCULATE.*VERIFY.*AUDIT.*EXPLAIN/is],
  ];
  for (const [code, nextCode, expected] of signChecks) {
    const start = pystemSigns.indexOf(code);
    const end = pystemSigns.indexOf(nextCode, start + code.length);
    assert.ok(start >= 0 && end > start, `missing ${code} station-sign section`);
    const section = pystemSigns.slice(start, end);
    assert.match(section, expected);
    assert.doesNotMatch(section, /BUILD or SOLVE|REDESIGN/i);
    if (code === "PYS-11") {
      assert.match(section, /fewest legal moves, card[-\s]?normalized efficiency/i);
      assert.doesNotMatch(section, /few traffic conflicts/i);
    }
  }

  const treeRingHandout = pdfText("TTT_10_Tree_Ring_Climate_Detective_Tournament_Student_Handout.pdf");
  const treeRingGuide = pdfText("TTT_10_Tree_Ring_Climate_Detective_Tournament_Instructor_Guide.pdf");
  const treesStudentPacket = "From_Trees_to_Tech_Student_Handout_Packet.pdf";
  const treesGuidePacket = "From_Trees_to_Tech_Instructor_Guide_Packet.pdf";
  const treeRingStudentPacket = pdfSection(treesStudentPacket, "ACTIVITY TTT-10", "ACTIVITY TTT-11");
  const treeRingGuidePacket = pdfSection(treesGuidePacket, "INSTRUCTOR · TTT-10", "INSTRUCTOR · TTT-11");
  const treeRingPrintable = pdfText("TTT_10_Tree_Ring_Cards_and_Boards.pdf");
  for (const text of [treeRingHandout, treeRingGuide, treeRingStudentPacket, treeRingGuidePacket, treeRingPrintable]) {
    assert.match(text, /authored|practice-card|practice code/i);
    assert.doesNotMatch(text, /Wide rings mean a good growing season|Wide equals a favorable year|reconstruct the climate events|Most accurate climate-event inferences|rings that prove it|Which single ring or run of rings most changes your climate story/i);
  }
  assert.match(treeRingHandout, /HOW TO RUN IT/i);
  assert.match(treeRingStudentPacket, /RUN IT/i);
  assert.doesNotMatch(treeRingHandout, /HOW TO BUILD AND RUN IT/i);
  assert.doesNotMatch(treeRingStudentPacket, /BUILD AND RUN IT/i);
  assert.match(treeRingHandout, /gray and white shading only separates adjacent years/i);
  assert.match(treeRingGuide, /cross-date many trees.*local records/is);
  assert.match(treeRingGuide, /Which authored annual band or pattern most changes your model history under the card code/i);
  assert.match(treeRingGuide, /Tier 2 \(applying the card code but not reasoning\)/i);
  assert.doesNotMatch(treeRingGuide, /Tier 2 \(building but not reasoning\)/i);
  assert.match(treeRingPrintable, /gray and white only separates adjacent years/i);
  assert.match(treeRingPrintable, /real climate claims require cross-dated samples and local calibration/i);

  const stomataHandout = pdfText("TTT_12_Leaf_Stomata_Microscope_Detective_Student_Handout.pdf");
  const stomataGuide = pdfText("TTT_12_Leaf_Stomata_Microscope_Detective_Instructor_Guide.pdf");
  const stomataStudentPacket = pdfSection(treesStudentPacket, "ACTIVITY TTT-12", "ACTIVITY TTB-01");
  const stomataGuidePacket = pdfSection(treesGuidePacket, "INSTRUCTOR · TTT-12", "INSTRUCTOR · TTB-01");
  const stomataPrintable = pdfText("TTT_12_Stomata_Counting_Sheet.pdf");
  for (const text of [stomataHandout, stomataGuide, stomataStudentPacket, stomataGuidePacket, stomataPrintable]) {
    assert.match(text, /counts alone cannot rank actual water use/i);
    assert.doesNotMatch(text, /water-saving to water-spending|rank leaves by water strategy|detective ranking|Ranking evidence|more stomata generally means more water lost/i);
  }
  assert.match(stomataHandout, /HOW TO RUN IT/i);
  assert.match(stomataStudentPacket, /RUN IT/i);
  assert.doesNotMatch(stomataHandout, /HOW TO BUILD AND RUN IT/i);
  assert.doesNotMatch(stomataStudentPacket, /BUILD AND RUN IT/i);
  assert.match(stomataHandout, /mean.*range/is);
  assert.match(stomataGuide, /surface, preparation, magnification, field area.*mean and range/is);
  assert.match(stomataGuide, /PMC6414756/);
  assert.match(stomataGuidePacket, /PMC11565199/);
  assert.match(stomataPrintable, /Mean.*Range/is);
  assert.match(stomataGuide, /Tier 2 \(counting but not reasoning\)/i);
  assert.doesNotMatch(stomataGuide, /Tier 2 \(building but not reasoning\)/i);
  assert.doesNotMatch(stomataGuide, staleGuideTemplate);
  assert.doesNotMatch(stomataGuidePacket, stalePacketGuide);

  const treesScores = pdfText("From_Trees_to_Tech_Score_Sheets_and_Leaderboard.pdf");
  assert.match(treesScores, /Practice-code inferences/i);
  for (const text of [stomataHandout, stomataGuide, stomataStudentPacket, stomataGuidePacket, treesScores]) {
    assert.match(text, /Standardized counting accuracy\s+30/i);
    assert.match(text, /Cautious evidence-backed hypothesis\s+25/i);
    assert.match(text, /Mean-and-range data table\s+10/i);
    assert.doesNotMatch(text, /Ranking evidence|Team data table/i);
  }
  assert.doesNotMatch(treesScores, /Correct inferences/i);
  const treesSigns = pdfText("From_Trees_to_Tech_Station_Signs.pdf");
  assert.match(pdfSection("From_Trees_to_Tech_Station_Signs.pdf", "TTT-10", "TTT-11"), /APPLY CARD CODE.*CITE BANDS.*CHECK LIMITS/is);
  assert.match(pdfSection("From_Trees_to_Tech_Station_Signs.pdf", "TTT-12", "TTB-01"), /COUNT 3\+ FIELDS.*MEAN \+ RANGE.*HYPOTHESIZE/is);
  assert.match(treesSigns, /Most accurate use of the practice-card code/i);

  const masterGuide = pdfText("2026_STEM_Camps_Master_Curriculum_and_Operations_Guide.pdf");
  assert.match(masterGuide, /activity-specific sequences/i);
  assert.match(masterGuide, /a baseline exists only where the activity names one/i);
  assert.match(masterGuide, /Highest normalized glide and five-shot target scores/i);
  assert.match(masterGuide, /fewest legal moves, card[-\s]?normalized efficiency/i);
  assert.match(masterGuide, /Practice-code|practice-card code/i);
  assert.match(masterGuide, /mean, range, and an evidence[-\s]?limited hypothesis/i);
  assert.match(masterGuide, /each 100-point rubric uses the activity's named performance/i);
  assert.doesNotMatch(masterGuide, /built on one engineering-design loop|Every activity moves teams through the same cycle|record a baseline result|Redesign: teams change one variable|100-point rubric rewards design, data quality, teamwork, and explanation/i);

  const pollinatorKit = pdfText("TTT_07_Pollinator_Cards_and_Bloom_Board.pdf");
  assert.match(pollinatorKit, /migrating hummingbirds/i);
  assert.match(pollinatorKit, /rarely sting/i);

  const dropLane = pdfText("TTT_03_Drop_Lane_Strip_and_Landing_Target.pdf");
  for (const distance of [18, 36, 54, 72, 90]) {
    assert.match(dropLane, new RegExp(`ALIGN AT ${distance} CM`, "i"));
  }
  assert.match(pdfText("TTT_08_Eco_Quest_Pack.pdf"), /FIELD VERIFICATION REQUIRED/i);
  for (const filename of [
    "TTT_08_Arboretum_Eco_Quest_Student_Handout.pdf",
    "TTT_08_Arboretum_Eco_Quest_Instructor_Guide.pdf",
    "From_Trees_to_Tech_Student_Handout_Packet.pdf",
    "From_Trees_to_Tech_Instructor_Guide_Packet.pdf",
  ]) {
    const text = pdfText(filename);
    assert.match(text, /adaptive evidence key/i);
    assert.match(text, /staff-verified numbered field tag|staff route key/i);
    assert.doesNotMatch(text, /dichotomous key.*keyed to the route/i);
  }
  const ecoQuestGuide = pdfText("TTT_08_Arboretum_Eco_Quest_Instructor_Guide.pdf");
  assert.match(ecoQuestGuide, /plan an efficient checkpoint route/i);
  assert.match(ecoQuestGuide, /which observable trait supports your answer/i);
  assert.doesNotMatch(
    ecoQuestGuide,
    /controlling one variable|redesign improved|testing begins|change one variable|before any redesign|quantify their improvement|isolates a different variable|building but not reasoning/i,
  );
  const ecoQuestPacketPage = pdfPageText("From_Trees_to_Tech_Instructor_Guide_Packet.pdf", 16);
  assert.match(ecoQuestPacketPage, /field method: stay together on approved paths/i);
  assert.match(ecoQuestPacketPage, /every answer cites an observed trait/i);
  assert.doesNotMatch(ecoQuestPacketPage, /one variable at a time|before redesign|build or redesign/i);
  const ecoQuestStationSign = pdfPageText("From_Trees_to_Tech_Station_Signs.pdf", 8);
  assert.match(ecoQuestStationSign, /OBSERVE.*PLAN ROUTE.*VERIFY.*RECORD EVIDENCE.*SCORE/i);
  assert.doesNotMatch(ecoQuestStationSign, /PREDICT|BUILD or SOLVE|REDESIGN/i);

  const ecoQuest = TREES_DECK.find((activity) => activity.code === "TTT-08");
  const bookBot = PY_DECK.find((activity) => activity.code === "PYS-11");
  assert.match(JSON.stringify(ecoQuest), /adaptive evidence key/i);
  assert.match(JSON.stringify(ecoQuest), /do not treat them as proof of species/i);
  assert.ok(bookBot.compete.includes("Efficiency versus card optimum: 10"));

  assert.equal(
    fs.existsSync(path.join(repo, "public", "files", "PY_STEM_Instructor_Answer_Keys.pdf")),
    false,
    "staff-only answer key must not be published",
  );
});

test("generated SQL is exact, scoped, and non-overwriting at bootstrap", () => {
  const seed = readText("supabase/seed.sql");
  assert.match(seed, /on conflict \(name\) do nothing;/i);
  assert.doesNotMatch(seed, /on conflict \(name\) do update/i);
  for (const name of collections) {
    const json = JSON.stringify(readJson(`src/data/${name}.json`)).replace(/'/g, "''");
    assert.ok(seed.includes(`('${name}', '${json}'::jsonb)`), `${name} seed payload drifted`);
  }

  for (const name of ["files", "schedule", "prizes"]) {
    const sync = readText(`supabase/sync_${name}.sql`);
    const json = JSON.stringify(readJson(`src/data/${name}.json`));
    assert.ok(sync.includes(`values ('${name}', $${name}$${json}$${name}$::jsonb)`), `${name} sync payload drifted`);
    assert.match(sync, /on conflict \(name\) do update set data = excluded\.data;/i);
    assert.deepEqual([...sync.matchAll(/values \('([^']+)'/g)].map((match) => match[1]), [name]);
  }

  const retiredCrankEntry = readText("supabase/enter_crank_scores.sql");
  assert.match(retiredCrankEntry, /RETIRED: DO NOT RUN/i);
  assert.match(retiredCrankEntry, /raise exception 'RETIRED:/i);
  assert.doesNotMatch(retiredCrankEntry, /update\s+public\.collections/i);
});

test("Supabase SQL enforces least privilege and a single allowlisted admin", () => {
  const schema = readText("supabase/schema.sql");
  const hardening = readText("supabase/harden_admin.sql");
  for (const sql of [schema, hardening]) {
    assert.match(sql, /revoke all on table public\.collections from anon, authenticated;/i);
    assert.match(sql, /grant select on table public\.collections to anon, authenticated;/i);
    assert.match(sql, /grant insert, update on table public\.collections to authenticated;/i);
    assert.doesNotMatch(sql, /with check \(true\)/i);
  }
  assert.match(schema, /create trigger collections_touch/i);
  assert.match(hardening, /delete from public\.admin_users where user_id <> target_user_id;/i);
  assert.match(hardening, /cmd in \('ALL', 'INSERT', 'UPDATE', 'DELETE'\)/);
  assert.match(hardening, /target_email = \('ADMIN_EMAIL' \|\| '@example\.com'\)/);
});
