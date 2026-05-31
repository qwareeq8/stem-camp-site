// ExtraAccuracy component for the STEM Camp interactive deck.
import { useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

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

export { ExtraAccuracy };
