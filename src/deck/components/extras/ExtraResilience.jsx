// ExtraResilience component for the STEM Camp interactive deck.
import { useState } from "react";
import { CloudRain, Droplet, Network, Sprout, Sun, Thermometer, TreeDeciduous } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

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

export { ExtraResilience };
