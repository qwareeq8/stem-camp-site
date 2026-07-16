// Routing map of science-slide title -> Extra component.
import { ExtraAccuracy } from "./ExtraAccuracy.jsx";
import { ExtraCER } from "./ExtraCER.jsx";
import { ExtraCascade } from "./ExtraCascade.jsx";
import { ExtraCenterMass } from "./ExtraCenterMass.jsx";
import { ExtraChecksum } from "./ExtraChecksum.jsx";
import { ExtraCipherRule } from "./ExtraCipherRule.jsx";
import { ExtraClump } from "./ExtraClump.jsx";
import { ExtraControls } from "./ExtraControls.jsx";
import { ExtraCoolRoute } from "./ExtraCoolRoute.jsx";
import { ExtraDecision } from "./ExtraDecision.jsx";
import { ExtraDetect } from "./ExtraDetect.jsx";
import { ExtraEncode } from "./ExtraEncode.jsx";
import { ExtraFoodWeb } from "./ExtraFoodWeb.jsx";
import { ExtraGreenhouse } from "./ExtraGreenhouse.jsx";
import { ExtraOneVar } from "./ExtraOneVar.jsx";
import { ExtraPathPlan } from "./ExtraPathPlan.jsx";
import { ExtraPhotoO2 } from "./ExtraPhotoO2.jsx";
import { ExtraPinecone } from "./ExtraPinecone.jsx";
import { ExtraPollinatorNet } from "./ExtraPollinatorNet.jsx";
import { ExtraPressure } from "./ExtraPressure.jsx";
import { ExtraReactionTime } from "./ExtraReactionTime.jsx";
import { ExtraReliability } from "./ExtraReliability.jsx";
import { ExtraResilience } from "./ExtraResilience.jsx";
import { ExtraRootsAnchor } from "./ExtraRootsAnchor.jsx";
import { ExtraRoughCoat } from "./ExtraRoughCoat.jsx";
import { ExtraSampling } from "./ExtraSampling.jsx";
import { ExtraSiting } from "./ExtraSiting.jsx";
import { ExtraSonarRange } from "./ExtraSonarRange.jsx";
import { ExtraSpectraFingerprint } from "./ExtraSpectraFingerprint.jsx";
import { ExtraStomata } from "./ExtraStomata.jsx";
import { ExtraStrengthWeight } from "./ExtraStrengthWeight.jsx";
import { ExtraStress } from "./ExtraStress.jsx";
import { ExtraTour } from "./ExtraTour.jsx";

const EXTRAS = {
  // The existing circuit visual combines voltage/current values that violate
  // Ohm's law for its labeled 100 kΩ load. Keep the corrected text only.
  // The legacy microclimate heat map encodes synthetic readings as if they
  // were observations. Keep the evidence-first slide text without that model.
  "Evidence-based siting": ExtraSiting,
  "One variable at a time": ExtraOneVar,
  // The existing xylem selector still offers felt, which the corrected TTT-04
  // test no longer uses. Keep the accurate activity text until a matching
  // cotton-cloth/paper-towel visual exists.
  "Controlled environments": ExtraGreenhouse,
  "Evidence from the tour": ExtraTour,
  "Hygromorphs": ExtraPinecone,
  // The bilayer animation overstates a deterministic curvature response.
  "Networks, not single plants": ExtraPollinatorNet,
  "Native and clumping logic": ExtraClump,
  // The existing key misclassifies a serrated birch leaf as smooth. Keep the
  // general evidence text without that visual classification exercise.
  "Ecosystems in place": ExtraFoodWeb,
  "Resilience by design": ExtraResilience,
  "Systems thinking": ExtraCascade,
  "Claim, evidence, reasoning": ExtraCER,
  "Roughness plus coating": ExtraRoughCoat,
  "Stomata: pores for gas exchange": ExtraStomata,
  "Sampling and counting": ExtraSampling,
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
  "Criteria and constraints": ExtraDecision,
  "Roots anchor soil": ExtraRootsAnchor,
  // The runoff visual is qualitative and cannot support the measured claim.
  // The original triangulation animation omitted observer eye height. The
  // activity text contains the correct formula, so keep this slide text-only
  // until a replacement visual can model the full measurement.
  "Accuracy from method": ExtraAccuracy,
  // The synthetic heat grid is not field evidence; keep the activity text.
  "Data-backed routing": ExtraCoolRoute,
  "Photosynthesis makes oxygen": ExtraPhotoO2,
  "Controlled variables": ExtraControls,
  "Pressure vs force": ExtraPressure,
  "Spreading stress": ExtraStress,
  // These protected neuron visuals overstate the tabletop analogy: dominoes
  // are not literal nerve propagation, and synaptic success is not determined
  // by gap width. Keep the corrected neuron/myelin/synapse text only.
  // The retired pulley visuals miscounted supporting rope segments and showed
  // an unrelated angled-box vector. The written activity explanation is the
  // authoritative fallback for both concepts.
  "Check digits catch errors": ExtraChecksum,
  "Detect without false alarms": ExtraDetect,
  "A cipher is a rule, not magic": ExtraCipherRule,
  "Codes swap symbols, not meaning": ExtraEncode,
};

export { EXTRAS };
