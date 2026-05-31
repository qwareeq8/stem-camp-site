// ExtraControls component for the STEM Camp interactive deck.
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout } from "../../ui/primitives.jsx";

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

export { ExtraControls };
