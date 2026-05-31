// SSR-render every exported component from the MODULAR deck (src/deck/index.js).
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Deck from "../src/deck/index.js";

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

let tested = 0, failures = 0;
const fails = [];
for (const name of NAMES) {
  tested += 1;
  const C = Deck[name];
  try {
    if (typeof C !== "function") throw new Error("export is not a component (typeof = " + typeof C + ")");
    renderToStaticMarkup(React.createElement(C, {}));
  } catch (e) {
    failures += 1;
    fails.push(name + ": " + (e && e.message ? e.message : String(e)));
  }
}
const exCount = Deck.EXTRAS ? Object.keys(Deck.EXTRAS).length : -1;
const deCount = Deck.DEMOS ? Object.keys(Deck.DEMOS).length : -1;
console.log("components tested: " + tested + ", failures: " + failures);
console.log("routing maps: EXTRAS keys=" + exCount + ", DEMOS keys=" + deCount);
if (fails.length) { console.log("FAILURES:"); for (const f of fails) console.log("  - " + f); }
console.log(failures === 0 ? "ALL PASS" : "HAS FAILURES");
process.exit(failures === 0 ? 0 : 1);
