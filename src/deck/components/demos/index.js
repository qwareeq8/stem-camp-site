// Routing map of demo id -> Demo component.
import { DemoCam } from "./DemoCam.jsx";
import { DemoHover } from "./DemoHover.jsx";
import { DemoRamp } from "./DemoRamp.jsx";
import { DemoSpectra } from "./DemoSpectra.jsx";
import { DemoWave } from "./DemoWave.jsx";

const DEMOS = {
  // Protected legacy interactives remain independently smoke-tested, but only
  // models that agree with the corrected activity text are routed into slides.
  // The tree-ring visual colors each whole year as pale/good or dark/stressed.
  // Earlywood and latewood are light and dark portions of the same annual ring,
  // while climate inference requires cross-dated, site-calibrated measurements.
  cam: DemoCam,
  wave: DemoWave,
  hover: DemoHover,
  spectra: DemoSpectra,
  ramp: DemoRamp,
};

export { DEMOS };
