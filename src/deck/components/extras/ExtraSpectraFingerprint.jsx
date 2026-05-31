// ExtraSpectraFingerprint component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

function ExtraSpectraFingerprint() {
  // PYS-10 "Spectra as fingerprints" (concept 2). Sibling DemoSpectra ("Diffraction
  // splits light") shows a grating spreading white light into continuous vs line
  // spectra. This demo owns the fingerprint idea: each element emits a unique line
  // pattern, so you identify a mystery source by matching its spectrum to a known
  // reference, the same science behind firework colors from metal salts.
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;
  const els = [
    { k: "Na", name: "sodium", lines: [0.6, 0.63], col: "#f0c64a", fw: "yellow", fwc: "#f0c64a" },
    { k: "Sr", name: "strontium", lines: [0.72, 0.82, 0.9], col: "#d8442e", fw: "red", fwc: "#d8442e" },
    { k: "Cu", name: "copper", lines: [0.28, 0.4, 0.5], col: "#33a6b8", fw: "blue-green", fwc: "#33a6b8" },
    { k: "Ba", name: "barium", lines: [0.42, 0.5, 0.58], col: "#5aa83a", fw: "green", fwc: "#5aa83a" },
  ];
  const [pick, setPick] = useState(0);
  const cur = els[pick];
  const mbX0 = 40, mbX1 = 420, mbY = 60, mbH = 26;
  const spec = (x0, x1, y, h, lines, col) => (
    <g>
      <rect x={x0} y={y} width={x1 - x0} height={h} fill="#0d0a08" />
      {lines.map((p, i) => <rect key={i} x={x0 + p * (x1 - x0) - 1.5} y={y} width="3" height={h} fill={col} />)}
    </g>
  );
  const cardW = 100, cardGap = 8, cardX = (i) => 26 + i * (cardW + cardGap), cardY = 116, cardH = 96;

  return (
    <div>
      <Field height={250}>
        <svg viewBox="0 0 460 240" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="22" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Spectra as fingerprints</text>
          <text x="20" y="36" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.14 })}>match the mystery source to its element</text>

          <text x={mbX0} y={mbY - 4} fill={A} style={f.mono(700, 8, { upper: true, tracking: 0.14 })}>mystery source</text>
          {spec(mbX0, mbX1, mbY, mbH, cur.lines, cur.col)}
          <text x={mbX0} y={mbY + mbH + 12} fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.12 })}>violet</text>
          <text x={mbX1} y={mbY + mbH + 12} textAnchor="end" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.12 })}>red</text>

          <text x="20" y={cardY - 6} fill={T.mute} style={f.mono(700, 8, { upper: true, tracking: 0.16 })}>reference fingerprints</text>
          {els.map((e, i) => { const x = cardX(i), match = i === pick; return (
            <g key={i}>
              <rect x={x} y={cardY} width={cardW} height={cardH} rx="5" fill={T.paper2} stroke={match ? A : T.rule22} strokeWidth={match ? 1.8 : 0.8} />
              <text x={x + 10} y={cardY + 17} fill={C} style={f.mono(700, 12)}>{e.k}</text>
              <text x={x + 30} y={cardY + 17} fill={T.mute} style={f.mono(500, 7.5)}>{e.name}</text>
              {match && <g><circle cx={x + cardW - 12} cy={cardY + 12} r="6.5" fill={A} /><path d={"M " + (x + cardW - 15) + " " + (cardY + 12) + " l 2 3 l 4 -5"} fill="none" stroke={T.paper} strokeWidth="1.4" /></g>}
              {spec(x + 10, x + cardW - 10, cardY + 26, 18, e.lines, e.col)}
              <circle cx={x + 14} cy={cardY + 62} r="6" fill={e.fwc} stroke={T.ink} strokeWidth="0.5" />
              <text x={x + 26} y={cardY + 60} fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.06 })}>firework</text>
              <text x={x + 26} y={cardY + 71} fill={e.fwc} style={f.mono(700, 7.5, { upper: true, tracking: 0.06 })}>{e.fw}</text>
            </g>
          ); })}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {els.map((e, i) => <Btn key={e.k} small color={A} active={pick === i} onClick={() => setPick(i)}>{e.k}</Btn>)}
      </div>

      <Readout items={[
        { l: "Mystery", v: cur.name, color: A },
        { l: "Match", v: cur.k, color: C },
        { l: "Firework", v: cur.fw, color: cur.fwc },
        { l: "Lines", v: cur.lines.length },
      ]} />

      <Caption color={C}>
        Every element emits light at its own set of wavelengths, so its line spectrum is a fingerprint
        no other element shares. Read the bright lines of a mystery source and match the pattern to a
        known reference to identify it, with no chemistry needed. The same emission lines give
        fireworks their colors: sodium burns yellow, strontium red, copper blue-green, barium green.
      </Caption>
    </div>
  );
}

export { ExtraSpectraFingerprint };
