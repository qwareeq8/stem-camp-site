// Routing map of demo id -> Demo component.
import { DemoBookbot } from "./DemoBookbot.jsx";
import { DemoCam } from "./DemoCam.jsx";
import { DemoCapillary } from "./DemoCapillary.jsx";
import { DemoHover } from "./DemoHover.jsx";
import { DemoLotus } from "./DemoLotus.jsx";
import { DemoMagnet } from "./DemoMagnet.jsx";
import { DemoMudwatt } from "./DemoMudwatt.jsx";
import { DemoOobleck } from "./DemoOobleck.jsx";
import { DemoPinhole } from "./DemoPinhole.jsx";
import { DemoRamp } from "./DemoRamp.jsx";
import { DemoSamara } from "./DemoSamara.jsx";
import { DemoSpectra } from "./DemoSpectra.jsx";
import { DemoTreering } from "./DemoTreering.jsx";
import { DemoWave } from "./DemoWave.jsx";

const DEMOS = {
  mudwatt: DemoMudwatt, capillary: DemoCapillary, oobleck: DemoOobleck,
  samara: DemoSamara, treering: DemoTreering, lotus: DemoLotus, magnet: DemoMagnet,
  cam: DemoCam, wave: DemoWave, pinhole: DemoPinhole, hover: DemoHover,
  spectra: DemoSpectra, bookbot: DemoBookbot, ramp: DemoRamp,
};

export { DEMOS };
