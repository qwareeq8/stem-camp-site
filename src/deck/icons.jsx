// Lucide icon imports plus the category, demo, and phase icon maps and the IconChip coin badge.
import { Activity, Bot, Boxes, Cog, Compass, Cpu, Droplet, Droplets, Eye, Flower2, Layers, Leaf, Lightbulb, ListOrdered, Magnet as MagnetIcon, MessageSquare, Microscope, Mountain, Network, Ruler, Sparkles, Sprout, Telescope, Timer, TreeDeciduous, Trophy, Waves as WavesIcon, Wind, Zap } from "lucide-react";
import { T } from "./theme.js";

const CAT_ICON = {
  bioenergy: Zap, biomed: Activity, biomimicry: Leaf, cs: Cpu,
  data: Network, design: Compass, ecology: Sprout, field: Mountain,
  materials: Layers, mechanics: Cog, optics: Eye, waves: WavesIcon,
};
const DEMO_ICON = {
  mudwatt: Zap, capillary: Droplets, oobleck: Droplet, samara: Wind,
  treering: TreeDeciduous, lotus: Flower2, magnet: MagnetIcon, cam: Cog,
  wave: WavesIcon, pinhole: Telescope, hover: Wind, spectra: Lightbulb,
  bookbot: Bot, ramp: Ruler,
};
const PHASE_ICON = {
  title: Sparkles, science: Microscope, materials: Boxes,
  steps: ListOrdered, timer: Timer, compete: Trophy, debrief: MessageSquare,
};
function IconChip({ icon: Ico, color, size = 28, stroke = 1.9 }) {
  const ic = Math.round(size * 0.5);
  return (
    <span aria-hidden style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%", flex: "0 0 auto",
      background: T.paper,
      border: `1px solid ${T.rule22}`,
    }}>
      <Ico size={ic} strokeWidth={stroke} color={color} />
    </span>
  );
}

export { CAT_ICON, DEMO_ICON, PHASE_ICON, IconChip };
