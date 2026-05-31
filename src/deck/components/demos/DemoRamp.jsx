// DemoRamp component for the STEM Camp interactive deck.
import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

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

export { DemoRamp };
