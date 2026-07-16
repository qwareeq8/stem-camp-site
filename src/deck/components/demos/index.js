// Routing map of demo id -> Demo component.
import { DemoCam } from "./DemoCam.jsx";
import { DemoHover } from "./DemoHover.jsx";
import { DemoRamp } from "./DemoRamp.jsx";
import { DemoSpectra } from "./DemoSpectra.jsx";
import { DemoTreering } from "./DemoTreering.jsx";
import { DemoWave } from "./DemoWave.jsx";

const DEMOS = {
  // Protected legacy interactives remain independently smoke-tested, but only
  // models that agree with the corrected activity text are routed into slides.
  cam: DemoCam,
  wave: DemoWave,
  hover: DemoHover,
  spectra: DemoSpectra,
  ramp: DemoRamp,
  treering: DemoTreering,
};

export { DEMOS };
