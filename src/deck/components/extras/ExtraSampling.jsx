// ExtraSampling component for the STEM Camp interactive deck.
import { useMemo, useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

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

export { ExtraSampling };
