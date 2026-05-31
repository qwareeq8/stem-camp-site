// ExtraGreenhouse component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

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

export { ExtraGreenhouse };
