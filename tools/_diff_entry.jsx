// Render every component from BOTH the monolith and the modular deck and
// compare the static HTML byte-for-byte. Identical output proves the split
// changed no render behavior for the initial state of all 64 components.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Mono from "../reference/Deck.mono.jsx";
import * as Mod from "../src/deck/index.js";

const NAMES = [
  "ExtraCircuit", "ExtraMicroclimate", "ExtraSiting", "ExtraOneVar", "ExtraXylem",
  "ExtraGreenhouse", "ExtraTour", "ExtraPinecone", "ExtraBilayer", "ExtraPollinatorNet",
  "ExtraClump", "ExtraObservation", "ExtraFoodWeb", "ExtraResilience", "ExtraCascade",
  "ExtraCER", "ExtraRoughCoat", "ExtraStomata", "ExtraSampling",
  "ExtraPathPlan", "ExtraStrengthWeight", "ExtraReliability", "ExtraSoundMedia",
  "ExtraHRRecovery", "ExtraReactionTime", "ExtraMedian", "ExtraSonarRange",
  "ExtraAperture", "ExtraCenterMass", "ExtraForceMap", "ExtraGlide",
  "ExtraSpectraFingerprint", "ExtraSearch", "ExtraDecision",
  "ExtraRootsAnchor", "ExtraRunoff", "ExtraTriangulate", "ExtraAccuracy",
  "ExtraHeatGrid", "ExtraCoolRoute", "ExtraPhotoO2", "ExtraControls",
  "ExtraPressure", "ExtraStress", "ExtraDomino", "ExtraGap",
  "ExtraPulley", "ExtraVector", "ExtraChecksum", "ExtraDetect",
  "DemoMudwatt", "DemoCapillary", "DemoOobleck", "DemoSamara", "DemoTreering", "DemoLotus",
  "DemoMagnet", "DemoCam", "DemoWave", "DemoPinhole", "DemoHover", "DemoSpectra",
  "DemoBookbot", "DemoRamp",
];

let same = 0, diff = 0;
const diffs = [];
for (const n of NAMES) {
  let a, b, ea, eb;
  try { a = renderToStaticMarkup(React.createElement(Mono[n], {})); } catch (e) { ea = e.message; }
  try { b = renderToStaticMarkup(React.createElement(Mod[n], {})); } catch (e) { eb = e.message; }
  if (ea || eb) { diff += 1; diffs.push(`${n}: ERR mono=${ea || "ok"} mod=${eb || "ok"}`); continue; }
  if (a === b) { same += 1; } else {
    diff += 1;
    let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k += 1;
    diffs.push(`${n}: differ at char ${k} (mono len ${a.length}, mod len ${b.length}) ...${a.slice(k, k + 60)} | ${b.slice(k, k + 60)}`);
  }
}
console.log(`identical: ${same}/${NAMES.length}, differing: ${diff}`);
for (const d of diffs.slice(0, 25)) console.log("  - " + d);
console.log(diff === 0 ? "SSR IDENTICAL" : "SSR DIFFERS");
process.exit(diff === 0 ? 0 : 1);
