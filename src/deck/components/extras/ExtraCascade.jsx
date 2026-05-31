// ExtraCascade component for the STEM Camp interactive deck.
import { useState } from "react";
import { Boxes, Network, Pause, Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

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

export { ExtraCascade };
