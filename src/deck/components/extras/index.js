// Routing map of science-slide title -> Extra component.
import { ExtraAccuracy } from "./ExtraAccuracy.jsx";
import { ExtraCascade } from "./ExtraCascade.jsx";
import { ExtraCenterMass } from "./ExtraCenterMass.jsx";
import { ExtraCipherRule } from "./ExtraCipherRule.jsx";
import { ExtraClump } from "./ExtraClump.jsx";
import { ExtraDetect } from "./ExtraDetect.jsx";
import { ExtraEncode } from "./ExtraEncode.jsx";
import { ExtraFoodWeb } from "./ExtraFoodWeb.jsx";
import { ExtraGreenhouse } from "./ExtraGreenhouse.jsx";
import { ExtraOneVar } from "./ExtraOneVar.jsx";
import { ExtraPathPlan } from "./ExtraPathPlan.jsx";
import { ExtraPhotoO2 } from "./ExtraPhotoO2.jsx";
import { ExtraPinecone } from "./ExtraPinecone.jsx";
import { ExtraPollinatorNet } from "./ExtraPollinatorNet.jsx";
import { ExtraReactionTime } from "./ExtraReactionTime.jsx";
import { ExtraReliability } from "./ExtraReliability.jsx";
import { ExtraResilience } from "./ExtraResilience.jsx";
import { ExtraRootsAnchor } from "./ExtraRootsAnchor.jsx";
import { ExtraRoughCoat } from "./ExtraRoughCoat.jsx";
import { ExtraSonarRange } from "./ExtraSonarRange.jsx";
import { ExtraSpectraFingerprint } from "./ExtraSpectraFingerprint.jsx";
import { ExtraStrengthWeight } from "./ExtraStrengthWeight.jsx";

const EXTRAS = {
  // The existing circuit visual combines voltage/current values that violate
  // Ohm's law for its labeled 100 kΩ load. Keep the corrected text only.
  // The legacy microclimate heat map encodes synthetic readings as if they
  // were observations. Keep the evidence-first slide text without that model.
  // The siting visual has the same evidence problem: it invents field readings
  // and an area average instead of using the teams' measurements.
  "One variable at a time": ExtraOneVar,
  // The existing xylem selector still offers felt, which the corrected TTT-04
  // test no longer uses. Keep the accurate activity text until a matching
  // cotton-cloth/paper-towel visual exists.
  "Controlled environments": ExtraGreenhouse,
  // The protected tour visual calls fictional zone readings real evidence.
  // The corrected slide instead asks teams to record the greenhouse settings
  // they actually observe.
  "Hygromorphs": ExtraPinecone,
  // The bilayer animation overstates a deterministic curvature response.
  "Networks, not single plants": ExtraPollinatorNet,
  "Native and clumping logic": ExtraClump,
  // The existing key misclassifies a serrated birch leaf as smooth. Keep the
  // general evidence text without that visual classification exercise.
  "Ecosystems in place": ExtraFoodWeb,
  "Resilience by design": ExtraResilience,
  "Systems thinking": ExtraCascade,
  // The protected claim builder treats narrow rings as proof of drought. The
  // corrected slide requires cross-dated, site-calibrated evidence and keeps
  // uncertainty explicit.
  "Roughness plus coating": ExtraRoughCoat,
  // The protected stomata visual invents an aperture-to-water-loss equation,
  // while the sampling visual invents a whole-leaf total and promises monotonic
  // improvement. The corrected activity compares standardized density samples
  // and states that counts alone cannot rank actual water use.
  "Path planning": ExtraPathPlan,
  "Material efficiency": ExtraStrengthWeight,
  "Reliability": ExtraReliability,
  // The legacy horn visual does not model body-contact stethoscope coupling.
  // The protected recovery visual labels this optional classroom observation
  // as a fitness signal. Keep the wrist-only, non-medical activity text.
  "From signal to muscle": ExtraReactionTime,
  // The existing before/after sample uses unequal trial counts and an invented
  // initial gain. The written median guidance remains authoritative.
  "Echo timing is ranging": ExtraSonarRange,
  // The existing aperture visual treats the smallest hole as maximally sharp
  // and omits diffraction, contradicting this slide's corrected best-size text.
  "Center of mass": ExtraCenterMass,
  // The existing force map depicts a two-rope suspension problem, not PYS-08's
  // four indoor body-balance challenges. Keep this slide text-only.
  // The protected glide visual presents a deterministic hole-size tradeoff
  // that the cited hovercraft activity does not establish. Keep the measured
  // field-best normalization and target rules in text and print.
  "Spectra as fingerprints": ExtraSpectraFingerprint,
  // The protected route visual uses only A-C, puts the dock outside the
  // corrected grid, and draws diagonal moves. Keep the exact A1/depot,
  // orthogonal-only judging rules in the slide text and printable mat.
  // The ramp decision visual invents client constraints and a load formula
  // that do not match the 1:12 model, roll check, and 200 g sag test.
  "Roots anchor soil": ExtraRootsAnchor,
  // The runoff visual is qualitative and cannot support the measured claim.
  // The original triangulation animation omitted observer eye height. The
  // activity text contains the correct formula, so keep this slide text-only
  // until a replacement visual can model the full measurement.
  "Accuracy from method": ExtraAccuracy,
  // Synthetic heat maps and route averages are not field evidence; keep the
  // measurement-first activity text without invented temperatures.
  "Photosynthesis makes oxygen": ExtraPhotoO2,
  // The protected controls visual invents CO₂/temperature treatments and exact
  // gains instead of the activity's light or baking-soda comparison.
  // The protected pressure/stress visuals still use clay, dent depth, and a
  // deterministic 50 N model. The live activity uses EVA foam, graph-paper
  // pierce/no-pierce evidence, and traced protected area.
  // These protected neuron visuals overstate the tabletop analogy: dominoes
  // are not literal nerve propagation, and synaptic success is not determined
  // by gap width. Keep the corrected neuron/myelin/synapse text only.
  // The retired pulley visuals miscounted supporting rope segments and showed
  // an unrelated angled-box vector. The written activity explanation is the
  // authoritative fallback for both concepts.
  // The protected checksum visual uses an unweighted seven-digit modulo rule;
  // the activity cards use 12-digit UPC-A with odd positions multiplied by 3.
  "Detect without false alarms": ExtraDetect,
  "A cipher is a rule, not magic": ExtraCipherRule,
  "Codes swap symbols, not meaning": ExtraEncode,
};

export { EXTRAS };
