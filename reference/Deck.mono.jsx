import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft, ArrowRight, X, Play, Pause, RotateCcw, Hash, Plus,
  Zap, Droplet, Droplets, Wind, Compass, Eye, Magnet as MagnetIcon, Cog, Activity,
  Sparkles, Sun, Thermometer, Sprout, Leaf, TreeDeciduous, Bug, Flower2, Mountain,
  Waves as WavesIcon, Telescope, Crosshair, Layers, Hammer, Wrench, FlaskConical,
  Microscope, Cpu, Network, Bot, Boxes, Ruler, ListChecks, Trophy, MessageSquare,
  Timer, ListOrdered, Snowflake, CloudRain, Lightbulb, Radio, Maximize2, Move
} from "lucide-react";

/* =====================================================================
   STEM CAMPS 2026  ·  Interactive Deck
   Visual identity: warm paper, deep ink, two earned camp accents
   (Trees: moss + terracotta · PY-STEM: indigo + copper)
   ===================================================================== */

/* ----------------------------- design tokens ---------------------------- */
const T = {
  paper:    "#f1e7d3",
  paper2:   "#e9dec7",
  paper3:   "#dccfb3",
  ink:      "#1d1916",
  ink2:     "#3a3128",
  mute:     "#7a6f5c",
  mute2:    "#9e927d",
  rule:     "#1d1916",
  rule12:   "rgba(29,25,22,.12)",
  rule22:   "rgba(29,25,22,.22)",
  rule06:   "rgba(29,25,22,.06)",
  warn:     "#a83a25",
  ok:       "#3e6b3c",
  treesInk: "#2a5736",
  treesAcc: "#b04a2f",
  pyInk:    "#1c3257",
  pyAcc:    "#c77a2b",
};

const CAMP = {
  trees:  { ink: T.treesInk, acc: T.treesAcc, label: "From Trees to Tech",
            sub: "Field. Forest. Future.",
            tagline: "Nature as engineer: ecology, biomimicry, sensors, climate resilience." },
  pystem: { ink: T.pyInk,    acc: T.pyAcc,    label: "PY-STEM",
            sub: "Signal. System. Science.",
            tagline: "Applied STEM: biomedical, waves, optics, mechanics, materials, algorithms." },
};

/* ----------------------------- font init -------------------------------- */
(() => {
  if (typeof document === "undefined") return;
  if (document.getElementById("_stemcamp_fonts")) return;
  const link = document.createElement("link");
  link.id = "_stemcamp_fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap";
  document.head.appendChild(link);
  const style = document.createElement("style");
  style.id = "_stemcamp_styles";
  style.textContent = `
    *{box-sizing:border-box;margin:0;padding:0}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes dash{to{stroke-dashoffset:-40}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.18}}
    @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.06);opacity:.85}}
    .fu{animation:fadeUp .55s cubic-bezier(.22,1,.36,1) both}
    .fi{animation:fadeIn .6s ease both}
    .stemdeck{font-family:'Inter',system-ui,sans-serif;color:${T.ink};background:${T.paper}}
    .stemdeck *{font-feature-settings:"ss01","cv11"}
    .stemdeck button{font-family:inherit;color:inherit}
    .stemdeck ::selection{background:${T.treesInk}33}
    .stemdeck ::-webkit-scrollbar{width:6px;height:6px}
    .stemdeck ::-webkit-scrollbar-thumb{background:${T.ink}44;border-radius:3px}
    .stemdeck input[type=range]{-webkit-appearance:none;appearance:none;width:160px;height:2px;background:${T.ink}44;border-radius:1px;outline:none;cursor:pointer}
    .stemdeck input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:13px;height:13px;border-radius:50%;background:${T.ink};cursor:grab;border:2px solid ${T.paper};box-shadow:0 0 0 1px ${T.ink}}
    .stemdeck input[type=range]:active::-webkit-slider-thumb{cursor:grabbing}
    .stemdeck input[type=range]::-moz-range-thumb{width:11px;height:11px;border-radius:50%;background:${T.ink};cursor:pointer;border:2px solid ${T.paper}}
    .stemdeck .stage{background:${T.paper2};border:1px solid ${T.rule12};border-radius:4px;position:relative;overflow:hidden}
    .stemdeck .stage::before{content:"";position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(${T.ink}0a 1px,transparent 1px);background-size:4px 4px;opacity:.55}
    .stemdeck .focusable:focus-visible{outline:2px solid ${T.ink};outline-offset:2px}
    .stemdeck a:focus-visible,.stemdeck button:focus-visible{outline:2px solid ${T.ink};outline-offset:3px}
    .stemdeck .nofocus:focus{outline:none}
    .stemdeck .ruled{background-image:linear-gradient(${T.rule06} 1px,transparent 1px);background-size:100% 28px}
    .stemdeck .smallcaps{font-variant:all-small-caps;letter-spacing:.18em}
    .stemdeck .accentRule{height:2px;background:currentColor}
    .stemdeck .corner{position:absolute;width:14px;height:14px;border:1.5px solid ${T.ink};opacity:.7}
    .stemdeck .corner.tl{top:-1px;left:-1px;border-right:none;border-bottom:none}
    .stemdeck .corner.tr{top:-1px;right:-1px;border-left:none;border-bottom:none}
    .stemdeck .corner.bl{bottom:-1px;left:-1px;border-right:none;border-top:none}
    .stemdeck .corner.br{bottom:-1px;right:-1px;border-left:none;border-top:none}
    .stemdeck .ticker{font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums}
  `;
  document.head.appendChild(style);
})();

/* ----------------------------- type helpers ----------------------------- */
const f = {
  display: (w, s, opts = {}) => ({
    fontFamily: "'Fraunces',Georgia,serif",
    fontWeight: w, fontSize: s,
    fontVariationSettings: `"opsz" ${opts.opsz || 80}, "SOFT" 50`,
    fontStyle: opts.italic ? "italic" : "normal",
    letterSpacing: opts.tracking != null ? opts.tracking : -0.012,
    lineHeight: opts.lh || 1.05,
  }),
  sans: (w, s, opts = {}) => ({
    fontFamily: "'Inter',system-ui,sans-serif",
    fontWeight: w, fontSize: s,
    letterSpacing: opts.tracking != null ? opts.tracking : 0,
    lineHeight: opts.lh || 1.5,
    textTransform: opts.upper ? "uppercase" : "none",
  }),
  mono: (w, s, opts = {}) => ({
    fontFamily: "'JetBrains Mono',ui-monospace,monospace",
    fontWeight: w, fontSize: s,
    letterSpacing: opts.tracking != null ? opts.tracking : 0,
    fontVariantNumeric: "tabular-nums",
    textTransform: opts.upper ? "uppercase" : "none",
  }),
};

/* ----------------------------- hooks ------------------------------------ */
function useRAF(active, fn) {
  const cb = useRef(fn); cb.current = fn;
  useEffect(() => {
    if (!active) return;
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = Math.min(64, t - last); last = t;
      cb.current(dt, t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

function useTimeouts() {
  const ids = useRef([]);
  useEffect(() => () => { ids.current.forEach(clearTimeout); ids.current = []; }, []);
  return (fn, ms) => {
    const id = setTimeout(() => {
      ids.current = ids.current.filter((x) => x !== id);
      fn();
    }, ms);
    ids.current.push(id);
    return id;
  };
}

function usePointerDrag(ref, onMove, onUp) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let dragging = false;
    const rectOf = () => el.getBoundingClientRect();
    const handle = (clientX, clientY) => {
      const r = rectOf();
      onMove({ x: clientX - r.left, y: clientY - r.top, w: r.width, h: r.height });
    };
    const down = (e) => {
      dragging = true; el.setPointerCapture?.(e.pointerId);
      handle(e.clientX, e.clientY);
    };
    const move = (e) => { if (dragging) handle(e.clientX, e.clientY); };
    const up = (e) => {
      if (!dragging) return;
      dragging = false; el.releasePointerCapture?.(e.pointerId);
      if (onUp) onUp();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerleave", up);
    };
  }, [ref, onMove, onUp]);
}

/* ----------------------------- atoms ------------------------------------ */
function Btn({ children, onClick, color = T.ink, active, disabled, small, icon: Icon, style: sx, title }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} className="focusable"
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: small ? "5px 11px" : "7px 14px",
        borderRadius: 2,
        border: `1px solid ${active ? color : T.ink}`,
        background: active ? color : "transparent",
        color: active ? T.paper : color,
        ...f.sans(600, small ? 11.5 : 13, { tracking: 0.04, upper: true }),
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.32 : 1,
        transition: "background .18s, color .18s",
        whiteSpace: "nowrap",
        ...sx,
      }}>
      {Icon && <Icon size={small ? 12 : 14} strokeWidth={2.2} />}
      <span>{children}</span>
    </button>
  );
}

function Slider({ val, set, min, max, step = 1, color = T.ink, label, suffix }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 160 }}>
      <span style={{ ...f.sans(600, 10.5, { upper: true, tracking: 0.12 }), color: T.mute, display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        {suffix != null && <span className="ticker" style={{ color }}>{suffix}</span>}
      </span>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={(e) => set(+e.target.value)}
        style={{ accentColor: color }} />
    </label>
  );
}

function Tag({ children, color = T.ink, style: sx }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 7px",
      borderRadius: 1,
      border: `1px solid ${color}`,
      color,
      ...f.mono(600, 10, { tracking: 0.12, upper: true }),
      ...sx,
    }}>
      {children}
    </span>
  );
}

function Corners() {
  return (
    <>
      <span className="corner tl" /><span className="corner tr" />
      <span className="corner bl" /><span className="corner br" />
    </>
  );
}

function Field({ children, height, padded = true }) {
  return (
    <div style={{ position: "relative", padding: padded ? "18px 14px 14px" : 0, marginBottom: 8 }}>
      <Corners />
      <div className="stage" style={{ height, padding: padded ? "12px" : 0 }}>
        {children}
      </div>
    </div>
  );
}

function Readout({ items, color = T.ink }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "10px 22px", alignItems: "baseline",
      paddingTop: 10, borderTop: `1px solid ${T.rule12}`,
    }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ ...f.sans(600, 9.5, { upper: true, tracking: 0.16 }), color: T.mute }}>{it.l}</span>
          <span className="ticker" style={{ ...f.mono(600, 16), color: it.color || color }}>{it.v}</span>
        </div>
      ))}
    </div>
  );
}

function Caption({ children, color = T.ink }) {
  return (
    <p style={{ ...f.sans(400, 13, { lh: 1.6 }), color: T.mute, paddingTop: 12 }}>
      <span style={{ color, ...f.sans(600, 13) }}>›</span>{" "}{children}
    </p>
  );
}

/* ----------------------------- icon maps -------------------------------- */
/* Map activity categories and demo keys to lucide line icons.
   The data still carries an `icon` emoji field, but it is no longer rendered. */
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

/* A dimensional "coin" badge so category/phase icons read less flat than a bare line glyph. */
function IconChip({ icon: Ico, color, size = 28, stroke = 1.9 }) {
  const ic = Math.round(size * 0.5);
  return (
    <span aria-hidden style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%", flex: "0 0 auto",
      background: `radial-gradient(circle at 36% 30%, #ffffff, ${color}22 72%, ${color}14)`,
      border: `1px solid ${color}4d`,
      boxShadow: `inset 0 1px 1px #ffffffaa, 0 1px 2px ${color}33`,
    }}>
      <Ico size={ic} strokeWidth={stroke} color={color} />
    </span>
  );
}


/* ====================================================================== */
/*                     ACTIVITY DATA (inline, unchanged)                  */
/* ====================================================================== */
const CATMAP = {"bioenergy": {"l": "Biology + Energy", "c": "#63d9a0"}, "field": {"l": "Field Science", "c": "#4dd4ac"}, "biomimicry": {"l": "Biomimicry", "c": "#7bd88f"}, "ecology": {"l": "Ecology", "c": "#5cc98a"}, "materials": {"l": "Materials", "c": "#9bdc6a"}, "data": {"l": "Data + Climate", "c": "#56cfe1"}, "biomed": {"l": "Biomedical", "c": "#ef6f6f"}, "mechanics": {"l": "Mechanics", "c": "#f4a261"}, "waves": {"l": "Waves + Sound", "c": "#6ea8fe"}, "optics": {"l": "Optics + Light", "c": "#f0d060"}, "cs": {"l": "Computing", "c": "#56cfe1"}, "design": {"l": "Design", "c": "#ce7cf4"}};
const TREES_DECK = [{"code": "TTT-01", "t": "MudWatt Bioelectric League", "sub": "Turn a cup of mud into a living battery", "cat": "bioenergy", "icon": "🔋", "buildMin": 80, "mission": "Can your team make mud generate electricity and defend your design with data?", "science": [{"t": "Electrogenic bacteria", "demo": "mudwatt", "b": "Some bacteria already in ordinary soil are electrogenic: as they digest nutrients, they push spare electrons onto surfaces outside their cells. Bury a graphite anode in oxygen-free mud and these microbes coat it, feeding it a steady stream of electrons."}, {"t": "Completing the circuit", "demo": null, "b": "Electrons leave the anode, run through the wire and the circuit board (lighting the LED on the way), and reach the cathode resting in the air on top. There they join oxygen and protons from the mud to form water. More food and more healthy microbes mean more electrons per second, so the LED blinks faster. Power is roughly voltage times current."}], "materials": [{"n": "MudWatt or equivalent MFC kits", "q": "6"}, {"n": "Fresh soil or mud", "q": "fill each vessel"}, {"n": "Nitrile gloves", "q": "per student"}, {"n": "Approved fuels", "q": "banana, sugar water, bread, leaf litter"}, {"n": "Labels and tape", "q": "shared"}, {"n": "Multimeters", "q": "optional"}], "steps": [{"t": "Inoculate the mud", "b": "Gloves on. Pack the vessel with sponge-damp soil. The bacteria you need are already in the dirt, so no culture is required."}, {"t": "Place the electrodes", "b": "Bury the anode near the bottom and smooth mud over it so no air reaches it. Rest the cathode flat on top, exposed to the air."}, {"t": "Add a measured fuel", "b": "Mix in a small, measured amount of one approved fuel. Record exactly how much. This is the food that drives the blink rate."}, {"t": "Connect and read a baseline", "b": "Anode to (−), cathode to (+). Log the first blink interval or voltage. Day one is often weak; the biofilm needs time."}, {"t": "Control one variable", "b": "Pick ONE thing to test all week: fuel type, moisture, or anode contact. Change only that, predict the effect, and compare to baseline."}], "compete": ["Peak reading or blink performance: 35", "Daily data log quality: 20", "Controlled-variable design: 15", "Redesign or maintenance plan: 15", "Final explanation: 15"], "scoring": "Highest combined score across the week wins the league. Evidence beats luck.", "debrief": ["Which design change moved your readings the most, and how do you know?", "Why must the anode stay buried and the cathode stay in air?", "How is your weekly log like the work of an energy engineer?"], "source": "Ohio State Microbial Fuel Cell Learning Center; Magical Microbes MudWatt", "camp": "trees"}, {"code": "TTT-02", "t": "Forest Sensor Sprint", "sub": "Site the smartest place for a campus tree sensor", "cat": "field", "icon": "🌳", "buildMin": 80, "mission": "Find the smartest place to install a future campus tree sensor.", "science": [{"t": "Microclimate varies in meters", "demo": null, "b": "Temperature, humidity, light, and soil moisture can change sharply over short distances. A spot under a dense canopy can be several degrees cooler and far more humid than open lawn a few steps away. Good sensor placement starts with measuring, not guessing."}, {"t": "Evidence-based siting", "demo": null, "b": "A useful sensor sits where its readings represent the area you care about and where it will not be disturbed. Teams collect data at field stations, then argue for one location using their own numbers plus an efficient route between checkpoints."}], "materials": [{"n": "Clipboards", "q": "6"}, {"n": "Paper clinometers", "q": "6"}, {"n": "Thermometers or hygrometers", "q": "6"}, {"n": "Soil moisture meters", "q": "if available"}, {"n": "Route cards", "q": "shared"}, {"n": "Pencils", "q": "shared"}], "steps": [{"t": "Calibrate together", "b": "Take one reading as a whole group at a reference spot so every team's tools agree before they split up."}, {"t": "Run the field stations", "b": "Rotate through stations measuring temperature, humidity, light, and soil moisture. Record units every time."}, {"t": "Estimate tree height", "b": "Use the paper clinometer and a measured distance to estimate canopy height for one station."}, {"t": "Plan an efficient route", "b": "Order your checkpoints to minimize backtracking. Note the route on the card."}, {"t": "Recommend one site", "b": "Pick one sensor location and defend it with your measurements, not opinion."}], "compete": ["Data accuracy: 30", "Route efficiency: 20", "Site recommendation evidence: 30", "Teamwork and field conduct: 20"], "scoring": "Best evidence-based recommendation with accurate measurements wins.", "debrief": ["Which measurement most influenced your choice?", "Where did two nearby spots disagree, and why?", "What would change your recommendation in winter?"], "source": "GLOBE Observer Trees; NASA MyNASAData Urban Heat Island", "camp": "trees"}, {"code": "TTT-03", "t": "Seed Dispersal Derby", "sub": "Engineer a seed that escapes its parent tree", "cat": "biomimicry", "icon": "🍃", "buildMin": 80, "mission": "Build a seed that escapes the parent tree without engines or throwing.", "science": [{"t": "Drag, lift, and hang time", "demo": "samara", "b": "A maple samara spins as it falls. The wing generates lift that slows the descent, so even a light breeze carries the seed away from the shade of its parent. More surface area for the same mass usually means a longer, slower fall."}, {"t": "One variable at a time", "demo": null, "b": "Wing length, wing angle, and added mass all change flight. Engineers learn what each does by changing only one and comparing. Copying a natural strategy on purpose is biomimicry."}], "materials": [{"n": "Paper and cardstock", "q": "shared"}, {"n": "Paper clips", "q": "for mass"}, {"n": "Masking tape", "q": "shared"}, {"n": "String", "q": "shared"}, {"n": "Fan or marked lane", "q": "1 test zone"}, {"n": "Timers", "q": "per team"}], "steps": [{"t": "Study a real samara", "b": "Drop a maple seed or a model. Watch how the wing makes it spin and slow down."}, {"t": "Build a baseline seed", "b": "Make a simple winged seed with one paper clip for mass. Record a baseline drop time and distance."}, {"t": "Change one variable", "b": "Adjust wing length OR mass OR fold angle, only one. Predict the effect before testing."}, {"t": "Test for hang time and distance", "b": "Drop from the standard height or release in the fan lane. Time three trials and average."}, {"t": "Aim for a target", "b": "In a final round, try to land in a marked zone. Control plus distance both score."}], "compete": ["Distance traveled: 35", "Hang time: 25", "Target landing: 15", "Biomimicry explanation: 15", "Redesign improvement: 10"], "scoring": "Best combined distance, hang time, target landing, and explanation wins.", "debrief": ["Which change improved hang time without losing distance?", "Why does spinning slow the fall?", "Which tree's strategy did your final seed copy?"], "source": "Science Buddies Seed Dispersal; Project Learning Tree", "camp": "trees"}, {"code": "TTT-04", "t": "Xylem Pipeline Relay", "sub": "Move water uphill the way a tree does", "cat": "biomimicry", "icon": "💧", "buildMin": 80, "mission": "Move water uphill like a tree, faster and cleaner than rival teams.", "science": [{"t": "Capillary action", "demo": "capillary", "b": "Water climbs narrow spaces on its own. Water molecules stick to a surface (adhesion) and to each other (cohesion), so a thin column is pulled upward against gravity. Narrower channels and more wettable materials pull water higher and faster. Trees use this in their xylem."}, {"t": "Material and geometry", "demo": null, "b": "A felt strip, a cotton wick, and a folded paper towel each move water at a different rate. Path length, slope, and contact area all matter. Your team picks the material and the route to deliver the most water to a target cup."}], "materials": [{"n": "Paper towels", "q": "shared"}, {"n": "Cotton string", "q": "shared"}, {"n": "Felt strips", "q": "shared"}, {"n": "Cups", "q": "per team"}, {"n": "Food coloring", "q": "shared"}, {"n": "Trays", "q": "per team"}, {"n": "Elevation blocks", "q": "shared"}], "steps": [{"t": "Test three wick materials", "b": "Dip paper towel, cotton, and felt into colored water. Watch which climbs fastest and highest."}, {"t": "Pick a material and route", "b": "Choose your wick and lay out a path from the source cup up over a block to the target cup."}, {"t": "Run the first transfer", "b": "Start the wick and time how much water reaches the target in the time limit. Catch spills in the tray."}, {"t": "Reduce spill and length", "b": "Trim the path, improve contact, and re-run. Less spill and a shorter path usually deliver more."}, {"t": "Final delivery round", "b": "Run the best design for score. Water delivered, speed, and low spill all count."}], "compete": ["Water delivered: 40", "Speed: 20", "Least spill: 15", "Design explanation: 15", "Redesign gain: 10"], "scoring": "Most water delivered with speed, low spill, and a strong explanation wins.", "debrief": ["Which material moved water best, and why?", "How did slope change your delivery?", "Where does a real tree use this same effect?"], "source": "Science Buddies; plant water transport references", "camp": "trees"}, {"code": "TTT-05", "t": "Greenhouse Climate Controller", "sub": "Match plants to the right climate zone", "cat": "ecology", "icon": "🌿", "buildMin": 80, "mission": "Run the greenhouse controls for a plant that cannot complain, only wilt.", "science": [{"t": "Controlled environments", "demo": null, "b": "A greenhouse lets growers set temperature, humidity, and light to match what a plant needs. Get it wrong and the plant wilts, scorches, or molds. Every setting is a tradeoff: more light can mean more heat and faster drying."}, {"t": "Evidence from the tour", "demo": null, "b": "On the greenhouse tour you gather clues about real plant needs and real zone settings. Back at the table you match plant cards to climate dials using that evidence, then defend the layout."}], "materials": [{"n": "Plant profile cards", "q": "set"}, {"n": "Control dial boards", "q": "per team"}, {"n": "Clipboards", "q": "6"}, {"n": "Dry erase markers", "q": "per team"}, {"n": "Tour clue sheets", "q": "per team"}], "steps": [{"t": "Gather tour evidence", "b": "During the greenhouse visit, note real temperature, humidity, and light clues for different zones."}, {"t": "Read the plant cards", "b": "Each plant card lists needs and tolerances. Sort cards by what they require."}, {"t": "Set the climate dials", "b": "Match each plant to a zone and set temperature, humidity, and light on the dial board."}, {"t": "Resolve tradeoffs", "b": "When two plants want different things in one zone, choose the setting your evidence best supports."}, {"t": "Defend the layout", "b": "Explain each placement using a specific clue from the tour."}], "compete": ["Correct setting choices: 30", "Use of tour evidence: 25", "Explanation: 20", "Layout efficiency: 15", "Teamwork: 10"], "scoring": "Best plant-zone-control match supported by tour evidence wins.", "debrief": ["Which plant was hardest to place, and why?", "What tradeoff did you have to accept?", "How do real growers handle conflicting needs?"], "source": "Temple Ambler Greenhouse", "camp": "trees"}, {"code": "TTT-06", "t": "Pinecone Weather Machine", "sub": "A humidity sensor with no battery and no code", "cat": "biomimicry", "icon": "🌪", "buildMin": 80, "mission": "Build a weather sensor with no battery and no code.", "science": [{"t": "Hygromorphs", "demo": null, "b": "A pine cone opens in dry air and closes when it is humid. Its scales are built from two layers that swell by different amounts when they absorb moisture, so the scale bends. No motor, no power, just material that responds to water in the air."}, {"t": "Bilayer biomimicry", "demo": null, "b": "You can copy this with a paper-and-tape bilayer. One layer absorbs moisture and grows; the other does not. The mismatch makes your indicator curl or straighten. The goal is a readable, repeatable humidity signal."}], "materials": [{"n": "Dry pine cones", "q": "shared"}, {"n": "Index cards", "q": "shared"}, {"n": "Wood skewers", "q": "shared"}, {"n": "Spray bottles", "q": "per team"}, {"n": "Rulers", "q": "per team"}, {"n": "Tape and fasteners", "q": "shared"}], "steps": [{"t": "Observe a real cone", "b": "Spray a pine cone and watch the scales close. Let it dry and watch them open."}, {"t": "Build a bilayer indicator", "b": "Tape a moisture-absorbing layer to a stiff backing so the strip bends when wet."}, {"t": "Add a readable scale", "b": "Mount the strip against a ruler or dial so the bend points to a number."}, {"t": "Run spray-and-dry trials", "b": "Spray, time the response, dry, repeat. Record how far and how fast it moves."}, {"t": "Redesign for speed", "b": "Adjust layer thickness or length to respond faster and more clearly."}], "compete": ["Response accuracy: 35", "Response speed: 20", "Readable output scale: 20", "Biomimicry explanation: 15", "Redesign quality: 10"], "scoring": "Most accurate, readable, and fast response after spray-and-dry trials wins.", "debrief": ["Why does a two-layer strip bend when only one layer swells?", "What made your indicator faster?", "Where would a no-power humidity sensor be useful?"], "source": "AskNature Pine Cones Strategy", "camp": "trees"}, {"code": "TTT-07", "t": "Pollinator Network Draft and Build", "sub": "Design a habitat that works all season", "cat": "ecology", "icon": "🐝", "buildMin": 80, "mission": "Draft a pollinator habitat that works all season, not just on the prettiest day.", "science": [{"t": "Networks, not single plants", "demo": null, "b": "Pollinators need food across the whole season, not just one bloom. A good habitat is a network: plants that flower in spring, summer, and fall, matched to the pollinators that visit them. Gaps in the calendar starve the system."}, {"t": "Native and clumping logic", "demo": null, "b": "Native plants tend to support local pollinators best, and planting in clumps helps insects find and work them efficiently. You draft plant and pollinator cards, then place them on a grid under these constraints."}], "materials": [{"n": "Plant cards", "q": "set"}, {"n": "Pollinator cards", "q": "set"}, {"n": "Grid boards", "q": "per team"}, {"n": "Stickers", "q": "shared"}, {"n": "Markers", "q": "shared"}, {"n": "Season tokens", "q": "shared"}], "steps": [{"t": "Draft your cards", "b": "Pick plant and pollinator cards. Note bloom season and which pollinators each plant supports."}, {"t": "Cover every season", "b": "Lay out plants so something blooms in spring, summer, and fall. Use season tokens to check coverage."}, {"t": "Apply native and clumping rules", "b": "Favor natives and group same plants in clumps so pollinators forage efficiently."}, {"t": "Connect the network", "b": "Make sure each pollinator has food across its active months, not just one."}, {"t": "Defend the design", "b": "Explain how your grid supports the most pollinators across the whole season."}], "compete": ["Seasonal coverage: 30", "Pollinator fit: 25", "Native and clumping logic: 20", "Layout clarity: 15", "Defense: 10"], "scoring": "Highest pollinator support across spring, summer, and fall wins.", "debrief": ["Where was the biggest gap in your bloom calendar?", "Why does clumping help pollinators?", "What happens to the network if one season is missing?"], "source": "USDA Pollinators; US Forest Service pollinator guidance", "camp": "trees"}, {"code": "TTT-08", "t": "Arboretum Eco-Quest", "sub": "Solve outdoor ecology checkpoints", "cat": "field", "icon": "🧭", "buildMin": 80, "mission": "Read the living collection and solve the checkpoints before time runs out.", "science": [{"t": "Observation as evidence", "demo": null, "b": "Identifying a tree is detective work: leaf shape, bark texture, branching pattern, and seeds are all clues. A dichotomous key turns those clues into a series of either-or choices that lead to a name."}, {"t": "Ecosystems in place", "demo": null, "b": "The arboretum is a living classroom of ecosystems. Each checkpoint asks you to observe carefully, classify what you see, and record the evidence that justifies your answer."}], "materials": [{"n": "Clue cards", "q": "set"}, {"n": "Route map", "q": "per team"}, {"n": "Clipboards", "q": "6"}, {"n": "Pencils", "q": "shared"}, {"n": "Evidence token bags", "q": "per team"}, {"n": "QR codes", "q": "optional"}], "steps": [{"t": "Get the map and rules", "b": "Each team gets a route map and the field-conduct rules. Stay on paths, stay together."}, {"t": "Solve each checkpoint", "b": "Use leaf, bark, and seed clues with the key to answer each station."}, {"t": "Collect evidence tokens", "b": "Record the specific clue that justifies each answer and collect the token."}, {"t": "Keep an efficient pace", "b": "Order your route to avoid backtracking; pace counts but accuracy counts more."}, {"t": "Check your answers", "b": "Before returning, confirm each answer cites real evidence, not a guess."}], "compete": ["Checkpoint accuracy: 50", "Evidence quality: 20", "Pace: 20", "Teamwork and conduct: 10"], "scoring": "Most accurate checkpoint solutions with safe field conduct wins.", "debrief": ["Which clue was most reliable for telling trees apart?", "Where did a key send you wrong, and why?", "What makes a good piece of field evidence?"], "source": "Temple Ambler Arboretum; Arboretum Explorer", "camp": "trees"}, {"code": "TTT-09", "t": "Minecraft Tree World Resilience Cup", "sub": "Design a climate-resilient landscape", "cat": "ecology", "icon": "🧱", "buildMin": 80, "mission": "Design a landscape that survives stress because of how it is built, not luck.", "science": [{"t": "Resilience by design", "demo": null, "b": "A resilient landscape keeps working after a shock: a storm, a drought, a heat wave. Diversity, connected habitats, shade, and water management all add resilience. Monocultures and bare ground fail fast."}, {"t": "Systems thinking", "demo": null, "b": "In Minecraft Education or a paper grid, you build a landscape and justify each choice with a nature-based strategy. The win is the most resilient, biodiverse, realistic design, not the prettiest screenshot."}], "materials": [{"n": "Minecraft Education devices or paper grid kit", "q": "per team"}, {"n": "Template", "q": "shared"}, {"n": "Rubric cards", "q": "per team"}, {"n": "Display timer", "q": "1"}], "steps": [{"t": "Pick a stress to survive", "b": "Choose the challenge your landscape must withstand: flood, drought, or heat."}, {"t": "Add resilience features", "b": "Build diversity, connected green space, shade, and water control into the design."}, {"t": "Support biodiversity", "b": "Include varied habitats so many species can live there, not just one."}, {"t": "Keep it realistic", "b": "Use strategies that would actually work outdoors, and label them."}, {"t": "Present and defend", "b": "Walk judges through how each feature adds resilience."}], "compete": ["Resilience features: 30", "Biodiversity support: 25", "Realism: 20", "Explanation: 15", "Build polish: 10"], "scoring": "Best climate-resilient design with accurate nature-based strategies wins.", "debrief": ["Which feature would help most in a real storm?", "Why does diversity add resilience?", "What in your build would fail first, and how would you fix it?"], "source": "Minecraft Education Biodiversity", "camp": "trees"}, {"code": "TTT-10", "t": "Tree Ring Climate Detective", "sub": "Read rings to reconstruct past climate", "cat": "data", "icon": "🪵", "buildMin": 80, "mission": "Read the rings to reconstruct the climate events a tree lived through.", "science": [{"t": "Rings as proxy data", "demo": "treering", "b": "A tree adds one ring per year. Wide rings mean a good growing season; narrow rings mean stress like drought, cold, or crowding. Because the tree cannot record numbers, the rings are a proxy: an indirect record of past climate."}, {"t": "Claim, evidence, reasoning", "demo": null, "b": "You infer events from ring patterns, then justify each call with the specific rings that support it. Scars, sudden narrowing, and runs of wide rings are your clues. Strong inferences cite the evidence."}], "materials": [{"n": "Printed ring cards", "q": "set"}, {"n": "Wood cookies or images", "q": "shared"}, {"n": "Answer boards", "q": "per team"}, {"n": "Timers", "q": "per team"}, {"n": "Claim-evidence cards", "q": "per team"}], "steps": [{"t": "Learn the ring code", "b": "Wide equals good growth, narrow equals stress, scar equals fire or injury."}, {"t": "Read the sequence", "b": "Work along the rings from center to bark, noting each pattern and the year it maps to."}, {"t": "Infer the events", "b": "Match patterns to likely events: drought, fire, a crowded stand, a recovery."}, {"t": "Cite your evidence", "b": "For each inference, point to the exact rings that justify it on a claim-evidence card."}, {"t": "Synthesize the story", "b": "Combine your inferences into one short climate history for the tree."}], "compete": ["Correct inferences: 40", "Evidence justification: 20", "Speed: 20", "Final synthesis: 20"], "scoring": "Most accurate climate-event inferences with claim-evidence-reasoning wins.", "debrief": ["Which pattern was easiest to misread?", "How is a tree ring like and unlike a thermometer?", "What other natural records store past climate?"], "source": "NOAA Tree Rings; EPA Tree Rings, Living Records of Climate", "camp": "trees"}, {"code": "TTT-11", "t": "Lotus Leaf Surface Sprint", "sub": "Engineer a self-cleaning, water-shedding surface", "cat": "materials", "icon": "💦", "buildMin": 80, "mission": "Build a surface that sheds water and dirt the way a lotus leaf does.", "science": [{"t": "Hydrophobic micro-texture", "demo": "lotus", "b": "A lotus leaf is covered in tiny bumps coated in wax. Water cannot settle into the texture, so droplets bead up into near-spheres and roll off, carrying dirt with them. The effect comes from roughness plus a water-repelling coating, not from being smooth."}, {"t": "Roughness plus coating", "demo": null, "b": "You texture and coat safe surfaces, then race droplets down a standard ramp. The best surface sheds water fast and leaves the least residue. Copying the leaf on purpose is biomimicry in materials engineering."}], "materials": [{"n": "Wax paper", "q": "shared"}, {"n": "Cardstock", "q": "shared"}, {"n": "Sandpaper strips", "q": "shared"}, {"n": "Masking tape", "q": "shared"}, {"n": "Pipettes", "q": "per team"}, {"n": "Water", "q": "shared"}, {"n": "Pepper or cocoa", "q": "residue"}, {"n": "Ramps", "q": "per team"}], "steps": [{"t": "Compare bare surfaces", "b": "Drop water on smooth and rough surfaces. Watch which makes the droplet bead up."}, {"t": "Texture and coat", "b": "Add micro-texture and a water-repelling layer to your test surface."}, {"t": "Add a dirt challenge", "b": "Sprinkle pepper or cocoa as fake dirt. A good surface carries it off with the droplet."}, {"t": "Race down the ramp", "b": "Run droplets down the standard ramp. Time the runoff and check the residue left behind."}, {"t": "Redesign for less residue", "b": "Adjust texture or coating to shed cleaner, then re-run."}], "compete": ["Fast clean runoff: 35", "Least residue: 25", "Surface design explanation: 20", "Redesign gain: 10", "Craftsmanship: 10"], "scoring": "Best clean runoff and least residue after one redesign wins.", "debrief": ["Why does a rough, waxy surface shed water better than a smooth one?", "What carried the dirt away?", "Where would a self-cleaning surface be useful?"], "source": "AskNature Lotus Leaf Self-Cleaning Surface", "camp": "trees"}, {"code": "TTT-12", "t": "Leaf Stomata Microscope Detective", "sub": "Count stomata and rank leaves by water strategy", "cat": "field", "icon": "🔬", "buildMin": 80, "mission": "Count the breathing pores and rank leaves by how they manage water.", "science": [{"t": "Stomata: pores for gas exchange", "demo": null, "b": "Leaves breathe through tiny pores called stomata. They open to take in carbon dioxide and let oxygen out, but open stomata also lose water. The number and spacing of stomata reflect how a plant balances feeding itself against drying out."}, {"t": "Sampling and counting", "demo": null, "b": "You make a safe leaf peel or use prepared slides, count stomata in several fields of view, and average. Comparing counts across leaves lets you rank them by water strategy with real data."}], "materials": [{"n": "Leaf samples", "q": "varied"}, {"n": "Clear tape", "q": "shared"}, {"n": "Clear nail polish or slides", "q": "shared"}, {"n": "USB microscopes or magnifiers", "q": "per team"}, {"n": "Grid sheets", "q": "per team"}, {"n": "Gloves", "q": "per student"}], "steps": [{"t": "Make a safe peel", "b": "Paint clear polish on the leaf underside, let it dry, and lift the print with clear tape. Or use a prepared slide."}, {"t": "Focus the field", "b": "Place the peel under the microscope and focus until the stomata are sharp."}, {"t": "Count several fields", "b": "Count stomata in three or more fields of view and average to reduce error."}, {"t": "Compare leaves", "b": "Repeat for different leaves and build a team data table of counts per field."}, {"t": "Rank by water strategy", "b": "Use your counts to rank leaves from water-saving to water-spending, citing the data."}], "compete": ["Slide or peel quality: 25", "Counting accuracy: 30", "Ranking evidence: 25", "Team data table: 10", "Cleanup and care: 10"], "scoring": "Most accurate detective ranking with clean data and strong evidence wins.", "debrief": ["Why count several fields instead of one?", "What does a high stomata count suggest about a leaf's habitat?", "Where might error sneak into your count?"], "source": "Leaf stomata microscopy adaptations; Science Buddies plant biology", "camp": "trees"}];
const PY_DECK = [{"code": "PYS-01", "t": "Magnetic Capsule Maze Cup", "sub": "Steer a pill-camera without touching it", "cat": "biomed", "icon": "🧲", "buildMin": 80, "mission": "Steer a magnetic pill-camera through a body maze without touching it.", "science": [{"t": "Remote actuation", "demo": "magnet", "b": "A magnet pulls a steel object through a barrier without contact. Doctors use the same idea to steer a swallowed capsule camera through the gut from outside the body. The field passes through the wall; only the magnetic force does the work."}, {"t": "Path planning", "demo": null, "b": "Move too fast and the capsule overshoots; move too slow and you waste time. You plan a route through the maze and control the external magnet to get a fast, clean run with the fewest wall touches."}], "materials": [{"n": "Small neodymium magnets", "q": "controlled count"}, {"n": "Maze boards", "q": "per team"}, {"n": "Steel tokens or paper clips", "q": "per team"}, {"n": "Timers", "q": "per team"}, {"n": "Barrier sheets", "q": "shared"}], "steps": [{"t": "Test the field through a barrier", "b": "Place the steel token on the maze and move a magnet under the board. Feel how the field pulls through."}, {"t": "Plan a route", "b": "Trace the maze path you will follow and mark tricky corners."}, {"t": "Practice control", "b": "Practice slow, steady moves. Sudden jerks make the token jump walls."}, {"t": "Run for time", "b": "Make a timed clean run. Each wall touch is a penalty."}, {"t": "Explain the control", "b": "Describe how distance and speed of the magnet changed your control."}], "compete": ["Fastest clean run: 50", "Low penalties: 20", "Magnetic-control explanation: 20", "Redesign: 10"], "scoring": "Fastest clean run with low penalties and a clear explanation wins.", "debrief": ["Why does moving the magnet slowly help?", "How does distance change the pull you feel?", "Where is remote actuation used in real medicine?"], "source": "Science Museum Group Magnetic Maze", "camp": "pystem"}, {"code": "PYS-02", "t": "Oobleck Armor Arena", "sub": "Armor from a liquid that hardens on impact", "cat": "materials", "icon": "🛡", "buildMin": 80, "mission": "Design armor with a material that acts like a liquid until impact.", "science": [{"t": "Shear-thickening fluids", "demo": "oobleck", "b": "Oobleck is cornstarch and water. Press it slowly and it flows like a liquid; hit it fast and it stiffens like a solid. Fast force jams the suspended particles together so they resist. This is shear thickening, and real impact-protection materials use the same trick."}, {"t": "Material efficiency", "demo": null, "b": "More material protects better but costs and weighs more. You optimize a sealed oobleck pad to protect a target with the least material, then test it with a controlled press, not a messy drop."}], "materials": [{"n": "Cornstarch", "q": "bulk"}, {"n": "Water", "q": "shared"}, {"n": "Zip bags", "q": "per team"}, {"n": "Cardboard sleeves", "q": "per team"}, {"n": "Test weights", "q": "shared"}, {"n": "Spoons and trays", "q": "per team"}], "steps": [{"t": "Mix and feel it", "b": "Mix cornstarch and water until it pours slowly but resists a fast poke."}, {"t": "Seal a pad", "b": "Double-bag a measured amount of oobleck to make a clean, sealed armor pad."}, {"t": "Protect the target", "b": "Place the pad over the target and apply the standard controlled press."}, {"t": "Trim the material", "b": "Reduce the oobleck while still protecting the target. Track how little you can use."}, {"t": "Reset clean", "b": "Show a clean reset with no leaks. Cleanup is scored."}], "compete": ["Protection result: 40", "Material efficiency: 20", "Explanation: 20", "Redesign: 10", "Cleanup: 10"], "scoring": "Best target protection with least material and cleanest reset wins.", "debrief": ["Why does a fast press feel harder than a slow one?", "How little oobleck still protected the target?", "Where would shear-thickening armor be useful?"], "source": "Science Buddies Oobleck; Exploratorium Ooze", "camp": "pystem"}, {"code": "PYS-03", "t": "Cardboard Automata Arcade", "sub": "One crank, one clever motion", "cat": "mechanics", "icon": "⚙", "buildMin": 80, "mission": "Build a one-crank machine that performs a mini task.", "science": [{"t": "Cams, followers, linkages", "demo": "cam", "b": "Turning a crank spins a cam. A follower rides on the cam and rises and falls as the shape passes, turning steady rotation into up-and-down or back-and-forth motion. Linkages pass that motion along. The cam shape decides the movement."}, {"t": "Reliability", "demo": null, "b": "A machine that jams is a failed machine. Smooth holes, low friction, and a steady crank make motion repeatable. You build a hand-cranked automaton that completes a task and runs reliably, then explain the mechanism."}], "materials": [{"n": "Cardboard", "q": "shared"}, {"n": "Skewers", "q": "shared"}, {"n": "Straws", "q": "bearings"}, {"n": "Craft sticks", "q": "shared"}, {"n": "Tape", "q": "shared"}, {"n": "Hot glue", "q": "staff station"}, {"n": "Scissors", "q": "per team"}], "steps": [{"t": "Build the box and shaft", "b": "Make a sturdy box and pass a skewer through straw bearings so it turns freely."}, {"t": "Cut a cam", "b": "Cut a cam disc and fix it to the shaft. An off-center or oval cam gives more motion."}, {"t": "Add a follower", "b": "Rest a vertical rod on the cam so it rises and falls as you crank."}, {"t": "Top it with a task", "b": "Attach a character or tool that performs a mini task as the follower moves."}, {"t": "Tune for reliability", "b": "Reduce friction and wobble so it runs the same every turn."}], "compete": ["Reliable motion: 30", "Cam or linkage complexity: 20", "Task success: 20", "Explanation: 20", "Aesthetics and build quality: 10"], "scoring": "Most reliable motion with a useful mechanism and clear explanation wins.", "debrief": ["How did your cam shape change the motion?", "What caused jams, and how did you fix them?", "Where do cams show up in real machines?"], "source": "Exploratorium Cardboard Automata", "camp": "pystem"}, {"code": "PYS-04", "t": "Stethoscope Sprint and Recovery", "sub": "Build a listening tool, measure like a scientist", "cat": "biomed", "icon": "🩺", "buildMin": 80, "mission": "Build a medical listening tool and use it like a sports scientist.", "science": [{"t": "Sound transmission", "demo": null, "b": "A stethoscope collects faint body sounds with a wide funnel and channels them through a tube to your ear. A sealed air path and a good funnel make quiet heartbeats audible. Materials and seal quality decide how well it works."}, {"t": "Heart rate and recovery", "demo": null, "b": "After light exercise, heart rate rises and then recovers. With consent, you measure resting and post-activity rates and watch recovery. Respectful, accurate data collection is part of the score."}], "materials": [{"n": "Funnels", "q": "per team"}, {"n": "Flexible tubing", "q": "per team"}, {"n": "Tape", "q": "shared"}, {"n": "Balloons or membranes", "q": "shared"}, {"n": "Stopwatches", "q": "per team"}, {"n": "Sanitizing wipes", "q": "shared"}], "steps": [{"t": "Build the stethoscope", "b": "Attach a funnel to tubing and seal the joints so no air leaks."}, {"t": "Add a diaphragm", "b": "Stretch a balloon membrane over the funnel to pick up faint sounds, optional."}, {"t": "Test sound quality", "b": "Listen for a clear heartbeat. Improve the seal until it is easy to hear."}, {"t": "Collect resting data", "b": "With consent, measure a resting heart rate over a timed window."}, {"t": "Measure recovery", "b": "After light activity, measure how heart rate returns toward rest. Sanitize shared parts."}], "compete": ["Sound quality: 30", "Measurement accuracy: 25", "Explanation: 20", "Redesign: 15", "Data clarity: 10"], "scoring": "Best sound quality plus accurate, respectful data collection wins.", "debrief": ["What change most improved your sound quality?", "Why does a good seal matter so much?", "What does a fast recovery suggest?"], "source": "Science Buddies Make a Stethoscope", "camp": "pystem"}, {"code": "PYS-05", "t": "Reaction Time Combine", "sub": "Prove which strategy cuts your delay", "cat": "biomed", "icon": "⚡", "buildMin": 80, "mission": "Train like a sports scientist and prove which strategy cuts delay.", "science": [{"t": "From signal to muscle", "demo": null, "b": "Reaction time is the delay between seeing a signal and moving. The eye sends a signal to the brain, the brain decides, and nerves fire the muscle. The classic ruler-drop test turns that delay into a distance you can measure."}, {"t": "Median and improvement", "demo": null, "b": "One trial is noisy, so you take many and use the median. Then you test whether a strategy, like focusing or warming up, actually improves your number. Clean data and real improvement both score."}], "materials": [{"n": "Meter sticks", "q": "per team"}, {"n": "Stopwatches", "q": "per team"}, {"n": "Cones", "q": "shared"}, {"n": "Score sheets", "q": "per team"}, {"n": "Clipboards", "q": "6"}], "steps": [{"t": "Run the ruler drop", "b": "A partner drops a meter stick; you catch it. The catch distance maps to your reaction time."}, {"t": "Take many trials", "b": "Record at least ten catches. Use the median, not the best single catch."}, {"t": "Pick a strategy", "b": "Choose one strategy to test: focus cue, warm-up, or eyes on the release point."}, {"t": "Retest and compare", "b": "Run another set with the strategy. Compare medians to see if it helped."}, {"t": "Show the data", "b": "Present a clear before-and-after with your median and spread."}], "compete": ["Best median reaction time: 35", "Data quality: 20", "Strategy improvement: 20", "Explanation: 15", "Teamwork: 10"], "scoring": "Best median plus most improvement using clean data wins.", "debrief": ["Why use the median instead of your fastest catch?", "Which strategy helped, and why might it?", "Where does reaction time matter in real life?"], "source": "Science Buddies Reaction Time", "camp": "pystem"}, {"code": "PYS-06", "t": "SONAR Slinky Showdown", "sub": "Make invisible distance sensing visible", "cat": "waves", "icon": "〰", "buildMin": 80, "mission": "Make invisible distance sensing visible with a slinky pulse.", "science": [{"t": "Longitudinal waves", "demo": "wave", "b": "Push one end of a stretched slinky and a compression travels along it: a longitudinal wave, where the coils move back and forth along the direction of travel. Sound works the same way through air. The pulse reflects off the far end and returns."}, {"t": "Echo timing is ranging", "demo": null, "b": "If you know how fast a pulse travels and you time its round trip, you can compute distance. That is how SONAR and ultrasonic sensors measure range. You predict and interpret pulses at challenge stations."}], "materials": [{"n": "Metal slinkies", "q": "4 to 6"}, {"n": "Floor tape", "q": "shared"}, {"n": "Station cards", "q": "set"}, {"n": "Clipboards", "q": "6"}], "steps": [{"t": "Send a pulse", "b": "Stretch the slinky on the floor and push one end sharply to launch a compression pulse."}, {"t": "Watch the reflection", "b": "See the pulse travel, reflect off the held end, and come back."}, {"t": "Predict before testing", "b": "At each station, predict what the pulse will do, then test and check."}, {"t": "Time the round trip", "b": "Estimate travel time and connect it to distance, the SONAR idea."}, {"t": "Solve the stations", "b": "Work the challenge cards as a team, explaining each prediction."}], "compete": ["Model and predictions: 35", "Station performance: 25", "Explanation: 20", "Team communication: 20"], "scoring": "Most correct wave predictions and station solutions wins.", "debrief": ["How is a slinky pulse like a sound wave?", "Why does timing an echo give distance?", "Where are ultrasonic sensors used?"], "source": "IIHS SONAR Slinky", "camp": "pystem"}, {"code": "PYS-07", "t": "Pinhole Precision Challenge", "sub": "The sharpest image, no lens", "cat": "optics", "icon": "📷", "buildMin": 80, "mission": "Build the sharpest camera image with no lens.", "science": [{"t": "Light travels in straight lines", "demo": "pinhole", "b": "A pinhole camera has no lens. Light from each point of a scene travels in a straight line through a tiny hole and lands on the screen, forming an upside-down image. Because the rays cross at the hole, the picture is flipped."}, {"t": "The aperture tradeoff", "demo": null, "b": "A smaller hole makes a sharper image but a dimmer one; a bigger hole is brighter but blurrier. You optimize the aperture for the best balance of sharpness and brightness, then redesign once."}], "materials": [{"n": "Cardstock", "q": "shared"}, {"n": "Foil", "q": "for aperture"}, {"n": "Tape", "q": "shared"}, {"n": "Pushpins or paper clips", "q": "shared"}, {"n": "White screen paper", "q": "per team"}, {"n": "Light source", "q": "shared"}], "steps": [{"t": "Build the viewer", "b": "Make a tube or box with a foil aperture at one end and a paper screen at the other."}, {"t": "Punch a small hole", "b": "Pierce a clean, tiny hole in the foil with a pin. Smaller is sharper."}, {"t": "Find the image", "b": "Aim at a bright scene and look for the dim, upside-down image on the screen."}, {"t": "Tune the aperture", "b": "Try a slightly larger or smaller hole. Balance sharpness against brightness."}, {"t": "Explain the optics", "b": "Describe why the image is flipped and why hole size changes the result."}], "compete": ["Image clarity: 35", "Concept explanation: 25", "Build quality: 20", "Redesign: 10", "Speed: 10"], "scoring": "Best image clarity and concept explanation after one aperture redesign wins.", "debrief": ["Why is the image upside down?", "What did shrinking the hole do, and why?", "How is this related to your eye?"], "source": "Exploratorium Personal Pinhole Theater; NASA JPL Pinhole Camera", "camp": "pystem"}, {"code": "PYS-08", "t": "Low-Ropes Force Map Relay", "sub": "Predict balance before the element proves you right", "cat": "mechanics", "icon": "🧗", "buildMin": 80, "mission": "Predict balance and stability before the ropes element proves you right.", "science": [{"t": "Center of mass", "demo": null, "b": "Your center of mass is the average position of your weight. You stay balanced while it stays over your base of support. Lean too far and the line of gravity leaves the base, so you tip. Lowering your center of mass adds stability."}, {"t": "Mapping forces", "demo": null, "b": "On each ropes element, you predict where forces act and where balance will be hard, then test the prediction with your body and a partner. Accurate predictions and a clear debrief score."}], "materials": [{"n": "Element cards", "q": "set"}, {"n": "Clipboards", "q": "6"}, {"n": "Center-of-mass templates", "q": "per team"}, {"n": "Pencils", "q": "shared"}], "steps": [{"t": "Read the element", "b": "Look at the next low-ropes element and the body positions it requires."}, {"t": "Predict balance points", "b": "On the card, mark where balance will be hardest and where to put your weight."}, {"t": "Test on the element", "b": "Follow host rules and try it. Notice where you actually felt unstable."}, {"t": "Map the forces", "b": "Sketch where forces acted and how you kept your center of mass over your base."}, {"t": "Debrief the connection", "b": "Explain how lowering or shifting your center of mass changed stability."}], "compete": ["Correct predictions: 35", "Force-map quality: 25", "Debrief explanation: 20", "Teamwork reflection: 20"], "scoring": "Most accurate predictions and clear debrief connections wins.", "debrief": ["When did your prediction match what you felt?", "How did lowering your center of mass help?", "Where else does balance physics matter?"], "source": "Temple Ambler Outdoor Experiential Education; TeachEngineering balance references", "camp": "pystem"}, {"code": "PYS-09", "t": "Hovercraft Hockey Hackathon", "sub": "A puck that barely touches the floor", "cat": "mechanics", "icon": "🏒", "buildMin": 80, "mission": "Build a puck that moves by barely touching the floor.", "science": [{"t": "Air cushion cuts friction", "demo": "hover", "b": "A balloon pushes air down through a hole in a disc, lifting the disc on a thin cushion of air. With almost no contact, friction nearly vanishes, so a small push sends it gliding. Newton's laws then keep it moving until something stops it."}, {"t": "Glide versus control", "demo": null, "b": "Maximum glide is easy; control is hard. You balance lift and steerability to compete in gym-safe target hockey. Build quality and a clear explanation also score."}], "materials": [{"n": "Recycled CDs or discs", "q": "per team"}, {"n": "Pop-top bottle caps", "q": "per team"}, {"n": "Balloons", "q": "per team"}, {"n": "Hot glue", "q": "staff station"}, {"n": "Targets", "q": "shared"}, {"n": "Floor tape", "q": "shared"}], "steps": [{"t": "Mount the valve", "b": "Glue a pop-top cap over the center hole of the disc, sealing the edge."}, {"t": "Attach the balloon", "b": "Stretch an inflated balloon over the closed cap so air escapes only through the hole."}, {"t": "Test the glide", "b": "Open the cap, set it down, and give a gentle push. Tune for a long, smooth glide."}, {"t": "Practice control", "b": "Learn to start and stop on target. Too much lift means no control."}, {"t": "Play target hockey", "b": "Compete in gym-safe rounds. Glide and control both count."}], "compete": ["Glide performance: 30", "Target competition score: 25", "Explanation: 20", "Redesign: 15", "Build quality: 10"], "scoring": "Best glide plus control in a gym-safe tournament wins.", "debrief": ["Why does the air cushion reduce friction?", "Why is more lift not always better?", "Where are air bearings used in real life?"], "source": "NASA JPL Hovering on a Cushion of Air; Science Buddies Hovercraft", "camp": "pystem"}, {"code": "PYS-10", "t": "Spectra Sleuth Showdown", "sub": "Two white lights, two hidden color fingerprints", "cat": "optics", "icon": "🌈", "buildMin": 80, "mission": "Can two white lights hide different color fingerprints?", "science": [{"t": "Diffraction splits light", "demo": "spectra", "b": "A diffraction grating bends different colors by different amounts, spreading light into a spectrum. Two lights that look the same white can have very different spectra: a smooth rainbow from a hot filament, or separated bright lines from an LED or gas."}, {"t": "Spectra as fingerprints", "demo": null, "b": "Each light source has a characteristic spectrum, its fingerprint. This is the same science behind firework colors, where different metal salts emit specific colors. You match mystery sources to clue cards using their spectra, no flame needed."}], "materials": [{"n": "Diffraction glasses or gratings", "q": "per student"}, {"n": "LED sources", "q": "shared"}, {"n": "Incandescent source", "q": "if available"}, {"n": "Spectrum cards", "q": "set"}, {"n": "Museum clue sheets", "q": "per team"}], "steps": [{"t": "Look through the grating", "b": "View a white light through the grating and watch it spread into colors."}, {"t": "Compare two sources", "b": "Look at an LED and a filament bulb. Notice how their spectra differ."}, {"t": "Sketch the spectra", "b": "Draw what you see for each mystery source: continuous band or separate lines."}, {"t": "Match to clue cards", "b": "Use your sketches to match each source to its spectrum card."}, {"t": "Connect to fireworks", "b": "Explain how this links to the colors in a firework display, safely."}], "compete": ["Correct matches: 40", "Spectrum sketches: 20", "Explanation: 20", "Exhibit connection: 20"], "scoring": "Most correct spectrum matches and strongest safe fireworks-science explanation wins.", "debrief": ["How can two white lights have different spectra?", "What does a line spectrum tell you?", "How do chemists make firework colors?"], "source": "Science History Institute Flash Bang Boom; Exploratorium Spectra", "camp": "pystem"}, {"code": "PYS-11", "t": "BookBot Bin Logic Challenge", "sub": "Retrieve by address, not by conveyor race", "cat": "cs", "icon": "📚", "buildMin": 80, "mission": "Retrieve the right book by using bin addresses, not a conveyor race.", "science": [{"t": "Automated storage and retrieval", "demo": "bookbot", "b": "Temple's Charles Library BookBot stores books in bins identified by an address, not by subject on a shelf. A crane fetches the bin by its address on request. The same logic runs warehouses: store anywhere, remember the address, retrieve on demand."}, {"t": "Routing and search", "demo": null, "b": "Good addressing and smart routing minimize travel and avoid traffic jams. You simulate storage and retrieval with order cards, bin addresses, and routing rules, then defend your algorithm."}], "materials": [{"n": "Bin cards", "q": "set"}, {"n": "Address labels", "q": "shared"}, {"n": "Order deck", "q": "per team"}, {"n": "Route mat", "q": "per team"}, {"n": "Timers", "q": "per team"}, {"n": "Grabber tool", "q": "optional"}], "steps": [{"t": "Set up the bins", "b": "Label bins with addresses and place items by address, not by subject."}, {"t": "Read an order", "b": "Draw an order card listing the items to retrieve and their addresses."}, {"t": "Plan the route", "b": "Order your retrievals to minimize travel and avoid collisions with other teams."}, {"t": "Run the retrieval", "b": "Fetch the items by address against the clock. Wrong items cost points."}, {"t": "Defend the algorithm", "b": "Explain the rule you used to choose the order and why it is efficient."}], "compete": ["Correct retrievals: 35", "Low traffic conflicts: 25", "Routing or algorithm explanation: 20", "Efficiency: 10", "Teamwork: 10"], "scoring": "Most correct retrievals with few traffic conflicts and a clear algorithm defense wins.", "debrief": ["Why store by address instead of by subject?", "What made one route faster than another?", "Where else is this storage logic used?"], "source": "Temple Charles Library BookBot; Charles Library Circulating Collections", "camp": "pystem"}, {"code": "PYS-12", "t": "Accessibility Ramp Rescue Lab", "sub": "A portable ramp that meets real constraints", "cat": "design", "icon": "♿", "buildMin": 80, "mission": "Design a portable ramp that works for a real user constraint.", "science": [{"t": "Slope, load, and universal design", "demo": "ramp", "b": "A ramp trades steepness for length: a gentler slope is easier and safer to use but needs more room. Accessibility standards cap how steep a ramp can be. Universal design means building for real users and real constraints from the start, not as an afterthought."}, {"t": "Criteria and constraints", "demo": null, "b": "Your client gives criteria: a maximum slope, a load to carry, and a portability limit. You build a scale ramp for a toy wheelchair or weighted cart that meets all of them, then defend the tradeoffs."}], "materials": [{"n": "Foam board", "q": "per team"}, {"n": "Craft sticks", "q": "shared"}, {"n": "Dowels", "q": "shared"}, {"n": "Binder clips", "q": "shared"}, {"n": "Rulers", "q": "per team"}, {"n": "Weighted cart", "q": "shared"}, {"n": "Tape", "q": "shared"}], "steps": [{"t": "Read the client criteria", "b": "Note the maximum slope, the required load, and the portability limit."}, {"t": "Sketch to meet the slope", "b": "Work out the ramp length that keeps the slope within the limit for the given height."}, {"t": "Build the scale ramp", "b": "Construct a sturdy ramp from foam board and supports that folds or carries easily."}, {"t": "Load test", "b": "Roll the weighted cart up and down. Confirm it holds the load without sagging."}, {"t": "Defend the tradeoffs", "b": "Explain how your design meets slope, load, and portability together."}], "compete": ["Load held: 30", "Slope meets target: 30", "Portability: 20", "Client criteria explanation: 20"], "scoring": "Best safe ramp meeting slope, load, portability, and client criteria wins.", "debrief": ["Why does a gentler slope need more length?", "Which criterion was hardest to meet?", "Why design for accessibility from the start?"], "source": "TeachEngineering Wheelchair Ramp Design", "camp": "pystem"}];
const TREESB_DECK = [{"code": "TTB-01", "t": "Root Grip Erosion Rescue", "sub": "Can roots hold a slope together in a storm?", "cat": "field", "icon": "🌊", "buildMin": 60, "mission": "Can roots hold a slope together during a storm?", "science": [{"t": "Roots anchor soil", "demo": null, "b": "Bare soil on a slope washes away fast when rain hits it. Roots grip the soil and hold it in place, and a denser, deeper root network holds better. This is why planting vegetation is a real tool for stopping erosion."}, {"t": "Slope and runoff", "demo": null, "b": "Steeper slopes and bare surfaces shed water and soil quickly. You build a mini slope with root-like anchors, pour a standard amount of water, and measure how much soil stays put."}], "materials": [{"n": "Trays", "q": "per team"}, {"n": "Soil", "q": "shared"}, {"n": "String or yarn roots", "q": "shared"}, {"n": "Craft sticks", "q": "shared"}, {"n": "Watering cups", "q": "per team"}], "steps": [{"t": "Build a bare slope", "b": "Pack soil into a tray at a set angle with no roots. This is your control."}, {"t": "Add root anchors", "b": "Push string or yarn roots into a second slope to mimic a planted hillside."}, {"t": "Pour the standard storm", "b": "Pour the same measured water on each slope from the same height."}, {"t": "Measure soil retained", "b": "Compare how much soil washed out of each tray. Record the difference."}, {"t": "Redesign the root network", "b": "Add more or deeper roots and re-test to retain more soil."}], "compete": ["Soil retained: 40", "Runoff control: 25", "Design explanation: 20", "Cleanup: 15"], "scoring": "Most soil retained after the standard pour wins.", "debrief": ["Why did the rooted slope hold more soil?", "How would deeper roots change the result?", "Where is this used to protect real hillsides?"], "source": "EPA green infrastructure and erosion lessons", "camp": "trees"}, {"code": "TTB-02", "t": "Tree Height Triangulation Shootout", "sub": "Measure a tree without climbing it", "cat": "field", "icon": "📐", "buildMin": 60, "mission": "Measure a tree without climbing it.", "science": [{"t": "Angles give height", "demo": null, "b": "You can find a tree's height without touching the top. Sight the treetop through a paper clinometer to read an angle, measure your distance to the trunk, and the geometry of a right triangle gives the height. This is remote sensing with a protractor."}, {"t": "Accuracy from method", "demo": null, "b": "Small sighting errors grow over distance, so careful technique matters: level your eye, sight steadily, measure distance honestly. The team closest to the instructor's reference height wins."}], "materials": [{"n": "Paper clinometers", "q": "per team"}, {"n": "String and washers", "q": "shared"}, {"n": "Rulers and tape measures", "q": "shared"}, {"n": "Clipboards", "q": "6"}], "steps": [{"t": "Build the clinometer", "b": "Fold a paper clinometer with a weighted string plumb line to read angles."}, {"t": "Pace a known distance", "b": "Measure your straight-line distance from the trunk and record it."}, {"t": "Sight the treetop", "b": "Look along the clinometer at the very top and read the angle steadily."}, {"t": "Compute the height", "b": "Use the angle, your distance, and your eye height to estimate the tree height."}, {"t": "Check against reference", "b": "Compare to the instructor reference. The closest estimate wins."}], "compete": ["Accuracy: 50", "Method clarity: 20", "Speed: 20", "Teamwork: 10"], "scoring": "Closest estimate to the instructor reference height wins.", "debrief": ["What was your biggest source of error?", "Why does eye height matter in the calculation?", "Where is remote height measurement used in the field?"], "source": "GLOBE Trees Activities", "camp": "trees"}, {"code": "TTB-03", "t": "Urban Heat Shade Dash", "sub": "Find the coolest route through a hot campus", "cat": "data", "icon": "🌡", "buildMin": 60, "mission": "Find the coolest route through a hot campus.", "science": [{"t": "Urban heat and shade", "demo": null, "b": "Paved, sunlit surfaces get much hotter than shaded or planted ones. Shade from trees and buildings can drop surface temperature sharply over a few steps. Mapping these differences reveals cooler paths through a hot space."}, {"t": "Data-backed routing", "demo": null, "b": "You measure shaded and sunny surfaces, then design a cool corridor: a route that keeps people on the coolest surfaces. The best route is justified by your own temperature data."}], "materials": [{"n": "Thermometers or IR thermometers", "q": "per team"}, {"n": "Campus maps", "q": "per team"}, {"n": "Clipboards", "q": "6"}], "steps": [{"t": "Measure sun vs shade", "b": "Record surface temperature in matched sunny and shaded spots."}, {"t": "Map the hot spots", "b": "Mark the hottest and coolest surfaces on your map."}, {"t": "Design a cool corridor", "b": "Plot a walking route that stays on the coolest surfaces."}, {"t": "Justify with data", "b": "Show the temperatures that make your route cooler than the direct path."}, {"t": "Communicate the plan", "b": "Present the route clearly so someone could follow it."}], "compete": ["Cool route design: 35", "Data quality: 25", "Reasoning: 20", "Communication: 20"], "scoring": "Best data-backed cool route wins.", "debrief": ["How big was the sun-to-shade temperature gap?", "What surface was hottest, and why?", "How do cities use shade to cool streets?"], "source": "NASA MyNASAData Urban Heat Island", "camp": "trees"}, {"code": "TTB-04", "t": "Photosynthesis Float-Off Playoffs", "sub": "Make leaf disks float by making oxygen", "cat": "field", "icon": "🪴", "buildMin": 60, "mission": "Make leaf disks float by producing oxygen.", "science": [{"t": "Photosynthesis makes oxygen", "demo": null, "b": "Leaf disks sink when the air is drawn out of them. In light, with carbon dioxide available from a baking-soda solution, the leaf photosynthesizes and produces oxygen. The oxygen collects inside the disk until it floats. Floating is direct evidence of photosynthesis."}, {"t": "Controlled variables", "demo": null, "b": "Light level, carbon-dioxide concentration, and temperature all change the rate. You run a controlled assay, change one variable, and time how long until half the disks float."}], "materials": [{"n": "Spinach leaves", "q": "shared"}, {"n": "Baking soda solution", "q": "shared"}, {"n": "Cups", "q": "per team"}, {"n": "Oral syringes, no needle", "q": "per team"}, {"n": "Timers", "q": "per team"}], "steps": [{"t": "Cut and sink the disks", "b": "Punch leaf disks, then use a needle-free syringe to pull the air out so they sink."}, {"t": "Set up the solution", "b": "Place disks in baking-soda solution to supply carbon dioxide."}, {"t": "Add light", "b": "Put the cup under a light source to drive photosynthesis."}, {"t": "Time the half-float", "b": "Record the time until half the disks rise to the surface."}, {"t": "Change one variable", "b": "Adjust light or carbon-dioxide level, hold the rest constant, and compare rates."}], "compete": ["Performance: 35", "Controlled-variable design: 25", "Data table: 20", "Explanation: 10", "Cleanup: 10"], "scoring": "Fastest half-float time with controlled variables wins.", "debrief": ["Why does oxygen make the disks float?", "Which variable changed the rate most?", "How is this evidence of photosynthesis?"], "source": "Exploratorium Photosynthetic Floatation", "camp": "trees"}];
const PYB_DECK = [{"code": "PYB-01", "t": "Pencil Pressure Safety Lab", "sub": "Spread a force before it dents the target", "cat": "mechanics", "icon": "📌", "buildMin": 60, "mission": "Spread a force before it dents the target.", "science": [{"t": "Pressure vs force", "demo": null, "b": "Pressure is force divided by area. The same push on a sharp point dents a surface, but spread over a wide area it does not. That is why a sharp pencil pierces and a flat board does not: same force, different area."}, {"t": "Spreading stress", "demo": null, "b": "Safety design often means spreading a load so no single spot takes too much. You design a spreader that protects foam from a standard load and show the protected area with data."}], "materials": [{"n": "Pencils", "q": "shared"}, {"n": "Foam", "q": "per team"}, {"n": "Cardboard", "q": "shared"}, {"n": "Weights", "q": "shared"}, {"n": "Graph paper", "q": "per team"}], "steps": [{"t": "Test the bare point", "b": "Press a standard load through a pencil point into foam. Measure the dent."}, {"t": "Design a spreader", "b": "Build a cardboard spreader that distributes the same load over more area."}, {"t": "Apply the standard load", "b": "Press the same weight through your spreader onto fresh foam."}, {"t": "Measure protected area", "b": "Compare the dent. Less damage over more area means lower pressure."}, {"t": "Redesign for more spread", "b": "Improve the spreader to protect a larger area and re-test."}], "compete": ["Pressure spread: 40", "Explanation: 25", "Data quality: 20", "Redesign: 15"], "scoring": "Largest area protected with clear data wins.", "debrief": ["Why does the same force do less damage over more area?", "Where is this used in safety gear?", "What made your spreader better?"], "source": "IIHS Pencil Pressure", "camp": "pystem"}, {"code": "PYB-02", "t": "Domino Neuron Relay", "sub": "Make a nerve signal survive a gap", "cat": "biomed", "icon": "🂠", "buildMin": 60, "mission": "Make a nerve signal survive a gap.", "science": [{"t": "Signals travel in a chain", "demo": null, "b": "A line of falling dominoes is a model of a nerve signal: each one knocks the next, so the signal travels without any single domino moving far. A real neuron passes a signal down its length the same way, one step triggering the next."}, {"t": "Gaps and insulation", "demo": null, "b": "If the gap between dominoes is too large, the signal dies. Neurons face the same problem at synapses. A myelin sheath speeds signals along; you model gaps and insulation to keep the relay fast and reliable."}], "materials": [{"n": "Dominoes", "q": "per team"}, {"n": "Rulers", "q": "per team"}, {"n": "Tape", "q": "shared"}, {"n": "Index cards", "q": "shared"}], "steps": [{"t": "Build a baseline track", "b": "Set dominoes at an even spacing and time one full run."}, {"t": "Introduce a gap", "b": "Open a larger gap and see whether the signal still crosses."}, {"t": "Bridge the gap", "b": "Add a bridge piece, like a synapse helper, so the signal survives."}, {"t": "Speed it up", "b": "Adjust spacing to make the relay faster without breaking the chain."}, {"t": "Explain the analogy", "b": "Connect your design choices to neurons, synapses, and myelin."}], "compete": ["Transmission success: 35", "Gap challenge: 25", "Explanation: 20", "Redesign: 20"], "scoring": "Fastest reliable signal with the best explanation wins.", "debrief": ["What happened when the gap got too wide?", "How is a bridge piece like a synapse?", "Why does myelin speed real signals?"], "source": "Exploratorium Domino Effect", "camp": "pystem"}, {"code": "PYB-03", "t": "Pulley Rescue Relay", "sub": "Lift the load with smarter force, not stronger arms", "cat": "mechanics", "icon": "🔗", "buildMin": 60, "mission": "Lift the load with smarter force, not stronger arms.", "science": [{"t": "Mechanical advantage", "demo": null, "b": "A single fixed pulley just changes the direction of your pull. Add movable pulleys and you trade distance for force: you pull more rope but with less effort. More supporting rope segments means more mechanical advantage."}, {"t": "Force and direction", "demo": null, "b": "Pulleys let you pull down to lift up, and let a small force raise a big load. You build pulley systems, compare the effort needed, and explain why the setup helps."}], "materials": [{"n": "Classroom pulleys", "q": "per team"}, {"n": "String", "q": "shared"}, {"n": "Weights", "q": "shared"}, {"n": "Spring scales", "q": "if available"}], "steps": [{"t": "Lift with no pulley", "b": "Measure the effort to lift the load by hand as a baseline."}, {"t": "Add a fixed pulley", "b": "Reroute over one fixed pulley. Note that direction changes but effort does not."}, {"t": "Add a movable pulley", "b": "Build a system with a movable pulley and feel the effort drop."}, {"t": "Measure the advantage", "b": "Use a spring scale to compare effort across setups."}, {"t": "Explain the tradeoff", "b": "Show how more rope segments cut the force you need."}], "compete": ["Performance: 35", "Setup accuracy: 25", "Explanation: 20", "Teamwork: 20"], "scoring": "Best lift with the correct setup and a clear explanation wins.", "debrief": ["Why did the movable pulley reduce effort?", "What did you trade for the easier lift?", "Where are pulley systems used in rescue work?"], "source": "TryEngineering Pulleys and Force", "camp": "pystem"}, {"code": "PYB-04", "t": "Barcode Checksum Rescue", "sub": "Catch the fake barcode before the wrong part ships", "cat": "cs", "icon": "🔖", "buildMin": 60, "mission": "Catch the fake barcode before the warehouse ships the wrong part.", "science": [{"t": "Check digits catch errors", "demo": null, "b": "A barcode includes an extra check digit computed from the others by a fixed rule. If a digit is mistyped or smudged, the rule no longer matches and the scanner rejects the code. This is how real product codes catch errors automatically."}, {"t": "Detect without false alarms", "demo": null, "b": "A good detector flags the truly bad codes while passing the good ones. You race to find corrupted codes, keep false alarms low, and explain the check-digit rule you used."}], "materials": [{"n": "Printed barcode cards", "q": "set"}, {"n": "Dry erase boards", "q": "per team"}, {"n": "Timers", "q": "per team"}], "steps": [{"t": "Learn the rule", "b": "Study the check-digit rule: how the last digit is computed from the rest."}, {"t": "Verify a good code", "b": "Apply the rule to a valid code and confirm it checks out."}, {"t": "Hunt corrupted codes", "b": "Scan a deck of cards and flag the ones that fail the rule."}, {"t": "Avoid false alarms", "b": "Double-check before flagging; wrongly rejecting a good code costs points."}, {"t": "Explain the rule", "b": "Describe how the check digit catches a single mistyped digit."}], "compete": ["Correct detections: 45", "Low false alarms: 20", "Rule explanation: 20", "Teamwork: 15"], "scoring": "Most bad codes detected with few false alarms wins.", "debrief": ["How does one extra digit catch a typo?", "Why do false alarms matter in a warehouse?", "Where do you see check digits in daily life?"], "source": "Computer science unplugged error-detection concepts", "camp": "pystem"}];

/* ====================================================================== */
/*                          INTERACTIVE DEMOS                              */
/* All demos: smooth motion, direct manipulation, clear readouts,          */
/* physically plausible. All timers/listeners cleaned up on unmount.       */
/* ====================================================================== */

/* ---- 1. MudWatt: electrogenic bacteria, biofilm, electron loop, LED ---- */
function DemoMudwatt() {
  // TTT "Electrogenic bacteria" (concept 1). Sibling ExtraCircuit (concept 2) owns
  // completing the circuit, the LED, and power. This demo owns the source: in
  // oxygen-free mud, electrogenic microbes colonize a buried graphite anode and,
  // as they digest nutrients, push spare electrons onto the rod. More food grows
  // more biofilm and a faster electron output. A zoom shows one microbe donating
  // electrons to the graphite. Only a stub leaves "to the circuit". Trees palette.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [food, setFood] = useState(3);
  const [, force] = useState(0);
  const bioRef = useRef(0.2), phaseRef = useRef(0), feedRef = useRef(0);
  useRAF(true, (dt) => { phaseRef.current += dt; const eq = 0.18 + food * 0.14; bioRef.current += (eq - bioRef.current) * 0.0007 * dt; if (feedRef.current > 0) feedRef.current = Math.max(0, feedRef.current - dt); force((n) => (n + 1) % 1000000); });
  const feed = () => { bioRef.current = Math.min(1, bioRef.current + 0.08); feedRef.current = 900; };
  const reset = () => { bioRef.current = 0.2; };

  const bio = bioRef.current, phase = phaseRef.current;
  const rate = cl(bio * (0.45 + food * 0.11), 0.05, 1);
  const microbeN = 5 + food * 3;
  // deterministic microbe positions on the anode
  const anX0 = 104, anX1 = 300, anY = 196, bioTop = anY - bio * 16;
  const microbes = Array.from({ length: microbeN }, (_, i) => { const h = Math.sin(i * 12.9898 + 4.1) * 43758.5453; const u = h - Math.floor(h); return { x: anX0 + 8 + u * (anX1 - anX0 - 16), y: bioTop + 3 + (i % 3) * 3 }; });
  const stubX = 268, stubTop = 50, eN = Math.round(3 + rate * 7);
  const zx = 446, zy = 116, zr = 46;

  return (
    <div>
      <Field height={300}>
        <svg viewBox="0 0 500 280" style={{ width: "100%", height: "100%" }}>
          <text x="16" y="20" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.1 })}>Electrogenic bacteria</text>
          <text x="16" y="34" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.14 })}>microbes feed electrons to a buried anode</text>

          {/* mud */}
          <rect x="36" y="58" width="356" height="200" fill="#5c4a30" />
          <rect x="36" y="58" width="356" height="10" fill="#7a6442" opacity="0.6" />
          <rect x="36" y="150" width="356" height="3" fill="#3a5267" opacity="0.4" />
          <text x="44" y="76" fill="#d4af74" style={f.mono(700, 8, { upper: true, tracking: 0.14 })}>oxygen-free mud (anaerobic)</text>

          {/* food particles in the mud */}
          {Array.from({ length: food * 3 }, (_, i) => { const h1 = Math.sin(i * 7.13 + 1.3) * 19349.1, h2 = Math.sin(i * 3.71 + 9.7) * 27817.3; const u = h1 - Math.floor(h1), w = h2 - Math.floor(h2); const drift = (phase * 0.01 + i * 7) % 40; return <circle key={"fd" + i} cx={48 + u * 330} cy={84 + w * 60 + drift * 0.2} r="2.2" fill="#a07a3a" opacity="0.8" />; })}

          {/* biofilm on anode */}
          <rect x={anX0} y={bioTop} width={anX1 - anX0} height={anY - bioTop} fill="#2c2014" opacity="0.9" />
          <rect x={anX0} y={bioTop} width={anX1 - anX0} height={anY - bioTop} fill={A} opacity={cl(bio * 0.35, 0, 0.35)} />

          {/* anode rod */}
          <rect x={anX0} y={anY} width={anX1 - anX0} height="8" rx="2" fill="#1d1d20" />
          <text x={(anX0 + anX1) / 2} y={anY + 22} textAnchor="middle" fill="#d4af74" style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>graphite anode (-)</text>

          {/* microbes + electron donation hops */}
          {microbes.map((m, i) => { const hop = (phase * 0.002 + i * 0.37) % 1; const ey = m.y + hop * (anY - 1 - m.y); return (<g key={"m" + i}><ellipse cx={m.x} cy={m.y} rx="3.4" ry="2.3" fill="#cbe3c0" stroke={C} strokeWidth="0.5" /><circle cx={m.x} cy={ey} r="2.1" fill={A} /></g>); })}

          {/* wire stub OUT to the circuit (not the full loop) */}
          <path d={"M " + stubX + " " + anY + " L " + stubX + " " + stubTop} fill="none" stroke={T.ink} strokeWidth="2" />
          <polygon points={stubX + "," + (stubTop - 2) + " " + (stubX - 5) + "," + (stubTop + 8) + " " + (stubX + 5) + "," + (stubTop + 8)} fill={T.ink} />
          {Array.from({ length: eN }, (_, k) => { const s = ((phase * 0.0004 * (0.5 + rate) + k / eN) % 1 + 1) % 1; const y = anY - s * (anY - stubTop); return <g key={"e" + k}><circle cx={stubX} cy={y} r="4" fill={C} stroke={T.paper} strokeWidth="0.5" /><text x={stubX} y={y + 2.4} textAnchor="middle" fill={T.paper} style={f.mono(700, 6)}>e</text></g>; })}
          <text x={stubX + 10} y={stubTop - 6} fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.1 })}>to the circuit</text>

          {/* electron-output meter */}
          <rect x="40" y="232" width="180" height="10" rx="3" fill={T.paper2} stroke={T.rule22} strokeWidth="0.7" />
          <rect x="40" y="232" width={180 * rate} height="10" rx="3" fill={A} />
          <text x="40" y="254" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>electron output</text>

          {/* zoom: one microbe donating electrons to graphite */}
          <circle cx={zx} cy={zy} r={zr} fill={T.paper2} stroke={C} strokeWidth="1" />
          <rect x={zx - 40} y={zy + 22} width="80" height="14" fill="#1d1d20" />
          <text x={zx} y={zy + zr + 14} textAnchor="middle" fill={T.mute} style={f.mono(600, 6.5, { upper: true, tracking: 0.06 })}>graphite anode</text>
          <ellipse cx={zx} cy={zy - 2} rx="16" ry="11" fill="#cbe3c0" stroke={C} strokeWidth="0.8" />
          <text x={zx} y={zy} textAnchor="middle" fill={C} style={f.mono(600, 6)}>microbe</text>
          {Array.from({ length: 3 }, (_, k) => { const s = ((phase * 0.0012 + k / 3) % 1 + 1) % 1; const y = (zy + 9) + s * 13; return <g key={"ze" + k}><circle cx={zx - 8 + k * 8} cy={y} r="2.6" fill={A} /><text x={zx - 8 + k * 8} y={y + 2.4} textAnchor="middle" fill={T.paper} style={f.mono(700, 5.5)}>e</text></g>; })}
          <text x={zx} y={zy - zr - 4} textAnchor="middle" fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.08 })}>electron donation (zoom)</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={food} set={setFood} min={1} max={5} step={1} color={C} label="Food for microbes" suffix={food} />
        <Btn small icon={Plus} color={A} onClick={feed}>feed</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset biofilm</Btn>
        <div style={{ flex: 1 }} />
        <Tag color={rate > 0.55 ? A : C}>biofilm {Math.round(bio * 100)}%</Tag>
      </div>

      <Readout items={[
        { l: "Biofilm", v: Math.round(bio * 100) + "%", color: A },
        { l: "Electron output", v: Math.round(rate * 100) + "%", color: C },
        { l: "Microbes", v: microbeN },
        { l: "Mud oxygen", v: "none" },
      ]} />

      <Caption color={C}>
        Ordinary soil already holds electrogenic bacteria. Buried in oxygen-free mud, they cannot
        breathe with oxygen, so as they digest nutrients they offload their spare electrons onto the
        nearest solid surface instead. Give them a graphite anode and they coat it in a living biofilm
        and feed it a steady stream of electrons. More food grows more healthy microbes, so the
        electron output rises. Those electrons then leave up the wire to do work in the circuit.
      </Caption>
    </div>
  );
}

/* ---- 2. Capillary: race two tubes of different bore ------------------ */
function DemoCapillary() {
  // TTT "Capillary action" (concept 1). Sibling (Material and geometry) compares
  // wicks and routes. This demo owns the physics: adhesion (water to wall) plus
  // cohesion (water to water) pulls a column up a narrow bore, and Jurin's law
  // says rise height goes as 1/r, so narrower and more wettable bores climb higher
  // and faster. A rack of tubes shows the 1/r trend, a meniscus zoom shows the two
  // forces, and a strip plots height vs bore. Trees moss and terracotta.
  const C = CAMP.trees.ink, A = CAMP.trees.acc, WAT = "#4f8ec9", WHI = "#9cc2e5";
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const bores = [6, 10, 16, 24, 34], xs = [54, 110, 168, 230, 298];
  const [wett, setWett] = useState(9);          // wettability 3..12
  const [running, setRunning] = useState(true);
  const [, force] = useState(0);
  const hsRef = useRef(bores.map(() => 0));
  const srcY = 280;
  const hMax = (b) => cl(150 * (wett / 9) * (10 / b), 16, 226);
  const reset = () => { hsRef.current = bores.map(() => 0); setRunning(true); };

  useRAF(running, (dt) => {
    let settled = true;
    hsRef.current = hsRef.current.map((h, i) => { const m = hMax(bores[i]); const tau = 360 + bores[i] * 55; const nh = h + (m - h) * Math.min(1, dt / tau * 2.4); if (Math.abs(nh - m) > 1) settled = false; return nh; });
    if (settled) setRunning(false);
    force((n) => (n + 1) % 1000000);
  });

  const hs = hsRef.current;
  const VW = 480, VH = 320;
  const zx = 404, zy = 116;                       // meniscus zoom center
  const lpX = 338, lpW = 132, lpY = 246, lpH = 58; // law strip
  const lx = (b) => lpX + 12 + ((b - 6) / 28) * (lpW - 24);
  const ly = (h) => lpY + lpH - 8 - (h / 226) * (lpH - 18);

  return (
    <div>
      <Field height={330}>
        <svg viewBox="0 0 480 340" style={{ width: "100%", height: "100%" }}>
          <text x="16" y="22" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Capillary action</text>
          <text x="16" y="36" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>narrow bores pull water higher: h proportional to 1/r</text>

          {/* water source */}
          <rect x="30" y={srcY} width="290" height="20" fill={WAT} opacity="0.35" />
          <line x1="30" y1={srcY} x2="320" y2={srcY} stroke={T.ink} strokeWidth="0.6" opacity="0.6" />
          <text x="36" y={srcY + 14} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>water source</text>

          {/* rack of tubes */}
          {bores.map((b, i) => { const x = xs[i], half = b / 2 + 1, top = srcY - hs[i]; return (
            <g key={i}>
              <rect x={x - half - 1.5} y="48" width="1.5" height={srcY - 48} fill={T.ink} opacity="0.7" />
              <rect x={x + half} y="48" width="1.5" height={srcY - 48} fill={T.ink} opacity="0.7" />
              <rect x={x - half} y={top} width={2 * half} height={srcY - top} fill={WAT} opacity="0.5" />
              <path d={"M " + (x - half) + " " + top + " Q " + x + " " + (top - Math.min(7, half * (wett / 9))) + " " + (x + half) + " " + top + " L " + (x + half) + " " + (top + 2) + " L " + (x - half) + " " + (top + 2) + " Z"} fill={WAT} />
              <text x={x} y={srcY + 30} textAnchor="middle" fill={i === 0 ? A : T.mute} style={f.mono(600, 8)}>{b}</text>
            </g>
          ); })}
          <text x={xs[2]} y={srcY + 44} textAnchor="middle" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>bore width (narrow to wide)</text>
          <line x1={xs[0]} y1={srcY - hMax(bores[0])} x2={zx - 54} y2={srcY - hMax(bores[0])} stroke={A} strokeWidth="0.6" strokeDasharray="2 3" opacity="0.5" />

          {/* meniscus zoom (narrowest tube) */}
          <circle cx={zx} cy={zy} r="50" fill={T.paper2} stroke={C} strokeWidth="1" />
          <rect x={zx - 22} y={zy - 40} width="3" height="78" fill={T.ink} opacity="0.8" />
          <rect x={zx + 19} y={zy - 40} width="3" height="78" fill={T.ink} opacity="0.8" />
          <rect x={zx - 19} y={zy - 6} width="38" height="44" fill={WAT} opacity="0.5" />
          <path d={"M " + (zx - 19) + " " + (zy - 6) + " Q " + zx + " " + (zy - 26) + " " + (zx + 19) + " " + (zy - 6) + " L " + (zx + 19) + " " + (zy - 2) + " L " + (zx - 19) + " " + (zy - 2) + " Z"} fill={WAT} />
          {[-1, 1].map((s, i) => <g key={i}><line x1={zx + s * 17} y1={zy - 2} x2={zx + s * 17} y2={zy - 22} stroke={A} strokeWidth="1.4" /><polygon points={(zx + s * 17) + "," + (zy - 24) + " " + (zx + s * 17 - 3) + "," + (zy - 18) + " " + (zx + s * 17 + 3) + "," + (zy - 18)} fill={A} /></g>)}
          {[[zx - 6, zy + 12], [zx + 6, zy + 14], [zx - 2, zy + 24]].map((p, i) => <circle key={"co" + i} cx={p[0]} cy={p[1]} r="2.4" fill={WHI} />)}
          <text x={zx} y={zy - 56} textAnchor="middle" fill={T.mute} style={f.mono(600, 6.5, { upper: true, tracking: 0.08 })}>adhesion (to wall)</text>
          <text x={zx} y={zy + 64} textAnchor="middle" fill={T.mute} style={f.mono(600, 6.5, { upper: true, tracking: 0.08 })}>cohesion (water-water)</text>

          {/* height vs bore strip (1/r) */}
          <rect x={lpX} y={lpY} width={lpW} height={lpH} rx="5" fill={T.paper2} stroke={C} strokeWidth="0.8" />
          <text x={lpX + 8} y={lpY - 4} fill={T.mute} style={f.mono(700, 7, { upper: true, tracking: 0.1 })}>rise vs bore</text>
          <polyline points={bores.map((b) => lx(b).toFixed(1) + "," + ly(hMax(b)).toFixed(1)).join(" ")} fill="none" stroke={A} strokeWidth="1.6" />
          {bores.map((b, i) => <circle key={"lp" + i} cx={lx(b)} cy={ly(hMax(b))} r={i === 0 ? 3 : 2} fill={i === 0 ? A : C} />)}
          <text x={lpX + 8} y={lpY + lpH - 4} fill={T.mute} style={f.mono(500, 6.5)}>narrow</text>
          <text x={lpX + lpW - 8} y={lpY + lpH - 4} textAnchor="end" fill={T.mute} style={f.mono(500, 6.5)}>wide</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={wett} set={(v) => { setWett(v); }} min={3} max={12} step={1} color={C} label="Wettability" suffix={wett} />
        <Btn small icon={running ? Pause : Play} color={C} onClick={() => setRunning((r) => !r)}>{running ? "pause" : "run"}</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>

      <Readout items={[
        { l: "Narrowest rise", v: Math.round(hs[0]) + " px", color: A },
        { l: "Widest rise", v: Math.round(hs[4]) + " px", color: C },
        { l: "Ratio narrow:wide", v: (bores[4] / bores[0]).toFixed(1) + "x" },
        { l: "Law", v: "h ~ 1/r" },
      ]} />

      <Caption color={C}>
        Water sticks to the glass (adhesion) and to itself (cohesion), so along a narrow wall it is
        pulled upward and drags a connected column with it against gravity. The thinner the bore, the
        less weight there is for the same wall grip, so the water climbs higher and faster: rise height
        goes as 1 over the radius. More wettable walls pull harder still. Trees use this in their xylem
        to lift water from the roots.
      </Caption>
    </div>
  );
}

/* ---- 3. Oobleck: direct-manipulation shear thickening --------------- */
function DemoOobleck() {
  // PYS-02 "Shear-thickening fluids" (concept 1). Sibling (Material efficiency)
  // is the least-material optimization. This demo owns the physics: press slowly
  // and the grains flow so your finger sinks (liquid); shear fast and the grains
  // jam into a solid that resists and even cracks. The viscosity-vs-shear strip
  // shows the defining behavior: resistance rises with shear rate. PY-STEM navy
  // and copper. Drag uses the letterbox mapping and stable handlers (6.1, 6.2).
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const VBW = 460, VBH = 280, stage = useRef(null);
  const [, force] = useState(0);
  const posRef = useRef({ x: 230, y: 120, active: false });
  const velRef = useRef(0);
  const prevRef = useRef({ x: 230, y: 120, t: 0 });
  const cracksRef = useRef([]); const idRef = useRef(0); const lastCrackRef = useRef(0);

  const particles = useMemo(() => { const out = []; for (let i = 0; i < 22; i++) for (let j = 0; j < 11; j++) out.push({ x: 32 + i * 18 + (j % 2 ? 7 : 0), y: 38 + j * 16 }); return out; }, []);

  const toVB = (x, y, w, h) => { const sc = Math.min(w / VBW, h / VBH); return { ux: (x - (w - VBW * sc) / 2) / sc, uy: (y - (h - VBH * sc) / 2) / sc }; };
  const moveImpl = ({ x, y, w, h }) => {
    let { ux, uy } = toVB(x, y, w, h); ux = cl(ux, 22, 438); uy = cl(uy, 30, 206); const now = performance.now();
    const dt = Math.max(8, now - prevRef.current.t), dx = ux - prevRef.current.x, dy = uy - prevRef.current.y;
    const v = Math.hypot(dx, dy) / dt * 1000;
    velRef.current = velRef.current * 0.7 + v * 0.3;
    posRef.current = { x: ux, y: uy, active: true };
    if (v > 1100 && now - lastCrackRef.current > 110) { cracksRef.current = [...cracksRef.current.slice(-4), { x: ux, y: uy, a: Math.atan2(dy, dx), id: idRef.current++, born: now }]; lastCrackRef.current = now; }
    prevRef.current = { x: ux, y: uy, t: now }; force((n) => (n + 1) % 1000000);
  };
  const moveRef = useRef(moveImpl); moveRef.current = moveImpl;
  const onMove = useRef((a) => moveRef.current(a)).current;
  const onUp = useRef(() => { posRef.current = { ...posRef.current, active: false }; force((n) => (n + 1) % 1000000); }).current;
  usePointerDrag(stage, onMove, onUp);

  useRAF(true, (dt) => { velRef.current *= Math.exp(-dt / 240); const now = performance.now(); cracksRef.current = cracksRef.current.filter((c) => now - c.born < 700); force((n) => (n + 1) % 1000000); });

  const vel = velRef.current, pos = posRef.current, stiff = vel > 1100;
  const state = vel > 1100 ? "solid" : vel > 350 ? "thickening" : "liquid";
  const stateC = vel > 1100 ? A : vel > 350 ? C : T.mute;
  const viscFn = (s) => cl(1 + Math.pow(s / 300, 1.7), 1, 14);
  const visc = viscFn(vel);
  const trayY0 = 22, trayY1 = 214, gx0 = 20, gx1 = 440, gy0 = 230, gy1 = 262;
  const sxp = (s) => gx0 + cl(s / 1400, 0, 1) * (gx1 - gx0);
  const vyp = (vv) => gy1 - (vv / 14) * (gy1 - gy0);
  const curve = []; for (let s = 0; s <= 1400; s += 70) curve.push(sxp(s).toFixed(1) + "," + vyp(viscFn(s)).toFixed(1));

  return (
    <div>
      <Field height={290}>
        <div ref={stage} style={{ position: "absolute", inset: 0, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: pos.active ? "grabbing" : "grab" }}>
          <svg viewBox={"0 0 " + VBW + " " + VBH} style={{ width: "100%", height: "100%" }}>
            <text x="16" y="16" fill={C} style={f.mono(700, 11, { upper: true, tracking: 0.1 })}>Shear-thickening fluid</text>
            <text x="444" y="16" textAnchor="end" fill={stateC} style={f.mono(700, 10, { upper: true, tracking: 0.12 })}>{state}</text>

            {/* tray */}
            <rect x="14" y={trayY0} width="432" height={trayY1 - trayY0} rx="4" fill={T.paper3} opacity="0.5" stroke={T.ink} strokeWidth="0.7" />

            {/* particles */}
            {particles.map((p, i) => {
              const dx = pos.x - p.x, dy = pos.y - p.y, d = Math.hypot(dx, dy);
              const push = Math.max(0, 36 - d) * (stiff ? 0.05 : vel > 350 ? 0.18 : 0.36);
              const ang = Math.atan2(dy, dx);
              const r = stiff ? 4.4 : vel > 350 ? 3.7 : 3.0;
              const col = stiff ? C : vel > 350 ? "#3f5a82" : T.mute;
              return <circle key={i} cx={p.x - Math.cos(ang) * push} cy={p.y - Math.sin(ang) * push} r={r} fill={col} opacity={pos.y > trayY1 - 6 ? 0.5 : 0.9} />;
            })}

            {/* slow dimple */}
            {!stiff && pos.active && pos.y < trayY1 && <ellipse cx={pos.x} cy={pos.y + 7} rx={Math.max(6, 28 - vel * 0.006)} ry="6" fill={C} opacity="0.16" />}

            {/* cracks (fast shear) */}
            {cracksRef.current.map((c) => { const age = (performance.now() - c.born) / 700; const ease = 1 - Math.pow(1 - Math.min(1, age * 2.4), 3); const len = 16 + ease * 74; const ex = cl(c.x + Math.cos(c.a + 0.4) * len, 18, 442); const ey = cl(c.y + Math.sin(c.a + 0.4) * len, trayY0 + 2, trayY1 - 2); return <line key={c.id} x1={c.x} y1={c.y} x2={ex} y2={ey} stroke={A} strokeWidth="1.4" opacity={1 - age} />; })}

            {/* finger */}
            {pos.active && pos.y < trayY1 && <g transform={"translate(" + pos.x.toFixed(1) + " " + pos.y.toFixed(1) + ")"} style={{ pointerEvents: "none" }}><circle r="14" fill={T.paper} stroke={T.ink} strokeWidth="1.2" opacity="0.92" /><circle r="3" fill={stiff ? A : C} /></g>}

            <text x="20" y={trayY0 + 12} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>press slow to sink, flick fast to jam</text>

            {/* viscosity vs shear strip */}
            <line x1={gx0} y1={gy1} x2={gx1} y2={gy1} stroke={T.rule22} strokeWidth="0.7" />
            <polyline points={curve.join(" ")} fill="none" stroke={A} strokeWidth="2" />
            <line x1={sxp(vel)} y1={gy0 - 4} x2={sxp(vel)} y2={gy1} stroke={C} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            <circle cx={sxp(vel)} cy={vyp(visc)} r="3.4" fill={A} stroke={T.paper} strokeWidth="1.1" />
            <text x={gx0} y={gy0 - 6} fill={T.mute} style={f.mono(700, 7.5, { upper: true, tracking: 0.12 })}>viscosity vs shear rate</text>
            <text x={gx1} y={gy1 + 12} textAnchor="end" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })}>faster shear</text>
          </svg>
        </div>
      </Field>

      <Readout items={[
        { l: "Shear rate", v: vel.toFixed(0) + " px/s", color: C },
        { l: "State", v: state, color: stateC },
        { l: "Resistance", v: Math.round(cl(visc / 14 * 100, 0, 100)) + "%", color: A },
        { l: "Grains", v: stiff ? "jammed" : vel > 350 ? "locking" : "free" },
      ]} />

      <Caption color={C}>
        Oobleck is cornstarch grains suspended in water. Press slowly and the grains have time to slide
        past each other, so the mix flows like a liquid and your finger sinks in. Shear it fast and the
        grains cannot get out of the way in time, so they jam together into a solid that resists the
        push and can even crack. Its viscosity rises with how fast you shear it, which is exactly how
        shear-thickening impact armor stiffens on a hit.
      </Caption>
    </div>
  );
}

/* ---- 4. Samara autorotation: race two designs ----------------------- */
function DemoSamara() {
  // TTT "Drag, lift, and hang time" (concept 1). Sibling ExtraOneVar (concept 2)
  // is the change-one-variable-at-a-time method. This demo owns the physics of one
  // samara: it autorotates as it falls, the spinning wing makes lift that opposes
  // gravity so terminal velocity is low, hang time is long, and a breeze carries
  // the seed beyond the parent's shade. The air is drawn as drifting streamlines,
  // the canopy is opaque so the trunk never shows through, and the zone labels sit
  // below the ground so they never cover the leaf or the seed.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [wing, setWing] = useState(8);
  const [windOn, setWindOn] = useState(true);
  const [running, setRunning] = useState(false);
  const [, force] = useState(0);
  const tRef = useRef(0), angRef = useRef(0), windRef = useRef(0);
  const posRef = useRef({ x: 110, y: 58, landed: false, landX: 0, tEnd: 0 });
  const traceRef = useRef([]);

  const VW = 480, VH = 300, rx = 110, ry = 58, gy = 250, shadeX0 = 36, shadeX1 = 172;
  const leafDark = "#1f4a2b", leafLight = "#3f7a45", bark = "#6b4a2a";
  const vT = cl(0.182 - wing * 0.0118, 0.045, 0.182);   // px/ms terminal velocity
  const vx = windOn ? 0.05 : 0;
  const reset = () => { tRef.current = 0; angRef.current = 0; posRef.current = { x: rx, y: ry, landed: false, landX: 0, tEnd: 0 }; traceRef.current = []; setRunning(true); };

  // always-on RAF: the air drifts even while idle; the fall advances only when running (6.6)
  useRAF(true, (dt) => {
    windRef.current += dt;
    if (running) {
      tRef.current += dt; angRef.current += (0.35 + wing * 0.05) * dt;
      const p = posRef.current;
      if (!p.landed) {
        let ny = p.y + vT * dt;
        let nx = p.x + vx * dt + Math.cos(angRef.current * Math.PI / 180) * 0.25;
        const tr = traceRef.current; tr.push({ x: nx, y: ny }); if (tr.length > 260) tr.shift();
        if (ny >= gy) posRef.current = { x: nx, y: gy, landed: true, landX: nx, tEnd: tRef.current };
        else posRef.current = { x: nx, y: ny, landed: false, landX: 0, tEnd: 0 };
      }
      if (posRef.current.landed) setRunning(false);
    }
    force((n) => (n + 1) % 1000000);
  });

  const p = posRef.current, ang = angRef.current;
  const hang = (p.landed ? p.tEnd : tRef.current) / 1000;
  const fallLbl = vT > 0.13 ? "fast" : vT > 0.085 ? "medium" : "slow";
  const landX = p.landed ? p.landX : p.x;
  const beyond = landX > shadeX1;
  const fx = 392, fy = 96;                                  // force-diagram center
  const liftLen = cl(8 + wing * 1.5, 12, 26), wLen = 26;

  const Seed = ({ x, y, a, scale }) => { const L = 14 + wing * 1.8, wWid = 4 + wing * 0.5; return (
    <g transform={"translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + a.toFixed(1) + ") scale(" + scale + ")"}>
      <path d={"M 0 0 Q " + (L * 0.5) + " " + (-wWid) + " " + L + " " + (-wWid * 0.4) + " Q " + (L * 0.95) + " 0 " + L + " " + (wWid * 0.4) + " Q " + (L * 0.5) + " " + wWid + " 0 0 Z"} fill={A} opacity="0.92" stroke={T.ink} strokeWidth="0.5" />
      <line x1="0" y1="0" x2={L * 0.88} y2="0" stroke={T.ink} strokeWidth="0.4" opacity="0.5" />
      <ellipse cx="-3" cy="0" rx="5.5" ry="4" fill="#7a5732" stroke={T.ink} strokeWidth="0.5" />
    </g>
  ); };

  // drifting air: faint traveling sine streamlines flowing left to right
  const wT = windRef.current;
  const streamPts = (yBase, x0, x1, amp, k, sp) => { let out = ""; for (let x = x0; x <= x1; x += 7) { const yy = yBase + amp * Math.sin(k * (x - x0) - wT * sp); out += x.toFixed(1) + "," + yy.toFixed(1) + " "; } return out.trim(); };
  const streams = [
    { y: 78, x0: 150, x1: 300, amp: 5, k: 0.060, sp: 0.0040 },
    { y: 112, x0: 165, x1: 300, amp: 7, k: 0.050, sp: 0.0050 },
    { y: 150, x0: 150, x1: 300, amp: 6, k: 0.055, sp: 0.0045 },
    { y: 192, x0: 170, x1: 300, amp: 8, k: 0.050, sp: 0.0038 },
    { y: 226, x0: 150, x1: 296, amp: 5, k: 0.060, sp: 0.0050 },
  ];

  return (
    <div>
      <Field height={300}>
        <svg viewBox="0 0 480 300" style={{ width: "100%", height: "100%" }}>
          <text x="16" y="24" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Drag, lift, and hang time</text>
          <text x="16" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>a spinning wing slows the fall and spreads the seed</text>

          {/* ground */}
          <line x1="24" y1={gy} x2="456" y2={gy} stroke={T.ink} strokeWidth="0.9" />

          {/* below-ground zone strip: region labels live here, never over the leaf or seed */}
          <line x1={shadeX1} y1={gy} x2={shadeX1} y2={gy + 22} stroke={T.rule22} strokeWidth="1" />
          <text x={(shadeX0 + shadeX1) / 2 + 6} y={gy + 16} textAnchor="middle" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.08 })}>parent shade</text>
          <text x={(shadeX1 + 456) / 2} y={gy + 16} textAnchor="middle" fill={T.ok} style={f.mono(600, 7.5, { upper: true, tracking: 0.08 })}>open, more light</text>

          {/* cast shadow on the ground under the canopy */}
          <ellipse cx={shadeX0 + 56} cy={gy} rx="74" ry="7" fill={C} opacity="0.16" />

          {/* faint shade-edge marker in the air, behind the seed */}
          <line x1={shadeX1} y1={gy} x2={shadeX1} y2="72" stroke={T.mute} strokeWidth="0.8" strokeDasharray="3 5" opacity="0.3" />

          {/* parent tree: tapered trunk, then an opaque layered canopy that hides the trunk top */}
          <path d={"M " + (shadeX0 + 48) + " " + gy + " L " + (shadeX0 + 53) + " 132 L " + (shadeX0 + 61) + " 132 L " + (shadeX0 + 66) + " " + gy + " Z"} fill={bark} />
          <ellipse cx={shadeX0 + 56} cy="96" rx="56" ry="44" fill={leafDark} />
          <ellipse cx={shadeX0 + 34} cy="106" rx="30" ry="26" fill={C} />
          <ellipse cx={shadeX0 + 78} cy="104" rx="30" ry="25" fill={C} />
          <ellipse cx={shadeX0 + 54} cy="84" rx="34" ry="28" fill={leafLight} opacity="0.92" />

          {/* release height line (stops before the force inset) */}
          <line x1={rx} y1={ry} x2="320" y2={ry} stroke={T.ink} strokeWidth="0.5" strokeDasharray="3 4" opacity="0.5" />
          <text x="320" y={ry - 4} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>release height</text>

          {/* drifting air */}
          {windOn && streams.map((sm, i) => { const pts = streamPts(sm.y, sm.x0, sm.x1, sm.amp, sm.k, sm.sp); const ye = sm.y + sm.amp * Math.sin(sm.k * (sm.x1 - sm.x0) - wT * sm.sp); return (
            <g key={"air" + i} opacity="0.5">
              <polyline points={pts} fill="none" stroke={T.mute} strokeWidth="1.1" strokeLinecap="round" />
              <polygon points={(sm.x1 + 6).toFixed(1) + "," + ye.toFixed(1) + " " + sm.x1.toFixed(1) + "," + (ye - 3).toFixed(1) + " " + sm.x1.toFixed(1) + "," + (ye + 3).toFixed(1)} fill={T.mute} />
            </g>
          ); })}

          {/* helical fall trace */}
          <polyline points={traceRef.current.map((q) => q.x.toFixed(1) + "," + q.y.toFixed(1)).join(" ")} fill="none" stroke={A} strokeWidth="0.8" opacity="0.5" />

          {/* landing marker, drawn before the seed so the seed sits on top */}
          {p.landed && <g><line x1={landX} y1={gy} x2={landX} y2={gy - 14} stroke={beyond ? T.ok : T.warn} strokeWidth="1" strokeDasharray="2 2" opacity="0.7" /><circle cx={landX} cy={gy} r="4.5" fill={beyond ? T.ok : T.warn} stroke={T.paper} strokeWidth="0.8" /></g>}

          {/* the samara */}
          <Seed x={p.x} y={p.y} a={ang} scale={1} />

          {/* force diagram inset (separate box, right) */}
          <rect x={fx - 64} y={fy - 44} width="128" height="126" rx="6" fill={T.paper2} stroke={C} strokeWidth="1" />
          <text x={fx} y={fy - 31} textAnchor="middle" fill={T.mute} style={f.mono(700, 8, { upper: true, tracking: 0.14 })}>forces on the seed</text>
          <Seed x={fx} y={fy + 14} a={20} scale={0.85} />
          <line x1={fx} y1={fy + 14} x2={fx} y2={fy + 14 + wLen} stroke={T.ink} strokeWidth="2" />
          <polygon points={fx + "," + (fy + 16 + wLen) + " " + (fx - 4) + "," + (fy + 8 + wLen) + " " + (fx + 4) + "," + (fy + 8 + wLen)} fill={T.ink} />
          <text x={fx + 7} y={fy + 14 + wLen} fill={T.ink} style={f.mono(600, 7)}>weight</text>
          <line x1={fx} y1={fy + 14} x2={fx} y2={fy + 14 - liftLen} stroke={A} strokeWidth="2.4" />
          <polygon points={fx + "," + (fy + 12 - liftLen) + " " + (fx - 4) + "," + (fy + 20 - liftLen) + " " + (fx + 4) + "," + (fy + 20 - liftLen)} fill={A} />
          <text x={fx + 7} y={fy + 18 - liftLen} fill={A} style={f.mono(600, 7)}>lift</text>
          <text x={fx} y={fy + 70} textAnchor="middle" fill={T.mute} style={f.mono(600, 6.5, { upper: true, tracking: 0.06 })}>net fall: {fallLbl}</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={wing} set={setWing} min={3} max={12} step={1} color={A} label="Wing area" suffix={wing} />
        <Btn small icon={Wind} active={windOn} color={C} onClick={() => setWindOn((w) => !w)}>wind</Btn>
        <Btn small icon={Play} color={A} onClick={reset}>drop seed</Btn>
      </div>

      <Readout items={[
        { l: "Wing area", v: wing + " / 12", color: A },
        { l: "Fall speed", v: fallLbl, color: C },
        { l: "Hang time", v: hang.toFixed(2) + " s" },
        { l: "Dispersal", v: p.landed ? (beyond ? "beyond shade" : "in shade") : "falling", color: p.landed ? (beyond ? T.ok : T.warn) : T.mute },
      ]} />

      <Caption color={C}>
        A maple samara does not just drop; the offset wing makes it autorotate, and the spinning wing
        generates lift that pushes up against gravity. With lift opposing weight the seed reaches a low
        terminal velocity, so it falls slowly and stays aloft long enough for even a light breeze to
        carry it past the shade of its parent, where there is light to grow. More wing area for the
        same seed mass means more lift, a slower fall, and a longer hang time.
      </Caption>
    </div>
  );
}

/* ---- 5. Treering: scrubbable core, synced climate strip ------------- */
function DemoTreering() {
  // TTT "Rings as proxy data" (concept 1). Sibling ExtraCER (concept 2) is the
  // claim/evidence/reasoning drill. This demo owns the proxy idea: one ring per
  // year, wide rings = good season, narrow = stress, so the ring series is an
  // indirect record of past climate. A real concentric cross-section on the left
  // is synced to a width-per-year record on the right; scrub a year to read both.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const N = 36, y0 = 1989;
  const rings = useMemo(() => {
    const out = []; let ph = 0;
    for (let i = 0; i < N; i++) {
      ph += 0.5;
      const drought = (i >= 12 && i <= 16) ? -2.6 : 0;
      const fire = (i === 24) ? -3.6 : 0;
      const w = Math.max(0.9, 5.4 + Math.sin(ph) * 1.1 + Math.sin(ph * 0.4) * 1.5 + drought + fire);
      const ev = fire ? "fire scar" : drought ? "drought" : (w > 6.6 ? "wet warm year" : (w < 3.4 ? "stress year" : "average"));
      out.push({ year: y0 + i, w, ev, fire: !!fire, drought: !!drought });
    }
    return out;
  }, []);
  const [sel, setSel] = useState(20);
  const sr = rings[sel];
  const woodCol = (r) => r.fire ? "#3b2410" : (r.drought || r.w < 3.4) ? "#7a4b22" : (r.w > 6.6 ? "#cda35a" : "#a8763a");

  // disc geometry: cumulative radii
  const cx = 128, cy = 168, pith = 7, maxR = 104;
  const total = rings.reduce((s, r) => s + r.w, 0), k = (maxR - pith) / total;
  const radii = []; let acc = pith; for (let i = 0; i < N; i++) { acc += rings[i].w * k; radii.push(acc); }
  const rInner = (i) => i === 0 ? pith : radii[i - 1];

  // series geometry
  const pX = 264, pW = 204, pY = 70, pH = 150, baseY = pY + pH - 16;
  const bw = pW / N, maxW = Math.max(...rings.map((r) => r.w));
  const bh = (w) => (w / maxW) * (pH - 30);

  return (
    <div>
      <Field height={300}>
        <svg viewBox="0 0 480 300" style={{ width: "100%", height: "100%" }}>
          <text x="16" y="24" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Rings as proxy data</text>
          <text x="16" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>one ring per year, width records the season</text>

          {/* concentric cross-section (outer drawn first) */}
          <circle cx={cx} cy={cy} r={maxR + 5} fill="#8a5a2c" />
          {rings.slice().reverse().map((r, ri) => { const i = N - 1 - ri; return <circle key={i} cx={cx} cy={cy} r={radii[i]} fill={woodCol(r)} />; })}
          <circle cx={cx} cy={cy} r={pith} fill="#5e3a18" />
          {/* selected ring highlight */}
          <circle cx={cx} cy={cy} r={radii[sel]} fill="none" stroke={A} strokeWidth="1.6" />
          <circle cx={cx} cy={cy} r={rInner(sel)} fill="none" stroke={A} strokeWidth="1.6" opacity="0.7" />
          {/* radial pointer to the selected ring */}
          {(() => { const rr = (rInner(sel) + radii[sel]) / 2; const ang = -Math.PI / 2.4; const ex = cx + Math.cos(ang) * rr, ey = cy + Math.sin(ang) * rr; return (<g><line x1={cx} y1={cy} x2={cx + Math.cos(ang) * (maxR + 16)} y2={cy + Math.sin(ang) * (maxR + 16)} stroke={A} strokeWidth="0.7" strokeDasharray="2 3" opacity="0.7" /><circle cx={ex} cy={ey} r="3.2" fill={A} stroke={T.paper} strokeWidth="1" /></g>); })()}
          <text x={cx} y={cy + maxR + 22} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>trunk cross-section</text>
          <text x={cx} y={52} textAnchor="middle" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.06 })}>outside = newest, center = oldest</text>

          {/* width-per-year record */}
          <text x={pX} y={pY - 8} fill={T.mute} style={f.mono(700, 8.5, { upper: true, tracking: 0.14 })}>ring width per year (proxy record)</text>
          <line x1={pX} y1={baseY} x2={pX + pW} y2={baseY} stroke={T.rule22} strokeWidth="0.7" />
          {rings.map((r, i) => <rect key={"s" + i} x={pX + i * bw + 0.4} y={baseY - bh(r.w)} width={bw - 0.8} height={bh(r.w)} fill={woodCol(r)} opacity={i === sel ? 1 : 0.85} />)}
          {/* drought + fire markers */}
          {(() => { const ds = rings.findIndex((r) => r.drought), de = rings.length - 1 - rings.slice().reverse().findIndex((r) => r.drought); const fi = rings.findIndex((r) => r.fire); return (<g><rect x={pX + ds * bw} y={pY + 2} width={(de - ds + 1) * bw} height={pH - 18} fill={T.warn} opacity="0.08" /><text x={pX + (ds + (de - ds) / 2) * bw} y={baseY + 11} textAnchor="middle" fill="#7a4b22" style={f.mono(700, 6.5, { upper: true, tracking: 0.06 })}>drought</text><line x1={pX + fi * bw + bw / 2} y1={pY + 2} x2={pX + fi * bw + bw / 2} y2={baseY} stroke="#3b2410" strokeWidth="1.2" strokeDasharray="2 2" /><text x={pX + fi * bw + bw / 2} y={baseY + 11} textAnchor="middle" fill="#3b2410" style={f.mono(700, 6.5, { upper: true, tracking: 0.04 })}>fire</text></g>); })()}
          {/* selected cursor */}
          <line x1={pX + sel * bw + bw / 2} y1={pY} x2={pX + sel * bw + bw / 2} y2={baseY} stroke={A} strokeWidth="1.1" strokeDasharray="3 3" />
          <text x={pX} y={baseY + 11} fill={T.mute} style={f.mono(500, 7)}>{rings[0].year}</text>
          <text x={pX + pW} y={baseY + 11} textAnchor="end" fill={T.mute} style={f.mono(500, 7)}>{rings[N - 1].year}</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={sel} set={setSel} min={0} max={N - 1} step={1} color={C} label="Scrub year" suffix={sr.year} />
        <Tag color={sr.fire ? "#3b2410" : sr.drought ? "#7a4b22" : A}>{sr.ev}</Tag>
      </div>

      <Readout items={[
        { l: "Year", v: sr.year, color: C },
        { l: "Ring width", v: sr.w.toFixed(1) + " mm", color: A },
        { l: "Season", v: sr.w > 6.6 ? "good growth" : sr.w < 3.4 ? "stress" : "average" },
        { l: "Record", v: "proxy" },
      ]} />

      <Caption color={C}>
        A tree lays down one ring each year, so counting from the bark inward dates every ring. A wide
        pale ring means a warm, wet, easy season; a narrow dark ring means stress such as drought,
        cold, or crowding; a charcoal scar marks a fire. The tree never writes down a number, so the
        rings are a proxy, an indirect record that lets us reconstruct the climate of years no one
        measured.
      </Caption>
    </div>
  );
}

/* ---- 6. Lotus effect: tilt, droplet beads or wets, picks up dirt ---- */
function DemoLotus() {
  // TTT "Hydrophobic micro-texture" (concept 1). Sibling ExtraRoughCoat (concept 2)
  // races droplets down a ramp and scores residue. This demo owns the micro-scale
  // mechanism: wax plus tiny bumps trap an air layer so water cannot wet the
  // surface, the contact angle climbs past 150 degrees, the drop beads into a near
  // sphere and rolls off carrying dirt. A zoom inset shows the air pockets and a
  // gauge shows wetting vs hydrophobic vs superhydrophobic.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const WAT = "#4f8ec9", WHI = "#9cc2e5", DIRT = "#a07a3a";
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [textured, setTextured] = useState(true);
  const [tilt, setTilt] = useState(12);
  const [running, setRunning] = useState(false);
  const [, force] = useState(0);
  const pRef = useRef(0);
  const removedRef = useRef(0);
  const dirt = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ u: 0.2 + i * 0.1 })), []);
  const dirtRef = useRef(dirt.map((d) => ({ u: d.u, taken: false })));
  const reset = () => { pRef.current = 0; removedRef.current = 0; dirtRef.current = dirt.map((d) => ({ u: d.u, taken: false })); setRunning(true); };

  const VW = 480, VH = 300, sx0 = 34, sx1 = 320, syMid = 176;
  const tr = tilt * Math.PI / 180, dropH = (sx1 - sx0) * Math.tan(tr) * 0.5;
  const sy0 = syMid - dropH / 2, sy1 = syMid + dropH / 2;
  const at = (u) => ({ x: sx0 + (sx1 - sx0) * u, y: sy0 + (sy1 - sy0) * u });

  useRAF(running, (dt) => {
    pRef.current = Math.min(1, pRef.current + dt * 0.00045 * (0.4 + tilt / 20));
    const p = pRef.current, dp = at(p);
    if (textured) dirtRef.current.forEach((d) => { if (!d.taken) { const q = at(d.u); if (Math.abs(q.x - dp.x) < 15 && p >= d.u) { d.taken = true; removedRef.current++; } } });
    if (p >= 1) setRunning(false);
    force((n) => (n + 1) % 1000000);
  });

  const p = pRef.current, dp = at(p);
  const ca = textured ? Math.round(cl(150 + tilt * 0.5, 150, 168)) : Math.round(cl(58 - tilt * 0.6, 30, 60));
  const regime = ca >= 150 ? "superhydrophobic" : ca >= 90 ? "hydrophobic" : "wetting";
  const regC = ca >= 150 ? A : ca >= 90 ? C : T.mute;
  const removed = removedRef.current;
  const dcx = dp.x, dcy = dp.y - (textured ? 20 : 9);
  const mcx = 408, mcy = 98, mr = 60;                 // magnifier
  const gx0 = 34, gx1 = 320, gy = 270;                // regime gauge
  const gpos = (deg) => gx0 + (deg / 180) * (gx1 - gx0);

  return (
    <div>
      <Field height={300}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x="16" y="24" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Hydrophobic micro-texture</text>
          <text x="16" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>bumps plus wax make water bead and self-clean</text>

          {/* leaf surface */}
          <line x1={sx0} y1={sy0} x2={sx1} y2={sy1} stroke={C} strokeWidth="3" strokeLinecap="round" />
          {textured && Array.from({ length: 24 }, (_, i) => { const u = i / 23; const q = at(u); return <path key={"b" + i} d={"M " + (q.x - 3) + " " + (q.y) + " Q " + q.x + " " + (q.y - 6) + " " + (q.x + 3) + " " + q.y} fill="none" stroke={C} strokeWidth="1.4" />; })}
          {!textured && <line x1={sx0} y1={sy0 - 2} x2={sx1} y2={sy1 - 2} stroke={WHI} strokeWidth="1" opacity="0.5" />}
          <text x={sx0} y={sy1 + 22} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>leaf surface ({textured ? "rough + waxy" : "smooth"})</text>

          {/* dirt on surface */}
          {dirtRef.current.map((d, i) => !d.taken && (() => { const q = at(d.u); return <circle key={"d" + i} cx={q.x} cy={q.y - 3} r="2.4" fill={DIRT} />; })())}

          {/* droplet */}
          {textured ? (
            <g>
              <circle cx={dcx} cy={dcy} r="18" fill={WAT} opacity="0.9" />
              <ellipse cx={dcx - 6} cy={dcy - 6} rx="4" ry="3" fill={WHI} opacity="0.7" />
              {Array.from({ length: Math.min(removed, 7) }, (_, i) => <circle key={"pd" + i} cx={dcx + Math.cos(i * 1.3) * 9} cy={dcy + Math.sin(i * 1.3) * 7} r="1.7" fill={DIRT} />)}
            </g>
          ) : (
            <g transform={"rotate(" + (Math.atan2(sy1 - sy0, sx1 - sx0) * 180 / Math.PI).toFixed(2) + " " + dp.x + " " + dp.y + ")"}>
              <path d={"M " + (dcx - 30) + " " + (dp.y - 1) + " Q " + (dcx - 14) + " " + (dp.y - 16) + " " + dcx + " " + (dp.y - 16) + " Q " + (dcx + 14) + " " + (dp.y - 16) + " " + (dcx + 30) + " " + (dp.y - 1) + " Z"} fill={WAT} opacity="0.85" />
            </g>
          )}

          {/* contact-angle wedge at the drop base */}
          {(() => { const phiDeg = Math.atan2(sy1 - sy0, sx1 - sx0) * 180 / Math.PI; const a2 = ca * Math.PI / 180, r1 = 26; const e1x = dp.x + r1, e2x = dp.x + Math.cos(a2) * r1, e2y = dp.y - Math.sin(a2) * r1; const axx = dp.x + Math.cos(a2) * 14, ayy = dp.y - Math.sin(a2) * 14; return (<g><g transform={"rotate(" + phiDeg.toFixed(1) + " " + dp.x + " " + dp.y + ")"}><line x1={dp.x} y1={dp.y} x2={e1x} y2={dp.y} stroke={regC} strokeWidth="1" /><line x1={dp.x} y1={dp.y} x2={e2x} y2={e2y} stroke={regC} strokeWidth="1.6" /><path d={"M " + (dp.x + 14) + " " + dp.y + " A 14 14 0 0 0 " + axx + " " + ayy} fill="none" stroke={regC} strokeWidth="1" /></g><text x={dp.x} y={dp.y + 18} textAnchor="middle" fill={regC} style={f.mono(700, 9.5)}>{ca} deg</text></g>); })()}

          {/* magnifier zoom of the contact */}
          <line x1={dcx} y1={dcy} x2={mcx} y2={mcy + mr} stroke={T.rule22} strokeWidth="0.6" strokeDasharray="2 3" />
          <circle cx={mcx} cy={mcy} r={mr} fill={T.paper2} stroke={C} strokeWidth="1" />
          {textured ? (
            <g>
              {Array.from({ length: 6 }, (_, i) => { const bx = mcx - 40 + i * 16; return <path key={"mb" + i} d={"M " + (bx - 6) + " " + (mcy + 28) + " Q " + bx + " " + (mcy + 14) + " " + (bx + 6) + " " + (mcy + 28)} fill={C} />; })}
              <path d={"M " + (mcx - 46) + " " + (mcy + 14) + " Q " + mcx + " " + (mcy - 30) + " " + (mcx + 46) + " " + (mcy + 14)} fill={WAT} opacity="0.9" />
              {Array.from({ length: 5 }, (_, i) => <ellipse key={"ap" + i} cx={mcx - 32 + i * 16} cy={mcy + 22} rx="5" ry="3.5" fill={T.paper} opacity="0.9" />)}
              <text x={mcx} y={mcy + mr + 14} textAnchor="middle" fill={C} style={f.mono(600, 7, { upper: true, tracking: 0.08 })}>air pockets: no wetting</text>
            </g>
          ) : (
            <g>
              <line x1={mcx - 46} y1={mcy + 24} x2={mcx + 46} y2={mcy + 24} stroke={C} strokeWidth="2.4" />
              <path d={"M " + (mcx - 44) + " " + (mcy + 23) + " Q " + mcx + " " + (mcy - 6) + " " + (mcx + 44) + " " + (mcy + 23) + " Z"} fill={WAT} opacity="0.8" />
              <text x={mcx} y={mcy + mr + 14} textAnchor="middle" fill={C} style={f.mono(600, 7, { upper: true, tracking: 0.08 })}>water wets the surface</text>
            </g>
          )}
          <text x={mcx} y={mcy - mr - 4} textAnchor="middle" fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.1 })}>micro-texture (zoom)</text>

          {/* contact-angle regime gauge */}
          <rect x={gx0} y={gy} width={gpos(90) - gx0} height="8" fill={T.mute} opacity="0.25" />
          <rect x={gpos(90)} y={gy} width={gpos(150) - gpos(90)} height="8" fill={C} opacity="0.3" />
          <rect x={gpos(150)} y={gy} width={gx1 - gpos(150)} height="8" fill={A} opacity="0.4" />
          <polygon points={gpos(ca) + "," + (gy - 2) + " " + (gpos(ca) - 4) + "," + (gy - 9) + " " + (gpos(ca) + 4) + "," + (gy - 9)} fill={regC} />
          <text x={gx0} y={gy + 18} fill={T.mute} style={f.mono(500, 6.5, { upper: true, tracking: 0.06 })}>wetting</text>
          <text x={gpos(120)} y={gy + 18} textAnchor="middle" fill={T.mute} style={f.mono(500, 6.5, { upper: true, tracking: 0.06 })}>hydrophobic</text>
          <text x={gx1} y={gy + 18} textAnchor="end" fill={T.mute} style={f.mono(500, 6.5, { upper: true, tracking: 0.06 })}>superhydrophobic</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Btn small active={textured} color={C} onClick={() => setTextured((t) => !t)}>{textured ? "textured + waxy" : "smooth"}</Btn>
        <Slider val={tilt} set={setTilt} min={4} max={28} step={1} color={C} label="Tilt" suffix={tilt + " deg"} />
        <Btn small icon={Play} color={A} onClick={reset}>release drop</Btn>
      </div>

      <Readout items={[
        { l: "Contact angle", v: ca + " deg", color: regC },
        { l: "State", v: regime, color: regC },
        { l: "Air layer", v: textured ? "yes" : "no" },
        { l: "Dirt removed", v: removed + " / 7" },
      ]} />

      <Caption color={C}>
        A lotus leaf is rough and waxy, not smooth. The wax repels water and the tiny bumps trap a
        layer of air, so a drop cannot sink into the texture and instead beads into a near-sphere with
        a contact angle past 150 degrees. Tip the leaf and the bead rolls off, picking up dirt as it
        goes, which is why the leaf cleans itself. A smooth surface loses the air layer, the water wets
        it, and dirt stays put.
      </Caption>
    </div>
  );
}

/* ---- 7. Magnet: remote actuation, capsule follows through a barrier ---- */
function DemoMagnet() {
  // PYS-01 "Remote actuation" (concept 1). Sibling ExtraPathPlan (concept 2) owns
  // the maze, the planned route, and the speed-vs-wall-touches tradeoff. This demo
  // owns the physics of contactless control: a body wall (barrier) splits outside
  // from inside; you DRAG the magnet on the outside and a steel capsule camera on
  // the inside follows it, pinned against the wall, never touching the magnet. The
  // field reaches through the barrier and the pull falls off as ~1/r^2, so far away
  // it is too weak to steer. Drag uses the letterbox mapping and stable handlers.
  const A = CAMP.pystem.acc, ink = CAMP.pystem.ink;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [strength, setStrength] = useState(6);
  const [, force] = useState(0);
  const stage = useRef(null);

  // ----- bounded geometry -----
  const VBW = 500, VBH = 300;
  const arenaX0 = 12, arenaX1 = 488, arenaY0 = 46, arenaY1 = 278;
  const wallL = 242, wallR = 256, wallCx = (wallL + wallR) / 2;
  const MX0 = 46, MX1 = wallL - 22, MY0 = 74, MY1 = 250;      // magnet center clamp (outside)
  const innerX = wallR + 18;                                   // capsule rest x just inside wall

  const magRef = useRef({ x: 120, y: 150 });
  const capRef = useRef({ x: innerX, y: 150 });
  const strengthRef = useRef(strength); useEffect(() => { strengthRef.current = strength; }, [strength]);

  // ----- letterbox-correct pointer -> viewBox, stable handlers -----
  const toVB = (x, y, w, h) => { const sc = Math.min(w / VBW, h / VBH); return { ux: (x - (w - VBW * sc) / 2) / sc, uy: (y - (h - VBH * sc) / 2) / sc }; };
  const moveImpl = ({ x, y, w, h }) => { const { ux, uy } = toVB(x, y, w, h); magRef.current = { x: cl(ux, MX0, MX1), y: cl(uy, MY0, MY1) }; force((n) => (n + 1) % 1000000); };
  const moveRef = useRef(moveImpl); moveRef.current = moveImpl;
  const onMove = useRef((a) => moveRef.current(a)).current;
  usePointerDrag(stage, onMove);

  // ----- capsule follows: pulled toward magnet, blocked by wall, eases by grip -----
  useRAF(true, (dt) => {
    const m = magRef.current, c = capRef.current;
    const r = Math.max(24, Math.hypot(c.x - m.x, c.y - m.y));
    const pull = strengthRef.current * 9000 / (r * r);
    const gripN = cl((pull - 2) / 12, 0, 1);
    const ease = Math.min(1, (0.02 + gripN * 0.26) * (dt / 16));
    const tx = innerX + (1 - gripN) * 52;                      // weak pull: drifts deeper inside
    const ty = cl(m.y, MY0 - 2, MY1 + 2);
    capRef.current = { x: cl(c.x + (tx - c.x) * ease, innerX, 440), y: c.y + (ty - c.y) * ease };
    force((n) => (n + 1) % 1000000);
  });

  const reset = () => { magRef.current = { x: 120, y: 150 }; capRef.current = { x: innerX, y: 150 }; force((n) => (n + 1) % 1000000); };

  // ----- derived -----
  const m = magRef.current, c = capRef.current;
  const r = Math.hypot(c.x - m.x, c.y - m.y);
  const pull = strength * 9000 / (Math.max(24, r) ** 2);
  const grip = pull >= 10 ? "locked" : pull >= 3 ? "steering" : "too weak";
  const gripC = pull >= 10 ? T.ok : pull >= 3 ? A : T.warn;
  const badgeW = grip.length * 5.6 + 12;
  const nLoops = 3 + Math.round(strength / 3), magHalf = 17, vyMax = Math.min(58, m.y - 50, 274 - m.y), hxMax = 34 + strength * 7;

  return (
    <div>
      <Field height={310}>
        <div ref={stage} style={{ position: "absolute", inset: 0, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: "grab" }}>
          <svg viewBox={"0 0 " + VBW + " " + VBH} style={{ width: "100%", height: "100%" }}>
            {/* ===== header ===== */}
            <text x="16" y="24" fill={ink} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Remote actuation</text>
            <text x="16" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>steer steel through a wall, no contact</text>

            {/* ===== arena ===== */}
            <rect x={arenaX0} y={arenaY0} width={arenaX1 - arenaX0} height={arenaY1 - arenaY0} rx="12" fill={T.paper3} opacity="0.3" stroke={T.ink} strokeWidth="0.8" />
            <rect x={wallR} y={arenaY0} width={arenaX1 - wallR} height={arenaY1 - arenaY0} rx="0" fill={A} opacity="0.05" />
            <text x={(arenaX0 + wallL) / 2} y={62} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>outside the body</text>
            <text x={(wallR + arenaX1) / 2} y={62} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>inside the body</text>

            {/* ===== body wall (barrier) ===== */}
            <rect x={wallL} y={arenaY0 + 6} width={wallR - wallL} height={arenaY1 - arenaY0 - 12} fill={T.paper2} stroke={T.ink} strokeWidth="1" />
            {Array.from({ length: 11 }, (_, i) => <line key={"hatch" + i} x1={wallL} y1={arenaY0 + 14 + i * 20} x2={wallR} y2={arenaY0 + 6 + i * 20} stroke={T.ink} strokeWidth="0.6" opacity="0.4" />)}
            <text x={wallCx} y={292} textAnchor="middle" fill={ink} style={f.mono(700, 8, { upper: true, tracking: 0.12 })}>body wall (barrier)</text>

            {/* ===== field lines (cross the wall) ===== */}
            {Array.from({ length: nLoops }, (_, k) => { const t = (k + 1) / nLoops, vy = t * vyMax, hx = t * hxMax, nxp = m.x + magHalf, sxp = m.x - magHalf; const d = "M " + nxp + " " + m.y + " C " + (nxp + hx) + " " + (m.y - vy) + " " + (sxp - hx) + " " + (m.y - vy) + " " + sxp + " " + m.y + " C " + (sxp - hx) + " " + (m.y + vy) + " " + (nxp + hx) + " " + (m.y + vy) + " " + nxp + " " + m.y + " Z"; return <path key={"fl" + k} d={d} fill="none" stroke={A} strokeWidth={cl(0.6 + strength * 0.07, 0.6, 1.4)} opacity={cl(0.46 - t * 0.3, 0.1, 0.46) * (0.6 + strength * 0.04)} />; })}

            {/* ===== field reach / pull line magnet -> capsule (through wall) ===== */}
            <line x1={m.x} y1={m.y} x2={c.x} y2={c.y} stroke={A} strokeWidth={cl(pull * 0.12, 0.8, 3.2)} strokeDasharray="2 3" opacity="0.7" />
            

            {/* ===== capsule camera (steel, inside) ===== */}
            <g transform={"translate(" + c.x.toFixed(1) + " " + c.y.toFixed(1) + ")"}>
              <rect x="-11" y="-6" width="22" height="12" rx="6" fill="#c2c2c2" stroke={T.ink} strokeWidth="0.8" />
              <path d="M -11 -6 A 6 6 0 0 0 -11 6 Z" fill={ink} opacity="0.85" />
              <circle cx="-8" cy="0" r="2.2" fill={A} />
              <circle cx="-8" cy="0" r="1" fill={T.paper} />
              <text x="4" y="2.5" textAnchor="middle" fill={T.ink} style={f.mono(700, 7)}>Fe</text>
            </g>
            <g transform={"translate(" + c.x.toFixed(1) + " " + (c.y - 18).toFixed(1) + ")"}>
              <rect x={-badgeW / 2} y="-8" width={badgeW} height="13" rx="3" fill={T.paper} stroke={gripC} strokeWidth="1" />
              <text x="0" y="1" textAnchor="middle" fill={gripC} style={f.mono(700, 8, { upper: true, tracking: 0.08 })}>{grip}</text>
            </g>
            <text x={c.x} y={c.y + 17} textAnchor="middle" fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.1 })}>capsule</text>

            {/* ===== magnet (outside, draggable) ===== */}
            <g transform={"translate(" + m.x.toFixed(1) + " " + m.y.toFixed(1) + ")"}>
              <rect x="-8" y="-18" width="16" height="5" rx="2" fill={T.ink} opacity="0.55" />
              <rect x="-17" y="-12" width="34" height="24" rx="3" fill={ink} stroke={T.ink} strokeWidth="0.8" />
              <rect x="0" y="-12" width="17" height="24" rx="3" fill={A} />
              <text x="-8" y="4" textAnchor="middle" fill={T.paper} style={f.mono(700, 9, { upper: true })}>S</text>
              <text x="8" y="4" textAnchor="middle" fill={T.paper} style={f.mono(700, 9, { upper: true })}>N</text>
            </g>
            <text x={m.x} y={m.y - 24} textAnchor="middle" fill={ink} style={f.mono(700, 7.5, { upper: true, tracking: 0.1 })}>magnet</text>

            {/* montage probes (invisible) */}
            <circle data-mag="1" cx={m.x} cy={m.y} r="0" />
            <circle data-cap="1" cx={c.x} cy={c.y} r="0" />
            {/* ===== no-contact note ===== */}
            <text x={arenaX0 + 12} y={arenaY1 - 8} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>magnet never touches the capsule</text>
          </svg>
        </div>
      </Field>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={strength} set={setStrength} min={1} max={10} step={1} color={A} label="Magnet strength" suffix={strength} />
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
        <div style={{ flex: 1 }} />
        <Tag color={gripC}>{grip}</Tag>
      </div>

      <Readout items={[
        { l: "Gap", v: r.toFixed(0) + " px", color: A },
        { l: "Pull (1/r^2)", v: pull.toFixed(1), color: ink },
        { l: "Grip", v: grip, color: gripC },
        { l: "Contact", v: "none" },
      ]} />

      <Caption color={ink}>
        The magnet stays outside the body wall and never touches the capsule, yet its field reaches
        through the barrier and pulls the steel capsule along. Drag the magnet and the capsule follows
        on the far side of the wall. The pull falls off as roughly 1/r^2, so up close the grip is
        firm and you can steer, but far away the field is too weak and the capsule drifts and lags.
        This is how doctors guide a swallowed capsule camera through the gut from outside the body.
      </Caption>
    </div>
  );
}

/* ---- 8. Cam + follower with live displacement graph ----------------- */
function DemoCam() {
  // PYS-03 "Cams, followers, linkages" (concept 1). Sibling ExtraReliability
  // (concept 2) owns the jam/reliability story with a crank wheel and a slider-
  // crank connecting rod. This demo owns the mechanism: a crank turns a SHAPED
  // cam, a roller follower rides the profile and rises/falls, and a pivoted lever
  // (a linkage) passes that motion on to a small task that rocks. The right panel
  // plots follower lift vs cam angle, so changing the cam shape visibly changes
  // the motion. The cam shape decides the movement.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [shape, setShape] = useState("egg");
  const [speed, setSpeed] = useState(6);
  const [running, setRunning] = useState(true);
  const angRef = useRef(0);
  const [, force] = useState(0);
  const TAU = Math.PI * 2;

  const profile = (a) => {
    const u = ((a % TAU) + TAU) % TAU;
    if (shape === "circle") return 42;
    if (shape === "egg") return 34 + Math.cos(u) * 14;          // one smooth rise
    if (shape === "snail") return 26 + 22 * (u / TAU);          // gradual rise, sharp drop
    if (shape === "double") return 32 + 13 * Math.abs(Math.cos(u)); // two lifts per turn
    return 42;
  };

  useRAF(running, (dt) => { angRef.current += (dt / 1000) * speed * 0.5; force((n) => (n + 1) % 1000000); });

  const camPath = useMemo(() => {
    const steps = 120, pts = [];
    for (let i = 0; i <= steps; i++) { const a = (i / steps) * TAU; const r = profile(a); pts.push((Math.cos(a) * r).toFixed(2) + "," + (Math.sin(a) * r).toFixed(2)); }
    return "M " + pts.join(" L ") + " Z";
  }, [shape]);
  const stats = useMemo(() => { let mn = 1e9, mx = -1e9; for (let i = 0; i < 360; i++) { const r = profile(i * Math.PI / 180); if (r < mn) mn = r; if (r > mx) mx = r; } return { baseR: mn, maxR: mx }; }, [shape]);
  const maxLift = Math.max(1, stats.maxR - stats.baseR);

  // ----- geometry (bounded) -----
  const VW = 560, VH = 280, camC = { x: 116, y: 176 }, guideR = 54, rollerR = 6, rodLen = 52;
  const ang = angRef.current;
  const rTop = profile(-Math.PI / 2 - ang);
  const L = Math.max(0, rTop - stats.baseR);
  const contactY = camC.y - (stats.baseR + L);
  const rollerCenterY = contactY - rollerR;
  const rodTopY = rollerCenterY - rodLen;
  const Fp = { x: camC.x + 56, y: 82 };               // lever fulcrum
  const ndx = Fp.x - camC.x, ndy = Fp.y - rodTopY, nlen = Math.hypot(ndx, ndy);
  const ux = ndx / nlen, uy = ndy / nlen, farLen = 62;
  const farX = Fp.x + ux * farLen, farY = Fp.y + uy * farLen;
  const peck = -8 + (L / maxLift) * 26;
  const curDeg = ((ang * 180 / Math.PI) % 360 + 360) % 360;
  const motion = shape === "circle" ? "dwell (no lift)" : shape === "egg" ? "smooth rise and fall" : shape === "snail" ? "slow rise, fast drop" : "two lifts per turn";

  // ----- plot -----
  const pX = 330, pY = 58, pW = 212, pH = 188;
  const plotL = pX + 34, plotR = pX + pW - 14, plotTop = pY + 28, plotBot = pY + pH - 24;
  const xAng = (deg) => plotL + (deg / 360) * (plotR - plotL);
  const yLift = (lv) => plotBot - (lv / maxLift) * (plotBot - plotTop);
  const liftAt = (deg) => Math.max(0, profile(-Math.PI / 2 - deg * Math.PI / 180) - stats.baseR);
  const curvePts = useMemo(() => { const a = []; for (let d = 0; d <= 360; d += 3) a.push(xAng(d).toFixed(1) + "," + yLift(liftAt(d)).toFixed(1)); return a.join(" "); }, [shape]);

  return (
    <div>
      <Field height={290}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          {/* ===== header ===== */}
          <text x="18" y="24" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Cams, followers, linkages</text>
          <text x="18" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>the cam shape sets the motion</text>

          {/* ===== base / bench ===== */}
          <rect x={36} y={236} width={250} height={10} fill={T.paper3} stroke={T.ink} strokeWidth="0.8" />

          {/* ===== lever (linkage) + fulcrum + task ===== */}
          <line x1={camC.x} y1={rodTopY} x2={farX} y2={farY} stroke={C} strokeWidth="3.4" strokeLinecap="round" />
          <polygon points={Fp.x + "," + Fp.y + " " + (Fp.x - 7) + "," + (Fp.y + 16) + " " + (Fp.x + 7) + "," + (Fp.y + 16)} fill={T.ink} />
          <circle cx={Fp.x} cy={Fp.y} r="3" fill={T.paper} stroke={T.ink} strokeWidth="1" />
          <text x={Fp.x} y={Fp.y - 18} textAnchor="middle" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>linkage</text>
          {/* task character (rocks/pecks with the lift) */}
          <g transform={"translate(" + farX.toFixed(1) + " " + farY.toFixed(1) + ") rotate(" + peck.toFixed(1) + ")"}>
            <line x1="0" y1="0" x2="0" y2="10" stroke={T.ink} strokeWidth="1.6" />
            <ellipse cx="0" cy="-5" rx="11" ry="8" fill={A} stroke={T.ink} strokeWidth="0.7" />
            <circle cx="7" cy="-11" r="5.5" fill={A} stroke={T.ink} strokeWidth="0.7" />
            <polygon points="11,-12 21,-10 11,-8" fill={C} />
            <circle cx="8" cy="-12" r="1.2" fill={T.paper} />
          </g>
          <text x={farX} y={farY + 26} textAnchor="middle" fill={A} style={f.mono(700, 7.5, { upper: true, tracking: 0.1 })}>task</text>

          {/* ===== follower rod + guides + roller ===== */}
          <line x1={camC.x - 9} y1={104} x2={camC.x + 9} y2={104} stroke={T.ink} strokeWidth="2.6" strokeLinecap="round" />
          <line x1={camC.x - 9} y1={122} x2={camC.x + 9} y2={122} stroke={T.ink} strokeWidth="2.6" strokeLinecap="round" />
          <rect x={camC.x - 3.5} y={rodTopY} width="7" height={rollerCenterY - rodTopY} fill="#bdbdbd" stroke={T.ink} strokeWidth="0.6" />
          <circle cx={camC.x} cy={rollerCenterY} r={rollerR} fill={T.paper} stroke={T.ink} strokeWidth="1" />
          <circle cx={camC.x} cy={rollerCenterY} r="1.6" fill={T.ink} />
          <text x={camC.x + 16} y={113} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>follower</text>

          {/* lift bracket (shows current rise) */}
          <line x1={camC.x - 50} y1={camC.y - stats.baseR} x2={camC.x - 50} y2={contactY} stroke={A} strokeWidth="1.2" />
          <line x1={camC.x - 53} y1={camC.y - stats.baseR} x2={camC.x - 47} y2={camC.y - stats.baseR} stroke={A} strokeWidth="1.2" />
          <line x1={camC.x - 53} y1={contactY} x2={camC.x - 47} y2={contactY} stroke={A} strokeWidth="1.2" />
          <text x={camC.x - 56} y={(camC.y - stats.baseR + contactY) / 2 + 3} textAnchor="end" fill={A} style={f.mono(700, 7.5, { upper: true, tracking: 0.06 })}>lift</text>

          {/* ===== cam + crank ===== */}
          <circle cx={camC.x} cy={camC.y} r={guideR} fill="none" stroke={T.rule12} strokeWidth="0.6" strokeDasharray="2 4" />
          <g transform={"rotate(" + (ang * 180 / Math.PI).toFixed(2) + " " + camC.x + " " + camC.y + ")"}>
            <path d={camPath} fill={T.ink} stroke={A} strokeWidth="1.3" transform={"translate(" + camC.x + " " + camC.y + ")"} />
            <circle cx={camC.x} cy={camC.y} r="4" fill={A} stroke={T.paper} strokeWidth="0.8" />
            {/* crank knob on the cam face */}
            <line x1={camC.x} y1={camC.y} x2={camC.x + 14} y2={camC.y} stroke={A} strokeWidth="2.2" />
            <circle cx={camC.x + 14} cy={camC.y} r="4" fill={A} stroke={T.ink} strokeWidth="0.8" />
          </g>
          {/* contact marker (roller touches cam here) */}
          <circle cx={camC.x} cy={contactY} r="2.6" fill={A} stroke={T.paper} strokeWidth="0.8" />
          <text x={camC.x} y={camC.y + guideR + 4} textAnchor="middle" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.12 })}>cam: {shape}</text>

          {/* ===== displacement plot ===== */}
          <rect x={pX} y={pY} width={pW} height={pH} rx="6" fill={T.paper2} stroke={C} strokeWidth="1" />
          <text x={pX + 12} y={pY + 17} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>follower lift vs cam angle</text>
          <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
          <line x1={plotL} y1={plotTop} x2={plotL} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
          <polyline points={curvePts} fill="none" stroke={A} strokeWidth="2" />
          <line x1={xAng(curDeg)} y1={plotTop} x2={xAng(curDeg)} y2={plotBot} stroke={T.ink} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          <circle cx={xAng(curDeg)} cy={yLift(L)} r="3.6" fill={A} stroke={T.paper} strokeWidth="1.2" />
          <text x={plotL} y={plotBot + 13} fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })}>0</text>
          <text x={plotR} y={plotBot + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })}>360 deg</text>
          
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        {["circle", "egg", "snail", "double"].map((s) => (
          <Btn key={s} small color={A} active={shape === s} onClick={() => setShape(s)}>{s}</Btn>
        ))}
        <Btn small icon={running ? Pause : Play} color={C} onClick={() => setRunning((r) => !r)}>{running ? "pause" : "spin"}</Btn>
        <Slider val={speed} set={setSpeed} min={1} max={10} step={1} color={A} label="Crank speed" suffix={speed} />
      </div>

      <Readout items={[
        { l: "Cam shape", v: shape, color: A },
        { l: "Lift now", v: L.toFixed(0) + " px", color: C },
        { l: "Motion", v: motion },
        { l: "Cam angle", v: curDeg.toFixed(0) + " deg" },
      ]} />

      <Caption color={C}>
        Turning the crank spins the cam. The roller follower rests on the cam edge and rises or falls
        by the radius of the profile under it, so the cam shape alone decides the motion: a round cam
        gives a steady dwell, an egg gives a smooth rise and fall, a snail gives a slow rise then a
        sharp drop, and a double lobe lifts twice per turn. The pivoted lever is a linkage that passes
        that motion along, turning the follower's up and down into a back-and-forth rock of the task.
        This is how valves, music boxes, and animatronics work.
      </Caption>
    </div>
  );
}

/* ---- 9. Sonar wave: longitudinal pulse + echo, time-to-distance ----- */
function DemoWave() {
  // PYS-06 "Longitudinal waves" (concept 1). Sibling ExtraSonarRange (concept 2)
  // owns the ranging math: a sensor, a stopwatch, and distance = speed x time / 2,
  // with no medium. This demo is the wave itself: a slinky of coils that bunch
  // (compression) and spread (rarefaction) ALONG the axis. One tracked coil shows
  // that each coil only moves back and forth parallel to the travel direction,
  // which is what makes the wave longitudinal. A pulse reflects off the fixed end
  // and returns; a continuous mode shows a steady train of compressions, like
  // sound in air. No timing, no distance readout: that is the sibling's job.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerpC = (t) => { t = cl(t, 0, 1); const a = [28, 50, 87], b = [199, 122, 43]; return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * t) + "," + Math.round(a[1] + (b[1] - a[1]) * t) + "," + Math.round(a[2] + (b[2] - a[2]) * t) + ")"; };

  const [mode, setMode] = useState("pulse");
  const [speed, setSpeed] = useState(9);
  const [refl, setRefl] = useState(0);
  const [, force] = useState(0);
  const tRef = useRef(0);
  const modeRef = useRef(mode); useEffect(() => { modeRef.current = mode; }, [mode]);
  const speedRef = useRef(speed); useEffect(() => { speedRef.current = speed; }, [speed]);
  const reflRef = useRef(0);
  const pa = useRef({ active: false, xc: 0, dir: 1, amp: 0 });

  // ----- bounded geometry -----
  const VW = 560, VH = 240, x0 = 60, x1 = 512, yCoil = 102, coilH = 27;
  const N = 44, dx = (x1 - x0) / (N - 1), ti = Math.round(N * 0.42);
  const stripY = 150, stripH = 14;
  const launch = () => { pa.current = { active: true, xc: x0 + 8, dir: 1, amp: 13 }; reflRef.current = 0; setRefl(0); };
  useEffect(() => { launch(); }, []);

  useRAF(true, (dt) => {
    tRef.current += dt;
    if (modeRef.current === "pulse" && pa.current.active) {
      const c = speedRef.current * 0.05;            // px per ms
      let { xc, dir, amp } = pa.current;
      xc += dir * c * dt;
      let bounced = false;
      if (xc >= x1 - 8) { xc = (x1 - 8) - (xc - (x1 - 8)); dir = -1; amp *= 0.84; bounced = true; }
      if (xc <= x0 + 8) { xc = (x0 + 8) + ((x0 + 8) - xc); dir = 1; amp *= 0.84; bounced = true; }
      amp *= Math.pow(0.9986, dt / 16);
      if (bounced) { reflRef.current += 1; setRefl(reflRef.current); }
      pa.current = { active: amp > 1.4, xc, dir, amp };
    }
    force((n) => (n + 1) % 1000000);
  });

  // ----- coil displacement field -----
  const t = tRef.current;
  const lambda = 94, k = (2 * Math.PI) / lambda, Ac = 9, omega = speed * 0.05 * k;
  const coils = Array.from({ length: N }, (_, i) => {
    const bx = x0 + i * dx;
    let d = 0;
    if (mode === "continuous") d = Ac * Math.sin(k * (bx - x0) - omega * t);
    else if (pa.current.active) { const u = (bx - pa.current.xc) / 24; d = -pa.current.amp * u * Math.exp(-u * u) * 1.9; }
    return { bx, x: bx + d, d };
  });
  const comp = (i) => { const j = Math.min(i, N - 2); const sp = coils[j + 1].x - coils[j].x; return cl((dx / Math.max(2, sp) - 1) / 0.7, 0, 1); };
  const handX = x0 + (mode === "continuous" ? Ac * Math.sin(-omega * t) : 0);
  const pulse = pa.current;
  const reflDisp = mode === "pulse" ? String(refl) : "n/a";

  return (
    <div>
      <Field height={240}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          {/* ===== header ===== */}
          <text x="20" y="24" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Longitudinal waves</text>
          <text x="20" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>coils bunch and spread along the travel</text>

          {/* compression / rarefaction legend (top-right) */}
          <rect x={398} y={14} width={12} height={9} fill={A} opacity="0.7" />
          <text x={414} y={22} fill={T.mute} style={f.mono(600, 8, { tracking: 0.02 })}>compression</text>
          <rect x={398} y={28} width={12} height={9} fill={A} opacity="0.14" />
          <text x={414} y={36} fill={T.mute} style={f.mono(600, 8, { tracking: 0.02 })}>rarefaction</text>

          {/* wave-travels arrow (top of slinky) */}
          <line x1={x1 - 78} y1={48} x2={x1 - 14} y2={48} stroke={T.mute} strokeWidth="1.1" />
          <polygon points={(x1 - 14) + ",48 " + (x1 - 22) + ",44 " + (x1 - 22) + ",52"} fill={T.mute} />
          <text x={x1 - 80} y={51} textAnchor="end" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.1 })}>wave travels</text>

          {/* rest axis */}
          <line x1={x0} y1={yCoil} x2={x1} y2={yCoil} stroke={T.rule12} strokeWidth="0.6" />

          {/* hand / plunger (drives the wave) */}
          <rect x={handX - 14} y={yCoil - 20} width={11} height={40} rx="2.5" fill={C} stroke={T.ink} strokeWidth="0.8" />
          <line x1={handX - 3} y1={yCoil} x2={handX + 2} y2={yCoil} stroke={A} strokeWidth="2" />

          {/* fixed end (clamp + hatching) */}
          <rect x={x1 + 2} y={yCoil - coilH - 4} width="6" height={(coilH + 4) * 2} fill={T.ink} />
          {Array.from({ length: 7 }, (_, i) => <line key={"h" + i} x1={x1 + 8} y1={yCoil - coilH + i * 9} x2={x1 + 14} y2={yCoil - coilH + i * 9 - 6} stroke={T.ink} strokeWidth="0.8" opacity="0.6" />)}

          {/* slinky coils (vertical turns) coloured by compression */}
          {coils.map((cc, i) => {
            const tc = comp(i);
            const tracked = i === ti;
            return <line key={"c" + i} x1={cc.x} y1={yCoil - coilH} x2={cc.x} y2={yCoil + coilH} stroke={tracked ? A : lerpC(tc)} strokeWidth={tracked ? 3 : 1 + tc * 1.4} opacity={tracked ? 1 : 0.55 + tc * 0.4} />;
          })}

          {/* pulse marker + label */}
          {mode === "pulse" && pulse.active && (
            <g>
              <text x={pulse.xc} y={yCoil - coilH - 6} textAnchor="middle" fill={A} style={f.mono(700, 8.5, { upper: true, tracking: 0.1 })}>{pulse.dir > 0 ? "compression" : "reflected"}</text>
              <polygon points={(pulse.xc + pulse.dir * 9) + "," + (yCoil - coilH - 2) + " " + (pulse.xc + pulse.dir * 2) + "," + (yCoil - coilH - 6) + " " + (pulse.xc + pulse.dir * 2) + "," + (yCoil - coilH + 2)} fill={A} />
            </g>
          )}

          {/* end labels */}
          <text x={x0 - 2} y={yCoil + coilH + 16} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>push</text>
          <text x={x1 + 4} y={yCoil + coilH + 16} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>fixed end</text>

          {/* compression / rarefaction pressure strip */}
          {coils.slice(0, N - 1).map((cc, i) => {
            const w = Math.max(0.5, coils[i + 1].x - cc.x);
            return <rect key={"s" + i} x={cc.x} y={stripY} width={w} height={stripH} fill={A} opacity={cl(comp(i) * 0.78, 0, 0.78)} />;
          })}
          <rect x={x0} y={stripY} width={x1 - x0} height={stripH} fill="none" stroke={T.rule22} strokeWidth="0.7" />
          <text x={x0} y={stripY + stripH + 12} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>pressure: dark bands are compressions, like sound in air</text>

          {/* tracked-coil motion indicator */}
          <line x1={coils[ti].bx - 26} y1={196} x2={coils[ti].bx + 26} y2={196} stroke={T.rule22} strokeWidth="0.8" />
          <line x1={coils[ti].bx} y1={192} x2={coils[ti].bx} y2={200} stroke={T.mute} strokeWidth="0.8" />
          <line x1={coils[ti].bx - 20} y1={208} x2={coils[ti].bx + 20} y2={208} stroke={A} strokeWidth="1.1" />
          <polygon points={(coils[ti].bx - 20) + ",208 " + (coils[ti].bx - 13) + ",205 " + (coils[ti].bx - 13) + ",211"} fill={A} />
          <polygon points={(coils[ti].bx + 20) + ",208 " + (coils[ti].bx + 13) + ",205 " + (coils[ti].bx + 13) + ",211"} fill={A} />
          <circle cx={coils[ti].x} cy={196} r="3.4" fill={A} stroke={T.paper} strokeWidth="1" />
          <line x1={coils[ti].x} y1={yCoil + coilH} x2={coils[ti].bx} y2={192} stroke={A} strokeWidth="0.6" strokeDasharray="2 2" opacity="0.5" />
          <text x={coils[ti].bx} y={224} textAnchor="middle" fill={A} style={f.mono(700, 8, { upper: true, tracking: 0.08 })}>one coil: motion is parallel to travel</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Btn small icon={Play} active={mode === "pulse"} onClick={() => { setMode("pulse"); launch(); }}>send pulse</Btn>
        <Btn small active={mode === "continuous"} onClick={() => setMode("continuous")}>continuous</Btn>
        <Slider val={speed} set={setSpeed} min={4} max={16} step={1} color={A} label="Wave speed" suffix={speed} />
      </div>

      <Readout items={[
        { l: "Wave type", v: "longitudinal", color: A },
        { l: "Coil motion", v: "along travel", color: C },
        { l: "Mode", v: mode },
        { l: "Reflections", v: reflDisp },
      ]} />

      <Caption color={C}>
        Push one end and the coils bunch into a compression that travels along the slinky. Each coil
        only slides back and forth along the line, the same direction the wave moves, so this is a
        longitudinal wave, exactly how sound travels through air as bands of high and low pressure. In
        pulse mode the compression reflects off the fixed end and comes back; in continuous mode a
        steady train of compressions and rarefactions streams down the line. Watch the marked coil: it
        never moves across the line, only along it.
      </Caption>
    </div>
  );
}

/* ---- 10. Pinhole: aperture vs sharpness/brightness ------------------ */
function DemoPinhole() {
  // PYS-07 "Light travels in straight lines" (concept 1). Sibling ExtraAperture
  // (concept 2) owns the hole-size sharpness/brightness optimization with a
  // quality chart and explicitly no rays and no flip. This demo is the straight-
  // line geometry: an extended object emits rays that travel in straight lines,
  // cross at one fixed tiny pinhole, and land as an upside-down image. Photons
  // stream along the rays. Two sliders set object distance u and screen distance
  // v, so the magnification m = v/u and the inversion are both visible live.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [u, setU] = useState(5);          // object distance 1..10
  const [v, setV] = useState(6);          // screen distance 1..10
  const [playing, setPlaying] = useState(true);
  const [, force] = useState(0);
  const phaseRef = useRef(0);
  useRAF(playing, (dt) => { phaseRef.current += dt; force((n) => (n + 1) % 1000000); });

  // ----- bounded geometry -----
  const VW = 560, VH = 280, yAxis = 140, OH = 26;
  const holeX = 280, barTop = 68, barBot = 212;
  const u_px = 90 + ((u - 1) / 9) * 80;     // 90..170
  const v_px = 90 + ((v - 1) / 9) * 120;    // 90..210
  const objX = holeX - u_px;                // 190..110
  const screenX = holeX + v_px;             // 370..490
  const m = v_px / u_px;                    // 0.53..2.33
  const imgHalf = OH * m;                   // 13.8..60.6
  const phase = phaseRef.current;

  // emitter offsets from the axis (negative = above the axis = object top)
  const offs = [-26, -13, 0, 13, 26];
  const rays = offs.map((off) => {
    const objPt = { x: objX, y: yAxis + off };
    const hole = { x: holeX, y: yAxis };
    const imgPt = { x: screenX, y: yAxis - off * m };   // inverted through the hole
    const lenA = Math.hypot(hole.x - objPt.x, hole.y - objPt.y);
    const lenB = Math.hypot(imgPt.x - hole.x, imgPt.y - hole.y);
    return { off, objPt, hole, imgPt, lenA, lenB, L: lenA + lenB, color: off < 0 ? A : off > 0 ? C : T.mute, major: Math.abs(off) === 26 };
  });
  const ppr = 2;   // photons per ray
  const photonAt = (ray, k) => {
    const s = (((phase * 0.00045) + k / ppr + (ray.off + 26) * 0.013) % 1 + 1) % 1;
    const d = s * ray.L;
    if (d < ray.lenA) { const t = ray.lenA ? d / ray.lenA : 0; return { x: ray.objPt.x + (ray.hole.x - ray.objPt.x) * t, y: ray.objPt.y + (ray.hole.y - ray.objPt.y) * t, pre: true }; }
    const t = ray.lenB ? (d - ray.lenA) / ray.lenB : 0;
    return { x: ray.hole.x + (ray.imgPt.x - ray.hole.x) * t, y: ray.hole.y + (ray.imgPt.y - ray.hole.y) * t, pre: false };
  };
  const headW = cl(7 * m, 5, 12), headH = cl(9 * m, 6, 14);

  return (
    <div>
      <Field height={285}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          {/* ===== header ===== */}
          <text x="20" y="26" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Light travels in straight lines</text>
          <text x="20" y="40" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>a pinhole flips the picture</text>

          {/* ray-source legend (top-right) */}
          <text x={446} y={16} fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.12 })}>ray source</text>
          <line x1={446} y1={26} x2={462} y2={26} stroke={A} strokeWidth="2.4" strokeLinecap="round" />
          <text x={467} y={29} fill={T.mute} style={f.mono(600, 8, { tracking: 0.02 })}>top of object</text>
          <line x1={446} y1={37} x2={462} y2={37} stroke={C} strokeWidth="2.4" strokeLinecap="round" />
          <text x={467} y={40} fill={T.mute} style={f.mono(600, 8, { tracking: 0.02 })}>base of object</text>

          {/* ===== optical axis ===== */}
          <line x1={Math.min(objX, 92) - 6} y1={yAxis} x2={screenX + 14} y2={yAxis} stroke={T.ink} strokeWidth="0.6" strokeDasharray="2 4" opacity="0.5" />

          {/* ===== rays (straight lines) + flowing photons ===== */}
          {rays.map((ray, i) => (
            <g key={"ray" + i}>
              <line x1={ray.objPt.x} y1={ray.objPt.y} x2={ray.hole.x} y2={ray.hole.y} stroke={ray.color} strokeWidth={ray.major ? 1.4 : 0.8} opacity={ray.major ? 0.7 : 0.4} />
              <line x1={ray.hole.x} y1={ray.hole.y} x2={ray.imgPt.x} y2={ray.imgPt.y} stroke={ray.color} strokeWidth={ray.major ? 1.4 : 0.8} opacity={ray.major ? 0.7 : 0.4} />
            </g>
          ))}
          {rays.map((ray, i) => Array.from({ length: ppr }, (_, k) => {
            const p = photonAt(ray, k);
            return <circle key={"ph" + i + "_" + k} cx={p.x} cy={p.y} r={ray.major ? 2 : 1.5} fill={ray.color} opacity="0.95" />;
          }))}

          {/* ===== object (extended, upright) ===== */}
          <line x1={objX} y1={yAxis - OH} x2={objX} y2={yAxis + OH} stroke={A} strokeWidth="4" strokeLinecap="round" />
          <polygon points={objX + "," + (yAxis - OH - 4) + " " + (objX - 7) + "," + (yAxis - OH + 8) + " " + (objX + 7) + "," + (yAxis - OH + 8)} fill={A} />
          <line x1={objX - 7} y1={yAxis + OH} x2={objX + 7} y2={yAxis + OH} stroke={A} strokeWidth="3" strokeLinecap="round" />
          {offs.map((off, i) => <circle key={"e" + i} cx={objX} cy={yAxis + off} r="1.8" fill={off < 0 ? A : off > 0 ? C : T.mute} />)}
          <circle cx={objX} cy={yAxis - OH - 7} r="3.2" fill={A} stroke={T.paper} strokeWidth="0.8" />
          <text x={objX} y={yAxis - OH - 15} textAnchor="middle" fill={A} style={f.mono(700, 7.5, { upper: true, tracking: 0.1 })}>top</text>

          {/* ===== barrier with one tiny pinhole ===== */}
          <rect x={holeX - 3} y={barTop} width="6" height={barBot - barTop} fill={T.ink} />
          <rect x={holeX - 3} y={yAxis - 4} width="6" height="8" fill={T.paper} />
          <circle cx={holeX} cy={yAxis} r="7" fill="none" stroke={A} strokeWidth="0.9" strokeDasharray="2 2" opacity="0.7" />
          <circle cx={holeX} cy={yAxis} r="2" fill={A} />

          {/* ===== screen + inverted image ===== */}
          <rect x={screenX - 1.5} y={barTop} width="3" height={barBot - barTop} fill={T.ink} opacity="0.6" />
          <g style={{ filter: "blur(0.6px)" }}>
            <line x1={screenX} y1={yAxis - imgHalf} x2={screenX} y2={yAxis + imgHalf} stroke={A} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
            <polygon points={screenX + "," + (yAxis + imgHalf + headH * 0.45) + " " + (screenX - headW) + "," + (yAxis + imgHalf - headH * 0.55) + " " + (screenX + headW) + "," + (yAxis + imgHalf - headH * 0.55)} fill={A} opacity="0.9" />
            <line x1={screenX - 7} y1={yAxis - imgHalf} x2={screenX + 7} y2={yAxis - imgHalf} stroke={A} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          </g>
          <circle cx={screenX} cy={yAxis + imgHalf + headH * 0.45 + 3} r="3.2" fill={A} stroke={T.paper} strokeWidth="0.8" />
          <text x={screenX + 8} y={yAxis + imgHalf + headH * 0.45 + 6} fill={A} style={f.mono(700, 7.5, { upper: true, tracking: 0.1 })}>top</text>

          {/* ===== element labels ===== */}
          <text x={objX} y={230} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>object</text>
          <text x={holeX} y={230} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>pinhole</text>
          <text x={screenX} y={230} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>image (flipped)</text>

          {/* ===== u / v dimension brackets ===== */}
          <g stroke={C} strokeWidth="0.8" opacity="0.8">
            <line x1={objX} y1={244} x2={holeX} y2={244} />
            <line x1={objX} y1={240} x2={objX} y2={248} /><line x1={holeX} y1={240} x2={holeX} y2={248} />
            <line x1={holeX} y1={244} x2={screenX} y2={244} />
            <line x1={screenX} y1={240} x2={screenX} y2={248} />
          </g>
          <text x={(objX + holeX) / 2} y={258} textAnchor="middle" fill={C} style={f.mono(700, 8.5, { tracking: 0.04 })}>u = object dist</text>
          <text x={(holeX + screenX) / 2} y={258} textAnchor="middle" fill={C} style={f.mono(700, 8.5, { tracking: 0.04 })}>v = screen dist</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={u} set={setU} min={1} max={10} step={1} color={A} label="Object distance (u)" suffix={u} />
        <Slider val={v} set={setV} min={1} max={10} step={1} color={C} label="Screen distance (v)" suffix={v} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "pause" : "play"}</Btn>
      </div>

      <Readout items={[
        { l: "Object dist u", v: u + " / 10", color: A },
        { l: "Screen dist v", v: v + " / 10", color: C },
        { l: "Magnification", v: m.toFixed(1) + "x", color: C },
        { l: "Image", v: "inverted" },
      ]} />

      <Caption color={C}>
        Each point of the object sends out light that travels in a straight line. With no lens, the
        only rays that reach the screen are the ones passing through the tiny pinhole, so the rays
        from the top and the base cross at the hole and keep going straight. The top of the object
        therefore lands at the bottom of the screen and the image is flipped. Moving the screen
        farther out or the object closer in raises the magnification m = v / u, so the same scene
        projects a larger inverted image.
      </Caption>
    </div>
  );
}

/* ---- 11. Hovercraft: flick the puck, aim at the target -------------- */
function DemoHover() {
  // PYS-09 "Air cushion cuts friction" (concept 1). Sibling ExtraGlide covers
  // GLIDE vs CONTROL (concept 2: a side-on lane plus a lift-tradeoff chart). This
  // demo is the interactive top-down rink: GRAB the hovercraft puck and flick it.
  // A thicker air cushion (slider) lifts the CD-disc higher, so sliding friction
  // nearly vanishes and the same flick glides much farther and bounces longer. A
  // faded "cushion off" ghost shows where the identical flick would stop with the
  // disc scraping the table, and a live speed-decay sparkline shows how slowly the
  // speed bleeds away at high lift. Drag uses letterbox-corrected coordinates and
  // stable handlers, so it tracks at any size or zoom.
  const VBW = 460, VBH = 300;
  const ink = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const DISC = "#cdcdcd", DISC_DK = "#9a9a9a";
  const stage = useRef(null);

  const [lift, setLift] = useState(7);
  const [held, setHeld] = useState(false);
  const [score, setScore] = useState(0);
  const [glide, setGlide] = useState(0);
  const [, force] = useState(0);
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));

  // ----- bounded zones -----
  const RX0 = 14, RY0 = 48, RX1 = 446, RY1 = 264;     // rink rect
  const BX0 = 34, BX1 = 426, BY0 = 74, BY1 = 246;     // puck-center play bounds
  const START = { x: 66, y: 160 };
  const target = { x: 360, y: 150, r: 17 };
  const spX = 300, spY = 8, spW = 146, spH = 32;       // speed-decay card

  // ----- refs: stable drag + latest values for the animation loop -----
  const puckRef = useRef({ x: START.x, y: START.y, vx: 0, vy: 0 });
  const liftRef = useRef(lift); useEffect(() => { liftRef.current = lift; }, [lift]);
  const heldRef = useRef(false), draggingRef = useRef(false), grabbedRef = useRef(false);
  const lastPtRef = useRef({ x: 0, y: 0 }), velRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef([]), ghostRef = useRef(null), histRef = useRef([]);
  const glideAccRef = useRef(0), hitRef = useRef(false), hitFlashRef = useRef(-1e9);
  const phaseRef = useRef(0);

  // ----- letterbox-correct pointer (px in element) -> viewBox coords -----
  const toVB = (x, y, w, h) => { const sc = Math.min(w / VBW, h / VBH); return { ux: (x - (w - VBW * sc) / 2) / sc, uy: (y - (h - VBH * sc) / 2) / sc }; };

  // ----- "cushion off" ghost: same flick, disc scraping the table (high friction) -----
  const simGhost = (x0, y0, vx0, vy0) => {
    const pts = [[x0, y0]];
    let x = x0, y = y0, vx = vx0, vy = vy0;
    for (let i = 0; i < 260; i++) {
      vx *= 0.8; vy *= 0.8;
      x += vx; y += vy;
      if (x < BX0) { x = BX0; vx = -vx * 0.45; } if (x > BX1) { x = BX1; vx = -vx * 0.45; }
      if (y < BY0) { y = BY0; vy = -vy * 0.45; } if (y > BY1) { y = BY1; vy = -vy * 0.45; }
      pts.push([x, y]);
      if (Math.hypot(vx, vy) < 0.25) break;
    }
    return pts;
  };

  const moveImpl = ({ x, y, w, h }) => {
    const { ux, uy } = toVB(x, y, w, h);
    if (!draggingRef.current) {                 // first call of a gesture = grab
      draggingRef.current = true;
      const p = puckRef.current;
      const near = Math.hypot(ux - p.x, uy - p.y) <= 46;
      grabbedRef.current = near;
      if (near) {
        heldRef.current = true; setHeld(true);
        lastPtRef.current = { x: ux, y: uy }; velRef.current = { x: 0, y: 0 };
        trailRef.current = []; ghostRef.current = null; histRef.current = [];
        glideAccRef.current = 0; hitRef.current = false;
        puckRef.current = { x: p.x, y: p.y, vx: 0, vy: 0 };
      }
      return;
    }
    if (grabbedRef.current) {                    // subsequent moves = carry the puck
      const last = lastPtRef.current;
      velRef.current = { x: velRef.current.x * 0.35 + (ux - last.x) * 0.65, y: velRef.current.y * 0.35 + (uy - last.y) * 0.65 };
      lastPtRef.current = { x: ux, y: uy };
      puckRef.current = { x: cl(ux, BX0, BX1), y: cl(uy, BY0, BY1), vx: 0, vy: 0 };
      force((n) => (n + 1) % 1000000);
    }
  };
  const upImpl = () => {
    draggingRef.current = false;
    if (!grabbedRef.current) return;
    grabbedRef.current = false; heldRef.current = false; setHeld(false);
    const cap = 16, v = velRef.current;
    const vx = cl(v.x, -cap, cap), vy = cl(v.y, -cap, cap);
    const p = puckRef.current;
    puckRef.current = { x: p.x, y: p.y, vx, vy };
    ghostRef.current = (Math.hypot(vx, vy) > 0.4) ? simGhost(p.x, p.y, vx, vy) : null;
    glideAccRef.current = 0; hitRef.current = false; histRef.current = [];
  };
  const moveRef = useRef(moveImpl); moveRef.current = moveImpl;
  const upRef = useRef(upImpl); upRef.current = upImpl;
  const onMove = useRef((a) => moveRef.current(a)).current;   // stable identity
  const onUp = useRef(() => upRef.current()).current;
  usePointerDrag(stage, onMove, onUp);

  useRAF(true, (dt) => {
    phaseRef.current += dt;
    if (!heldRef.current) {
      const p = puckRef.current;
      if (Math.hypot(p.vx, p.vy) >= 0.04) {
        const fr = dt / 16;
        const decay = Math.pow(1 - (11 - liftRef.current) * 0.0045, fr);
        let vx = p.vx * decay, vy = p.vy * decay;
        let x = p.x + vx * fr, y = p.y + vy * fr;
        if (x < BX0) { x = BX0; vx = -vx * 0.82; } if (x > BX1) { x = BX1; vx = -vx * 0.82; }
        if (y < BY0) { y = BY0; vy = -vy * 0.82; } if (y > BY1) { y = BY1; vy = -vy * 0.82; }
        glideAccRef.current += Math.hypot(x - p.x, y - p.y);
        const tr = trailRef.current; tr.push({ x, y }); if (tr.length > 42) tr.shift();
        const hs = histRef.current; hs.push(Math.hypot(vx, vy)); if (hs.length > 80) hs.shift();
        const sp = Math.hypot(vx, vy);
        if (Math.hypot(x - target.x, y - target.y) < target.r && !hitRef.current && sp < 0.7) {
          hitRef.current = true; hitFlashRef.current = phaseRef.current; setScore((s) => s + 1);
        }
        if (sp < 0.05) setGlide(Math.round(glideAccRef.current));
        puckRef.current = { x, y, vx, vy };
      }
    }
    force((n) => (n + 1) % 1000000);
  });

  const reset = () => { trailRef.current = []; ghostRef.current = null; histRef.current = []; glideAccRef.current = 0; hitRef.current = false; puckRef.current = { x: START.x, y: START.y, vx: 0, vy: 0 }; setGlide(0); };

  // ---- derived (render runs every animation tick; read latest refs) ----
  const p = puckRef.current;
  const speed = Math.hypot(p.vx, p.vy);
  const fricLabel = lift >= 8 ? "very low" : lift >= 5 ? "low" : lift >= 3 ? "medium" : "high";
  const cushionR = 14 + lift * 1.0;            // air-cushion halo grows with lift
  const shadowR = Math.max(5, 16 - lift * 0.8); // contact shadow shrinks as lift rises
  const shadowOp = Math.max(0.04, 0.2 - lift * 0.013);
  const phase = phaseRef.current;

  // escaping-air ticks (radial, top-down); length/opacity scale with lift
  const jetN = 12;
  const jets = Array.from({ length: jetN }, (_, i) => {
    const ang = (i / jetN) * Math.PI * 2, ca = Math.cos(ang), sa = Math.sin(ang);
    const puff = 0.5 + 0.5 * Math.sin(phase * 0.012 + i * 1.7);
    const r0 = 13, len = 3 + lift * 0.9 * (0.45 + 0.55 * puff);
    return { x1: p.x + ca * r0, y1: p.y + sa * r0, x2: p.x + ca * (r0 + len), y2: p.y + sa * (r0 + len), op: cl(0.16 + lift * 0.03 * puff, 0, 0.6) };
  });

  // speed-decay sparkline
  const hist = histRef.current;
  const plX = spX + 8, plX2 = spX + spW - 8, plYt = spY + 14, plYb = spY + spH - 5;
  const sparkPts = hist.length > 1 ? hist.map((s, i) => (plX + (i / (hist.length - 1)) * (plX2 - plX)).toFixed(1) + "," + (plYb - cl(s / 16, 0, 1) * (plYb - plYt)).toFixed(1)).join(" ") : "";
  const lastH = hist.length ? cl(hist[hist.length - 1] / 16, 0, 1) : 0;

  // ghost path + stop marker
  const gp = ghostRef.current;
  const ghostPts = gp ? gp.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" ") : "";
  const ghostStop = gp ? gp[gp.length - 1] : null;

  // target hit flash
  const sinceHit = phase - hitFlashRef.current;
  const hitOn = hitFlashRef.current > 0 && sinceHit < 800;
  const hitT = hitOn ? sinceHit / 800 : 0;

  // light table texture (dot grid), built once
  const texture = useMemo(() => {
    const a = [];
    for (let gx = RX0 + 18; gx < RX1 - 6; gx += 26) for (let gy = RY0 + 16; gy < RY1 - 6; gy += 26) a.push(<circle key={"d" + gx + "_" + gy} cx={gx} cy={gy} r="0.8" fill={ink} opacity="0.07" />);
    return a;
  }, []);

  return (
    <div>
      <Field height={300}>
        <div ref={stage} style={{ position: "absolute", inset: 0, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: held ? "grabbing" : "grab" }}>
          <svg viewBox={"0 0 " + VBW + " " + VBH} style={{ width: "100%", height: "100%" }}>
            {/* ===== header ===== */}
            <text x="14" y="24" fill={ink} style={f.mono(700, 12, { upper: true, tracking: 0.1 })}>Air cushion cuts friction</text>

            {/* speed-decay sparkline card */}
            <rect x={spX} y={spY} width={spW} height={spH} rx="5" fill={T.paper2} stroke={ink} strokeWidth="0.8" opacity="0.95" />
            <text x={spX + 8} y={spY + 10} fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.14 })}>speed decay</text>
            <line x1={plX} y1={plYb} x2={plX2} y2={plYb} stroke={T.rule22} strokeWidth="0.6" />
            {sparkPts && <polyline points={sparkPts} fill="none" stroke={A} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />}
            {hist.length > 0 && <circle cx={plX2} cy={plYb - lastH * (plYb - plYt)} r="1.6" fill={A} />}

            {/* ===== rink floor + texture ===== */}
            <rect x={RX0} y={RY0} width={RX1 - RX0} height={RY1 - RY0} rx="7" fill={T.paper3} opacity="0.32" stroke={T.ink} strokeWidth="0.8" />
            {texture}

            {/* ===== target ===== */}
            {hitOn && <circle cx={target.x} cy={target.y} r={target.r} fill={A} opacity={0.14 * (1 - hitT)} />}
            <circle cx={target.x} cy={target.y} r={target.r} fill="none" stroke={ink} strokeWidth="1.4" strokeDasharray="2 3" />
            <circle cx={target.x} cy={target.y} r={target.r * 0.55} fill="none" stroke={ink} strokeWidth="0.8" opacity="0.5" />
            <circle cx={target.x} cy={target.y} r="2.2" fill={ink} />
            <text x={target.x} y={target.y - target.r - 5} textAnchor="middle" fill={ink} style={f.mono(600, 8.5, { upper: true, tracking: 0.12 })}>target</text>
            {hitOn && <circle cx={target.x} cy={target.y} r={target.r + hitT * 22} fill="none" stroke={A} strokeWidth={1.6 * (1 - hitT)} opacity={0.85 * (1 - hitT)} />}
            {hitOn && <text x={target.x} y={target.y + target.r + 14} textAnchor="middle" fill={A} opacity={1 - hitT} style={f.mono(700, 8.5, { upper: true, tracking: 0.14 })}>on target</text>}

            {/* ===== cushion-off ghost path (same flick, high friction) ===== */}
            {ghostPts && <polyline points={ghostPts} fill="none" stroke={DISC_DK} strokeWidth="1.4" strokeDasharray="3 3" opacity="0.7" />}
            {ghostStop && (
              <g opacity="0.78">
                <circle cx={ghostStop[0]} cy={ghostStop[1]} r="4.5" fill="none" stroke={DISC_DK} strokeWidth="1.1" />
                <line x1={ghostStop[0] - 3} y1={ghostStop[1] - 3} x2={ghostStop[0] + 3} y2={ghostStop[1] + 3} stroke={DISC_DK} strokeWidth="1.1" />
                <line x1={ghostStop[0] - 3} y1={ghostStop[1] + 3} x2={ghostStop[0] + 3} y2={ghostStop[1] - 3} stroke={DISC_DK} strokeWidth="1.1" />
                <text x={ghostStop[0]} y={ghostStop[1] - 8} textAnchor="middle" fill={DISC_DK} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>cushion off</text>
              </g>
            )}

            {/* ===== live glide trail ===== */}
            {trailRef.current.map((pt, i) => (<circle key={"tr" + i} cx={pt.x} cy={pt.y} r="2.3" fill={A} opacity={(i / trailRef.current.length) * 0.45} />))}

            {/* ===== hovercraft puck (top-down): shadow, cushion halo, escaping air, CD disc, balloon ===== */}
            <ellipse cx={p.x} cy={p.y + 2} rx={shadowR} ry={shadowR * 0.62} fill="#000" opacity={shadowOp} />
            <circle cx={p.x} cy={p.y} r={cushionR} fill={A} opacity="0.12" />
            <circle cx={p.x} cy={p.y} r={cushionR} fill="none" stroke={A} strokeWidth="0.8" opacity="0.3" />
            {jets.map((j, i) => <line key={"j" + i} x1={j.x1} y1={j.y1} x2={j.x2} y2={j.y2} stroke={A} strokeWidth="1.2" opacity={j.op} strokeLinecap="round" />)}
            <circle data-puck="disc" cx={p.x} cy={p.y} r="13" fill={DISC} stroke={T.ink} strokeWidth="0.9" />
            <circle cx={p.x} cy={p.y} r="13" fill="none" stroke={DISC_DK} strokeWidth="0.6" opacity="0.7" />
            <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={DISC_DK} strokeWidth="0.5" opacity="0.5" />
            <circle cx={p.x} cy={p.y} r="9.5" fill={A} opacity="0.9" />
            <circle cx={p.x} cy={p.y} r="9.5" fill="none" stroke={T.ink} strokeWidth="0.5" opacity="0.5" />
            <ellipse cx={p.x - 3} cy={p.y - 3.2} rx="3" ry="2" fill="#ffffff" opacity="0.55" />
            <circle cx={p.x} cy={p.y} r="2.4" fill={T.paper} stroke={T.ink} strokeWidth="0.6" />
            {held && <circle cx={p.x} cy={p.y} r="22" fill="none" stroke={A} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.85" />}

            {/* ===== footer: friction legend + helper ===== */}
            <line x1="16" y1="282" x2="32" y2="282" stroke={A} strokeWidth="2.4" strokeLinecap="round" />
            <text x="37" y="285" fill={T.mute} style={f.mono(600, 8, { tracking: 0.03 })}>cushion on: long glide</text>
            <line x1="16" y1="293" x2="32" y2="293" stroke={DISC_DK} strokeWidth="1.4" strokeDasharray="3 3" />
            <text x="37" y="296" fill={T.mute} style={f.mono(600, 8, { tracking: 0.03 })}>cushion off: stops fast</text>
            <text x="446" y="290" textAnchor="end" fill={ink} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>{held ? "release to throw" : "grab the puck and flick it"}</text>
          </svg>
        </div>
      </Field>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={lift} set={setLift} min={1} max={10} step={1} color={A} label="Air cushion" suffix={lift + " / 10"} />
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
        <div style={{ flex: 1 }} />
        <Tag color={ink}>hits {score}</Tag>
      </div>

      <Readout items={[
        { l: "Speed", v: speed.toFixed(1), color: A },
        { l: "Air cushion", v: lift + " / 10", color: ink },
        { l: "Friction", v: fricLabel },
        { l: "Last glide", v: glide + " px" },
      ]} />

      <Caption color={ink}>
        A balloon pushes air down through the hole in the disc, lifting it on a thin cushion so it
        barely touches the table. With almost no contact, sliding friction nearly vanishes and only a
        small aerodynamic drag remains, so the same flick glides far and each wall bounce takes a long
        time to die out, just as Newton's first law predicts. The faded "cushion off" path shows where
        the identical flick would stop with the disc scraping the table, and the speed-decay readout
        shows how slowly the speed bleeds away when the cushion is thick.
      </Caption>
    </div>
  );
}

function DemoSpectra() {
  // PYS-10 "Diffraction splits light" (concept 1). The sibling ExtraSpectraFingerprint
  // is the fingerprint VIEWER for matching. This demo shows the MECHANISM: a grating
  // passes a zero-order white spot straight through and fans a first-order spectrum,
  // bending each color by a different amount (red most, violet least). A hot filament
  // gives a continuous rainbow; an excited gas gives only its own bright lines. More
  // lines per millimeter spreads the spectrum wider.
  const ink = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const SRC = [
    { k: "Inc", name: "incandescent", cont: true, glow: "#fff0c8" },
    { k: "H", name: "hydrogen", cont: false, glow: "#d98cff", lines: [{ p: 0.10, c: "#6a3bff" }, { p: 0.22, c: "#3ea3ff" }, { p: 0.62, c: "#ff3030" }] },
    { k: "Ne", name: "neon", cont: false, glow: "#ff7a4d", lines: [{ p: 0.50, c: "#ffdd33" }, { p: 0.62, c: "#ff8a30" }, { p: 0.70, c: "#ff5530" }, { p: 0.82, c: "#ff3030" }, { p: 0.88, c: "#d62020" }] },
    { k: "Hg", name: "mercury", cont: false, glow: "#bfe6ff", lines: [{ p: 0.05, c: "#7a3bff" }, { p: 0.16, c: "#3aaaff" }, { p: 0.42, c: "#3ed98f" }, { p: 0.68, c: "#ffa030" }] },
  ];
  const RAINBOW = [[0, "#7a3bff"], [0.16, "#4060ff"], [0.32, "#27b6d6"], [0.48, "#3ed98f"], [0.64, "#ffe23a"], [0.80, "#ff8a30"], [1, "#ff3030"]];

  const [srcIdx, setSrcIdx] = useState(0);
  const [density, setDensity] = useState(3);    // grating lines/mm proxy 1..6
  const src = SRC[srcIdx], cont = src.cont;

  const Gx = 212, Gy = 146, screenX = 430;
  const spread = 34 + density * 9;              // more lines/mm -> wider fan
  const sy = (p) => Gy - (0.12 + 0.88 * p) * spread;

  return (
    <div>
      <Field height={280}>
        <svg viewBox="0 0 460 280" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
              {[...RAINBOW].reverse().map(([p, c], i) => (<stop key={i} offset={(1 - p).toFixed(2)} stopColor={c} />))}
            </linearGradient>
          </defs>
          <text x="20" y="16" fill={ink} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Diffraction splits light</text>
          <text x="20" y="28" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.06 })}>a grating fans white light into colors; a gas shows only its own bright lines</text>

          {/* dark optics bench */}
          <rect x="18" y="38" width="424" height="182" rx="4" fill="#0d0a08" />
          <text x="434" y="52" textAnchor="end" fill="#8a7f6c" style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>1st-order spectrum</text>

          {/* source lamp */}
          <circle cx="46" cy={Gy} r="15" fill={src.glow} opacity="0.28" />
          <rect x="34" y={Gy - 13} width="26" height="26" rx="4" fill="#1a1812" stroke="#3a342a" strokeWidth="1" />
          <circle cx="47" cy={Gy} r="7" fill={src.glow} style={{ filter: "drop-shadow(0 0 5px " + src.glow + ")" }} />
          <text x="26" y={Gy + 30} textAnchor="start" fill="#b6ab97" style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>{src.name}</text>

          {/* incoming beam to the grating */}
          <line x1="61" y1={Gy} x2="198" y2={Gy} stroke={src.glow} strokeWidth="5" opacity="0.5" strokeLinecap="round" />

          {/* diffraction grating */}
          <rect x="198" y="110" width="14" height="72" rx="1.5" fill="#16222b" stroke="#3990c9" strokeWidth="1" />
          {Array.from({ length: 6 }, (_, i) => (<line key={"gr" + i} x1={200 + i * 2.2} y1="112" x2={200 + i * 2.2} y2="180" stroke="#5fd2e6" strokeWidth="0.6" opacity="0.7" />))}
          <text x="205" y="196" textAnchor="middle" fill="#b6ab97" style={f.mono(600, 8, { upper: true, tracking: 0.1 })}>grating</text>

          {/* zero-order (undiffracted white) */}
          <line x1={Gx} y1={Gy} x2={screenX} y2={Gy} stroke="#fff4e0" strokeWidth="1" strokeDasharray="2 4" opacity="0.55" />
          <circle cx={screenX} cy={Gy} r="3.2" fill="#fff4e0" />
          <text x={screenX} y={Gy + 14} textAnchor="middle" fill="#8a7f6c" style={f.mono(500, 7)}>0 white</text>

          {/* screen wall */}
          <line x1={screenX + 8} y1="56" x2={screenX + 8} y2={Gy + 4} stroke="#2c2a26" strokeWidth="3" />

          {/* first-order spectrum: continuous band or discrete lines */}
          {cont ? (
            <g>
              {RAINBOW.map(([p, c], i) => (<line key={"r" + i} x1={Gx} y1={Gy} x2={screenX} y2={sy(p)} stroke={c} strokeWidth="2" opacity="0.4" />))}
              <rect x={screenX - 4} y={sy(1)} width="14" height={sy(0) - sy(1)} fill="url(#spGrad)" />
            </g>
          ) : (
            <g>
              {src.lines.map((L, i) => (<line key={"r" + i} x1={Gx} y1={Gy} x2={screenX} y2={sy(L.p)} stroke={L.c} strokeWidth="2" opacity="0.85" style={{ filter: "drop-shadow(0 0 3px " + L.c + ")" }} />))}
              {src.lines.map((L, i) => (<rect key={"t" + i} x={screenX - 6} y={sy(L.p) - 1.6} width="16" height="3.2" rx="1" fill={L.c} style={{ filter: "drop-shadow(0 0 3px " + L.c + ")" }} />))}
            </g>
          )}
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        {SRC.map((s, i) => (<Btn key={s.k} small color={A} active={srcIdx === i} onClick={() => setSrcIdx(i)}>{s.name.split(" ")[0]}</Btn>))}
        <Slider val={density} set={setDensity} min={1} max={6} step={1} color={ink} label="Grating density" suffix={density * 150 + "/mm"} />
      </div>

      <Readout items={[
        { l: "Source", v: src.name, color: A },
        { l: "Spectrum", v: cont ? "continuous" : "bright lines", color: ink },
        { l: "Lines", v: cont ? "full rainbow" : src.lines.length },
        { l: "Grating", v: density * 150 + " /mm" },
      ]} />

      <Caption color={ink}>
        A diffraction grating bends each color by a different amount, red most and violet least, so
        white light fans out into a spectrum while the undiffracted beam passes straight through. A
        hot filament emits every visible wavelength and gives a smooth rainbow, but an excited gas
        emits only certain wavelengths, so you see separated bright lines. Pack more lines per
        millimeter onto the grating and the same spectrum spreads wider.
      </Caption>
    </div>
  );
}

/* ---- 13. BookBot: crane queue, X then Y addressing ------------------ */
function DemoBookbot() {
  // PYS-11 "Automated storage and retrieval" (concept 1). The sibling ExtraSearch
  // is the top-down ROUTING optimizer (naive vs nearest-neighbor across many
  // fetches). This demo isolates ADDRESSING: books live in any bin regardless of
  // subject, and the crane fetches one by its address using a two-axis lookup
  // (slide to the column, drop to the row, grab the bin), exactly how a database
  // index finds a record. Click bins (or request a random one) to queue fetches.
  const cols = ["1", "2", "3", "4", "5"];
  const rows = ["A", "B", "C", "D"];
  const colX = (c) => 70 + c * 58;
  const rowY = (r) => 86 + r * 38;
  const railY = 46, homeY = 58;
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const SPINE = ["#a8472f", "#355a7a", "#b58a32", "#5f7a3a", "#7d5577", "#c77a2b"];
  const binColor = (bin) => { let h = 0; for (let i = 0; i < bin.length; i++) h = (h * 31 + bin.charCodeAt(i)) >>> 0; return SPINE[h % SPINE.length]; };

  const [queue, setQueue] = useState(["B3", "D1", "A4"]);
  const [active, setActive] = useState(null);   // { c, r, bin }
  const [phase, setPhase] = useState("idle");    // idle | toCol | toRow | grab | toHome
  const [cur, setCur] = useState({ x: colX(0), y: homeY });
  const [served, setServed] = useState(0);
  const targetRef = useRef(null);
  const to = useTimeouts();
  const running = phase !== "idle";

  const startBin = (bin) => {
    const c = cols.indexOf(bin[1]), r = rows.indexOf(bin[0]);
    if (c < 0 || r < 0) return;
    targetRef.current = { x: colX(c), y: rowY(r), c, r, bin };
    setActive({ c, r, bin });
    setPhase("toCol");
  };

  useRAF(running, (dt) => {
    setCur((p) => {
      const tg = targetRef.current; if (!tg) return p;
      const step = (a, b) => a + (b - a) * Math.min(1, dt / 200);
      if (phase === "toCol") { const nx = step(p.x, tg.x); if (Math.abs(nx - tg.x) < 0.6) setPhase("toRow"); return { x: nx, y: homeY }; }
      if (phase === "toRow") { const ny = step(p.y, tg.y); if (Math.abs(ny - tg.y) < 0.6) { setPhase("grab"); to(() => setPhase("toHome"), 420); } return { x: tg.x, y: ny }; }
      if (phase === "grab") return p;
      if (phase === "toHome") {
        const ny = step(p.y, homeY);
        if (Math.abs(ny - homeY) < 0.6) {
          setServed((s) => s + 1); setQueue((q) => q.slice(1)); setActive(null); targetRef.current = null;
          to(() => setPhase("idle"), 200);
          return { x: tg.x, y: homeY };
        }
        return { x: tg.x, y: ny };
      }
      return p;
    });
  });

  useEffect(() => { if (phase === "idle" && queue.length > 0) startBin(queue[0]); }, [phase, queue]);

  const enqueue = (bin) => setQueue((q) => (q.includes(bin) ? q : [...q, bin]));
  const randomReq = () => enqueue(rows[Math.floor(Math.random() * rows.length)] + cols[Math.floor(Math.random() * cols.length)]);
  const carrying = active && (phase === "grab" || phase === "toHome");

  return (
    <div>
      <Field height={264}>
        <svg viewBox="0 0 460 264" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="16" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>BookBot: store by address</text>
          <text x="20" y="28" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.06 })}>any book in any bin {"·"} the crane fetches by address, not by subject</text>

          {/* two-axis lookup highlight: column while seeking, column + row once found */}
          {active && <rect x={colX(active.c) - 27} y={railY} width="54" height={rowY(rows.length - 1) + 15 - railY} fill={A} opacity="0.09" rx="3" />}
          {active && (phase === "toRow" || phase === "grab" || phase === "toHome") && <rect x="44" y={rowY(active.r) - 16} width={colX(cols.length - 1) + 25 - 44} height="32" fill={A} opacity="0.10" rx="3" />}

          {/* rail */}
          <line x1="40" y1={railY} x2="356" y2={railY} stroke={T.ink} strokeWidth="2.4" />

          {/* bins, each holding a book (subject color is unrelated to address) */}
          {rows.map((rl, r) => cols.map((cl, c) => {
            const bin = rl + cl, isActive = active && active.bin === bin, inQ = queue.includes(bin);
            const x = colX(c), y = rowY(r);
            return (
              <g key={bin} style={{ cursor: "pointer" }} onClick={() => enqueue(bin)}>
                <rect x={x - 25} y={y - 15} width="50" height="30" rx="2" fill={T.paper} stroke={isActive ? A : T.ink} strokeWidth={isActive ? 1.8 : 0.8} />
                <rect x={x - 21} y={y - 11} width="8" height="22" rx="1" fill={binColor(bin)} opacity={isActive ? 1 : 0.82} />
                <text x={x + 5} y={y + 4} textAnchor="middle" fill={inQ ? A : T.ink} style={f.mono(700, 11, { tracking: 0.04 })}>{bin}</text>
              </g>
            );
          }))}

          {/* crane: carriage on the rail, lift column, gripper (carries the book home) */}
          <rect x={cur.x - 15} y={railY - 9} width="30" height="15" rx="2" fill={C} />
          <line x1={cur.x} y1={railY + 6} x2={cur.x} y2={cur.y + 6} stroke={C} strokeWidth="2" />
          <rect x={cur.x - 9} y={cur.y - 2} width="18" height="14" rx="1.5" fill={phase === "grab" ? A : C} stroke={T.ink} strokeWidth="0.6" />
          {carrying && <rect x={cur.x - 4} y={cur.y + 1} width="8" height="10" rx="1" fill={binColor(active.bin)} />}

          {/* request + delivered panel */}
          <rect x="370" y="44" width="82" height="184" rx="4" fill={T.paper2} stroke={C} strokeWidth="1" />
          <text x="411" y="60" textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>request</text>
          <text x="411" y="88" textAnchor="middle" fill={active ? A : T.mute} style={f.mono(700, 22)}>{active ? active.bin : "-"}</text>
          <text x="411" y="108" textAnchor="middle" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.06 })}>{active ? "col " + active.bin[1] : "idle"}</text>
          <text x="411" y="121" textAnchor="middle" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.06 })}>{active ? "row " + active.bin[0] : ""}</text>
          <line x1="380" y1="136" x2="442" y2="136" stroke={T.rule22} strokeWidth="1" />
          <text x="411" y="154" textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>delivered</text>
          <text x="411" y="182" textAnchor="middle" fill={C} style={f.mono(700, 20)}>{served}</text>
          {Array.from({ length: Math.min(served, 8) }, (_, i) => (<rect key={"d" + i} x={382 + i * 8} y="196" width="6" height="14" rx="1" fill={SPINE[i % SPINE.length]} />))}

          <text x="20" y="252" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.12 })}>click a bin to queue {"·"} crane fetches in order</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ ...f.sans(600, 10.5, { upper: true, tracking: 0.12 }), color: T.mute }}>queue</span>
          <div style={{ display: "flex", gap: 6 }}>
            {queue.length === 0
              ? <span className="ticker" style={{ color: T.mute, ...f.mono(500, 12) }}>empty</span>
              : queue.map((b, i) => <Tag key={b + i} color={i === 0 ? A : T.ink}>{b}</Tag>)}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <Btn small icon={Plus} color={A} onClick={randomReq}>request</Btn>
        <Btn small icon={RotateCcw} onClick={() => { setQueue([]); setActive(null); setPhase("idle"); }}>clear</Btn>
      </div>

      <Readout items={[
        { l: "Address", v: active ? active.bin : "idle", color: active ? A : C },
        { l: "Crane", v: phase, color: phase === "grab" ? A : C },
        { l: "Delivered", v: served },
        { l: "Lookup", v: "column, then row" },
      ]} />

      <Caption color={C}>
        An automated storage cell stores by address, not by subject: a book can live in any free
        bin as long as the system records where. To retrieve one, the crane resolves its address in
        two axes: it slides along the rail to the column, drops the lift to the row, and grabs the bin, the
        same two-step lookup a database index uses to find a record fast. Storing by address packs
        shelves densely and makes retrieval a quick, predictable trip.
      </Caption>
    </div>
  );
}

/* ---- 14. Ramp: 1:12 guideline, cart rolls under gravity ------------- */
function DemoRamp() {
  // PYS-12 "Slope, load, and universal design" (concept 1). The sibling
  // ExtraDecision weighs three client constraints (slope, portability, load
  // capacity) on gauges. This demo isolates the PHYSICS of slope: a longer,
  // gentler ramp needs less push force (F = W sin th) but covers more distance,
  // and the same work raises the load either way. Accessibility caps slope at
  // 1:12. Set the ramp length and the load, then push the cart up.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const [len, setLen] = useState(8);     // slope ratio run:rise -> slope is 1:len
  const [loadLb, setLoadLb] = useState(200);
  const [p, setP] = useState(0.45);      // cart position along ramp, 0..1
  const [pushing, setPushing] = useState(false);

  // geometry (true incline angle; rise kept small so 1:12 still fits)
  const groundY = 188, riseP = 24, topX = 392;
  const platTopY = groundY - riseP;
  const run = len * riseP;
  const baseX = topX - run;
  const hyp = Math.hypot(run, riseP);
  const sinT = riseP / hyp;
  const angleDeg = Math.asin(sinT) * 180 / Math.PI;
  const ok = len >= 12;                  // 1:12 or gentler meets the standard
  const pushLbf = Math.round(loadLb * sinT);
  const mechAdv = hyp / riseP;           // ideal mechanical advantage = sqrt(len^2 + 1)
  const pushPct = Math.round(sinT * 100);

  useRAF(pushing, (dt) => {
    setP((pp) => {
      const np = pp + (0.14 * dt) / hyp;  // constant screen speed -> longer ramp takes longer
      if (np >= 1) { setPushing(false); return 1; }
      return np;
    });
  });
  const push = () => { setPushing(false); setP(0); setPushing(true); };
  const reset = () => { setPushing(false); setP(0.45); };

  const cartX = baseX + p * run, cartY = groundY - p * riseP;
  const arrowLen = Math.max(16, Math.min(48, 15 + pushLbf * 0.28));
  const guideFootX = topX - 12 * riseP;  // foot of the 1:12 reference on the ground
  const barW = 120, pushBarW = barW * sinT;

  return (
    <div>
      <Field height={230}>
        <svg viewBox="0 0 460 230" style={{ width: "100%", height: "100%" }}>
          {/* ground + hatch */}
          <line x1="6" y1={groundY} x2="454" y2={groundY} stroke={T.ink} strokeWidth="1.2" />
          {Array.from({ length: 28 }, (_, k) => (<line key={"g" + k} x1={12 + k * 16 + 6} y1={groundY + 1} x2={12 + k * 16} y2={groundY + 7} stroke={T.ink} strokeWidth="0.5" opacity="0.4" />))}

          {/* 1:12 reference line + labelled foot */}
          <line x1={topX} y1={platTopY} x2={guideFootX} y2={groundY} stroke={T.mute} strokeWidth="0.9" strokeDasharray="3 4" opacity="0.7" />
          <circle cx={guideFootX} cy={groundY} r="2" fill={T.mute} />
          <text x={guideFootX} y={groundY + 16} textAnchor="middle" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>1:12 limit</text>

          {/* ramp fill + surface (red when steeper than 1:12) */}
          <polygon points={baseX + "," + groundY + " " + topX + "," + groundY + " " + topX + "," + platTopY} fill={C} opacity="0.08" />
          <line x1={baseX} y1={groundY} x2={topX} y2={platTopY} stroke={ok ? C : T.warn} strokeWidth="3.4" strokeLinecap="round" />

          {/* platform / curb + landing */}
          <rect x={topX} y={platTopY} width="46" height={riseP} fill={C} opacity="0.85" />
          <rect x={topX - 6} y={platTopY - 4} width="52" height="4" rx="1" fill={C} />

          {/* pass / fail flag on the landing */}
          <g transform={"translate(372 30)"}>
            <rect x="0" y="0" width="66" height="14" rx="2" fill={ok ? T.ok : T.warn} />
            <text x="33" y="10" textAnchor="middle" fill={T.paper} style={f.mono(700, 8, { upper: true, tracking: 0.1 })}>{ok ? "meets 1:12" : "too steep"}</text>
          </g>

          {/* cart (load on a rolling base) + push-force arrow up the ramp */}
          <g transform={"translate(" + cartX + " " + cartY + ") rotate(" + (-angleDeg) + ")"}>
            <rect x="-11" y="-9" width="22" height="9" rx="1.5" fill={A} />
            <rect x="-7" y="-17" width="14" height="8" rx="1" fill={C} />
            <circle cx="-6" cy="1" r="3" fill={T.ink} />
            <circle cx="6" cy="1" r="3" fill={T.ink} />
          </g>
          <g transform={"translate(" + cartX + " " + (cartY - 13) + ") rotate(" + (-angleDeg) + ")"}>
            <line x1="0" y1="0" x2={arrowLen} y2="0" stroke={A} strokeWidth="3.2" strokeLinecap="round" />
            <path d={"M" + arrowLen + " 0 l-7.5 -4.5 l0 9 z"} fill={A} />
          </g>

          {/* force comparison card (top-left, clear of the ramp) */}
          <rect x="14" y="28" width="186" height="70" rx="6" fill={T.paper2} stroke={C} strokeWidth="1" />
          <text x="24" y="43" fill={C} style={f.mono(700, 8, { upper: true, tracking: 0.12 })}>force to raise the load</text>
          <text x="24" y="58" fill={T.mute} style={f.mono(500, 7.5)}>lift straight up</text>
          <rect x="24" y="61" width={barW} height="6" rx="1" fill={C} opacity="0.16" />
          <rect x="24" y="61" width={barW} height="6" rx="1" fill={C} />
          <text x={24 + barW + 6} y="67" fill={C} style={f.mono(700, 7.5)}>{loadLb} lbf</text>
          <text x="24" y="80" fill={T.mute} style={f.mono(500, 7.5)}>push up ramp</text>
          <rect x="24" y="83" width={barW} height="6" rx="1" fill={A} opacity="0.16" />
          <rect x="24" y="83" width={pushBarW} height="6" rx="1" fill={A} />
          <text x={24 + barW + 6} y="89" fill={A} style={f.mono(700, 7.5)}>{pushPct}%</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={len} set={(v) => { setLen(v); reset(); }} min={3} max={16} step={1} color={C} label="Ramp length" suffix={"1:" + len} />
        <Slider val={loadLb} set={setLoadLb} min={50} max={400} step={50} color={A} label="Load" suffix={loadLb + " lb"} />
        <Btn small icon={Play} color={A} onClick={push}>push up</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>

      <Readout items={[
        { l: "Slope", v: "1:" + len, color: ok ? T.ok : T.warn },
        { l: "Angle", v: angleDeg.toFixed(1) + "°" },
        { l: "Push force", v: pushLbf + " lbf", color: A },
        { l: "Mech. advantage", v: mechAdv.toFixed(1) + "×", color: C },
      ]} />

      <Caption color={C}>
        A ramp trades steepness for length. Stretch the same step height over a longer run and the
        push force drops by the slope ratio, because the work to raise the load (weight times height)
        is the same whether you lift it straight up or roll it up the ramp. A gentler ramp is easier
        and safer but needs more room, so accessibility standards cap the slope at 1:12. That is
        universal design: meeting real users and real constraints from the start.
      </Caption>
    </div>
  );
}

const DEMOS = {
  mudwatt: DemoMudwatt, capillary: DemoCapillary, oobleck: DemoOobleck,
  samara: DemoSamara, treering: DemoTreering, lotus: DemoLotus, magnet: DemoMagnet,
  cam: DemoCam, wave: DemoWave, pinhole: DemoPinhole, hover: DemoHover,
  spectra: DemoSpectra, bookbot: DemoBookbot, ramp: DemoRamp,
};

/* ====================================================================== */
/*                       EXTRA ILLUSTRATIONS                              */
/* Compact, focused visuals for science slides that have no main demo.    */
/* Keyed by the science slide title (sl.data.t). Routed from Presentation */
/* via the EXTRAS map below.                                              */
/* ====================================================================== */

/* helper to keep illustrations tight */
function Ill({ children, h = 180 }) { return <div><Field height={h}>{children}</Field></div>; }

/* ---------- TTT-01 Completing the circuit ---------- */
function ExtraCircuit() {
  // TTT-01 "Completing the circuit" (concept 2 of the MudWatt cell). The sibling
  // DemoMudwatt is a soil cross-section about biofilm growth and the meter. This
  // one is the SCHEMATIC LOOP: a circuit only works when charge can travel the
  // whole way around. Electrons take the external WIRE from anode to cathode
  // (lighting the LED); positive ions take the MUD to close the other half. Cut
  // the wire OR block the mud and current stops, even though the cell still holds
  // voltage. Power is roughly voltage times current.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const MUD = "#5c4a30", GRAPH = "#1d1d20", METAL = "#c9c9cd", IONLINE = "#caa86f";
  const [mode, setMode] = useState("complete"); // complete | wire | mud
  const [supply, setSupply] = useState(3);       // microbe activity 1..5
  const complete = mode === "complete";
  const [t, setT] = useState(0);
  useRAF(complete, (dt) => setT((v) => v + dt));

  const cur = supply / 5;                                       // current proxy 0.2..1
  const voltageMv = 320 + supply * 56;                          // 376..600 mV (chemistry sets this)
  const currentUa = Math.round(supply * 78);                    // 78..390 microamps
  const powerUw = Math.round(voltageMv * currentUa / 1000);     // microwatts = mV * uA / 1000
  const period = Math.max(180, 1500 - cur * 1200);
  const lit = complete && (t % period) < period * 0.45;

  // loop geometry
  const Lx = 78, Rx = 362, topY = 64, botY = 166;
  const inset = 16, span = (Rx - inset) - (Lx + inset);
  const wireCut = 152, mudPlug = 286;

  const electrons = complete ? Array.from({ length: 5 }, (_, i) => Lx + inset + (((t * 0.00026 * (0.5 + cur)) + i / 5) % 1) * span) : [];
  const ions = complete ? Array.from({ length: 5 }, (_, i) => Lx + inset + (((t * 0.00026 * (0.5 + cur)) + i / 5) % 1) * span) : [];

  return (
    <div>
      <Field height={232}>
        <svg viewBox="0 0 440 232" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="16" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Completing the circuit</text>
          <text x="20" y="28" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.07 })}>both carriers go anode {"→"} cathode: e{"⁻"} by wire, H{"⁺"} by mud</text>

          {/* air + mud zones */}
          <rect x="40" y="40" width="360" height="110" fill={T.paper3} opacity="0.18" />
          <rect x="40" y="150" width="360" height="58" rx="4" fill={MUD} />
          <rect x="40" y="150" width="360" height="6" fill="#3a5267" opacity="0.35" />
          <text x="90" y="84" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>wire {"·"} electrons</text>
          <text x="90" y="201" fill={T.paper3} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>mud {"·"} H{"⁺"} ions</text>
          {[[340, 102], [352, 116]].map((o, i) => (<text key={"o" + i} x={o[0]} y={o[1]} textAnchor="middle" fill={T.mute} style={f.mono(600, 7)} opacity="0.7">O{"₂"}</text>))}

          {/* electrode labels */}
          <text x={Lx} y="50" textAnchor="middle" fill={T.ink} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>anode {"−"}</text>
          <text x={Rx} y="50" textAnchor="middle" fill={T.ink} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>cathode +</text>

          {/* bottom: mud ion path (intact unless mud is blocked) */}
          {mode !== "mud" ? (
            <line x1={Lx} y1={botY} x2={Rx} y2={botY} stroke={IONLINE} strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
          ) : (
            <g>
              <line x1={Lx} y1={botY} x2={mudPlug - 9} y2={botY} stroke={IONLINE} strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
              <line x1={mudPlug + 9} y1={botY} x2={Rx} y2={botY} stroke={IONLINE} strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
              <rect x={mudPlug - 8} y={botY - 8} width="16" height="16" rx="2" fill="none" stroke={A} strokeWidth="1.6" />
              <line x1={mudPlug - 5} y1={botY - 5} x2={mudPlug + 5} y2={botY + 5} stroke={A} strokeWidth="1.5" />
              <line x1={mudPlug + 5} y1={botY - 5} x2={mudPlug - 5} y2={botY + 5} stroke={A} strokeWidth="1.5" />
            </g>
          )}

          {/* top: external wire (intact unless wire is cut) */}
          {mode !== "wire" ? (
            <line x1={Lx} y1={topY} x2={Rx} y2={topY} stroke={T.ink} strokeWidth="2" strokeLinecap="round" />
          ) : (
            <g>
              <line x1={Lx} y1={topY} x2={wireCut - 10} y2={topY} stroke={T.ink} strokeWidth="2" strokeLinecap="round" />
              <line x1={wireCut + 10} y1={topY} x2={Rx} y2={topY} stroke={T.ink} strokeWidth="2" strokeLinecap="round" />
              <circle cx={wireCut - 10} cy={topY} r="2.6" fill={A} />
              <circle cx={wireCut + 10} cy={topY} r="2.6" fill={A} />
            </g>
          )}

          {/* electrodes form the left and right edges of the loop */}
          <rect x={Lx - 5} y={topY} width="10" height={botY - topY} rx="2" fill={GRAPH} />
          <rect x={Rx - 5} y={topY} width="10" height={botY - topY} rx="2" fill={METAL} stroke={T.ink} strokeWidth="0.8" />


          {/* electrons on the wire (skip the slot under the LED) */}
          {electrons.map((x, i) => ((x > 206 && x < 234) ? null : (
            <g key={"e" + i}>
              <circle cx={x} cy={topY} r="4.6" fill={C} stroke={T.paper} strokeWidth="0.7" />
              <text x={x} y={topY + 2.6} textAnchor="middle" fill={T.paper} style={f.mono(700, 7)}>e</text>
            </g>
          )))}
          {/* positive ions in the mud */}
          {ions.map((x, i) => (
            <g key={"i" + i}>
              <circle cx={x} cy={botY} r="4.6" fill={A} stroke={T.paper} strokeWidth="0.7" />
              <text x={x} y={botY + 2.6} textAnchor="middle" fill={T.paper} style={f.mono(700, 7)}>+</text>
            </g>
          ))}

          {/* LED on the wire */}
          <text x="220" y={topY - 18} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>LED</text>
          <circle cx="220" cy={topY} r="12" fill={lit ? A : T.paper2} stroke={T.ink} strokeWidth="1.4"
            style={{ filter: lit ? "drop-shadow(0 0 7px " + A + ")" : "none", transition: "fill .08s" }} />
          <text x="220" y={topY + 3} textAnchor="middle" fill={lit ? T.paper : T.mute} style={f.mono(700, 7)}>{lit ? "on" : "off"}</text>

          {/* cathode reaction that closes the loop */}
          <text x="220" y="226" textAnchor="middle" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.05 })}>at the cathode: O{"₂"} + 4H{"⁺"} + 4e{"⁻"} {"→"} 2H{"₂"}O</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small color={complete ? A : C} active={complete} onClick={() => setMode("complete")}>complete loop</Btn>
        <Btn small color={mode === "wire" ? A : C} active={mode === "wire"} onClick={() => setMode("wire")}>cut wire</Btn>
        <Btn small color={mode === "mud" ? A : C} active={mode === "mud"} onClick={() => setMode("mud")}>block mud</Btn>
        <Slider val={supply} set={setSupply} min={1} max={5} step={1} color={A} label="Microbe activity" suffix={supply} />
      </div>

      <Readout items={[
        { l: "Loop", v: complete ? "complete" : "broken", color: complete ? A : T.ink },
        { l: "Voltage", v: voltageMv + " mV", color: C },
        { l: "Current", v: complete ? currentUa + " µA" : "0", color: C },
        { l: "Power", v: complete ? powerUw + " µW" : "0 µW", color: A },
      ]} />

      <Caption color={C}>
        A circuit only works as a complete loop. Electrons leave the buried anode, run through the
        wire and light the LED, then reach the cathode in the air, where they join oxygen and protons
        to make water. Positive ions drift back through the mud to close the loop. Cut the wire or
        block the mud and the current stops, even though the cell still holds voltage. More active
        microbes push more electrons per second, so current and power both rise.
      </Caption>
    </div>
  );
}

/* ---------- TTT-02 Microclimate varies in meters ---------- */
function ExtraMicroclimate() {
  // TTT-02 "Microclimate varies in meters" (concept 1). Sibling ExtraSiting is
  // the placement map. This shows the VARIATION: temperature, humidity, light,
  // and soil moisture all change sharply over a few meters from open lawn into
  // dense canopy. Pick a variable and a time and read the profile across the
  // transect.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, blue = "#5a93c9", gold = "#cf9b3f";
  const [vk, setVk] = useState("temp");
  const [hour, setHour] = useState(13);
  const sun = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
  const ZN = ["open", "edge", "canopy", "interior"];
  const VARS = {
    temp: { n: "temperature", u: "°C", col: A, max: 36, f: (z) => 16 + sun * (16 - z * 4.7) },
    humid: { n: "humidity", u: "%", col: blue, max: 100, f: (z) => 48 + z * 12 - sun * 7 },
    light: { n: "light", u: "%", col: gold, max: 100, f: (z) => sun * 100 * (1 - z * 0.3) },
    soil: { n: "soil moisture", u: "%", col: C, max: 100, f: (z) => 30 + z * 14 + (1 - sun) * 5 },
  };
  const V = VARS[vk];
  const vals = [0, 1, 2, 3].map((z) => V.f(z));
  const delta = Math.abs(vals[0] - vals[3]);

  // chart
  const cX0 = 268, cY0 = 66, cY1 = 182;
  const bx = (z) => cX0 + z * 38, py = (v) => cY1 - Math.max(0, Math.min(1, v / V.max)) * (cY1 - cY0);

  // transect trees per zone (count)
  const treeY = 176;
  const tree = (cx, scale, fill) => (
    <g transform={"translate(" + cx + " " + treeY + ")"}>
      <line x1="0" y1="0" x2="0" y2={-10 * scale} stroke="#7a5732" strokeWidth={1.6 * scale} />
      <circle cx="0" cy={-10 * scale - 7 * scale} r={8 * scale} fill={fill} opacity="0.9" />
    </g>
  );

  return (
    <div>
      <Field height={236}>
        <svg viewBox="0 0 440 236" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Microclimate varies in meters</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>a few steps from open lawn changes everything</text>

          {/* ===== LEFT: transect side view ===== */}
          <rect x="16" y="34" width="224" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {/* sun */}
          <g transform="translate(44 56)">
            <circle r="7" fill={gold} opacity={0.4 + sun * 0.6} />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (<line key={k} x1={Math.cos(k * 0.785) * 10} y1={Math.sin(k * 0.785) * 10} x2={Math.cos(k * 0.785) * (10 + sun * 8)} y2={Math.sin(k * 0.785) * (10 + sun * 8)} stroke={gold} strokeWidth="1.1" opacity={0.2 + sun * 0.5} />))}
          </g>
          {/* stepped zone bands: each step greener as canopy thickens toward the interior */}
          {[[22, 67, 0], [67, 122, 0.08], [122, 177, 0.16], [177, 234, 0.26]].map((b, k) => (<rect key={"zb" + k} x={b[0]} y="40" width={b[1] - b[0]} height={treeY - 40} fill={C} opacity={b[2]} />))}
          {/* ground */}
          <line x1="22" y1={treeY} x2="234" y2={treeY} stroke={T.ink} strokeWidth="0.8" />
          {/* zone dividers (full height + tick below ground) so each band is clearly delimited */}
          {[67, 122, 177].map((dx, k) => (<line key={"zd" + k} x1={dx} y1="40" x2={dx} y2={treeY + 6} stroke={T.ink} strokeWidth="1" strokeDasharray="2 3" opacity="0.42" />))}
          {/* trees grouped inside their own zones */}
          {tree(95, 0.85, "#4f7a3a")}
          {tree(142, 1.1, C)}
          {tree(158, 1.0, C)}
          {tree(190, 1.25, "#234a26")}
          {tree(205, 1.1, "#234a26")}
          {tree(219, 1.0, "#234a26")}
          {/* grass tuft in open */}
          <path d="M40 176 l0 -7 M44 176 l2 -7 M36 176 l-2 -7" stroke="#6f9b3f" strokeWidth="1.2" fill="none" />
          {/* zone + distance labels */}
          {ZN.map((z, i) => (
            <g key={z}>
              <text x={40 + i * 55} y="192" textAnchor="middle" fill={T.ink} style={f.mono(600, 7.5, { upper: true })}>{z}</text>
              <text x={40 + i * 55} y="204" textAnchor="middle" fill={T.mute} style={f.mono(500, 7)}>{i * 3}m</text>
            </g>
          ))}

          {/* ===== RIGHT: variable profile ===== */}
          <rect x="248" y="34" width="176" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="260" y="52" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.08 })}>{V.n} profile</text>
          <line x1={cX0} y1={cY1} x2={cX0 + 3 * 38 + 10} y2={cY1} stroke={T.rule22} strokeWidth="1" />
          {/* connecting line */}
          <polyline points={vals.map((v, z) => bx(z) + "," + py(v)).join(" ")} fill="none" stroke={V.col} strokeWidth="1.4" opacity="0.5" />
          {[0, 1, 2, 3].map((z) => (
            <g key={z}>
              <rect x={bx(z) - 9} y={py(vals[z])} width="18" height={cY1 - py(vals[z])} rx="2" fill={V.col} opacity="0.85" />
              <text x={bx(z)} y={py(vals[z]) - 4} textAnchor="middle" fill={V.col} style={f.mono(700, 8)}>{Math.round(vals[z])}</text>
              <text x={bx(z)} y={cY1 + 11} textAnchor="middle" fill={T.mute} style={f.mono(500, 7)}>{ZN[z][0].toUpperCase()}</text>
            </g>
          ))}
          <text x="260" y={cY1 + 24} fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>open {"→"} interior</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        {Object.keys(VARS).map((k) => (
          <Btn key={k} small color={vk === k ? A : C} active={vk === k} onClick={() => setVk(k)}>{VARS[k].n.split(" ")[0]}</Btn>
        ))}
        <Slider val={hour} set={setHour} min={6} max={18} step={1} color={A} label="Hour" suffix={hour + ":00"} />
      </div>

      <Readout items={[
        { l: "Variable", v: V.n, color: V.col },
        { l: "Open", v: Math.round(vals[0]) + V.u, color: V.col },
        { l: "Interior", v: Math.round(vals[3]) + V.u, color: V.col },
        { l: "Change over 9 m", v: Math.round(delta) + V.u, color: A },
      ]} />

      <Caption color={C}>
        Step from open lawn into dense canopy and the climate shifts within a few meters: the shade
        cuts the light and cools the air, while moisture builds up under the leaves. That is why
        one site cannot speak for a whole area, and why good fieldwork measures the gradient instead
        of guessing from a single spot.
      </Caption>
    </div>
  );
}

/* ---------- TTT-02 Evidence-based siting ---------- */
function ExtraSiting() {
  // TTT-02 "Evidence-based siting" (concept 2). Sibling ExtraMicroclimate shows
  // the variation. This is the DECISION: a good sensor site reads close to the
  // area's typical value (representative) and sits away from the path (not
  // disturbed). A spot by the hot pavement or the cool tree is an outlier; a
  // spot on the path gets bumped. The map starts with NO sensor so students
  // predict a location first; a tap or drag in the map places it, and the marker
  // is then freely draggable (letterbox toVB + stable handler, 6.1/6.2).
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, waterC = "#5a93c9";
  const stage = useRef(null);
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [pos, setPos] = useState({ x: 220, y: 120 });
  const [placed, setPlaced] = useState(false);
  // stable handler so a sustained drag is not torn down by re-render (6.2);
  // letterbox-aware pixel -> viewBox mapping so the marker tracks at any zoom (6.1)
  const moveImpl = ({ x, y, w, h }) => {
    const sc = Math.min(w / 440, h / 236);
    const ux = (x - (w - 440 * sc) / 2) / sc, uy = (y - (h - 236 * sc) / 2) / sc;
    setPos({ x: cl(ux, 32, 408), y: cl(uy, 50, 196) });
    setPlaced(true);
  };
  const moveRef = useRef(moveImpl); moveRef.current = moveImpl;
  const onMove = useRef((a) => moveRef.current(a)).current;
  usePointerDrag(stage, onMove);
  const reset = () => setPlaced(false);

  const TREE = { x: 66, y: 116 }, PAVE = { x: 372, y: 74 };
  const fieldTemp = (x, y) => 24 - 8 * Math.exp(-((x - TREE.x) ** 2 + (y - TREE.y) ** 2) / 4900) + 9 * Math.exp(-((x - PAVE.x) ** 2 + (y - PAVE.y) ** 2) / 5625);
  const mean = 24;
  const PA = { x: 16, y: 196 }, PB = { x: 424, y: 152 };
  const distSeg = (p) => { const dx = PB.x - PA.x, dy = PB.y - PA.y, L2 = dx * dx + dy * dy; let t = cl(((p.x - PA.x) * dx + (p.y - PA.y) * dy) / L2, 0, 1); return Math.hypot(p.x - (PA.x + t * dx), p.y - (PA.y + t * dy)); };

  const localT = fieldTemp(pos.x, pos.y);
  const repErr = Math.abs(localT - mean);
  const repScore = Math.max(0, 100 - repErr * 9);
  const pathD = distSeg(pos);
  const distScore = Math.min(100, pathD * 2.2);
  const score = Math.round(0.6 * repScore + 0.4 * distScore);
  const decision = score >= 72 ? "good site" : repScore < 55 ? "unrepresentative" : distScore < 55 ? "on the path" : "marginal";
  const sC = score >= 72 ? okC : score >= 50 ? A : warnC;

  const stations = [[120, 70], [250, 60], [180, 150], [320, 120], [300, 180]];

  return (
    <div>
      <Field height={236}>
        <div ref={stage} style={{ position: "absolute", inset: 0, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: placed ? "grab" : "crosshair" }}>
          <svg viewBox="0 0 440 236" style={{ width: "100%", height: "100%" }}>
            <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Evidence-based siting</text>
            <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>{placed ? "drag the sensor to move it" : "predict first: where should the sensor go?"}</text>

            <rect x="16" y="34" width="408" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
            {/* microclimate tints */}
            <circle cx={TREE.x} cy={TREE.y} r="86" fill={waterC} opacity="0.13" />
            <circle cx={PAVE.x} cy={PAVE.y} r="88" fill={A} opacity="0.16" />
            {/* disturbance path */}
            <line x1={PA.x} y1={PA.y} x2={PB.x} y2={PB.y} stroke={T.mute} strokeWidth="6" opacity="0.3" />
            <line x1={PA.x} y1={PA.y} x2={PB.x} y2={PB.y} stroke={T.mute} strokeWidth="1" strokeDasharray="5 5" opacity="0.7" />
            <text x="404" y="148" textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>foot path</text>
            {/* tree (cool) */}
            <g transform={"translate(" + TREE.x + " " + TREE.y + ")"}>
              <line x1="0" y1="0" x2="0" y2="-12" stroke="#7a5732" strokeWidth="2.5" />
              <circle cx="0" cy="-18" r="11" fill={C} opacity="0.9" />
              <text x="0" y="14" textAnchor="middle" fill={T.mute} style={f.mono(500, 7, { upper: true })}>tree</text>
            </g>
            {/* pavement (hot) */}
            <g transform={"translate(" + PAVE.x + " " + PAVE.y + ")"}>
              <rect x="-20" y="-10" width="40" height="20" rx="2" fill="#b9b0a0" stroke={T.ink} strokeWidth="0.5" />
              <text x="0" y="22" textAnchor="middle" fill={T.mute} style={f.mono(500, 7, { upper: true })}>pavement</text>
            </g>
            {/* field-station readings (the evidence students reason from) */}
            {stations.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="2.6" fill={T.ink} opacity="0.55" />
                <text x={x} y={y - 6} textAnchor="middle" fill={T.mute} style={f.mono(500, 7)}>{fieldTemp(x, y).toFixed(0)}{"°"}</text>
              </g>
            ))}
            {/* area-mean chip */}
            <rect x="22" y="40" width="86" height="16" rx="2" fill={T.paper} stroke={T.rule12} strokeWidth="0.6" />
            <text x="28" y="51" fill={T.mute} style={f.mono(600, 8)}>area avg {mean}{"°"}</text>
            {/* sensor: shown only after the student places it (no default hint) */}
            {placed && (
              <g transform={"translate(" + pos.x + " " + pos.y + ")"}>
                <circle r="11" fill="none" stroke={sC} strokeWidth="2" />
                <line x1="-7" y1="0" x2="7" y2="0" stroke={sC} strokeWidth="1" />
                <line x1="0" y1="-7" x2="0" y2="7" stroke={sC} strokeWidth="1" />
                <rect x={pos.x > 300 ? -64 : 14} y="-10" width="50" height="16" rx="2" fill={T.paper} stroke={sC} strokeWidth="0.8" />
                <text x={pos.x > 300 ? -39 : 39} y="2" textAnchor="middle" fill={sC} style={f.mono(700, 8.5)}>{localT.toFixed(1)}{"°"}</text>
              </g>
            )}
            {/* placement prompt while empty */}
            {!placed && (
              <g>
                <rect x="126" y="199" width="188" height="17" rx="8.5" fill={T.paper} stroke={T.rule22} strokeWidth="0.8" opacity="0.96" />
                <text x="220" y="211" textAnchor="middle" fill={T.ink} style={f.mono(600, 8, { upper: true, tracking: 0.03 })}>tap or drag to place the sensor</text>
              </g>
            )}
          </svg>
        </div>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Btn small icon={RotateCcw} onClick={reset} disabled={!placed}>clear sensor</Btn>
        <span style={{ ...f.mono(600, 9, { upper: true, tracking: 0.08 }), color: T.mute }}>{placed ? "drag to refine the spot" : "no sensor placed yet"}</span>
        <div style={{ flex: 1 }} />
        <Tag color={placed ? sC : T.mute}>{placed ? decision : "predict first"}</Tag>
      </div>

      <Readout items={placed ? [
        { l: "Site score", v: score + " / 100", color: sC },
        { l: "Reading", v: localT.toFixed(1) + "° vs " + mean + "° avg", color: repScore >= 55 ? okC : warnC },
        { l: "From path", v: Math.round(pathD) + " px", color: distScore >= 55 ? okC : warnC },
        { l: "Decision", v: decision, color: sC },
      ] : [
        { l: "Site score", v: "- / 100", color: T.mute },
        { l: "Reading", v: "-", color: T.mute },
        { l: "From path", v: "-", color: T.mute },
        { l: "Decision", v: "predict first", color: T.mute },
      ]} />

      <Caption color={C}>
        A sensor is only useful where its readings stand for the area you care about and where it
        will not be knocked or shaded by traffic. Predict a spot first, then drop the sensor to test
        it: parked against the hot pavement or under the cool tree it reports an outlier, not the
        typical conditions; on the foot path it gets disturbed. The representative, undisturbed
        middle ground is the evidence-based choice.
      </Caption>
    </div>
  );
}

/* ---------- TTT-03 One variable at a time ---------- */
function ExtraOneVar() {
  // TTT-03 "One variable at a time" (concept 2). Sibling DemoSamara is the
  // falling-seed physics. This is EXPERIMENT DESIGN: change exactly one variable
  // and the difference in hang time is attributable to it; change none and there
  // is no test; change two or more and the result is confounded.
  const C = CAMP.trees.ink, A = CAMP.trees.acc, brown = "#7a5732";
  const okC = T.ok, warnC = T.warn;
  const [vWing, setVWing] = useState(true);
  const [vMass, setVMass] = useState(false);
  const [vAngle, setVAngle] = useState(false);
  const VARS = [{ k: "wing", on: vWing, eff: 1.5, n: "wing length" }, { k: "mass", on: vMass, eff: -1.1, n: "added mass" }, { k: "angle", on: vAngle, eff: 0.7, n: "fold angle" }];
  const changed = VARS.filter((v) => v.on);
  const n = changed.length;
  const base = 3.0;
  const trial = Math.max(0.4, base + changed.reduce((s, v) => s + v.eff, 0));
  const valid = n === 1 ? "valid test" : n === 0 ? "no test" : "confounded";
  const vC = n === 1 ? okC : n === 0 ? T.mute : warnC;
  const attributed = n === 1 ? changed[0].n : n === 0 ? "nothing changed" : "unclear (" + n + " changed)";

  // seed drawing: same tapered-blade samara as DemoSamara (concept 1), for visual continuity
  const seed = (cx, cy, wl, ms, ang, hl) => { const L = wl, wWid = 5 + (wl - 24) * 0.16, bodyR = 4 + ms * 0.6; return (
    <g transform={"translate(" + cx + " " + cy + ") rotate(" + ang + ")"}>
      <path d={"M 0 0 Q " + (L * 0.5) + " " + (-wWid) + " " + L + " " + (-wWid * 0.4) + " Q " + (L * 0.95) + " 0 " + L + " " + (wWid * 0.4) + " Q " + (L * 0.5) + " " + wWid + " 0 0 Z"} fill={hl.wing ? A : C} opacity="0.92" stroke={T.ink} strokeWidth="0.5" />
      <line x1="0" y1="0" x2={L * 0.88} y2="0" stroke={T.ink} strokeWidth="0.4" opacity="0.5" />
      <ellipse cx="-3" cy="0" rx={bodyR} ry={bodyR * 0.72} fill={hl.mass ? A : brown} stroke={T.ink} strokeWidth="0.5" />
      {hl.angle && <path d="M 9 9 A 12 12 0 0 1 19 2" fill="none" stroke={A} strokeWidth="1.6" />}
    </g>
  ); };
  const baseHL = { wing: false, mass: false, angle: false };
  const trialHL = { wing: vWing, mass: vMass, angle: vAngle };
  const tWl = vWing ? 36 : 24, tMs = vMass ? 8 : 3, tAng = vAngle ? -30 : -12;

  const barW = (t) => Math.max(3, (t / 5.6) * 150);

  return (
    <div>
      <Field height={230}>
        <svg viewBox="0 0 440 230" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>One variable at a time</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>change one thing, or you cannot tell what mattered</text>

          {/* ===== LEFT: baseline vs trial seed ===== */}
          <rect x="16" y="34" width="224" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          <text x="28" y="58" fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>baseline</text>
          {seed(150, 80, 24, 3, -12, baseHL)}
          <line x1="28" y1="112" x2="228" y2="112" stroke={T.rule12} strokeWidth="1" strokeDasharray="3 3" />
          <text x="28" y="134" fill={n === 1 ? okC : n >= 2 ? warnC : T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>trial {"·"} {n} changed</text>
          {seed(150, 158, tWl, tMs, tAng, trialHL)}
          {/* changed tags */}
          <text x="28" y="206" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.06 })}>
            {n ? "changed: " + changed.map((v) => v.k).join(", ") : "changed: none"}
          </text>

          {/* ===== RIGHT: hang time + verdict ===== */}
          <rect x="248" y="34" width="176" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="260" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>hang time</text>
          {/* baseline bar */}
          <text x="260" y="78" fill={T.mute} style={f.mono(600, 8, { upper: true })}>baseline</text>
          <rect x="260" y="84" width={barW(base)} height="14" rx="2" fill={C} opacity="0.55" />
          <text x={264 + barW(base)} y="95" fill={C} style={f.mono(700, 9)}>{base.toFixed(1)}s</text>
          {/* trial bar */}
          <text x="260" y="118" fill={T.mute} style={f.mono(600, 8, { upper: true })}>trial</text>
          <rect x="260" y="124" width={barW(trial)} height="14" rx="2" fill={vC} opacity={n ? 0.9 : 0.4} />
          <text x={264 + barW(trial)} y="135" fill={vC} style={f.mono(700, 9)}>{trial.toFixed(1)}s</text>
          {/* verdict */}
          <rect x="260" y="152" width="150" height="22" rx="4" fill={vC} opacity="0.16" />
          <text x="335" y="167" textAnchor="middle" fill={vC} style={f.mono(700, 10, { upper: true, tracking: 0.06 })}>{valid}</text>
          <text x="260" y="192" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.06 })}>difference due to</text>
          <text x="260" y="205" fill={vC} style={f.mono(700, 9.5)}>{attributed}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small color={vWing ? A : C} active={vWing} onClick={() => setVWing((v) => !v)}>vary wing</Btn>
        <Btn small color={vMass ? A : C} active={vMass} onClick={() => setVMass((v) => !v)}>vary mass</Btn>
        <Btn small color={vAngle ? A : C} active={vAngle} onClick={() => setVAngle((v) => !v)}>vary angle</Btn>
        <Tag color={C} style={{ marginLeft: 2 }}>toggle what changes vs the baseline</Tag>
      </div>

      <Readout items={[
        { l: "Variables changed", v: n, color: vC },
        { l: "Experiment", v: valid, color: vC },
        { l: "Attributed to", v: attributed, color: vC },
        { l: "Trial hang", v: trial.toFixed(1) + "s (" + (trial >= base ? "+" : "") + (trial - base).toFixed(1) + ")", color: C },
      ]} />

      <Caption color={C}>
        To learn what a change does, hold everything constant and alter a single variable, then
        compare to the baseline. Change only the wing and any difference in hang time is the wing's
        doing. Change the wing and the mass at once and the seeds may fly differently, but you can
        no longer say which one caused it: the test is confounded.
      </Caption>
    </div>
  );
}

/* ---------- TTT-04 Material and geometry ---------- */
function ExtraXylem() {
  // TTT-04 "Material and geometry" (concept 2). Sibling DemoCapillary covers
  // capillary rise vs tube bore. This is the DELIVERY problem: pick a wick
  // material and a route (length, slope) to move the most water to the target.
  // A good wick over a short, low route delivers fast; a weak wick up a long
  // climb wastes most of it.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, waterC = "#5a93c9";
  const MATS = [{ id: "felt", n: "felt", r: 0.58 }, { id: "cotton", n: "cotton wick", r: 1.0 }, { id: "paper", n: "paper towel", r: 0.82 }];
  const [mi, setMi] = useState(1);
  const [len, setLen] = useState(3);
  const [rise, setRise] = useState(20);
  const [clk, setClk] = useState(0);
  useRAF(true, (dt) => setClk((v) => (v + dt * 0.001) % 1));
  const mat = MATS[mi];

  const geomF = Math.max(0.05, (1 - (len - 1) / 12) * (1 - rise / 150));
  const rateOf = (mr) => Math.max(3, Math.min(100, Math.round(mr * 100 * geomF)));
  const rate = rateOf(mat.r);
  const bestId = "cotton";
  const losses = [["weak wick", 1 - mat.r], ["long path", (len - 1) / 12], ["steep climb", rise / 150]];
  losses.sort((a, b) => b[1] - a[1]);
  const limit = rate >= 70 ? "well routed" : losses[0][0];

  // route geometry (quadratic bezier source -> apex -> target)
  const groundY = 196;
  const P0 = { x: 46, y: 180 };
  const tx = 138 + len * 8;
  const targetBottom = groundY - rise * 0.9;
  const ty = targetBottom - 20;
  const P2 = { x: tx, y: ty };
  const P1 = { x: (P0.x + tx) / 2, y: Math.max(54, Math.min(P0.y, ty) - 32) };
  const B = (u) => ({ x: (1 - u) * (1 - u) * P0.x + 2 * (1 - u) * u * P1.x + u * u * P2.x, y: (1 - u) * (1 - u) * P0.y + 2 * (1 - u) * u * P1.y + u * u * P2.y });
  const path = "M " + P0.x + " " + P0.y + " Q " + P1.x + " " + P1.y + " " + P2.x + " " + P2.y;
  const spill = rate < 45;

  return (
    <div>
      <Field height={236}>
        <svg viewBox="0 0 440 236" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Material + geometry</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>pick the wick and the route to deliver the most</text>

          {/* ===== LEFT: source, wick route, target cup ===== */}
          <rect x="16" y="34" width="232" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          <text x="24" y="48" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.06 })}>route len {len} {"·"} rise {rise}%</text>
          <line x1="20" y1={groundY} x2="244" y2={groundY} stroke={T.rule22} strokeWidth="1" />
          <path d={path} fill="none" stroke="#caa676" strokeWidth="7" strokeLinecap="round" />
          <path d={path} fill="none" stroke={waterC} strokeWidth="3" strokeLinecap="round" opacity={0.35 + rate / 200} />
          {Array.from({ length: 6 }, (_, i) => {
            const u = (clk * (0.4 + rate / 60) + i / 6) % 1, p = B(u);
            return <circle key={i} cx={p.x} cy={p.y} r="3" fill={waterC} />;
          })}
          {spill && Array.from({ length: 3 }, (_, i) => {
            const p = B(0.5), fall = (clk * 2 + i * 0.33) % 1;
            return <circle key={"sp" + i} cx={p.x + (i - 1) * 5} cy={p.y + 6 + fall * 40} r="1.8" fill={waterC} opacity={0.6 * (1 - fall)} />;
          })}
          {/* source cup */}
          <path d="M30 178 L62 178 L58 196 L34 196 Z" fill={T.paper} stroke={T.ink} strokeWidth="0.8" />
          <path d="M33 187 L59 187 L57 195 L35 195 Z" fill={waterC} opacity="0.5" />
          <text x="46" y="208" textAnchor="middle" fill={T.mute} style={f.mono(600, 7.5, { upper: true })}>source</text>
          {/* target cup (fills with delivery rate) */}
          {targetBottom < groundY - 1 && <line x1={tx} y1={targetBottom} x2={tx} y2={groundY} stroke={T.rule22} strokeWidth="1.5" strokeDasharray="2 2" />}
          <path d={"M " + (tx - 13) + " " + ty + " L " + (tx + 13) + " " + ty + " L " + (tx + 10) + " " + (ty + 20) + " L " + (tx - 10) + " " + (ty + 20) + " Z"} fill={T.paper} stroke={T.ink} strokeWidth="0.8" />
          <path d={"M " + (tx - 13 + 13 * (1 - rate / 100)) + " " + (ty + 20 - 18 * rate / 100) + " L " + (tx + 13 - 13 * (1 - rate / 100)) + " " + (ty + 20 - 18 * rate / 100) + " L " + (tx + 10) + " " + (ty + 20) + " L " + (tx - 10) + " " + (ty + 20) + " Z"} fill={waterC} opacity="0.6" />
          <text x={tx} y={groundY + 12} textAnchor="middle" fill={T.mute} style={f.mono(600, 7.5, { upper: true })}>target</text>

          {/* ===== RIGHT: material comparison ===== */}
          <rect x="258" y="34" width="166" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="270" y="52" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>wick materials</text>
          <text x="270" y="65" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.06 })}>delivery on this route</text>
          {MATS.map((m, k) => {
            const r = rateOf(m.r), cur = k === mi, best = m.id === bestId, y = 92 + k * 34;
            return (
              <g key={m.id}>
                <text x="270" y={y - 5} fill={cur ? C : T.mute} style={f.mono(cur ? 700 : 500, 8.5, { upper: true })}>{m.n}{cur ? "  ◀" : ""}</text>
                <rect x="270" y={y} width="108" height="12" rx="2" fill={T.rule12} />
                <rect x="270" y={y} width={Math.max(2, 108 * r / 100)} height="12" rx="2" fill={best ? okC : cur ? C : A} opacity={cur || best ? 1 : 0.5} />
                <text x="410" y={y + 10} textAnchor="end" fill={cur ? C : T.mute} style={f.mono(700, 8)}>{r}</text>
              </g>
            );
          })}
          <text x="270" y="206" fill={T.mute} style={f.sans(400, 8.5, { lh: 1.3 })}>cotton pulls hardest of the three</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small icon={Droplets} color={C} onClick={() => setMi((v) => (v + 1) % MATS.length)}>{mat.n}</Btn>
        <Slider val={len} set={setLen} min={1} max={10} step={1} color={C} label="Path length" suffix={len} />
        <Slider val={rise} set={setRise} min={0} max={100} step={1} color={A} label="Climb" suffix={rise + "%"} />
      </div>

      <Readout items={[
        { l: "Wick", v: mat.n, color: C },
        { l: "Delivery rate", v: rate, color: rate >= 70 ? okC : rate >= 40 ? A : warnC },
        { l: "Best wick", v: mat.id === bestId ? "this one" : "cotton wick", color: mat.id === bestId ? okC : A },
        { l: "Limiting", v: limit, color: limit === "well routed" ? okC : warnC },
      ]} />

      <Caption color={C}>
        Wicking moves water without a pump, but how fast depends on the material and the route. A
        cotton wick pulls harder than felt, and a short, nearly level path beats a long uphill one
        because gravity and friction fight the climb. To win the relay you match a strong wick to
        the easiest route and lose the least to spill along the way.
      </Caption>
    </div>
  );
}

/* ---------- TTT-05 Controlled environments ---------- */
function ExtraGreenhouse() {
  // TTT-05 "Controlled environments" (concept 1). Sibling ExtraTour matches a
  // plant to a fixed zone. This is active CONTROL with tradeoffs: light and heat
  // both warm the air, and both dry it, so cranking the lamp to hit the light
  // need pushes temp up and humidity down. Balance all three to keep the plant
  // in its comfort bands, or it scorches, wilts, molds, or goes leggy.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, sun = "#cf9b3f", waterC = "#5a93c9";
  const [light, setLight] = useState(55);
  const [heat, setHeat] = useState(25);
  const [water, setWater] = useState(80);
  const [clk, setClk] = useState(0);
  useRAF(true, (dt) => setClk((v) => (v + dt * 0.001) % 1));

  const temp = 14 + heat * 0.18 + light * 0.10;
  const humid = Math.max(0, Math.min(100, water * 0.95 - light * 0.30 - heat * 0.20));
  const lite = light;
  // comfort bands
  const B = { temp: [20, 28], humid: [50, 75], lite: [40, 70] };
  const inB = (v, b) => v >= b[0] && v <= b[1];
  const okT = inB(temp, B.temp), okH = inB(humid, B.humid), okL = inB(lite, B.lite);
  const score = (okT ? 1 : 0) + (okH ? 1 : 0) + (okL ? 1 : 0);
  // dominant stress
  const outs = [];
  if (temp > 28) outs.push(["hot", temp - 28]); if (temp < 20) outs.push(["cold", 20 - temp]);
  if (humid < 50) outs.push(["dry", 50 - humid]); if (humid > 75) outs.push(["wet", humid - 75]);
  if (lite > 70) outs.push(["bright", lite - 70]); if (lite < 40) outs.push(["dim", 40 - lite]);
  outs.sort((a, b) => b[1] - a[1]);
  const worst = outs[0] ? outs[0][0] : null;
  const status = score === 3 ? "thriving"
    : worst === "hot" || worst === "bright" ? "scorching"
    : worst === "dry" ? "wilting" : worst === "wet" ? "molding"
    : worst === "cold" ? "chilled" : "leggy";
  const healthy = status === "thriving";
  const sC = healthy ? okC : warnC;

  // plant posture by status
  const droop = healthy ? -16 : status === "wilting" || status === "scorching" ? 30 : status === "molding" ? 12 : status === "chilled" ? -2 : -16;
  const leaf = healthy ? C : status === "scorching" ? "#8a5a2a" : status === "wilting" ? "#7c854a" : status === "molding" ? "#4f6b3a" : status === "chilled" ? "#4a6a64" : "#9bb87f";
  const sway = Math.sin(clk * 6.28) * (healthy ? 2 : 0.6);

  // climate bar mapping
  const barX0 = 272, barW = 138;
  const mapT = (v) => barX0 + ((v - 14) / 26) * barW;
  const map100 = (v) => barX0 + (v / 100) * barW;
  const bars = [
    { l: "temp", v: temp.toFixed(0) + "°C", ok: okT, x: mapT(temp), lo: mapT(B.temp[0]), hi: mapT(B.temp[1]) },
    { l: "humidity", v: humid.toFixed(0) + "%", ok: okH, x: map100(humid), lo: map100(B.humid[0]), hi: map100(B.humid[1]) },
    { l: "light", v: lite.toFixed(0) + "%", ok: okL, x: map100(lite), lo: map100(B.lite[0]), hi: map100(B.lite[1]) },
  ];

  return (
    <div>
      <Field height={236}>
        <svg viewBox="0 0 440 236" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Controlled environments</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>every setting trades off against the others</text>

          {/* ===== LEFT: greenhouse ===== */}
          <rect x="16" y="34" width="232" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          <path d="M30 196 L30 104 L132 64 L234 104 L234 196 Z" fill={T.paper} opacity="0.6" stroke={T.ink} strokeWidth="0.8" />
          <line x1="30" y1="196" x2="234" y2="196" stroke={T.ink} strokeWidth="1" />
          {/* lamp (inside, under the ridge) */}
          <g transform="translate(132 98)">
            <circle r="8" fill={sun} opacity={0.4 + light / 160} />
            {light > 10 && [0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
              <line key={k} x1={Math.cos(k * 0.785) * 11} y1={Math.sin(k * 0.785) * 11} x2={Math.cos(k * 0.785) * (11 + light / 9)} y2={Math.sin(k * 0.785) * (11 + light / 9)} stroke={sun} strokeWidth="1.2" opacity={0.2 + light / 160} />
            ))}
          </g>
          {/* heater (inside the left wall) */}
          <g transform="translate(62 174)">
            <rect x="-11" y="-7" width="22" height="14" rx="2" fill={heat > 5 ? warnC : T.paper2} opacity={heat > 5 ? 0.35 + heat / 220 : 1} stroke={T.ink} strokeWidth="0.7" />
            {heat > 5 && [-5, 0, 5].map((wx, k) => (<line key={k} x1={wx} y1="-9" x2={wx} y2="-13" stroke={warnC} strokeWidth="1" opacity={0.3 + heat / 200} />))}
          </g>
          {/* mister (inside the right wall) */}
          <g transform="translate(196 116)">
            <rect x="-5" y="-6" width="10" height="8" rx="1.5" fill={T.ink} />
            {water > 5 && Array.from({ length: Math.round(water / 22) }, (_, i) => {
              const u = (clk * 2 + i * 0.3) % 1;
              return <circle key={i} cx={(i - 1.5) * 4} cy={6 + u * 64} r="1.5" fill={waterC} opacity={0.7 * (1 - u)} />;
            })}
          </g>
          {/* plant: rooted on the floor, fully inside the house */}
          <g transform={"translate(132 196) rotate(" + sway + " 0 0)"}>
            <rect x="-16" y="-12" width="32" height="12" rx="2" fill="#8a5a2a" />
            <line x1="0" y1="-12" x2="0" y2={healthy ? -64 : -54} stroke={leaf} strokeWidth="2.6" />
            {[-26, -40, healthy ? -56 : -50].map((ly, k) => (
              <g key={k} transform={"translate(0 " + ly + ")"}>
                <ellipse cx="-12" cy="0" rx="13" ry="5.5" fill={leaf} opacity="0.9" transform={"rotate(" + (-18 + droop) + " -12 0)"} />
                <ellipse cx="12" cy="0" rx="13" ry="5.5" fill={leaf} opacity="0.9" transform={"rotate(" + (18 - droop) + " 12 0)"} />
                {status === "molding" && <><circle cx="-12" cy="0" r="1.4" fill="#2c3a22" /><circle cx="12" cy="-1" r="1.4" fill="#2c3a22" /></>}
              </g>
            ))}
            {healthy && <circle cx="0" cy="-66" r="3.4" fill={A} />}
          </g>

          {/* ===== RIGHT: climate vs comfort ===== */}
          <rect x="258" y="34" width="166" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="270" y="52" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>climate vs comfort</text>
          {bars.map((b, k) => {
            const y = 78 + k * 40;
            return (
              <g key={k}>
                <text x="272" y={y - 8} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.06 })}>{b.l}</text>
                <text x="410" y={y - 8} textAnchor="end" fill={b.ok ? okC : warnC} style={f.mono(700, 9)}>{b.v}</text>
                <line x1={barX0} y1={y} x2={barX0 + barW} y2={y} stroke={T.rule12} strokeWidth="4" strokeLinecap="round" />
                <line x1={b.lo} y1={y} x2={b.hi} y2={y} stroke={okC} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                <circle cx={Math.max(barX0, Math.min(barX0 + barW, b.x))} cy={y} r="4.5" fill={b.ok ? okC : warnC} stroke={T.paper} strokeWidth="1.4" />
              </g>
            );
          })}
          <text x="272" y="184" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.06 })}>green band = comfort zone</text>
          <rect x="270" y="190" width="144" height="22" rx="4" fill={sC} opacity="0.16" />
          <text x="342" y="205" textAnchor="middle" fill={sC} style={f.mono(700, 9, { upper: true, tracking: 0.04 })}>{score}/3 {"·"} {status}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Slider val={light} set={setLight} min={0} max={100} step={1} color={sun} label="Lamp" suffix={light + "%"} />
        <Slider val={heat} set={setHeat} min={0} max={100} step={1} color={A} label="Heater" suffix={heat + "%"} />
        <Slider val={water} set={setWater} min={0} max={100} step={1} color={waterC} label="Mister" suffix={water + "%"} />
      </div>

      <Readout items={[
        { l: "Temp", v: temp.toFixed(0) + " °C", color: okT ? okC : warnC },
        { l: "Humidity", v: humid.toFixed(0) + "%", color: okH ? okC : warnC },
        { l: "Light", v: lite.toFixed(0) + "%", color: okL ? okC : warnC },
        { l: "Plant", v: status, color: sC },
      ]} />

      <Caption color={C}>
        A greenhouse lets you set light, heat, and moisture to match a plant, but the settings are
        coupled: the lamp and heater both warm the air and dry it out. Crank the light to brighten
        a shade-starved plant and you can cook or parch it instead. The skill is balancing all
        three so temperature, humidity, and light all land in the comfort zone at once.
      </Caption>
    </div>
  );
}

/* ---------- TTT-05 Evidence from the tour ---------- */
function ExtraTour() {
  // TTT-05 "Evidence from the tour" (concept 2). Sibling ExtraGreenhouse is the
  // single closed-loop control. This is EVIDENCE-BASED placement: the tour gives
  // each zone's measured temp, humidity, and light; you place a plant in the
  // zone whose readings match its needs, not by guessing.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, hC = "#5a93c9", lC = "#cf9b3f";
  const PLANTS = [
    { id: "fern", n: "Fern", T: 38, H: 82, L: 30 },
    { id: "orchid", n: "Orchid", T: 60, H: 68, L: 52 },
    { id: "cactus", n: "Cactus", T: 82, H: 16, L: 90 },
  ];
  const ZONES = [
    { id: "mist", n: "Cool Mist", T: 34, H: 86, L: 34 },
    { id: "bench", n: "Warm Bench", T: 62, H: 62, L: 56 },
    { id: "desert", n: "Desert Shelf", T: 84, H: 18, L: 88 },
    { id: "shade", n: "Shade Corner", T: 52, H: 50, L: 22 },
  ];
  const [pi, setPi] = useState(0);
  const [pick, setPick] = useState(null);
  const plant = PLANTS[pi];

  const fac = (a, b) => Math.max(0, 1 - Math.abs(a - b) / 45);
  const fit = (z) => Math.round(((fac(plant.T, z.T) + fac(plant.H, z.H) + fac(plant.L, z.L)) / 3) * 100);
  const fits = ZONES.map(fit);
  const bestIdx = fits.indexOf(Math.max(...fits));
  const pickedZone = pick != null ? ZONES.find((z) => z.id === pick) : null;
  const pickedFit = pickedZone ? fit(pickedZone) : null;
  const verdict = () => {
    if (!pickedZone) return "pick a zone";
    if (pickedFit >= 80) return "thrives";
    if (pickedFit >= 55) return "gets by";
    const d = [["T", pickedZone.T - plant.T], ["H", pickedZone.H - plant.H], ["L", pickedZone.L - plant.L]].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    if (d[0] === "T") return d[1] > 0 ? "too hot" : "too cold";
    if (d[0] === "H") return d[1] > 0 ? "too damp" : "too dry";
    return d[1] > 0 ? "scorched" : "too dim";
  };
  const vC = !pickedZone ? T.mute : pickedFit >= 80 ? okC : pickedFit >= 55 ? A : warnC;

  return (
    <div>
      <Field height={244}>
        <svg viewBox="0 0 440 244" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Evidence from the tour</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>read each zone, then place the plant on the evidence</text>

          {/* ===== zone cards (the tour readings) ===== */}
          {ZONES.map((z, i) => {
            const cx = 18 + (i % 2) * 108, cy = 36 + Math.floor(i / 2) * 90;
            const picked = pick === z.id, best = i === bestIdx;
            const bars = [["T", z.T, A], ["H", z.H, hC], ["L", z.L, lC]];
            return (
              <g key={z.id} data-zone={z.id} style={{ cursor: "pointer" }} onClick={() => setPick(z.id)}>
                <rect x={cx} y={cy} width="100" height="82" rx="3" fill={T.paper} stroke={picked ? C : T.rule12} strokeWidth={picked ? 1.8 : 1} />
                <text x={cx + 8} y={cy + 15} fill={C} style={f.mono(700, 8.5, { upper: true, tracking: 0.04 })}>{z.n}</text>
                <text x={cx + 92} y={cy + 15} textAnchor="end" fill={best ? okC : T.mute} style={f.mono(700, 8.5)}>{fits[i]}%</text>
                {bars.map((b, k) => {
                  const bx = cx + 26 + k * 26, bt = cy + 26, bh = 44, fh = (b[1] / 100) * bh;
                  return (
                    <g key={k}>
                      <rect x={bx - 6} y={bt} width="12" height={bh} rx="1.5" fill={T.rule12} />
                      <rect x={bx - 6} y={bt + bh - fh} width="12" height={fh} rx="1.5" fill={b[2]} />
                      <text x={bx} y={cy + 80} textAnchor="middle" fill={T.mute} style={f.mono(600, 7)}>{b[0]}</text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* ===== plant panel ===== */}
          <rect x="238" y="36" width="186" height="172" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          <text x="250" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>place this plant</text>
          <text x="250" y="76" fill={C} style={f.display(600, 20, { opsz: 40 })}>{plant.n}</text>
          {/* glyph */}
          <g transform="translate(366 50)">
            <path d="M -12 22 L 12 22 L 9 38 L -9 38 Z" fill="#8a5a2a" />
            <ellipse cx="-7" cy="12" rx="11" ry="5" fill={C} opacity="0.85" transform="rotate(-28 -7 12)" />
            <ellipse cx="7" cy="10" rx="11" ry="5" fill={C} opacity="0.85" transform="rotate(28 7 10)" />
            <ellipse cx="0" cy="4" rx="6" ry="11" fill={C} opacity="0.9" />
          </g>
          {/* need bars: ideal (plant) vs picked zone */}
          {[["temp", plant.T, pickedZone && pickedZone.T, A], ["humid", plant.H, pickedZone && pickedZone.H, hC], ["light", plant.L, pickedZone && pickedZone.L, lC]].map((r, k) => {
            const y = 110 + k * 22, x0 = 300, w = 112;
            const mIdeal = x0 + (r[1] / 100) * w;
            return (
              <g key={k}>
                <text x="250" y={y + 3} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.06 })}>{r[0]}</text>
                <line x1={x0} y1={y} x2={x0 + w} y2={y} stroke={T.rule22} strokeWidth="3" strokeLinecap="round" />
                <circle cx={mIdeal} cy={y} r="4" fill={r[3]} stroke={T.paper} strokeWidth="1" />
                {r[2] != null && <path d={"M " + (x0 + (r[2] / 100) * w) + " " + (y - 9) + " l -4 -5 l 8 0 Z"} fill={C} />}
              </g>
            );
          })}
          <text x="250" y="166" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.06 })}>{"●"} need  {"▾"} zone</text>
          <rect x="248" y="178" width="166" height="24" rx="4" fill={vC} opacity="0.16" />
          <text x="331" y="194" textAnchor="middle" fill={vC} style={f.mono(700, 10, { upper: true, tracking: 0.04 })}>{pickedZone ? verdict() + "  " + pickedFit + "%" : "pick a zone"}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small icon={Leaf} color={C} onClick={() => { setPi((v) => (v + 1) % PLANTS.length); setPick(null); }}>next plant</Btn>
        <Btn small icon={RotateCcw} color={C} onClick={() => setPick(null)}>clear pick</Btn>
        <Tag color={C} style={{ marginLeft: 2 }}>click a zone to place {plant.n.toLowerCase()}</Tag>
      </div>

      <Readout items={[
        { l: "Plant", v: plant.n, color: C },
        { l: "Placed in", v: pickedZone ? pickedZone.n : "-", color: pickedZone ? C : T.mute },
        { l: "Fit", v: pickedFit != null ? pickedFit + "%" : "-", color: vC },
        { l: "Verdict", v: verdict(), color: vC },
      ]} />

      <Caption color={C}>
        On the tour you record each zone's real temperature, humidity, and light, then place a
        plant where the readings match its needs. That is evidence over guesswork: a fern wants the
        cool, damp, shaded corner, while a cactus wants the hot, dry, bright shelf. Put a plant in
        the wrong zone and the numbers tell you exactly how it will suffer.
      </Caption>
    </div>
  );
}

/* ---------- TTT-06 Hygromorphs ---------- */
function ExtraPinecone() {
  // TTT-06 "Hygromorphs" (concept 1). Sibling ExtraBilayer is the engineered
  // strip + dial. This is the NATURAL cone and its seed-dispersal strategy: it
  // opens in dry air to fling winged seeds on the breeze, and seals shut when
  // humid to hold them for a better day. No motor, no power, just material.
  // The breeze is drifting streamlines bounded inside the box, and the cone is a
  // teardrop of overlapping rounded scales that splay open when the air is dry.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, wood = "#6e4a26", woodD = "#3e2a14", woodH = "#a9793f";
  const [humid, setHumid] = useState(35);
  const [playing, setPlaying] = useState(true);
  const [clk, setClk] = useState(0);
  useRAF(playing, (dt) => setClk((v) => (v + dt * 0.0006) % 1));

  const open = Math.max(0, Math.min(1, (75 - humid) / 55));
  const state = open >= 0.66 ? "open" : open >= 0.28 ? "ajar" : "closed";
  const releasing = open >= 0.5;
  const aloft = releasing ? Math.round(open * 6) : 0;
  const strat = releasing ? "dry: release seeds" : "humid: hold seeds";

  const rows = Array.from({ length: 9 }, (_, r) => r);
  // response curve
  const cX0 = 280, cX1 = 410, cY0 = 72, cY1 = 150;
  const px = (h) => cX0 + ((h - 20) / 75) * (cX1 - cX0);
  const py = (o) => cY1 - o * (cY1 - cY0);
  const curve = Array.from({ length: 31 }, (_, i) => { const h = 20 + i * 2.5; const o = Math.max(0, Math.min(1, (75 - h) / 55)); return px(h) + "," + py(o); }).join(" ");

  // contained drifting breeze (traveling sine; arrowheads stay inside the box)
  const wPhase = clk * 6.2832 * 2;
  const streamPts = (yB, x0, x1, amp, kk) => { let o = ""; for (let x = x0; x <= x1; x += 6) { const yy = yB + amp * Math.sin(kk * (x - x0) - wPhase); o += x.toFixed(1) + "," + yy.toFixed(1) + " "; } return o.trim(); };
  const breeze = [{ y: 56, x0: 168, x1: 240, amp: 4, k: 0.07 }, { y: 80, x0: 168, x1: 240, amp: 5, k: 0.06 }, { y: 104, x0: 172, x1: 238, amp: 4, k: 0.07 }];

  return (
    <div>
      <Field height={226}>
        <svg viewBox="0 0 440 226" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Hygromorphs</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>a cone that opens and closes with no power</text>

          {/* ===== LEFT: the cone ===== */}
          <rect x="16" y="34" width="232" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {/* drifting breeze, only when dry/open, fully inside the box */}
          {open > 0.4 && breeze.map((sm, i) => { const pts = streamPts(sm.y, sm.x0, sm.x1, sm.amp, sm.k); const ye = sm.y + sm.amp * Math.sin(sm.k * (sm.x1 - sm.x0) - wPhase); return (
            <g key={"br" + i} opacity={0.3 + open * 0.3}>
              <polyline points={pts} fill="none" stroke={T.mute} strokeWidth="1" strokeLinecap="round" />
              <polygon points={(sm.x1 + 5).toFixed(1) + "," + ye.toFixed(1) + " " + sm.x1.toFixed(1) + "," + (ye - 2.6).toFixed(1) + " " + sm.x1.toFixed(1) + "," + (ye + 2.6).toFixed(1)} fill={T.mute} />
            </g>
          ); })}
          {/* drifting winged seeds when releasing */}
          {playing && releasing && Array.from({ length: aloft }, (_, i) => {
            const u = (clk + i * 0.17) % 1;
            const sx = 150 + u * 84, sy = 110 - u * 64 + Math.sin((clk + i) * 6.2) * 4;
            return (
              <g key={"sd" + i} opacity={0.9 * (1 - u)}>
                <line x1={sx - 6} y1={sy - 3} x2={sx} y2={sy} stroke="#b89a5e" strokeWidth="1.4" />
                <circle cx={sx} cy={sy} r="1.8" fill={woodD} />
              </g>
            );
          })}
          {/* stem */}
          <line x1="120" y1="70" x2="120" y2="60" stroke={woodD} strokeWidth="2.6" />
          {/* cone: teardrop body (dark gaps) + overlapping rounded scales */}
          <g transform="translate(120 122)">
            <ellipse cx="0" cy="0" rx="13" ry="44" fill={woodD} />
            {rows.map((r) => {
              const ry0 = -42 + r * 10.5;
              const rs = 1 - Math.abs(r - 4) / 5.4;
              const ext = 4 + open * (16 * rs + 4);
              const lift = open * (3 + r * 0.3);
              return [-1, 1].map((side) => {
                const bx = -2 * side, tx = (15 * rs + ext) * side, ty = ry0 - lift, mx = (bx + tx) / 2;
                return (
                  <g key={r + "_" + side}>
                    <path d={"M " + bx + " " + (ry0 - 3) + " Q " + mx + " " + (ty - 6) + " " + tx + " " + (ty - 1) + " Q " + (tx + 3 * side) + " " + (ty + 2.5) + " " + tx + " " + (ty + 6) + " Q " + mx + " " + (ry0 + 9) + " " + bx + " " + (ry0 + 6) + " Z"} fill={wood} stroke={woodD} strokeWidth="0.7" />
                    <path d={"M " + bx + " " + (ry0 - 1) + " Q " + mx + " " + (ty - 3.5) + " " + (tx - 2 * side) + " " + (ty - 0.5)} fill="none" stroke={woodH} strokeWidth="0.9" opacity="0.7" />
                  </g>
                );
              });
            })}
            <ellipse cx="0" cy="-46" rx="4.5" ry="6.5" fill={wood} stroke={woodD} strokeWidth="0.6" />
          </g>
          <text x="120" y="208" textAnchor="middle" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>
            {state === "open" ? "wide open → seeds fly" : state === "ajar" ? "ajar" : "sealed → seeds held"}
          </text>

          {/* ===== RIGHT: response curve ===== */}
          <rect x="258" y="34" width="166" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="270" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>opens when dry</text>
          <line x1={cX0} y1={cY1} x2={cX1} y2={cY1} stroke={T.rule22} strokeWidth="1" />
          <line x1={cX0} y1={cY0} x2={cX0} y2={cY1} stroke={T.rule22} strokeWidth="1" />
          <polyline points={curve} fill="none" stroke={C} strokeWidth="2" />
          <line x1={px(humid)} y1={cY0} x2={px(humid)} y2={cY1} stroke={T.mute} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.7" />
          <circle cx={px(humid)} cy={py(open)} r="4.5" fill={A} stroke={T.paper} strokeWidth="1.5" />
          <text x={cX0 - 4} y={cY0 + 4} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5)}>open</text>
          <text x={cX0 - 4} y={cY1} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5)}>shut</text>
          <text x={cX0} y={cY1 + 13} fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>dry</text>
          <text x={cX1} y={cY1 + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>humid</text>
          {/* dispersal badge */}
          <rect x="270" y="176" width="140" height="26" rx="4" fill={releasing ? okC : warnC} opacity="0.16" />
          <text x="340" y="193" textAnchor="middle" fill={releasing ? okC : warnC} style={f.mono(700, 10, { upper: true, tracking: 0.06 })}>{releasing ? "releasing seeds" : "holding seeds"}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Slider val={humid} set={setHumid} min={20} max={95} step={1} color={C} label="Humidity" suffix={humid + "%"} />
        <Btn small icon={playing ? Pause : Play} color={C} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "breezy" : "still"}</Btn>
      </div>

      <Readout items={[
        { l: "Scale opening", v: Math.round(open * 100) + "%", color: open >= 0.5 ? okC : A },
        { l: "State", v: state, color: state === "open" ? okC : state === "closed" ? warnC : A },
        { l: "Seeds aloft", v: aloft, color: aloft > 0 ? okC : T.mute },
        { l: "Strategy", v: strat, color: C },
      ]} />

      <Caption color={C}>
        A pine cone is a smart material with no moving parts. Each woody scale is two layers that
        swell by different amounts, so in dry air the scales bend open and the winged seeds spill
        out to catch a breeze, while damp air swells them shut to hold the seeds until conditions
        improve. Dry and breezy is the best time to fly, so the cone waits for it on its own.
      </Caption>
    </div>
  );
}

/* ---------- TTT-06 Bilayer biomimicry ---------- */
function ExtraBilayer() {
  // TTT-06 "Bilayer biomimicry" (concept 2). Sibling ExtraPinecone is the
  // natural cone. This is the ENGINEERED bilayer: one layer absorbs water and
  // grows, the other stays put, so the strip curls. Read the curl off a dial to
  // get a humidity signal. Tune the layer mismatch so the needle reads true.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const [humid, setHumid] = useState(70);
  const [mismatch, setMismatch] = useState(1.0);

  const thetaDeg = (humid - 20) * mismatch * 1.05;
  const reading = Math.max(15, Math.min(98, Math.round(20 + (humid - 20) * mismatch)));
  const err = reading - humid;
  const cal = Math.abs(err) <= 4 ? "calibrated" : err < 0 ? "under-reads" : "over-reads";
  const calC = Math.abs(err) <= 4 ? okC : warnC;

  // ---- curling bilayer geometry (circular arc) ----
  const L = 150, tk = 11, ax = 56, ay = 58;
  const th = Math.max(0.0001, thetaDeg * Math.PI / 180);
  const R = L / th, Npt = 22;
  const cl = [], outer = [], inner = [], norm = [];
  for (let k = 0; k <= Npt; k++) {
    const s = (k / Npt) * L, phi = (s / L) * th;
    const x = ax + R * Math.sin(phi), y = ay + R * (1 - Math.cos(phi));
    const nx = Math.sin(phi), ny = -Math.cos(phi);
    cl.push([x, y]); outer.push([x + nx * tk / 2, y + ny * tk / 2]); inner.push([x - nx * tk / 2, y - ny * tk / 2]); norm.push([nx, ny]);
  }
  const j = (a) => a.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ");
  const topPath = "M " + j(outer) + " L " + j(cl.slice().reverse()) + " Z";
  const botPath = "M " + j(cl) + " L " + j(inner.slice().reverse()) + " Z";
  const tip = cl[Npt];
  const nDrop = Math.round(Math.max(0, (humid - 25) / 11));

  // ---- dial ----
  const cx = 338, cy = 150, rD = 64;
  const ang = (r) => Math.PI - ((Math.max(20, Math.min(95, r)) - 20) / 75) * Math.PI;
  const onRim = (r, rad) => [cx + Math.cos(ang(r)) * rad, cy - Math.sin(ang(r)) * rad];
  const needle = onRim(reading, rD * 0.84);
  const trueM = onRim(humid, rD);

  return (
    <div>
      <Field height={226}>
        <svg viewBox="0 0 440 226" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Bilayer biomimicry</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>two layers swell unequally, so the strip curls</text>

          {/* ===== LEFT: curling bilayer ===== */}
          <rect x="16" y="34" width="222" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {/* clamp / mount */}
          <rect x={ax - 12} y={ay - 16} width="12" height="32" rx="2" fill={T.ink} />
          {/* dry reference ghost */}
          <rect x={ax} y={ay - tk / 2} width={L} height={tk} rx="2" fill="none" stroke={T.rule22} strokeWidth="1" strokeDasharray="3 3" />
          {/* bilayer */}
          <path d={botPath} fill={C} />
          <path d={topPath} fill={A} />
          {/* absorbed-water droplets on the active (top) layer */}
          {Array.from({ length: nDrop }, (_, i) => {
            const idx = Math.min(outer.length - 1, 3 + i * 3), p = outer[idx], nrm = norm[idx];
            return <circle key={i} cx={p[0] + nrm[0] * 3} cy={p[1] + nrm[1] * 3} r="1.7" fill="#5a93c9" opacity="0.8" />;
          })}
          {/* tip dot */}
          <circle cx={tip[0]} cy={tip[1]} r="3" fill={A} stroke={T.ink} strokeWidth="0.8" />
          {/* legend */}
          <g>
            <rect x="24" y="196" width="9" height="7" fill={A} /><text x="37" y="203" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>wet layer grows</text>
            <rect x="150" y="196" width="9" height="7" fill={C} /><text x="163" y="203" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>dry layer</text>
          </g>

          {/* ===== RIGHT: hygrometer dial ===== */}
          <rect x="250" y="34" width="174" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="338" y="52" textAnchor="middle" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>humidity dial</text>
          {/* rim */}
          <path d={"M " + (cx - rD) + " " + cy + " A " + rD + " " + rD + " 0 0 1 " + (cx + rD) + " " + cy} fill="none" stroke={T.rule22} strokeWidth="1.4" />
          {/* ticks */}
          {[20, 40, 60, 80, 95].map((r) => {
            const a = onRim(r, rD), b = onRim(r, rD - 7), lb = onRim(r, rD - 17);
            return (
              <g key={r}>
                <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={T.mute} strokeWidth="1" />
                <text x={lb[0]} y={lb[1] + 3} textAnchor="middle" fill={T.mute} style={f.mono(500, 7.5)}>{r}</text>
              </g>
            );
          })}
          {/* true-humidity target marker */}
          <circle cx={trueM[0]} cy={trueM[1]} r="3" fill="none" stroke={C} strokeWidth="1.6" />
          <text x={cx} y="78" textAnchor="middle" fill={C} style={f.mono(500, 7.5, { upper: true })}>{"○"} true {humid}%</text>
          {/* needle */}
          <line x1={cx} y1={cy} x2={needle[0]} y2={needle[1]} stroke={A} strokeWidth="2.4" />
          <circle cx={cx} cy={cy} r="4" fill={A} />
          {/* reading */}
          <text x={cx} y="182" textAnchor="middle" fill={calC} style={f.display(700, 24, { opsz: 48 })}>{reading}%</text>
          <text x={cx} y="200" textAnchor="middle" fill={calC} style={f.mono(700, 9, { upper: true, tracking: 0.08 })}>{cal}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Slider val={humid} set={setHumid} min={20} max={95} step={1} color={C} label="Humidity" suffix={humid + "%"} />
        <Slider val={mismatch} set={setMismatch} min={0.3} max={1.7} step={0.1} color={A} label="Layer mismatch" suffix={mismatch.toFixed(1) + "x"} />
      </div>

      <Readout items={[
        { l: "Humidity", v: humid + "%", color: C },
        { l: "Strip curl", v: Math.round(thetaDeg) + "°", color: A },
        { l: "Dial reads", v: reading + "%", color: calC },
        { l: "Calibration", v: cal, color: calC },
      ]} />

      <Caption color={C}>
        Glue a layer that drinks in moisture to one that does not, and rising humidity makes the
        wet layer grow longer than the dry one, so the strip curls. A needle on the curl turns that
        bend into a humidity reading, no battery needed. The trick is tuning the layer mismatch:
        swell too little and it under-reads, too much and it over-reads. Get it right and it tracks
        true humidity.
      </Caption>
    </div>
  );
}

/* ---------- TTT-07 Networks, not single plants ---------- */
function ExtraPollinatorNet() {
  // TTT-07 "Networks, not single plants" (concept 1). Sibling ExtraClump is the
  // spatial foraging model. This is the SEASONAL network: pollinators need food
  // all season, so a habitat must have something in bloom from spring to fall.
  // Toggle plants and watch the bloom calendar; a gap with no flowers starves
  // the pollinators active then.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const PLANTS = [
    { id: "willow", n: "willow", s: 0.00, e: 0.20 },
    { id: "clover", n: "clover", s: 0.18, e: 0.50 },
    { id: "coneflower", n: "coneflower", s: 0.38, e: 0.64 },
    { id: "beebalm", n: "bee balm", s: 0.52, e: 0.74 },
    { id: "goldenrod", n: "goldenrod", s: 0.66, e: 0.88 },
    { id: "aster", n: "aster", s: 0.80, e: 1.00 },
  ];
  const POLL = [
    { n: "mason bee", s: 0.00, e: 0.34 },
    { n: "honeybee", s: 0.06, e: 0.96 },
    { n: "butterfly", s: 0.44, e: 1.00 },
  ];
  const [on, setOn] = useState(() => PLANTS.map((p) => p.id));
  const [playing, setPlaying] = useState(true);
  const [clk, setClk] = useState(0);
  useRAF(playing, (dt) => setClk((v) => (v + dt * 0.00016) % 1));
  const toggle = (id) => setOn((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const sel = PLANTS.filter((p) => on.includes(p.id));

  // coverage sampling
  const M = 120;
  const cov = Array.from({ length: M + 1 }, (_, k) => sel.some((p) => k / M >= p.s && k / M <= p.e));
  const covPct = Math.round((cov.filter(Boolean).length / (M + 1)) * 100);
  // runs for the food strip
  const runs = []; let st = 0;
  for (let k = 1; k <= M; k++) { if (cov[k] !== cov[st] || k === M) { runs.push({ a: st / M, b: k / M, c: cov[st] }); st = k; } }
  // biggest gap (weeks, season ~ 32 wk)
  let gap = 0, run = 0;
  for (let k = 0; k <= M; k++) { if (!cov[k]) { run++; gap = Math.max(gap, run); } else run = 0; }
  const gapWk = Math.round((gap / M) * 32);
  // pollinators fed (whole active window covered)
  const fed = POLL.filter((p) => { for (let k = 0; k <= M; k++) { const x = k / M; if (x >= p.s && x <= p.e && !cov[k]) return false; } return true; });

  const X0 = 126, X1 = 422, W = X1 - X0;
  const px = (f) => X0 + f * W;
  const tier = covPct >= 95 ? okC : covPct >= 70 ? A : warnC;

  return (
    <div>
      <Field height={228}>
        <svg viewBox="0 0 440 228" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Networks, not single plants</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>something must bloom from spring to fall</text>

          {/* season bands */}
          {[["spring", X0, px(0.34)], ["summer", px(0.34), px(0.67)], ["fall", px(0.67), X1]].map((b, i) => (
            <text key={i} x={(b[1] + b[2]) / 2} y="44" textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>{b[0]}</text>
          ))}
          <line x1={px(0.34)} y1="48" x2={px(0.34)} y2="190" stroke={T.rule12} strokeWidth="0.8" strokeDasharray="2 3" />
          <line x1={px(0.67)} y1="48" x2={px(0.67)} y2="190" stroke={T.rule12} strokeWidth="0.8" strokeDasharray="2 3" />

          {/* plant rows (click to toggle) */}
          {PLANTS.map((p, i) => {
            const y = 60 + i * 18, isOn = on.includes(p.id);
            const blooming = isOn && clk >= p.s && clk <= p.e;
            return (
              <g key={p.id} data-plant={p.id} style={{ cursor: "pointer" }} onClick={() => toggle(p.id)}>
                <circle cx="24" cy={y - 3} r="3.2" fill={isOn ? C : "none"} stroke={isOn ? C : T.rule22} strokeWidth="1" />
                <text x="34" y={y} fill={isOn ? T.ink : T.mute}
                  style={{ ...f.sans(isOn ? 600 : 400, 11), textDecoration: isOn ? "none" : "line-through" }}>{p.n}</text>
                {isOn ? (
                  <rect x={px(p.s)} y={y - 9} width={Math.max(2, (p.e - p.s) * W)} height="11" rx="2.5"
                    fill={C} opacity={blooming ? 1 : 0.62} stroke={blooming ? A : "none"} strokeWidth={blooming ? 1.4 : 0} />
                ) : (
                  <rect x={px(p.s)} y={y - 9} width={Math.max(2, (p.e - p.s) * W)} height="11" rx="2.5"
                    fill="none" stroke={T.rule22} strokeWidth="1" strokeDasharray="3 3" />
                )}
              </g>
            );
          })}

          {/* food availability strip */}
          <text x="34" y="182" textAnchor="end" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>food</text>
          {runs.map((r, i) => (
            <rect key={i} x={px(r.a)} y="172" width={Math.max(0.5, (r.b - r.a) * W)} height="12"
              fill={r.c ? okC : warnC} opacity={r.c ? 0.85 : 0.9} />
          ))}
          {runs.filter((r) => !r.c && (r.b - r.a) > 0.04).map((r, i) => (
            <text key={"g" + i} x={px((r.a + r.b) / 2)} y="181" textAnchor="middle" fill={T.paper} style={f.mono(700, 7, { upper: true })}>gap</text>
          ))}

          {/* time cursor */}
          <line x1={px(clk)} y1="48" x2={px(clk)} y2="190" stroke={A} strokeWidth="1.4" />
          <circle cx={px(clk)} cy="48" r="3" fill={A} />
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small icon={playing ? Pause : Play} color={C} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "season running" : "paused"}</Btn>
        <Btn small icon={RotateCcw} color={C} onClick={() => setOn(PLANTS.map((p) => p.id))}>all plants</Btn>
        <Tag color={C} style={{ marginLeft: 2 }}>click a plant to add or remove</Tag>
      </div>

      <Readout items={[
        { l: "Season covered", v: covPct + "%", color: tier },
        { l: "Biggest gap", v: gapWk === 0 ? "none" : gapWk + " wk", color: gapWk === 0 ? okC : warnC },
        { l: "Pollinators fed", v: fed.length + " / " + POLL.length, color: fed.length === POLL.length ? okC : warnC },
        { l: "In habitat", v: sel.length + " / " + PLANTS.length, color: C },
      ]} />

      <Caption color={C}>
        A pollinator habitat is a network across time, not a single showy bloom. Bees and
        butterflies need food every week they are active, so plants must hand off through spring,
        summer, and fall. Drop one and a gap can open in the calendar; any pollinator flying during
        that gap goes hungry. Aim for continuous bloom, not just the prettiest day.
      </Caption>
    </div>
  );
}

/* ---------- TTT-07 Native and clumping logic ---------- */
function ExtraClump() {
  // TTT-07 "Native and clumping logic" (concept 2). Sibling ExtraPollinatorNet
  // is the pollinator-flower network. This is FORAGING EFFICIENCY: a bee works a
  // nearest-flower route. Clumped planting shortens the hops, so the bee spends
  // its time feeding and visits many flowers; scattered planting wastes time in
  // flight. Clumping cuts the search/travel cost.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, bee = "#d39a3a";
  const [clump, setClump] = useState(100);
  const [playing, setPlaying] = useState(true);
  const [clk, setClk] = useState(0);

  const N = 15;
  const t = clump / 100;
  const pos = Array.from({ length: N }, (_, i) => {
    const sx = 30 + (0.5 + 0.5 * Math.sin(i * 12.9898 + 1)) * 206;
    const sy = 54 + (0.5 + 0.5 * Math.sin(i * 78.233 + 2)) * 148;
    const cx = 135 + Math.sin(i * 5.1) * 34, cy = 130 + Math.cos(i * 3.7) * 30;
    return { x: sx + (cx - sx) * t, y: sy + (cy - sy) * t };
  });

  // nearest-neighbor foraging tour
  const order = [0]; const used = new Set([0]); let cur = 0, tourLen = 0;
  while (order.length < N) {
    let best = -1, bd = 1e9;
    for (let j = 0; j < N; j++) {
      if (used.has(j)) continue;
      const d = Math.hypot(pos[j].x - pos[cur].x, pos[j].y - pos[cur].y);
      if (d < bd) { bd = d; best = j; }
    }
    order.push(best); used.add(best); tourLen += bd; cur = best;
  }
  const avgHop = tourLen / (N - 1);
  const feedT = 2.0, flyPerPx = 0.045;
  const tPer = feedT + avgHop * flyPerPx;
  const perMin = Math.round(60 / tPer);
  const feedPct = Math.round((feedT / tPer) * 100);
  const flyPct = 100 - feedPct;
  const layout = clump < 34 ? "scattered" : clump < 67 ? "mixed" : "clumped";

  useRAF(playing, (dt) => setClk((v) => (v + dt * 0.00018) % 1));

  // bee position along the tour
  const target = clk * tourLen; let acc = 0, bx = pos[order[0]].x, by = pos[order[0]].y, vis = 1;
  for (let k = 0; k < order.length - 1; k++) {
    const aP = pos[order[k]], bP = pos[order[k + 1]], d = Math.hypot(bP.x - aP.x, bP.y - aP.y);
    if (acc + d >= target) { const fr = (target - acc) / (d || 1); bx = aP.x + (bP.x - aP.x) * fr; by = aP.y + (bP.y - aP.y) * fr; vis = k + 1; break; }
    acc += d; bx = bP.x; by = bP.y; vis = k + 2;
  }
  const trail = order.slice(0, vis).map((idx) => pos[idx].x + "," + pos[idx].y).join(" ") + " " + bx + "," + by;

  return (
    <div>
      <Field height={226}>
        <svg viewBox="0 0 440 226" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="16" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Native + clumping logic</text>
          <text x="20" y="28" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.1 })}>a bee works the nearest flower next</text>

          {/* ===== LEFT: garden + foraging route ===== */}
          <rect x="16" y="34" width="236" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {/* bee trail */}
          <polyline points={trail} fill="none" stroke={A} strokeWidth="1.3" opacity="0.5" strokeLinejoin="round" />
          {/* flowers */}
          {pos.map((p, i) => {
            const done = order.slice(0, vis).includes(i);
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill={C} opacity={done ? 1 : 0.8} style={{ transition: "cx .4s, cy .4s" }} />
                {done && <circle cx={p.x} cy={p.y} r="2" fill={A} style={{ transition: "cx .4s, cy .4s" }} />}
              </g>
            );
          })}
          {/* bee */}
          <g style={{ transition: "none" }}>
            <ellipse cx={bx - 2.5} cy={by - 3} rx="3" ry="1.8" fill="#e7e0cf" opacity="0.9" transform={"rotate(-25 " + bx + " " + by + ")"} />
            <ellipse cx={bx + 2.5} cy={by - 3} rx="3" ry="1.8" fill="#e7e0cf" opacity="0.9" transform={"rotate(25 " + bx + " " + by + ")"} />
            <circle cx={bx} cy={by} r="3.6" fill={bee} stroke={T.ink} strokeWidth="0.8" />
          </g>

          {/* ===== RIGHT: foraging budget ===== */}
          <rect x="260" y="34" width="164" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="272" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>foraging rate</text>
          <text x="272" y="88" fill={perMin >= 14 ? okC : warnC} style={f.display(700, 27, { opsz: 54 })}>{perMin}</text>
          <text x="272" y="104" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.08 })}>flowers per minute</text>
          {/* time budget */}
          <text x="272" y="130" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.1 })}>time budget</text>
          <rect x="272" y="136" width={Math.max(0, 138 * feedPct / 100)} height="14" rx="2" fill={okC} />
          <rect x={272 + 138 * feedPct / 100} y="136" width={Math.max(0, 138 * flyPct / 100)} height="14" rx="2" fill={A} opacity="0.85" />
          <text x="272" y="166" fill={okC} style={f.mono(700, 9)}>{feedPct}% feeding</text>
          <text x="410" y="166" textAnchor="end" fill={A} style={f.mono(700, 9)}>{flyPct}% flying</text>
          <text x="272" y="192" fill={T.ink} style={f.mono(600, 9.5)}>avg hop {Math.round(avgHop)} px</text>
          <text x="272" y="208" fill={T.mute} style={f.sans(400, 8.5, { lh: 1.3 })}>less travel, more feeding</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Slider val={clump} set={setClump} min={0} max={100} step={1} color={C} label="Clumping" suffix={clump + "%"} />
        <Btn small icon={playing ? Pause : Play} color={C} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "foraging" : "paused"}</Btn>
      </div>

      <Readout items={[
        { l: "Flowers / min", v: perMin, color: perMin >= 14 ? okC : warnC },
        { l: "Layout", v: layout, color: clump >= 67 ? okC : clump < 34 ? warnC : A },
        { l: "Avg hop", v: Math.round(avgHop) + " px", color: C },
        { l: "Feeding", v: feedPct + "%", color: feedPct >= 55 ? okC : warnC },
      ]} />

      <Caption color={C}>
        A pollinator works the nearest flower it can find, so the layout decides how much time it
        wastes flying. Plant the same flowers in clumps and the hops between them shrink: the bee
        feeds more and travels less, visiting far more flowers per minute. Scatter them and most of
        its energy goes into flight. Native clumps are easy for local pollinators to find and work.
      </Caption>
    </div>
  );
}

/* ---------- TTT-08 Observation as evidence ---------- */
function ExtraObservation() {
  // TTT-08 "Observation as evidence" (concept 1). Sibling ExtraFoodWeb is the
  // trophic energy web. This is the DICHOTOMOUS KEY: identifying a tree is
  // detective work, turning observed clues (leaf, bark, lobes) into a series of
  // either/or choices that narrow the candidates down to one name.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const NODES = {
    q1: { q: "Leaves needle-like?", a: { l: "needle-like", to: "q2" }, b: { l: "broad, flat", to: "q3" } },
    q2: { q: "Needles clustered?", a: { l: "in clusters", to: "pine" }, b: { l: "single", to: "q4" } },
    q4: { q: "Needles flat, soft?", a: { l: "flat, soft", to: "fir" }, b: { l: "sharp, square", to: "spruce" } },
    q3: { q: "Leaf edge lobed?", a: { l: "lobed", to: "q5" }, b: { l: "smooth edge", to: "q6" } },
    q5: { q: "Lobes pointed?", a: { l: "pointed lobes", to: "redoak" }, b: { l: "rounded lobes", to: "whiteoak" } },
    q6: { q: "Leaf heart-shaped?", a: { l: "heart-shaped", to: "redbud" }, b: { l: "papery bark", to: "birch" } },
  };
  const SP = [["pine", "Pine"], ["fir", "Fir"], ["spruce", "Spruce"], ["redoak", "Red oak"], ["whiteoak", "White oak"], ["redbud", "Redbud"], ["birch", "Birch"]];
  const NAME = {}; SP.forEach(([k, v]) => { NAME[k] = v; });
  const leavesUnder = (id) => NODES[id] ? [...leavesUnder(NODES[id].a.to), ...leavesUnder(NODES[id].b.to)] : [id];

  const [cur, setCur] = useState("q1");
  const [clues, setClues] = useState([]);
  const isLeaf = !NODES[cur];
  const node = NODES[cur];
  const cand = leavesUnder(cur);
  const choose = (opt) => { const br = node[opt]; setClues((c) => [...c, br.l]); setCur(br.to); };
  const restart = () => { setCur("q1"); setClues([]); };

  return (
    <div>
      <Field height={212}>
        <svg viewBox="0 0 440 212" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Observation as evidence</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>
            path: {clues.length ? clues.join("  ›  ") : "(start)"}
          </text>

          {/* ===== LEFT: candidates narrowing ===== */}
          <rect x="16" y="34" width="180" height="170" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="26" y="50" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>still possible</text>
          <text x="186" y="50" textAnchor="end" fill={cand.length === 1 ? okC : A} style={f.mono(700, 9.5)}>{cand.length}/7</text>
          {SP.map(([id, nm], i) => {
            const inC = cand.includes(id);
            const y = 68 + i * 19;
            return (
              <g key={id}>
                <circle cx="30" cy={y - 3} r="3.2" fill={inC ? C : "none"} stroke={inC ? C : T.rule22} strokeWidth="1" />
                <text x="42" y={y} fill={inC ? T.ink : T.mute}
                  style={{ ...f.sans(inC ? 600 : 400, 12), textDecoration: inC ? "none" : "line-through" }}>{nm}</text>
                {isLeaf && id === cur && <text x="178" y={y} textAnchor="end" fill={okC} style={f.mono(700, 8, { upper: true })}>this one</text>}
              </g>
            );
          })}

          {/* ===== RIGHT: question or result ===== */}
          <rect x="206" y="34" width="218" height="170" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {!isLeaf ? (
            <>
              <text x="222" y="58" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.12 })}>step {clues.length + 1}</text>
              <text x="222" y="92" fill={T.ink} style={f.display(500, 19, { italic: true, opsz: 40 })}>{node.q}</text>
              <text x="222" y="120" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.08 })}>choose the matching clue:</text>
              <g style={{ cursor: "pointer" }} onClick={() => choose("a")} data-choice="a">
                <rect x="222" y="132" width="186" height="26" rx="3" fill={T.paper} stroke={C} strokeWidth="1.2" />
                <text x="232" y="149" fill={C} style={f.mono(600, 11)}>{"▸ "}{node.a.l}</text>
              </g>
              <g style={{ cursor: "pointer" }} onClick={() => choose("b")} data-choice="b">
                <rect x="222" y="164" width="186" height="26" rx="3" fill={T.paper} stroke={A} strokeWidth="1.2" />
                <text x="232" y="181" fill={A} style={f.mono(600, 11)}>{"▸ "}{node.b.l}</text>
              </g>
            </>
          ) : (
            <>
              <path d="M222 54 l5 5 l9 -11" fill="none" stroke={okC} strokeWidth="2.4" />
              <text x="244" y="60" fill={okC} style={f.mono(700, 10, { upper: true, tracking: 0.12 })}>identified</text>
              <text x="222" y="104" fill={C} style={f.display(600, 30, { opsz: 60 })}>{NAME[cur]}</text>
              <text x="222" y="130" fill={T.mute} style={f.mono(500, 9)}>keyed out in {clues.length} either/or steps</text>
              <text x="222" y="156" fill={T.mute} style={f.sans(400, 9.5, { lh: 1.35 })}>evidence:</text>
              <text x="222" y="172" fill={T.ink} style={f.sans(400, 10, { lh: 1.35 })}>{clues.join(", ")}</text>
            </>
          )}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        {!isLeaf && <Btn small color={C} onClick={() => choose("a")}>{node.a.l}</Btn>}
        {!isLeaf && <Btn small color={A} onClick={() => choose("b")}>{node.b.l}</Btn>}
        <Btn small icon={RotateCcw} color={C} onClick={restart}>restart</Btn>
      </div>

      <Readout items={[
        { l: "Step", v: isLeaf ? "done" : clues.length + 1, color: isLeaf ? okC : C },
        { l: "Candidates", v: cand.length + " of 7", color: cand.length === 1 ? okC : A },
        { l: "Identified", v: isLeaf ? NAME[cur] : "-", color: isLeaf ? okC : T.mute },
        { l: "Clues used", v: clues.length ? clues.join(", ") : "none", color: C },
      ]} />

      <Caption color={C}>
        Identifying a tree is detective work. A dichotomous key turns what you observe, leaf shape,
        bark, lobes, into a chain of either/or choices, and each choice rules out half the
        candidates until one name is left. The answer is only as good as the evidence behind it.
      </Caption>
    </div>
  );
}

/* ---------- TTT-08 Ecosystems in place ---------- */
function ExtraFoodWeb() {
  // TTT-08 "Ecosystems in place" (concept 2). Sibling ExtraObservation is the
  // field-log checklist. Distinct from ExtraCascade (knockout cascade): this
  // classifies an ecosystem by ENERGY FLOW. Click an organism for its trophic
  // role, what it eats, and what eats it; the chart shows the ~10x energy loss
  // at each step up the chain, which is why apex predators are rare.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const LCOL = ["#cf9b3f", C, "#6f9b3f", A, "#7a2f1e"];
  const LNAME = ["energy source", "producer", "herbivore", "carnivore", "apex predator"];
  const LSHORT = ["sun", "producer", "herbivore", "carnivore", "apex"];
  const ENERGY = [0, 100, 10, 1, 0.1];

  const ORG = [
    { id: "sun", lv: 0, x: 40, y: 124 },
    { id: "oak", lv: 1, x: 94, y: 72 }, { id: "grass", lv: 1, x: 94, y: 124 }, { id: "berry", lv: 1, x: 94, y: 176 },
    { id: "caterpillar", lv: 2, x: 148, y: 98 }, { id: "rabbit", lv: 2, x: 148, y: 152 },
    { id: "warbler", lv: 3, x: 200, y: 98 }, { id: "snake", lv: 3, x: 200, y: 152 },
    { id: "hawk", lv: 4, x: 226, y: 124 },
  ];
  const EAT = [
    ["sun", "oak"], ["sun", "grass"], ["sun", "berry"],
    ["oak", "caterpillar"], ["grass", "rabbit"], ["berry", "rabbit"],
    ["caterpillar", "warbler"], ["rabbit", "snake"],
    ["warbler", "hawk"], ["snake", "hawk"],
  ];
  const O = {}; ORG.forEach((o) => { O[o.id] = o; });

  const [sel, setSel] = useState("rabbit");
  const [playing, setPlaying] = useState(true);
  const [clk, setClk] = useState(0);
  useRAF(playing, (dt) => setClk((v) => (v + dt * 0.0007) % 1));

  const prey = EAT.filter(([a, b]) => b === sel).map(([a]) => a);
  const preds = EAT.filter(([a, b]) => a === sel).map(([, b]) => b);
  const selLv = sel ? O[sel].lv : -1;
  const rows = [{ lv: 4, y: 80 }, { lv: 3, y: 114 }, { lv: 2, y: 148 }, { lv: 1, y: 182 }];
  const barLen = (lv) => Math.max(5, (Math.log10(ENERGY[lv]) + 1.2) * 26.25);

  return (
    <div>
      <Field height={248}>
        <svg viewBox="0 0 440 248" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Ecosystems in place</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.1 })}>an ecosystem runs on the flow of energy</text>

          {/* ===== LEFT: trophic food web ===== */}
          <rect x="16" y="34" width="232" height="200" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {/* energy-flow edges */}
          {EAT.map(([a, b], i) => {
            const na = O[a], nb = O[b], dx = nb.x - na.x, dy = nb.y - na.y, L = Math.hypot(dx, dy) || 1;
            const ux = dx / L, uy = dy / L;
            const x1 = na.x + ux * 12, y1 = na.y + uy * 12, x2 = nb.x - ux * 12, y2 = nb.y - uy * 12;
            const on = sel && (a === sel || b === sel);
            const col = on ? A : T.rule22;
            const fr = (clk + i * 0.1) % 1;
            const dpx = x1 + (x2 - x1) * fr, dpy = y1 + (y2 - y1) * fr;
            return (
              <g key={i} opacity={on || !sel ? 1 : 0.45}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={on ? 1.8 : 1} />
                <polygon points={(x2) + "," + (y2) + " " + (x2 - ux * 5 - uy * 3.5) + "," + (y2 - uy * 5 + ux * 3.5) + " " + (x2 - ux * 5 + uy * 3.5) + "," + (y2 - uy * 5 - ux * 3.5)} fill={col} />
                {playing && <circle cx={dpx} cy={dpy} r={on ? 2.6 : 2} fill={on ? A : "#cf9b3f"} opacity="0.85" />}
              </g>
            );
          })}
          {/* organisms */}
          {ORG.map((o) => {
            const isSel = o.id === sel, isPrey = prey.includes(o.id), isPred = preds.includes(o.id);
            const r = o.lv === 0 ? 12 : 11;
            return (
              <g key={o.id} data-org={o.id} style={{ cursor: "pointer" }} onClick={() => setSel(o.id)}>
                {o.lv === 0 && [0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
                  <line key={k} x1={o.x + Math.cos(k * 0.785) * 13} y1={o.y + Math.sin(k * 0.785) * 13} x2={o.x + Math.cos(k * 0.785) * 17} y2={o.y + Math.sin(k * 0.785) * 17} stroke="#cf9b3f" strokeWidth="1.4" />
                ))}
                {isSel && <circle cx={o.x} cy={o.y} r={r + 4} fill="none" stroke={A} strokeWidth="2" />}
                {isPrey && <circle cx={o.x} cy={o.y} r={r + 4} fill="none" stroke={okC} strokeWidth="1.6" strokeDasharray="2 2" />}
                {isPred && <circle cx={o.x} cy={o.y} r={r + 4} fill="none" stroke={warnC} strokeWidth="1.6" strokeDasharray="2 2" />}
                <circle cx={o.x} cy={o.y} r={r} fill={LCOL[o.lv]} stroke={T.ink} strokeWidth={isSel ? 1.8 : 1} />
                <text x={o.x} y={o.y - r - 6} textAnchor="middle" fill={isSel ? A : T.ink} style={f.mono(isSel ? 700 : 500, 8.5, { tracking: 0.02 })}>{o.id}</text>
              </g>
            );
          })}
          {/* prey/predator key */}
          <line x1="26" y1="224" x2="38" y2="224" stroke={okC} strokeWidth="1.6" strokeDasharray="2 2" />
          <text x="42" y="227" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>eats</text>
          <line x1="92" y1="224" x2="104" y2="224" stroke={warnC} strokeWidth="1.6" strokeDasharray="2 2" />
          <text x="108" y="227" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>eaten by</text>

          {/* ===== RIGHT: energy by trophic level ===== */}
          <rect x="258" y="34" width="166" height="200" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="268" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>energy by level</text>
          {rows.map((rw) => {
            const hot = rw.lv === selLv;
            return (
              <g key={rw.lv} opacity={selLv < 0 || hot ? 1 : 0.5}>
                <text x="306" y={rw.y + 3} textAnchor="end" fill={hot ? LCOL[rw.lv] : T.mute} style={f.mono(hot ? 700 : 500, 8.5)}>{LSHORT[rw.lv]}</text>
                <rect x="312" y={rw.y - 8} width={barLen(rw.lv)} height="16" rx="2" fill={LCOL[rw.lv]} opacity={hot ? 1 : 0.42} />
                <text x="418" y={rw.y + 3} textAnchor="end" fill={hot ? T.ink : T.mute} style={f.mono(hot ? 700 : 500, 8.5)}>{ENERGY[rw.lv]}%</text>
              </g>
            );
          })}
          <text x="268" y="214" fill={T.mute} style={f.sans(400, 8.5, { lh: 1.3 })}>{"≈"}10x energy is lost at each step up,</text>
          <text x="268" y="225" fill={T.mute} style={f.sans(400, 8.5, { lh: 1.3 })}>so top predators are few.</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small icon={playing ? Pause : Play} color={C} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "energy on" : "energy off"}</Btn>
        <Btn small icon={RotateCcw} color={C} onClick={() => setSel(null)}>clear</Btn>
        <Tag color={C} style={{ marginLeft: 2 }}>click an organism</Tag>
      </div>

      <Readout items={[
        { l: "Selected", v: sel || "-", color: sel ? A : T.mute },
        { l: "Role", v: sel ? LNAME[selLv] : "-", color: sel ? LCOL[selLv] : T.mute },
        { l: "Eats", v: sel ? (prey.length ? prey.join(", ") : "nothing (it is the base)") : "-", color: okC },
        { l: "Eaten by", v: sel ? (preds.length ? preds.join(", ") : "nothing (apex)") : "-", color: warnC },
      ]} />

      <Caption color={C}>
        An ecosystem is organized by who eats whom: energy flows from the sun into producers, then
        up through herbivores, carnivores, and apex predators. Classifying each organism by its
        trophic role is how you read an ecosystem in place. Only about a tenth of the energy passes
        to the next level, so each step up supports far fewer animals.
      </Caption>
    </div>
  );
}

/* ---------- TTT-09 Resilience by design ---------- */
function ExtraResilience() {
  // TTT-09 "Resilience by design" (concept 1). Sibling ExtraCascade is the food
  // web cascade. This is RESILIENCE = resist a shock, then bounce back. You
  // design the landscape with features (diversity, shade, water, links); each
  // buffers a different stress (storm, drought, heat). A resilient design drops
  // less at the shock and recovers further; a bare monoculture collapses.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const [divers, setDivers] = useState(true);
  const [shade, setShade] = useState(true);
  const [water, setWater] = useState(true);
  const [links, setLinks] = useState(true);
  const STRESSES = ["storm", "drought", "heat"];
  const [si, setSi] = useState(0);
  const stress = STRESSES[si];
  const [intensity, setIntensity] = useState(70);
  const [clk, setClk] = useState(0);
  useRAF(true, (dt) => setClk((v) => (v + dt * 0.00035) % 1));

  const WT = {
    storm:   { D: 0.28, S: 0.08, W: 0.04, X: 0.30 },
    drought: { D: 0.12, S: 0.18, W: 0.34, X: 0.06 },
    heat:    { D: 0.10, S: 0.34, W: 0.22, X: 0.04 },
  };
  const feats = { D: divers, S: shade, W: water, X: links };
  const names = { D: "diversity", S: "shade", W: "water", X: "links" };
  const wt = WT[stress];
  let mit = 0; ["D", "S", "W", "X"].forEach((k) => { if (feats[k]) mit += wt[k]; });
  mit = Math.min(0.85, mit);
  const impact = (intensity / 100) * (1 - mit);
  const trough = Math.round(100 * (1 - impact));
  const recFrac = Math.min(0.92, mit * 0.9 + 0.08);
  const finalF = Math.round(trough + (100 - trough) * recFrac);
  const score = Math.round((trough + finalF) / 2);
  const tier = score >= 70 ? okC : score >= 40 ? A : warnC;
  let weak = "well designed", best = 0;
  ["D", "S", "W", "X"].forEach((k) => { if (!feats[k] && wt[k] > best) { best = wt[k]; weak = "add " + names[k]; } });

  // ---- recovery curve ----
  const ts = 0.28, K = 1 + recFrac * 3.4;
  const curveAt = (t) => t < ts ? 100 : finalF - (finalF - trough) * Math.exp(-K * (t - ts) / (1 - ts));
  const cX0 = 278, cX1 = 414, cY0 = 72, cY1 = 204;
  const px = (t) => cX0 + t * (cX1 - cX0);
  const py = (fv) => cY1 - (fv / 100) * (cY1 - cY0);
  const pts = []; for (let i = 0; i <= 44; i++) { const t = i / 44; pts.push(px(t) + "," + py(curveAt(t))); }
  const area = px(0) + "," + cY1 + " " + pts.join(" ") + " " + px(1) + "," + cY1;
  const trX = px(ts), trY = py(trough), fnY = py(finalF);

  // ---- landscape ----
  const N = 10, gy = 190;
  const xs = Array.from({ length: N }, (_, i) => 66 + i * ((230 - 66) / (N - 1)));
  const vuln = Array.from({ length: N }, (_, i) => ((i * 73 + 17) % 100) / 100);
  const order = [...vuln.keys()].sort((a, b) => vuln[a] - vuln[b]);
  const rankOf = {}; order.forEach((idx, r) => { rankOf[idx] = r; });
  const tSurv = Math.round(N * trough / 100), fSurv = Math.round(N * finalF / 100);
  const greens = ["#2a5736", "#37683b", "#1f5030", "#43743c"];

  return (
    <div>
      <Field height={226}>
        <svg viewBox="0 0 440 226" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="16" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Resilience by design</text>
          <text x="20" y="28" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.1 })}>resist the shock, then bounce back</text>

          {/* ===== LEFT: landscape after the shock ===== */}
          <rect x="16" y="40" width="232" height="178" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {shade && <line x1="34" y1="150" x2="230" y2="150" stroke={C} strokeWidth="1.2" strokeDasharray="5 4" opacity="0.45" />}
          {shade && <text x="230" y="146" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })} textAnchor="end">canopy shade</text>}
          <line x1="20" y1={gy} x2="244" y2={gy} stroke={T.ink} strokeWidth="0.8" />
          {water && (<g>
            <ellipse cx="40" cy={gy - 2} rx="22" ry="6" fill="#5a93c9" opacity="0.5" />
            <path d={"M18 " + (gy - 2) + " A 22 6 0 0 0 62 " + (gy - 2)} fill="none" stroke="#3f78ab" strokeWidth="0.9" opacity="0.6" />
            <line x1="28" y1={gy - 4} x2="38" y2={gy - 4} stroke={T.paper} strokeWidth="0.8" opacity="0.65" />
            <line x1="44" y1={gy - 1} x2="52" y2={gy - 1} stroke={T.paper} strokeWidth="0.8" opacity="0.5" />
            <text x="40" y={gy + 13} textAnchor="middle" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })}>pond</text>
          </g>)}
          {links && <line x1="68" y1={gy + 5} x2="232" y2={gy + 5} stroke={C} strokeWidth="1.4" strokeDasharray="2 4" opacity="0.6" />}

          {/* stress badge */}
          {stress === "storm" && (<g>
            <ellipse cx="40" cy="60" rx="12" ry="6" fill={T.mute} opacity="0.7" />
            <line x1="34" y1="68" x2="32" y2="74" stroke="#5a93c9" strokeWidth="1.4" />
            <line x1="40" y1="68" x2="38" y2="74" stroke="#5a93c9" strokeWidth="1.4" />
            <line x1="46" y1="68" x2="44" y2="74" stroke="#5a93c9" strokeWidth="1.4" />
          </g>)}
          {stress === "drought" && (<g>
            <circle cx="40" cy="60" r="7" fill="none" stroke={A} strokeWidth="1.6" />
            {[0, 1, 2, 3, 4, 5].map((k) => (<line key={k} x1={40 + Math.cos(k * 1.047) * 10} y1={60 + Math.sin(k * 1.047) * 10} x2={40 + Math.cos(k * 1.047) * 13} y2={60 + Math.sin(k * 1.047) * 13} stroke={A} strokeWidth="1.4" />))}
          </g>)}
          {stress === "heat" && (<g>
            <circle cx="40" cy="59" r="7" fill={A} opacity="0.85" />
            <path d="M30 72 q4 -4 8 0 q4 4 8 0" fill="none" stroke={A} strokeWidth="1.4" />
          </g>)}
          <text x="56" y="63" fill={T.ink} style={f.mono(700, 10, { upper: true, tracking: 0.06 })}>{stress}</text>

          {/* plants */}
          {xs.map((x, i) => {
            const r = rankOf[i];
            const st = r < tSurv ? "alive" : r < fSurv ? "regrow" : "dead";
            const hi = (i * 37 % 10) / 10;
            const treeH = divers ? 18 + hi * 10 : 22;
            const cr = divers ? 6 + hi * 3 : 8;
            const gcol = divers ? greens[i % 4] : C;
            if (st === "alive") return (<g key={i}>
              <line x1={x} y1={gy} x2={x} y2={gy - treeH} stroke="#6b4a2a" strokeWidth="2" />
              <circle cx={x} cy={gy - treeH} r={cr} fill={gcol} />
            </g>);
            if (st === "regrow") return (<g key={i}>
              <line x1={x} y1={gy} x2={x} y2={gy - 9} stroke="#6b4a2a" strokeWidth="1.4" />
              <circle cx={x} cy={gy - 11} r="3.6" fill="#6f9b3f" />
            </g>);
            return (<g key={i}>
              <line x1={x} y1={gy} x2={x} y2={gy - 6} stroke="#8a5a2a" strokeWidth="2.4" />
              <line x1={x - 3} y1={gy - 7} x2={x + 3} y2={gy - 5} stroke="#8a5a2a" strokeWidth="1.6" />
            </g>);
          })}
          <text x="132" y="212" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.1 })} textAnchor="middle">landscape after the shock</text>

          {/* ===== RIGHT: recovery curve ===== */}
          <rect x="258" y="40" width="166" height="178" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="270" y="58" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>function over time</text>
          <line x1={cX0} y1={py(100)} x2={cX1} y2={py(100)} stroke={T.rule22} strokeWidth="0.8" strokeDasharray="2 3" />
          <text x={cX0 - 4} y={py(100) + 3} fill={T.mute} style={f.mono(500, 7.5)} textAnchor="end">100</text>
          <line x1={cX0} y1={cY1} x2={cX1} y2={cY1} stroke={T.rule22} strokeWidth="1" />
          <polygon points={area} fill={tier} opacity="0.12" />
          <polyline points={pts.join(" ")} fill="none" stroke={tier} strokeWidth="2" />
          {/* shock marker */}
          <line x1={trX} y1={cY0} x2={trX} y2={cY1} stroke={warnC} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.7" />
          <text x={trX + 3} y={cY0 + 8} fill={warnC} style={f.mono(600, 7.5, { upper: true })}>shock</text>
          {/* trough + final markers */}
          <circle cx={trX} cy={trY} r="3.4" fill={warnC} />
          <text x={trX + 5} y={trY + 12} fill={T.mute} style={f.mono(600, 8)}>resist {trough}%</text>
          <circle cx={cX1} cy={fnY} r="3.4" fill={okC} />
          <text x={cX1} y={fnY - 7} fill={T.mute} style={f.mono(600, 8)} textAnchor="end">recover {finalF}%</text>
          {/* tracer */}
          <circle cx={px(clk)} cy={py(curveAt(clk))} r="2.6" fill={C} />
          <text x={cX1} y="214" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.1 })} textAnchor="end">time {"→"}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Slider val={intensity} set={setIntensity} min={10} max={100} color={A} label="Shock intensity" suffix={intensity + "%"} />
        <Btn small icon={Sprout} color={C} active={divers} onClick={() => setDivers((v) => !v)}>diversity</Btn>
        <Btn small icon={TreeDeciduous} color={C} active={shade} onClick={() => setShade((v) => !v)}>shade</Btn>
        <Btn small icon={Droplet} color={C} active={water} onClick={() => setWater((v) => !v)}>water</Btn>
        <Btn small icon={Network} color={C} active={links} onClick={() => setLinks((v) => !v)}>links</Btn>
        <Btn small icon={stress === "storm" ? CloudRain : stress === "drought" ? Sun : Thermometer} color={A} onClick={() => setSi((v) => (v + 1) % 3)}>{stress}</Btn>
      </div>

      <Readout items={[
        { l: "Resilience", v: score, color: tier },
        { l: "Resisted", v: trough + "%", color: trough >= 60 ? okC : warnC },
        { l: "Recovered", v: finalF + "%", color: finalF >= 70 ? okC : warnC },
        { l: "Weak point", v: weak, color: weak === "well designed" ? okC : A },
      ]} />

      <Caption color={C}>
        Resilience is not just surviving the hit, it is bouncing back after. Design features each
        buffer a different shock: diversity and links steady a storm, water and shade carry a
        drought or heat wave. A well-designed landscape dips only a little and recovers most of its
        function. A bare monoculture collapses at the shock and stays down. Match the feature to
        the stress.
      </Caption>
    </div>
  );
}

/* ---------- TTT-09 Systems thinking (concept 2) ---------- */
function ExtraCascade() {
  // TTT-09 "Systems thinking" (concept 2). Sibling ExtraResilience is the wind
  // stress-test on individual trees. This is the FOOD WEB: knock out a species
  // and the failure cascades to everything that depended on it. A diverse web
  // (survive if ANY supporter remains) buffers the shock; a monoculture
  // (collapse if ANY supporter is lost) lets one knock take down the system.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;

  const NODES = [
    { id: "sun", x: 100, y: 232, src: true, lab: "below" }, { id: "rain", x: 214, y: 232, src: true, lab: "below" },
    { id: "grass", x: 70, y: 176, lab: "left" }, { id: "oak", x: 162, y: 176, lab: "above" }, { id: "shrub", x: 244, y: 176, lab: "right" },
    { id: "insect", x: 86, y: 118, lab: "left", ldx: 10 }, { id: "rabbit", x: 214, y: 118, lab: "right" },
    { id: "bird", x: 86, y: 62, lab: "above" }, { id: "fox", x: 214, y: 62, lab: "above" },
  ];
  const EDGES = [
    ["sun", "grass"], ["sun", "oak"], ["sun", "shrub"],
    ["rain", "grass"], ["rain", "oak"], ["rain", "shrub"],
    ["grass", "insect"], ["oak", "insect"], ["shrub", "insect"],
    ["grass", "rabbit"], ["shrub", "rabbit"],
    ["insect", "bird"], ["rabbit", "fox"],
  ];
  const NODE = {}; NODES.forEach((n) => { NODE[n.id] = n; });
  const SUP = {}; NODES.forEach((n) => { SUP[n.id] = []; }); EDGES.forEach(([a, b]) => SUP[b].push(a));

  const [knocked, setKnocked] = useState([]);
  const [robust, setRobust] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [clk, setClk] = useState(0);
  useRAF(playing, (dt) => setClk((v) => (v + dt * 0.0045) % 1));

  const cascade = (kn) => {
    const dead = new Set(kn);
    let ch = true;
    while (ch) {
      ch = false;
      for (const n of NODES) {
        if (n.src || dead.has(n.id)) continue;
        const s = SUP[n.id]; if (!s.length) continue;
        const d = s.filter((x) => dead.has(x)).length;
        if (robust ? d === s.length : d > 0) { dead.add(n.id); ch = true; }
      }
    }
    return dead;
  };
  const dead = cascade(knocked);
  const collapsed = dead.size - knocked.length;
  const survivors = NODES.length - dead.size;
  const pct = Math.round((survivors / NODES.length) * 100);
  let keystone = { id: "none", n: 0 };
  for (const n of NODES) {
    const sec = cascade([n.id]).size - 1;
    if (sec > keystone.n) keystone = { id: n.id, n: sec };
  }
  const tier = pct >= 70 ? okC : pct >= 40 ? A : warnC;

  const toggle = (id) => setKnocked((k) => k.includes(id) ? k.filter((x) => x !== id) : [...k, id]);
  const off = clk * 18;

  const arrow = (a, b) => {
    const na = NODE[a], nb = NODE[b];
    const dx = nb.x - na.x, dy = nb.y - na.y, L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, rb = nb.src ? 12 : 13, ra = na.src ? 12 : 13;
    return { x1: na.x + ux * ra, y1: na.y + uy * ra, x2: nb.x - ux * rb, y2: nb.y - uy * rb, ux, uy };
  };

  return (
    <div>
      <Field height={268}>
        <svg viewBox="0 0 440 268" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="16" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Systems thinking</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.1 })}>remove one species, watch the loss spread</text>

          {/* ===== edges ===== */}
          {EDGES.map(([a, b], i) => {
            const e = arrow(a, b);
            const aDead = dead.has(a), bDead = dead.has(b);
            const cls = (!aDead && !bDead) ? "live" : (aDead && bDead) ? "failed" : (!aDead && bDead) ? "severed" : "buffered";
            const col = cls === "live" ? C : cls === "buffered" ? okC : warnC;
            const dash = cls === "live" ? "5 4" : cls === "failed" ? "4 4" : cls === "buffered" ? "3 4" : "2 3";
            const animate = cls === "live" || cls === "failed";
            const isSrc = NODE[a].src;
            const op = cls === "severed" ? 0.35 : isSrc && cls === "live" ? 0.5 : 1;
            const tip = 5;
            return (
              <g key={i} opacity={op}>
                <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={col}
                  strokeWidth={cls === "failed" ? 1.9 : cls === "severed" ? 1 : 1.3}
                  strokeDasharray={dash} strokeDashoffset={animate ? -off : 0} />
                <polygon points={(e.x2) + "," + (e.y2) + " " + (e.x2 - e.ux * tip - e.uy * tip * 0.7) + "," + (e.y2 - e.uy * tip + e.ux * tip * 0.7) + " " + (e.x2 - e.ux * tip + e.uy * tip * 0.7) + "," + (e.y2 - e.uy * tip - e.ux * tip * 0.7)} fill={col} />
              </g>
            );
          })}

          {/* ===== nodes + labels ===== */}
          {NODES.map((n) => {
            const isKnocked = knocked.includes(n.id);
            const isDead = dead.has(n.id) && !isKnocked;
            const isKey = keystone.id === n.id && knocked.length === 0;
            const fill = isKnocked ? T.ink : isDead ? warnC : n.src ? T.paper : C;
            const r = n.src ? 12 : 13;
            const lc = isDead ? warnC : isKnocked ? T.mute : T.ink;
            let lx, ly, anc;
            const nd = n.ldx || 0;
            if (n.lab === "above") { lx = n.x; ly = n.y - r - 8; anc = "middle"; }
            else if (n.lab === "below") { lx = n.x; ly = n.y + r + 13; anc = "middle"; }
            else if (n.lab === "left") { lx = n.x - r - 5 - nd; ly = n.y + 2; anc = "end"; }
            else { lx = n.x + r + 5 + nd; ly = n.y + 2; anc = "start"; }
            return (
              <g key={n.id} style={{ cursor: "pointer" }} onClick={() => toggle(n.id)}>
                {isKey && <circle cx={n.x} cy={n.y} r={r + 5} fill="none" stroke={A} strokeWidth="1.4" strokeDasharray="2 3" />}
                <circle cx={n.x} cy={n.y} r={r} fill={fill} opacity={isDead ? 0.5 : 1}
                  stroke={n.src ? C : T.ink} strokeWidth={n.src ? 1.6 : 1} />
                {isKnocked && (
                  <>
                    <line x1={n.x - 5} y1={n.y - 5} x2={n.x + 5} y2={n.y + 5} stroke={T.paper} strokeWidth="1.8" />
                    <line x1={n.x + 5} y1={n.y - 5} x2={n.x - 5} y2={n.y + 5} stroke={T.paper} strokeWidth="1.8" />
                  </>
                )}
                <text x={lx} y={ly + 1} textAnchor={anc} fill={lc} style={f.mono(600, 8.5, { tracking: 0.02 })}>{n.id}</text>
              </g>
            );
          })}

          {/* ===== health panel ===== */}
          <rect x="304" y="40" width="120" height="210" rx="4" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="314" y="58" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>ecosystem</text>
          <text x="314" y="90" fill={tier} style={f.display(700, 26, { opsz: 50 })}>{pct}%</text>
          <rect x="314" y="98" width="100" height="8" rx="4" fill={T.rule12} />
          <rect x="314" y="98" width={Math.max(0, 100 * pct / 100)} height="8" rx="4" fill={tier} />
          <text x="314" y="124" fill={robust ? okC : warnC} style={f.mono(700, 10)}>{robust ? "diverse web" : "monoculture"}</text>
          {knocked.length === 0 ? (
            <>
              <text x="314" y="146" fill={T.mute} style={f.sans(400, 9, { lh: 1.3 })}>click a species</text>
              <text x="314" y="157" fill={T.mute} style={f.sans(400, 9, { lh: 1.3 })}>to remove it</text>
            </>
          ) : (
            <>
              <text x="314" y="146" fill={warnC} style={f.sans(600, 9, { lh: 1.3 })}>{collapsed} collapsed</text>
              <text x="314" y="157" fill={T.mute} style={f.sans(400, 9, { lh: 1.3 })}>from {knocked.length} removed</text>
            </>
          )}
          {/* legend */}
          {[{ c: C, l: "alive", y: 188 }, { c: T.ink, l: "knocked out", y: 210, x: true }, { c: warnC, l: "collapsed", y: 232, o: 0.5 }].map((g, i) => (
            <g key={i}>
              <circle cx="320" cy={g.y} r="5.5" fill={g.c} opacity={g.o || 1} />
              {g.x && (<><line x1="317" y1={g.y - 3} x2="323" y2={g.y + 3} stroke={T.paper} strokeWidth="1.2" /><line x1="323" y1={g.y - 3} x2="317" y2={g.y + 3} stroke={T.paper} strokeWidth="1.2" /></>)}
              <text x="332" y={g.y + 3} fill={T.mute} style={f.mono(500, 8)}>{g.l}</text>
            </g>
          ))}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small icon={Network} color={C} active={robust} onClick={() => setRobust(true)}>diverse</Btn>
        <Btn small icon={Boxes} color={A} active={!robust} onClick={() => setRobust(false)}>monoculture</Btn>
        <Btn small icon={playing ? Pause : Play} color={C} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "pause" : "play"}</Btn>
        <Btn small icon={RotateCcw} color={C} onClick={() => setKnocked([])}>reset</Btn>
      </div>

      <Readout items={[
        { l: "Removed", v: knocked.length ? knocked.join(", ") : "none", color: knocked.length ? warnC : C },
        { l: "Collapsed", v: collapsed + " of " + NODES.length, color: collapsed ? warnC : okC },
        { l: "Survivors", v: survivors + " / " + NODES.length, color: tier },
        { l: "Keystone", v: keystone.id + (keystone.n ? " (+" + keystone.n + ")" : ""), color: A },
      ]} />

      <Caption color={C}>
        An ecosystem is a web, not a list. Remove one species and the loss spreads to everything
        that depended on it. In a diverse web each species has more than one food source, so a
        single knock is buffered and the system holds. In a monoculture every link is the only
        link, so one loss cascades through the whole web. Diversity is what makes a landscape
        resilient.
      </Caption>
    </div>
  );
}

/* ---------- TTT-10 Claim, evidence, reasoning (concept 2) ---------- */
function ExtraCER() {
  // TTT-10 "Claim, evidence, reasoning" (concept 2). Sibling DemoTreering owns
  // the ring-core reader (proxy data). This is the ARGUMENT builder: a claim is
  // only strong when specific evidence and the reasoning that links it to the
  // claim are both present. Drop any link and the argument collapses.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const [claim, setClaim] = useState(true);
  const [evid, setEvid] = useState(true);
  const [reas, setReas] = useState(true);
  const [specific, setSpecific] = useState(true);
  const [clk, setClk] = useState(0);

  const n = (claim ? 1 : 0) + (evid ? 1 : 0) + (reas ? 1 : 0);
  const complete = n === 3;
  const strength = complete ? (specific ? 100 : 70) : n === 2 ? 45 : n === 1 ? 18 : 0;

  const judge = () => {
    if (complete) return specific
      ? { v: "complete argument", d: ["Claim, evidence, and", "reasoning all connect."], fix: "ready to defend" }
      : { v: "needs specifics", d: ["Cite the exact rings,", "not a vague impression."], fix: "make evidence specific" };
    if (n === 2) {
      if (claim && evid) return { v: "unjustified leap", d: ["Data and a claim, but the", "link is left unstated."], fix: "add reasoning" };
      if (claim && reas) return { v: "opinion", d: ["Reasoning with no data", "is just assertion."], fix: "add evidence" };
      return { v: "no claim", d: ["Analysis that never", "answers the question."], fix: "state a claim" };
    }
    if (n === 1) {
      if (claim) return { v: "bare assertion", d: ["A claim by itself", "is only an opinion."], fix: "add evidence + reasoning" };
      if (evid) return { v: "data dump", d: ["Raw data with no", "point and no link."], fix: "add a claim + reasoning" };
      return { v: "principle only", d: ["A rule with nothing", "to apply it to."], fix: "add a claim + evidence" };
    }
    return { v: "empty", d: ["Nothing to evaluate yet.", "Start with a claim."], fix: "start with a claim" };
  };
  const J = judge();
  const tier = strength >= 70 ? okC : strength >= 40 ? A : warnC;
  const missing = [!claim && "claim", !evid && "evidence", !reas && "reasoning"].filter(Boolean);
  const missStr = missing.length ? missing.join(", ") : (complete && !specific ? "specifics" : "none");

  useRAF(complete, (dt) => setClk((v) => (v + dt * 0.004) % 1));

  // ---- chain cards (top to bottom: claim, reasoning, evidence) ----
  const cards = [
    { y: 46, label: "CLAIM", on: claim, lines: ["A multi-year drought hit", "this tree around 1967."] },
    { y: 108, label: "REASONING", on: reas, lines: ["Narrow rings mean weak growth,", "so a run of them signals drought."] },
    { y: 170, label: "EVIDENCE", on: evid, lines: specific ? ["Rings 23 to 30 are the", "narrowest in the whole core."] : ["Some rings look a little", "thin in the middle part."] },
  ];
  // connectors: evidence(bottom)->reasoning, reasoning->claim
  const connER = evid && reas;   // evidence -> reasoning intact
  const connRC = reas && claim;  // reasoning -> claim intact
  const dashoff = -(clk * 14);

  const conn = (yTop, yBot, intact, key) => {
    const xm = 129;
    if (intact) {
      return (
        <g key={key}>
          <line x1={xm} y1={yBot} x2={xm} y2={yTop + 4} stroke={C} strokeWidth="2"
            strokeDasharray={complete ? "4 3" : "0"} strokeDashoffset={complete ? dashoff : 0} />
          <path d={"M " + (xm - 4) + " " + (yTop + 7) + " L " + xm + " " + (yTop + 1) + " L " + (xm + 4) + " " + (yTop + 7)} fill="none" stroke={C} strokeWidth="2" />
        </g>
      );
    }
    return (
      <g key={key}>
        <line x1={xm} y1={yBot} x2={xm} y2={yTop + 4} stroke={warnC} strokeWidth="1.6" strokeDasharray="2 3" opacity="0.9" />
        <line x1={xm - 6} y1={(yTop + yBot) / 2 - 1} x2={xm + 6} y2={(yTop + yBot) / 2 - 5} stroke={warnC} strokeWidth="1.6" />
        <line x1={xm - 6} y1={(yTop + yBot) / 2 + 5} x2={xm + 6} y2={(yTop + yBot) / 2 + 1} stroke={warnC} strokeWidth="1.6" />
      </g>
    );
  };

  return (
    <div>
      <Field height={250}>
        <svg viewBox="0 0 440 250" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="19" fill={C} style={f.mono(700, 12.5, { upper: true, tracking: 0.04 })}>Claim, evidence, reasoning</text>
          <text x="20" y="32" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.12 })}>an argument is only as strong as its weakest link</text>

          {/* ===== LEFT: the CER chain ===== */}
          {conn(92, 108, connRC, "rc")}
          {conn(154, 170, connER, "er")}
          {cards.map((cd) => {
            const x = 22, w = 214, h = 46;
            return (
              <g key={cd.label}>
                <rect x={x} y={cd.y} width={w} height={h} rx="3"
                  fill={cd.on ? T.paper2 : T.paper}
                  stroke={cd.on ? C : T.rule22} strokeWidth={cd.on ? 1.4 : 1}
                  strokeDasharray={cd.on ? "0" : "4 3"} />
                <rect x={x} y={cd.y} width="4" height={h} rx="2" fill={cd.on ? C : T.rule22} />
                <text x={x + 14} y={cd.y + 16} fill={cd.on ? C : T.mute} style={f.mono(700, 9.5, { upper: true, tracking: 0.12 })}>{cd.label}</text>
                {cd.on ? (
                  <>
                    <path d={"M " + (x + 195) + " " + (cd.y + 10) + " l 3 3 l 6 -7"} fill="none" stroke={okC} strokeWidth="1.8" />
                    <text x={x + 14} y={cd.y + 30} fill={T.ink} style={f.sans(400, 9.5, { lh: 1.3 })}>{cd.lines[0]}</text>
                    <text x={x + 14} y={cd.y + 40} fill={T.ink} style={f.sans(400, 9.5, { lh: 1.3 })}>{cd.lines[1]}</text>
                  </>
                ) : (
                  <>
                    <line x1={x + 195} y1={cd.y + 8} x2={x + 203} y2={cd.y + 16} stroke={warnC} strokeWidth="1.6" />
                    <line x1={x + 203} y1={cd.y + 8} x2={x + 195} y2={cd.y + 16} stroke={warnC} strokeWidth="1.6" />
                    <text x={x + 14} y={cd.y + 32} fill={T.mute} style={f.sans(400, 11, { italic: true })}>(not provided)</text>
                  </>
                )}
              </g>
            );
          })}

          {/* ===== RIGHT: strength gauge ===== */}
          <rect x="262" y="46" width="162" height="170" rx="4" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="278" y="66" fill={T.mute} style={f.mono(600, 9, { upper: true, tracking: 0.1 })}>argument strength</text>
          <text x="278" y="100" fill={tier} style={f.display(700, 30, { opsz: 60 })}>{strength}%</text>
          <rect x="278" y="110" width="130" height="9" rx="4.5" fill={T.rule12} />
          <rect x="278" y="110" width={Math.max(0, 130 * strength / 100)} height="9" rx="4.5" fill={tier} />
          <text x="278" y="144" fill={tier} style={f.mono(700, 12)}>{J.v}</text>
          <text x="278" y="160" fill={T.mute} style={f.sans(400, 9, { lh: 1.3 })}>{J.d[0]}</text>
          <text x="278" y="171" fill={T.mute} style={f.sans(400, 9, { lh: 1.3 })}>{J.d[1]}</text>
          {/* C/E/R status dots */}
          {[{ l: "C", on: claim, x: 290 }, { l: "E", on: evid, x: 330 }, { l: "R", on: reas, x: 370 }].map((s) => (
            <g key={s.l}>
              <circle cx={s.x} cy="196" r="9" fill={s.on ? C : "none"} stroke={s.on ? C : T.rule22} strokeWidth="1.4" />
              <text x={s.x} y="200" textAnchor="middle" fill={s.on ? T.paper : T.mute} style={f.mono(700, 10)}>{s.l}</text>
            </g>
          ))}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small icon={Crosshair} color={C} active={claim} onClick={() => setClaim((v) => !v)}>claim</Btn>
        <Btn small icon={Microscope} color={C} active={evid} onClick={() => setEvid((v) => !v)}>evidence</Btn>
        <Btn small icon={Network} color={C} active={reas} onClick={() => setReas((v) => !v)}>reasoning</Btn>
        <Btn small icon={Hash} color={A} active={specific} disabled={!evid} onClick={() => setSpecific((v) => !v)}>{specific ? "specific" : "vague"}</Btn>
      </div>

      <Readout items={[
        { l: "Parts present", v: n + " / 3", color: tier },
        { l: "Strength", v: strength + "%", color: tier },
        { l: "Missing", v: missStr, color: missing.length || (complete && !specific) ? warnC : okC },
        { l: "Next step", v: J.fix, color: C },
      ]} />

      <Caption color={C}>
        A scientific argument is a claim backed by specific evidence and the reasoning that links
        them. Drop any part and it collapses: a claim alone is an opinion, data alone is a dump,
        reasoning alone is abstract. In the tree-ring game you cite the exact narrow rings
        (evidence) and explain that narrow rings mean a poor growing season (reasoning) to support
        the claim that a drought struck.
      </Caption>
    </div>
  );
}

/* ---------- TTT-11 Lotus: roughness + coating (concept 2) ---------- */
function ExtraRoughCoat() {
  // TTT-11 "Roughness plus coating" (concept 2). Sibling DemoLotus owns the
  // macroscopic tilted ramp + rolling self-cleaning droplet + protractor.
  // This is the MICROSCOPIC cross-section: roughness AMPLIFIES the coating.
  // Wax + bumps -> Cassie-Baxter (drop rests on trapped air, superhydrophobic).
  // Bumps without wax -> Wenzel (water floods the grooves, wets MORE).
  // Roughness alone backfires; you need both.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const [rough, setRough] = useState(7);
  const [waxy, setWaxy] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [clk, setClk] = useState(0);

  const thetaRaw = (rgh, wax) => {
    const base = wax ? 110 : 54;
    const amp = 1 + 0.26 * rgh;
    return Math.max(8, Math.min(162, 90 + (base - 90) * amp));
  };
  const theta = Math.round(thetaRaw(rough, waxy));
  const model = rough >= 3 && theta >= 120 ? "Cassie-Baxter"
              : rough >= 3 && theta < 90 ? "Wenzel"
              : "smooth film";
  const state = theta >= 150 ? "superhydrophobic"
              : theta >= 110 ? "hydrophobic"
              : theta >= 60 ? "wetting" : "fully wetting";
  const sheds = theta >= 140;

  useRAF(playing && sheds, (dt) => setClk((v) => (v + dt * 0.0006) % 1));

  // ---- micro cross-section geometry ----
  const slabTop = 192, cx = 120;
  const pillarH = rough * 3.8;
  const tipY = slabTop - pillarH;
  const nPill = Math.max(4, Math.min(14, Math.round(4 + rough)));
  const fx0 = 26, fx1 = 214, fw = fx1 - fx0;
  const sp = fw / nPill, pw = sp * 0.5;
  const pillars = Array.from({ length: nPill }, (_, i) => fx0 + sp * (i + 0.5));
  const isWenzel = model === "Wenzel";
  const dropBaseY = isWenzel ? slabTop : tipY;

  // ---- contact-angle droplet cap (constant area, scaled to fit) ----
  const A0 = 1000, AMAX = 84;
  const th = theta * Math.PI / 180;
  const denom = Math.max(0.02, th - Math.sin(th) * Math.cos(th));
  let R = Math.sqrt(A0 / denom);
  let a = R * Math.sin(th);
  let H = R * (1 - Math.cos(th));
  if (a > AMAX) { const s = AMAX / a; R *= s; a *= s; H *= s; }
  const large = theta > 90 ? 1 : 0;
  const dropD = "M " + (cx - a) + " " + dropBaseY + " A " + R + " " + R + " 0 " + large + " 1 " + (cx + a) + " " + dropBaseY + " Z";
  const apexY = dropBaseY - H;

  // shed bead along a quadratic off the shoulder
  const u = clk;
  const P0x = cx, P0y = apexY, P1x = cx + a + 4, P1y = apexY, P2x = cx + a + 26, P2y = dropBaseY + 30;
  const bx = (1 - u) * (1 - u) * P0x + 2 * (1 - u) * u * P1x + u * u * P2x;
  const by = (1 - u) * (1 - u) * P0y + 2 * (1 - u) * u * P1y + u * u * P2y;

  // ---- chart geometry ----
  const cX0 = 270, cX1 = 412, cY0 = 58, cY1 = 196;
  const pxR = (rgh) => cX0 + (rgh / 10) * (cX1 - cX0);
  const pyA = (ang) => cY1 - (ang / 180) * (cY1 - cY0);
  const samples = Array.from({ length: 21 }, (_, i) => i * 0.5);
  const waxPts = samples.map((r) => pxR(r) + "," + pyA(thetaRaw(r, true))).join(" ");
  const barePts = samples.map((r) => pxR(r) + "," + pyA(thetaRaw(r, false))).join(" ");
  const curX = pxR(rough), curY = pyA(theta);
  const py150 = pyA(150);

  return (
    <div>
      <Field height={236}>
        <svg viewBox="0 0 440 236" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="19" fill={C} style={f.mono(700, 12.5, { upper: true, tracking: 0.04 })}>Roughness + coating</text>
          <text x="20" y="32" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.14 })}>why a lotus leaf needs both</text>

          {/* ===== LEFT: magnified cross-section ===== */}
          <rect x="16" y="42" width="214" height="172" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          <rect x="18" y={slabTop} width="210" height={214 - slabTop} fill="#2f5236" />
          <rect x="18" y={slabTop} width="210" height="2.5" fill={waxy ? "#9bb87f" : "#244029"} opacity={waxy ? 0.95 : 1} />
          {/* groove water (Wenzel) */}
          {isWenzel && pillars.map((xc, i) => (
            <rect key={"gw" + i} x={xc - sp / 2 + 0.5} y={tipY} width={sp - 1} height={slabTop - tipY} fill="#5a93c9" opacity="0.5" />
          ))}
          {/* droplet (under pillars when Wenzel so bumps poke through) */}
          <path d={dropD} fill="#5a93c9" opacity={isWenzel ? 0.5 : 0.9} />
          <path d={dropD} fill="none" stroke="#2f6aa0" strokeWidth="1" opacity="0.5" />
          {!isWenzel && (
            <ellipse cx={cx - a * 0.32} cy={apexY + H * 0.28} rx={Math.max(2, a * 0.16)} ry={Math.max(1.5, H * 0.12)} fill="#cfe6fb" opacity="0.7" />
          )}
          {/* pillars (bumps) */}
          {pillars.map((xc, i) => (
            <g key={"p" + i}>
              <rect x={xc - pw / 2} y={tipY} width={pw} height={pillarH} rx={1.2} fill="#274a2e" />
              {waxy && pillarH > 1 && <rect x={xc - pw / 2} y={tipY} width={pw} height={Math.min(3, pillarH)} rx={1.2} fill="#8fae72" opacity="0.95" />}
            </g>
          ))}
          {/* trapped-air menisci (Cassie) */}
          {model === "Cassie-Baxter" && pillars.slice(0, -1).map((xc, i) => {
            const xn = pillars[i + 1];
            const mid = (xc + xn) / 2;
            if (Math.abs(mid - cx) > a + 6) return null;
            return <path key={"air" + i} d={"M " + (xc + pw / 2) + " " + tipY + " Q " + mid + " " + (tipY + 7) + " " + (xn - pw / 2) + " " + tipY} fill="none" stroke="#cfe0ef" strokeWidth="1" opacity="0.85" />;
          })}
          {/* shed bead */}
          {sheds && by < 213 && <circle cx={bx} cy={by} r="3" fill="#5a93c9" opacity={0.85 * (1 - u * 0.5)} />}
          {/* labels */}
          <text x="24" y="57" fill={theta >= 150 ? okC : theta < 60 ? warnC : C} style={f.mono(700, 13)}>{theta}{"°"}</text>
          <text x="222" y="56" fill={T.mute} style={f.mono(600, 9, { upper: true, tracking: 0.1 })} textAnchor="end">{model}</text>

          {/* ===== RIGHT: contact angle vs roughness ===== */}
          <rect x="246" y="42" width="178" height="172" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          {/* legend */}
          <line x1="270" y1="51" x2="284" y2="51" stroke={C} strokeWidth="2.4" />
          <text x="288" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>waxy</text>
          <line x1="332" y1="51" x2="346" y2="51" stroke={A} strokeWidth="2.4" />
          <text x="350" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>bare</text>
          {/* axes */}
          <line x1={cX0} y1={cY1} x2={cX1} y2={cY1} stroke={T.rule22} strokeWidth="1" />
          <line x1={cX0} y1={cY0} x2={cX0} y2={cY1} stroke={T.rule22} strokeWidth="1" />
          {/* 150 threshold */}
          <line x1={cX0} y1={py150} x2={cX1} y2={py150} stroke={okC} strokeWidth="1" strokeDasharray="3 3" opacity="0.85" />
          <text x={cX0 + 2} y={py150 - 4} fill={okC} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>150{"°"} sheds</text>
          {/* curves */}
          <polyline points={waxPts} fill="none" stroke={C} strokeWidth="2" opacity={waxy ? 1 : 0.32} />
          <polyline points={barePts} fill="none" stroke={A} strokeWidth="2" opacity={waxy ? 0.32 : 1} />
          {/* current marker */}
          <line x1={curX} y1={cY0} x2={curX} y2={cY1} stroke={T.mute} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.7" />
          <circle cx={curX} cy={curY} r="4.5" fill={waxy ? C : A} stroke={T.paper} strokeWidth="1.5" />
          {/* axis labels */}
          <text x={cX0} y="208" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.1 })}>smooth</text>
          <text x={cX1} y="208" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.1 })} textAnchor="end">rough</text>
          <text x="264" y={cY1} fill={T.mute} style={f.mono(500, 8)} textAnchor="end">0</text>
          <text x="264" y={cY0 + 6} fill={T.mute} style={f.mono(500, 8)} textAnchor="end">180</text>

          {/* bottom captions */}
          <text x="120" y="230" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.1 })} textAnchor="middle">magnified cross-section</text>
          <text x="335" y="230" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.1 })} textAnchor="middle">angle vs roughness</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Slider val={rough} set={setRough} min={0} max={10} step={1} color={C} label="Roughness" suffix={rough} />
        <Btn small icon={Droplet} color={A} active={waxy} onClick={() => setWaxy((w) => !w)}>{waxy ? "waxy on" : "waxy off"}</Btn>
        <Btn small icon={playing ? Pause : Play} color={C} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "pause" : "play"}</Btn>
      </div>

      <Readout items={[
        { l: "Contact angle", v: theta + "°", color: theta >= 150 ? okC : theta < 60 ? warnC : C },
        { l: "State", v: state, color: theta >= 150 ? okC : theta < 60 ? warnC : C },
        { l: "Wetting model", v: model, color: C },
        { l: "Sheds water", v: sheds ? "yes" : "no", color: sheds ? okC : warnC },
      ]} />

      <Caption color={C}>
        A lotus leaf beads water only when microscopic bumps and a waxy coating work together.
        With wax, roughness traps air under the drop (Cassie-Baxter) and the contact angle climbs
        past 150{"°"}, so the bead rolls off. Without wax, the same roughness pulls water into
        the grooves (Wenzel) and the leaf wets even more. Roughness alone backfires; you need both.
      </Caption>
    </div>
  );
}

/* ---------- TTT-12 Stomata ---------- */
function ExtraStomata() {
  // TTT-12 "Stomata: pores for gas exchange" (concept 1). Distinct from
  // ExtraSampling (the counting method). A stoma is a pore between two guard
  // cells. It opens to take in CO2 (and let O2 out), but an open pore also loses
  // water. The plant balances feeding itself against drying out.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;   // moss, terracotta
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [light, setLight] = useState(65);   // light level 0..100 drives opening
  const [playing, setPlaying] = useState(true);
  const ap = light / 100;                    // aperture fraction 0..1
  const co2 = Math.round(100 * (1 - Math.exp(-ap * 2.4)));   // saturating uptake
  const water = Math.round(100 * Math.pow(ap, 0.82));        // transpiration loss
  const status = light < 20 ? "closed" : light <= 75 ? "feeding" : "drying out";
  const stC = light < 20 ? A : light <= 75 ? okC : warnC;

  // ---- animation ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const cl = clockRef.current;

  // ---- stoma geometry ----
  const VW = 560, VH = 230;
  const sx = 150, sy = 126, ph = 36, gcW = 13;
  const pw = ap * 13;     // pore half-width
  const lens = (hw) => "M" + sx + "," + (sy - ph) + " Q" + (sx - hw) + "," + sy + " " + sx + "," + (sy + ph) + " Q" + (sx + hw) + "," + sy + " " + sx + "," + (sy - ph) + " Z";
  const guard = (s) => "M" + sx + "," + (sy - ph) + " Q" + (sx + s * (pw + gcW)) + "," + sy + " " + sx + "," + (sy + ph) + " Q" + (sx + s * pw) + "," + sy + " " + sx + "," + (sy - ph) + " Z";

  // ---- tradeoff chart ----
  const pn = { x: 312, y: 52, w: 204, h: 140 };
  const plotL = pn.x + 34, plotR = pn.x + pn.w - 14, plotTop = pn.y + 28, plotBot = pn.y + pn.h - 22;
  const aX = (v) => plotL + (v / 100) * (plotR - plotL);
  const yV = (v) => plotBot - (v / 100) * (plotBot - plotTop);
  const co2Pts = [], waterPts = [];
  for (let l = 0; l <= 100; l += 4) {
    const a = l / 100;
    co2Pts.push(aX(l).toFixed(1) + "," + yV(100 * (1 - Math.exp(-a * 2.4))).toFixed(1));
    waterPts.push(aX(l).toFixed(1) + "," + yV(100 * Math.pow(a, 0.82)).toFixed(1));
  }

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>stomata: pores for gas exchange</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>open for co2, but lose water</text>

          {/* leaf epidermis backdrop */}
          <rect x={40} y={52} width={250} height={150} rx={6} fill="#dfe4c9" stroke={T.ink} strokeWidth="0.6" />
          {[[74, 78, 15], [256, 74, 15], [74, 180, 14], [256, 178, 15], [262, 130, 13]].map(([ex, ey, s], i) => (
            <path key={i} d={"M " + (ex - s) + " " + ey + " C " + (ex - s) + " " + (ey - s * 0.9) + " " + (ex - s * 0.5) + " " + (ey - s) + " " + ex + " " + (ey - s * 0.78) + " C " + (ex + s * 0.5) + " " + (ey - s) + " " + (ex + s) + " " + (ey - s * 0.9) + " " + (ex + s) + " " + ey + " C " + (ex + s) + " " + (ey + s * 0.9) + " " + (ex + s * 0.5) + " " + (ey + s) + " " + ex + " " + (ey + s * 0.78) + " C " + (ex - s * 0.5) + " " + (ey + s) + " " + (ex - s) + " " + (ey + s * 0.9) + " " + (ex - s) + " " + ey + " Z"} fill="none" stroke={C} strokeWidth="0.8" opacity="0.2" />
          ))}

          {/* gas flows through the pore (gated by aperture) */}
          {ap > 0.08 && Array.from({ length: 5 }).map((_, i) => {
            const t = ((cl * 0.0006 * (0.4 + ap) + i * 0.2) % 1);
            const yy = (sy - 56) + t * 112;
            const op = clamp(ap * 0.9 * (t < 0.85 ? 1 : (1 - t) * 6), 0, 0.9);
            return <g key={"co2" + i} opacity={op}><circle cx={sx - 6 + (i % 3) * 6} cy={yy} r="3" fill={okC} /></g>;
          })}
          {ap > 0.08 && Array.from({ length: 4 }).map((_, i) => {
            const t = ((cl * 0.00055 * (0.4 + ap) + i * 0.25) % 1);
            const yy = (sy + 46) - t * 102;
            const op = clamp(ap * 0.8 * (t < 0.85 ? 1 : (1 - t) * 6), 0, 0.8);
            return <circle key={"w" + i} cx={sx + 5 - (i % 3) * 5} cy={yy} r="2.4" fill={A} opacity={op} />;
          })}

          {/* pore opening + guard cells */}
          <path d={lens(pw)} fill="#2a241c" />
          <path d={guard(-1)} fill={C} stroke={T.ink} strokeWidth="1.1" />
          <path d={guard(1)} fill={C} stroke={T.ink} strokeWidth="1.1" />
          <path d={"M" + sx + "," + (sy - ph + 4) + " Q" + (sx - pw - gcW * 0.55) + "," + sy + " " + sx + "," + (sy + ph - 4)} fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.3" />
          <path d={"M" + sx + "," + (sy - ph + 4) + " Q" + (sx + pw + gcW * 0.55) + "," + sy + " " + sx + "," + (sy + ph - 4)} fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.3" />
          <text x={sx} y={sy + ph + 18} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>guard cells</text>

          {/* flow labels */}
          <g>
            <path d={"M" + (sx + 34) + "," + (sy - 30) + " l 0 16 l -4 -4 m 4 4 l 4 -4"} fill="none" stroke={okC} strokeWidth="1.4" />
            <text x={sx + 40} y={sy - 24} fill={okC} style={f.mono(700, 8.5, { upper: true, tracking: 0.1 })}>co2 in</text>
            <path d={"M" + (sx - 34) + "," + (sy + 26) + " l 0 -16 l -4 4 m 4 -4 l 4 4"} fill="none" stroke={A} strokeWidth="1.4" />
            <text x={sx - 40} y={sy + 24} textAnchor="end" fill={A} style={f.mono(700, 8.5, { upper: true, tracking: 0.1 })}>water out</text>
          </g>

          {/* ===== tradeoff chart ===== */}
          <g>
            <rect x={pn.x} y={pn.y} width={pn.w} height={pn.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            {[["co2 in", okC], ["water out", A]].map(([lab, col], i) => (
              <g key={i} transform={"translate(" + (pn.x + 12 + i * 86) + " " + (pn.y + 14) + ")"}>
                <line x1={0} y1={0} x2={12} y2={0} stroke={col} strokeWidth="2.4" />
                <text x={15} y={3} fill={col} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>{lab}</text>
              </g>
            ))}
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            <polyline points={co2Pts.join(" ")} fill="none" stroke={okC} strokeWidth="2.2" />
            <polyline points={waterPts.join(" ")} fill="none" stroke={A} strokeWidth="2.2" />
            <line x1={aX(light)} y1={plotTop} x2={aX(light)} y2={plotBot} stroke={T.ink} strokeDasharray="2 3" strokeWidth="1" opacity="0.6" />
            <circle cx={aX(light)} cy={yV(co2)} r="3" fill={okC} stroke={T.paper} strokeWidth="1" />
            <circle cx={aX(light)} cy={yV(water)} r="3" fill={A} stroke={T.paper} strokeWidth="1" />
            <text x={plotL} y={plotBot + 13} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>closed</text>
            <text x={plotR} y={plotBot + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>wide open</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={light} set={setLight} min={0} max={100} color={okC} label="Light" suffix={light + "%"} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Aperture", v: light + "%", color: C },
        { l: "CO2 in", v: co2 + "%", color: okC },
        { l: "Water lost", v: water + "%", color: A },
        { l: "Status", v: status, color: stC },
      ]} />

      <Caption color={C}>
        Leaves breathe through tiny pores called stomata, opened and closed by two
        guard cells. An open pore lets carbon dioxide in for food and oxygen out,
        but it also lets water escape. CO2 uptake levels off as the pore widens
        while water loss keeps climbing, so a plant in dry air keeps its stomata
        nearly closed to save water.
      </Caption>
    </div>
  );
}

/* ---------- TTT-12 Sampling and counting ---------- */
function ExtraSampling() {
  // TTT-12 "Sampling and counting" (concept 2). Distinct from ExtraStomata (the
  // gas-exchange biology). You cannot count every stoma on a leaf, so you count a
  // few microscope fields of view and average. Average per field times the number
  // of fields estimates the whole leaf. More fields sampled, closer to the truth.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;   // moss, terracotta
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const cols = 6, rows = 4, N = cols * rows;

  const cellCount = useMemo(() => {
    const arr = [];
    for (let c = 0; c < N; c++) {
      const h = Math.abs(Math.sin(c * 12.9898 + 78.233) * 43758.5453) % 1;
      arr.push(1 + Math.floor(h * 5));   // 1..5 stomata per field (patchy)
    }
    return arr;
  }, []);
  const Ttrue = cellCount.reduce((a, b) => a + b, 0);
  const order = useMemo(() => Array.from({ length: N }, (_, k) => (k * 7) % N), []);
  const dots = useMemo(() => {
    const ds = [];
    for (let c = 0; c < N; c++) {
      for (let j = 0; j < cellCount[c]; j++) {
        const hx = Math.abs(Math.sin((c * 31 + j * 7) * 1.7 + 5) * 1000) % 1;
        const hy = Math.abs(Math.sin((c * 17 + j * 13) * 2.3 + 9) * 1000) % 1;
        ds.push({ c, fx: 0.18 + hx * 0.64, fy: 0.18 + hy * 0.64 });
      }
    }
    return ds;
  }, [cellCount]);

  const [K, setK] = useState(8);
  const sampledSet = useMemo(() => new Set(order.slice(0, K)), [order, K]);
  const estAt = (k) => {
    let s = 0;
    for (let i = 0; i < k; i++) s += cellCount[order[i]];
    return Math.round((s / k) * N);
  };
  const estimate = estAt(K);
  const errPct = Math.round((Math.abs(estimate - Ttrue) / Ttrue) * 100);
  const errC = errPct <= 8 ? okC : errPct <= 20 ? A : warnC;

  // ---- field geometry ----
  const VW = 560, VH = 230;
  const fx = 44, fy = 54, cw = 42, ch = 33;
  const cellX = (c) => fx + (c % cols) * cw, cellY = (c) => fy + Math.floor(c / cols) * ch;

  // ---- chart geometry ----
  const pn = { x: 320, y: 52, w: 196, h: 140 };
  const plotL = pn.x + 34, plotR = pn.x + pn.w - 14, plotTop = pn.y + 28, plotBot = pn.y + pn.h - 22;
  const yMax = Math.max(Ttrue * 1.3, estAt(1) * 1.05);
  const kX = (k) => plotL + ((k - 1) / (N - 1)) * (plotR - plotL);
  const yE = (v) => plotBot - (v / yMax) * (plotBot - plotTop);
  const estPts = [];
  for (let k = 1; k <= N; k++) estPts.push(kX(k).toFixed(1) + "," + yE(estAt(k)).toFixed(1));

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>sampling and counting</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>estimate the whole leaf from a few fields</text>

          {/* leaf field */}
          <rect x={fx} y={fy} width={cols * cw} height={rows * ch} fill="#dfe4c9" stroke={T.ink} strokeWidth="0.8" />
          {/* field-of-view grid */}
          {Array.from({ length: N }).map((_, c) => (
            <rect key={"g" + c} x={cellX(c)} y={cellY(c)} width={cw} height={ch} fill="none" stroke={T.ink} strokeWidth="0.4" opacity="0.18" />
          ))}
          {/* stomata dots */}
          {dots.map((d, i) => (
            <circle key={i} cx={cellX(d.c) + d.fx * cw} cy={cellY(d.c) + d.fy * ch} r="1.8" fill={C} opacity={sampledSet.has(d.c) ? 0.9 : 0.4} />
          ))}
          {/* sampled fields of view */}
          {Array.from({ length: N }).map((_, c) => sampledSet.has(c) ? (
            <g key={"s" + c}>
              <rect x={cellX(c) + 1} y={cellY(c) + 1} width={cw - 2} height={ch - 2} fill={A} opacity="0.1" stroke={A} strokeWidth="1.3" />
              <text x={cellX(c) + cw - 4} y={cellY(c) + 11} textAnchor="end" fill={A} style={f.mono(700, 9)}>{cellCount[c]}</text>
            </g>
          ) : null)}
          <text x={fx} y={fy + rows * ch + 14} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>leaf, microscope fields</text>

          {/* ===== convergence chart ===== */}
          <g>
            <rect x={pn.x} y={pn.y} width={pn.w} height={pn.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            {[["estimate", A], ["true", okC]].map(([lab, col], i) => (
              <g key={i} transform={"translate(" + (pn.x + 12 + i * 90) + " " + (pn.y + 14) + ")"}>
                <line x1={0} y1={0} x2={12} y2={0} stroke={col} strokeWidth="2.4" strokeDasharray={lab === "true" ? "3 3" : "0"} />
                <text x={15} y={3} fill={col} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>{lab}</text>
              </g>
            ))}
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            {/* true line */}
            <line x1={plotL} y1={yE(Ttrue)} x2={plotR} y2={yE(Ttrue)} stroke={okC} strokeDasharray="3 3" strokeWidth="1.1" />
            <text x={plotR} y={yE(Ttrue) - 13} textAnchor="end" fill={okC} style={f.mono(600, 8)}>true {Ttrue}</text>
            {/* estimate curve */}
            <polyline points={estPts.join(" ")} fill="none" stroke={A} strokeWidth="2" />
            {/* current K marker */}
            <line x1={kX(K)} y1={plotTop} x2={kX(K)} y2={plotBot} stroke={T.ink} strokeDasharray="2 3" strokeWidth="1" opacity="0.6" />
            <circle cx={kX(K)} cy={yE(estimate)} r="3.4" fill={A} stroke={T.paper} strokeWidth="1.2" />
            <text x={plotL} y={plotBot + 13} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>1 field</text>
            <text x={plotR} y={plotBot + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>all 24</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={K} set={setK} min={1} max={N} color={A} label="Fields sampled" suffix={K + " / " + N} />
      </div>

      <Readout items={[
        { l: "Fields sampled", v: K + " / " + N, color: A },
        { l: "Estimate", v: estimate, color: A },
        { l: "True total", v: Ttrue },
        { l: "Error", v: errPct + "%", color: errC },
      ]} />

      <Caption color={C}>
        You cannot count every stoma on a whole leaf, so you count a few microscope
        fields of view and average. The average per field times the number of
        fields estimates the whole leaf. The more fields you sample, the closer the
        estimate gets to the true count.
      </Caption>
    </div>
  );
}

/* ---------- PYS-01 Path planning ---------- */
function ExtraPathPlan() {
  // PYS-01 "Path planning" (concept 2). Distinct from DemoMagnet (remote
  // actuation). You plan a route through the maze, then control the magnet's
  // speed: too fast and the capsule overshoots corners and touches walls; too
  // slow and you waste time. The goal is the fastest CLEAN run.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const grid = [
    "..#......",
    "..#.###..",
    ".....#...",
    "###..#.#.",
    "...#...#.",
    ".#.#.###.",
    ".#.....#.",
    ".#######.",
    ".........",
  ];
  const start = [0, 0], goal = [8, 8];
  const route = useMemo(() => {
    const rows = grid.length, cols = grid[0].length;
    const open = [{ x: start[0], y: start[1], path: [start] }];
    const seen = new Set([start.join(",")]);
    while (open.length) {
      const cur = open.shift();
      if (cur.x === goal[0] && cur.y === goal[1]) return cur.path;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cur.x + dx, ny = cur.y + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        if (grid[ny][nx] === "#") continue;
        const k = nx + "," + ny;
        if (seen.has(k)) continue;
        seen.add(k);
        open.push({ x: nx, y: ny, path: [...cur.path, [nx, ny]] });
      }
    }
    return [start];
  }, []);

  const corners = useMemo(() => {
    const cs = [];
    for (let i = 1; i < route.length - 1; i++) {
      const a1 = route[i][0] - route[i - 1][0], b1 = route[i][1] - route[i - 1][1];
      const a2 = route[i + 1][0] - route[i][0], b2 = route[i + 1][1] - route[i][1];
      if (a1 !== a2 || b1 !== b2) cs.push({ x: route[i][0], y: route[i][1], dx: a1, dy: b1 });
    }
    return cs;
  }, [route]);

  const [speed, setSpeed] = useState(7);   // magnet speed 1..10 (default shows touches)
  const [playing, setPlaying] = useState(true);
  const touches = clamp(Math.round((speed - 5) * 0.9), 0, 4);
  const timeS = (80 / speed).toFixed(1);
  const verdict = touches > 0 ? "too fast" : speed >= 4 ? "fast and clean" : "too slow";
  const vC = touches > 0 ? warnC : speed >= 4 ? okC : A;

  // ---- animation: capsule travels the route ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const dur = clamp(5200 / speed, 700, 5200);
  const p = (clockRef.current % dur) / dur;
  const last = Math.max(0, route.length - 1);
  const fidx = clamp(Number.isFinite(p) ? p : 0, 0, 0.999999) * last;
  const i0 = clamp(Math.floor(fidx), 0, last), i1 = clamp(i0 + 1, 0, last), fr = fidx - i0;

  // ---- maze geometry ----
  const VW = 560, VH = 230, cell = 18, ox = 48, oy = 46;
  const ccx = (cxy) => ox + cxy * cell + cell / 2;
  const cap = {
    x: ox + (route[i0][0] + (route[i1][0] - route[i0][0]) * fr) * cell + cell / 2,
    y: oy + (route[i0][1] + (route[i1][1] - route[i0][1]) * fr) * cell + cell / 2,
  };
  const segdx = route[i1][0] - route[i0][0], segdy = route[i1][1] - route[i0][1];
  const heading = (segdx === 0 && segdy === 0) ? 0 : (Math.atan2(segdy, segdx) * 180) / Math.PI;
  const routePts = route.map(([x, y]) => (ox + x * cell + cell / 2).toFixed(1) + "," + (oy + y * cell + cell / 2).toFixed(1)).join(" ");

  // ---- tradeoff chart ----
  const pn = { x: 262, y: 52, w: 252, h: 150 };
  const plotL = pn.x + 38, plotR = pn.x + pn.w - 16, plotTop = pn.y + 30, plotBot = pn.y + pn.h - 24;
  const sX = (s) => plotL + ((s - 1) / 9) * (plotR - plotL);
  const yN = (v) => plotBot - (v / 100) * (plotBot - plotTop);
  const touchAt = (s) => clamp(Math.round((s - 5) * 0.9), 0, 4);
  const timePts = [], touchPts = [];
  for (let s = 1; s <= 10; s += 0.5) { timePts.push(sX(s).toFixed(1) + "," + yN(100 / s).toFixed(1)); }
  for (let s = 1; s <= 10; s += 0.5) { touchPts.push(sX(s).toFixed(1) + "," + yN((touchAt(s) / 4) * 100).toFixed(1)); }

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>path planning</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>fast, clean run, fewest wall touches</text>

          {/* maze cells */}
          {grid.map((row, y) => row.split("").map((ch, x) => (
            <rect key={x + "," + y} x={ox + x * cell} y={oy + y * cell} width={cell - 1.4} height={cell - 1.4}
              fill={ch === "#" ? T.ink : T.paper} stroke={T.rule12} strokeWidth="0.5" />
          )))}
          {/* planned route */}
          <polyline points={routePts} fill="none" stroke={A} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.5" strokeDasharray="1 4" />
          {/* touched corners (overshoot skids) */}
          {corners.slice(0, touches).map((c, k) => {
            const bx = ccx(c.x), by = oy + c.y * cell + cell / 2;
            const ex = bx + c.dx * cell * 0.95, ey = by + c.dy * cell * 0.95;
            return (
              <g key={k}>
                <line x1={bx} y1={by} x2={ex} y2={ey} stroke={warnC} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="2.5 2" />
                {[0, 1, 2, 3, 4].map((j) => { const a = (j / 5) * Math.PI * 2; return <line key={j} x1={ex} y1={ey} x2={ex + Math.cos(a) * 5} y2={ey + Math.sin(a) * 5} stroke={warnC} strokeWidth="1.7" strokeLinecap="round" />; })}
                <circle cx={ex} cy={ey} r="2.4" fill={warnC} />
              </g>
            );
          })}
          {/* start + goal */}
          <circle cx={ccx(start[0])} cy={oy + start[1] * cell + cell / 2} r="5.5" fill={C} />
          <circle cx={ccx(goal[0])} cy={oy + goal[1] * cell + cell / 2} r="5.5" fill={A} stroke={T.ink} strokeWidth="1" />
          {/* capsule pill-camera: body + clear lens dome with LEDs, pointed along travel */}
          <g transform={"translate(" + cap.x.toFixed(1) + " " + cap.y.toFixed(1) + ") rotate(" + heading.toFixed(1) + ")"}>
            <rect x="-7" y="-3.6" width="14" height="7.2" rx="3.6" fill={A} stroke={T.ink} strokeWidth="0.9" />
            <line x1="1.5" y1="-3.4" x2="1.5" y2="3.4" stroke={T.ink} strokeWidth="0.6" opacity="0.45" />
            <rect x="-5" y="-2.7" width="5.5" height="1.5" rx="0.7" fill="#ffffff" opacity="0.45" />
            <path d="M 3.4 -3.5 A 3.6 3.6 0 0 1 3.4 3.5 Z" fill="#bfe2ec" stroke={T.ink} strokeWidth="0.7" />
            <circle cx="4.6" cy="0" r="1.3" fill={C} opacity="0.85" />
            <circle cx="3.7" cy="-1.7" r="0.7" fill="#fff8d8" />
            <circle cx="3.7" cy="1.7" r="0.7" fill="#fff8d8" />
          </g>
          <text x={ox} y={oy + 9 * cell + 12} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>maze + planned route</text>

          {/* ===== tradeoff chart ===== */}
          <g>
            <rect x={pn.x} y={pn.y} width={pn.w} height={pn.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            {[["time", C], ["touches", warnC]].map(([lab, col], i) => (
              <g key={i} transform={"translate(" + (pn.x + 12 + i * 70) + " " + (pn.y + 14) + ")"}>
                <line x1={0} y1={0} x2={12} y2={0} stroke={col} strokeWidth="2.4" />
                <text x={15} y={3} fill={col} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>{lab}</text>
              </g>
            ))}
            {/* clean zone (speed <= 5) */}
            <rect x={sX(1)} y={plotTop} width={sX(5) - sX(1)} height={plotBot - plotTop} fill={okC} opacity="0.1" />
            <text x={(sX(1) + sX(5)) / 2} y={plotTop - 3} textAnchor="middle" fill={okC} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>clean</text>
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            <polyline points={timePts.join(" ")} fill="none" stroke={C} strokeWidth="2" />
            <polyline points={touchPts.join(" ")} fill="none" stroke={warnC} strokeWidth="2" />
            {/* fastest-clean sweet spot */}
            <line x1={sX(5)} y1={plotTop} x2={sX(5)} y2={plotBot} stroke={okC} strokeDasharray="3 3" strokeWidth="1" />
            <text x={sX(5)} y={plotBot + 22} textAnchor="middle" fill={okC} style={f.mono(700, 7.5, { upper: true, tracking: 0.08 })}>fastest clean</text>
            {/* current speed marker */}
            <line x1={sX(speed)} y1={plotTop} x2={sX(speed)} y2={plotBot} stroke={T.ink} strokeDasharray="2 3" strokeWidth="1" opacity="0.6" />
            <circle cx={sX(speed)} cy={yN(100 / speed)} r="3.2" fill={C} stroke={T.paper} strokeWidth="1" />
            <text x={plotL} y={plotBot + 13} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>slow</text>
            <text x={plotR} y={plotBot + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>fast</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={speed} set={setSpeed} min={1} max={10} color={A} label="Magnet speed" suffix={speed} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Speed", v: speed, color: A },
        { l: "Run time", v: timeS + " s", color: C },
        { l: "Wall touches", v: touches, color: touches > 0 ? warnC : okC },
        { l: "Verdict", v: verdict, color: vC },
      ]} />

      <Caption color={C}>
        Plan a route through the maze, then steer the magnet at the right speed.
        Too fast and the capsule overshoots corners and scrapes the walls; too
        slow and you waste time. The best run is the fastest one that stays clean,
        with no wall touches.
      </Caption>
    </div>
  );
}

/* ---------- PYS-02 Material efficiency ---------- */
function ExtraStrengthWeight() {
  // PYS-02 "Material efficiency" (concept 2). Distinct from DemoOobleck (the
  // shear-thickening physics). More oobleck armor protects better but weighs and
  // costs more, with diminishing returns. The efficient design is the LEAST
  // material that still protects the target.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [amount, setAmount] = useState(5);   // material amount (scoops) 1..10
  const [playing, setPlaying] = useState(true);
  const protFn = (a) => 100 * (1 - Math.exp(-a / 3.2));
  const prot = Math.round(protFn(amount));
  const safe = prot >= 70;
  const weightG = amount * 22;
  const minAmt = 4;                            // protection crosses 70 near here
  const verdict = !safe ? "target breaks" : amount <= minAmt + 2 ? "efficient" : "over-built";
  const vC = !safe ? warnC : amount <= minAmt + 2 ? okC : A;

  // ---- animation: impactor taps the pad ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const ph = (clockRef.current % 1200) / 1200;
  const down = ph < 0.5 ? Math.pow(ph * 2, 1.6) : Math.pow((1 - ph) * 2, 1.6);
  const hit = down > 0.82;

  // ---- scene geometry ----
  const VW = 560, VH = 230;
  const cx = 150, groundY = 178, targetY = 167;
  const padH = 16 + amount * 4.6;             // pad thickness
  const padBotY = targetY - 14, padTopY = padBotY - padH;
  const impRest = 70, reach = clamp(padTopY - impRest - 6, 8, 80), impY = impRest + down * reach;
  const padW = 70;

  // ---- chart geometry ----
  const pn = { x: 300, y: 52, w: 216, h: 138 };
  const plotL = pn.x + 36, plotR = pn.x + pn.w - 14, plotTop = pn.y + 30, plotBot = pn.y + pn.h - 22;
  const aX = (a) => plotL + ((a - 1) / 9) * (plotR - plotL);
  const yV = (v) => plotBot - (v / 100) * (plotBot - plotTop);
  const protPts = [], wPts = [];
  for (let a = 1; a <= 10; a += 0.5) { protPts.push(aX(a).toFixed(1) + "," + yV(protFn(a)).toFixed(1)); wPts.push(aX(a).toFixed(1) + "," + yV(a * 10).toFixed(1)); }

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>material efficiency</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>least armor that still protects</text>

          <defs>
            <linearGradient id="oobPad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e3a563" />
              <stop offset="0.5" stopColor={A} />
              <stop offset="1" stopColor="#9c581f" />
            </linearGradient>
          </defs>
          {/* ground + target */}
          <line x1={56} y1={groundY} x2={258} y2={groundY} stroke={T.ink} strokeWidth="1" />
          {/* target: a glossy bullseye sensor resting on the ground; it cracks if the armor fails */}
          <ellipse cx={cx} cy={groundY} rx="14" ry="3" fill={T.ink} opacity="0.12" />
          <ellipse cx={cx} cy={targetY} rx="13.5" ry="12" fill={T.paper} stroke={T.ink} strokeWidth="1.4" />
          <ellipse cx={cx} cy={targetY} rx="9.4" ry="8.2" fill="none" stroke={warnC} strokeWidth="1.7" />
          <ellipse cx={cx} cy={targetY} rx="5" ry="4.3" fill={warnC} opacity="0.16" />
          <ellipse cx={cx} cy={targetY} rx="5" ry="4.3" fill="none" stroke={warnC} strokeWidth="1.5" />
          <ellipse cx={cx} cy={targetY} rx="2" ry="1.8" fill={warnC} />
          <path d={"M " + (cx - 9) + " " + (targetY - 6) + " A 12 11 0 0 1 " + (cx + 4) + " " + (targetY - 10)} fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
          {!safe && (
            <g>
              <ellipse cx={cx} cy={targetY} rx="13.5" ry="12" fill={warnC} opacity="0.18" />
              <polyline points={(cx - 9) + "," + (targetY - 8) + " " + (cx - 1) + "," + (targetY - 1) + " " + (cx - 5) + "," + (targetY + 3) + " " + (cx + 5) + "," + (targetY + 9)} fill="none" stroke={T.ink} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
            </g>
          )}
          <text x={cx} y={groundY + 14} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>target</text>

          {/* oobleck armor pad (thickness = material amount): gradient body, top gloss, bottom shadow */}
          <rect x={cx - padW / 2} y={padTopY} width={padW} height={padH} rx="7"
            fill="url(#oobPad)" stroke={T.ink} strokeWidth="1.1" opacity={hit && safe ? 1 : 0.9} />
          <rect x={cx - padW / 2 + 4} y={padTopY + 3} width={padW - 8} height="4" rx="2" fill="#ffffff" opacity="0.4" />
          <line x1={cx - padW / 2 + 5} y1={padBotY - 3} x2={cx + padW / 2 - 5} y2={padBotY - 3} stroke="#7a4416" strokeWidth="1.6" opacity="0.4" />
          {hit && safe && <rect x={cx - padW / 2 + 3} y={padTopY + 2} width={padW - 6} height="6" rx="2" fill="#ffffff" opacity="0.5" />}
          <text x={cx + padW / 2 + 6} y={padTopY + padH / 2} fill={A} style={f.mono(600, 8, { upper: true, tracking: 0.1 })}>{weightG} g</text>

          {/* impactor */}
          <g transform={"translate(" + cx + " " + impY + ")"}>
            <rect x="-20" y="-16" width="40" height="16" rx="2" fill={C} stroke={T.ink} strokeWidth="1" />
            <text x="0" y="-4" textAnchor="middle" fill={T.paper} style={f.mono(700, 8, { upper: true, tracking: 0.1 })}>press</text>
          </g>

          {/* verdict tag (clear of the impactor) */}
          <rect x={198} y={94} width="86" height="17" rx="3" fill={T.paper} stroke={vC} strokeWidth="1.1" />
          <text x={241} y={106} textAnchor="middle" fill={vC} style={f.mono(700, 9, { upper: true, tracking: 0.08 })}>{safe ? "protected" : "broken"}</text>

          {/* ===== efficiency chart ===== */}
          <g>
            <rect x={pn.x} y={pn.y} width={pn.w} height={pn.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            {[["protect", A], ["weight", C]].map(([lab, col], i) => (
              <g key={i} transform={"translate(" + (pn.x + 12 + i * 64) + " " + (pn.y + 14) + ")"}>
                <line x1={0} y1={0} x2={12} y2={0} stroke={col} strokeWidth="2.4" />
                <text x={15} y={3} fill={col} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>{lab}</text>
              </g>
            ))}
            {/* efficient zone */}
            <rect x={aX(minAmt)} y={plotTop} width={aX(minAmt + 2) - aX(minAmt)} height={plotBot - plotTop} fill={okC} opacity="0.12" />
            <text x={(aX(minAmt) + aX(minAmt + 2)) / 2} y={plotTop - 3} textAnchor="middle" fill={okC} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>efficient</text>
            {/* protected threshold */}
            <line x1={plotL} y1={yV(70)} x2={plotR} y2={yV(70)} stroke={okC} strokeDasharray="3 3" strokeWidth="0.9" />
            <rect x={plotL - 1} y={yV(70) - 11} width="52" height="10" rx="2" fill={T.paper2} opacity="0.92" />
            <text x={plotL + 2} y={yV(70) - 3} textAnchor="start" fill={okC} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>protected</text>
            {/* baseline */}
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            {/* curves */}
            <polyline points={wPts.join(" ")} fill="none" stroke={C} strokeWidth="1.8" opacity="0.85" />
            <polyline points={protPts.join(" ")} fill="none" stroke={A} strokeWidth="2.4" />
            {/* current amount marker */}
            <line x1={aX(amount)} y1={plotTop} x2={aX(amount)} y2={plotBot} stroke={T.ink} strokeDasharray="2 3" strokeWidth="1" opacity="0.6" />
            <circle cx={aX(amount)} cy={yV(prot)} r="3.4" fill={A} stroke={T.paper} strokeWidth="1.2" />
            {/* axis labels */}
            <text x={plotL} y={plotBot + 13} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>less</text>
            <text x={plotR} y={plotBot + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>more material</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={amount} set={setAmount} min={1} max={10} color={A} label="Material amount" suffix={amount + " scoops"} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Armor", v: amount + " scoops", color: A },
        { l: "Weight", v: weightG + " g", color: C },
        { l: "Protection", v: prot + "%", color: vC },
        { l: "Verdict", v: verdict, color: vC },
      ]} />

      <Caption color={C}>
        More oobleck protects better, but it weighs and costs more, and the gains
        shrink as you pile it on. The efficient design uses the least material
        that still crosses the protection line. Below it the target breaks; far
        above it you carry dead weight for little extra safety.
      </Caption>
    </div>
  );
}

/* ---------- PYS-03 Reliability ---------- */
function ExtraReliability() {
  // PYS-03 "Reliability" (concept 2). Distinct from DemoCam (the cam/follower
  // mechanism). A hand-cranked automaton must run the SAME every turn. Smooth
  // holes and low friction make it repeatable; friction makes it jam. Reliability
  // is how many cranks complete without jamming over many runs.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [friction, setFriction] = useState(3);   // 0 smooth .. 10 rough
  const [playing, setPlaying] = useState(true);
  const N = 12;
  const jams = Math.round((friction / 10) * N * 0.85);   // 0..~10
  const rel = Math.round(((N - jams) / N) * 100);
  const isJam = (i) => Math.floor(((i + 1) * jams) / N) > Math.floor((i * jams) / N);  // spread evenly
  const verdict = rel >= 80 ? "reliable" : rel >= 50 ? "occasional jams" : "jams a lot";
  const vC = rel >= 80 ? okC : rel >= 50 ? A : warnC;

  // ---- animation ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const cycleMs = 1300;
  const idx = Math.floor(clockRef.current / cycleMs) % N;
  const prog = (clockRef.current % cycleMs) / cycleMs;
  const jamNow = isJam(idx);
  let theta, stalled = false;
  if (!jamNow) { theta = prog * 360; }
  else if (prog < 0.42) { theta = (prog / 0.42) * 150; }
  else { theta = 150 + Math.sin(clockRef.current * 0.05) * 4; stalled = true; }
  const thr = (theta * Math.PI) / 180;
  const bob = 0.5 + 0.5 * Math.sin((theta - 90) * Math.PI / 180);

  // ---- geometry ----
  const VW = 560, VH = 230;
  const cwx = 104, cwy = 134, R = 30, xf = 178;
  const pinX = cwx + R * 0.6 * Math.cos(thr), pinY = cwy + R * 0.6 * Math.sin(thr);
  const fby = 158 - bob * 20;          // follower lower pin
  const fTop = fby - 46;               // follower rod top (task)

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>reliability</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>does it run the same every crank?</text>

          {/* base / box */}
          <rect x={56} y={170} width={210} height={16} fill={T.paper3} stroke={T.ink} strokeWidth="1" />
          <text x={70} y={200} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>hand-cranked automaton</text>

          {/* follower guide bearings (the smooth holes) */}
          <line x1={xf - 8} y1={120} x2={xf + 8} y2={120} stroke={T.ink} strokeWidth="2.4" strokeLinecap="round" />
          <line x1={xf - 8} y1={150} x2={xf + 8} y2={150} stroke={T.ink} strokeWidth="2.4" strokeLinecap="round" />
          <text x={xf + 16} y={138} fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })}>bearings</text>

          {/* connecting rod */}
          <line x1={pinX} y1={pinY} x2={xf} y2={fby} stroke={C} strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />

          {/* follower rod + task flag */}
          <line x1={xf} y1={fby} x2={xf} y2={fTop} stroke={T.ink} strokeWidth="3" strokeLinecap="round" />
          <g transform={"translate(" + xf + " " + fTop + ")"}>
            <line x1="0" y1="0" x2="0" y2="-12" stroke={T.ink} strokeWidth="1.6" />
            <polygon points="0,-12 18,-8 0,-4" fill={stalled ? warnC : A} />
          </g>

          {/* crank wheel */}
          <circle cx={cwx} cy={cwy} r={R} fill={T.paper2} stroke={T.ink} strokeWidth="1.4" />
          <circle cx={cwx} cy={cwy} r={R * 0.16} fill={C} />
          <g transform={"rotate(" + theta.toFixed(1) + " " + cwx + " " + cwy + ")"}>
            <line x1={cwx} y1={cwy} x2={cwx + R * 0.62} y2={cwy} stroke={A} strokeWidth="3" strokeLinecap="round" />
            <circle cx={cwx + R * 0.62} cy={cwy} r="4.5" fill={A} stroke={T.ink} strokeWidth="0.8" />
          </g>
          <text x={cwx} y={cwy + R + 16} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>crank</text>

          {/* jam badge */}
          {stalled && (
            <g>
              <rect x={cwx - 22} y={cwy - R - 24} width="44" height="18" rx="3" fill={T.paper} stroke={warnC} strokeWidth="1.2" />
              <text x={cwx} y={cwy - R - 11} textAnchor="middle" fill={warnC} style={f.mono(700, 10, { upper: true, tracking: 0.12 })}>jam</text>
            </g>
          )}

          {/* ===== reliability panel ===== */}
          {(() => {
            const px = 312, py = 50, pw = 204, ph = 140;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
                <text x={px + 12} y={py + 17} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.18 })}>12-crank test</text>
                {Array.from({ length: N }).map((_, i) => {
                  const dx = px + 28 + (i % 6) * 30, dy = py + 42 + Math.floor(i / 6) * 30;
                  const jam = isJam(i), cur = i === idx;
                  return (
                    <g key={i}>
                      {cur && <circle cx={dx} cy={dy} r="11" fill="none" stroke={T.ink} strokeWidth="1.2" />}
                      <circle cx={dx} cy={dy} r="8" fill={jam ? warnC : okC} opacity="0.9" />
                      <text x={dx} y={dy + 3.5} textAnchor="middle" fill={T.paper} style={f.mono(700, 10)}>{jam ? "×" : "✓"}</text>
                    </g>
                  );
                })}
                <text x={px + pw / 2} y={py + ph - 26} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>reliability</text>
                <text x={px + pw / 2} y={py + ph - 6} textAnchor="middle" fill={vC} style={f.mono(700, 22)}>{rel}%</text>
              </g>
            );
          })()}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={friction} set={setFriction} min={0} max={10} color={A} label="Friction" suffix={friction} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Friction", v: friction <= 3 ? "low" : friction <= 6 ? "medium" : "high", color: A },
        { l: "Jams", v: jams + " / " + N, color: warnC },
        { l: "Reliability", v: rel + "%", color: vC },
        { l: "Verdict", v: verdict, color: vC },
      ]} />

      <Caption color={C}>
        A machine that jams is a failed machine. Smooth holes, low friction, and a
        steady crank make the motion repeat the same way every turn. Reliability is
        how many cranks complete without jamming, so you test it over many runs and
        reduce friction until it is dependable.
      </Caption>
    </div>
  );
}

/* ---------- PYS-04 Sound transmission ---------- */
function ExtraSoundMedia() {
  // PYS-04 "Sound transmission" (concept 1). Distinct from ExtraHRRecovery.
  // The stethoscope: a wide funnel collects faint heart sounds and a sealed
  // tube channels them to the ear. A bigger funnel gathers more sound; a tight
  // seal keeps it in the tube. Loudness = collection x transmission.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [funnel, setFunnel] = useState(7);   // funnel size 1..10
  const [seal, setSeal] = useState(7);       // seal quality 0..10
  const [playing, setPlaying] = useState(true);
  const collection = 0.15 + ((funnel - 1) / 9) * 0.85;   // 0.15..1
  const transmission = seal / 10;                         // 0..1
  const leakAmt = 1 - transmission;
  const loudness = Math.round(collection * transmission * 100);
  const quality = loudness >= 55 ? "clear" : loudness >= 25 ? "faint" : "too quiet";
  const qC = loudness >= 55 ? okC : loudness >= 25 ? A : warnC;

  // ---- geometry ----
  const VW = 560, VH = 230;
  const yC = 118;
  const heartX = 58;
  const xMouth = 100, xThroat = 176;
  const hMouth = 16 + ((funnel - 1) / 9) * 36;   // funnel mouth half-height
  const hThroat = 7;
  const tubeX0 = xThroat, tubeX1 = 424;
  const earX = 436;
  const leaks = [248, 332];

  // ---- animation ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const cl = clockRef.current;

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>sound transmission</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>the stethoscope: funnel, tube, ear</text>

          {/* capture cone (wider funnel gathers more) */}
          <polygon points={heartX + "," + yC + " " + xMouth + "," + (yC - hMouth) + " " + xMouth + "," + (yC + hMouth)} fill={A} opacity={0.07 + collection * 0.12} />

          {/* heart + emitted sound rings */}
          {[0, 1, 2].map((k) => {
            const r = 6 + ((cl * 0.05 + k * 15) % 42);
            return <path key={k} d={"M" + (heartX + r * 0.5) + " " + (yC - r) + " A " + r + " " + r + " 0 0 1 " + (heartX + r * 0.5) + " " + (yC + r)} fill="none" stroke={A} strokeWidth="1.2" opacity={clamp(0.5 - r / 90, 0, 0.5)} />;
          })}
          <g transform={"translate(" + heartX + " " + yC + ")"}>
            <circle cx="-3" cy="0" r="4.5" fill={warnC} /><circle cx="3" cy="0" r="4.5" fill={warnC} />
            <path d="M-6.5,1.5 L0,9 L6.5,1.5 Z" fill={warnC} />
          </g>
          <text x={heartX} y={yC + 34} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>heart</text>

          {/* funnel (chestpiece) - mouth widens with funnel size */}
          <polygon points={xMouth + "," + (yC - hMouth) + " " + xThroat + "," + (yC - hThroat) + " " + xThroat + "," + (yC + hThroat) + " " + xMouth + "," + (yC + hMouth)}
            fill={T.paper3} stroke={T.ink} strokeWidth="1.2" />
          <ellipse cx={xMouth} cy={yC} rx="4" ry={hMouth} fill={C} opacity="0.25" stroke={T.ink} strokeWidth="0.8" />
          <text x={(xMouth + xThroat) / 2} y={yC + hMouth + 14} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>funnel</text>

          {/* tube */}
          <line x1={tubeX0} y1={yC - hThroat} x2={tubeX1} y2={yC - hThroat} stroke={T.ink} strokeWidth="1.2" />
          <line x1={tubeX0} y1={yC + hThroat} x2={tubeX1} y2={yC + hThroat} stroke={T.ink} strokeWidth="1.2" />
          <rect x={tubeX0} y={yC - hThroat + 1} width={tubeX1 - tubeX0} height={hThroat * 2 - 2} fill={T.paper3} opacity="0.4" />
          <text x={(tubeX0 + tubeX1) / 2} y={yC + 26} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>sealed tube</text>

          {/* travelling sound pulses (opacity scales with loudness) */}
          {[0, 1, 2, 3].map((k) => {
            const span = earX - heartX;
            const x = heartX + ((cl * 0.13 + k * (span / 4)) % span);
            const inTube = x > xThroat;
            return <circle key={k} cx={x} cy={yC} r={inTube ? 3.2 : 4} fill={A} opacity={(0.2 + loudness / 100 * 0.75) * (x < tubeX1 ? 1 : 0.4)} />;
          })}

          {/* leaks escaping where the seal is poor: a gap in the tube with sound puffing out */}
          {leaks.map((lx, i) => {
            if (leakAmt < 0.08) return null;
            return (
              <g key={i}>
                <circle cx={lx} cy={yC - hThroat} r={2 + leakAmt} fill={warnC} opacity={clamp(0.4 + leakAmt * 0.5, 0, 0.9)} />
                {[0, 1, 2].map((j) => {
                  const rise = (cl * 0.07 + j * 11 + i * 6) % 33;
                  const rr = 3 + j * 1.6 + leakAmt * 2.5;
                  const op = clamp((0.85 - rise / 33) * leakAmt, 0, 0.85);
                  const yTop = yC - hThroat - 4 - rise;
                  return <path key={j} d={"M " + (lx - rr) + " " + yTop + " a " + rr + " " + rr + " 0 0 1 " + (rr * 2) + " 0"} fill="none" stroke={warnC} strokeWidth="1.8" strokeLinecap="round" opacity={op} />;
                })}
              </g>
            );
          })}
          {leakAmt > 0.35 && <text x={(leaks[0] + leaks[1]) / 2} y={yC - hThroat - 42} textAnchor="middle" fill={warnC} style={f.mono(700, 9, { upper: true, tracking: 0.12 })}>sound leaks out</text>}

          {/* ear */}
          <g transform={"translate(" + earX + " " + yC + ")"}>
            <path d="M 7 -11 C -8 -14, -12 1, -6 9 C -3 13, 6 13, 9 6" fill={T.paper2} stroke={T.ink} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M 3 -6 C -4 -6, -6 2, -1 6" fill="none" stroke={T.ink} strokeWidth="1" opacity="0.6" />
            <ellipse cx="-4" cy="1.5" rx="2.8" ry="3.6" fill={C} opacity="0.4" stroke={T.ink} strokeWidth="0.7" />
            <circle cx="-4.5" cy="1.5" r="1.3" fill={T.ink} />
          </g>
          <text x={earX + 2} y={yC + 30} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>ear</text>

          {/* ===== loudness meter ===== */}
          {(() => {
            const mx = 474, mw = 30, mTop = 52, mBot = 178;
            const fillH = (loudness / 100) * (mBot - mTop);
            return (
              <g>
                <text x={mx + mw / 2} y={mTop - 8} textAnchor="middle" fill={T.mute} style={f.mono(700, 8.5, { upper: true, tracking: 0.16 })}>loudness</text>
                <rect x={mx} y={mTop} width={mw} height={mBot - mTop} rx={3} fill={T.paper2} stroke={C} strokeWidth="1" />
                <rect x={mx} y={mBot - fillH} width={mw} height={fillH} rx={2} fill={qC} opacity="0.85" />
                {[25, 55].map((z) => (
                  <line key={z} x1={mx} y1={mBot - (z / 100) * (mBot - mTop)} x2={mx + mw} y2={mBot - (z / 100) * (mBot - mTop)} stroke={T.ink} strokeWidth="0.6" strokeDasharray="2 2" opacity="0.5" />
                ))}
                <text x={mx + mw / 2} y={mBot + 14} textAnchor="middle" fill={qC} style={f.mono(700, 12)}>{loudness}%</text>
              </g>
            );
          })()}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={funnel} set={setFunnel} min={1} max={10} color={A} label="Funnel size" suffix={funnel} />
        <Slider val={seal} set={setSeal} min={0} max={10} color={C} label="Seal" suffix={seal} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Funnel gain", v: Math.round(collection * 100) + "%", color: A },
        { l: "Seal", v: seal * 10 + "%", color: C },
        { l: "Loudness", v: loudness + "%", color: qC },
        { l: "Heartbeat", v: quality, color: qC },
      ]} />

      <Caption color={C}>
        A stethoscope gathers faint heart sounds with a wide funnel and
        concentrates them into a narrow tube that carries them to your ear. A
        bigger funnel collects more sound, and a tight seal keeps it inside the
        tube. Leaks let sound escape, so seal quality decides how clearly you
        hear a quiet heartbeat.
      </Caption>
    </div>
  );
}

/* ---------- PYS-04 Heart rate and recovery ---------- */
function ExtraHRRecovery() {
  // PYS-04 "Heart rate and recovery" (concept 2). Distinct from ExtraSoundMedia
  // (sound transmission). Heart rate sits at rest, climbs with exercise, then
  // recovers toward rest. How many bpm it drops in the first minute after peak
  // is a fitness signal: a fitter heart recovers faster (a steeper drop).
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [fitness, setFitness] = useState(6);   // 0 (slow recovery) .. 10 (fast)
  const [playing, setPlaying] = useState(true);
  const restHR = 72, peakHR = 165;
  const tau = 240 - (fitness / 10) * 190;       // recovery time constant, s (240..50)
  const tRest = 30, tEx = 70, tEnd = 190;       // phase boundaries (s)
  const hrAt = (tt) => {
    if (tt < tRest) return restHR;
    if (tt < tEx) return restHR + (peakHR - restHR) * ((tt - tRest) / (tEx - tRest));
    return restHR + (peakHR - restHR) * Math.exp(-(tt - tEx) / tau);
  };
  const hr130 = hrAt(tEx + 60);
  const HRR1 = Math.round(peakHR - hr130);       // HR recovery in 1 minute
  const fit = HRR1 >= 50 ? "fast" : HRR1 >= 35 ? "moderate" : "slow";
  const fitC = HRR1 >= 50 ? okC : HRR1 >= 35 ? A : warnC;

  // ---- chart geometry ----
  const VW = 560, VH = 230;
  const plotL = 66, plotR = 512, plotTop = 58, plotBot = 176;
  const bpmMin = 60, bpmMax = 180;
  const X = (t) => plotL + (t / tEnd) * (plotR - plotL);
  const Y = (h) => plotBot - ((h - bpmMin) / (bpmMax - bpmMin)) * (plotBot - plotTop);
  const curve = [];
  for (let tt = 0; tt <= tEnd; tt += 2) curve.push(X(tt).toFixed(1) + "," + Y(hrAt(tt)).toFixed(1));

  // ---- playhead (a heart beating along the curve) ----
  const clockRef = useRef(2400);
  const [, force] = useState(0);
  const cycle = 7200;
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const tp = (clockRef.current % cycle) / cycle * tEnd;
  const hrp = hrAt(tp);
  const px = X(tp), py = Y(hrp);
  const beat = 1 + 0.16 * Math.max(0, Math.sin(clockRef.current * 0.018 * (hrp / 72)));
  const heart = (s) => "M0," + (s * 0.28).toFixed(2) + " C0," + (-s * 0.22).toFixed(2) + " " + (-s).toFixed(2) + "," + (-s * 0.5).toFixed(2) + " " + (-s).toFixed(2) + "," + (s * 0.12).toFixed(2) + " C" + (-s).toFixed(2) + "," + (s * 0.52).toFixed(2) + " 0," + (s * 0.72).toFixed(2) + " 0," + s.toFixed(2) + " C0," + (s * 0.72).toFixed(2) + " " + s.toFixed(2) + "," + (s * 0.52).toFixed(2) + " " + s.toFixed(2) + "," + (s * 0.12).toFixed(2) + " C" + s.toFixed(2) + "," + (-s * 0.5).toFixed(2) + " 0," + (-s * 0.22).toFixed(2) + " 0," + (s * 0.28).toFixed(2) + " Z";

  const phases = [
    { a: 0, b: tRest, lab: "rest" },
    { a: tRest, b: tEx, lab: "exercise" },
    { a: tEx, b: tEnd, lab: "recover" },
  ];

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>heart rate and recovery</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>how fast it returns to rest</text>

          {/* phase bands */}
          {phases.map((ph, i) => (
            <g key={i}>
              <rect x={X(ph.a)} y={plotTop} width={X(ph.b) - X(ph.a)} height={plotBot - plotTop}
                fill={ph.lab === "exercise" ? A : C} opacity={ph.lab === "exercise" ? 0.07 : 0.035} />
              <text x={(X(ph.a) + X(ph.b)) / 2} y={plotBot + 14} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>{ph.lab}</text>
            </g>
          ))}

          {/* axes + bpm ticks */}
          <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.ink} strokeWidth="0.8" />
          <line x1={plotL} y1={plotTop} x2={plotL} y2={plotBot} stroke={T.ink} strokeWidth="0.8" />
          {[60, 90, 120, 150, 180].map((b) => (
            <g key={b}>
              <line x1={plotL - 3} y1={Y(b)} x2={plotL} y2={Y(b)} stroke={T.ink} strokeWidth="0.7" />
              <text x={plotL - 6} y={Y(b) + 3} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5)}>{b}</text>
            </g>
          ))}
          <text x={plotL - 6} y={plotTop - 4} textAnchor="end" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>bpm</text>

          {/* resting reference line */}
          <line x1={plotL} y1={Y(restHR)} x2={plotR} y2={Y(restHR)} stroke={C} strokeDasharray="3 3" strokeWidth="0.9" opacity="0.6" />
          <text x={plotR + 5} y={Y(restHR) + 3} textAnchor="start" fill={C} style={f.mono(600, 7.5)}>resting {restHR}</text>

          {/* HR curve */}
          <polyline points={curve.join(" ")} fill="none" stroke={A} strokeWidth="2.4" />

          {/* peak marker */}
          <circle cx={X(tEx)} cy={Y(peakHR)} r="3.6" fill={A} stroke={T.paper} strokeWidth="1" />
          <text x={X(tEx) - 9} y={Y(peakHR) - 1} textAnchor="end" fill={A} style={f.mono(700, 8.5)}>peak {peakHR}</text>

          {/* 1-minute recovery measure */}
          {(() => {
            const xm = X(tEx + 60), yTop = Y(peakHR), yBot = Y(hr130);
            return (
              <g>
                <line x1={X(tEx)} y1={yTop} x2={xm} y2={yTop} stroke={T.mute} strokeDasharray="2 3" strokeWidth="0.7" />
                <line x1={xm} y1={yTop} x2={xm} y2={yBot} stroke={okC} strokeWidth="1.6" />
                <polygon points={xm + "," + yBot + " " + (xm - 3) + "," + (yBot - 6) + " " + (xm + 3) + "," + (yBot - 6)} fill={okC} />
                <polygon points={xm + "," + yTop + " " + (xm - 3) + "," + (yTop + 6) + " " + (xm + 3) + "," + (yTop + 6)} fill={okC} />
                {/* dot removed: the double-headed arrow already marks the drop span */}
                <rect x={xm + 6} y={(yTop + yBot) / 2 - 14} width="92" height="28" rx="3" fill={T.paper} stroke={okC} strokeWidth="1" />
                <text x={xm + 52} y={(yTop + yBot) / 2 - 2} textAnchor="middle" fill={okC} style={f.mono(700, 10)}>{HRR1} bpm</text>
                <text x={xm + 52} y={(yTop + yBot) / 2 + 9} textAnchor="middle" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })}>drop in 1 min</text>
              </g>
            );
          })()}

          {/* playhead heart */}
          <g transform={"translate(" + px.toFixed(1) + " " + py.toFixed(1) + ") scale(" + beat.toFixed(3) + ")"}>
            <path d={heart(7)} fill={A} stroke={T.paper} strokeWidth="0.8" />
          </g>
          {(px < 358 || px > 480) && <text x={clamp(px, plotL + 16, plotR - 16)} y={py - 14} textAnchor="middle" fill={C} style={f.mono(700, 9)}>{hrp.toFixed(0)}</text>}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={fitness} set={setFitness} min={0} max={10} color={A} label="Fitness" suffix={fitness} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Resting", v: restHR + " bpm", color: C },
        { l: "Peak", v: peakHR + " bpm", color: A },
        { l: "HR recovery", v: HRR1 + " bpm/min", color: okC },
        { l: "Recovery", v: fit, color: fitC },
      ]} />

      <Caption color={C}>
        At rest the heart beats slowly; light exercise drives it up to a peak;
        then it recovers toward rest. The number of beats per minute it drops in
        the first minute after peak is a fitness signal: a fitter heart recovers
        faster, a steeper fall. Measure resting and post-activity rates with
        consent.
      </Caption>
    </div>
  );
}

/* ---------- PYS-05 From signal to muscle ---------- */
function ExtraReactionTime() {
  // PYS-05 "From signal to muscle" (concept 1). Distinct from ExtraMedian, which
  // is the statistics view. Here the focus is the reaction-time PATHWAY: the eye
  // sees a signal, the brain decides, nerves carry it, the muscle moves. A pulse
  // travels eye -> brain -> nerve -> muscle over the reaction time. The classic
  // ruler-drop test turns that delay into a catch distance, d = 1/2 g t^2.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [t, setT] = useState(250);        // reaction time, ms (150..400)
  const [playing, setPlaying] = useState(true);
  const dCm = Math.round(0.5 * 9.8 * Math.pow(t / 1000, 2) * 100 * 10) / 10;  // ruler drop, cm

  // ---- animation: pulse along the pathway + synced ruler drop, looping ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  const visDur = t * 3.6;
  const cycle = visDur + 650;
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const local = clockRef.current % cycle;
  const p = clamp(local / visDur, 0, 1);          // 0 -> 1 across the reaction
  const caught = p >= 0.999;

  // ---- pathway geometry ----
  const VW = 560, VH = 268;
  const ny = 84;
  const nodes = [
    { x: 86, lab: "eye", sub: "see" },
    { x: 208, lab: "brain", sub: "decide" },
    { x: 330, lab: "nerve", sub: "send" },
    { x: 452, lab: "muscle", sub: "move" },
  ];
  const seg = Math.min(Math.floor(p * 3), 2);
  const localp = p * 3 - seg;
  const pulseX = nodes[seg].x + localp * (nodes[seg + 1].x - nodes[seg].x);

  // ---- ruler geometry ----
  const rx = 100, rw = 18, ryBot = 252, ryTop = 158, maxCm = 90;
  const scale = (ryBot - ryTop) / maxCm;          // px per cm
  const fallCm = dCm * p * p;                      // accelerating leading edge
  const fallEdgeY = ryBot - fallCm * scale;
  const catchY = ryBot - dCm * scale;              // fixed final catch point

  return (
    <div>
      <Field height={280}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>from signal to muscle</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>the reaction-time pathway</text>

          {/* ===== pathway ===== */}
          {/* base path */}
          <line x1={nodes[0].x} y1={ny} x2={nodes[3].x} y2={ny} stroke={T.rule22} strokeWidth="2" />
          {/* travelled portion */}
          <line x1={nodes[0].x} y1={ny} x2={pulseX} y2={ny} stroke={A} strokeWidth="2.4" />
          {nodes.map((n, i) => {
            const active = p * 3 >= i - 0.02;
            return (
              <g key={i}>
                <circle cx={n.x} cy={ny} r="15" fill={active ? A : T.paper2} stroke={T.ink} strokeWidth="1.2" opacity={active ? 0.95 : 1} />
                {n.lab === "eye" && <g><ellipse cx={n.x} cy={ny} rx="8" ry="5" fill={T.paper} stroke={T.ink} strokeWidth="0.8" /><circle cx={n.x} cy={ny} r="2.4" fill={T.ink} /></g>}
                {n.lab === "brain" && <g><path d={"M" + (n.x - 6) + " " + (ny + 2) + " Q " + (n.x - 7) + " " + (ny - 6) + " " + n.x + " " + (ny - 5) + " Q " + (n.x + 7) + " " + (ny - 6) + " " + (n.x + 6) + " " + (ny + 3)} fill="none" stroke={active ? T.paper : T.ink} strokeWidth="1.1" /></g>}
                {n.lab === "nerve" && <path d={"M" + (n.x - 7) + " " + (ny + 3) + " q 3 -8 7 -6 q -4 -2 0 -8" } fill="none" stroke={active ? T.paper : T.ink} strokeWidth="1.2" />}
                {n.lab === "muscle" && <ellipse cx={n.x} cy={ny} rx="6" ry="8" fill="none" stroke={active ? T.paper : T.ink} strokeWidth="1.4" />}
                <text x={n.x} y={ny + 28} textAnchor="middle" fill={active ? A : C} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>{n.lab}</text>
                <text x={n.x} y={ny + 39} textAnchor="middle" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>{n.sub}</text>
              </g>
            );
          })}
          {/* signal light at the eye */}
          {!caught && <circle cx={nodes[0].x} cy={ny - 26} r="5" fill={okC} opacity={p > 0 ? 0.9 : 0.3} />}
          {!caught && <text x={nodes[0].x} y={ny - 34} textAnchor="middle" fill={okC} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>signal</text>}
          {/* travelling pulse */}
          {!caught && (
            <g>
              <circle cx={pulseX} cy={ny} r="11" fill={A} opacity="0.18" />
              <circle cx={pulseX} cy={ny} r="5" fill={A} stroke={T.paper} strokeWidth="1" />
            </g>
          )}
          {caught && <text x={nodes[3].x} y={ny - 26} textAnchor="middle" fill={okC} style={f.mono(700, 8.5, { upper: true, tracking: 0.12 })}>move</text>}

          {/* ===== ruler-drop ===== */}
          <text x={rx + rw / 2} y={ryTop - 8} textAnchor="middle" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>ruler drop</text>
          <rect x={rx} y={ryTop} width={rw} height={ryBot - ryTop} fill={T.paper3} stroke={T.ink} strokeWidth="1" />
          {[0, 15, 30, 45, 60, 75, 90].map((cm) => (
            <g key={cm}>
              <line x1={rx} y1={ryBot - cm * scale} x2={rx + rw} y2={ryBot - cm * scale} stroke={T.ink} strokeWidth="0.6" opacity="0.5" />
              <text x={rx - 4} y={ryBot - cm * scale + 3} textAnchor="end" fill={T.mute} style={f.mono(500, 7)}>{cm}</text>
            </g>
          ))}
          {/* fallen distance highlighted (animated edge) + fixed catch line */}
          <rect x={rx} y={fallEdgeY} width={rw} height={ryBot - fallEdgeY} fill={A} opacity="0.45" />
          <line x1={rx - 3} y1={catchY} x2={rx + rw + 3} y2={catchY} stroke={C} strokeWidth="1.4" strokeDasharray="3 2" />
          {/* catch hand */}
          <path d={"M" + (rx + rw + 2) + " " + catchY + " l 12 -5 l 0 10 Z"} fill={C} />
          <text x={rx + rw + 18} y={catchY + 3} fill={C} style={f.mono(700, 10)}>{dCm} cm</text>
          {/* ground hand at 0 */}
          <text x={rx + rw / 2} y={ryBot + 12} textAnchor="middle" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>catch</text>

          {/* ===== formula + mapping ===== */}
          <text x={250} y={150} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.18 })}>delay to distance</text>
          <text x={250} y={178} fill={C} style={f.mono(700, 17)}>d = &#189; g t&#178;</text>
          <text x={250} y={200} fill={T.mute} style={f.mono(500, 9)}>{"t = " + t + " ms  =>  d = " + dCm + " cm"}</text>
          <text x={250} y={216} fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.1 })}>slower reaction, ruler falls farther</text>
          {/* typical reference */}
          <line x1={250} y1={228} x2={500} y2={228} stroke={T.rule22} strokeWidth="0.6" />
          <text x={250} y={242} fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.12 })}>typical human reaction near 250 ms</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={t} set={setT} min={150} max={400} step={5} color={A} label="Reaction time" suffix={t + " ms"} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Reaction time", v: t + " ms", color: A },
        { l: "Ruler drop", v: dCm + " cm", color: C },
        { l: "Signal path", v: "eye to muscle", color: okC },
      ]} />

      <Caption color={C}>
        Reaction time is the delay between seeing a signal and moving. The eye
        sends the signal to the brain, the brain decides, and nerves fire the
        muscle. The classic ruler-drop test turns that delay into a catch
        distance, d = 1/2 g t squared, so a slower reaction lets the ruler fall
        farther before you grab it.
      </Caption>
    </div>
  );
}

/* ---------- PYS-05 Median and improvement ---------- */
function ExtraMedian() {
  // PYS-05 "Median and improvement" (concept 2). Distinct from ExtraReactionTime,
  // which is the live reaction tester. Here the focus is statistics: one trial is
  // noisy, so take many and use the MEDIAN, which a fumbled outlier barely moves
  // but the mean does. Then test whether a strategy lowers the whole cluster
  // (before vs after), which is real improvement.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok;
  const [fumble, setFumble] = useState(3);   // outlier severity in the BEFORE set
  const [strategy, setStrategy] = useState(5); // improvement applied to the AFTER set

  const median = (arr) => {
    const s = [...arr].sort((a, b) => a - b), n = s.length;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  };
  const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const beforeNormals = [262, 305, 288, 331, 276, 312, 295, 320, 284];
  const fumbleVal = Math.round(330 + (fumble / 10) * 240);   // 330 -> 570
  const before = [...beforeNormals, fumbleVal];
  const shift = Math.round((strategy / 10) * 70);             // 0 -> 70 ms faster
  const after = beforeNormals.map((x) => x - shift);
  const bMed = median(before), bMean = Math.round(mean(before)), aMed = median(after);
  const improve = bMed - aMed;
  const isOutlier = fumbleVal > 380;

  // ---- geometry ----
  const VW = 560, VH = 212;
  const msMin = 170, msMax = 590, plotL = 66, plotR = 508;
  const X = (m) => plotL + ((m - msMin) / (msMax - msMin)) * (plotR - plotL);
  const yB = 80, yA = 146, half = 12, axisY = 186;
  const jy = (i) => (((i * 53) % 11) - 5) * 1.8;

  return (
    <div>
      <Field height={224}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>median and improvement</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>many noisy trials, trust the middle</text>

          {/* lane guides + labels */}
          <line x1={plotL} y1={yB} x2={plotR} y2={yB} stroke={T.rule12} strokeWidth="1" />
          <line x1={plotL} y1={yA} x2={plotR} y2={yA} stroke={T.rule12} strokeWidth="1" />
          <text x={plotL - 6} y={yB + 3} textAnchor="end" fill={T.mute} style={f.mono(700, 8.5, { upper: true, tracking: 0.12 })}>before</text>
          <text x={plotL - 6} y={yA + 3} textAnchor="end" fill={T.mute} style={f.mono(700, 8.5, { upper: true, tracking: 0.12 })}>after</text>

          {/* before mean (dashed) */}
          <line x1={X(bMean)} y1={yB - half - 2} x2={X(bMean)} y2={yB + half + 2} stroke={C} strokeWidth="1.4" strokeDasharray="3 3" />
          <text x={X(bMean)} y={yB + half + 14} textAnchor="middle" fill={C} style={f.mono(600, 8.5)}>mean {bMean}</text>

          {/* before dots */}
          {before.map((v, i) => {
            const out = i === before.length - 1 && isOutlier;
            return <circle key={i} cx={X(v)} cy={yB + jy(i)} r={out ? 4.5 : 3} fill={out ? A : C} opacity={out ? 1 : 0.7} stroke={out ? T.paper : "none"} strokeWidth={out ? 1 : 0} />;
          })}
          {/* fumble callout */}
          {isOutlier && (
            <g>
              <line x1={X(fumbleVal)} y1={yB - 14} x2={X(fumbleVal)} y2={yB + jy(before.length - 1) - 5} stroke={A} strokeWidth="0.8" />
              <text x={X(fumbleVal)} y={yB - 18} textAnchor="middle" fill={A} style={f.mono(700, 8, { upper: true, tracking: 0.1 })}>fumble</text>
            </g>
          )}
          {/* before median (solid) */}
          <line x1={X(bMed)} y1={yB - half - 2} x2={X(bMed)} y2={yB + half + 2} stroke={A} strokeWidth="2.4" />
          <text x={X(bMed)} y={yB - half - 6} textAnchor="middle" fill={A} style={f.mono(700, 9)}>median {bMed}</text>

          {/* after dots */}
          {after.map((v, i) => <circle key={i} cx={X(v)} cy={yA + jy(i)} r="3" fill={C} opacity="0.7" />)}
          {/* after median (solid) */}
          <line x1={X(aMed)} y1={yA - half - 2} x2={X(aMed)} y2={yA + half + 2} stroke={A} strokeWidth="2.4" />
          <text x={X(aMed)} y={yA - half - 6} textAnchor="middle" fill={A} style={f.mono(700, 9)}>median {aMed}</text>

          {/* improvement connector + arrow */}
          <line x1={X(bMed)} y1={yB + half + 2} x2={X(bMed)} y2={166} stroke={T.mute} strokeDasharray="2 3" strokeWidth="0.7" />
          <line x1={X(aMed)} y1={yA + half + 2} x2={X(aMed)} y2={166} stroke={T.mute} strokeDasharray="2 3" strokeWidth="0.7" />
          <line x1={X(bMed)} y1={166} x2={X(aMed) + 6} y2={166} stroke={okC} strokeWidth="2" />
          <polygon points={X(aMed) + ",166 " + (X(aMed) + 7) + ",162 " + (X(aMed) + 7) + ",170"} fill={okC} />
          <rect x={(X(bMed) + X(aMed)) / 2 - 42} y={160} width="84" height="15" rx="2" fill={T.paper} opacity="0.9" stroke={okC} strokeWidth="0.6" />
          <text x={(X(bMed) + X(aMed)) / 2} y={172} textAnchor="middle" fill={okC} style={f.mono(700, 9, { upper: true, tracking: 0.08 })}>{"improve " + improve + " ms"}</text>

          {/* ms axis */}
          <line x1={plotL} y1={axisY} x2={plotR} y2={axisY} stroke={T.ink} strokeWidth="0.8" />
          {[200, 300, 400, 500].map((m) => (
            <g key={m}>
              <line x1={X(m)} y1={axisY} x2={X(m)} y2={axisY + 4} stroke={T.ink} strokeWidth="0.8" />
              <text x={X(m)} y={axisY + 14} textAnchor="middle" fill={T.mute} style={f.mono(500, 7.5)}>{m}</text>
            </g>
          ))}
          <text x={plotL} y={axisY + 14} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>faster</text>
          <text x={plotR} y={axisY + 14} textAnchor="end" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>slower (ms)</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={fumble} set={setFumble} min={0} max={10} color={A} label="Fumble (outlier)" suffix={fumble} />
        <Slider val={strategy} set={setStrategy} min={0} max={10} color={C} label="Strategy" suffix={strategy} />
      </div>

      <Readout items={[
        { l: "Before median", v: bMed + " ms", color: A },
        { l: "Before mean", v: bMean + " ms", color: C },
        { l: "After median", v: aMed + " ms", color: A },
        { l: "Improvement", v: improve + " ms", color: okC },
      ]} />

      <Caption color={C}>
        One catch is luck, so take many. The median is the robust middle: a single
        fumbled catch (the far outlier) barely moves it, yet it drags the mean
        toward slow. A real strategy, like a focus cue, lowers the whole cluster,
        so the median drops. That gap is genuine improvement.
      </Caption>
    </div>
  );
}

/* ---------- PYS-06 Echo timing is ranging ---------- */
function ExtraSonarRange() {
  // PYS-06 "Echo timing is ranging" (concept 2). Distinct from DemoWave, which
  // shows the longitudinal wave in a medium. Here the focus is the math of
  // ranging: time a pulse's round trip, then distance = speed x time / 2. A
  // stopwatch times the flight; the live equation turns that time into a
  // distance. No medium particles or coils.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [D, setD] = useState(10);          // target distance, meters (2..20)
  const [playing, setPlaying] = useState(true);
  const v = 343;                            // speed of sound in air, m/s
  const tRound = (2 * D) / v;               // round-trip time, seconds
  const tMs = tRound * 1000;                // ms
  const measured = (v * tRound) / 2;        // = D (the ranging result)

  // ---- animation: pulse flies out and echoes back, looping ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  const visDur = 800 + ((D - 2) / 18) * 1500;
  const cycle = visDur + 650;
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const local = clockRef.current % cycle;
  const progress = clamp(local / visDur, 0, 1);
  const phase = progress < 0.5 ? progress * 2 : (1 - progress) * 2;  // 0 -> 1 -> 0
  const returning = progress >= 0.5;
  const displayMs = progress * tMs;

  // ---- scene geometry ----
  const VW = 560, VH = 268;
  const axisY = 94, sensorX = 66;
  const targetX = 130 + ((D - 2) / 18) * (470 - 130);
  const pulseX = sensorX + phase * (targetX - sensorX);

  // ---- stopwatch ----
  const sx = 108, sy = 208, sr = 34;
  const handA = -90 + progress * 330;
  const handRad = (handA * Math.PI) / 180;
  const handX = sx + sr * 0.78 * Math.cos(handRad), handY = sy + sr * 0.78 * Math.sin(handRad);

  // ---- equation boxes ----
  const boxes = [
    { x: 196, w: 88, lab: "round trip", val: tMs.toFixed(0) + " ms", col: A },
    { x: 312, w: 84, lab: "speed", val: v + " m/s", col: C },
    { x: 484, w: 64, lab: "distance", val: measured.toFixed(1) + " m", col: okC },
  ];

  return (
    <div>
      <Field height={280}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={26} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>echo timing is ranging</text>
          <text x={40} y={40} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>time the round trip, get the distance</text>

          {/* travel axis */}
          <line x1={sensorX} y1={axisY} x2={targetX} y2={axisY} stroke={T.rule22} strokeWidth="1" strokeDasharray="2 4" />

          {/* sensor (emitter + receiver) */}
          <rect x={sensorX - 18} y={axisY - 16} width="20" height="32" rx="2" fill={C} stroke={T.ink} strokeWidth="0.9" />
          <path d={"M" + (sensorX - 2) + " " + (axisY - 9) + " L" + (sensorX + 6) + " " + (axisY - 13) + " L" + (sensorX + 6) + " " + (axisY + 13) + " L" + (sensorX - 2) + " " + (axisY + 9) + " Z"} fill={A} />
          <text x={sensorX - 8} y={axisY + 32} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>sensor</text>

          {/* outgoing wavefront arcs from the sensor (subtle) */}
          {!returning && progress > 0.02 && [0, 1, 2].map((k) => (
            <path key={k} d={"M" + (pulseX - 5 - k * 5) + " " + (axisY - 9) + " Q " + (pulseX - 1 - k * 5) + " " + axisY + " " + (pulseX - 5 - k * 5) + " " + (axisY + 9)}
              fill="none" stroke={C} strokeWidth="1.2" opacity={0.5 - k * 0.13} />
          ))}

          {/* pulse / echo */}
          {progress > 0.001 && progress < 0.999 && (
            <g>
              <circle cx={pulseX} cy={axisY} r="12" fill={returning ? A : C} opacity="0.12" />
              <circle cx={pulseX} cy={axisY} r="5.5" fill={returning ? A : C} />
              <text x={pulseX} y={axisY - 18} textAnchor="middle" fill={returning ? A : C} style={f.mono(700, 8.5, { upper: true, tracking: 0.14 })}>{returning ? "echo" : "ping"}</text>
            </g>
          )}

          {/* target */}
          <rect x={targetX} y={axisY - 26} width="7" height="52" rx="1.5" fill={T.ink} />
          <rect x={targetX} y={axisY - 26} width="7" height="6" fill="#ffffff" opacity="0.18" />
          <text x={targetX + 4} y={axisY + 32} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>target</text>

          {/* distance dimension line */}
          <line x1={sensorX} y1={axisY + 48} x2={targetX} y2={axisY + 48} stroke={T.ink} strokeWidth="0.8" />
          <line x1={sensorX} y1={axisY + 44} x2={sensorX} y2={axisY + 52} stroke={T.ink} strokeWidth="0.8" />
          <line x1={targetX} y1={axisY + 44} x2={targetX} y2={axisY + 52} stroke={T.ink} strokeWidth="0.8" />
          <rect x={(sensorX + targetX) / 2 - 26} y={axisY + 40} width="52" height="16" rx="2" fill={T.paper} />
          <text x={(sensorX + targetX) / 2} y={axisY + 51} textAnchor="middle" fill={C} style={f.mono(700, 10)}>{D} m</text>

          {/* ===== stopwatch (the live timer) ===== */}
          <circle cx={sx} cy={sy} r={sr} fill={T.paper2} stroke={C} strokeWidth="1.4" />
          {Array.from({ length: 12 }).map((_, k) => {
            const a = (k / 12) * Math.PI * 2 - Math.PI / 2;
            return <line key={k} x1={sx + Math.cos(a) * (sr - 4)} y1={sy + Math.sin(a) * (sr - 4)} x2={sx + Math.cos(a) * (sr - 1)} y2={sy + Math.sin(a) * (sr - 1)} stroke={T.mute} strokeWidth="1" />;
          })}
          <line x1={sx} y1={sy} x2={handX} y2={handY} stroke={A} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx={sx} cy={sy} r="3" fill={A} />
          <text x={sx} y={sy + sr + 16} textAnchor="middle" fill={A} style={f.mono(700, 13)}>{displayMs.toFixed(0)} ms</text>
          <text x={sx} y={sy - sr - 8} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>timing the echo</text>

          {/* ===== live equation ===== */}
          {boxes.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={186} width={b.w} height={34} rx={4} fill={T.paper2} stroke={b.col} strokeWidth="1.2" />
              <text x={b.x + b.w / 2} y={199} textAnchor="middle" fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.12 })}>{b.lab}</text>
              <text x={b.x + b.w / 2} y={214} textAnchor="middle" fill={b.col} style={f.mono(700, 12)}>{b.val}</text>
            </g>
          ))}
          <text x={298} y={214} textAnchor="middle" fill={T.ink} style={f.mono(700, 15)}>×</text>
          <text x={426} y={214} textAnchor="middle" fill={T.ink} style={f.mono(700, 14)}>/ 2</text>
          <text x={460} y={214} textAnchor="middle" fill={T.ink} style={f.mono(700, 15)}>=</text>
          <text x={372} y={238} textAnchor="middle" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.12 })}>out and back, so halve the time</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={D} set={setD} min={2} max={20} color={A} label="Target distance" suffix={D + " m"} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((p) => !p)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Round trip", v: tMs.toFixed(0) + " ms", color: A },
        { l: "Pulse speed", v: v + " m/s", color: C },
        { l: "Distance", v: measured.toFixed(1) + " m", color: okC },
      ]} />

      <Caption color={C}>
        Send a pulse, then time how long the echo takes to return. Multiply that
        round-trip time by the pulse speed and halve it, because the pulse covers
        the distance twice, out and back. The result is the range. That is how
        SONAR, ultrasonic sensors, and LiDAR measure distance.
      </Caption>
    </div>
  );
}

/* ---------- PYS-07 The aperture tradeoff ---------- */
function ExtraAperture() {
  // PYS-07 "The aperture tradeoff" (concept 2). Distinct from DemoPinhole,
  // which covers straight-line rays and the flipped image. Here the focus is
  // the optimization: a smaller hole gives a sharper but dimmer spot; a bigger
  // hole gives a brighter but blurrier spot. The image-quality curve (the
  // product of sharpness and brightness) peaks at an in-between aperture, the
  // sweet spot. No rays, no flipped image.
  const C = CAMP.pystem.ink, AC = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [a, setA] = useState(5);            // aperture 1..12
  const sharpN = (12 - a) / 11;             // 1 (small hole) -> 0 (big hole)
  const brightN = Math.pow(a / 12, 0.7);    // rises with hole area
  const quality = sharpN * brightN;
  // optimum + peak quality (sample integer apertures)
  let optA = 1, qPeak = 0;
  for (let k = 1; k <= 12; k++) {
    const q = ((12 - k) / 11) * Math.pow(k / 12, 0.7);
    if (q > qPeak) { qPeak = q; optA = k; }
  }
  const qN = quality / qPeak;
  let result, resultC;
  if (a < optA - 1) { result = "sharp, dim"; resultC = C; }
  else if (a > optA + 1) { result = "bright, blurry"; resultC = AC; }
  else { result = "balanced"; resultC = okC; }

  // ---- scene geometry ----
  const VW = 560, VH = 240;
  const cy = 128;
  const srcX = 56, plateX0 = 94, plateX1 = 126, plateCx = 110, screenX = 208;
  const plateY0 = 58, plateY1 = 198;
  const rHole = 3 + ((a - 1) / 11) * 12;     // 3 -> 15
  const rSpot = 5 + ((a - 1) / 11) * 15;     // 5 -> 20
  const blurPx = ((a - 1) / 11) * 4.5;       // 0 -> 4.5
  const holePath =
    "M" + plateX0 + " " + plateY0 + " L" + plateX1 + " " + plateY0 +
    " L" + plateX1 + " " + plateY1 + " L" + plateX0 + " " + plateY1 + " Z " +
    "M" + (plateCx - rHole) + " " + cy +
    " A " + rHole + " " + rHole + " 0 1 0 " + (plateCx + rHole) + " " + cy +
    " A " + rHole + " " + rHole + " 0 1 0 " + (plateCx - rHole) + " " + cy + " Z";

  // ---- chart geometry ----
  const pn = { x: 250, y: 50, w: 266, h: 174 };
  const plotL = pn.x + 40, plotR = pn.x + pn.w - 16, plotTop = pn.y + 40, plotBot = pn.y + pn.h - 24;
  const aX = (v) => plotL + ((v - 1) / 11) * (plotR - plotL);
  const vY = (v) => plotBot - v * (plotBot - plotTop);
  const sharpPts = [], brightPts = [], qualPts = [];
  for (let k = 1; k <= 12; k += 0.5) {
    const s = (12 - k) / 11, b = Math.pow(k / 12, 0.7);
    sharpPts.push(aX(k).toFixed(1) + "," + vY(clamp(s, 0, 1)).toFixed(1));
    brightPts.push(aX(k).toFixed(1) + "," + vY(clamp(b, 0, 1)).toFixed(1));
    qualPts.push(aX(k).toFixed(1) + "," + vY(clamp((s * b) / qPeak, 0, 1)).toFixed(1));
  }

  return (
    <div>
      <Field height={250}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={26} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>the aperture tradeoff</text>
          <text x={40} y={40} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>sharp vs bright, find the sweet spot</text>

          {/* light beam funnelling through the hole to the spot (drawn behind the plate) */}
          <polygon points={srcX + ",126 " + plateCx + "," + (cy - rHole) + " " + plateCx + "," + (cy + rHole) + " " + srcX + ",130"} fill={AC} opacity="0.10" />
          <polygon points={plateCx + "," + (cy - rHole) + " " + screenX + "," + (cy - rSpot) + " " + screenX + "," + (cy + rSpot) + " " + plateCx + "," + (cy + rHole)} fill={AC} opacity="0.10" />

          {/* light source */}
          <circle cx={srcX} cy={cy} r="9" fill={AC} opacity="0.25" />
          <circle cx={srcX} cy={cy} r="5" fill={AC} stroke={T.ink} strokeWidth="0.8" />
          {Array.from({ length: 6 }).map((_, i) => {
            const ang = (i / 6) * Math.PI * 2;
            return <line key={i} x1={srcX + Math.cos(ang) * 8} y1={cy + Math.sin(ang) * 8} x2={srcX + Math.cos(ang) * 12} y2={cy + Math.sin(ang) * 12} stroke={AC} strokeWidth="1" strokeLinecap="round" opacity="0.7" />;
          })}
          <text x={srcX} y={212} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>light</text>

          {/* foil plate with a round hole (the aperture) */}
          <path d={holePath} fill={T.ink} fillRule="evenodd" />
          <circle cx={plateCx} cy={cy} r={rHole} fill="none" stroke={AC} strokeWidth="1.2" />
          <text x={plateCx} y={212} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>aperture</text>

          {/* screen + image spot */}
          <rect x={screenX} y={plateY0} width="3" height={plateY1 - plateY0} fill={T.ink} opacity="0.55" />
          <g style={{ filter: "blur(" + blurPx.toFixed(2) + "px)" }}>
            <circle cx={screenX + 1} cy={cy} r={rSpot} fill={AC} opacity={brightN} />
            <circle cx={screenX + 1} cy={cy} r={rSpot * 0.5} fill={AC} opacity={clamp(brightN + 0.15, 0, 1)} />
          </g>
          <text x={screenX + 1} y={212} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>image spot</text>

          {/* ===== optimization chart ===== */}
          <g>
            <rect x={pn.x} y={pn.y} width={pn.w} height={pn.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={pn.x + 12} y={pn.y + 16} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>image quality</text>
            {/* legend */}
            {[["sharp", C], ["bright", AC], ["quality", okC]].map(([lab, col], i) => (
              <g key={i} transform={"translate(" + (pn.x + 92 + i * 58) + " " + (pn.y + 12) + ")"}>
                <line x1={0} y1={0} x2={12} y2={0} stroke={col} strokeWidth="2.4" />
                <text x={15} y={3} fill={col} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>{lab}</text>
              </g>
            ))}
            {/* sweet-spot band + marker */}
            <line x1={aX(optA)} y1={plotTop} x2={aX(optA)} y2={plotBot} stroke={okC} strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
            <text x={aX(optA)} y={plotTop - 13} textAnchor="middle" fill={okC} style={f.mono(700, 8, { upper: true, tracking: 0.1 })}>best</text>
            <polygon points={aX(optA) + "," + (plotTop - 2) + " " + (aX(optA) - 3) + "," + (plotTop - 9) + " " + (aX(optA) + 3) + "," + (plotTop - 9)} fill={okC} />
            {/* baseline */}
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            {/* curves */}
            <polyline points={sharpPts.join(" ")} fill="none" stroke={C} strokeWidth="1.6" opacity="0.85" />
            <polyline points={brightPts.join(" ")} fill="none" stroke={AC} strokeWidth="1.6" opacity="0.85" />
            <polyline points={qualPts.join(" ")} fill="none" stroke={okC} strokeWidth="2.6" />
            {/* current aperture marker */}
            <line x1={aX(a)} y1={plotTop} x2={aX(a)} y2={plotBot} stroke={T.ink} strokeDasharray="2 3" strokeWidth="1" opacity="0.6" />
            <circle cx={aX(a)} cy={vY(clamp(qN, 0, 1))} r="3.6" fill={okC} stroke={T.paper} strokeWidth="1.2" />
            {/* axis labels */}
            <text x={plotL} y={plotBot + 13} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>small hole</text>
            <text x={plotR} y={plotBot + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>big hole</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={a} set={setA} min={1} max={12} color={AC} label="Aperture" suffix={a} />
      </div>

      <Readout items={[
        { l: "Sharpness", v: Math.round(sharpN * 100) + "%", color: C },
        { l: "Brightness", v: Math.round(brightN * 100) + "%", color: AC },
        { l: "Image quality", v: Math.round(qN * 100) + "%", color: okC },
        { l: "Verdict", v: result, color: resultC },
      ]} />

      <Caption color={C}>
        A pinhole has no lens, so hole size sets the result. A small hole passes
        a narrow bundle of light: the spot is sharp but dim. A big hole floods
        the screen: bright but blurry. Image quality is best at an in-between
        aperture, the sweet spot, where sharpness and brightness balance.
      </Caption>
    </div>
  );
}

/* ---------- PYS-08 Center of mass ---------- */
function ExtraCenterMass() {
  // PYS-08 "Center of mass" (concept 1). Distinct from ExtraForceMap, which
  // maps force vectors and equilibrium. Here a figure stands on a base of
  // support carrying a load. The center of mass is the average spot of its
  // weight; a line of gravity drops straight down from it. The body stays
  // balanced while that line lands inside the base. Lean until the line passes
  // the base edge and it tips. Carrying the load low keeps the center of mass
  // low, which raises the lean it can survive.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [lean, setLean] = useState(12);   // tilt deg, -50..50
  const [hgt, setHgt] = useState(4);       // load height 1..10 (low -> high CoM)
  const rad = (lean * Math.PI) / 180;

  // ---- scene geometry ----
  const VW = 560, VH = 320;
  const gy = 208, bx = 168, d = 40;        // ground, base center, base half-width
  const loadY = gy - (34 + ((hgt - 1) / 9) * 86);  // waist (gy-34) up to overhead (gy-120)
  const comY = 0.56 * (gy - 44) + 0.44 * loadY;    // combined center of mass (y)
  const comH = gy - comY;                  // CoM height above ground
  const tipDeg = (Math.atan(d / comH) * 180) / Math.PI;

  // pivot = base edge in the lean direction; rotate (bx,comY) about it
  const sgn = lean > 0 ? 1 : lean < 0 ? -1 : 0;
  const pvx = bx + sgn * d, pvy = gy;
  const dxp = bx - pvx, dyp = comY - pvy;
  const comX = pvx + dxp * Math.cos(rad) - dyp * Math.sin(rad);
  const comWy = pvy + dxp * Math.sin(rad) + dyp * Math.cos(rad);
  const inBase = comX >= bx - d - 0.5 && comX <= bx + d + 0.5;
  const tipping = !inBase;
  const margin = tipDeg - Math.abs(lean);
  const stC = tipping ? warnC : okC;

  // figure landmarks (upright; rotated as a group about the pivot)
  const hipY = gy - 36, shoY = gy - 66, headY = gy - 80;

  // ---- right tip meter (protractor fan opening upward) ----
  const gp = { x: 372, y: 56, w: 148, h: 158 };
  const gcx = gp.x + gp.w / 2, gcy = gp.y + 104, rg = 60, gMax = 56;
  const ga = (a) => [gcx + rg * Math.sin((a * Math.PI) / 180), gcy - rg * Math.cos((a * Math.PI) / 180)];
  const arc = (a1, a2) => {
    const p = ga(a1), q = ga(a2);
    return "M" + p[0].toFixed(1) + "," + p[1].toFixed(1) + " A" + rg + " " + rg + " 0 0 1 " + q[0].toFixed(1) + "," + q[1].toFixed(1);
  };
  const ndl = ga(clamp(lean, -gMax, gMax));
  const tickL = ga(-tipDeg), tickR = ga(tipDeg);
  const tickLo = [gcx + (rg + 7) * Math.sin((-tipDeg * Math.PI) / 180), gcy - (rg + 7) * Math.cos((-tipDeg * Math.PI) / 180)];
  const tickRo = [gcx + (rg + 7) * Math.sin((tipDeg * Math.PI) / 180), gcy - (rg + 7) * Math.cos((tipDeg * Math.PI) / 180)];

  // ---- bottom panel: tip angle vs load height ----
  const bp = { x: 40, y: 234, w: 480, h: 74 };
  const plotL = bp.x + 74, plotR = bp.x + bp.w - 26, plotTop = bp.y + 26, plotBot = bp.y + bp.h - 18;
  const tipAt = (hh) => {
    const ly = gy - (34 + ((hh - 1) / 9) * 86);
    const cy = 0.56 * (gy - 44) + 0.44 * ly;
    return (Math.atan(d / (gy - cy)) * 180) / Math.PI;
  };
  const tMin = tipAt(10), tMax = tipAt(1);
  const hX = (hh) => plotL + ((hh - 1) / 9) * (plotR - plotL);
  const tY = (t) => plotBot - ((t - tMin) / (tMax - tMin)) * (plotBot - plotTop);
  const curve = [];
  for (let hh = 1; hh <= 10; hh += 0.5) curve.push(hX(hh).toFixed(1) + "," + tY(tipAt(hh)).toFixed(1));
  const tippyX = hX(7);

  return (
    <div>
      <Field height={330}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={26} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>center of mass</text>
          <text x={40} y={40} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>balance over the base</text>

          {/* ground */}
          <line x1={28} y1={gy} x2={356} y2={gy} stroke={T.ink} strokeWidth="1" />
          {/* base of support */}
          <rect x={bx - d} y={gy} width={2 * d} height={7} fill={stC} opacity="0.32" />
          <rect x={bx - d} y={gy} width={2 * d} height={7} fill="none" stroke={stC} strokeWidth="1.4" />
          <line x1={bx - d} y1={gy - 5} x2={bx - d} y2={gy + 12} stroke={T.ink} strokeWidth="1" />
          <line x1={bx + d} y1={gy - 5} x2={bx + d} y2={gy + 12} stroke={T.ink} strokeWidth="1" />
          <text x={bx} y={gy + 24} textAnchor="middle" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>base of support</text>

          {/* foot shadow (stays on ground) */}
          <ellipse cx={bx} cy={gy - 1} rx="20" ry="3.5" fill="#000" opacity="0.12" />

          {/* figure + load + CoM dot, rotated about the pivot edge */}
          <g transform={"rotate(" + lean + " " + pvx + " " + pvy + ")"}>
            <line x1={bx - 10} y1={gy} x2={bx} y2={hipY} stroke={T.ink} strokeWidth="3" strokeLinecap="round" />
            <line x1={bx + 10} y1={gy} x2={bx} y2={hipY} stroke={T.ink} strokeWidth="3" strokeLinecap="round" />
            <line x1={bx} y1={hipY} x2={bx} y2={shoY} stroke={T.ink} strokeWidth="3.4" strokeLinecap="round" />
            <line x1={bx - 7} y1={shoY + 2} x2={bx - 5} y2={loadY + 4} stroke={T.ink} strokeWidth="2.4" strokeLinecap="round" />
            <line x1={bx + 7} y1={shoY + 2} x2={bx + 5} y2={loadY + 4} stroke={T.ink} strokeWidth="2.4" strokeLinecap="round" />
            <circle cx={bx} cy={headY} r="8" fill={T.paper2} stroke={T.ink} strokeWidth="1.5" />
            {/* load */}
            <rect x={bx - 9} y={loadY - 6} width="18" height="13" rx="2" fill={A} stroke={T.ink} strokeWidth="1" />
            <rect x={bx - 9} y={loadY - 6} width="18" height="4" rx="2" fill="#ffffff" opacity="0.25" />
            {/* center of mass dot */}
            <circle cx={bx} cy={comY} r="6.5" fill={A} stroke={stC} strokeWidth="2" />
            <circle cx={bx} cy={comY} r="2" fill={T.paper} />
          </g>

          {/* line of gravity (world-vertical from CoM) */}
          <line x1={comX} y1={comWy} x2={comX} y2={gy} stroke={stC} strokeWidth="1.4" strokeDasharray="3 3" />
          <polygon points={comX + "," + (gy) + " " + (comX - 4) + "," + (gy - 7) + " " + (comX + 4) + "," + (gy - 7)} fill={stC} />

          {/* labels with leaders */}
          {/* legend: copper dot = center of mass, dashed line = line of gravity */}
          <g>
            <circle cx={54} cy={64} r="5.5" fill={A} stroke={T.ink} strokeWidth="1.2" />
            <text x={66} y={67} fill={T.ink} style={f.mono(600, 9, { upper: true, tracking: 0.06 })}>center of mass</text>
            <line x1={49} y1={80} x2={59} y2={90} stroke={T.ink} strokeWidth="1.6" strokeDasharray="3 2" />
            <text x={66} y={87} fill={T.ink} style={f.mono(600, 9, { upper: true, tracking: 0.06 })}>line of gravity</text>
          </g>

          {/* ===== right tip meter ===== */}
          <g>
            <rect x={gp.x} y={gp.y} width={gp.w} height={gp.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={gp.x + 12} y={gp.y + 17} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>tip meter</text>
            <path d={arc(-gMax, -tipDeg)} fill="none" stroke={warnC} strokeWidth="6" opacity="0.85" strokeLinecap="round" />
            <path d={arc(tipDeg, gMax)} fill="none" stroke={warnC} strokeWidth="6" opacity="0.85" strokeLinecap="round" />
            <path d={arc(-tipDeg, tipDeg)} fill="none" stroke={okC} strokeWidth="6" opacity="0.9" strokeLinecap="round" />
            <line x1={tickL[0]} y1={tickL[1]} x2={tickLo[0]} y2={tickLo[1]} stroke={T.ink} strokeWidth="1" />
            <line x1={tickR[0]} y1={tickR[1]} x2={tickRo[0]} y2={tickRo[1]} stroke={T.ink} strokeWidth="1" />
            <text x={gcx} y={gp.y + 30} textAnchor="middle" fill={okC} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>safe lean</text>
            <line x1={gcx} y1={gcy} x2={ndl[0]} y2={ndl[1]} stroke={A} strokeWidth="2.4" strokeLinecap="round" />
            <circle cx={gcx} cy={gcy} r="4" fill={A} />
            <text x={gcx} y={gcy + 22} textAnchor="middle" fill={C} style={f.mono(700, 13)}>{Math.abs(lean) + "°"}</text>
            <text x={gcx} y={gcy + 34} textAnchor="middle" fill={stC} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>{tipping ? "tips over" : "holds"}</text>
          </g>

          {/* ===== bottom panel: tip angle vs load height ===== */}
          <g>
            <rect x={bp.x} y={bp.y} width={bp.w} height={bp.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={bp.x + 12} y={bp.y + 15} fill={T.mute} style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>tip angle vs load height</text>
            <rect x={tippyX} y={plotTop} width={plotR - tippyX} height={plotBot - plotTop} fill={warnC} opacity="0.1" />
            <text x={(tippyX + plotR) / 2} y={plotTop + 9} textAnchor="middle" fill={warnC} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>tippy</text>
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            <polyline points={curve.join(" ")} fill="none" stroke={A} strokeWidth="2" />
            <line x1={hX(hgt)} y1={plotTop} x2={hX(hgt)} y2={plotBot} stroke={T.ink} strokeDasharray="3 3" strokeWidth="1" opacity="0.7" />
            <circle cx={hX(hgt)} cy={tY(tipDeg)} r="3.4" fill={A} stroke={T.paper} strokeWidth="1" />
            <text x={bp.x + 12} y={plotBot + 1} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>tip angle</text>
            <text x={plotL} y={plotBot + 14} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>low CoM</text>
            <text x={plotR} y={plotBot + 14} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>high CoM</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={lean} set={setLean} min={-50} max={50} color={A} label="Lean" suffix={lean + "°"} />
        <Slider val={hgt} set={setHgt} min={1} max={10} color={C} label="Load height" suffix={hgt} />
      </div>

      <Readout items={[
        { l: "Line of gravity", v: inBase ? "in base" : "past edge", color: stC },
        { l: "Tip angle", v: tipDeg.toFixed(0) + "°", color: C },
        { l: "Margin", v: (margin >= 0 ? margin.toFixed(0) : "0") + "°", color: margin >= 0 ? okC : warnC },
        { l: "Stance", v: tipping ? "tipping" : "stable", color: stC },
      ]} />

      <Caption color={C}>
        The center of mass is the average position of your weight. The dashed
        line of gravity drops straight down from it. You stay balanced while that
        line lands inside the base of support; lean until it passes the edge and
        you tip. Carrying the load low keeps the center of mass low, which raises
        the lean angle you can survive before tipping.
      </Caption>
    </div>
  );
}

/* ---------- PYS-08 Mapping forces ---------- */
function ExtraForceMap() {
  // PYS-08 "Mapping forces" (concept 2). Distinct from ExtraCenterMass, which
  // covers center of mass over the base of support. Here a person on a
  // low-ropes element hangs from two support ropes. We MAP each force as an
  // arrow where it acts: gravity (weight) pulls straight down; each rope pulls
  // along its length. For the body to stay still the arrows must add to zero,
  // shown by the closed tip-to-tail triangle. Spreading the ropes wider makes
  // each rope pull much harder, so balance becomes difficult.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [ang, setAng] = useState(38);    // rope spread half-angle from vertical, deg
  const [load, setLoad] = useState(60);  // body weight, percent
  const th = (ang * Math.PI) / 180;
  const cos = Math.cos(th), sin = Math.sin(th);

  // ---- force model (load sets magnitude; angle sets the tension ratio) ----
  const Wf = 100 * load / 60;            // weight
  const Tn = Wf / (2 * cos);             // tension in each rope
  const ratio = Tn / Wf;                 // 1 / (2 cos th)
  const hold = ang <= 45 ? "easy" : ang <= 66 ? "moderate" : "hard";
  const holdC = ang <= 45 ? okC : ang <= 66 ? A : warnC;

  // ---- scene geometry (viewBox 560x320; bounded zones) ----
  const VW = 560, VH = 320;
  const px = 192, py = 150;              // person (the load point)
  const Ra = 92;                         // rope length to anchor (kept short so anchors clear the titles)
  const aLx = px - Ra * sin, aLy = py - Ra * cos;
  const aRx = px + Ra * sin, aRy = py - Ra * cos;
  const kp = 0.5;
  const Lw = clamp(Wf * kp, 28, 76);     // weight arrow length (min 28 so it is always clearly visible)
  const Lt = clamp(Tn * kp, 24, 82);     // tension arrow length (< Ra so tip stays inside)
  const wTy = py + Lw;
  const tLx = px - Lt * sin, tLy = py - Lt * cos;
  const tRx = px + Lt * sin, tRy = py - Lt * cos;

  // arrowhead: triangle at tip (x,y) pointing along (dx,dy)
  const head = (x, y, dx, dy, s) => {
    const m = Math.hypot(dx, dy) || 1, ux = dx / m, uy = dy / m;
    const bx = x - s * ux, by = y - s * uy, ox = -uy * s * 0.55, oy = ux * s * 0.55;
    return x + "," + y + " " + (bx + ox) + "," + (by + oy) + " " + (bx - ox) + "," + (by - oy);
  };

  // ---- force-sum panel: tip-to-tail W + Tleft + Tright closes to zero ----
  const sp = { x: 372, y: 20, w: 148, h: 196 };
  const triW = Tn * sin, triH = Wf;      // bbox in force units
  const ssum = Math.min((sp.w - 54) / Math.max(triW, 1), (sp.h - 80) / triH);
  const cxp = sp.x + sp.w / 2, cyp = sp.y + 46 + (sp.h - 80) / 2;
  const ox0 = cxp + (triW / 2) * ssum, oy0 = cyp - (triH / 2) * ssum;
  const SO = { x: ox0, y: oy0 };
  const SA = { x: ox0, y: oy0 + Wf * ssum };
  const SB = { x: ox0 - Tn * sin * ssum, y: oy0 + (Wf - Tn * cos) * ssum };

  // ---- tradeoff panel: rope force vs spread angle ----
  const tp = { x: 40, y: 234, w: 480, h: 74 };
  const plotL = tp.x + 64, plotR = tp.x + tp.w - 26, plotTop = tp.y + 16, plotBot = tp.y + tp.h - 18;
  const aMin = 20, aMax = 78;
  const rMin = 1 / (2 * Math.cos((aMin * Math.PI) / 180));
  const rMax = 1 / (2 * Math.cos((aMax * Math.PI) / 180));
  const angX = (d) => plotL + ((d - aMin) / (aMax - aMin)) * (plotR - plotL);
  const ratY = (r) => plotBot - ((r - rMin) / (rMax - rMin)) * (plotBot - plotTop);
  const curve = [];
  for (let d = aMin; d <= aMax; d += 2) {
    curve.push(angX(d).toFixed(1) + "," + ratY(1 / (2 * Math.cos((d * Math.PI) / 180))).toFixed(1));
  }
  const hardX = angX(67);

  return (
    <div>
      <Field height={330}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          {/* titles */}
          <text x={40} y={26} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>mapping forces</text>
          <text x={40} y={40} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>low-ropes force map</text>

          {/* vertical reference through the body */}
          <line x1={px} y1={py - Ra - 4} x2={px} y2={224} stroke={T.ink} strokeDasharray="2 5" strokeWidth="0.5" opacity="0.3" />

          {/* ropes to anchors (animated tension flow) */}
          {[[aLx, aLy], [aRx, aRy]].map(([axx, ayy], i) => (
            <line key={"rope" + i} x1={px} y1={py} x2={axx} y2={ayy} stroke={C} strokeWidth="1.5"
              strokeDasharray="5 4" style={{ animation: "dash 0.9s linear infinite" }} opacity="0.5" />
          ))}
          {/* anchors */}
          {[[aLx, aLy], [aRx, aRy]].map(([axx, ayy], i) => (
            <g key={"anc" + i}>
              <line x1={axx - 7} y1={ayy - 7} x2={axx + 7} y2={ayy - 7} stroke={T.ink} strokeWidth="2" />
              {[-5, 0, 5].map((o, k) => (
                <line key={k} x1={axx + o} y1={ayy - 7} x2={axx + o - 3} y2={ayy - 12} stroke={T.ink} strokeWidth="0.9" />
              ))}
              <circle cx={axx} cy={ayy} r="3.4" fill={T.paper} stroke={T.ink} strokeWidth="1.3" />
            </g>
          ))}

          {/* tension force arrows (indigo) */}
          {[[tLx, tLy, -sin, -cos], [tRx, tRy, sin, -cos]].map(([ex, ey, dx, dy], i) => (
            <g key={"ten" + i}>
              <line x1={px} y1={py} x2={ex} y2={ey} stroke={C} strokeWidth="3" strokeLinecap="round" />
              <polygon points={head(ex, ey, dx, dy, 9)} fill={C} />
            </g>
          ))}

          {/* weight arrow (copper, down) */}
          <line x1={px} y1={py} x2={px} y2={wTy} stroke={A} strokeWidth="3" strokeLinecap="round" />
          <polygon points={head(px, wTy, 0, 1, 9)} fill={A} />

          {/* person */}
          <ellipse cx={px + 2} cy={py + 5} rx="11" ry="4" fill="#000" opacity="0.12" />
          <circle cx={px} cy={py} r="9" fill={T.paper2} stroke={T.ink} strokeWidth="1.4" />
          <circle cx={px} cy={py} r="3" fill={C} />

          {/* label: weight */}
          {(() => {
            const lx = px + 16, ly = py + Math.min(Lw - 6, 40);
            return (
              <g>
                <line x1={px + 3} y1={ly} x2={lx} y2={ly} stroke={A} strokeWidth="0.8" />
                <rect x={lx} y={ly - 9} width={58} height={17} rx={3} fill={T.paper} stroke={A} strokeWidth="1" />
                <text x={lx + 29} y={ly + 3} textAnchor="middle" fill={A} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>weight</text>
              </g>
            );
          })()}
          {/* label: rope pull */}
          {(() => {
            const mx = (px + tRx) / 2, my = (py + tRy) / 2;
            const lx = 300, ly = 150;
            return (
              <g>
                <line x1={lx} y1={ly} x2={mx} y2={my} stroke={C} strokeWidth="0.8" />
                <polygon points={head(mx, my, mx - lx, my - ly, 5)} fill={C} />
                <rect x={lx} y={ly - 9} width={70} height={17} rx={3} fill={T.paper} stroke={C} strokeWidth="1" />
                <text x={lx + 35} y={ly + 3} textAnchor="middle" fill={C} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>rope pull</text>
              </g>
            );
          })()}

          {/* ===== force-sum panel ===== */}
          <g>
            <rect x={sp.x} y={sp.y} width={sp.w} height={sp.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={sp.x + 12} y={sp.y + 17} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>force sum</text>
            <text x={sp.x + 12} y={sp.y + 29} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>arrows add tip to tail</text>
            {/* weight segment */}
            <line x1={SO.x} y1={SO.y} x2={SA.x} y2={SA.y} stroke={A} strokeWidth="2.4" strokeLinecap="round" />
            <polygon points={head(SA.x, SA.y, 0, 1, 8)} fill={A} />
            {/* left tension segment */}
            <line x1={SA.x} y1={SA.y} x2={SB.x} y2={SB.y} stroke={C} strokeWidth="2.4" strokeLinecap="round" />
            <polygon points={head(SB.x, SB.y, -sin, -cos, 8)} fill={C} />
            {/* right tension segment back to origin */}
            <line x1={SB.x} y1={SB.y} x2={SO.x} y2={SO.y} stroke={C} strokeWidth="2.4" strokeLinecap="round" />
            <polygon points={head(SO.x, SO.y, sin, -cos, 8)} fill={C} />
            {/* closure marker */}
            <circle cx={SO.x} cy={SO.y} r="4.2" fill="none" stroke={okC} strokeWidth="1.6" />
            <text x={sp.x + sp.w / 2} y={sp.y + sp.h - 14} textAnchor="middle" fill={okC} style={f.mono(700, 9.5, { upper: true, tracking: 0.12 })}>sum = 0 balanced</text>
          </g>

          {/* ===== tradeoff panel: rope force vs angle ===== */}
          <g>
            <rect x={tp.x} y={tp.y} width={tp.w} height={tp.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={tp.x + 12} y={tp.y + 15} fill={T.mute} style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>rope force vs spread</text>
            <rect x={hardX} y={plotTop} width={plotR - hardX} height={plotBot - plotTop} fill={warnC} opacity="0.1" />
            <text x={(hardX + plotR) / 2} y={plotTop + 9} textAnchor="middle" fill={warnC} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>hard</text>
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            <polyline points={curve.join(" ")} fill="none" stroke={A} strokeWidth="2" />
            <line x1={angX(ang)} y1={plotTop} x2={angX(ang)} y2={plotBot} stroke={T.ink} strokeDasharray="3 3" strokeWidth="1" opacity="0.7" />
            <circle cx={angX(ang)} cy={ratY(ratio)} r="3.4" fill={A} stroke={T.paper} strokeWidth="1" />
            <text x={tp.x + 12} y={plotBot + 1} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>force</text>
            <text x={plotL} y={plotBot + 14} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>narrow</text>
            <text x={plotR} y={plotBot + 14} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>wide ropes</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={ang} set={setAng} min={20} max={78} color={C} label="Rope angle" suffix={ang + "°"} />
        <Slider val={load} set={setLoad} min={20} max={120} color={A} label="Load" suffix={load + " %"} />
      </div>

      <Readout items={[
        { l: "Rope force", v: ratio.toFixed(2) + "x wt", color: C },
        { l: "Net force", v: "0 (balanced)", color: okC },
        { l: "Holding", v: hold, color: holdC },
      ]} />

      <Caption color={C}>
        Map every force as an arrow where it acts: gravity pulls the body
        straight down, and each rope pulls along its own length. For the body to
        stay still the arrows must add to zero, which the closed triangle shows.
        Spreading the ropes wider forces each one to pull much harder than the
        body weighs, so balance gets hard long before the ropes look steep.
      </Caption>
    </div>
  );
}

/* ---------- PYS-09 Glide versus control ---------- */
function ExtraGlide() {
  // PYS-09 Hovercraft Hockey: GLIDE vs CONTROL (concept 2, distinct from
  // DemoHover which covers "air cushion cuts friction"). Top-down gym lane:
  // a CD-disc hovercraft puck launches from the start line and glides to a
  // stop near the target. A bigger air cushion (lift) buys reach but widens
  // the spread of where the puck stops, so control drops. Repeated launches
  // leave a grouping of landing marks: tight = controlled, scattered = wild.
  // The lower panel shows the glide-vs-control tradeoff across lift.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const DISC = "#cdcdcd", DISC_DK = "#9a9a9a";

  const [lift, setLift] = useState(5);    // air cushion 1..10
  const [push, setPush] = useState(9);    // launch strength 1..10
  const [playing, setPlaying] = useState(true);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---- Geometry: every zone bounded; nothing overlaps at any setting ----
  const W = 560, H = 320;
  const laneL = 44, laneR = 516;
  const floorTop = 92, floorBot = 156, yMid = (floorTop + floorBot) / 2;
  const startX = 70, wallX = 512;
  const maxTravel = wallX - startX - 12;            // 430
  const targetCx = 372, targetHW = 30;
  const targetL = targetCx - targetHW, targetR = targetCx + targetHW;

  // ---- Glide vs control model ----
  const pushF = 0.32 + 0.68 * (push - 1) / 9;        // 0.32..1.0
  const liftReach = 0.46 + 0.54 * (lift - 1) / 9;    // 0.46..1.0
  const reachFrac = clamp(pushF * liftReach, 0, 1);
  const center = startX + reachFrac * maxTravel;
  const sMin = 8, sMax = 92;
  const S = sMin + (lift - 1) / 9 * (sMax - sMin);   // spread half-width
  const controlPct = clamp(Math.round(100 * (1 - (S - sMin) / (sMax - sMin))), 0, 100);
  const bandL = clamp(center - S, laneL + 4, wallX);
  const bandR = clamp(center + S, laneL + 4, wallX);

  let result, resultC;
  if (center < targetL) { result = "stalls short"; resultC = warnC; }
  else if (center > targetR) { result = "overshoots"; resultC = warnC; }
  else if (S <= 46) { result = "on target"; resultC = okC; }
  else { result = "no control"; resultC = A; }
  const onTarget = result === "on target";

  // ---- Landing grouping (deterministic so the static frame is complete) ----
  const offsets = [-0.92, -0.62, -0.34, -0.12, 0.08, 0.3, 0.55, 0.78, 0.95];

  // ---- Animation: puck glides start -> a landing point, looping ----
  const clockRef = useRef(900);
  const idxRef = useRef(4);
  const [, force] = useState(0);
  const cycle = 1500, glideDur = 1050;
  useRAF(playing, (dt) => {
    clockRef.current += dt;
    if (clockRef.current >= cycle) {
      clockRef.current = 0;
      idxRef.current = (idxRef.current + 1) % offsets.length;
    }
    force((v) => v + 1);
  });
  const progress = clamp(clockRef.current / glideDur, 0, 1);
  const ease = 1 - Math.pow(1 - progress, 3);
  const landingX = clamp(center + offsets[idxRef.current] * S, laneL + 8, wallX - 16);
  const puckX = startX + ease * (landingX - startX);
  const shimmer = clockRef.current;

  // ---- Tradeoff panel geometry ----
  const pX = 44, pY = 202, pW = 472, pH = 104;
  const plotL = pX + 54, plotR = pX + pW - 56, plotTop = pY + 26, plotBot = pY + pH - 22;
  const liftX = (L) => plotL + ((L - 1) / 9) * (plotR - plotL);
  const glideY = (L) => plotBot - ((L - 1) / 9) * (plotBot - plotTop);
  const ctrlY = (L) => plotBot - (1 - (L - 1) / 9) * (plotBot - plotTop);
  const lifts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const glidePts = lifts.map((L) => liftX(L).toFixed(1) + "," + glideY(L).toFixed(1)).join(" ");
  const ctrlPts = lifts.map((L) => liftX(L).toFixed(1) + "," + ctrlY(L).toFixed(1)).join(" ");
  const balL = liftX(4.5), balR = liftX(6.5);

  return (
    <div>
      <Field height={330}>
        <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", height: "100%" }}>
          {/* ===== titles ===== */}
          <text x={laneL} y={26} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>glide vs control</text>
          <text x={laneL} y={40} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>hovercraft target hockey</text>

          {/* ===== lane floor ===== */}
          <rect x={laneL} y={floorTop} width={laneR - laneL} height={floorBot - floorTop} fill={T.paper3} stroke={T.ink} strokeWidth="1" />
          <line x1={laneL} y1={yMid} x2={laneR} y2={yMid} stroke={T.ink} strokeDasharray="2 5" strokeWidth="0.5" opacity="0.45" />

          {/* ===== reach bracket (above floor) ===== */}
          <line x1={startX} y1={80} x2={center} y2={80} stroke={A} strokeWidth="1" />
          <line x1={startX} y1={76} x2={startX} y2={84} stroke={A} strokeWidth="1" />
          <line x1={center} y1={76} x2={center} y2={84} stroke={A} strokeWidth="1" />
          <text x={(startX + center) / 2} y={73} textAnchor="middle" fill={A} style={f.mono(600, 8.5, { upper: true, tracking: 0.14 })}>reach</text>

          {/* ===== spread band (where the puck might stop) ===== */}
          <rect x={bandL} y={floorTop} width={Math.max(0, bandR - bandL)} height={floorBot - floorTop} fill={A} opacity="0.16" />

          {/* ===== target crease ===== */}
          <rect x={targetL} y={floorTop} width={targetHW * 2} height={floorBot - floorTop} fill={onTarget ? okC : C} opacity={onTarget ? 0.16 : 0.07} />
          <line x1={targetL} y1={floorTop} x2={targetL} y2={floorBot} stroke={onTarget ? okC : C} strokeWidth="1.4" />
          <line x1={targetR} y1={floorTop} x2={targetR} y2={floorBot} stroke={onTarget ? okC : C} strokeWidth="1.4" />
          <text x={targetCx} y={86} textAnchor="middle" fill={onTarget ? okC : C} style={f.mono(700, 9, { upper: true, tracking: 0.18 })}>target</text>

          {/* ===== start line + wall ===== */}
          <line x1={startX} y1={floorTop} x2={startX} y2={floorBot} stroke={T.ink} strokeWidth="1.2" />
          <line x1={wallX} y1={floorTop} x2={wallX} y2={floorBot} stroke={T.ink} strokeWidth="2" />
          <text x={startX} y={168} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>start</text>
          <text x={wallX} y={168} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>wall</text>

          {/* ===== landing grouping ===== */}
          {offsets.map((off, i) => {
            const dx = clamp(center + off * S, laneL + 8, wallX - 4);
            const dy = 132 + ((i % 3) - 1) * 5;
            const cur = i === idxRef.current;
            return <circle key={i} cx={dx} cy={dy} r={cur ? 3.6 : 2.5} fill={C} opacity={cur ? 0.95 : 0.4} />;
          })}

          {/* ===== center (stop) marker ===== */}
          <line x1={center} y1={floorTop} x2={center} y2={floorBot} stroke={C} strokeWidth="1.1" strokeDasharray="3 3" opacity="0.8" />
          <polygon points={(center - 4) + "," + floorTop + " " + (center + 4) + "," + floorTop + " " + center + "," + (floorTop + 6)} fill={C} />

          {/* ===== glide path + puck ===== */}
          <line x1={startX} y1={yMid} x2={puckX} y2={yMid} stroke={A} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <g>
            <ellipse cx={puckX + 2} cy={yMid + 8} rx="14" ry="4.5" fill="#000" opacity="0.12" />
            <ellipse cx={puckX} cy={yMid + 7} rx="16" ry={3 + lift * 0.7} fill={A} opacity="0.22" />
            {Array.from({ length: 5 }).map((_, i) => {
              const lx = puckX - 10 + i * 5;
              const len = 5 + lift * 0.8 + Math.sin(shimmer * 0.02 + i) * 2.2;
              return <line key={"a" + i} x1={lx} y1={yMid + 7} x2={lx} y2={yMid + 7 + len} stroke={A} strokeWidth="1.1" opacity="0.45" strokeLinecap="round" />;
            })}
            <ellipse cx={puckX} cy={yMid} rx="14" ry="7" fill={DISC} stroke={T.ink} strokeWidth="0.9" />
            <ellipse cx={puckX} cy={yMid + 1.5} rx="14" ry="7" fill="none" stroke={DISC_DK} strokeWidth="0.5" opacity="0.6" />
            <ellipse cx={puckX} cy={yMid - 5} rx="8" ry="5.5" fill={A} opacity="0.92" stroke={T.ink} strokeWidth="0.6" />
            <circle cx={puckX} cy={yMid - 6} r="1.8" fill={T.ink} />
            <ellipse cx={puckX - 3.5} cy={yMid - 6.5} rx="2.6" ry="1.2" fill="#ffffff" opacity="0.6" />
          </g>

          {/* ===== verdict pill + leader ===== */}
          {(() => {
            const pw = 116, ph = 22, px = laneR - pw, py = 12;
            const mx = clamp(center, laneL + 8, wallX - 4), my = floorTop - 1;
            const lx = px + 14, ly = py + ph;
            const ang = Math.atan2(my - ly, mx - lx);
            const ah = 5;
            const a1x = mx - ah * Math.cos(ang - 0.5), a1y = my - ah * Math.sin(ang - 0.5);
            const a2x = mx - ah * Math.cos(ang + 0.5), a2y = my - ah * Math.sin(ang + 0.5);
            return (
              <g>
                <line x1={lx} y1={ly} x2={mx} y2={my} stroke={resultC} strokeWidth="0.9" />
                <polygon points={mx + "," + my + " " + a1x + "," + a1y + " " + a2x + "," + a2y} fill={resultC} />
                <rect x={px} y={py + 2} width={pw} height={ph} rx={4} fill="#000" opacity="0.12" />
                <rect x={px} y={py} width={pw} height={ph} rx={4} fill={T.paper} stroke={resultC} strokeWidth="1.1" />
                <circle cx={px + 12} cy={py + ph / 2} r="3.5" fill={resultC} />
                <text x={px + 24} y={py + ph / 2 + 4} fill={resultC} style={f.mono(700, 10.5, { upper: true, tracking: 0.08 })}>{result}</text>
              </g>
            );
          })()}

          {/* ===== tradeoff panel ===== */}
          <g>
            <rect x={pX} y={pY} width={pW} height={pH} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={pX + 12} y={pY + 16} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>lift tradeoff</text>
            <rect x={balL} y={plotTop} width={balR - balL} height={plotBot - plotTop} fill={okC} opacity="0.12" />
            <text x={(balL + balR) / 2} y={plotTop - 4} textAnchor="middle" fill={okC} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>balanced</text>
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            <polyline points={glidePts} fill="none" stroke={A} strokeWidth="2" />
            <polyline points={ctrlPts} fill="none" stroke={C} strokeWidth="2" />
            <text x={plotR + 5} y={glideY(10) + 3} fill={A} style={f.mono(700, 8.5, { upper: true, tracking: 0.12 })}>glide</text>
            <text x={plotR + 5} y={ctrlY(10) + 3} fill={C} style={f.mono(700, 8.5, { upper: true, tracking: 0.12 })}>control</text>
            <line x1={liftX(lift)} y1={plotTop} x2={liftX(lift)} y2={plotBot} stroke={T.ink} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            <circle cx={liftX(lift)} cy={glideY(lift)} r="3.2" fill={A} stroke={T.paper} strokeWidth="1" />
            <circle cx={liftX(lift)} cy={ctrlY(lift)} r="3.2" fill={C} stroke={T.paper} strokeWidth="1" />
            <polygon points={(liftX(lift) - 4) + "," + (plotBot + 2) + " " + (liftX(lift) + 4) + "," + (plotBot + 2) + " " + liftX(lift) + "," + (plotBot + 8)} fill={T.ink} />
            <text x={plotL} y={plotBot + 16} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>low lift</text>
            <text x={plotR} y={plotBot + 16} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>high lift</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={lift} set={setLift} min={1} max={10} color={A} label="Air cushion" suffix={lift} />
        <Slider val={push} set={setPush} min={1} max={10} color={C} label="Push" suffix={push} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((p) => !p)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Reach", v: Math.round(reachFrac * 100) + " (rel)", color: A },
        { l: "Control", v: controlPct + "%", color: C },
        { l: "Result", v: result, color: resultC },
      ]} />

      <Caption color={C}>
        A big air cushion gives a long, low-friction glide, but the puck becomes
        hard to stop where you aim, so it scatters past the target. A small
        cushion keeps tight control yet stalls short. Winning target hockey means
        balancing lift and push: enough glide to reach the target, enough control
        to stop on it.
      </Caption>
    </div>
  );
}

/* ---------- PYS-10 Spectra as fingerprints ---------- */
function ExtraSpectraFingerprint() {
  // PYS-10 "Spectra as fingerprints" (concept 2). Sibling DemoSpectra ("Diffraction
  // splits light") shows a grating spreading white light into continuous vs line
  // spectra. This demo owns the fingerprint idea: each element emits a unique line
  // pattern, so you identify a mystery source by matching its spectrum to a known
  // reference, the same science behind firework colors from metal salts.
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;
  const els = [
    { k: "Na", name: "sodium", lines: [0.6, 0.63], col: "#f0c64a", fw: "yellow", fwc: "#f0c64a" },
    { k: "Sr", name: "strontium", lines: [0.72, 0.82, 0.9], col: "#d8442e", fw: "red", fwc: "#d8442e" },
    { k: "Cu", name: "copper", lines: [0.28, 0.4, 0.5], col: "#33a6b8", fw: "blue-green", fwc: "#33a6b8" },
    { k: "Ba", name: "barium", lines: [0.42, 0.5, 0.58], col: "#5aa83a", fw: "green", fwc: "#5aa83a" },
  ];
  const [pick, setPick] = useState(0);
  const cur = els[pick];
  const mbX0 = 40, mbX1 = 420, mbY = 60, mbH = 26;
  const spec = (x0, x1, y, h, lines, col) => (
    <g>
      <rect x={x0} y={y} width={x1 - x0} height={h} fill="#0d0a08" />
      {lines.map((p, i) => <rect key={i} x={x0 + p * (x1 - x0) - 1.5} y={y} width="3" height={h} fill={col} />)}
    </g>
  );
  const cardW = 100, cardGap = 8, cardX = (i) => 26 + i * (cardW + cardGap), cardY = 116, cardH = 96;

  return (
    <div>
      <Field height={250}>
        <svg viewBox="0 0 460 240" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="22" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Spectra as fingerprints</text>
          <text x="20" y="36" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.14 })}>match the mystery source to its element</text>

          <text x={mbX0} y={mbY - 4} fill={A} style={f.mono(700, 8, { upper: true, tracking: 0.14 })}>mystery source</text>
          {spec(mbX0, mbX1, mbY, mbH, cur.lines, cur.col)}
          <text x={mbX0} y={mbY + mbH + 12} fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.12 })}>violet</text>
          <text x={mbX1} y={mbY + mbH + 12} textAnchor="end" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.12 })}>red</text>

          <text x="20" y={cardY - 6} fill={T.mute} style={f.mono(700, 8, { upper: true, tracking: 0.16 })}>reference fingerprints</text>
          {els.map((e, i) => { const x = cardX(i), match = i === pick; return (
            <g key={i}>
              <rect x={x} y={cardY} width={cardW} height={cardH} rx="5" fill={T.paper2} stroke={match ? A : T.rule22} strokeWidth={match ? 1.8 : 0.8} />
              <text x={x + 10} y={cardY + 17} fill={C} style={f.mono(700, 12)}>{e.k}</text>
              <text x={x + 30} y={cardY + 17} fill={T.mute} style={f.mono(500, 7.5)}>{e.name}</text>
              {match && <g><circle cx={x + cardW - 12} cy={cardY + 12} r="6.5" fill={A} /><path d={"M " + (x + cardW - 15) + " " + (cardY + 12) + " l 2 3 l 4 -5"} fill="none" stroke={T.paper} strokeWidth="1.4" /></g>}
              {spec(x + 10, x + cardW - 10, cardY + 26, 18, e.lines, e.col)}
              <circle cx={x + 14} cy={cardY + 62} r="6" fill={e.fwc} stroke={T.ink} strokeWidth="0.5" />
              <text x={x + 26} y={cardY + 60} fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.06 })}>firework</text>
              <text x={x + 26} y={cardY + 71} fill={e.fwc} style={f.mono(700, 7.5, { upper: true, tracking: 0.06 })}>{e.fw}</text>
            </g>
          ); })}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {els.map((e, i) => <Btn key={e.k} small color={A} active={pick === i} onClick={() => setPick(i)}>{e.k}</Btn>)}
      </div>

      <Readout items={[
        { l: "Mystery", v: cur.name, color: A },
        { l: "Match", v: cur.k, color: C },
        { l: "Firework", v: cur.fw, color: cur.fwc },
        { l: "Lines", v: cur.lines.length },
      ]} />

      <Caption color={C}>
        Every element emits light at its own set of wavelengths, so its line spectrum is a fingerprint
        no other element shares. Read the bright lines of a mystery source and match the pattern to a
        known reference to identify it, with no chemistry needed. The same emission lines give
        fireworks their colors: sodium burns yellow, strontium red, copper blue-green, barium green.
      </Caption>
    </div>
  );
}

/* ---------- PYS-11 Routing and search ---------- */
function ExtraSearch() {
  // BookBot warehouse top-down view: a grid of addressed bins, an order
  // list, and a crane that traces a fetch route. Compares NAIVE (visit in
  // listed order) vs SMART (nearest-neighbor) routing.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const okC = T.ok;
  const failC = T.warn;

  // ===== Geometry =====
  const W = 540, H = 320;
  const ROWS = 3, COLS = 6;
  const gridX = 24, gridY = 60;
  const binW = 60, binH = 50;
  const gridW = COLS * binW, gridH = ROWS * binH;   // 360x150
  // home / dock
  const homeCell = { r: ROWS, c: 0 };
  // panel on the right
  const panelX = gridX + gridW + 18;
  const panelY = 30;
  const panelW = W - panelX - 18;
  const panelH = 270;

  const center = (r, c) => ({
    x: gridX + c * binW + binW / 2,
    y: gridY + r * binH + binH / 2,
  });
  const homePos = () => ({
    x: gridX + homeCell.c * binW + binW / 2,
    y: gridY + gridH + 22,    // crane sits on top of the dock platform
  });

  const addrOf = (r, c) => String.fromCharCode(65 + r) + (c + 1);

  // Fixed order: 5 bins the BookBot must fetch.
  const order = useMemo(() => [
    { r: 0, c: 4 },
    { r: 2, c: 1 },
    { r: 0, c: 0 },
    { r: 1, c: 5 },
    { r: 2, c: 3 },
  ], []);

  // Manhattan distance helper for the smart route
  const manhattan = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
  const smartOrder = useMemo(() => {
    const remaining = order.slice();
    const result = [];
    let cur = homeCell;
    while (remaining.length > 0) {
      let bestIdx = 0;
      let bestD = manhattan(cur, remaining[0]);
      for (let k = 1; k < remaining.length; k++) {
        const d = manhattan(cur, remaining[k]);
        if (d < bestD) { bestD = d; bestIdx = k; }
      }
      const picked = remaining.splice(bestIdx, 1)[0];
      result.push(picked);
      cur = picked;
    }
    return result;
  }, [order]);

  // Distances in grid steps (Manhattan), including return to home
  const routeDist = (path) => {
    let d = manhattan(homeCell, path[0]);
    for (let k = 1; k < path.length; k++) d += manhattan(path[k - 1], path[k]);
    d += manhattan(path[path.length - 1], homeCell);
    return d;
  };
  const naiveDist = routeDist(order);
  const smartDist = routeDist(smartOrder);
  const saved = naiveDist - smartDist;

  // ===== Animation =====
  const [mode, setMode] = useState("naive");    // "naive" or "smart"
  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const [, force] = useState(0);

  const activePath = mode === "naive" ? order : smartOrder;
  // Build a list of waypoints: home -> bin1 -> bin2 -> ... -> home
  const waypoints = useMemo(() => {
    const wps = [{ ...homeCell, kind: "home" }];
    activePath.forEach((b, i) => wps.push({ ...b, kind: "bin", idx: i }));
    wps.push({ ...homeCell, kind: "home" });
    return wps;
  }, [mode, activePath]);

  // Per-leg time
  const stepMs = 600;
  useRAF(running, (dt) => {
    tRef.current += dt;
    const total = (waypoints.length - 1) * stepMs;
    if (tRef.current > total + 200) {
      setRunning(false);
    }
    force((v) => v + 1);
  });

  // Compute crane position based on tRef. Guard against waypoint array sizes
  // smaller than expected (defensive: should not happen, but cheap insurance).
  const cranePos = (() => {
    if (!waypoints || waypoints.length < 2) {
      const h = homePos();
      return { x: h.x, y: h.y, legIdx: 0, legT: 0 };
    }
    const elapsed = tRef.current;
    const legs = waypoints.length - 1;
    const legIdx = Math.max(0, Math.min(legs - 1, Math.floor(elapsed / stepMs)));
    const legT = Math.max(0, Math.min(1, (elapsed - legIdx * stepMs) / stepMs));
    const a = waypoints[legIdx] || waypoints[0];
    const b = waypoints[legIdx + 1] || waypoints[waypoints.length - 1];
    const ap = a.kind === "home" ? homePos() : center(a.r, a.c);
    const bp = b.kind === "home" ? homePos() : center(b.r, b.c);
    return {
      x: ap.x + (bp.x - ap.x) * legT,
      y: ap.y + (bp.y - ap.y) * legT,
      legIdx,
      legT,
    };
  })();

  // Bins that have been visited
  const visited = new Set();
  for (let k = 0; k <= cranePos.legIdx && k < waypoints.length; k++) {
    const wp = waypoints[k];
    if (wp && wp.kind === "bin") visited.add(addrOf(wp.r, wp.c));
  }
  const isOrdered = (addr) => order.some((b) => addrOf(b.r, b.c) === addr);
  const isCurrentTarget = (() => {
    const next = waypoints[cranePos.legIdx + 1];
    if (next && next.kind === "bin") return addrOf(next.r, next.c);
    return null;
  })();

  const start = () => { tRef.current = 0; setRunning(true); };
  const reset = () => { tRef.current = 0; setRunning(false); force((v) => v + 1); };

  return (
    <div>
      <Field height={330}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* Title */}
          <text x={gridX} y={22} fill={C}
            style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>bookbot warehouse</text>
          <text x={gridX} y={36} fill={T.mute}
            style={f.mono(500, 8.5, { upper: true, tracking: 0.18 })}>top-down · same 5 fetches, different routes</text>

          {/* ===== Aisle lanes ===== */}
          <rect x={gridX} y={gridY} width={gridW} height={gridH}
            fill={T.paper2} stroke={C} strokeWidth="1.2" />
          {/* horizontal aisle lines (between rows) */}
          {Array.from({ length: ROWS + 1 }, (_, r) => (
            <line key={"hl" + r}
              x1={gridX} y1={gridY + r * binH}
              x2={gridX + gridW} y2={gridY + r * binH}
              stroke={T.ink} strokeWidth="0.5" opacity="0.5" />
          ))}
          {Array.from({ length: COLS + 1 }, (_, c) => (
            <line key={"vl" + c}
              x1={gridX + c * binW} y1={gridY}
              x2={gridX + c * binW} y2={gridY + gridH}
              stroke={T.ink} strokeWidth="0.5" opacity="0.5" />
          ))}

          {/* ===== Bins with addresses ===== */}
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const addr = addrOf(r, c);
              const ordered = isOrdered(addr);
              const done = visited.has(addr);
              const target = isCurrentTarget === addr;
              const cp = center(r, c);
              const bg = done ? "#9ec39b" : (ordered ? "#f0d2a3" : T.paper);
              return (
                <g key={addr}>
                  <rect x={gridX + c * binW + 6} y={gridY + r * binH + 6}
                    width={binW - 12} height={binH - 12} rx={3}
                    fill={bg} stroke={target ? A : T.ink}
                    strokeWidth={target ? 1.8 : 0.7}
                    style={{ transition: "fill 0.2s, stroke 0.2s" }} />
                  <text x={cp.x} y={cp.y - 4} textAnchor="middle"
                    fill={ordered || done ? T.ink : T.mute}
                    style={f.mono(700, 10, { tracking: 0.08 })}>{addr}</text>
                  {ordered && (
                    <text x={cp.x} y={cp.y + 10} textAnchor="middle"
                      fill={done ? okC : (target ? A : T.mute)}
                      style={f.mono(600, 7.5, { upper: true, tracking: 0.18 })}>
                      {done ? "got" : "need"}
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* ===== Home / dock (small platform; label sits BELOW so the crane never covers it) ===== */}
          {(() => {
            const hp = homePos();
            return (
              <g>
                {/* dock platform */}
                <rect x={hp.x - 18} y={hp.y - 4} width={36} height={10} rx={2}
                  fill={C} stroke={T.ink} strokeWidth="0.8" />
                {/* dock label below platform */}
                <text x={hp.x} y={hp.y + 18} textAnchor="middle" fill={T.mute}
                  style={f.mono(700, 8.5, { upper: true, tracking: 0.22 })}>dock</text>
              </g>
            );
          })()}

          {/* ===== Route trace (light dashed lines under the crane) ===== */}
          {(() => {
            const d = waypoints.map((wp, i) => {
              const p = wp.kind === "home" ? homePos() : center(wp.r, wp.c);
              return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
            }).join(" ");
            return (
              <path d={d} fill="none" stroke={A} strokeWidth="1.2"
                strokeDasharray="4 4" opacity="0.55" />
            );
          })()}

          {/* ===== Crane ===== */}
          <g transform={`translate(${cranePos.x} ${cranePos.y})`}>
            <rect x={-9} y={-9} width={18} height={18} rx={3}
              fill={A} stroke={T.ink} strokeWidth="0.9" />
            <circle cx={0} cy={0} r={3} fill={T.paper} />
          </g>

          {/* ===== Right panel: order list + stats ===== */}
          {(() => {
            const px = panelX, py = panelY, pw = panelW, ph = panelH;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" />
                <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>order</text>

                {/* Order rows */}
                {order.map((b, i) => {
                  const addr = addrOf(b.r, b.c);
                  const idxInActive = activePath.findIndex((x) => x.r === b.r && x.c === b.c);
                  const done = visited.has(addr);
                  return (
                    <g key={i}>
                      <text x={px + 12} y={py + 38 + i * 16} fill={T.mute}
                        style={f.mono(700, 9)}>{i + 1}.</text>
                      <text x={px + 30} y={py + 38 + i * 16} fill={done ? okC : T.ink}
                        style={f.mono(700, 10)}>{addr}</text>
                      <text x={px + pw - 12} y={py + 38 + i * 16} textAnchor="end"
                        fill={T.mute}
                        style={f.mono(500, 8, { upper: true, tracking: 0.16 })}>
                        visit #{idxInActive + 1}
                      </text>
                    </g>
                  );
                })}

                <line x1={px + 10} y1={py + 130} x2={px + pw - 10} y2={py + 130}
                  stroke={T.rule22} strokeWidth="0.6" />

                {/* Mode + distances */}
                <text x={px + 12} y={py + 150} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>route</text>
                <text x={px + 12} y={py + 168} fill={C}
                  style={f.mono(700, 11, { upper: true, tracking: 0.2 })}>{mode}</text>

                <text x={px + 12} y={py + 192} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>naive</text>
                <text x={px + pw - 12} y={py + 192} textAnchor="end" fill={T.ink}
                  style={f.mono(700, 11)}>{naiveDist} steps</text>

                <text x={px + 12} y={py + 212} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>smart</text>
                <text x={px + pw - 12} y={py + 212} textAnchor="end" fill={okC}
                  style={f.mono(700, 11)}>{smartDist} steps</text>

                <text x={px + 12} y={py + 234} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>saved</text>
                <text x={px + pw - 12} y={py + 234} textAnchor="end" fill={A}
                  style={f.mono(700, 11)}>{saved} steps</text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Btn small color={C} active={mode === "naive"}
          onClick={() => { setMode("naive"); reset(); }}>naive route</Btn>
        <Btn small color={okC} active={mode === "smart"}
          onClick={() => { setMode("smart"); reset(); }}>smart route</Btn>
        <Btn small icon={Play} color={A} onClick={start}>run</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Naive", v: naiveDist + " steps", color: C },
        { l: "Smart", v: smartDist + " steps", color: okC },
        { l: "Saved", v: saved + " steps (" + Math.round(saved / naiveDist * 100) + "%)", color: A },
      ]} />

      <Caption color={C}>
        Books are stored by address, not by subject. The BookBot crane fetches
        five bins per order. A naive route follows the list in order; a smart
        route visits the nearest unvisited bin next. Same fetches, fewer steps.
      </Caption>
    </div>
  );
}

/* ---------- PYS-12 Criteria and constraints ---------- */
function ExtraDecision() {
  // Accessibility ramp: same step height to clear, slider sets ramp length.
  // Three live criteria gauges (slope, load, portability) show pass/fail
  // against the client constraints. The on-screen ramp side-view updates.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const okC = T.ok;
  const failC = T.warn;

  // Fixed scenario: step height to overcome
  const stepHeightFt = 1.0;          // ft (real)
  const cartLoadLb = 200;            // lb (load the ramp must hold)

  // Constraints (match DemoRamp's 1:12 standard so the two demos agree):
  const maxRampRatio = 12;           // slope must be >= 1:12 (ratio length/rise)
  const maxSlopeDeg = (Math.atan(1 / maxRampRatio) * 180) / Math.PI;  // ~4.76°
  const maxPortableLb = 35;          // ramp itself must weigh <= 35 lb to be portable
  const minLoadLb = 250;             // ramp must support >= 250 lb

  // Knobs
  const [lengthFt, setLengthFt] = useState(18);   // ramp length in feet (slider)

  // Derived
  const slopeRad = Math.atan(stepHeightFt / lengthFt);
  const slopeDeg = (slopeRad * 180) / Math.PI;
  // Ramp weight grows with length (simple linear model: 2.5 lb / ft)
  const rampWeight = lengthFt * 2.0;
  // Load capacity drops as length grows past a sweet spot (beam-bending-ish):
  // capacity = base - (length - sweet)^2 * k
  const sweetFt = 12;
  const baseCap = 380;
  const k = 1.3;
  const loadCapacity = Math.max(80, baseCap - Math.pow(Math.max(0, lengthFt - sweetFt), 2) * k);

  // Pass/fail
  const slopeOK = lengthFt / stepHeightFt >= maxRampRatio;
  const portOK = rampWeight <= maxPortableLb;
  const loadOK = loadCapacity >= minLoadLb;
  const allOK = slopeOK && portOK && loadOK;

  // ===== Geometry =====
  const W = 540, H = 320;
  // Left card: ramp side-view
  const sceneX = 20, sceneY = 36, sceneW = 320, sceneH = 230;
  // Ramp scene local coords:
  // ground line at sceneY + sceneH - 30
  // step on the LEFT at height stepHeightPx
  const groundY = sceneY + sceneH - 36;
  const stepHeightPx = 80;            // visual representation of 2 ft step
  const stepX = sceneX + 30;
  const stepTopY = groundY - stepHeightPx;
  // Ramp length on-screen: scale length in ft to px
  // We want length range 6..36 ft to map roughly to length 80..280 px
  const lengthPx = Math.min(sceneW - 60, 60 + (lengthFt - 6) * 7);
  // Ramp goes from (stepX, stepTopY) down to (stepX + lengthPx, groundY)

  // Right card: criteria gauges
  const panelX = sceneX + sceneW + 16;
  const panelY = sceneY;
  const panelW = W - panelX - 18;
  const panelH = sceneH;

  return (
    <div>
      <Field height={330}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* Title */}
          <text x={sceneX} y={22} fill={C}
            style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>accessibility ramp design</text>

          {/* ===== Scene card ===== */}
          <rect x={sceneX} y={sceneY} width={sceneW} height={sceneH} rx={6}
            fill={T.paper2} stroke={C} strokeWidth="1" />

          {/* ground */}
          <line x1={sceneX + 10} y1={groundY} x2={sceneX + sceneW - 10} y2={groundY}
            stroke={T.ink} strokeWidth="1.4" />
          {(() => {
            const lx = sceneX + 14;          // start
            const rx = sceneX + sceneW - 14; // end
            const step = 16;
            const count = Math.floor((rx - lx) / step);
            return Array.from({ length: count }, (_, k) => (
              <line key={"g" + k}
                x1={lx + k * step + 6} y1={groundY + 1}
                x2={lx + k * step} y2={groundY + 7}
                stroke={T.ink} strokeWidth="0.6" opacity="0.55" />
            ));
          })()}

          {/* step (landing) */}
          <rect x={sceneX + 8} y={stepTopY} width={stepX - (sceneX + 8) + 14}
            height={groundY - stepTopY} fill={T.paper3} stroke={T.ink} strokeWidth="1" />
          {/* step-height dimension line on the LEFT edge of the step */}
          {(() => {
            const dx = sceneX + 4;
            return (
              <g>
                <line x1={dx} y1={stepTopY} x2={dx} y2={groundY}
                  stroke={T.mute} strokeWidth="0.7" />
                <line x1={dx - 3} y1={stepTopY} x2={dx + 3} y2={stepTopY}
                  stroke={T.mute} strokeWidth="0.7" />
                <line x1={dx - 3} y1={groundY} x2={dx + 3} y2={groundY}
                  stroke={T.mute} strokeWidth="0.7" />
                <text x={dx - 6} y={(stepTopY + groundY) / 2 + 3}
                  textAnchor="end" fill={T.mute}
                  style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>
                  {stepHeightFt} ft
                </text>
                <text x={dx - 6} y={(stepTopY + groundY) / 2 + 14}
                  textAnchor="end" fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.16 })}>
                  step
                </text>
              </g>
            );
          })()}

          {/* ramp */}
          {(() => {
            const rampX1 = stepX + 14;
            const rampY1 = stepTopY;
            const rampX2 = rampX1 + lengthPx;
            const rampY2 = groundY;
            // perpendicular-up unit vector for label positioning
            const nX = -Math.sin(slopeRad);
            const nY = -Math.cos(slopeRad);
            return (
              <g>
                {/* slope angle arc, drawn BEFORE the ramp so the ramp line (added below) sits
                    on top of it: the arc reaches and touches the ramp but never shows over it */}
                {(() => {
                  const arcR = 26;
                  // Draw the arc against the ramp AS DRAWN: the on-screen slope is
                  // exaggerated for visibility, so a real-degree arc (~2-9 deg) would
                  // be an invisible sliver. A filled wedge keeps it readable at every length.
                  const vis = Math.atan2(rampY2 - rampY1, rampX2 - rampX1);
                  // end exactly at the ramp; the ramp line draws on top so the arc touches it without crossing over
                  const end = vis;
                  const gx = rampX2 - arcR;
                  const ex = rampX2 - arcR * Math.cos(end), ey = rampY2 - arcR * Math.sin(end);
                  return (
                    <g>
                      {/* horizontal reference dashed line that the arc opens from */}
                      <line x1={gx - 4} y1={rampY2} x2={rampX2} y2={rampY2}
                        stroke={T.mute} strokeWidth="0.7" strokeDasharray="3 3" />
                      {/* filled wedge so the angle is clearly visible across the whole range */}
                      <path d={`M ${rampX2} ${rampY2} L ${gx} ${rampY2} A ${arcR} ${arcR} 0 0 1 ${ex} ${ey} Z`}
                        fill={A} opacity="0.16" />
                      {/* arc stroke along the ramp */}
                      <path d={`M ${gx} ${rampY2} A ${arcR} ${arcR} 0 0 1 ${ex} ${ey}`}
                        fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" />
                    </g>
                  );
                })()}
                {/* ramp line on TOP of the arc so the copper can touch it but never crosses over */}
                <line x1={rampX1} y1={rampY1} x2={rampX2} y2={rampY2}
                  stroke={C} strokeWidth="3.6" strokeLinecap="butt" />
                {/* Angle pill: always above the ramp, weighted to the RIGHT of the
                    ramp so it never collides with the step at steep angles. */}
                {(() => {
                  const labW = 52, labH = 18;
                  // anchor point on the ramp at 0.7 along its length, then walk up the perpendicular
                  const u = 0.7;
                  const anchorX = rampX1 + u * (rampX2 - rampX1);
                  const anchorY = rampY1 + u * (rampY2 - rampY1);
                  const offset = 28;
                  const desiredCx = anchorX + nX * offset;
                  const desiredCy = anchorY + nY * offset;
                  const labX = Math.max(sceneX + 10,
                                Math.min(sceneX + sceneW - 10 - labW, desiredCx - labW / 2));
                  const labY = Math.max(sceneY + 12, desiredCy - labH / 2);
                  // leader endpoint: midpoint of the (as-drawn) angle arc near the toe
                  const arcMidA = Math.atan2(rampY2 - rampY1, rampX2 - rampX1) / 2;
                  const arcMidX = rampX2 - 26 * Math.cos(arcMidA);
                  const arcMidY = rampY2 - 26 * Math.sin(arcMidA);
                  // leader starts from the pill edge facing the arc
                  const pillCx = labX + labW / 2;
                  const pillCy = labY + labH / 2;
                  const dx0 = arcMidX - pillCx, dy0 = arcMidY - pillCy;
                  const ang0 = Math.atan2(dy0, dx0);
                  // intersect with pill bounding box to start the leader at its border
                  const halfW = labW / 2 - 2, halfH = labH / 2 - 2;
                  const tx = Math.abs(Math.cos(ang0)) > 1e-6 ? halfW / Math.abs(Math.cos(ang0)) : 1e9;
                  const ty = Math.abs(Math.sin(ang0)) > 1e-6 ? halfH / Math.abs(Math.sin(ang0)) : 1e9;
                  const tMin = Math.min(tx, ty);
                  const leadStartX = pillCx + Math.cos(ang0) * tMin;
                  const leadStartY = pillCy + Math.sin(ang0) * tMin;
                  // arrowhead
                  const ah = 5;
                  const a1x = arcMidX - ah * Math.cos(ang0 - 0.45);
                  const a1y = arcMidY - ah * Math.sin(ang0 - 0.45);
                  const a2x = arcMidX - ah * Math.cos(ang0 + 0.45);
                  const a2y = arcMidY - ah * Math.sin(ang0 + 0.45);
                  return (
                    <g>
                      <line x1={leadStartX} y1={leadStartY} x2={arcMidX} y2={arcMidY}
                        stroke={T.ink} strokeWidth="0.9" />
                      <polygon points={`${arcMidX},${arcMidY} ${a1x},${a1y} ${a2x},${a2y}`}
                        fill={T.ink} />
                      <rect x={labX} y={labY + 2} width={labW} height={labH} rx={3}
                        fill="#000" opacity="0.12" />
                      <rect x={labX} y={labY} width={labW} height={labH} rx={3}
                        fill={T.paper} stroke={T.ink} strokeWidth="0.9" />
                      <text x={labX + labW / 2} y={labY + labH / 2 + 4}
                        textAnchor="middle" fill={slopeOK ? okC : failC}
                        style={f.mono(700, 11)}>{slopeDeg.toFixed(1)}°</text>
                    </g>
                  );
                })()}
              </g>
            );
          })()}

          {/* wheelchair user - cleaner profile silhouette */}
          {(() => {
            // Anchor: feet rest on the step landing (top), looking right toward the ramp.
            const ux = stepX + 4;
            const uy = stepTopY;
            return (
              <g transform={`translate(${ux} ${uy})`}>
                {/* large wheel (back) */}
                <circle cx={-2} cy={-8} r={9} fill="none" stroke={C} strokeWidth="2" />
                <circle cx={-2} cy={-8} r={2} fill={C} />
                {/* wheel spokes */}
                {[0, 45, 90, 135].map((deg) => {
                  const a = (deg * Math.PI) / 180;
                  return (
                    <line key={deg}
                      x1={-2 + Math.cos(a) * 8} y1={-8 + Math.sin(a) * 8}
                      x2={-2 - Math.cos(a) * 8} y2={-8 - Math.sin(a) * 8}
                      stroke={C} strokeWidth="0.7" opacity="0.7" />
                  );
                })}
                {/* small front wheel */}
                <circle cx={10} cy={-3} r={3.5} fill="none" stroke={C} strokeWidth="1.4" />
                <circle cx={10} cy={-3} r={1} fill={C} />
                {/* seat */}
                <rect x={-2} y={-16} width={12} height={3} rx={1} fill={C} />
                {/* backrest */}
                <rect x={-2} y={-26} width={3} height={11} rx={1} fill={C} />
                {/* footrest connector */}
                <line x1={3} y1={-12} x2={11} y2={-7} stroke={C} strokeWidth="1.3"
                  strokeLinecap="round" />
                {/* person torso */}
                <rect x={2} y={-26} width={6} height={10} rx={2} fill={C} />
                {/* head */}
                <circle cx={5} cy={-30} r={3.4} fill={C} />
              </g>
            );
          })()}

          {/* length dimension at the bottom */}
          {(() => {
            const rampX1 = stepX + 14;
            const rampX2 = rampX1 + lengthPx;
            const ly = groundY + 18;
            return (
              <g>
                <line x1={rampX1} y1={ly} x2={rampX2} y2={ly}
                  stroke={T.mute} strokeWidth="0.8" />
                <line x1={rampX1} y1={ly - 4} x2={rampX1} y2={ly + 4}
                  stroke={T.mute} strokeWidth="0.8" />
                <line x1={rampX2} y1={ly - 4} x2={rampX2} y2={ly + 4}
                  stroke={T.mute} strokeWidth="0.8" />
                <text x={(rampX1 + rampX2) / 2} y={ly + 12} textAnchor="middle" fill={T.mute}
                  style={f.mono(700, 9, { upper: true, tracking: 0.18 })}>
                  length {lengthFt} ft
                </text>
              </g>
            );
          })()}

          {/* ===== Criteria panel ===== */}
          {(() => {
            const px = panelX, py = panelY, pw = panelW, ph = panelH;
            // Compact gauge row: row height ~ 36 px. Value and threshold sit on
            // the same line (current / limit pair) so all three gauges fit cleanly
            // above the DESIGN status box without colliding labels.
            const gauge = (gy, label, value, unit, ok, fmt, minV, maxV, target, direction) => {
              const frac = Math.max(0, Math.min(1, (value - minV) / (maxV - minV)));
              const targetFrac = Math.max(0, Math.min(1, (target - minV) / (maxV - minV)));
              const barX = px + 12, barY = gy + 18, barW = pw - 24, barH = 6;
              const limitText = (direction === "leq" ? "max " : "min ") + fmt(target) + unit;
              return (
                <g>
                  {/* row title (left) */}
                  <text x={px + 12} y={gy} fill={T.mute}
                    style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>{label}</text>
                  {/* pass/fail chip (right) */}
                  <rect x={px + pw - 38} y={gy - 10} width={30} height={13} rx={3}
                    fill={ok ? okC : failC} />
                  <text x={px + pw - 23} y={gy} textAnchor="middle" fill={T.paper}
                    style={f.mono(700, 7.5, { upper: true, tracking: 0.18 })}>
                    {ok ? "pass" : "fail"}
                  </text>
                  {/* current value (left) and limit (right) on the same line */}
                  <text x={px + 12} y={gy + 12} fill={ok ? okC : failC}
                    style={f.mono(700, 11)}>{fmt(value)}{unit}</text>
                  <text x={px + pw - 12} y={gy + 12} textAnchor="end" fill={T.mute}
                    style={f.mono(600, 7.5, { upper: true, tracking: 0.16 })}>{limitText}</text>
                  {/* bar */}
                  <rect x={barX} y={barY} width={barW} height={barH} rx={2}
                    fill={T.paper3} stroke={T.ink} strokeWidth="0.4" />
                  <rect x={barX} y={barY} width={barW * frac} height={barH} rx={2}
                    fill={ok ? okC : failC} opacity="0.85" />
                  {/* threshold tick (on the bar) */}
                  <line x1={barX + barW * targetFrac} y1={barY - 3}
                    x2={barX + barW * targetFrac} y2={barY + barH + 3}
                    stroke={T.ink} strokeWidth="1.2" />
                </g>
              );
            };
            const fmtNum = (v) => v.toFixed(1);
            const fmtInt = (v) => Math.round(v).toString();
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" />
                <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>criteria check</text>

                {gauge(py + 42, "slope", slopeDeg, "°", slopeOK, fmtNum, 0, 20, maxSlopeDeg, "leq")}
                {gauge(py + 88, "portable", rampWeight, " lb", portOK, fmtInt, 0, 90, maxPortableLb, "leq")}
                {gauge(py + 134, "load", loadCapacity, " lb", loadOK, fmtInt, 0, 400, minLoadLb, "geq")}

                {/* overall verdict */}
                <line x1={px + 10} y1={py + ph - 36} x2={px + pw - 10} y2={py + ph - 36}
                  stroke={T.rule22} strokeWidth="0.6" />
                <rect x={px + 12} y={py + ph - 30} width={pw - 24} height={22} rx={4}
                  fill={allOK ? okC : failC} />
                <text x={px + pw / 2} y={py + ph - 15} textAnchor="middle" fill={T.paper}
                  style={f.mono(700, 10, { upper: true, tracking: 0.22 })}>
                  {allOK ? "design passes" : "design fails"}
                </text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px" }}>
        <Slider val={lengthFt} set={setLengthFt} min={6} max={36} color={A}
          label="Ramp length" suffix={lengthFt + " ft"} />
      </div>
      <Readout items={[
        { l: "Slope", v: slopeDeg.toFixed(1) + "°", color: slopeOK ? okC : failC },
        { l: "Weight", v: Math.round(rampWeight) + " lb", color: portOK ? okC : failC },
        { l: "Capacity", v: Math.round(loadCapacity) + " lb", color: loadOK ? okC : failC },
      ]} />

      <Caption color={C}>
        Three client constraints fight each other. Longer ramps make the slope
        gentler (good for the user) but add weight (worse portability) and bend
        more under load (lower capacity). A real design has to clear all three
        bars at once.
      </Caption>
    </div>
  );
}

/* ---------- TTB-01 Roots anchor soil ---------- */
function ExtraRootsAnchor() {
  // Same standard storm, two soil trays side-by-side. Only the root network
  // changes between them. Roots are clipped inside the soil mass. (Slope is
  // covered by ExtraRunoff so we don't vary it here.)
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, failC = T.warn;
  const SOIL = "#9a774a", SOIL_DARK = "#6d4f2c", SOIL_TOP = "#a8855a";
  const WATER = "#3a7aa6";

  // Density: 0=light, 1=medium, 2=dense
  const [density, setDensity] = useState(1);
  const densityLabel = ["light", "medium", "dense"][density];
  const gripFactor = [0.4, 0.65, 0.9][density];   // fraction of particles held

  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const rainRefL = useRef([]);     // bare side rain
  const rainRefR = useRef([]);     // rooted side rain
  const partsL = useRef([]);       // bare side dislodged particles
  const partsR = useRef([]);       // rooted side dislodged particles
  const lostLRef = useRef(0);
  const lostRRef = useRef(0);
  const [, force] = useState(0);

  // ===== Geometry =====
  const W = 540, H = 320;
  const cardW = 250, cardH = 230;
  const gap = 20;
  const totalW = cardW * 2 + gap;
  const cardLX = (W - totalW) / 2;     // 10
  const cardRX = cardLX + cardW + gap; // 280
  const cardY = 30;
  // Cloud zone at top of card
  const cloudH = 36;
  // Tray (the soil container) inside the card
  const trayPad = 14;
  const trayLeft = (cx) => cx + trayPad;
  const trayRight = (cx) => cx + cardW - trayPad;
  const trayW = cardW - trayPad * 2;   // 222
  const trayTop = cardY + cloudH + 12; // 78
  const trayBot = trayTop + 80;        // 158
  // Soil surface sits a few px below the tray top (tray walls extend above)
  const soilTopY = trayTop + 8;
  // Trough below the tray for collected runoff
  const troughTop = trayBot + 6;       // 164
  const troughBot = troughTop + 38;    // 202

  // ===== Generate roots once for the rooted card =====
  const rootSegments = useMemo(() => {
    // Build a tree-like root network within the rooted soil mass.
    // The tray local coords (relative to its left edge).
    const segs = [];
    const trayInner = { x: 0, y: 0, w: trayW, h: trayBot - soilTopY };
    // Place several "plants" along the tray. Density controls count + depth.
    const plantCount = [3, 5, 7][density];
    const maxDepth = [(trayBot - soilTopY) * 0.55, (trayBot - soilTopY) * 0.78, (trayBot - soilTopY) * 0.95][density];
    for (let p = 0; p < plantCount; p++) {
      const px = ((p + 0.5) * trayInner.w) / plantCount;
      const py = 0; // soil surface
      // Main taproot, straight down
      segs.push({ x1: px, y1: py, x2: px, y2: py + maxDepth, w: 1.6 });
      // Laterals branching off at intervals
      const lateralLevels = [0.25, 0.5, 0.78];
      lateralLevels.forEach((lvl, li) => {
        const ly = maxDepth * lvl;
        const sign = li % 2 === 0 ? 1 : -1;
        const reach = 10 + density * 6 + li * 4;
        const lex = px + sign * reach;
        const ley = ly + 4;
        segs.push({ x1: px, y1: ly, x2: lex, y2: ley, w: 1.1 });
        // small branchlet off each lateral
        segs.push({ x1: lex, y1: ley, x2: lex + sign * 6, y2: ley + 4, w: 0.8 });
        // and on the other side
        segs.push({ x1: px, y1: ly, x2: px - sign * (reach - 3), y2: ly + 5, w: 1 });
        segs.push({ x1: px - sign * (reach - 3), y1: ly + 5, x2: px - sign * (reach - 3) - sign * 4, y2: ly + 9, w: 0.7 });
      });
    }
    // small surface "grass" plants drawn separately (returned with the same data)
    const plants = Array.from({ length: plantCount }, (_, p) => ({
      x: ((p + 0.5) * trayInner.w) / plantCount,
    }));
    return { segs, plants, maxDepth };
  }, [density]);

  // Storm timing
  const stormDuration = 4200; // ms
  useRAF(running, (dt) => {
    tRef.current += dt;
    if (tRef.current >= stormDuration) {
      setRunning(false);
      return;
    }

    // Spawn rain drops on each side
    const dropsPerSec = 50;
    const spawn = (rainRef, cx) => {
      if (Math.random() < dropsPerSec * dt / 1000) {
        rainRef.current.push({
          id: Math.random(),
          x: cx + trayPad + Math.random() * trayW,
          y: cardY + cloudH - 6,
          vy: 0.22 + Math.random() * 0.05,
        });
      }
    };
    spawn(rainRefL, cardLX);
    spawn(rainRefR, cardRX);

    // Update rain on each side
    const step = (rainRef, partsRef, isBare, cx, lostRef) => {
      const surf = soilTopY;
      const newRain = [];
      for (const d of rainRef.current) {
        d.y += d.vy * dt;
        if (d.y >= surf) {
          // splatter; chance of dislodging a particle
          const dislodgeP = isBare ? 0.55 : 0.55 * (1 - gripFactor);
          if (Math.random() < dislodgeP) {
            partsRef.current.push({
              id: Math.random(),
              x: d.x,
              y: surf - 2,
              vx: (Math.random() - 0.3) * 0.06, // tend to drift toward tray edge
              vy: -0.04 - Math.random() * 0.03,  // little hop
              age: 0,
            });
          }
          continue;
        }
        if (d.y < trayBot + 30) newRain.push(d);
      }
      rainRef.current = newRain;
      // Update particles - they fly out the side of the tray and fall into trough
      const newParts = [];
      for (const part of partsRef.current) {
        part.age += dt;
        part.vy += 0.0005 * dt; // gravity
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        // tray-edge cutoff (tray sits between trayLeft(cx) and trayRight(cx))
        const insideTray = part.x >= trayLeft(cx) && part.x <= trayRight(cx);
        if (!insideTray) {
          // free-falling out the side
          part.outOfTray = true;
        }
        if (part.y >= troughTop) {
          lostRef.current += 1;
          continue;
        }
        if (part.age < 4000) newParts.push(part);
      }
      partsRef.current = newParts;
    };
    step(rainRefL, partsL, true, cardLX, lostLRef);
    step(rainRefR, partsR, false, cardRX, lostRRef);

    force((v) => v + 1);
  });

  const startStorm = () => {
    if (running) return;
    tRef.current = 0;
    rainRefL.current = [];
    rainRefR.current = [];
    partsL.current = [];
    partsR.current = [];
    lostLRef.current = 0;
    lostRRef.current = 0;
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    tRef.current = 0;
    rainRefL.current = [];
    rainRefR.current = [];
    partsL.current = [];
    partsR.current = [];
    lostLRef.current = 0;
    lostRRef.current = 0;
    force((v) => v + 1);
  };

  const lostBare = lostLRef.current;
  const lostRoot = lostRRef.current;
  const ratio = lostRoot > 0 ? (lostBare / lostRoot).toFixed(1) : "-";

  // ===== Render helpers =====
  const Card = ({ cx, label, isBare }) => {
    const tx = trayLeft(cx);
    const trayId = "soilClip" + (isBare ? "B" : "R");
    const cloudCx = cx + cardW / 2;
    const cloudCy = cardY + cloudH / 2;
    const lost = isBare ? lostBare : lostRoot;
    return (
      <g>
        <defs>
          <clipPath id={trayId}>
            <rect x={tx} y={soilTopY} width={trayW} height={trayBot - soilTopY} />
          </clipPath>
        </defs>
        {/* Card header label (drawn ABOVE the card so it never collides with the cloud) */}
        <text x={cx + cardW / 2} y={cardY - 8} textAnchor="middle"
          fill={isBare ? failC : okC}
          style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>
          {label}
        </text>

        {/* Card outer (paper2) */}
        <rect x={cx} y={cardY} width={cardW} height={cardH} rx={8}
          fill={T.paper2} stroke={C} strokeWidth="1.1" />

        {/* Cloud (simple soft cloud) */}
        {(() => {
          const ccx = cloudCx, ccy = cloudCy + 4;
          const sil = `
            M ${ccx - 30} ${ccy + 8}
            C ${ccx - 42} ${ccy + 8} ${ccx - 42} ${ccy - 4} ${ccx - 26} ${ccy - 4}
            C ${ccx - 26} ${ccy - 16} ${ccx - 6} ${ccy - 18} ${ccx} ${ccy - 10}
            C ${ccx + 6} ${ccy - 20} ${ccx + 26} ${ccy - 16} ${ccx + 28} ${ccy - 4}
            C ${ccx + 42} ${ccy - 4} ${ccx + 42} ${ccy + 8} ${ccx + 26} ${ccy + 8}
            Z`;
          return (
            <g>
              <path d={sil} fill="#000" opacity="0.10" transform={`translate(1 2)`} />
              <path d={sil} fill="url(#raCloudGrad)" stroke={T.ink} strokeWidth="0.9" />
              <ellipse cx={ccx - 12} cy={ccy - 6} rx={10} ry={3}
                fill="#ffffff" opacity="0.7" />
            </g>
          );
        })()}

        {/* Tray walls */}
        <rect x={tx - 2} y={trayTop} width={trayW + 4} height={trayBot - trayTop + 2}
          fill="none" stroke={C} strokeWidth="1.4" />

        {/* Soil block (clipped horizon) */}
        <rect x={tx} y={soilTopY} width={trayW} height={trayBot - soilTopY}
          fill="url(#raSoilGrad)" />
        {/* slightly lighter top horizon */}
        <rect x={tx} y={soilTopY} width={trayW} height={5}
          fill={SOIL_TOP} />
        {/* soil texture: small darker speckles */}
        {(() => {
          const dots = [];
          for (let k = 0; k < 24; k++) {
            const ax = tx + ((k * 17) % (trayW - 10)) + 4;
            const ay = soilTopY + 8 + ((k * 13) % (trayBot - soilTopY - 16));
            dots.push(<circle key={k} cx={ax} cy={ay} r={0.9} fill={SOIL_DARK} opacity="0.5" />);
          }
          return dots;
        })()}

        {/* Roots (CLIPPED to soil bounds) - only on rooted card */}
        {!isBare && (
          <g clipPath={`url(#${trayId})`}>
            {/* roots are drawn in card-relative coords, so translate */}
            <g transform={`translate(${tx} ${soilTopY})`}>
              {rootSegments.segs.map((s, k) => (
                <line key={"r" + k}
                  x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                  stroke={SOIL_DARK} strokeWidth={s.w} strokeLinecap="round" />
              ))}
            </g>
          </g>
        )}

        {/* Plants on top of soil (rooted only) - drawn after soil for the surface */}
        {!isBare && rootSegments.plants.map((pl, k) => {
          const px = tx + pl.x;
          return (
            <g key={"p" + k}>
              {/* simple grass-tree: a stem with 3 leaves */}
              <line x1={px} y1={soilTopY} x2={px} y2={soilTopY - 10}
                stroke="#2e6b3f" strokeWidth="1.2" strokeLinecap="round" />
              <ellipse cx={px - 3} cy={soilTopY - 9} rx={3.6} ry={2}
                fill="#3a7b3a" />
              <ellipse cx={px + 3} cy={soilTopY - 7} rx={3.6} ry={2}
                fill="#3a7b3a" />
              <ellipse cx={px} cy={soilTopY - 12} rx={3.6} ry={2.5}
                fill="#4a8b4a" />
            </g>
          );
        })}

        {/* Bare specimen indicator: lots of loose surface dots */}
        {isBare && (() => {
          const surface = [];
          for (let k = 0; k < 12; k++) {
            const ax = tx + 8 + ((k * 19) % (trayW - 16));
            surface.push(
              <circle key={"sl" + k} cx={ax} cy={soilTopY + 0.5}
                r={1.1} fill={SOIL_DARK} opacity="0.7" />
            );
          }
          return surface;
        })()}

        {/* Rain drops */}
        {(isBare ? rainRefL : rainRefR).current.map((d) => (
          <line key={d.id} x1={d.x} y1={d.y - 5} x2={d.x} y2={d.y}
            stroke={WATER} strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
        ))}

        {/* Dislodged particles */}
        {(isBare ? partsL : partsR).current.map((part) => (
          <circle key={part.id} cx={part.x} cy={part.y} r={1.6}
            fill={SOIL_DARK} stroke={T.ink} strokeWidth="0.2" opacity="0.95" />
        ))}

        {/* Trough beneath the tray */}
        <path d={`M ${tx - 2} ${troughTop}
                  L ${tx - 2} ${troughBot}
                  L ${tx + trayW + 2} ${troughBot}
                  L ${tx + trayW + 2} ${troughTop}`}
          fill="none" stroke={C} strokeWidth="1.2" />
        {/* sediment in trough proportional to lost */}
        {(() => {
          const cap = 80;
          const lvl = Math.min(1, lost / cap);
          const sH = (troughBot - troughTop - 4) * lvl;
          return (
            <rect x={tx} y={troughBot - sH - 1}
              width={trayW} height={sH}
              fill={SOIL_DARK} opacity="0.95" />
          );
        })()}

        {/* SOIL LOST counter inside the card */}
        <text x={cx + cardW / 2} y={troughBot + 16} textAnchor="middle" fill={T.mute}
          style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>
          soil lost: <tspan fill={isBare ? failC : okC}
            style={f.mono(700, 11)}>{lost}</tspan>
        </text>
      </g>
    );
  };

  return (
    <div>
      <Field height={330}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* Title */}
          <text x={W / 2} y={18} textAnchor="middle" fill={C}
            style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>
            root grip trial
          </text>
          <text x={W / 2} y={H - 8} textAnchor="middle" fill={T.mute}
            style={f.mono(500, 8.5, { upper: true, tracking: 0.18 })}>
            same storm · only the root network differs
          </text>

          <defs>
            <linearGradient id="raSoilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={SOIL_TOP} />
              <stop offset="0.34" stopColor={SOIL} />
              <stop offset="1" stopColor={SOIL_DARK} />
            </linearGradient>
            <linearGradient id="raCloudGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#e7ddc9" />
            </linearGradient>
          </defs>
          <Card cx={cardLX} label="bare soil" isBare={true} />
          <Card cx={cardRX} label={`rooted (${densityLabel})`} isBare={false} />

          {/* Center divider */}
          <line x1={W / 2} y1={cardY + 8} x2={W / 2} y2={cardY + cardH - 8}
            stroke={T.rule22} strokeWidth="0.6" strokeDasharray="4 4" />

          {/* Storm progress bar at bottom of the field */}
          {(() => {
            const px = 20, py = 280, pw = W - 40, ph = 5;
            const frac = Math.min(1, tRef.current / stormDuration);
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={2}
                  fill={T.paper3} stroke={T.ink} strokeWidth="0.4" />
                <rect x={px} y={py} width={pw * frac} height={ph} rx={2}
                  fill={running ? WATER : T.paper3} />
                <text x={px} y={py - 4} fill={T.mute}
                  style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>storm</text>
                <text x={px + pw} y={py - 4} textAnchor="end" fill={T.mute}
                  style={f.mono(500, 8, { upper: true, tracking: 0.14 })}>
                  {(tRef.current / 1000).toFixed(1)}s / {(stormDuration / 1000).toFixed(1)}s
                </text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={density} set={setDensity} min={0} max={2} color={C}
          label="Root density" suffix={densityLabel} />
        <Btn small icon={Play} color={A} onClick={startStorm}>storm</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Bare loss", v: lostBare, color: failC },
        { l: "Rooted loss", v: lostRoot, color: okC },
        { l: "Bare ÷ rooted", v: ratio + "×", color: A },
      ]} />

      <Caption color={C}>
        Roots grip soil. The same rainstorm hits both trays, but the rooted
        tray loses far fewer particles because the root network holds them
        in place. Denser, deeper roots hold even better, with more contact
        points and more grip.
      </Caption>
    </div>
  );
}

/* ---------- TTB-01 Slope and runoff ---------- */
function ExtraRunoff() {
  // Cross-section of a hillside. Rain falls from a cloud, splatters the
  // slope, then water and sediment run downhill into a collection trough.
  // The slope wedge auto-scales so the figure always fits the viewBox even
  // at the steepest setting.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok;
  const failC = T.warn;
  const SOIL = "#9a774a";
  const SOIL_DARK = "#6d4f2c";
  const WATER = "#3a7aa6";
  const SKY = "#dfe9e8";

  const [tilt, setTilt] = useState(15);
  const theta = (tilt * Math.PI) / 180;

  // ===== Geometry (everything fits inside viewBox at any angle) =====
  const W = 540, H = 300;
  // Sky region: 0..skyBot
  const skyBot = 70;
  // Hill region
  const mapL = 30, mapR = 510;
  const baseY = 240;             // ground line / hill toe
  const maxSlopeH = baseY - skyBot - 6;  // 164
  // Slope geometry: hill is higher on the LEFT, water runs down to the RIGHT
  // Slope rises by slopeH over slopeBase horizontal distance.
  // Cap slopeBase so the rise never exceeds maxSlopeH.
  const maxBase = 360;
  let slopeBase = maxBase;
  let slopeH = slopeBase * Math.tan(theta);
  if (slopeH > maxSlopeH) {
    slopeH = maxSlopeH;
    slopeBase = slopeH / Math.tan(theta);
  }
  const slopeRightX = mapR - 60;             // bottom of slope, before the trough
  const slopeLeftX = slopeRightX - slopeBase;
  const slopeTopY = baseY - slopeH;          // top-left of slope surface

  // Trough on the right
  const troughLeftX = slopeRightX;
  const troughRightX = mapR;
  const troughTopY = baseY;
  const troughBotY = baseY + 30;

  // Cloud above the slope (centered above its midpoint)
  const cloudCx = (slopeLeftX + slopeRightX) / 2;
  const cloudCy = 28;

  // ===== Animation =====
  const tRef = useRef(0);
  const rainRef = useRef([]);        // drops falling from cloud
  const runoffRef = useRef([]);      // water sliding along slope
  const sedimentRef = useRef([]);    // soil particles moving with runoff
  const collectedWaterRef = useRef(0);
  const collectedSoilRef = useRef(0);
  const [, force] = useState(0);

  useRAF(true, (dt) => {
    tRef.current += dt;
    // base spawn rate of rain drops
    const rainPerSec = 18;
    if (Math.random() < rainPerSec * dt / 1000) {
      const cw = 80;
      rainRef.current.push({
        id: Math.random(),
        x: cloudCx + (Math.random() - 0.5) * cw,
        y: cloudCy + 10,
        vy: 0.18 + Math.random() * 0.04,
      });
    }

    // Update rain drops
    const newRain = [];
    for (const d of rainRef.current) {
      d.y += d.vy * dt;
      // If it lands on the slope (slope surface line) convert to runoff
      // Slope surface: y = baseY - (slopeRightX - x) * tan(theta), for x in [slopeLeftX, slopeRightX]
      const slopeYAtX = baseY - Math.max(0, (slopeRightX - d.x)) * Math.tan(theta);
      if (d.x >= slopeLeftX && d.x <= slopeRightX && d.y >= slopeYAtX) {
        // spawn a runoff droplet, starting at its slope position
        const u = (d.x - slopeLeftX) / slopeBase;   // 0 at top of slope, 1 at toe
        runoffRef.current.push({
          id: Math.random(),
          u: u,
          jitter: (Math.random() - 0.5) * 3,
        });
        // 30% chance to also dislodge a sediment particle
        if (Math.random() < 0.3) {
          sedimentRef.current.push({
            id: Math.random(),
            u: u,
            jitter: (Math.random() - 0.5) * 2,
            life: 0,
          });
        }
        continue; // remove this drop
      }
      // If it lands on the bare ground (left of slope OR to the right of trough), splash and disappear
      if (d.y >= baseY) continue;
      if (d.y < H + 10) newRain.push(d);
    }
    rainRef.current = newRain;

    // Update runoff: move down the slope (u -> 1) at speed prop to sin(theta)
    const runoffSpeed = 0.0015 * Math.sin(theta) + 0.0001;  // small floor so any tilt moves
    const newRunoff = [];
    for (const r of runoffRef.current) {
      r.u += runoffSpeed * dt;
      if (r.u >= 1) {
        collectedWaterRef.current += 1;
        continue;
      }
      newRunoff.push(r);
    }
    runoffRef.current = newRunoff;

    // Update sediment (slightly slower than water)
    const sedSpeed = runoffSpeed * 0.85;
    const newSed = [];
    for (const s of sedimentRef.current) {
      s.u += sedSpeed * dt;
      s.life += dt;
      if (s.u >= 1) {
        collectedSoilRef.current += 1;
        continue;
      }
      newSed.push(s);
    }
    sedimentRef.current = newSed;

    force((v) => v + 1);
  });

  const reset = () => {
    rainRef.current = [];
    runoffRef.current = [];
    sedimentRef.current = [];
    collectedWaterRef.current = 0;
    collectedSoilRef.current = 0;
    tRef.current = 0;
    force((v) => v + 1);
  };

  // Helpers to project (u) along the slope to (x, y)
  const slopePoint = (u) => ({
    x: slopeLeftX + u * slopeBase,
    y: slopeTopY + u * slopeH,
  });

  const risk = tilt >= 22 ? "high" : tilt >= 12 ? "moderate" : "low";
  const riskColor = tilt >= 22 ? failC : tilt >= 12 ? A : okC;
  const speedRel = Math.round(Math.sin(theta) / Math.sin(30 * Math.PI / 180) * 100);

  return (
    <div>
      <Field height={310}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* ===== sky ===== */}
          <defs>
            <linearGradient id="runoffSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef4f3" />
              <stop offset="1" stopColor={SKY} />
            </linearGradient>
            <linearGradient id="runoffSoil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a8855a" />
              <stop offset="0.4" stopColor={SOIL} />
              <stop offset="1" stopColor={SOIL_DARK} />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={skyBot} fill="url(#runoffSky)" />

          {/* ===== cloud (dimensional, gradient-shaded) ===== */}
          {(() => {
            const cx = cloudCx, cy = cloudCy;
            const gradId = "runoffCloudGrad";
            // Lobes: a wide flat base + 3 rounder bumps on top, then a single
            // smooth outline path traced around the silhouette.
            const lobes = [
              { x: cx - 32, y: cy + 4,  r: 14 },
              { x: cx - 10, y: cy - 4,  r: 18 },
              { x: cx + 12, y: cy - 8,  r: 16 },
              { x: cx + 30, y: cy + 2,  r: 14 },
            ];
            // Silhouette path that wraps around the union (computed by hand to look smooth)
            const silhouette = `
              M ${cx - 46} ${cy + 12}
              C ${cx - 60} ${cy + 12} ${cx - 60} ${cy - 8} ${cx - 40} ${cy - 6}
              C ${cx - 40} ${cy - 22} ${cx - 14} ${cy - 26} ${cx - 6} ${cy - 14}
              C ${cx + 0} ${cy - 28} ${cx + 26} ${cy - 26} ${cx + 30} ${cy - 12}
              C ${cx + 50} ${cy - 14} ${cx + 56} ${cy + 8} ${cx + 40} ${cy + 12}
              Z`;
            return (
              <g>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="60%" stopColor="#f4f3ee" />
                    <stop offset="100%" stopColor="#c5c8c1" />
                  </linearGradient>
                </defs>
                {/* soft drop shadow */}
                <path d={silhouette} fill="#000" opacity="0.12"
                  transform={`translate(2 4)`} />
                {/* main body filled with gradient */}
                <path d={silhouette} fill={`url(#${gradId})`}
                  stroke={T.ink} strokeWidth="1" />
                {/* darker undercurve to suggest the bottom shadow */}
                <path d={`M ${cx - 38} ${cy + 10}
                          Q ${cx} ${cy + 16} ${cx + 36} ${cy + 10}`}
                  fill="none" stroke="#9aa0a0" strokeWidth="2"
                  strokeLinecap="round" opacity="0.45" />
                {/* highlight bumps on top of the lobes */}
                {lobes.map((l, i) => (
                  <ellipse key={i} cx={l.x - l.r * 0.3} cy={l.y - l.r * 0.4}
                    rx={l.r * 0.5} ry={l.r * 0.22}
                    fill="#ffffff" opacity="0.7" />
                ))}
              </g>
            );
          })()}

          {/* ===== ground line (behind hill) ===== */}
          <line x1={0} y1={baseY} x2={mapL} y2={baseY} stroke={T.ink} strokeWidth="1" />
          <line x1={mapR} y1={baseY + 30} x2={W} y2={baseY + 30} stroke={T.ink} strokeWidth="1" />

          {/* ===== HILL (solid wedge that stays inside the viewBox) ===== */}
          <path d={`
              M ${mapL} ${baseY}
              L ${slopeLeftX} ${baseY}
              L ${slopeLeftX} ${slopeTopY}
              L ${slopeRightX} ${baseY}
              Z`}
            fill="url(#runoffSoil)" stroke={T.ink} strokeWidth="1.2" />

          {/* Slope surface accent line + grass clumps */}
          <line x1={slopeLeftX} y1={slopeTopY} x2={slopeRightX} y2={baseY}
            stroke={SOIL_DARK} strokeWidth="1" />
          {(() => {
            const N = 14;
            const nx = -Math.sin(theta), ny = -Math.cos(theta);
            const tx = Math.cos(theta), ty = Math.sin(theta);
            const clumps = [];
            for (let k = 0; k < N; k++) {
              const u = (k + 0.5) / N;
              const p = slopePoint(u);
              const hMid = 7 + ((k * 13) % 3);
              const hSide = hMid - 2;
              const lateral = 2.4;
              const mk = (off, len, lean) => {
                const bx = p.x + tx * off;
                const by = p.y + ty * off;
                const tipX = bx + nx * len + tx * lean;
                const tipY = by + ny * len + ty * lean;
                return [bx, by, tipX, tipY];
              };
              const [a1x, a1y, a1tx, a1ty] = mk(-lateral, hSide, -0.8);
              const [a2x, a2y, a2tx, a2ty] = mk(0, hMid, 0.0);
              const [a3x, a3y, a3tx, a3ty] = mk(+lateral, hSide, 0.8);
              clumps.push(
                <g key={"g" + k}>
                  <line x1={a1x} y1={a1y} x2={a1tx} y2={a1ty}
                    stroke="#3e7b3a" strokeWidth="1" strokeLinecap="round" />
                  <line x1={a2x} y1={a2y} x2={a2tx} y2={a2ty}
                    stroke="#2e6b3f" strokeWidth="1.1" strokeLinecap="round" />
                  <line x1={a3x} y1={a3y} x2={a3tx} y2={a3ty}
                    stroke="#3e7b3a" strokeWidth="1" strokeLinecap="round" />
                </g>
              );
            }
            return clumps;
          })()}

          {/* ===== Trough on the right ===== */}
          <path d={`M ${troughLeftX} ${troughTopY}
                    L ${troughLeftX} ${troughBotY}
                    L ${troughRightX} ${troughBotY}
                    L ${troughRightX} ${troughTopY - 4}`}
            fill="none" stroke={T.ink} strokeWidth="1.4" />
          {/* trough water level grows with collectedWater */}
          {(() => {
            const cap = 600;
            const lvl = Math.min(1, collectedWaterRef.current / cap);
            const wH = (troughBotY - troughTopY - 4) * lvl;
            return (
              <g>
                <rect x={troughLeftX + 1} y={troughBotY - wH - 1}
                  width={troughRightX - troughLeftX - 2} height={wH}
                  fill={WATER} opacity="0.7" />
                {/* sediment layer at the bottom */}
                <rect x={troughLeftX + 1} y={troughBotY - 1}
                  width={troughRightX - troughLeftX - 2}
                  height={Math.min(8, collectedSoilRef.current * 0.08)}
                  fill={SOIL_DARK} />
              </g>
            );
          })()}
          <text x={(troughLeftX + troughRightX) / 2} y={troughBotY + 14} textAnchor="middle" fill={T.mute}
            style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>runoff</text>

          {/* ===== Rain drops ===== */}
          {rainRef.current.map((d) => (
            <line key={d.id} x1={d.x} y1={d.y - 4} x2={d.x} y2={d.y}
              stroke={WATER} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
          ))}

          {/* ===== Runoff on slope ===== */}
          {runoffRef.current.map((r) => {
            const p = slopePoint(r.u);
            // offset perpendicular to slope so droplets sit on top of the surface
            const nx = -Math.sin(theta), ny = -Math.cos(theta);
            return (
              <circle key={r.id}
                cx={p.x + nx * 3 + r.jitter}
                cy={p.y + ny * 3}
                r={1.8} fill={WATER} opacity="0.85" />
            );
          })}

          {/* ===== Sediment on slope ===== */}
          {sedimentRef.current.map((s) => {
            const p = slopePoint(s.u);
            const nx = -Math.sin(theta), ny = -Math.cos(theta);
            return (
              <circle key={s.id}
                cx={p.x + nx * 1.5 + s.jitter}
                cy={p.y + ny * 1.5}
                r={1.4} fill={SOIL_DARK} opacity="0.95" />
            );
          })}

          {/* ===== Right-side stats panel ===== */}
          {(() => {
            const px = 30, py = 6, pw = 150, ph = 56;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" opacity="0.95" />
                <text x={px + 10} y={py + 16} fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>storm gauge</text>

                <text x={px + 10} y={py + 32} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>angle</text>
                <text x={px + pw - 10} y={py + 32} textAnchor="end" fill={C}
                  style={f.mono(700, 11)}>{tilt}°</text>

                <text x={px + 10} y={py + 48} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>risk</text>
                <text x={px + pw - 10} y={py + 48} textAnchor="end" fill={riskColor}
                  style={f.mono(700, 11, { upper: true, tracking: 0.18 })}>{risk}</text>
              </g>
            );
          })()}

          {/* ===== Slope-angle arc near the toe of the hill (visual cue) ===== */}
          {(() => {
            const arcR = 28;
            const cx = slopeRightX;
            const cy = baseY;
            const ex = cx - arcR * Math.cos(theta);
            const ey = cy - arcR * Math.sin(theta);
            const useExternalLabel = tilt < 22;
            return (
              <g>
                <line x1={cx} y1={cy} x2={cx - arcR - 8} y2={cy}
                  stroke={T.mute} strokeWidth="0.7" strokeDasharray="3 3" />
                <path d={`M ${cx - arcR} ${cy} A ${arcR} ${arcR} 0 0 1 ${ex} ${ey}`}
                  fill="none" stroke={T.mute} strokeWidth="1" />
                {useExternalLabel ? (
                  (() => {
                    const midA = theta / 2;
                    const midX = cx - arcR * Math.cos(midA);
                    const midY = cy - arcR * Math.sin(midA);
                    const labX = cx + 28;
                    const labY = cy - 38;
                    const labW = 42, labH = 20;
                    // leader line endpoint (just outside the label)
                    const lx2 = labX - 2;
                    const ly2 = labY + labH / 2;
                    // arrowhead at the line origin pointing at the arc
                    const ang = Math.atan2(midY - ly2, midX - lx2);
                    const ah = 5;
                    const a1x = midX - ah * Math.cos(ang - 0.45);
                    const a1y = midY - ah * Math.sin(ang - 0.45);
                    const a2x = midX - ah * Math.cos(ang + 0.45);
                    const a2y = midY - ah * Math.sin(ang + 0.45);
                    return (
                      <g>
                        {/* leader line with arrowhead at the arc end */}
                        <line x1={lx2} y1={ly2} x2={midX} y2={midY}
                          stroke={T.ink} strokeWidth="0.9" />
                        <polygon points={`${midX},${midY} ${a1x},${a1y} ${a2x},${a2y}`}
                          fill={T.ink} />
                        {/* shadow */}
                        <rect x={labX} y={labY + 2} width={labW} height={labH} rx={4}
                          fill="#000" opacity="0.14" />
                        {/* label pill */}
                        <rect x={labX - 2} y={labY} width={labW} height={labH} rx={4}
                          fill={T.paper} stroke={T.ink} strokeWidth="0.9" />
                        <text x={labX + labW / 2 - 2} y={labY + labH / 2 + 4}
                          textAnchor="middle" fill={T.ink}
                          style={f.mono(700, 11)}>{tilt}°</text>
                      </g>
                    );
                  })()
                ) : (
                  <text x={cx - arcR - 12} y={cy - 6} textAnchor="end" fill={T.ink}
                    style={f.mono(700, 11)}>{tilt}°</text>
                )}
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={tilt} set={setTilt} min={2} max={30} color={A}
          label="Slope angle" suffix={tilt + "°"} />
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Runoff speed", v: speedRel + " (rel)", color: A },
        { l: "Water collected", v: collectedWaterRef.current, color: WATER },
        { l: "Soil washed off", v: collectedSoilRef.current, color: SOIL_DARK },
      ]} />

      <Caption color={C}>
        Rain falling on a slope turns into runoff. The steeper the slope,
        the faster the water moves and the more soil it carries away. A
        gentle slope holds the soil; a steep slope strips it. The trough
        catches what the slope loses.
      </Caption>
    </div>
  );
}

/* ---------- TTB-02 Angles give height ---------- */
function ExtraTriangulate() {
  // Triangulate a tree's height by sighting from a known baseline.
  // h = d * tan(theta). The drawing auto-scales so the tree top stays
  // inside the figure at any angle, and the angle arc is anchored at
  // the observer with a clear horizontal reference line.
  const [angle, setAngle] = useState(35);
  const dFeet = 100;
  const theta = (angle * Math.PI) / 180;
  const hFeet = dFeet * Math.tan(theta);
  const A = CAMP.trees.acc, C = CAMP.trees.ink;

  // ----- Geometry -----
  const W = 540, H = 270;
  const groundY = 220;
  const obsX = 90;
  const maxH = 170;           // most the tree can fill vertically
  const maxD = 360;           // longest the baseline gets on screen
  // Compute on-screen dimensions, scaling down if the tree would overflow.
  let dScreen = maxD;
  let hScreen = dScreen * Math.tan(theta);
  if (hScreen > maxH) {
    const r = maxH / hScreen;
    dScreen *= r;
    hScreen = maxH;
  }
  const treeX = obsX + dScreen;
  const topY = groundY - hScreen;

  // Angle arc (centered at observer)
  const arcR = 28;
  // theta label is placed just left of the vertex so a close (high-angle) tree never overlaps it

  return (
    <div>
      <Field height={280}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* ===== sky + ground ===== */}
          <defs>
            <linearGradient id="triSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef2ec" />
              <stop offset="1" stopColor="#f6efe0" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={groundY} fill="url(#triSky)" />
          <rect x={0} y={groundY} width={W} height={H - groundY} fill="#e7dcc4" opacity="0.55" />
          <ellipse cx={treeX} cy={groundY + 3} rx={26} ry={5} fill="#000" opacity="0.10" />
          <line x1={20} y1={groundY} x2={W - 20} y2={groundY}
            stroke={C} strokeWidth="1.5" />
          {Array.from({ length: 26 }, (_, k) => (
            <line key={k} x1={20 + k * 20} y1={groundY} x2={12 + k * 20} y2={groundY + 12}
              stroke={C} strokeWidth="0.55" opacity="0.7" />
          ))}

          {/* right-angle marker at the tree base, drawn before the tree so the trunk covers any overlap */}
          <rect x={treeX - 8} y={groundY - 8} width={8} height={8}
            fill="none" stroke={T.mute} strokeWidth="0.7" />
          {/* ===== Tree (canopy + trunk) ===== */}
          <line x1={treeX} y1={groundY} x2={treeX} y2={topY}
            stroke="#6b4a2a" strokeWidth="5" strokeLinecap="round" />
          {/* canopy: layered conifer tiers (back dark -> front light) for depth */}
          {hScreen > 18 && (
            <g>
              <polygon points={`${treeX},${topY + 16} ${treeX - 24},${topY + 38} ${treeX + 24},${topY + 38}`}
                fill="#1f5030" />
              <polygon points={`${treeX},${topY + 2} ${treeX - 20},${topY + 22} ${treeX + 20},${topY + 22}`}
                fill="#2f6b3a" />
              <polygon points={`${treeX},${topY - 10} ${treeX - 16},${topY + 8} ${treeX + 16},${topY + 8}`}
                fill="#46834a" />
            </g>
          )}
          {hScreen <= 18 && (
            <circle cx={treeX} cy={topY} r={6} fill={C} />
          )}

          {/* ===== Horizontal eye-level reference (dashed) ===== */}
          <line x1={obsX} y1={groundY} x2={treeX} y2={groundY}
            stroke={T.mute} strokeWidth="0.7" strokeDasharray="4 4" opacity="0.7" />

          {/* ===== Sight line (observer -> tree top) ===== */}
          <line x1={obsX} y1={groundY} x2={treeX} y2={topY}
            stroke={A} strokeWidth="1.8" />
          {/* arrowhead at tree top */}
          {(() => {
            const ang = Math.atan2(topY - groundY, treeX - obsX);
            const ah = 8;
            const p1x = treeX - ah * Math.cos(ang - 0.45);
            const p1y = topY - ah * Math.sin(ang - 0.45);
            const p2x = treeX - ah * Math.cos(ang + 0.45);
            const p2y = topY - ah * Math.sin(ang + 0.45);
            return <polygon points={`${treeX},${topY} ${p1x},${p1y} ${p2x},${p2y}`} fill={A} />;
          })()}

          {/* (right-angle marker is drawn earlier, behind the tree) */}

          {/* ===== Angle arc + label at observer ===== */}
          <path d={`M ${obsX + arcR} ${groundY} A ${arcR} ${arcR} 0 0 0 ${obsX + arcR * Math.cos(theta)} ${groundY - arcR * Math.sin(theta)}`}
            fill="none" stroke={A} strokeWidth="1.2" />
          <text x={obsX - 8} y={groundY - 9} textAnchor="end" fill={A}
            style={f.mono(700, 11)}>{angle}°</text>

          {/* ===== Observer figure ===== */}
          <g transform={`translate(${obsX} ${groundY})`}>
            <line x1={0} y1={0} x2={0} y2={-22} stroke={C} strokeWidth="2.5" />
            <circle cx={0} cy={-26} r={5} fill={C} />
            {/* clinometer: a sighting tube aimed up the sight line, with a hanging plumb */}
            <g transform="translate(3 -27)">
              <line x1={0} y1={0} x2={15 * Math.cos(theta)} y2={-15 * Math.sin(theta)} stroke={A} strokeWidth="2.6" strokeLinecap="round" />
              <circle cx={15 * Math.cos(theta)} cy={-15 * Math.sin(theta)} r={1.7} fill={A} />
              <circle cx={0} cy={0} r={2.2} fill={T.paper} stroke={T.ink} strokeWidth="0.8" />
              <line x1={0} y1={0} x2={0} y2={8} stroke={T.ink} strokeWidth="0.8" />
              <circle cx={0} cy={9} r={1.4} fill={T.ink} />
            </g>
          </g>

          {/* ===== Baseline label (always visible regardless of dScreen) ===== */}
          <line x1={obsX} y1={groundY + 20} x2={treeX} y2={groundY + 20}
            stroke={T.mute} strokeWidth="0.8" />
          <line x1={obsX} y1={groundY + 16} x2={obsX} y2={groundY + 24}
            stroke={T.mute} strokeWidth="0.8" />
          <line x1={treeX} y1={groundY + 16} x2={treeX} y2={groundY + 24}
            stroke={T.mute} strokeWidth="0.8" />
          <text x={(obsX + treeX) / 2} y={groundY + 38} textAnchor="middle" fill={T.mute}
            style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>baseline d = {dFeet} ft</text>

          {/* ===== Height label (along the tree, right side) ===== */}
          <line x1={treeX + 30} y1={topY} x2={treeX + 30} y2={groundY}
            stroke={T.mute} strokeWidth="0.8" />
          <line x1={treeX + 26} y1={topY} x2={treeX + 34} y2={topY}
            stroke={T.mute} strokeWidth="0.8" />
          <line x1={treeX + 26} y1={groundY} x2={treeX + 34} y2={groundY}
            stroke={T.mute} strokeWidth="0.8" />
          <text x={treeX + 40} y={(topY + groundY) / 2 + 4} fill={C}
            style={f.mono(700, 12)}>h = {hFeet.toFixed(0)} ft</text>
        </svg>
      </Field>
      <div style={{ padding: "0 4px" }}>
        <Slider val={angle} set={setAngle} min={5} max={75} color={A}
          label="Sight angle θ" suffix={angle + "°"} />
      </div>
      <Readout items={[
        { l: "Height", v: hFeet.toFixed(0) + " ft", color: C },
        { l: "Formula", v: "h = d · tan θ" },
        { l: "Tool", v: "clinometer" },
      ]} />

      <Caption color={C}>
        Stand a known distance from the tree, then sight the top with a
        clinometer. The angle you measure plus the baseline distance gives
        the tree's height by simple trig: height equals baseline times the
        tangent of the angle.
      </Caption>
    </div>
  );
}

/* ---------- TTB-02 Accuracy from method ---------- */
function ExtraAccuracy() {
  // Multiple noisy reads average toward the true value. Visualized as a
  // target: single dart marks scatter, but their mean (crosshair) sits
  // much closer to the bullseye than any single dart.
  const A = CAMP.trees.acc, C = CAMP.trees.ink;
  const okC = T.ok;
  const failC = T.warn;

  const [pts, setPts] = useState([]);

  // Box-Muller-ish normal noise (truncated to keep darts inside the figure)
  const randNorm = () => {
    let r1 = Math.random(), r2 = Math.random();
    if (r1 < 1e-6) r1 = 1e-6;
    return Math.sqrt(-2 * Math.log(r1)) * Math.cos(2 * Math.PI * r2);
  };

  const add = () => {
    const sx = randNorm() * 26;
    const sy = randNorm() * 24;
    setPts((p) => [...p, {
      offX: Math.max(-78, Math.min(78, sx)),
      offY: Math.max(-72, Math.min(72, sy)),
      n: p.length + 1,
    }]);
  };
  const addBurst = () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(add, i * 30);
    }
  };
  const reset = () => setPts([]);

  // ----- Geometry -----
  const W = 540, H = 300;
  const tcx = 200, tcy = 150;
  const ringRadii = [92, 70, 48, 26];          // outer to inner
  const ringScores = [1, 2, 3, 5];             // outer to inner -> points

  const mx = pts.length ? pts.reduce((s, p) => s + p.offX, 0) / pts.length : 0;
  const my = pts.length ? pts.reduce((s, p) => s + p.offY, 0) / pts.length : 0;
  const meanDist = Math.hypot(mx, my);

  // Distances and "best single" / "worst single" for spread feel
  const singleDists = pts.map((p) => Math.hypot(p.offX, p.offY));
  const avgSingle = singleDists.length ? singleDists.reduce((s, d) => s + d, 0) / singleDists.length : 0;

  return (
    <div>
      <Field height={310}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* ===== target backing ===== */}
          <circle cx={tcx} cy={tcy} r={ringRadii[0] + 14} fill={T.paper3}
            stroke={C} strokeWidth="2" />
          <circle cx={tcx} cy={tcy} r={ringRadii[0] + 6} fill={T.paper2}
            stroke={C} strokeWidth="0.8" />

          {/* alternating ring colors for depth */}
          {ringRadii.map((r, i) => {
            const tone = i === 0 ? "#e1d2b1" :
                        i === 1 ? "#d3c8a8" :
                        i === 2 ? "#c2b58c" : "#b09a6a";
            return (
              <circle key={"ring" + r} cx={tcx} cy={tcy} r={r}
                fill={tone} stroke={C} strokeWidth="0.9" />
            );
          })}
          {/* soft top-left sheen for a domed target look */}
          <defs>
            <radialGradient id="accSheen" cx="0.4" cy="0.32" r="0.72">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.34" />
              <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="1" stopColor="#000000" stopOpacity="0.16" />
            </radialGradient>
          </defs>
          <circle cx={tcx} cy={tcy} r={ringRadii[0]} fill="url(#accSheen)" />
          {/* score numbers in each ring (faint, at top) */}
          {ringRadii.map((r, i) => {
            const prev = i === 0 ? r + 6 : ringRadii[i - 1];
            const labelR = (prev + r) / 2;
            return (
              <text key={"sc" + r} x={tcx} y={tcy - labelR + 4} textAnchor="middle" fill={C}
                style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })} opacity="0.55">
                {ringScores[i]}
              </text>
            );
          })}

          {/* center dot */}
          <circle cx={tcx} cy={tcy} r={5} fill={A} stroke={T.ink} strokeWidth="0.7" />
          <circle cx={tcx} cy={tcy} r={1.5} fill={T.paper} />

          {/* TRUE VALUE label with leader */}
          <line x1={tcx} y1={tcy - ringRadii[0] - 22} x2={tcx} y2={tcy - ringRadii[0] - 12}
            stroke={T.mute} strokeWidth="0.7" />
          <text x={tcx} y={tcy - ringRadii[0] - 28} textAnchor="middle" fill={C}
            style={f.mono(700, 9.5, { upper: true, tracking: 0.22 })}>true value</text>

          {/* ===== dart marks (each measurement) ===== */}
          {pts.map((p, i) => (
            <g key={i} transform={`translate(${tcx + p.offX} ${tcy + p.offY})`}>
              {/* dart body */}
              <circle r={4.2} fill={A} stroke={T.ink} strokeWidth="0.85" />
              <circle r={1.6} fill={T.paper} opacity="0.85" />
              {/* number label, only if not too crowded */}
              {pts.length <= 12 && (
                <text x={7} y={3} fill={T.mute}
                  style={f.mono(600, 7.5)}>{p.n}</text>
              )}
            </g>
          ))}

          {/* ===== Mean crosshair + connector to bullseye ===== */}
          {pts.length >= 2 && (
            <g>
              <line x1={tcx} y1={tcy} x2={tcx + mx} y2={tcy + my}
                stroke={C} strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
              <g transform={`translate(${tcx + mx} ${tcy + my})`}>
                <circle r={11} fill={T.paper} opacity="0.55"
                  stroke={C} strokeWidth="1.4" strokeDasharray="3 3" />
                <line x1={-12} y1={0} x2={12} y2={0} stroke={C} strokeWidth="2.2"
                  strokeLinecap="round" />
                <line x1={0} y1={-12} x2={0} y2={12} stroke={C} strokeWidth="2.2"
                  strokeLinecap="round" />
                {/* "AVG" tag */}
                <rect x={14} y={-8} width={26} height={14} rx={3}
                  fill={C} stroke={T.ink} strokeWidth="0.5" />
                <text x={27} y={3} textAnchor="middle" fill={T.paper}
                  style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>avg</text>
              </g>
            </g>
          )}

          {/* ===== STATS PANEL on the right ===== */}
          {(() => {
            const px = 360, py = 24, pw = W - px - 18, ph = 250;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={8}
                  fill={T.paper2} stroke={C} strokeWidth="1.1" />
                <text x={px + pw / 2} y={py + 20} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>method check</text>

                {/* Reads */}
                <text x={px + 14} y={py + 50} fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.16 })}>reads</text>
                <text x={px + pw - 14} y={py + 50} textAnchor="end" fill={C}
                  style={f.mono(700, 18)}>{pts.length}</text>

                {/* Avg single distance */}
                <line x1={px + 12} y1={py + 66} x2={px + pw - 12} y2={py + 66}
                  stroke={T.rule22} strokeWidth="0.6" />
                <text x={px + 14} y={py + 84} fill={A}
                  style={f.mono(600, 9, { upper: true, tracking: 0.16 })}>single</text>
                <text x={px + pw - 14} y={py + 84} textAnchor="end" fill={A}
                  style={f.mono(700, 14)}>
                  {pts.length ? avgSingle.toFixed(0) : "-"}
                </text>
                <text x={px + 14} y={py + 96} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>avg dart miss</text>

                {/* Mean distance */}
                <text x={px + 14} y={py + 124} fill={C}
                  style={f.mono(600, 9, { upper: true, tracking: 0.16 })}>average</text>
                <text x={px + pw - 14} y={py + 124} textAnchor="end" fill={C}
                  style={f.mono(700, 14)}>
                  {pts.length >= 2 ? meanDist.toFixed(0) : "-"}
                </text>
                <text x={px + 14} y={py + 136} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>cross miss</text>

                {/* Bar chart: avg single vs avg dart miss */}
                {pts.length >= 2 && (() => {
                  const maxBarV = Math.max(avgSingle, meanDist, 5);
                  const barX = px + 14, barTop = py + 158, barH = 60, barW = pw - 28;
                  const aH = Math.round((avgSingle / maxBarV) * barH);
                  const mH = Math.round((meanDist / maxBarV) * barH);
                  return (
                    <g>
                      <text x={barX} y={barTop - 4} fill={T.mute}
                        style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>compare miss</text>
                      {/* single bar */}
                      <rect x={barX} y={barTop + (barH - aH)} width={(barW - 8) / 2} height={aH}
                        fill={A} />
                      <text x={barX + (barW - 8) / 4} y={barTop + barH + 12} textAnchor="middle" fill={A}
                        style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>single</text>
                      {/* avg bar */}
                      <rect x={barX + barW / 2 + 4} y={barTop + (barH - mH)} width={(barW - 8) / 2} height={mH}
                        fill={C} />
                      <text x={barX + barW / 2 + 4 + (barW - 8) / 4} y={barTop + barH + 12} textAnchor="middle" fill={C}
                        style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>avg</text>
                      {/* axis line */}
                      <line x1={barX} y1={barTop + barH} x2={barX + barW} y2={barTop + barH}
                        stroke={C} strokeWidth="0.8" />
                    </g>
                  );
                })()}

                {/* Footer hint */}
                <text x={px + pw / 2} y={py + ph - 10} textAnchor="middle" fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>lower is closer to true</text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Btn small icon={Plus} color={A} onClick={add}>another measurement</Btn>
        <Btn small color={A} onClick={addBurst}>burst of 5</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Reads", v: pts.length, color: C },
        { l: "Single miss (avg)", v: pts.length ? avgSingle.toFixed(0) + " px" : "-", color: A },
        { l: "Average miss", v: pts.length >= 2 ? meanDist.toFixed(0) + " px" : "-", color: C },
      ]} />

      <Caption color={C}>
        One reading is noisy. Take several reads and average them: the random
        misses cancel out, and the average lands much closer to the true value
        than any single dart. Accuracy comes from method, not luck.
      </Caption>
    </div>
  );
}

/* ---------- TTB-03 Urban heat and shade ---------- */
// shared campus map used by both ExtraHeatGrid and ExtraCoolRoute
const CAMPUS_MAP_LAYOUT = [
  // rows x cols. types: "P" = paved, "L" = lawn, "T" = tree-shaded, "B" = building shadow
  ["P", "P", "L", "P", "L", "P"],
  ["P", "T", "T", "P", "T", "P"],
  ["B", "T", "L", "T", "T", "B"],
  ["P", "P", "P", "P", "P", "P"],
];
const CAMPUS_BASE_TEMP = {
  P: 38,   // paved: hot
  L: 33,   // lawn: warm
  T: 27,   // tree-shaded: cool
  B: 29,   // building shadow: cool
};
const CAMPUS_TYPE_LABEL = { P: "paved", L: "lawn", T: "tree", B: "building" };
const campusGrid = () =>
  CAMPUS_MAP_LAYOUT.map((row, r) =>
    row.map((kind, c) => ({
      kind,
      temp: CAMPUS_BASE_TEMP[kind] + ((r * 7 + c * 11) % 5) * 0.4,
    })));

// Heat color: continuous gradient from cool (deep green) to hot (red)
function heatColor(temp) {
  const tMin = 27, tMax = 40;
  const t = Math.max(0, Math.min(1, (temp - tMin) / (tMax - tMin)));
  // 3-stop ramp: green -> amber -> red
  const stops = [
    { p: 0.0, c: [62, 107, 60] },     // deep green
    { p: 0.5, c: [214, 161, 78] },    // amber
    { p: 1.0, c: [196, 69, 44] },     // red
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let k = 0; k < stops.length - 1; k++) {
    if (t >= stops[k].p && t <= stops[k + 1].p) { lo = stops[k]; hi = stops[k + 1]; break; }
  }
  const span = hi.p - lo.p;
  const u = span > 0 ? (t - lo.p) / span : 0;
  const rgb = [0, 1, 2].map((i) => Math.round(lo.c[i] + (hi.c[i] - lo.c[i]) * u));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

// Type chip: small colored corner badge with a single letter
const TYPE_CHIP_COLOR = {
  P: "#7a7470",   // paved -> warm gray
  L: "#a5c34d",   // lawn  -> lime
  T: "#2e6b3f",   // tree  -> deep moss
  B: "#5b6878",   // building -> slate blue
};
function TypeGlyph({ kind, gx, gy }) {
  const w = 14, h = 10;
  return (
    <g transform={`translate(${gx} ${gy})`}>
      <rect x={0} y={0} width={w} height={h} rx={2}
        fill={TYPE_CHIP_COLOR[kind]} stroke={T.ink} strokeWidth="0.4" />
      <text x={w / 2} y={h - 2.5} textAnchor="middle" fill={T.paper}
        style={f.mono(700, 7.5, { upper: true, tracking: 0.18 })}>{kind}</text>
    </g>
  );
}

function HeatTile({ x, y, w, h, kind, temp, highlight, onPointer, onLeave, faded, showText = true }) {
  const bg = heatColor(temp);
  const isDark = temp >= 33;    // text/glyph contrast
  const textColor = isDark ? T.paper : T.ink;
  const opacity = faded ? 0.55 : 1;
  return (
    <g style={{ cursor: onPointer ? "pointer" : "default" }}
       onPointerEnter={onPointer} onPointerLeave={onLeave}>
      <rect x={x} y={y} width={w} height={h}
        fill={bg} stroke={highlight ? T.ink : T.paper}
        strokeWidth={highlight ? 1.8 : 0.8} opacity={opacity} />
      {/* type chip: top-left corner */}
      <TypeGlyph kind={kind} gx={x + 4} gy={y + 4} />
      {/* temperature: centered, large */}
      {showText && (
        <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle"
          fill={textColor} opacity={opacity}
          style={f.mono(700, 14, { tracking: 0.1 })}>
          {temp.toFixed(0)}°
        </text>
      )}
    </g>
  );
}

function ExtraHeatGrid() {
  // Interactive campus heat map: hover any tile to see its temperature and type.
  const grid = useMemo(() => campusGrid(), []);
  const [hover, setHover] = useState(null);
  const A = CAMP.trees.acc, C = CAMP.trees.ink;
  const okC = T.ok;

  const ROWS = grid.length, COLS = grid[0].length;
  // ----- Layout (everything has its own zone, no overlap) -----
  const W = 580, H = 340;
  const titleY = 30;                 // map title
  const mapX = 20, mapY = 56;
  const tileW = 60, tileH = 52;
  const mapW = tileW * COLS;         // 360
  const mapH = tileH * ROWS;         // 208
  // Right panel
  const panelX = mapX + mapW + 16;   // 396
  const panelY = mapY;
  const panelW = W - panelX - 16;    // 168
  const panelH = mapH;
  // Sun (top-right corner, above the panel)
  const sunCx = panelX + panelW / 2;
  const sunCy = 32;
  // Legend (below map, full map width)
  const legendY = mapY + mapH + 28;

  const flat = grid.flat();
  const allTemps = flat.map((t) => t.temp);
  const tMin = Math.min(...allTemps), tMax = Math.max(...allTemps);
  const tAvg = allTemps.reduce((s, v) => s + v, 0) / allTemps.length;
  const counts = { P: 0, L: 0, T: 0, B: 0 };
  flat.forEach((t) => counts[t.kind]++);

  return (
    <div>
      <Field height={340}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* ===== Title ===== */}
          <text x={mapX} y={titleY} fill={C}
            style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>campus heat map</text>
          <text x={mapX} y={titleY + 12} fill={T.mute}
            style={f.mono(500, 8.5, { upper: true, tracking: 0.18 })}>surface temperature · noon</text>

          {/* ===== Sun (top-right, outside the map) ===== */}
          <defs>
            <radialGradient id="hgSun" cx="0.38" cy="0.34" r="0.7">
              <stop offset="0" stopColor="#ffe79a" />
              <stop offset="0.55" stopColor="#f3c95c" />
              <stop offset="1" stopColor="#e0a83c" />
            </radialGradient>
          </defs>
          <g transform={`translate(${sunCx} ${sunCy})`}>
            <circle r={17} fill="#f3c95c" opacity="0.16" />
            {Array.from({ length: 8 }, (_, k) => {
              const a = (k / 8) * Math.PI * 2;
              return (
                <line key={k}
                  x1={Math.cos(a) * 14} y1={Math.sin(a) * 14}
                  x2={Math.cos(a) * 19} y2={Math.sin(a) * 19}
                  stroke="#cf963b" strokeWidth="1.5" strokeLinecap="round" />
              );
            })}
            <circle r={10} fill="url(#hgSun)" stroke={T.ink} strokeWidth="0.9" />
          </g>
          <text x={sunCx} y={sunCy + 30} textAnchor="middle" fill={T.mute}
            style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>noon sun</text>

          {/* ===== Tiles ===== */}
          {grid.map((row, r) => row.map((cell, c) => (
            <HeatTile key={r + "," + c}
              x={mapX + c * tileW} y={mapY + r * tileH}
              w={tileW} h={tileH}
              kind={cell.kind} temp={cell.temp}
              highlight={hover && hover.r === r && hover.c === c}
              onPointer={() => setHover({ r, c, ...cell })}
              onLeave={() => setHover(null)}
            />
          )))}
          {/* Map border */}
          <rect x={mapX} y={mapY} width={mapW} height={mapH}
            fill="none" stroke={T.ink} strokeWidth="1.4" />

          {/* ===== Legend row (below map) ===== */}
          {(() => {
            const items = [
              { kind: "P", label: "paved" },
              { kind: "L", label: "lawn" },
              { kind: "T", label: "tree" },
              { kind: "B", label: "building" },
            ];
            const slotW = mapW / items.length;
            return items.map((it, i) => (
              <g key={it.kind} transform={`translate(${mapX + i * slotW} ${legendY})`}>
                <TypeGlyph kind={it.kind} gx={0} gy={-10} />
                <text x={22} y={0} fill={C}
                  style={f.mono(700, 9.5, { upper: true, tracking: 0.18 })}>
                  {it.label}
                </text>
                <text x={22} y={12} fill={T.mute}
                  style={f.mono(500, 8, { upper: true, tracking: 0.14 })}>
                  {counts[it.kind]} tiles · ~{CAMPUS_BASE_TEMP[it.kind]}°
                </text>
              </g>
            ));
          })()}

          {/* ===== Heat scale bar (right side under the panel) ===== */}
          {(() => {
            const sbX = mapX, sbY = legendY + 28;
            const sbW = mapW, sbH = 10;
            const stops = 24;
            return (
              <g>
                <text x={sbX} y={sbY - 4} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>cool</text>
                <text x={sbX + sbW} y={sbY - 4} textAnchor="end" fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>hot</text>
                {Array.from({ length: stops }, (_, k) => (
                  <rect key={k} x={sbX + (k * sbW) / stops} y={sbY}
                    width={sbW / stops + 0.5} height={sbH}
                    fill={heatColor(27 + (k / (stops - 1)) * 13)} />
                ))}
                <rect x={sbX} y={sbY} width={sbW} height={sbH}
                  fill="none" stroke={T.ink} strokeWidth="0.6" />
                {/* tick: hover temp */}
                {hover && (() => {
                  const px = sbX + ((hover.temp - 27) / 13) * sbW;
                  return (
                    <g>
                      <line x1={px} y1={sbY - 3} x2={px} y2={sbY + sbH + 3}
                        stroke={T.ink} strokeWidth="1.4" />
                      <polygon
                        points={`${px - 4},${sbY + sbH + 3} ${px + 4},${sbY + sbH + 3} ${px},${sbY + sbH + 9}`}
                        fill={T.ink} />
                    </g>
                  );
                })()}
              </g>
            );
          })()}

          {/* ===== Right panel ===== */}
          {(() => {
            const px = panelX, py = panelY, pw = panelW, ph = panelH;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" />
                {hover ? (
                  <g>
                    <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                      style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>tile reading</text>

                    <text x={px + 12} y={py + 42} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>type</text>
                    <g transform={`translate(${px + 12} ${py + 50})`}>
                      <TypeGlyph kind={hover.kind} gx={0} gy={0} />
                    </g>
                    <text x={px + 36} y={py + 62} fill={C}
                      style={f.mono(700, 12, { upper: true, tracking: 0.18 })}>
                      {CAMPUS_TYPE_LABEL[hover.kind]}
                    </text>

                    <line x1={px + 10} y1={py + 78} x2={px + pw - 10} y2={py + 78}
                      stroke={T.rule22} strokeWidth="0.6" />

                    <text x={px + 12} y={py + 96} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>temperature</text>
                    <text x={px + 12} y={py + 122} fill={hover.temp > 33 ? A : okC}
                      style={f.mono(700, 24)}>{hover.temp.toFixed(1)}°</text>

                    <text x={px + 12} y={py + 140} fill={T.mute}
                      style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>
                      +{(hover.temp - tMin).toFixed(1)}° vs coolest
                    </text>
                    <text x={px + 12} y={py + 152} fill={T.mute}
                      style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>
                      {(hover.temp - tMax).toFixed(1)}° vs hottest
                    </text>

                    <line x1={px + 10} y1={py + 168} x2={px + pw - 10} y2={py + 168}
                      stroke={T.rule22} strokeWidth="0.6" />

                    <text x={px + 12} y={py + 186} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>position</text>
                    <text x={px + 12} y={py + 200} fill={C}
                      style={f.mono(700, 11)}>row {hover.r + 1} · col {hover.c + 1}</text>
                  </g>
                ) : (
                  <g>
                    <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                      style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>map stats</text>

                    <text x={px + 12} y={py + 44} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>average</text>
                    <text x={px + pw - 12} y={py + 44} textAnchor="end" fill={C}
                      style={f.mono(700, 14)}>{tAvg.toFixed(1)}°</text>

                    <text x={px + 12} y={py + 70} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>coolest</text>
                    <text x={px + pw - 12} y={py + 70} textAnchor="end" fill={okC}
                      style={f.mono(700, 14)}>{tMin.toFixed(1)}°</text>

                    <text x={px + 12} y={py + 96} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>hottest</text>
                    <text x={px + pw - 12} y={py + 96} textAnchor="end" fill={A}
                      style={f.mono(700, 14)}>{tMax.toFixed(1)}°</text>

                    <text x={px + 12} y={py + 122} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>spread</text>
                    <text x={px + pw - 12} y={py + 122} textAnchor="end" fill={C}
                      style={f.mono(700, 14)}>{(tMax - tMin).toFixed(1)}°</text>

                    <line x1={px + 10} y1={py + 138} x2={px + pw - 10} y2={py + 138}
                      stroke={T.rule22} strokeWidth="0.6" />

                    <text x={px + pw / 2} y={py + 160} textAnchor="middle" fill={T.mute}
                      style={f.mono(500, 8.5, { upper: true, tracking: 0.18 })}>hover a tile</text>
                    <text x={px + pw / 2} y={py + 174} textAnchor="middle" fill={T.mute}
                      style={f.mono(500, 8.5, { upper: true, tracking: 0.18 })}>for details</text>
                  </g>
                )}
              </g>
            );
          })()}
        </svg>
      </Field>
      <Readout items={[
        { l: "Coolest", v: tMin.toFixed(1) + "°", color: okC },
        { l: "Hottest", v: tMax.toFixed(1) + "°", color: A },
        { l: "Spread", v: (tMax - tMin).toFixed(1) + "°" },
      ]} />

      <Caption color={C}>
        Paved surfaces in the sun get much hotter than shaded ones. The map
        shows surface temperature for each block on a small campus. Hover any
        tile to see its reading; the difference between sunny pavement and
        tree shade is several degrees.
      </Caption>
    </div>
  );
}

/* ---------- TTB-03 Data-backed routing ---------- */
function ExtraCoolRoute() {
  // Same campus map. Compare a "cool route" (greedy by temperature) with the
  // "direct route" (stay on the shortest grid path) from start to end.
  const grid = useMemo(() => campusGrid(), []);
  const ROWS = grid.length, COLS = grid[0].length;
  const start = [0, 0], end = [ROWS - 1, COLS - 1];
  const C = CAMP.trees.ink;
  const coolColor = "#2c5b85";   // cool: deep blue
  const hotColor = "#c4452c";    // direct: hot red
  const okC = T.ok;

  // Direct route: down then right (stair-step along the diagonal)
  const directPath = useMemo(() => {
    const path = [];
    let r = start[0], c = start[1];
    path.push([r, c]);
    while (r < end[0] || c < end[1]) {
      // alternate down/right so it looks diagonal
      if (r < end[0] && c < end[1]) {
        if ((r + c) % 2 === 0) r++; else c++;
      } else if (r < end[0]) r++;
      else c++;
      path.push([r, c]);
    }
    return path;
  }, []);

  // Cool route: at each step pick the move that lands on the cooler tile
  // (with a small bias toward making progress toward the goal so it terminates)
  const coolPath = useMemo(() => {
    const path = [[...start]];
    let r = start[0], c = start[1];
    let guard = 0;
    while ((r !== end[0] || c !== end[1]) && guard < 50) {
      guard++;
      const options = [];
      if (r < end[0]) options.push([r + 1, c]);
      if (c < end[1]) options.push([r, c + 1]);
      // pick coolest
      options.sort((a, b) => grid[a[0]][a[1]].temp - grid[b[0]][b[1]].temp);
      const [nr, nc] = options[0];
      r = nr; c = nc;
      path.push([r, c]);
    }
    return path;
  }, [grid]);

  const tempSum = (path) => path.reduce((s, [r, c]) => s + grid[r][c].temp, 0);
  const coolSum = tempSum(coolPath);
  const directSum = tempSum(directPath);
  const coolAvg = coolSum / coolPath.length;
  const directAvg = directSum / directPath.length;
  const savings = directAvg - coolAvg;

  // Animation
  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const [, force] = useState(0);
  useRAF(running, (dt) => {
    tRef.current += dt;
    force((v) => v + 1);
    const total = (coolPath.length + directPath.length) * 220;
    if (tRef.current > total + 600) setRunning(false);
  });
  const start_ = () => { tRef.current = 0; setRunning(true); };
  const reset = () => { tRef.current = 0; setRunning(false); force((v) => v + 1); };

  // Geometry: narrower tiles so the right panel can be wider
  const W = 540, H = 290;
  const mapX = 20, mapY = 30;
  const tileW = 56, tileH = 50;
  const mapW = tileW * COLS;
  const mapH = tileH * ROWS;

  // Two routes often share a tile, so offset each path by a small diagonal
  // amount so both stay visible on shared segments.
  const COOL_DX = -3, COOL_DY = -3;
  const DIR_DX = 3,  DIR_DY = 3;
  const center = (r, c) => ({ x: mapX + c * tileW + tileW / 2, y: mapY + r * tileH + tileH / 2 });
  const centerOff = (r, c, dx, dy) => {
    const p = center(r, c);
    return { x: p.x + dx, y: p.y + dy };
  };

  // How many path nodes to draw based on animation progress
  const stepMs = 220;
  const elapsed = tRef.current;
  const coolN = Math.min(coolPath.length, Math.floor(elapsed / stepMs) + 1);
  const directStart = coolPath.length * stepMs + 200;
  const directN = Math.min(directPath.length, Math.max(0, Math.floor((elapsed - directStart) / stepMs) + 1));

  return (
    <div>
      <Field height={300}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* tiles (faded so paths stand out) */}
          {grid.map((row, r) => row.map((cell, c) => (
            <HeatTile key={r + "," + c}
              x={mapX + c * tileW} y={mapY + r * tileH}
              w={tileW} h={tileH}
              kind={cell.kind} temp={cell.temp}
              highlight={false} faded
            />
          )))}
          <rect x={mapX} y={mapY} width={mapW} height={mapH}
            fill="none" stroke={T.ink} strokeWidth="1.4" />

          {/* direct route (drawn first, offset +3/+3 so it doesn't hide behind cool) */}
          {(() => {
            const d = directPath.slice(0, directN).map(([r, c], i) => {
              const p = centerOff(r, c, DIR_DX, DIR_DY);
              return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
            }).join(" ");
            return d && (
              <g>
                <path d={d} stroke={hotColor} strokeWidth="3" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" />
                {directPath.slice(0, directN).map(([r, c], i) => {
                  const p = centerOff(r, c, DIR_DX, DIR_DY);
                  return <circle key={"d" + i} cx={p.x} cy={p.y} r={3.2} fill={hotColor} stroke={T.ink} strokeWidth="0.5" />;
                })}
              </g>
            );
          })()}

          {/* cool route (drawn on top, offset -3/-3) */}
          {(() => {
            const d = coolPath.slice(0, coolN).map(([r, c], i) => {
              const p = centerOff(r, c, COOL_DX, COOL_DY);
              return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
            }).join(" ");
            return d && (
              <g>
                <path d={d} stroke={coolColor} strokeWidth="3" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" />
                {coolPath.slice(0, coolN).map(([r, c], i) => {
                  const p = centerOff(r, c, COOL_DX, COOL_DY);
                  return <circle key={"c" + i} cx={p.x} cy={p.y} r={3.2} fill={coolColor} stroke={T.ink} strokeWidth="0.5" />;
                })}
              </g>
            );
          })()}

          {/* start and end markers (drawn LAST so they sit on top of all paths) */}
          {(() => {
            const s = center(start[0], start[1]);
            const e = center(end[0], end[1]);
            const r = 16;
            return (
              <g>
                {/* white halo so markers stand out against routes */}
                <circle cx={s.x} cy={s.y} r={r + 2} fill={T.paper} stroke={T.ink} strokeWidth="0.7" />
                <circle cx={s.x} cy={s.y} r={r} fill={C} stroke={T.ink} strokeWidth="1.1" />
                <text x={s.x} y={s.y + 3} textAnchor="middle" fill={T.paper}
                  style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>start</text>
                <circle cx={e.x} cy={e.y} r={r + 2} fill={T.paper} stroke={T.ink} strokeWidth="0.7" />
                <circle cx={e.x} cy={e.y} r={r} fill={okC} stroke={T.ink} strokeWidth="1.1" />
                <text x={e.x} y={e.y + 3} textAnchor="middle" fill={T.paper}
                  style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>end</text>
              </g>
            );
          })()}

          {/* legend (route colors) bottom-left */}
          {(() => {
            const lx = mapX, ly = mapY + mapH + 18;
            return (
              <g>
                <line x1={lx} y1={ly} x2={lx + 22} y2={ly}
                  stroke={coolColor} strokeWidth="3.4" strokeLinecap="round" />
                <text x={lx + 28} y={ly + 4} fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.16 })}>cool route</text>
                <line x1={lx + 130} y1={ly} x2={lx + 152} y2={ly}
                  stroke={hotColor} strokeWidth="3" strokeLinecap="round" />
                <text x={lx + 158} y={ly + 4} fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.16 })}>direct route</text>
              </g>
            );
          })()}

          {/* comparison panel (right) */}
          {(() => {
            const px = mapX + mapW + 14, py = mapY, pw = W - px - 16, ph = mapH;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" />
                <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>route stats</text>

                <text x={px + 10} y={py + 42} fill={coolColor}
                  style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>cool</text>
                <text x={px + 10} y={py + 60} fill={coolColor}
                  style={f.mono(700, 14)}>{coolAvg.toFixed(1)}° avg</text>
                <text x={px + 10} y={py + 72} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>
                  {coolPath.length} tiles · sum {coolSum.toFixed(0)}°
                </text>

                <line x1={px + 8} y1={py + 86} x2={px + pw - 8} y2={py + 86}
                  stroke={T.rule22} strokeWidth="0.6" />

                <text x={px + 10} y={py + 104} fill={hotColor}
                  style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>direct</text>
                <text x={px + 10} y={py + 122} fill={hotColor}
                  style={f.mono(700, 14)}>{directAvg.toFixed(1)}° avg</text>
                <text x={px + 10} y={py + 134} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>
                  {directPath.length} tiles · sum {directSum.toFixed(0)}°
                </text>

                <line x1={px + 8} y1={py + 148} x2={px + pw - 8} y2={py + 148}
                  stroke={T.rule22} strokeWidth="0.6" />

                <text x={px + 10} y={py + 170} fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.16 })}>savings per tile</text>
                <text x={px + 10} y={py + 190} fill={okC}
                  style={f.mono(700, 16)}>
                  {savings >= 0 ? "−" : "+"}{Math.abs(savings).toFixed(1)}°</text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Btn small icon={Play} color={coolColor} onClick={start_}>trace routes</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Cool avg", v: coolAvg.toFixed(1) + "°", color: coolColor },
        { l: "Direct avg", v: directAvg.toFixed(1) + "°", color: hotColor },
        { l: "Savings", v: "−" + Math.max(0, savings).toFixed(1) + "° / tile", color: okC },
      ]} />

      <Caption color={C}>
        Two routes from start to end across the same campus. The direct
        route cuts diagonally over hot pavement. The cool route detours
        through tree shade and building shadow. Using the heat data, the
        cool route averages several degrees cooler per tile of walking.
      </Caption>
    </div>
  );
}

/* ---------- TTB-04 Photosynthesis makes oxygen ---------- */
function ExtraPhotoO2() {
  // Photosynthesis Float-Off: leaf disks at the bottom of a beaker of baking
  // soda solution. Light drives O2 production, each disk slowly fills, then
  // floats. Bubbles emit from active disks. Stats track time-to-half-float.
  const A = CAMP.trees.acc, C = CAMP.trees.ink;
  const okC = T.ok;
  const NUM_DISKS = 8;

  const [light, setLight] = useState(70);
  const [co2, setCo2] = useState(60);
  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const disksRef = useRef(null);
  const bubblesRef = useRef([]);
  const halfTimeRef = useRef(null);
  const [, force] = useState(0);

  // Geometry: narrower beaker so the side panel has room
  const W = 540, H = 320;
  const beakerLeft = 110, beakerRight = 360;
  const beakerTop = 70, beakerBot = 280;
  const surfaceY = beakerTop + 18;
  const bottomY = beakerBot - 10;
  const lampCx = (beakerLeft + beakerRight) / 2;

  const initDisks = () => {
    const span = beakerRight - beakerLeft - 32;
    return Array.from({ length: NUM_DISKS }, (_, i) => ({
      i,
      x: beakerLeft + 16 + (span * (i + 0.5)) / NUM_DISKS,
      yFrac: 0,
      fill: 0,
      floated: false,
      vigor: 0.7 + Math.random() * 0.6,   // 0.7..1.3 so disks float at different times
    }));
  };
  if (disksRef.current == null) disksRef.current = initDisks();

  const reset = () => {
    tRef.current = 0;
    disksRef.current = initDisks();
    bubblesRef.current = [];
    halfTimeRef.current = null;
    setRunning(false);
    force((v) => v + 1);
  };
  const toggle = () => {
    if (running) {
      setRunning(false);
    } else {
      if (disksRef.current.every((d) => d.floated)) reset();
      setRunning(true);
    }
  };

  useRAF(running, (dt) => {
    tRef.current += dt;
    const lightF = light / 100;
    const co2F = co2 / 100;
    const ratePerSec = 0.00045 * Math.pow(lightF, 0.75) * (0.3 + co2F * 0.7);

    let floatedCount = 0;
    disksRef.current.forEach((d) => {
      if (d.floated) { floatedCount += 1; return; }
      d.fill = Math.min(1, d.fill + ratePerSec * d.vigor * dt);
      if (d.fill >= 0.6) {
        const rise = (d.fill - 0.5) * ratePerSec * dt * 12;
        d.yFrac = Math.min(1, d.yFrac + rise);
        if (d.yFrac >= 1) {
          d.floated = true;
          floatedCount += 1;
        }
      }
      const pBub = ratePerSec * dt * 80 * Math.max(0.1, d.fill);
      if (Math.random() < pBub) {
        const dy = bottomY - d.yFrac * (bottomY - surfaceY);
        bubblesRef.current.push({
          id: Math.random(),
          x: d.x + (Math.random() - 0.5) * 14,
          y: dy - 4,
          vy: 0.04 + Math.random() * 0.03,
          r: 1.5 + Math.random() * 1.8,
          life: 0,
        });
      }
    });
    bubblesRef.current = bubblesRef.current
      .map((b) => ({ ...b, y: b.y - b.vy * dt, life: b.life + dt }))
      .filter((b) => b.y > surfaceY - 2);

    if (halfTimeRef.current == null && floatedCount >= NUM_DISKS / 2) {
      halfTimeRef.current = tRef.current;
    }
    if (floatedCount >= NUM_DISKS) setRunning(false);
    force((v) => v + 1);
  });

  const elapsed = tRef.current;
  const floatedCount = disksRef.current.filter((d) => d.floated).length;
  const halfTime = halfTimeRef.current;

  return (
    <div>
      <Field height={330}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="o2Water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d6e8de" />
              <stop offset="0.45" stopColor="#c5dccf" />
              <stop offset="1" stopColor="#aecabb" />
            </linearGradient>
            <radialGradient id="o2Glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff3c4" stopOpacity="0.95" />
              <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* ===== LAMP at top (bell pendant) ===== */}
          {/* ceiling mount */}
          <rect x={lampCx - 14} y={0} width={28} height={4} fill={T.paper3} stroke={C} strokeWidth="1" />
          {/* hanging cord */}
          <line x1={lampCx} y1={4} x2={lampCx} y2={14} stroke={C} strokeWidth="1.1" />
          {/* lamp shade - bell curve */}
          <path d={`M ${lampCx - 6} 14
                    L ${lampCx + 6} 14
                    Q ${lampCx + 22} 18 ${lampCx + 30} 38
                    L ${lampCx - 30} 38
                    Q ${lampCx - 22} 18 ${lampCx - 6} 14 Z`}
            fill={T.paper3} stroke={C} strokeWidth="1.4" />
          {/* lamp inner rim */}
          <line x1={lampCx - 30} y1={38} x2={lampCx + 30} y2={38}
            stroke={C} strokeWidth="1" />
          {/* warm pool of light below the lamp, brightening with the light slider */}
          <ellipse cx={lampCx} cy={42} rx={30} ry={18} fill="url(#o2Glow)" opacity={0.1 + light / 100 * 0.5} />
          {/* glowing bulb (off at light=0, bright at 100) */}
          <ellipse cx={lampCx} cy={36} rx={10} ry={5}
            fill="#fff3c4" opacity={0.12 + light / 100 * 0.78} />
          {/* light cone */}
          <path d={`M ${lampCx - 28} 40
                    L ${lampCx + 28} 40
                    L ${beakerRight - 6} ${beakerTop - 2}
                    L ${beakerLeft + 6} ${beakerTop - 2} Z`}
            fill={A} opacity={0.02 + light / 100 * 0.24} />
          {/* sun rays */}
          {Array.from({ length: 9 }, (_, k) => {
            const x1 = lampCx - 24 + k * 6;
            const x2 = beakerLeft + 14 + k * (beakerRight - beakerLeft - 28) / 8;
            return (
              <line key={k} x1={x1} y1={42} x2={x2} y2={beakerTop - 2}
                stroke={A} strokeWidth="0.9"
                strokeDasharray="3 4"
                opacity={0.03 + light / 100 * 0.85} />
            );
          })}

          {/* ===== BEAKER ===== */}
          <path d={`M ${beakerLeft - 8} ${beakerTop}
                    L ${beakerLeft - 8} ${beakerBot - 14}
                    Q ${beakerLeft - 8} ${beakerBot} ${beakerLeft + 8} ${beakerBot}
                    L ${beakerRight - 8} ${beakerBot}
                    Q ${beakerRight + 8} ${beakerBot} ${beakerRight + 8} ${beakerBot - 14}
                    L ${beakerRight + 8} ${beakerTop}`}
            fill="none" stroke={C} strokeWidth="2" />
          {/* glass shine */}
          <line x1={beakerLeft - 4} y1={beakerTop + 18} x2={beakerLeft - 4} y2={beakerBot - 26}
            stroke={T.paper} strokeWidth="1.5" opacity="0.5" />

          {/* liquid */}
          <path d={`M ${beakerLeft - 6} ${surfaceY}
                    L ${beakerLeft - 6} ${beakerBot - 14}
                    Q ${beakerLeft - 6} ${beakerBot - 2} ${beakerLeft + 8} ${beakerBot - 2}
                    L ${beakerRight - 8} ${beakerBot - 2}
                    Q ${beakerRight + 6} ${beakerBot - 2} ${beakerRight + 6} ${beakerBot - 14}
                    L ${beakerRight + 6} ${surfaceY} Z`}
            fill="url(#o2Water)" opacity="0.92" />
          {/* water surface ripples - tiled to fit the full liquid width with no gap */}
          {(() => {
            const liqLeft = beakerLeft - 4;
            const liqRight = beakerRight + 4;
            const liqW = liqRight - liqLeft;
            const count = Math.max(1, Math.round(liqW / 28));   // how many wavelets fit
            const rippleW = liqW / count;                       // exact tile width
            const half = rippleW / 2;
            return Array.from({ length: count }, (_, k) => {
              const x = liqLeft + k * rippleW;
              return (
                <path key={k}
                  d={`M ${x} ${surfaceY} q ${half / 2} -3 ${half} 0 q ${half / 2} 3 ${half} 0`}
                  fill="none" stroke={C} strokeWidth="0.7" opacity="0.55" />
              );
            });
          })()}
          <text x={(beakerLeft + beakerRight) / 2} y={beakerBot + 18} textAnchor="middle" fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>baking-soda solution</text>

          {/* ===== Bubbles ===== */}
          {bubblesRef.current.map((b) => (
            <g key={b.id}>
              <circle cx={b.x} cy={b.y} r={b.r}
                fill="#ffffff" stroke={C} strokeWidth="0.5" opacity="0.85" />
              <circle cx={b.x - b.r * 0.35} cy={b.y - b.r * 0.35} r={b.r * 0.35}
                fill="#ffffff" opacity="0.85" />
            </g>
          ))}

          {/* ===== Leaf disks ===== */}
          {disksRef.current.map((d) => {
            const dy = bottomY - d.yFrac * (bottomY - surfaceY - 4);
            return (
              <g key={d.i}>
                <ellipse cx={d.x} cy={dy + 1} rx={11} ry={3.5}
                  fill={T.ink} opacity="0.15" />
                <ellipse cx={d.x} cy={dy} rx={11} ry={4.5}
                  fill="#5c8a4d" stroke={C} strokeWidth="1" />
                <ellipse cx={d.x} cy={dy - 1.4} rx={7} ry={1.5} fill="#86ad70" opacity="0.75" />
                <ellipse cx={d.x} cy={dy - 0.5} rx={9} ry={3}
                  fill="#9bb98a" opacity={d.fill} />
                {d.fill > 0.4 && !d.floated && (
                  <circle cx={d.x + 3} cy={dy - 0.5} r={1.4}
                    fill="#ffffff" opacity={0.8 * (d.fill - 0.3)} />
                )}
                {d.floated && (
                  <circle cx={d.x} cy={dy - 8} r={3} fill={okC} stroke={T.ink} strokeWidth="0.4" />
                )}
              </g>
            );
          })}

          {/* ===== Stats panel (right) - stacked labels above values to avoid collision ===== */}
          {(() => {
            const px = beakerRight + 24, py = beakerTop, pw = W - px - 16, ph = beakerBot - beakerTop;
            const block = (y, label, value, valColor) => (
              <g>
                <text x={px + 12} y={y} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>{label}</text>
                <text x={px + 12} y={y + 16} fill={valColor}
                  style={f.mono(700, 14)}>{value}</text>
              </g>
            );
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={8}
                  fill={T.paper2} stroke={C} strokeWidth="1.1" />
                <text x={px + pw / 2} y={py + 16} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>experiment</text>
                {block(py + 34, "floated", floatedCount + "/" + NUM_DISKS, okC)}
                {block(py + 70, "elapsed", (elapsed / 1000).toFixed(1) + "s", C)}
                {block(py + 106, "half float", halfTime == null ? "-" : (halfTime / 1000).toFixed(1) + "s", A)}
                {/* Mini progress bar of floated disks */}
                <text x={px + 12} y={py + 146} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>progress</text>
                <rect x={px + 12} y={py + 152} width={pw - 24} height={8} rx={2}
                  fill={T.paper3} stroke={C} strokeWidth="0.6" />
                <rect x={px + 12} y={py + 152}
                  width={Math.max(0, (pw - 24) * (floatedCount / NUM_DISKS))} height={8} rx={2}
                  fill={okC} />
                {/* tick marks on the progress bar for each disk */}
                {Array.from({ length: NUM_DISKS - 1 }, (_, k) => (
                  <line key={"tk" + k}
                    x1={px + 12 + ((pw - 24) * (k + 1)) / NUM_DISKS} y1={py + 152}
                    x2={px + 12 + ((pw - 24) * (k + 1)) / NUM_DISKS} y2={py + 160}
                    stroke={C} strokeWidth="0.4" opacity="0.6" />
                ))}
                {/* status pill at the bottom */}
                <rect x={px + 10} y={py + ph - 28} width={pw - 20} height={22} rx={4}
                  fill={running ? okC : T.paper3} stroke={C} strokeWidth="0.8" />
                <text x={px + pw / 2} y={py + ph - 13} textAnchor="middle"
                  fill={running ? T.paper : T.ink}
                  style={f.mono(700, 9.5, { upper: true, tracking: 0.2 })}>
                  {running ? "running" : (floatedCount === NUM_DISKS ? "done" : "paused")}
                </text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={light} set={setLight} min={0} max={100} color={A}
          label="Light" suffix={light + "%"} />
        <Slider val={co2} set={setCo2} min={0} max={100} color={C}
          label="CO₂ (baking soda)" suffix={co2 + "%"} />
        <Btn small icon={running ? Pause : Play} color={A} onClick={toggle}>{running ? "pause" : "start"}</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Floated", v: floatedCount + " / " + NUM_DISKS, color: okC },
        { l: "Half float", v: halfTime == null ? "-" : (halfTime / 1000).toFixed(1) + " s", color: A },
        { l: "Reaction", v: "6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂" },
      ]} />

      <Caption color={C}>
        Sunken leaf disks make oxygen when light hits them and carbon dioxide is
        in the water. The oxygen builds up inside each disk until it floats.
        More light and more CO₂ both speed the rate; the time until half the
        disks float is your measurement.
      </Caption>
    </div>
  );
}

/* ---------- TTB-04 Controlled variables ---------- */
function ExtraControls() {
  // Controlled-variable demo: same float-test recipe, four setups. Three
  // hold every variable constant except one. The chart shows the resulting
  // O2 rate, plus the bar above shows which variable changed vs control.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok;

  // Base "control" values; each variant differs in exactly one knob.
  const CTRL = { light: 60, temp: 22, co2: 40 };
  const setups = [
    { name: "control",   light: 60, temp: 22, co2: 40, changed: null },
    { name: "more light", light: 90, temp: 22, co2: 40, changed: "light" },
    { name: "warmer",    light: 60, temp: 32, co2: 40, changed: "temp" },
    { name: "more CO₂", light: 60, temp: 22, co2: 80, changed: "co2" },
  ];

  // Crude photosynthesis model for the demo:
  // rate = lightFactor * tempFactor * co2Factor
  const o2Rate = (s) => {
    const lF = Math.pow(s.light / 100, 0.85);
    // bell curve around ~25C; warmer = slightly higher in this range
    const tF = 0.7 + Math.min(0.55, Math.max(0, (s.temp - 18) / 25));
    const cF = 0.4 + Math.pow(s.co2 / 100, 0.7);
    return lF * tF * cF * 60;
  };

  const rates = setups.map(o2Rate);
  const maxR = Math.max(...rates);
  const ctrlRate = rates[0];

  // ===== Geometry =====
  const W = 560, H = 320;
  const stationCount = setups.length;
  const sX = 24;                              // left margin
  const sGap = 12;
  const sW = Math.floor((W - 2 * sX - sGap * (stationCount - 1)) / stationCount);  // 122
  const sY = 28;
  const sH = 270;
  // station inner zones
  const headerH = 28;
  const knobH = 78;        // 3 knob bars (light / temp / co2) area
  const beakerH = 60;
  const outH = 92;         // O2 result bar area

  const knobColor = {
    light: "#e8a83b",       // amber for light
    temp:  "#c4452c",       // red for temp
    co2:   "#3a7c3a",       // green for co2
  };
  const knobLabel = { light: "light", temp: "temp", co2: "CO₂" };
  const knobUnit  = { light: "%",    temp: "°C", co2: "ppm" };
  // Mapping each knob value to a bar fill 0..1
  const knobMax = { light: 100, temp: 40, co2: 100 };

  return (
    <div>
      <Field height={325}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* ===== Title ===== */}
          <text x={sX} y={18} fill={C}
            style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>
            controlled-variable trial
          </text>
          <text x={sX + 200} y={18} fill={T.mute}
            style={f.mono(500, 9, { upper: true, tracking: 0.18 })}>
            change one knob at a time, hold the rest
          </text>

          {/* ===== Stations ===== */}
          {setups.map((s, i) => {
            const x = sX + i * (sW + sGap);
            const rate = rates[i];
            const isControl = s.changed === null;
            const deltaPct = isControl ? 0 : ((rate - ctrlRate) / ctrlRate) * 100;
            const cardBg = isControl ? T.paper2 : T.paper2;
            const cardBorder = isControl ? C : T.ink;
            return (
              <g key={s.name}>
                {/* card */}
                <rect x={x} y={sY} width={sW} height={sH} rx={6}
                  fill={cardBg} stroke={cardBorder}
                  strokeWidth={isControl ? 1.6 : 1} />
                {/* header */}
                <rect x={x} y={sY} width={sW} height={headerH}
                  fill={isControl ? C : T.paper3} rx={6} />
                <rect x={x} y={sY + headerH - 4} width={sW} height={4}
                  fill={isControl ? C : T.paper3} />
                <text x={x + 10} y={sY + 18} fill={isControl ? T.paper : T.ink}
                  style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>
                  {s.name}
                </text>
                <text x={x + sW - 10} y={sY + 18} textAnchor="end"
                  fill={isControl ? T.paper2 : T.mute}
                  style={f.mono(500, 8, { upper: true, tracking: 0.18 })}>
                  {isControl ? "baseline" : "test"}
                </text>

                {/* knob rows: [LABEL] [BAR] [VALUE], each in its own column so nothing overlaps */}
                {["light", "temp", "co2"].map((k, ki) => {
                  const ky = sY + headerH + 12 + ki * 22;
                  const value = s[k];
                  const frac = Math.min(1, value / knobMax[k]);
                  const changed = s.changed === k;
                  const labelW = 32;
                  const valueW = 42;
                  const barX = x + 8 + labelW;
                  const barY = ky + 4;
                  const barW = sW - 16 - labelW - valueW;
                  const barH = 6;
                  return (
                    <g key={k}>
                      <text x={x + 8} y={ky + 9} fill={T.mute}
                        style={f.mono(600, 8, { upper: true, tracking: 0.18 })}>
                        {knobLabel[k]}
                      </text>
                      <rect x={barX} y={barY} width={barW} height={barH} rx={2}
                        fill={T.paper3} stroke={T.ink} strokeWidth="0.3" />
                      <rect x={barX} y={barY} width={barW * frac} height={barH} rx={2}
                        fill={knobColor[k]} opacity={changed ? 1 : 0.45} />
                      {changed && (
                        <circle cx={barX + barW + 4} cy={barY + barH / 2} r={2.2}
                          fill={knobColor[k]} stroke={T.ink} strokeWidth="0.35" />
                      )}
                      <text x={x + sW - 8} y={ky + 9} textAnchor="end"
                        fill={changed ? knobColor[k] : T.ink}
                        style={f.mono(changed ? 700 : 500, 8.5, { tracking: 0.05 })}>
                        {value}{knobUnit[k]}
                      </text>
                    </g>
                  );
                })}

                {/* divider */}
                <line x1={x + 8} y1={sY + headerH + knobH + 6}
                  x2={x + sW - 8} y2={sY + headerH + knobH + 6}
                  stroke={T.rule22} strokeWidth="0.6" />

                {/* O2 result */}
                <text x={x + sW / 2} y={sY + headerH + knobH + 22} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 8, { upper: true, tracking: 0.18 })}>O₂ rate</text>
                {/* big number */}
                <text x={x + sW / 2} y={sY + headerH + knobH + 48} textAnchor="middle"
                  fill={isControl ? C : (deltaPct >= 0 ? okC : T.warn)}
                  style={f.mono(700, 20)}>
                  {rate.toFixed(0)}
                </text>
                {/* delta vs control */}
                {!isControl && (
                  <text x={x + sW / 2} y={sY + headerH + knobH + 62} textAnchor="middle"
                    fill={deltaPct >= 0 ? okC : T.warn}
                    style={f.mono(700, 9, { upper: true, tracking: 0.18 })}>
                    {deltaPct >= 0 ? "+" : ""}{deltaPct.toFixed(0)}% vs ctrl
                  </text>
                )}
                {/* O2 bar at the bottom */}
                {(() => {
                  const bx = x + 14, bw = sW - 28, by = sY + sH - 22, bh = 10;
                  const frac = rate / maxR;
                  return (
                    <g>
                      <rect x={bx} y={by} width={bw} height={bh} rx={2}
                        fill={T.paper3} stroke={T.ink} strokeWidth="0.4" />
                      <rect x={bx} y={by} width={bw * frac} height={bh} rx={2}
                        fill={isControl ? C : (deltaPct >= 0 ? okC : T.warn)} />
                      {/* control marker line (where ctrl ends) */}
                      {!isControl && (
                        <line x1={bx + bw * (ctrlRate / maxR)} y1={by - 2}
                          x2={bx + bw * (ctrlRate / maxR)} y2={by + bh + 2}
                          stroke={C} strokeWidth="1" strokeDasharray="2 2" />
                      )}
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </Field>
      <Readout items={[
        { l: "Best gain", v: (() => {
            const others = rates.slice(1);
            const best = Math.max(...others);
            const idx = others.indexOf(best) + 1;
            return setups[idx].name + " · +" + (((best - ctrlRate) / ctrlRate) * 100).toFixed(0) + "%";
          })(), color: okC },
        { l: "Rule", v: "one variable at a time" },
        { l: "Honest test", v: "everything else equal" },
      ]} />

      <Caption color={C}>
        Four identical leaf-disk setups. Three change one variable each
        (more light, warmer water, more carbon dioxide) while the rest
        stay equal to the control. Comparing each rate to the dashed
        control line shows which knob actually matters.
      </Caption>
    </div>
  );
}

/* ---------- PYB-01 Pressure vs force ---------- */
function ExtraPressure() {
  const [area, setArea] = useState(2);   // contact area in cm²  (0.5 to 8)
  const force = 50;                       // newtons (constant)
  const pressure = force / area;
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;

  // visual mapping (px in viewBox)
  const baseW = Math.max(8, area * 22);   // contact patch width
  const dentDepth = Math.min(34, pressure * 0.9);  // how deep the dent goes
  const cx = 180;                          // center x of pusher/dent column
  const surfaceY = 168;                    // top of the clay surface
  const dentColor = `rgba(29,25,22,${0.25 + Math.min(0.55, pressure * 0.02)})`;

  // pressure gauge mapping
  const gaugeMax = 110;                    // max N/cm² shown
  const gaugePct = Math.min(1, pressure / gaugeMax);

  return (
    <div>
      <Field height={260}>
        <svg viewBox="0 0 440 250" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="ppClay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9dcc1" /><stop offset="1" stopColor="#cbb78f" /></linearGradient>
            <linearGradient id="ppBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e3a85f" /><stop offset="1" stopColor="#a8631f" /></linearGradient>
          </defs>
          {/* === LEFT: side-view block pressing into clay === */}
          {/* labeled force arrow */}
          <text x={cx} y={26} textAnchor="middle" fill={T.ink} style={f.mono(700, 12, { upper: true, tracking: 0.2 })}>F = 50 N</text>
          <line x1={cx} y1={32} x2={cx} y2={62} stroke={T.ink} strokeWidth="2.2" />
          <polygon points={`${cx - 7},${56} ${cx + 7},${56} ${cx},${68}`} fill={T.ink} />

          {/* pusher block, wider when area is large */}
          <rect x={cx - baseW / 2} y={68} width={baseW} height={64} rx="2" fill={C} stroke={T.ink} strokeWidth="0.8"
            style={{ transition: "width .25s, x .25s" }} />
          <rect x={cx - baseW / 2 + 1.5} y={70} width={Math.max(2, baseW - 3)} height={9} rx="2" fill="#ffffff" opacity="0.16"
            style={{ transition: "width .25s, x .25s" }} />
          <rect x={cx - baseW / 2 + 1.5} y={123} width={Math.max(2, baseW - 3)} height={7} fill="#000000" opacity="0.16"
            style={{ transition: "width .25s, x .25s" }} />
          {/* tiny dimensioning arrows under pusher showing the contact width */}
          <line x1={cx - baseW / 2} y1={140} x2={cx + baseW / 2} y2={140} stroke={A} strokeWidth="1.2"
            style={{ transition: "x1 .25s, x2 .25s" }} />
          <line x1={cx - baseW / 2} y1={136} x2={cx - baseW / 2} y2={144} stroke={A} strokeWidth="1.2" />
          <line x1={cx + baseW / 2} y1={136} x2={cx + baseW / 2} y2={144} stroke={A} strokeWidth="1.2" />
          <text x={cx} y={155} textAnchor="middle" fill={A} style={f.mono(700, 11)}>{area.toFixed(1)} cm²</text>

          {/* clay surface, soft beige slab with depth grid lines */}
          <rect x={40} y={surfaceY} width={280} height={66} fill="url(#ppClay)" stroke={T.ink} strokeWidth="0.8" />
          {/* depth grid lines */}
          {[8, 16, 24, 32].map((d) => (
            <line key={d} x1={40} y1={surfaceY + d} x2={320} y2={surfaceY + d}
              stroke={T.ink} strokeWidth="0.4" opacity="0.18" />
          ))}
          {/* the actual dent: a smooth concave curve pushed into the clay */}
          <path d={`M ${cx - baseW / 2 - 6} ${surfaceY} Q ${cx} ${surfaceY + dentDepth} ${cx + baseW / 2 + 6} ${surfaceY} L ${cx + baseW / 2 + 6} ${surfaceY - 1} L ${cx - baseW / 2 - 6} ${surfaceY - 1} Z`}
            fill={dentColor}
            style={{ transition: "d .25s" }} />
          {/* dent depth tick on the left edge of the surface */}
          <line x1={36} y1={surfaceY} x2={32} y2={surfaceY} stroke={T.ink} strokeWidth="0.8" />
          <line x1={36} y1={surfaceY + dentDepth} x2={32} y2={surfaceY + dentDepth} stroke={A} strokeWidth="1.4" />
          <text x={28} y={surfaceY + dentDepth + 3} textAnchor="end" fill={A} style={f.mono(700, 10, { upper: true, tracking: 0.14 })}>
            {dentDepth.toFixed(0)}
          </text>
          <text x={28} y={surfaceY + dentDepth + 14} textAnchor="end" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.14 })}>
            depth
          </text>
          {/* surface label moved to the LEFT of the slab so it doesn't collide with the formula */}
          <text x={40} y={surfaceY - 4} fill={T.mute} style={f.mono(600, 9, { upper: true, tracking: 0.2 })}>soft clay</text>

          {/* === RIGHT: vertical pressure gauge === */}
          <g transform="translate(360 30)">
            <text x={20} y={-4} textAnchor="middle" fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>pressure</text>
            <rect x={0} y={0} width={40} height={180} fill="none" stroke={T.ink} strokeWidth="0.8" />
            {/* tick marks */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <g key={t}>
                <line x1={-4} y1={180 - t * 180} x2={0} y2={180 - t * 180} stroke={T.ink} strokeWidth="0.6" />
                <text x={-7} y={183 - t * 180} textAnchor="end" fill={T.mute} style={f.mono(500, 8)}>
                  {Math.round(t * gaugeMax)}
                </text>
              </g>
            ))}
            <rect x={2} y={180 - gaugePct * 180} width={36} height={gaugePct * 180}
              fill="url(#ppBar)" opacity="0.95"
              style={{ transition: "y .25s, height .25s" }} />
            <text x={20} y={200} textAnchor="middle" fill={T.ink} style={f.mono(700, 11)}>
              {pressure.toFixed(1)}
            </text>
            <text x={20} y={211} textAnchor="middle" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.14 })}>n/cm²</text>
          </g>

          {/* === Formula bar at very bottom, in its own row === */}
          <g transform="translate(40 245)">
            <text x={0} y={0} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.22 })}>P = F / A</text>
            <text x={60} y={0} fill={T.ink} style={f.mono(600, 11)}>
              50 N / {area.toFixed(1)} cm² = <tspan fill={A} style={{ fontWeight: 700 }}>{pressure.toFixed(1)} N/cm²</tspan>
            </text>
          </g>
        </svg>
      </Field>
      <div style={{ padding: "0 4px" }}>
        <Slider val={area * 10} set={(v) => setArea(v / 10)} min={5} max={80} step={5}
          color={A} label="Contact area" suffix={area.toFixed(1) + " cm²"} />
      </div>
      <Readout items={[
        { l: "Pressure", v: pressure.toFixed(1) + " N/cm²", color: A },
        { l: "Dent depth", v: pressure > 20 ? "deep" : pressure > 8 ? "moderate" : "shallow" },
        { l: "Why", v: "same force, smaller area → bigger dent" },
      ]} />

      <Caption color={C}>
        Pressure is force divided by area: <strong>P = F / A</strong>. The block always pushes
        with the same 50 N, but a smaller contact area concentrates the force into a higher
        pressure and a deeper dent in the clay.
      </Caption>
    </div>
  );
}

/* ---------- PYB-01 Spreading stress ---------- */
function ExtraStress() {
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  // both pencils use the SAME 50 N force; only contact area differs
  const F = 50;                       // N
  const sharpArea = 0.2;              // cm², bare sharp tip
  const padArea   = 9.0;              // cm², padded tip
  const sharpPressure = F / sharpArea;
  const padPressure   = F / padArea;
  const sharpDent  = Math.min(38, sharpPressure * 0.15);
  const padDent    = Math.min(38, padPressure   * 0.15);
  const sharpDentW = 6;
  const padDentW   = 70;


  const Panel = ({ x, label, sub, dent, dentW, denomArea, denomP, padded }) => {
    // Surface top is at y=172.
    // Pencil body sits with its tip apex AT the surface (or at the top of the pad).
    const tipApexY = padded ? 160 : 172;             // bare tip touches clay; padded tip rests on the pad top
    const coneTopY = tipApexY - 24;                  // 24-tall triangle tip
    const bodyTopY = coneTopY - 64;                  // 64-tall pencil body
    return (
      <g transform={`translate(${x} 0)`}>
        {/* title + subtitle (well above the arrow) */}
        <text x={110} y={18} textAnchor="middle" fill={T.ink} style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>{label}</text>
        <text x={110} y={32} textAnchor="middle" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>{sub}</text>
        {/* clean single-shape down-arrow */}
        <g stroke={T.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1={110} y1={44} x2={110} y2={62} />
          <polyline points="103,55 110,64 117,55" />
        </g>
        <text x={132} y={58} fill={T.mute} style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>50 N</text>
        {/* pencil (body + tip cone + lead) */}
        <g transform="translate(110 0)">
          <rect x={-8} y={bodyTopY} width={16} height={64} fill="url(#psWood)" stroke={T.ink} strokeWidth="0.6" />
          <rect x={-8} y={bodyTopY} width={16} height={6} fill="#b08840" />
          <polygon points={`-8,${coneTopY} 8,${coneTopY} 0,${tipApexY}`} fill="#c79a4e" stroke={T.ink} strokeWidth="0.6" />
          <polygon points={`-2,${tipApexY - 6} 2,${tipApexY - 6} 0,${tipApexY}`} fill="#1d1916" />
        </g>
        {/* clay surface */}
        <rect x={20} y={172} width={180} height={50} fill="url(#psClay)" stroke={T.ink} strokeWidth="0.8" />
        {/* the pad sits ON the surface, BETWEEN the pencil tip and the clay */}
        {padded && (
          <g>
            <ellipse cx={110} cy={167} rx={36} ry={7} fill={A} stroke={T.ink} strokeWidth="0.6" />
            <text x={110} y={170} textAnchor="middle" fill={T.paper} style={f.mono(700, 8, { upper: true, tracking: 0.18 })}>PAD</text>
          </g>
        )}
        {/* dent carved into the clay */}
        <path d={`M ${110 - dentW / 2 - 4} 172 Q 110 ${172 + dent} ${110 + dentW / 2 + 4} 172 L ${110 + dentW / 2 + 4} 171 L ${110 - dentW / 2 - 4} 171 Z`}
          fill={padded ? "rgba(29,25,22,0.18)" : "rgba(29,25,22,0.6)"} />
        {/* dent depth callout */}
        <line x1={208} y1={172} x2={216} y2={172} stroke={T.ink} strokeWidth="0.8" />
        <line x1={208} y1={172 + dent} x2={216} y2={172 + dent} stroke={A} strokeWidth="1.4" />
        <line x1={212} y1={172} x2={212} y2={172 + dent} stroke={A} strokeWidth="1.4" />
        <text x={220} y={172 + dent / 2 + 3} fill={A} style={f.mono(700, 10, { upper: true, tracking: 0.18 })}>
          {dent.toFixed(0)} deep
        </text>
        {/* formula row */}
        <g transform="translate(20 240)">
          <text x={0} y={0} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>P = F / A</text>
          <text x={0} y={14} fill={T.ink} style={f.mono(600, 11)}>
            50 / {denomArea} = <tspan fill={A} style={{ fontWeight: 700 }}>{denomP} N/cm²</tspan>
          </text>
        </g>
      </g>
    );
  };

  return (
    <div>
      <Field height={300}>
        <svg viewBox="0 0 440 280" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="psClay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9dcc1" /><stop offset="1" stopColor="#cbb78f" /></linearGradient>
            <linearGradient id="psWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#cda24f" /><stop offset="0.5" stopColor="#f2dca0" /><stop offset="1" stopColor="#cda24f" /></linearGradient>
          </defs>
          <Panel x={0}   label="bare tip" sub="tiny contact area" dent={sharpDent} dentW={sharpDentW}
                 denomArea={sharpArea.toFixed(1)} denomP={sharpPressure.toFixed(0)} padded={false} />
          <Panel x={220} label="with pad" sub="wide contact area"  dent={padDent}   dentW={padDentW}
                 denomArea={padArea.toFixed(1)}   denomP={padPressure.toFixed(1)}   padded={true} />
        </svg>
      </Field>
      <Readout items={[
        { l: "Pressure drop", v: ((1 - padPressure / sharpPressure) * 100).toFixed(0) + "% lower", color: A },
        { l: "Why", v: "same force spread over more area" },
        { l: "Use", v: "helmets, snowshoes, seatbelts" },
      ]} />

      <Caption color={C}>
        Both pencils push with the same 50 N force, but the padded tip spreads that force over
        a much larger area. Since P = F / A, the pressure drops dramatically and the dent
        almost disappears. That's why helmets, snowshoes, and seatbelts work.
      </Caption>
    </div>
  );
}

/* ---------- PYB-02 Signals travel in a chain ---------- */
function ExtraDomino() {
  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const [, force] = useState(0);
  useRAF(running, (dt) => {
    tRef.current += dt;
    force((v) => v + 1);
    if (tRef.current > 3200) setRunning(false);
  });
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const N = 14;
  const SPACING = 26;                       // px between domino centers
  const ANCHOR_OFFSET = 5;                  // rotation pivot at the FORWARD bottom edge
  const FALL_DURATION = 200;                // ms per domino to fall from upright to leaned
  const TRIGGER_DELAY = 140;                // ms from one domino tipping to triggering the next
  const x0 = 40;                            // first domino x
  // wave front position (the x of the most recently tipped domino, lerped)
  const wavePos = running || tRef.current > 0
    ? x0 + Math.min(N - 1, tRef.current / TRIGGER_DELAY) * SPACING
    : null;
  return (
    <div>
      <Field height={190}>
        <svg viewBox="0 0 440 170" style={{ width: "100%", height: "100%" }}>
          {/* ground line */}
          <rect x={20} y={132} width={400} height={5} fill="#000000" opacity="0.05" />
          <line x1={20} y1={132} x2={420} y2={132} stroke={T.ink} strokeWidth="0.8" />
          {/* finger / trigger that taps the first domino */}
          {tRef.current < 600 && (
            <g transform={`translate(${x0 - 14} ${80 - Math.max(0, 40 - tRef.current * 0.07)})`}>
              <circle cx={0} cy={20} r={9} fill={A} opacity="0.8" stroke={T.ink} strokeWidth="0.6" />
              <text x={0} y={24} textAnchor="middle" fill={T.paper} style={f.mono(700, 9, { upper: true, tracking: 0.14 })}>tap</text>
            </g>
          )}
          {Array.from({ length: N }).map((_, i) => {
            // each domino tips after (i * TRIGGER_DELAY) ms; takes FALL_DURATION ms to complete
            const tFall = tRef.current - i * TRIGGER_DELAY;
            const progress = Math.max(0, Math.min(1, tFall / FALL_DURATION));
            // ease-out so the tip looks like a real fall
            const eased = 1 - Math.pow(1 - progress, 2.6);
            const angle = eased * 86;       // fall up to 86° forward
            const cx = x0 + i * SPACING;
            // rotate around the FORWARD bottom edge (positive-x side) so the domino tilts onto the next one
            return (
              <g key={i} transform={`translate(${cx + ANCHOR_OFFSET} 132) rotate(${angle})`}
                 style={{ transition: "none" }}>
                <rect x={-10} y={-52} width={10} height={52} rx={1.5}
                  fill={progress >= 1 ? A : (progress > 0 ? "#a86038" : C)}
                  stroke={T.ink} strokeWidth="0.8" />
                <rect x={-9.2} y={-50} width={2.4} height={48} rx={1} fill="#ffffff" opacity="0.2" />
                <rect x={-2.4} y={-50} width={2} height={48} rx={1} fill="#000000" opacity="0.12" />
                {/* a single contrasting dot on each domino, to feel like a real domino */}
                <circle cx={-5} cy={-39} r={1.6} fill={T.paper} opacity="0.85" />
              </g>
            );
          })}
          {/* wave-front indicator (small triangle on the ground line) */}
          {wavePos != null && tRef.current < N * TRIGGER_DELAY + 200 && (
            <polygon points={`${wavePos - 5},140 ${wavePos + 5},140 ${wavePos},132`}
              fill={A} opacity="0.85" />
          )}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 8, alignItems: "center" }}>
        <Btn small icon={Play} color={A} onClick={() => { tRef.current = 0; setRunning(true); }}>tap first</Btn>
        <Btn small icon={RotateCcw} onClick={() => { tRef.current = 0; setRunning(false); force((v) => v + 1); }}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Signal", v: tRef.current > 0 ? "propagating →" : "ready", color: A },
        { l: "Wave speed", v: (1000 / TRIGGER_DELAY).toFixed(1) + " tiles/s" },
        { l: "Lesson", v: "each tile triggers the next" },
      ]} />

      <Caption color={C}>
        Tap the first domino and the energy passes from one tile to the next: each falling
        domino pushes its neighbour over. That's exactly how a nerve signal travels: a chain of
        local triggers, not one thing flying down the whole line.
      </Caption>
    </div>
  );
}

/* ---------- PYB-02 Gaps and insulation ---------- */
function ExtraGap() {
  // Middle-school synapse model: sender neuron tip on top, gap in the middle,
  // receiver neuron on the bottom. Signal packets release, cross the gap, and
  // bind to receivers (or scatter if the gap is too wide). Palette matches
  // the rest of the deck (PY-STEM indigo + copper, warm paper background).
  const [gap, setGap] = useState(26);
  const A = CAMP.pystem.acc;     // copper
  const C = CAMP.pystem.ink;     // indigo
  const okC = T.ok;
  const failC = T.warn;
  const transmits = gap < 48;

  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const [, force] = useState(0);
  useRAF(running, (dt) => {
    tRef.current += dt; force((v) => v + 1);
    if (tRef.current > 4800) setRunning(false);
  });

  // Geometry: vertical layout. Gap is a horizontal band.
  const W = 540, H = 300;
  const cx = 270;
  const preY = 122;             // bottom of sender / top of gap
  const postY = preY + gap;     // top of receiver / bottom of gap

  // Phases (ms)
  const t = tRef.current;
  const apTravel     = Math.min(1, Math.max(0, t / 280));
  const apInside     = Math.min(1, Math.max(0, (t - 200) / 220));
  const dockStage    = Math.min(1, Math.max(0, (t - 280) / 420));
  const releaseStage = Math.min(1, Math.max(0, (t - 720) / 420));
  const diffuseStage = Math.min(1, Math.max(0, (t - 1140) / 950));
  const bindStage    = Math.min(1, Math.max(0, (t - 2090) / 400));
  const activated    = transmits && bindStage > 0.55;

  // Signal packets inside the sender (16 in a cluster). Each one docks and
  // fires at the cleft-facing edge in sequence.
  const packets = Array.from({ length: 14 }, (_, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const homeX = cx - 88 + col * 44 + (row % 2 === 0 ? 0 : 18);
    const homeY = 46 + row * 20;
    const tgtX  = cx - 96 + col * 48;
    const tgtY  = preY - 10;
    const dock = Math.min(1, Math.max(0, dockStage * 1.25 - i * 0.04));
    const x = homeX + (tgtX - homeX) * dock;
    const y = homeY + (tgtY - homeY) * dock;
    const released = releaseStage > (i + 1) / 15;
    return { i, x, y, released };
  });

  // Messengers crossing the gap (small copper dots moving downward)
  const molecules = [];
  if (diffuseStage > 0) {
    const nMols = 22;
    for (let k = 0; k < nMols; k++) {
      const phase = Math.max(0, diffuseStage - k * 0.025);
      if (phase <= 0) continue;
      const startX = cx - 110 + (k % 8) * 30;
      const xJitter = Math.sin(k * 1.4 + phase * 4.2) * 14;
      const y = preY + 6 + phase * (gap - 12);
      const x = startX + xJitter;
      const fade = transmits ? Math.max(0, 1.25 - phase) : Math.max(0, 0.55 - phase * 0.55);
      if (fade > 0.05) molecules.push({ id: k, x, y, opacity: fade });
    }
  }

  // Receivers along the post-synaptic edge (6 evenly spaced)
  const receiverXs = [cx - 130, cx - 78, cx - 26, cx + 26, cx + 78, cx + 130];

  const apGlow = Math.min(0.45, apInside * 0.45);
  const reset = () => { tRef.current = 0; setRunning(false); force((v) => v + 1); };
  const fire = () => { tRef.current = 0; setRunning(true); };
  // organic synapse shapes: presynaptic bouton + postsynaptic dendritic spine
  const bouton = `M ${cx - 16} 28 C ${cx - 72} 40 ${cx - 156} 56 ${cx - 160} ${preY - 56} C ${cx - 162} ${preY - 18} ${cx - 138} ${preY} ${cx - 110} ${preY} Q ${cx - 55} ${preY - 6} ${cx} ${preY - 3} Q ${cx + 55} ${preY - 6} ${cx + 110} ${preY} C ${cx + 138} ${preY} ${cx + 162} ${preY - 18} ${cx + 160} ${preY - 56} C ${cx + 156} 56 ${cx + 72} 40 ${cx + 16} 28 Z`;
  const spine = `M ${cx - 178} ${H - 10} L ${cx - 178} ${postY + 40} C ${cx - 150} ${postY + 34} ${cx - 120} ${postY + 6} ${cx - 70} ${postY + 4} Q ${cx - 35} ${postY + 2} ${cx} ${postY} Q ${cx + 35} ${postY + 2} ${cx + 70} ${postY + 4} C ${cx + 120} ${postY + 6} ${cx + 150} ${postY + 34} ${cx + 178} ${postY + 40} L ${cx + 178} ${H - 10} Z`;
  const recpY = (rcx) => postY + Math.pow((rcx - cx) / 178, 2) * 38;

  return (
    <div>
      <Field height={310}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="gpMembrane" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3ece0" /><stop offset="1" stopColor="#e6dac4" /></linearGradient>
          </defs>
          {/* ===== AXON entering from top ===== */}
          <rect x={cx - 18} y={0} width={36} height={28} fill={T.paper3} stroke={C} strokeWidth="1.2" />
          {/* myelin segments */}
          <rect x={cx - 22} y={4} width={44} height={10} rx={5} fill={T.paper2} stroke={C} strokeWidth="0.9" />
          <rect x={cx - 22} y={16} width={44} height={10} rx={5} fill={T.paper2} stroke={C} strokeWidth="0.9" />
          {/* AP pulse traveling down */}
          {apTravel > 0 && apTravel < 1 && (
            <circle cx={cx} cy={apTravel * 26} r={9}
              fill={A} opacity={0.5 * (1 - apTravel * 0.3)} />
          )}

          {/* ===== PRESYNAPTIC TERMINAL (bouton) ===== */}
          <path d={bouton} fill="url(#gpMembrane)" stroke={C} strokeWidth="1.6" />
          {/* AP glow inside the terminal */}
          {apInside > 0 && (
            <path d={bouton} fill={A} opacity={apGlow * (1 - bindStage * 0.6)} />
          )}

          {/* Signal packets inside the sender */}
          {packets.map((v) => (
            !v.released && (
              <g key={"p" + v.i}>
                <circle cx={v.x} cy={v.y} r={9} fill={T.paper} stroke={C} strokeWidth="1.1" />
                <circle cx={v.x - 3} cy={v.y - 1} r={1.6} fill={A} />
                <circle cx={v.x + 2.6} cy={v.y + 0.8} r={1.4} fill={A} />
                <circle cx={v.x - 0.5} cy={v.y + 3} r={1.3} fill={A} />
              </g>
            )
          ))}

          {/* ===== SYNAPSE GAP ===== */}
          <rect x={cx - 170} y={preY} width={340} height={gap}
            fill={T.paper2} stroke={C} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.85" />

          {/* Messengers crossing the gap */}
          {molecules.map((m) => (
            <circle key={m.id} cx={m.x} cy={m.y} r={3.2}
              fill={transmits ? A : failC} opacity={m.opacity}
              stroke={C} strokeWidth="0.45" />
          ))}

          {/* ===== POSTSYNAPTIC DENDRITIC SPINE ===== */}
          <path d={spine}
            fill={activated ? "#d4e3c2" : "url(#gpMembrane)"} stroke={C} strokeWidth="1.6"
            style={{ transition: "fill .35s" }} />
          {/* faint glow in the spine when activated */}
          {activated && (
            <path d={spine} fill={okC} opacity="0.18" />
          )}

          {/* Receptors: small cups on the spine crown, opening toward the cleft */}
          {receiverXs.map((rcx, i) => (
            <g key={"r" + i} transform={`translate(${rcx} ${recpY(rcx)})`} style={{ transition: "fill .35s" }}>
              <path d="M -8 7 L -6 -4 Q 0 -8 6 -4 L 8 7 Z"
                fill={activated ? okC : C} stroke={T.ink} strokeWidth="0.9"
                style={{ transition: "fill .35s" }} />
              <path d="M -4 -1 Q 0 -5 4 -1" fill="none"
                stroke={activated ? "#ffffff" : T.paper2} strokeWidth="1.4" strokeLinecap="round" />
              {activated && <circle cx={0} cy={-3} r={1.9} fill={A} stroke={T.ink} strokeWidth="0.3" />}
            </g>
          ))}

          {/* ===== LABELS (only the essentials, with thin leader lines) ===== */}
          {/* SENDER NEURON */}
          <line x1={cx + 130} y1={62} x2={cx + 196} y2={42}
            stroke={T.mute} strokeWidth="0.55" />
          <text x={cx + 200} y={40} fill={T.mute}
            style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>sender neuron</text>

          {/* SIGNAL PACKETS */}
          <line x1={cx - 80} y1={56} x2={cx - 196} y2={42}
            stroke={T.mute} strokeWidth="0.55" />
          <text x={cx - 200} y={40} textAnchor="end" fill={T.mute}
            style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>signal packets</text>

          {/* GAP / SYNAPSE: centered above the band, no overlap with anatomy */}
          <line x1={cx + 130} y1={preY + gap / 2} x2={cx + 196} y2={preY + gap / 2}
            stroke={T.mute} strokeWidth="0.55" />
          <text x={cx + 200} y={preY + gap / 2 - 3} fill={C}
            style={f.mono(700, 10, { upper: true, tracking: 0.22 })}>synapse gap</text>
          <text x={cx + 200} y={preY + gap / 2 + 10} fill={T.mute}
            style={f.mono(500, 9)}>{gap} px wide</text>

          {/* RECEIVERS */}
          <line x1={cx - 100} y1={postY + 8} x2={cx - 196} y2={postY + 22}
            stroke={T.mute} strokeWidth="0.55" />
          <text x={cx - 200} y={postY + 24} textAnchor="end" fill={T.mute}
            style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>receivers</text>

          {/* RECEIVER NEURON  (bottom-right) */}
          <text x={cx + 200} y={H - 26} fill={T.mute}
            style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>receiver neuron</text>
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={gap} set={(v) => { setGap(v); reset(); }} min={10} max={80}
          color={A} label="Synapse gap" suffix={gap + " px"} />
        <Btn small icon={Play} color={A} onClick={fire}>fire signal</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Verdict", v: transmits ? "signal reaches the next neuron" : "signal scatters in the gap",
          color: transmits ? okC : failC },
        { l: "Steps", v: "fire, release packets, cross the gap, bind to receivers" },
        { l: "Threshold", v: "narrow gap survives, wide gap fails" },
      ]} />

      <Caption color={C}>
        Neurons pass a signal one link at a time. At a synapse the wire is interrupted by
        a tiny gap. The sender shoots packets of messenger molecules across, and receivers
        on the next neuron catch them. If the gap is narrow, the catch works and the signal
        keeps moving. If the gap is too wide, the messengers scatter and the signal dies.
      </Caption>
    </div>
  );
}

/* ---------- PYB-03 Mechanical advantage ---------- */
function ExtraPulley() {
  // Block-and-tackle visualization: a ceiling beam, N supporting rope
  // segments between fixed pulleys on the beam and movable pulleys on the
  // load. Effort = load / N. Hand pulls the free end on the right side.
  const [n, setN] = useState(2);
  const load = 100;
  const effort = (load / n).toFixed(0);
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;
  // Geometry
  const W = 460, H = 280;
  const beamY = 36;
  const blockTopY = 184;
  const blockBotY = 224;
  // Fixed-side and movable-side anchors are alternated across X.
  // Spacing tuned so n up to 6 fits cleanly inside the load block.
  const blockW = 80 + (n - 1) * 28;          // load block grows a bit with n
  const blockLeft = (W - blockW) / 2;
  const blockRight = blockLeft + blockW;
  const segSpacing = blockW / (n + 1);
  const segXs = Array.from({ length: n }, (_, k) => blockLeft + segSpacing * (k + 1));
  // Free end of the rope exits to the right of the rightmost fixed pulley
  const freeEndX = Math.min(W - 30, segXs[n - 1] + 30);

  return (
    <div>
      <Field height={290}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* hatched ceiling */}
          <rect x={20} y={beamY - 18} width={W - 40} height={18}
            fill={T.paper3} stroke={C} strokeWidth="1.2" />
          {Array.from({ length: 16 }, (_, k) => (
            <line key={k} x1={28 + k * 26} y1={beamY - 18} x2={20 + k * 26} y2={beamY - 4}
              stroke={C} strokeWidth="0.6" opacity="0.7" />
          ))}
          {/* beam line */}
          <line x1={20} y1={beamY} x2={W - 20} y2={beamY} stroke={C} strokeWidth="1.4" />

          {/* === ROPES === */}
          {/* anchor at the left of the beam */}
          <line x1={blockLeft + 2} y1={beamY} x2={blockLeft + 2} y2={beamY - 18}
            stroke={C} strokeWidth="1.4" />
          {/* alternating segments: anchor -> down to first movable pulley ->
              up to first fixed pulley -> down to next movable ... -> up to last
              fixed -> out to the hand (free end) */}
          {segXs.map((x, k) => (
            <g key={"seg" + k}>
              {/* down segment from previous fixed (or anchor) to this movable */}
              <line x1={k === 0 ? blockLeft + 2 : segXs[k - 1]} y1={k === 0 ? beamY : beamY + 10}
                x2={x} y2={blockTopY - 4} stroke={A} strokeWidth="1.8" />
              {/* up segment from movable to its fixed pulley */}
              <line x1={x} y1={blockTopY - 4} x2={x} y2={beamY + 10}
                stroke={A} strokeWidth="1.8" />
            </g>
          ))}
          {/* free end: from the last fixed pulley up over a redirector pulley on the right,
              then straight down to the hand. Routed via a small "guide" pulley so the corner reads cleanly. */}
          <line x1={segXs[n - 1]} y1={beamY + 10} x2={freeEndX} y2={beamY + 10}
            stroke={A} strokeWidth="1.8" />
          <line x1={freeEndX} y1={beamY + 10} x2={freeEndX} y2={H - 50}
            stroke={A} strokeWidth="1.8" />
          {/* guide / redirector pulley */}
          <line x1={freeEndX} y1={beamY} x2={freeEndX} y2={beamY + 4} stroke={C} strokeWidth="1" />
          <circle cx={freeEndX} cy={beamY + 10} r={7} fill={T.paper} stroke={C} strokeWidth="1.2" />
          <circle cx={freeEndX} cy={beamY + 10} r={1.6} fill={C} />

          {/* === Fixed pulleys on the beam === */}
          {segXs.map((x, k) => (
            <g key={"fix" + k}>
              <line x1={x} y1={beamY} x2={x} y2={beamY + 4} stroke={C} strokeWidth="1" />
              <circle cx={x} cy={beamY + 10} r={7} fill={T.paper} stroke={C} strokeWidth="1.2" />
              <circle cx={x} cy={beamY + 10} r={1.6} fill={C} />
            </g>
          ))}

          {/* === Load block + movable pulleys === */}
          <rect x={blockLeft} y={blockTopY} width={blockW} height={blockBotY - blockTopY}
            fill={C} stroke={T.ink} strokeWidth="1.2" />
          <text x={blockLeft + blockW / 2} y={blockTopY + 26} textAnchor="middle"
            fill={T.paper} style={f.mono(700, 14)}>{load} N</text>
          <text x={blockLeft + blockW / 2} y={blockBotY - 6} textAnchor="middle"
            fill={T.paper2} style={f.mono(500, 8.5, { upper: true, tracking: 0.16 })}>load</text>
          {/* movable pulleys sit on top of the load block */}
          {segXs.map((x, k) => (
            <g key={"mov" + k}>
              <circle cx={x} cy={blockTopY - 4} r={6} fill={T.paper} stroke={C} strokeWidth="1.2" />
              <circle cx={x} cy={blockTopY - 4} r={1.5} fill={C} />
            </g>
          ))}

          {/* === Hand / effort indicator === */}
          <g transform={`translate(${freeEndX} ${H - 50})`}>
            <rect x={-9} y={0} width={18} height={20} rx={3}
              fill={A} stroke={T.ink} strokeWidth="1" />
            {/* downward effort arrow */}
            <line x1={0} y1={22} x2={0} y2={42} stroke={A} strokeWidth="2.2" />
            <polyline points={`-5,38 0,44 5,38`} fill="none" stroke={A} strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x={freeEndX + 14} y={H - 22} fill={A}
            style={f.mono(700, 14)}>{effort} N</text>
          <text x={freeEndX + 14} y={H - 8} fill={T.mute}
            style={f.mono(500, 9, { upper: true, tracking: 0.18 })}>pull (effort)</text>

          {/* === Side readouts === */}
          <text x={28} y={beamY + 34} fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>fixed pulleys</text>
          <text x={28} y={beamY + 46} fill={C}
            style={f.mono(700, 11)}>{n}</text>
          <text x={28} y={blockTopY - 6} fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>movable pulleys</text>
          <text x={28} y={blockTopY + 6} fill={C}
            style={f.mono(700, 11)}>{n}</text>
          <text x={28} y={blockTopY + 36} fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>rope segments</text>
          <text x={28} y={blockTopY + 48} fill={C}
            style={f.mono(700, 11)}>{n}</text>
        </svg>
      </Field>
      <div style={{ padding: "0 4px" }}>
        <Slider val={n} set={setN} min={1} max={5} color={A}
          label="Supporting rope segments" suffix={n} />
      </div>
      <Readout items={[
        { l: "Effort", v: effort + " N", color: A },
        { l: "Advantage", v: n + "x easier" },
        { l: "Tradeoff", v: "pull " + n + "x more rope" },
      ]} />

      <Caption color={C}>
        A single fixed pulley only changes the direction of your pull. Add movable
        pulleys and each extra rope segment supporting the load cuts the effort
        you need. The price is rope length: you pull farther to lift the same
        distance. More segments mean less force, more rope.
      </Caption>
    </div>
  );
}

/* ---------- PYB-03 Force and direction ---------- */
function ExtraVector() {
  // Pulling a box with a rope at an angle. F = 100 N along the rope.
  // Letter labels (F, Fx, Fy, theta) sit next to the arrows; a fixed
  // numbers panel on the right reports magnitudes so nothing collides
  // at extreme angles.
  const [angle, setAngle] = useState(35);
  const F = 100;
  const theta = (angle * Math.PI) / 180;
  const Fx = F * Math.cos(theta);
  const Fy = F * Math.sin(theta);
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;

  // ----- Geometry (fixed) -----
  const W = 500, H = 280;
  const groundY = 220;
  const boxW = 64, boxH = 30;
  const boxX = 70, boxY = groundY - boxH;
  const ax = boxX + boxW;          // anchor: top-right corner of box
  const ay = boxY;
  const SCALE = 1.4;               // 100 N -> 140 px, fits at any angle
  const tipX = ax + Fx * SCALE;
  const tipY = ay - Fy * SCALE;

  // Number-panel position (top-right of the figure, fixed)
  const PX = 360, PY = 28;

  // Arrow helper
  const arrow = (x1, y1, x2, y2, color, w = 2.2, key = "") => {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return <g key={key} />;
    const ang = Math.atan2(dy, dx);
    const ah = Math.min(9, Math.max(4, len * 0.35));
    const p1x = x2 - ah * Math.cos(ang - 0.45);
    const p1y = y2 - ah * Math.sin(ang - 0.45);
    const p2x = x2 - ah * Math.cos(ang + 0.45);
    const p2y = y2 - ah * Math.sin(ang + 0.45);
    return (
      <g key={key}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} />
        <polygon points={`${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`} fill={color} />
      </g>
    );
  };

  // Letter-label positions:
  // F: perpendicular to the rope at its midpoint, offset by 14 px on the upper side
  const perpAng = theta + Math.PI / 2;
  const Fmx = (ax + tipX) / 2 + Math.cos(perpAng) * 14;
  const Fmy = (ay + tipY) / 2 - Math.sin(perpAng) * 14;

  // Fx letter: always BELOW the horizontal arrow on the ground line
  const FxLabelX = ax + Math.max(28, Fx * SCALE * 0.5);
  const FxLabelY = ay + 18;

  // Fy letter: always to the RIGHT of the vertical line
  const FyLabelX = ax + Fx * SCALE + 12;
  const FyLabelY = ay - Math.max(20, Fy * SCALE * 0.5);

  // Arc shrinks to stay inside the rope-Fx triangle; at steep angles (>= 76 deg) the
  // triangle base is tiny, so theta becomes a label with an arrow pointing to the small arc.
  const baseLen = Fx * SCALE;
  const arcR = Math.max(7, Math.min(22, baseLen * 0.6));
  const useArrow = angle >= 76;
  const arcTX = ax + arcR * Math.cos(theta / 2);
  const arcTY = ay - arcR * Math.sin(theta / 2);
  const thetaLabelX = useArrow ? boxX + 8 : ax + 30;
  const thetaLabelY = useArrow ? boxY - 24 : ay - 9;

  return (
    <div>
      <Field height={290}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* === GROUND === */}
          <line x1={20} y1={groundY} x2={W - 20} y2={groundY} stroke={C} strokeWidth="1.4" />
          {Array.from({ length: 24 }, (_, k) => (
            <line key={"g" + k} x1={20 + k * 20} y1={groundY} x2={12 + k * 20} y2={groundY + 12}
              stroke={C} strokeWidth="0.55" opacity="0.7" />
          ))}

          {/* === BOX === */}
          <rect x={boxX} y={boxY} width={boxW} height={boxH}
            fill={T.paper3} stroke={C} strokeWidth="1.5" />
          <text x={boxX + boxW / 2} y={boxY + boxH / 2 + 4} textAnchor="middle" fill={C}
            style={f.mono(600, 9.5, { upper: true, tracking: 0.18 })}>box</text>

          {/* === Horizontal dashed reference at anchor height === */}
          <line x1={ax} y1={ay} x2={ax + 180} y2={ay}
            stroke={T.mute} strokeWidth="0.55" strokeDasharray="3 3" opacity="0.6" />

          {/* === COMPONENT ARROWS === */}
          {arrow(ax, ay, ax + Fx * SCALE, ay, A, 2, "fx")}
          {arrow(ax + Fx * SCALE, ay, ax + Fx * SCALE, tipY, C, 2, "fy")}

          {/* === ROPE ARROW (drawn after components so it sits on top) === */}
          {arrow(ax, ay, tipX, tipY, T.ink, 2.6, "f")}

          {/* === Angle arc === */}
          <path d={`M ${ax + arcR} ${ay} A ${arcR} ${arcR} 0 0 0 ${ax + arcR * Math.cos(theta)} ${ay - arcR * Math.sin(theta)}`}
            fill="none" stroke={T.mute} strokeWidth="1" />

          {/* === HAND at the rope tip === */}
          <g transform={`translate(${tipX} ${tipY}) rotate(${angle - 90})`}>
            <rect x={-6} y={-4} width={12} height={18} rx={3}
              fill={A} stroke={T.ink} strokeWidth="0.9" />
          </g>

          {/* === LETTER LABELS (always inside the figure, never overlap) === */}
          {/* F label, on the rope side */}
          <text x={Fmx} y={Fmy + 4} textAnchor="middle" fill={T.ink}
            style={f.mono(700, 12)}>F</text>
          {/* Fx label below horizontal arrow */}
          <text x={FxLabelX} y={FxLabelY} textAnchor="middle" fill={A}
            style={f.mono(700, 12)}>Fx</text>
          {/* Fy label right of vertical arrow */}
          <text x={FyLabelX} y={FyLabelY + 4} fill={C}
            style={f.mono(700, 12)}>Fy</text>
          {/* theta label; at steep angles an arrow points in to the small arc */}
          {useArrow && (() => {
            const sx = thetaLabelX + 10, sy = thetaLabelY + 1;
            const ex = arcTX, ey = arcTY;
            const aang = Math.atan2(ey - sy, ex - sx), ah = 5;
            return (
              <g stroke={T.mute} fill={T.mute} strokeWidth="0.9">
                <line x1={sx} y1={sy} x2={ex} y2={ey} />
                <polygon stroke="none" points={`${ex},${ey} ${ex - ah * Math.cos(aang - 0.5)},${ey - ah * Math.sin(aang - 0.5)} ${ex - ah * Math.cos(aang + 0.5)},${ey - ah * Math.sin(aang + 0.5)}`} />
              </g>
            );
          })()}
          <text x={thetaLabelX} y={thetaLabelY + 4} textAnchor="middle" fill={T.mute}
            style={f.mono(700, 11)}>θ</text>

          {/* === FIXED NUMBERS PANEL (top-right) === */}
          <g transform={`translate(${PX} ${PY})`}>
            <rect x={0} y={0} width={120} height={130} rx={6}
              fill={T.paper2} stroke={C} strokeWidth="1" opacity="0.95" />
            <text x={10} y={18} fill={T.mute}
              style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>readings</text>

            <text x={10} y={36} fill={T.ink} style={f.mono(700, 11)}>F</text>
            <text x={110} y={36} textAnchor="end" fill={T.ink}
              style={f.mono(700, 12)}>{F} N</text>

            <text x={10} y={56} fill={A} style={f.mono(700, 11)}>Fx</text>
            <text x={110} y={56} textAnchor="end" fill={A}
              style={f.mono(700, 12)}>{Fx.toFixed(0)} N</text>
            <text x={10} y={67} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.16 })}>forward</text>

            <text x={10} y={86} fill={C} style={f.mono(700, 11)}>Fy</text>
            <text x={110} y={86} textAnchor="end" fill={C}
              style={f.mono(700, 12)}>{Fy.toFixed(0)} N</text>
            <text x={10} y={97} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.16 })}>up</text>

            <line x1={10} y1={106} x2={110} y2={106} stroke={C} strokeWidth="0.5" opacity="0.3" />
            <text x={10} y={122} fill={T.ink} style={f.mono(700, 11)}>θ</text>
            <text x={110} y={122} textAnchor="end" fill={T.ink} style={f.mono(700, 12)}>{angle}°</text>
          </g>

          {/* angle value is shown in the readings box (top-right) to avoid the crowded anchor */}
        </svg>
      </Field>
      <div style={{ padding: "0 4px" }}>
        <Slider val={angle} set={setAngle} min={5} max={85} color={A}
          label="Rope angle" suffix={angle + "°"} />
      </div>
      <Readout items={[
        { l: "Forward pull (Fx)", v: Fx.toFixed(0) + " N", color: A },
        { l: "Upward pull (Fy)", v: Fy.toFixed(0) + " N", color: C },
        { l: "Along rope (F)", v: F + " N" },
      ]} />

      <Caption color={C}>
        Pulling a box with a rope at an angle splits the force in two. Part of the
        pull drags the box forward, part lifts it upward. A flatter rope sends more
        force forward but less lift. A steeper rope lifts more but pulls less forward.
        The total stays the same; only the share changes.
      </Caption>
    </div>
  );
}

/* ---------- PYB-04 Check digits catch errors ---------- */
function ExtraChecksum() {
  // PYB-04 "Check digits catch errors". Sibling ExtraDetect ("Detect without false
  // alarms") is about a detector's hit/false-alarm tradeoff. This demo owns the
  // check-digit rule: a barcode carries one extra digit computed from the data by a
  // fixed rule (sum of the data mod 10). Corrupt any data digit and the recomputed
  // rule no longer matches the stored check digit, so the scanner rejects the code.
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;
  const data = useMemo(() => [4, 2, 7, 1, 9, 3, 5], []);
  const stored = data.reduce((s, v) => s + v, 0) % 10;
  const [corrupt, setCorrupt] = useState(0);
  const shown = data.map((v, i) => (corrupt === i + 1) ? (v + 3) % 10 : v);
  const dataSum = shown.reduce((s, v) => s + v, 0);
  const recompute = dataSum % 10;
  const ok = recompute === stored;
  const digits = [...shown, stored];
  const N = digits.length, cw = 40, gap = 4, x0 = 56, cellX = (i) => x0 + i * (cw + gap), cellY = 92, cellH = 38;
  const bits = (v, j) => (v >> j) & 1;

  return (
    <div>
      <Field height={210}>
        <svg viewBox="0 0 460 200" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="20" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Check digits catch errors</text>
          <text x="20" y="34" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.14 })}>a barcode rejects a mistyped digit</text>

          <rect x="350" y="9" width="98" height="22" rx="4" fill={T.paper} stroke={ok ? T.ok : T.warn} strokeWidth="1.4" />
          <text x="399" y="24" textAnchor="middle" fill={ok ? T.ok : T.warn} style={f.mono(700, 12, { upper: true, tracking: 0.1 })}>{ok ? "accepted" : "rejected"}</text>

          {digits.map((v, i) => { const x = cellX(i), isCheck = i === N - 1, isErr = corrupt === i + 1 && !isCheck; const bf = isErr ? T.warn : isCheck ? A : T.ink; return (
            <g key={i}>
              {Array.from({ length: 4 }, (_, j) => <rect key={j} x={x + 6 + j * 8} y="40" width={1.6 + bits(v, j) * 2.6} height="36" fill={bf} />)}
              <rect x={x} y={cellY} width={cw} height={cellH} rx="2" fill={isErr ? T.warn : T.paper2} stroke={isCheck ? A : T.rule22} strokeWidth={isCheck ? 1.6 : 0.8} />
              <text x={x + cw / 2} y={cellY + 25} textAnchor="middle" fill={isErr ? T.paper : C} style={f.mono(700, 15)}>{v}</text>
            </g>
          ); })}
          <text x={x0} y={cellY - 6} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>data digits</text>
          <text x={cellX(N - 1) + cw / 2} y={cellY - 6} textAnchor="middle" fill={A} style={f.mono(700, 7.5, { upper: true, tracking: 0.08 })}>check</text>

          <text x="20" y="156" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.06 })}>rule: (sum of data digits) mod 10 must equal the check digit</text>
          <text x="20" y="176" fill={C} style={f.mono(700, 9)}>sum {dataSum} mod 10 = {recompute}</text>
          <text x="240" y="176" fill={C} style={f.mono(700, 9)}>stored check = {stored}</text>
          <text x="392" y="176" fill={ok ? T.ok : T.warn} style={f.mono(700, 9, { upper: true, tracking: 0.06 })}>{ok ? "match" : "no match"}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={corrupt} set={setCorrupt} min={0} max={7} step={1} color={A} label="Corrupt a data digit" suffix={corrupt === 0 ? "none" : "digit " + corrupt} />
        <Btn small icon={RotateCcw} onClick={() => setCorrupt(0)}>reset</Btn>
      </div>

      <Readout items={[
        { l: "Verdict", v: ok ? "accepted" : "rejected", color: ok ? T.ok : T.warn },
        { l: "Check digit", v: stored, color: A },
        { l: "Recomputed", v: recompute },
        { l: "Single error", v: "always caught" },
      ]} />

      <Caption color={C}>
        A barcode carries one extra check digit, computed from the data digits by a fixed rule: here,
        their sum modulo 10. The scanner recomputes the rule and compares it to the printed check
        digit. Mistype or smudge any single digit and the recomputed value no longer matches, so the
        code is rejected on the spot. Real product codes use this trick to catch errors automatically.
      </Caption>
    </div>
  );
}

/* ---------- PYB-04 Detect without false alarms ---------- */
function ExtraDetect() {
  // Barcode-scanner detection demo. Each scan lands in one of four quadrants
  // of a confusion matrix. Correct outcomes are green; mistakes are red/copper.
  // Up to 40 chips per cell, tiled 10 wide x 4 tall.
  const [trials, setTrials] = useState([]);
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;
  const okC = T.ok;
  const failC = T.warn;

  const MAX_PER_CELL = 40;

  const add = (real, alarm) =>
    setTrials((arr) => [...arr, { real, alarm, id: Date.now() + Math.random() }]);
  const reset = () => setTrials([]);

  const tp = trials.filter((t) => t.real && t.alarm).length;
  const fp = trials.filter((t) => !t.real && t.alarm).length;
  const fn = trials.filter((t) => t.real && !t.alarm).length;
  const tn = trials.filter((t) => !t.real && !t.alarm).length;
  const total = trials.length;
  const hit = tp + fn ? Math.round((tp / (tp + fn)) * 100) : null;
  const falseAlarm = fp + tn ? Math.round((fp / (fp + tn)) * 100) : null;

  const last = trials[trials.length - 1];

  // ----- Geometry -----
  const W = 560, H = 320;
  const stripY = 18, stripH = 56;
  const matX = 100, matY = 116;
  const cellW = 180, cellH = 86;

  const cells = {
    TP: { row: 0, col: 0, color: okC,   label: "caught",      desc: "rejected a bad code",  count: tp },
    FP: { row: 0, col: 1, color: A,     label: "false alarm", desc: "rejected a good code", count: fp },
    FN: { row: 1, col: 0, color: failC, label: "miss",        desc: "passed a bad code",    count: fn },
    TN: { row: 1, col: 1, color: okC,   label: "passed",      desc: "passed a good code",   count: tn },
  };

  const cellOf = (t) => {
    if (t.real && t.alarm) return "TP";
    if (!t.real && t.alarm) return "FP";
    if (t.real && !t.alarm) return "FN";
    return "TN";
  };

  // Compact chip: 12 wide, 6 tall, with a 2.5 px outcome dot at the corner
  const Chip = ({ x, y, ok }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={12} height={6} rx={1}
        fill={T.paper} stroke={T.ink} strokeWidth="0.5" />
      {[2, 4, 6, 8, 10].map((sx, k) => (
        <line key={k} x1={sx} y1={1} x2={sx} y2={5} stroke={T.ink}
          strokeWidth={k % 2 === 0 ? 0.5 : 0.35} />
      ))}
      <circle cx={12} cy={1} r={2} fill={ok ? okC : failC} stroke={T.ink} strokeWidth="0.35" />
    </g>
  );

  // Chip layout: 10 columns x 4 rows = 40
  const COLS = 10;
  const CHIP_W = 16;     // 12 + dot overhang
  const CHIP_DX = 16;    // column step
  const CHIP_DY = 11;    // row step
  const chipsForCell = (k) => {
    const cell = cells[k];
    const slots = trials
      .map((t, idx) => ({ t, idx }))
      .filter(({ t }) => cellOf(t) === k);
    const shown = slots.slice(-MAX_PER_CELL);
    return shown.map(({ t }, slot) => {
      const col = slot % COLS;
      const row = Math.floor(slot / COLS);
      return {
        id: t.id,
        x: matX + cell.col * cellW + 8 + col * CHIP_DX,
        y: matY + cell.row * cellH + 30 + row * CHIP_DY,
        ok: cell.color === okC,
      };
    });
  };

  return (
    <div>
      <Field height={330}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* ================ SCANNER STRIP ================ */}
          <rect x={20} y={stripY} width={W - 40} height={stripH}
            rx={8} fill={T.paper2} stroke={C} strokeWidth="1.1" />
          <text x={32} y={stripY + 16} fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>scanner</text>
          <g transform={`translate(58 ${stripY + 30})`}>
            <rect x={0} y={-10} width={26} height={20} rx={3}
              fill={C} stroke={T.ink} strokeWidth="1" />
            <polygon points="26,-7 50,-14 50,14 26,7" fill={A} opacity="0.45" />
            <line x1={50} y1={-14} x2={50} y2={14} stroke={A} strokeWidth="1.2" />
          </g>
          {last ? (
            <g transform={`translate(150 ${stripY + 18})`}>
              <rect x={0} y={0} width={70} height={24} rx={2}
                fill={T.paper} stroke={T.ink} strokeWidth="0.7" />
              {[6, 10, 14, 20, 26, 32, 38, 46, 52, 58, 64].map((sx, k) => (
                <line key={k} x1={sx} y1={2} x2={sx} y2={22}
                  stroke={T.ink} strokeWidth={k % 3 === 0 ? 1.4 : 0.6} />
              ))}
              <text x={84} y={16} fill={last.real ? failC : okC}
                style={f.mono(700, 11, { upper: true, tracking: 0.16 })}>
                {last.real ? "bad" : "good"}
              </text>
              <text x={120} y={16} fill={T.mute} style={f.mono(700, 14)}>→</text>
              <text x={138} y={16} fill={last.alarm ? failC : okC}
                style={f.mono(700, 11, { upper: true, tracking: 0.16 })}>
                {last.alarm ? "reject" : "pass"}
              </text>
              <circle cx={210} cy={12} r={8}
                fill={cells[cellOf(last)].color === okC ? okC : (cells[cellOf(last)].color === A ? A : failC)}
                stroke={T.ink} strokeWidth="0.8" />
              <text x={232} y={16} fill={T.ink}
                style={f.mono(700, 11, { upper: true, tracking: 0.18 })}>
                {cellOf(last)} · {cells[cellOf(last)].label}
              </text>
            </g>
          ) : (
            <text x={150} y={stripY + 32} fill={T.mute}
              style={f.mono(500, 10, { upper: true, tracking: 0.16 })}>
              click a button below to scan a code
            </text>
          )}
          <text x={W - 28} y={stripY + 22} textAnchor="end" fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>scanned</text>
          <text x={W - 28} y={stripY + 44} textAnchor="end" fill={C}
            style={f.mono(700, 18)}>{total}</text>

          {/* ================ MATRIX HEADERS ================ */}
          <text x={matX + cellW} y={matY - 32} textAnchor="middle" fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>truth</text>
          <text x={matX + cellW / 2} y={matY - 16} textAnchor="middle" fill={failC}
            style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>bad code</text>
          <text x={matX + cellW * 1.5} y={matY - 16} textAnchor="middle" fill={okC}
            style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>good code</text>

          <text x={matX - 60} y={matY + cellH} fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>scanner</text>
          <text x={matX - 8} y={matY + cellH / 2 + 4} textAnchor="end" fill={failC}
            style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>reject</text>
          <text x={matX - 8} y={matY + cellH * 1.5 + 4} textAnchor="end" fill={okC}
            style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>pass</text>

          {/* ================ MATRIX CELLS ================ */}
          {Object.entries(cells).map(([k, cell]) => {
            const x = matX + cell.col * cellW;
            const y = matY + cell.row * cellH;
            const isGood = cell.color === okC;
            const bg = isGood ? "#e1ecd6" : (cell.color === A ? "#f1d8b8" : "#f0cdc3");
            const tone = cell.color;
            const overflow = cell.count - MAX_PER_CELL;
            return (
              <g key={k}>
                <rect x={x} y={y} width={cellW} height={cellH}
                  fill={bg} stroke={tone} strokeWidth="1.2" />
                <text x={x + 9} y={y + 16} fill={tone}
                  style={f.mono(700, 10, { upper: true, tracking: 0.22 })}>{k}</text>
                <text x={x + cellW - 12} y={y + 22} textAnchor="end" fill={tone}
                  style={f.mono(700, 20)}>{cell.count}</text>
                <text x={x + 9} y={y + cellH - 7} fill={T.mute}
                  style={f.mono(500, 8.5, { upper: true, tracking: 0.16 })}>{cell.desc}</text>
                {chipsForCell(k).map((c) => (
                  <Chip key={c.id} x={c.x} y={c.y} ok={isGood} />
                ))}
                {overflow > 0 && (
                  <text x={x + cellW - 9} y={y + cellH - 9} textAnchor="end" fill={tone}
                    style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>
                    +{overflow} more
                  </text>
                )}
              </g>
            );
          })}

          {/* ================ RATES PANEL (inside viewBox, below matrix headers row) ================ */}
          {(() => {
            const px = matX + cellW * 2 + 10;
            const py = matY;
            const pw = W - px - 10;
            const ph = cellH * 2;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" />
                <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>rates</text>

                <text x={px + 8} y={py + 40} fill={okC}
                  style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>hit</text>
                <text x={px + pw - 8} y={py + 40} textAnchor="end" fill={okC}
                  style={f.mono(700, 13)}>{hit == null ? "-" : hit + "%"}</text>
                <text x={px + 8} y={py + 52} fill={T.mute}
                  style={f.mono(500, 7, { upper: true, tracking: 0.14 })}>caught bad</text>

                <text x={px + 8} y={py + 84} fill={A}
                  style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>false</text>
                <text x={px + pw - 8} y={py + 84} textAnchor="end" fill={A}
                  style={f.mono(700, 13)}>{falseAlarm == null ? "-" : falseAlarm + "%"}</text>
                <text x={px + 8} y={py + 96} fill={T.mute}
                  style={f.mono(500, 7, { upper: true, tracking: 0.14 })}>wrong alarm</text>

                <text x={px + 8} y={py + 130} fill={T.ink}
                  style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>goal</text>
                <text x={px + 8} y={py + 144} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>high hit</text>
                <text x={px + 8} y={py + 156} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>low false</text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Btn small color={okC} onClick={() => add(true, true)}>bad → caught</Btn>
        <Btn small color={failC} onClick={() => add(true, false)}>bad → missed</Btn>
        <Btn small color={A} onClick={() => add(false, true)}>good → false alarm</Btn>
        <Btn small color={okC} onClick={() => add(false, false)}>good → passed</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Hit rate", v: hit == null ? "-" : hit + "%", color: okC },
        { l: "False alarm rate", v: falseAlarm == null ? "-" : falseAlarm + "%", color: A },
        { l: "Best", v: "high hit, low false" },
      ]} />

      <Caption color={C}>
        A scanner has to catch the bad codes without crying wolf on the good ones.
        Every scan lands in one of four boxes: caught a real bad code, missed a real
        bad code, raised a false alarm on a good code, or correctly passed a good
        code. The goal is a high hit rate with a low false-alarm rate.
      </Caption>
    </div>
  );
}

/* ====================================================================== */
/*                EXTRAS map: science-title -> illustration                 */
/* ====================================================================== */
const EXTRAS = {
  "Completing the circuit": ExtraCircuit,
  "Microclimate varies in meters": ExtraMicroclimate,
  "Evidence-based siting": ExtraSiting,
  "One variable at a time": ExtraOneVar,
  "Material and geometry": ExtraXylem,
  "Controlled environments": ExtraGreenhouse,
  "Evidence from the tour": ExtraTour,
  "Hygromorphs": ExtraPinecone,
  "Bilayer biomimicry": ExtraBilayer,
  "Networks, not single plants": ExtraPollinatorNet,
  "Native and clumping logic": ExtraClump,
  "Observation as evidence": ExtraObservation,
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
  "Sound transmission": ExtraSoundMedia,
  "Heart rate and recovery": ExtraHRRecovery,
  "From signal to muscle": ExtraReactionTime,
  "Median and improvement": ExtraMedian,
  "Echo timing is ranging": ExtraSonarRange,
  "The aperture tradeoff": ExtraAperture,
  "Center of mass": ExtraCenterMass,
  "Mapping forces": ExtraForceMap,
  "Glide versus control": ExtraGlide,
  "Spectra as fingerprints": ExtraSpectraFingerprint,
  "Routing and search": ExtraSearch,
  "Criteria and constraints": ExtraDecision,
  "Roots anchor soil": ExtraRootsAnchor,
  "Slope and runoff": ExtraRunoff,
  "Angles give height": ExtraTriangulate,
  "Accuracy from method": ExtraAccuracy,
  "Urban heat and shade": ExtraHeatGrid,
  "Data-backed routing": ExtraCoolRoute,
  "Photosynthesis makes oxygen": ExtraPhotoO2,
  "Controlled variables": ExtraControls,
  "Pressure vs force": ExtraPressure,
  "Spreading stress": ExtraStress,
  "Signals travel in a chain": ExtraDomino,
  "Gaps and insulation": ExtraGap,
  "Mechanical advantage": ExtraPulley,
  "Force and direction": ExtraVector,
  "Check digits catch errors": ExtraChecksum,
  "Detect without false alarms": ExtraDetect,
};

/* ====================================================================== */
/*                       PRESENTATION ENGINE                              */
/* ====================================================================== */

function splitPts(line) {
  const i = line.lastIndexOf(":");
  return i < 0 ? [line, ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
}

/* Small line glyph block that gives every slide a "field-notebook" frame:
   thin ruled index in the left margin + corner brackets at hairline corners. */
function SlideFrame({ children, page, total, accent, phase, code, title, campKey }) {
  const Icon = PHASE_ICON[phase] || Sparkles;
  return (
    <div style={{
      position: "relative",
      width: "100%", maxWidth: 820, margin: "0 auto",
      padding: "26px 30px 28px 70px",
    }}>
      {/* left ruled index column */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 50,
        borderRight: `1px solid ${T.rule12}`,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 28, gap: 18,
      }}>
        <span style={{ ...f.mono(500, 9.5, { upper: true, tracking: 0.18 }), color: T.mute,
          writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          {campKey === "trees" ? "Trees · Tech" : "PY · STEM"}
        </span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
          <IconChip icon={Icon} color={accent} size={28} stroke={1.9} />
          <span className="ticker" style={{ ...f.mono(600, 11), color: accent }}>{String(page + 1).padStart(2, "0")}</span>
          <span className="ticker" style={{ ...f.mono(400, 10), color: T.mute }}>/{String(total).padStart(2, "0")}</span>
        </div>
      </div>
      {/* top hairline with code + phase */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        borderBottom: `1px solid ${T.rule12}`,
        paddingBottom: 8, marginBottom: 20,
      }}>
        <span className="smallcaps" style={{ ...f.mono(600, 10), color: accent }}>{code}</span>
        <span className="smallcaps" style={{ ...f.mono(600, 10), color: T.mute }}>{phase}</span>
      </div>
      <div className="fu" key={page}>{children}</div>
    </div>
  );
}

function Presentation({ act, accent, ink, campKey, onBack, onJump }) {
  const C = accent;
  const [page, setPage] = useState(0);
  const tTotal = act.buildMin * 60;
  const [tSec, setTSec] = useState(tTotal);
  const [tRun, setTRun] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!tRun || tSec <= 0) return;
    const id = setInterval(() => setTSec((p) => (p <= 1 ? (setTRun(false), 0) : p - 1)), 1000);
    return () => clearInterval(id);
  }, [tRun, tSec]);

  const tFmt = `${Math.floor(tSec / 60)}:${String(tSec % 60).padStart(2, "0")}`;

  const slides = [{ type: "title" }];
  act.science.forEach((s, i) => slides.push({ type: "science", data: s, idx: i }));
  slides.push({ type: "materials" }, { type: "steps" });
  if (act.buildMin > 0) slides.push({ type: "timer" });
  slides.push({ type: "compete" }, { type: "debrief" });
  const total = slides.length;
  const sl = slides[page];
  const slideLabel = (s) => s.type === "title" ? "Title" : s.type === "science" ? s.data.t : s.type === "materials" ? "Kit list" : s.type === "steps" ? "Build or solve" : s.type === "timer" ? "Work block" : s.type === "compete" ? "Competition" : "Defend";

  useEffect(() => {
    const h = (e) => {
      if (navOpen) { if (e.key === "Escape") setNavOpen(false); return; }
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setPage((p) => Math.min(p + 1, total - 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPage((p) => Math.max(p - 1, 0));
      }
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [total, onBack, navOpen]);

  const Demo = sl.type === "science" ? (sl.data.demo ? DEMOS[sl.data.demo] : EXTRAS[sl.data.t]) : null;
  const DIcon = sl.type === "science" ? (sl.data.demo ? DEMO_ICON[sl.data.demo] : Microscope) : null;
  const phaseLabel = {
    title: "brief", science: "concept",
    materials: "kit", steps: "build",
    timer: "timer", compete: "score",
    debrief: "defend",
  }[sl.type];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      background: T.paper, color: T.ink, position: "relative" }}>
      <Corners />
      {/* top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 30px", borderBottom: `1px solid ${T.rule12}`,
        position: "sticky", top: 0, background: T.paper, zIndex: 4,
      }}>
        <button onClick={onBack} className="focusable"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "none", background: "transparent", cursor: "pointer",
            padding: 0,
            ...f.sans(600, 11, { upper: true, tracking: 0.18 }),
            color: T.ink2,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C)}
          onMouseLeave={(e) => (e.currentTarget.style.color = T.ink2)}>
          <ArrowLeft size={13} strokeWidth={2.4} />
          {act.campName}  ·  index
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {(tRun || tSec < tTotal) && act.buildMin > 0 && (
            <button className="focusable"
              onClick={() => setPage(slides.findIndex((s) => s.type === "timer"))}
              style={{ display: "inline-flex", alignItems: "center", gap: 6,
                border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: tRun ? T.warn : "#b48b3e",
                animation: tRun ? "blink 1s infinite" : "none" }} />
              <span className="ticker" style={{ ...f.mono(600, 12), color: tRun ? T.warn : T.ink2 }}>{tFmt}</span>
            </button>
          )}
          <span className="ticker" style={{ ...f.mono(500, 11), color: T.mute }}>
            {String(page + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* progress hairline */}
      <div style={{ height: 2, background: T.rule12, position: "relative" }}>
        <div style={{ height: 2, background: C, width: `${((page + 1) / total) * 100}%`,
          transition: "width .45s cubic-bezier(.22,1,.36,1)" }} />
      </div>

      {/* content */}
      <main style={{ flex: 1, padding: "30px 0 24px" }}>
        <SlideFrame page={page} total={total} accent={C} phase={phaseLabel}
          code={act.code} title={act.t} campKey={campKey}>

          {sl.type === "title" && (
            <div>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
                {(() => {
                  const Ico = CAT_ICON[act.cat] || Sparkles;
                  return <IconChip icon={Ico} color={C} size={36} stroke={1.8} />;
                })()}
                <span className="smallcaps" style={{ ...f.mono(600, 11), color: C }}>{act.catLabel}</span>
                <span style={{ flex: 1, height: 1, background: T.rule12 }} />
              </div>
              <h1 style={{ ...f.display(500, 64, { italic: true, opsz: 144, lh: 1.0 }), color: T.ink, marginBottom: 12, maxWidth: 720 }}>
                {act.t}
              </h1>
              <p style={{ ...f.sans(400, 20, { lh: 1.45 }), color: T.ink2, maxWidth: 620, marginBottom: 28 }}>{act.sub}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, maxWidth: 720 }}>
                <div style={{ padding: "20px 22px 18px", border: `1px solid ${T.ink}`,
                  background: `${C}10`, position: "relative" }}>
                  <span style={{
                    position: "absolute", top: -9, left: 14, padding: "0 10px",
                    background: T.paper, ...f.sans(700, 10.5, { upper: true, tracking: 0.24 }), color: C,
                  }}>Mission</span>
                  <p style={{ ...f.sans(500, 17, { lh: 1.55 }), color: T.ink, marginTop: 4 }}>{act.mission}</p>
                </div>
                <div style={{ display: "flex", gap: 18, color: T.mute,
                  ...f.mono(500, 10.5, { upper: true, tracking: 0.18 }) }}>
                  <span>Build {act.buildMin} min</span>
                  <span>·</span>
                  <span>{act.science.length} concept{act.science.length === 1 ? "" : "s"}</span>
                  <span>·</span>
                  <span>{act.steps.length} build steps</span>
                </div>
              </div>
            </div>
          )}

          {sl.type === "science" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                {DIcon && <IconChip icon={DIcon} color={C} size={28} stroke={1.7} />}
                <span className="smallcaps" style={{ ...f.mono(500, 10), color: T.mute }}>
                  Concept {sl.idx + 1} / {act.science.length}
                </span>
              </div>
              <h2 style={{ ...f.display(500, 44, { italic: true, opsz: 72, lh: 1.06 }), color: T.ink, marginBottom: 14, maxWidth: 720 }}>
                {sl.data.t}
              </h2>
              <p style={{ ...f.sans(400, 17, { lh: 1.65 }), color: T.ink2, marginBottom: 22, maxWidth: 680 }}>{sl.data.b}</p>
              {Demo && <div style={{ marginTop: 6 }}><Demo /></div>}
            </div>
          )}

          {sl.type === "materials" && (
            <div>
              <h2 style={{ ...f.display(500, 42, { italic: true, opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 18 }}>Kit list</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {act.materials.map((m, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.rule12}` }}>
                      <td style={{ ...f.mono(500, 11), color: T.mute, padding: "10px 0", width: 38 }}>
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td style={{ ...f.sans(500, 16, { lh: 1.4 }), color: T.ink, padding: "10px 0" }}>{m.n}</td>
                      <td style={{ ...f.mono(500, 13), color: T.ink2, textAlign: "right", padding: "10px 0" }}>{m.q}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {sl.type === "steps" && (
            <div>
              <h2 style={{ ...f.display(500, 42, { italic: true, opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 22 }}>Build or solve it</h2>
              <ol style={{ display: "flex", flexDirection: "column", gap: 20, listStyle: "none" }}>
                {act.steps.map((st, i) => (
                  <li key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 16, alignItems: "flex-start" }}>
                    <div style={{
                      ...f.display(600, 28, { italic: true, opsz: 60 }),
                      color: C, lineHeight: 1, paddingTop: 2, textAlign: "right",
                      borderRight: `1px solid ${T.rule12}`, paddingRight: 8,
                    }}>{i + 1}</div>
                    <div>
                      <div style={{ ...f.sans(700, 15.5, { lh: 1.3 }), color: T.ink, marginBottom: 4 }}>{st.t}</div>
                      <div style={{ ...f.sans(400, 14.5, { lh: 1.6 }), color: T.ink2 }}>{st.b}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {sl.type === "timer" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <h2 style={{ ...f.display(500, 42, { italic: true, opsz: 72, lh: 1.05 }), color: T.ink }}>Work block</h2>
              <p style={{ ...f.mono(600, 13, { upper: true, tracking: 0.2 }), color: T.mute, marginTop: 2 }}>
                {act.buildMin} minutes
              </p>
              <div style={{ position: "relative", width: 260, height: 260, marginTop: 10 }}>
                <svg width="260" height="260" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="130" cy="130" r="118" fill="none" stroke={T.rule12} strokeWidth="1.5" />
                  <circle cx="130" cy="130" r="118" fill="none"
                    stroke={tSec <= 60 && tSec > 0 && tTotal > 60 ? T.warn : C}
                    strokeWidth="3.5"
                    strokeDasharray={`${(tSec / tTotal) * 2 * Math.PI * 118} ${2 * Math.PI * 118}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray .4s" }} />
                </svg>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column", gap: 8,
                }}>
                  <span className="ticker" style={{
                    ...f.mono(500, 46),
                    color: tSec <= 60 && tSec > 0 && tTotal > 60 ? T.warn : T.ink,
                    lineHeight: 1,
                  }}>{tFmt}</span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "3px 10px",
                    borderRadius: 999,
                    border: `1px solid ${tRun ? T.warn : (tSec < tTotal ? "#b48b3e" : C)}`,
                    color: tRun ? T.warn : (tSec < tTotal ? "#b48b3e" : C),
                    ...f.mono(700, 10, { upper: true, tracking: 0.22 }),
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: 3,
                      background: tRun ? T.warn : (tSec < tTotal ? "#b48b3e" : C),
                      animation: tRun ? "blink 1s infinite" : "none",
                    }} />
                    {tRun ? "running" : tSec < tTotal ? "paused" : "ready"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Btn color={tRun ? T.warn : C} icon={tRun ? Pause : Play}
                  onClick={() => setTRun((r) => !r)}>
                  {tRun ? "pause" : tSec < tTotal ? "resume" : "start"}
                </Btn>
                <Btn icon={RotateCcw} onClick={() => { setTSec(tTotal); setTRun(false); }}>reset</Btn>
              </div>
            </div>
          )}

          {sl.type === "compete" && (
            <div>
              <h2 style={{ ...f.display(500, 42, { italic: true, opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 4 }}>Competition</h2>
              <p style={{ ...f.sans(400, 14, { lh: 1.5 }), color: T.mute, marginBottom: 18 }}>{act.scoring}</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {act.compete.map((r, i) => {
                    const [crit, pts] = splitPts(r);
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.rule12}` }}>
                        <td style={{ ...f.sans(500, 15.5, { lh: 1.4 }), color: T.ink, padding: "11px 0" }}>{crit}</td>
                        <td className="ticker" style={{ ...f.mono(600, 14), color: C, textAlign: "right", padding: "11px 0" }}>{pts}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td style={{ ...f.sans(700, 14, { upper: true, tracking: 0.16 }), color: C, padding: "14px 0 0 0" }}>Total</td>
                    <td className="ticker" style={{ ...f.mono(700, 16), color: C, textAlign: "right", padding: "14px 0 0 0" }}>100 pts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {sl.type === "debrief" && (
            <div>
              <h2 style={{ ...f.display(500, 42, { italic: true, opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 4 }}>Defend your design</h2>
              <p style={{ ...f.sans(400, 14, { lh: 1.5 }), color: T.mute, marginBottom: 20 }}>Answer with evidence, not opinion.</p>
              <ol style={{ display: "flex", flexDirection: "column", gap: 16, listStyle: "none" }}>
                {act.debrief.map((q, i) => (
                  <li key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ ...f.display(600, 22, { italic: true, opsz: 36 }), color: C,
                      textAlign: "right", paddingRight: 8, borderRight: `1px solid ${T.rule12}` }}>{i + 1}</div>
                    <span style={{ ...f.sans(500, 15.5, { lh: 1.55 }), color: T.ink }}>{q}</span>
                  </li>
                ))}
              </ol>
              <div style={{ marginTop: 28, paddingTop: 14, borderTop: `1px solid ${T.rule12}`,
                ...f.mono(500, 10.5, { upper: true, tracking: 0.18 }), color: T.mute }}>
                Source · {act.source}
              </div>
            </div>
          )}
        </SlideFrame>
      </main>

      {/* nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 30px", borderTop: `1px solid ${T.rule12}`,
        background: T.paper,
      }}>
        <button onClick={() => page > 0 && setPage((p) => p - 1)}
          disabled={page === 0} className="focusable"
          style={{ display: "inline-flex", alignItems: "center", gap: 7,
            border: "none", background: "transparent",
            cursor: page === 0 ? "default" : "pointer", padding: 0,
            ...f.sans(600, 11, { upper: true, tracking: 0.18 }),
            color: page === 0 ? T.rule12 : T.ink }}>
          <ArrowLeft size={13} strokeWidth={2.2} /> back
        </button>
        <div style={{ display: "flex", gap: 4 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setPage(i)} className="focusable"
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === page ? 22 : 8, height: 4, borderRadius: 0,
                border: "none", padding: 0,
                background: i === page ? C : T.rule12,
                cursor: "pointer", transition: "width .3s, background .25s",
              }} />
          ))}
        </div>
        <button onClick={() => page < total - 1 && setPage((p) => p + 1)}
          disabled={page === total - 1} className="focusable"
          style={{ display: "inline-flex", alignItems: "center", gap: 7,
            border: "none", background: "transparent",
            cursor: page === total - 1 ? "default" : "pointer", padding: 0,
            ...f.sans(600, 11, { upper: true, tracking: 0.18 }),
            color: page === total - 1 ? T.rule12 : T.ink }}>
          next <ArrowRight size={13} strokeWidth={2.2} />
        </button>
      </nav>

      {/* ===== index side tab: jump to any slide or station without going home ===== */}
      <button onClick={() => setNavOpen(true)} aria-label="Open index" className="focusable"
        style={{ position: "fixed", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 6,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          background: C, color: T.paper, border: "none", borderRadius: "0 8px 8px 0",
          padding: "16px 7px", cursor: "pointer", boxShadow: "1px 0 8px rgba(0,0,0,.18)" }}>
        <ListChecks size={15} strokeWidth={2.2} />
        <span style={{ ...f.mono(700, 9.5, { upper: true, tracking: 0.16 }), writingMode: "vertical-rl" }}>Index</span>
      </button>
      {navOpen && (
        <>
          <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(28,24,20,.34)", zIndex: 8 }} />
          <aside style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 310, background: T.paper, borderRight: `1px solid ${T.ink}`, zIndex: 9, overflowY: "auto", padding: "20px 18px 28px", boxShadow: "3px 0 22px rgba(0,0,0,.16)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, borderBottom: `1px solid ${T.rule12}`, paddingBottom: 10 }}>
              <span style={{ ...f.mono(700, 11, { upper: true, tracking: 0.2 }), color: T.ink }}>Index</span>
              <button onClick={() => setNavOpen(false)} aria-label="Close index" className="focusable" style={{ border: "none", background: "transparent", cursor: "pointer", color: T.mute, display: "inline-flex", padding: 2 }}><X size={16} strokeWidth={2.2} /></button>
            </div>
            <div style={{ ...f.mono(600, 9, { upper: true, tracking: 0.16 }), color: T.mute, marginBottom: 8 }}>{act.code} {"\u00b7"} this station</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 20 }}>
              {slides.map((s, i) => (
                <button key={i} onClick={() => { setPage(i); setNavOpen(false); }} className="focusable"
                  style={{ display: "flex", gap: 8, alignItems: "baseline", textAlign: "left", border: "none", cursor: "pointer",
                    background: i === page ? `${C}14` : "transparent", borderLeft: `2px solid ${i === page ? C : "transparent"}`,
                    padding: "6px 8px", color: i === page ? C : T.ink, ...f.sans(i === page ? 600 : 400, 12.5, { lh: 1.3 }) }}>
                  <span style={{ ...f.mono(600, 9), color: T.mute, minWidth: 16 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{slideLabel(s)}</span>
                </button>
              ))}
            </div>
            {[["From Trees to Tech", TREES_DECK], ["PY-STEM", PY_DECK], ["Backups", [...TREESB_DECK, ...PYB_DECK]]].map(([label, list]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ ...f.mono(600, 9, { upper: true, tracking: 0.16 }), color: T.mute, marginBottom: 6 }}>{label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {list.map((a) => {
                    const cur = a.code === act.code;
                    const acc = (CAMP[a.camp] || CAMP.trees).acc;
                    return (
                      <button key={a.code} onClick={() => { setNavOpen(false); onJump(a); }} className="focusable"
                        style={{ display: "flex", gap: 8, alignItems: "baseline", textAlign: "left", border: "none", cursor: "pointer",
                          background: cur ? `${acc}1c` : "transparent", padding: "5px 8px", color: cur ? acc : T.ink,
                          ...f.sans(cur ? 600 : 400, 12, { lh: 1.25 }) }}>
                        <span style={{ ...f.mono(600, 8.5), color: acc, minWidth: 34 }}>{a.code}</span>
                        <span>{a.t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>
        </>
      )}
    </div>
  );
}

/* ====================================================================== */
/*                                  HOME                                  */
/* ====================================================================== */

/* A richer home emblem beside the title. Trees: a shaded, layered tree whose canopy
   grows circuit traces (nature as engineer). PY: an oscilloscope reading a waveform,
   with a gear and a lens for systems and optics. */
function HomeMotif({ campKey, color, accent }) {
  if (campKey === "trees") {
    return (
      <svg viewBox="0 0 220 220" width="220" height="220" aria-hidden style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="tmVig" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.10" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="tmCan" cx="38%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="44%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </radialGradient>
          <linearGradient id="tmTrunk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="55%" stopColor={color} stopOpacity="0.92" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <circle cx="108" cy="96" r="94" fill="url(#tmVig)" />
        <ellipse cx="108" cy="196" rx="60" ry="7" fill={color} opacity="0.15" />
        <line x1="36" y1="196" x2="182" y2="196" stroke={color} strokeWidth="1.4" opacity="0.5" />
        <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5">
          <path d="M104 196 C 96 201 86 203 74 205" />
          <path d="M113 196 C 121 201 132 203 145 204" />
        </g>
        <path d="M103 196 C 104 170 104 150 106 134 L 112 134 C 114 152 114 174 115 196 Z"
          fill="url(#tmTrunk)" stroke={color} strokeWidth="0.8" />
        <path d="M108 192 C 107 172 107 152 109 136" fill="none" stroke={color} strokeWidth="0.7" opacity="0.4" />
        <g>
          <ellipse cx="86" cy="98" rx="34" ry="29" fill="url(#tmCan)" opacity="0.9" />
          <ellipse cx="130" cy="94" rx="35" ry="31" fill="url(#tmCan)" opacity="0.92" />
          <ellipse cx="108" cy="74" rx="36" ry="31" fill="url(#tmCan)" opacity="0.96" />
          <ellipse cx="106" cy="108" rx="42" ry="28" fill="url(#tmCan)" opacity="0.86" />
        </g>
        <g fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.22" strokeLinecap="round">
          <path d="M94 92 q11 -6 22 -2" />
          <path d="M102 106 q12 -4 24 0" />
        </g>
        <g fill="none" stroke={accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M150 80 H174 V58" />
          <path d="M156 100 H184 V118" />
          <path d="M146 66 H166 V48" />
        </g>
        <g>
          <rect x="159" y="40" width="14" height="9" rx="1.5" fill={accent} stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="174" cy="56" r="4" fill={accent} stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="184" cy="120" r="4" fill={accent} stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="150" cy="80" r="2.4" fill={accent} />
          <circle cx="156" cy="100" r="2.4" fill={accent} />
          <circle cx="146" cy="66" r="2.4" fill={accent} />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 220 220" width="220" height="220" aria-hidden style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="pmVig" cx="50%" cy="44%" r="62%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.10" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pmScr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.96" />
          <stop offset="100%" stopColor={color} stopOpacity="0.72" />
        </linearGradient>
        <radialGradient id="pmGear" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="48%" stopColor={color} stopOpacity="0.92" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="104" r="94" fill="url(#pmVig)" />
      <rect x="40" y="56" width="140" height="92" rx="11" fill="url(#pmScr)" stroke={color} strokeWidth="1.6" />
      <rect x="44" y="60" width="132" height="84" rx="8" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.16" />
      <g stroke="#ffffff" strokeWidth="0.5" opacity="0.15">
        <line x1="75" y1="60" x2="75" y2="144" />
        <line x1="110" y1="60" x2="110" y2="144" />
        <line x1="145" y1="60" x2="145" y2="144" />
        <line x1="44" y1="82" x2="176" y2="82" />
        <line x1="44" y1="102" x2="176" y2="102" />
        <line x1="44" y1="122" x2="176" y2="122" />
      </g>
      <path d="M46 102 C 64 64 78 64 95 102 S 128 140 146 102 S 172 70 176 94"
        fill="none" stroke={accent} strokeWidth="5.5" opacity="0.22" strokeLinecap="round" />
      <path d="M46 102 C 64 64 78 64 95 102 S 128 140 146 102 S 172 70 176 94"
        fill="none" stroke={accent} strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="95" cy="102" r="3" fill="#ffffff" />
      <circle cx="146" cy="102" r="3" fill="#ffffff" />
      <g transform="translate(50 150)">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <rect key={i} x="-3" y="-21" width="6" height="9" rx="1.4" fill={color}
            transform={`rotate(${i * 40})`} />
        ))}
        <circle r="15" fill="url(#pmGear)" stroke={color} strokeWidth="1" />
        <circle r="5.5" fill={T.paper} stroke={color} strokeWidth="1.3" />
      </g>
      <g>
        <circle cx="180" cy="54" r="15" fill={color} stroke="#ffffff" strokeWidth="0.7" />
        <circle cx="180" cy="54" r="15" fill="none" stroke={accent} strokeWidth="1.5" />
        <circle cx="180" cy="54" r="9.5" fill="none" stroke={accent} strokeWidth="1.1" opacity="0.85" />
        <circle cx="180" cy="54" r="4" fill={accent} />
        <circle cx="175" cy="49" r="2" fill="#ffffff" opacity="0.75" />
      </g>
    </svg>
  );
}

function StationCard({ a, campKey, accent, onSelect }) {
  const CatIco = CAT_ICON[a.cat] || Sparkles;
  const catColor = (CATMAP[a.cat] && CATMAP[a.cat].l) ? accent : T.ink;
  const num = a.code.split("-")[1];
  return (
    <button onClick={() => onSelect(a)} className="focusable"
      style={{
        position: "relative",
        textAlign: "left",
        padding: "18px 18px 16px",
        border: `1px solid ${T.ink}`,
        background: T.paper,
        cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 10,
        minHeight: 168,
        transition: "transform .18s ease, background .18s, border-color .18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = T.paper2;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = T.paper;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = T.ink;
      }}>
      {/* folded corner */}
      <span aria-hidden style={{
        position: "absolute", top: 0, right: 0, width: 14, height: 14,
        background: `linear-gradient(225deg, ${T.paper3} 0 50%, ${T.ink} 50% 53%, transparent 53%)`,
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="ticker" style={{ ...f.mono(600, 11), color: accent, letterSpacing: 0.06 }}>{a.code}</span>
        <IconChip icon={CatIco} color={accent} size={24} stroke={1.8} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ ...f.display(500, 22, { italic: true, opsz: 36, lh: 1.12 }), color: T.ink }}>
          {a.t}
        </h3>
      </div>
      <div className="accentRule" style={{ color: accent, height: 1, background: accent, opacity: 0.7, width: 36 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="smallcaps" style={{ ...f.mono(500, 10), color: T.mute }}>
          {(CATMAP[a.cat] && CATMAP[a.cat].l) || a.cat}
        </span>
        <span className="ticker" style={{ ...f.mono(500, 10), color: T.mute }}>№ {num}</span>
      </div>
    </button>
  );
}

function BackupCard({ a, campKey, accent, onSelect }) {
  const num = a.code.split("-")[1];
  return (
    <button onClick={() => onSelect(a)} className="focusable"
      style={{
        textAlign: "left",
        padding: "12px 14px",
        border: `1px dashed ${T.rule22}`,
        background: "transparent",
        cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 6,
        transition: "background .15s, border-color .15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.paper2; e.currentTarget.style.borderColor = accent; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.rule22; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="ticker" style={{ ...f.mono(500, 10.5), color: accent }}>{a.code}</span>
        <span className="ticker" style={{ ...f.mono(400, 9.5), color: T.mute }}>backup {num}</span>
      </div>
      <div style={{ ...f.display(500, 17, { italic: true, opsz: 28, lh: 1.18 }), color: T.ink2 }}>{a.t}</div>
    </button>
  );
}

function Home({ onSelect, camp, setCamp }) {
  const [filter, setFilter] = useState("all");
  const list = camp === "trees" ? TREES_DECK : PY_DECK;
  const backups = camp === "trees" ? TREESB_DECK : PYB_DECK;
  const theme = CAMP[camp];
  const cats = ["all", ...[...new Set(list.map((a) => a.cat))]];
  const shown = filter === "all" ? list : list.filter((a) => a.cat === filter);

  // small "year" stamp in the masthead
  const year = 2026;

  return (
    <div style={{ minHeight: "100vh", background: T.paper, color: T.ink, position: "relative" }}>
      <Corners />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 32px 70px",
        borderLeft: `1px solid ${T.rule12}`, borderRight: `1px solid ${T.rule12}`, position: "relative" }}>

        {/* masthead */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 28,
          borderBottom: `1px solid ${T.ink}`, paddingBottom: 18,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="smallcaps" style={{ ...f.mono(600, 11), color: T.mute }}>
              Middle School STEM · Edition {year}
            </span>
            <h1 style={{ ...f.display(500, 64, { italic: true, opsz: 144, lh: 0.92, tracking: -0.02 }), color: T.ink }}>
              Field Notebook
            </h1>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <Tag color={T.ink}>vol I · {list.length + backups.length} stations</Tag>
            <span className="ticker" style={{ ...f.mono(500, 10), color: T.mute }}>
              ← → space  ·  esc to index
            </span>
          </div>
        </div>

        {/* camp switcher: two pages of a notebook */}
        <div role="tablist" aria-label="Choose camp"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginBottom: 36, border: `1px solid ${T.ink}` }}>
          {(["trees", "pystem"]).map((k) => {
            const active = camp === k;
            const t = CAMP[k];
            return (
              <button key={k} role="tab" aria-selected={active} className="focusable nofocus"
                onClick={() => { setCamp(k); setFilter("all"); }}
                style={{
                  border: "none",
                  padding: "20px 22px",
                  background: active ? t.ink : "transparent",
                  color: active ? T.paper : T.ink,
                  textAlign: "left", cursor: "pointer",
                  borderRight: k === "trees" ? `1px solid ${T.ink}` : "none",
                  transition: "background .2s, color .2s",
                }}>
                <div style={{ ...f.mono(600, 10.5, { upper: true, tracking: 0.18 }),
                  color: active ? t.acc : T.mute, marginBottom: 4 }}>
                  {k === "trees" ? "Camp I" : "Camp II"}
                </div>
                <div style={{ ...f.display(500, 30, { italic: true, opsz: 60, lh: 1 }) }}>{t.label}</div>
                <div style={{ ...f.sans(400, 13.5, { lh: 1.5 }), color: active ? T.paper3 : T.mute, marginTop: 6, maxWidth: 360 }}>
                  {t.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* hero strip: small camp marker + motif on the right (no duplicate title) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 28, alignItems: "center", marginBottom: 28, paddingTop: 4 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="smallcaps" style={{ ...f.mono(600, 11), color: theme.acc }}>
              {camp === "trees" ? "Section A: Field, Forest, Future" : "Section B: Signal, System, Science"}
            </span>
            <span style={{ ...f.sans(400, 13.5, { lh: 1.5 }), color: T.mute, maxWidth: 580 }}>
              {list.length} core stations · {backups.length} reserves
            </span>
          </div>
          <div style={{ transform: "scale(.78)", transformOrigin: "right center" }}>
            <HomeMotif campKey={camp} color={theme.ink} accent={theme.acc} />
          </div>
        </div>

        {/* category filter */}
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22, alignItems: "center",
          padding: "10px 14px", border: `1px solid ${T.rule12}`, background: T.paper2,
        }}>
          <span className="smallcaps" style={{ ...f.mono(700, 11, { tracking: 0.18 }), color: T.ink2, marginRight: 4 }}>filter</span>
          {cats.map((k) => {
            const lbl = k === "all" ? "All" : (CATMAP[k] ? CATMAP[k].l : k);
            return (
              <Btn key={k} small color={k === "all" ? theme.ink : (CATMAP[k] ? theme.ink : T.ink)}
                active={filter === k} onClick={() => setFilter(k)}>
                {lbl}
              </Btn>
            );
          })}
        </div>

        {/* grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
          {shown.map((a, i) => (
            <div key={a.code} className="fu" style={{ animationDelay: `${i * 24}ms` }}>
              <StationCard a={a} campKey={camp} accent={theme.acc} onSelect={onSelect} />
            </div>
          ))}
        </div>

        {/* backups */}
        <div style={{ marginTop: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <span className="smallcaps" style={{ ...f.mono(600, 11), color: T.mute }}>
              Reserve stations · backups
            </span>
            <span style={{ flex: 1, height: 1, background: T.rule12 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
            {backups.map((a) => (
              <BackupCard key={a.code} a={a} campKey={camp} accent={theme.acc} onSelect={onSelect} />
            ))}
          </div>
        </div>

        {/* footer rule */}
        <div style={{
          marginTop: 56, paddingTop: 18, borderTop: `1px solid ${T.rule12}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span className="smallcaps" style={{ ...f.mono(500, 10), color: T.mute }}>
            Tap a station to open · arrow keys move slides · esc returns
          </span>
          <span className="ticker" style={{ ...f.mono(500, 10), color: T.mute }}>
            {camp === "trees" ? "TTT · TTB" : "PYS · PYB"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*                                  APP                                   */
/* ====================================================================== */

export default function App() {
  const [sel, setSel] = useState(null);
  const [camp, setCamp] = useState("trees");

  const enrich = (a) => ({
    ...a,
    campName: a.camp === "trees" ? "From Trees to Tech" : "PY-STEM",
    catLabel: CATMAP[a.cat] ? CATMAP[a.cat].l : a.cat,
  });
  const themeFor = (a) => CAMP[a.camp] || CAMP.trees;
  const onJump = (a) => { setCamp(a.camp || "trees"); setSel(a); };

  return (
    <div className="stemdeck" style={{ minHeight: "100vh", background: T.paper, color: T.ink }}>
      {sel ? (
        <Presentation
          key={sel.code}
          act={enrich(sel)}
          accent={themeFor(sel).acc}
          ink={themeFor(sel).ink}
          campKey={sel.camp}
          onBack={() => { setCamp(sel.camp); setSel(null); }}
          onJump={onJump}
        />
      ) : (
        <Home onSelect={setSel} camp={camp} setCamp={setCamp} />
      )}
    </div>
  );
}

export {
  DEMOS, EXTRAS,
  CATMAP, TREES_DECK, PY_DECK, TREESB_DECK, PYB_DECK,
  Presentation, Home,
  ExtraCircuit, ExtraMicroclimate, ExtraSiting, ExtraOneVar, ExtraXylem,
  ExtraGreenhouse, ExtraTour, ExtraPinecone, ExtraBilayer, ExtraPollinatorNet,
  ExtraClump, ExtraObservation, ExtraFoodWeb, ExtraResilience, ExtraCascade,
  ExtraCER, ExtraRoughCoat, ExtraStomata, ExtraSampling,
  ExtraPathPlan, ExtraStrengthWeight, ExtraReliability, ExtraSoundMedia,
  ExtraHRRecovery, ExtraReactionTime, ExtraMedian, ExtraSonarRange,
  ExtraAperture, ExtraCenterMass, ExtraForceMap, ExtraGlide,
  ExtraSpectraFingerprint, ExtraSearch, ExtraDecision,
  ExtraRootsAnchor, ExtraRunoff, ExtraTriangulate, ExtraAccuracy,
  ExtraHeatGrid, ExtraCoolRoute, ExtraPhotoO2, ExtraControls,
  ExtraPressure, ExtraStress, ExtraDomino, ExtraGap,
  ExtraPulley, ExtraVector, ExtraChecksum, ExtraDetect,
  DemoMudwatt, DemoCapillary, DemoOobleck, DemoSamara, DemoTreering, DemoLotus,
  DemoMagnet, DemoCam, DemoWave, DemoPinhole, DemoHover, DemoSpectra,
  DemoBookbot, DemoRamp
};
export const __AUDIT__ = true;
