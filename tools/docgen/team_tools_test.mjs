// Focused content checks for the TTT-08 adaptive route printable.

import assert from "node:assert/strict";

import {
  bloomBoard,
  claimEvidenceCard,
  dropLaneStrip,
  plantCards,
  pollinatorCards,
  questAnswerKey,
  questClueCards,
  questKey,
  questRouteMap,
  resilienceGridAppendix,
  ringAnswerBoard,
  stomataCountAppendix,
  treeRingAnswerKey,
  treeRingCards,
} from "./team_tools.mjs";

const routeMap = questRouteMap();
const studentMaterials = `${questClueCards()}\n${questKey()}\n${routeMap}`;
const staffKey = questAnswerKey();

const mappedCheckpoints = [
  ["Pinetum", "40.1646640, -75.1895180"],
  ["Oak Canopy", "40.1657442, -75.1899040"],
  ["Maple Canopy", "40.1661009, -75.1899147"],
  ["Aesculus Grove", "40.1657401, -75.1908910"],
  ["Columnar Copse", "40.1657996, -75.1918459"],
  ["Beech Grove", "40.1655580, -75.1932590"],
];

for (const [name, coordinates] of mappedCheckpoints) {
  assert.ok(routeMap.includes(name), `Missing mapped checkpoint: ${name}`);
  assert.ok(
    routeMap.includes(coordinates),
    `Missing official map coordinates for ${name}`,
  );
}

assert.match(routeMap, /FIELD VERIFICATION REQUIRED/);
assert.match(routeMap, /Adaptive route plan/);
assert.match(routeMap, /No walking paths are shown/);
assert.match(routeMap, /Accessible alternate\(s\)/);
assert.match(studentMaterials, /Adaptive field evidence key/);
assert.match(staffKey, /COMPLETE ON SITE BEFORE RELEASE/);
assert.match(staffKey, /Numbered tag \+ exact tree name/);
assert.doesNotMatch(studentMaterials, /Trident maple|Katsura|Bender oak/);
assert.doesNotMatch(staffKey, /Expected tree|Deciding clue/);

const secondLaneTile = dropLaneStrip(18);
assert.match(secondLaneTile, />18<\/text>/);
assert.match(secondLaneTile, />36<\/text>/);
assert.match(secondLaneTile, /ALIGN AT 18 CM/);
assert.doesNotMatch(secondLaneTile, /LAUNCH LINE/);

const pollinatorBoard = bloomBoard();
assert.match(pollinatorBoard, /3 edge-sharing cells/);
assert.match(pollinatorBoard, /Plant ID/);
assert.match(pollinatorBoard, /not active/);

const plantDeck = plantCards();
const pollinatorDeck = pollinatorCards();
assert.match(plantDeck, /Eastern Redbud[\s\S]*hummingbirds/);
assert.match(plantDeck, /migrating hummingbirds/);
assert.match(pollinatorDeck, /Native Bees[\s\S]*rarely sting/);
assert.match(pollinatorDeck, /Hummingbirds[\s\S]*Spring[\s\S]*Summer[\s\S]*Fall/);

const resilienceGrid = resilienceGridAppendix();
assert.match(resilienceGrid, /build polish/i);
assert.doesNotMatch(resilienceGrid, /not on looks/i);

const ringStudentMaterials = `${treeRingCards()}\n${ringAnswerBoard()}\n${claimEvidenceCard()}`;
const ringStaffKey = treeRingAnswerKey();
assert.match(ringStudentMaterials, /authored practice code/i);
assert.match(ringStudentMaterials, /alternating gray and white only separates adjacent years/i);
assert.match(ringStudentMaterials, /real climate claims require cross-dated samples and local calibration/i);
assert.match(ringStudentMaterials, /Model event under the card code/i);
assert.match(ringStudentMaterials, /Evidence \(which annual bands\)/i);
assert.match(ringStudentMaterials, /bands support the model assignment/i);
assert.doesNotMatch(
  ringStudentMaterials,
  /Each card is one tree's life|Wide ring = a favorable year|rings that prove it|climate event you infer/i,
);
assert.match(ringStaffKey, /Staff only/i);
assert.match(ringStaffKey, /cross-dates many trees/i);
assert.match(ringStaffKey, /relationships vary by species and site/i);
for (const card of ["A", "B", "C", "D", "E", "F"]) {
  assert.match(ringStaffKey, new RegExp(`Card ${card}`));
}

const stomataSheet = stomataCountAppendix();
assert.match(stomataSheet, /surface, preparation, magnification, and field area/i);
assert.match(stomataSheet, /<th>Mean<\/th><th>Range<\/th>/i);
assert.match(stomataSheet, /Counts alone cannot rank actual water use/i);
assert.doesNotMatch(stomataSheet, /water-saving to water-spending|more stomata generally/i);

console.log("Team-tools content checks passed");
