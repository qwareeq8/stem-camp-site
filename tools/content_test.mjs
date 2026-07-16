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
