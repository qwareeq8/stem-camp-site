// Focused content checks for the TTT-08 adaptive route printable.

import assert from "node:assert/strict";

import {
  bloomBoard,
  dropLaneStrip,
  plantCards,
  pollinatorCards,
  questAnswerKey,
  questClueCards,
  questKey,
  questRouteMap,
  resilienceGridAppendix,
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

console.log("Team-tools content checks passed");
