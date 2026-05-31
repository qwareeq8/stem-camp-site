// ExtraMicroclimate component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

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

export { ExtraMicroclimate };
