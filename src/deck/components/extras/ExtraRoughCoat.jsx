// ExtraRoughCoat component for the STEM Camp interactive deck.
import { useState } from "react";
import { Droplet, Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

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

export { ExtraRoughCoat };
