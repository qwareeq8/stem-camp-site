// ExtraMedian component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

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

export { ExtraMedian };
