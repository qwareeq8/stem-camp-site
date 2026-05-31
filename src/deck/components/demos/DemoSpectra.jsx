// DemoSpectra component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function DemoSpectra() {
  // PYS-10 "Diffraction splits light" (concept 1). The sibling ExtraSpectraFingerprint
  // is the fingerprint VIEWER for matching. This demo shows the MECHANISM: a grating
  // passes a zero-order white spot straight through and fans a first-order spectrum,
  // bending each color by a different amount (red most, violet least). A hot filament
  // gives a continuous rainbow; an excited gas gives only its own bright lines. More
  // lines per millimeter spreads the spectrum wider.
  const ink = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const SRC = [
    { k: "Inc", name: "incandescent", cont: true, glow: "#fff0c8" },
    { k: "H", name: "hydrogen", cont: false, glow: "#d98cff", lines: [{ p: 0.10, c: "#6a3bff" }, { p: 0.22, c: "#3ea3ff" }, { p: 0.62, c: "#ff3030" }] },
    { k: "Ne", name: "neon", cont: false, glow: "#ff7a4d", lines: [{ p: 0.50, c: "#ffdd33" }, { p: 0.62, c: "#ff8a30" }, { p: 0.70, c: "#ff5530" }, { p: 0.82, c: "#ff3030" }, { p: 0.88, c: "#d62020" }] },
    { k: "Hg", name: "mercury", cont: false, glow: "#bfe6ff", lines: [{ p: 0.05, c: "#7a3bff" }, { p: 0.16, c: "#3aaaff" }, { p: 0.42, c: "#3ed98f" }, { p: 0.68, c: "#ffa030" }] },
  ];
  const RAINBOW = [[0, "#7a3bff"], [0.16, "#4060ff"], [0.32, "#27b6d6"], [0.48, "#3ed98f"], [0.64, "#ffe23a"], [0.80, "#ff8a30"], [1, "#ff3030"]];

  const [srcIdx, setSrcIdx] = useState(0);
  const [density, setDensity] = useState(3);    // grating lines/mm proxy 1..6
  const src = SRC[srcIdx], cont = src.cont;

  const Gx = 212, Gy = 146, screenX = 430;
  const spread = 34 + density * 9;              // more lines/mm -> wider fan
  const sy = (p) => Gy - (0.12 + 0.88 * p) * spread;

  return (
    <div>
      <Field height={280}>
        <svg viewBox="0 0 460 280" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
              {[...RAINBOW].reverse().map(([p, c], i) => (<stop key={i} offset={(1 - p).toFixed(2)} stopColor={c} />))}
            </linearGradient>
          </defs>
          <text x="20" y="16" fill={ink} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Diffraction splits light</text>
          <text x="20" y="28" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.06 })}>a grating fans white light into colors; a gas shows only its own bright lines</text>

          {/* dark optics bench */}
          <rect x="18" y="38" width="424" height="182" rx="4" fill="#0d0a08" />
          <text x="434" y="52" textAnchor="end" fill="#8a7f6c" style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>1st-order spectrum</text>

          {/* source lamp */}
          <circle cx="46" cy={Gy} r="15" fill={src.glow} opacity="0.28" />
          <rect x="34" y={Gy - 13} width="26" height="26" rx="4" fill="#1a1812" stroke="#3a342a" strokeWidth="1" />
          <circle cx="47" cy={Gy} r="7" fill={src.glow} style={{ filter: "drop-shadow(0 0 5px " + src.glow + ")" }} />
          <text x="26" y={Gy + 30} textAnchor="start" fill="#b6ab97" style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>{src.name}</text>

          {/* incoming beam to the grating */}
          <line x1="61" y1={Gy} x2="198" y2={Gy} stroke={src.glow} strokeWidth="5" opacity="0.5" strokeLinecap="round" />

          {/* diffraction grating */}
          <rect x="198" y="110" width="14" height="72" rx="1.5" fill="#16222b" stroke="#3990c9" strokeWidth="1" />
          {Array.from({ length: 6 }, (_, i) => (<line key={"gr" + i} x1={200 + i * 2.2} y1="112" x2={200 + i * 2.2} y2="180" stroke="#5fd2e6" strokeWidth="0.6" opacity="0.7" />))}
          <text x="205" y="196" textAnchor="middle" fill="#b6ab97" style={f.mono(600, 8, { upper: true, tracking: 0.1 })}>grating</text>

          {/* zero-order (undiffracted white) */}
          <line x1={Gx} y1={Gy} x2={screenX} y2={Gy} stroke="#fff4e0" strokeWidth="1" strokeDasharray="2 4" opacity="0.55" />
          <circle cx={screenX} cy={Gy} r="3.2" fill="#fff4e0" />
          <text x={screenX} y={Gy + 14} textAnchor="middle" fill="#8a7f6c" style={f.mono(500, 7)}>0 white</text>

          {/* screen wall */}
          <line x1={screenX + 8} y1="56" x2={screenX + 8} y2={Gy + 4} stroke="#2c2a26" strokeWidth="3" />

          {/* first-order spectrum: continuous band or discrete lines */}
          {cont ? (
            <g>
              {RAINBOW.map(([p, c], i) => (<line key={"r" + i} x1={Gx} y1={Gy} x2={screenX} y2={sy(p)} stroke={c} strokeWidth="2" opacity="0.4" />))}
              <rect x={screenX - 4} y={sy(1)} width="14" height={sy(0) - sy(1)} fill="url(#spGrad)" />
            </g>
          ) : (
            <g>
              {src.lines.map((L, i) => (<line key={"r" + i} x1={Gx} y1={Gy} x2={screenX} y2={sy(L.p)} stroke={L.c} strokeWidth="2" opacity="0.85" style={{ filter: "drop-shadow(0 0 3px " + L.c + ")" }} />))}
              {src.lines.map((L, i) => (<rect key={"t" + i} x={screenX - 6} y={sy(L.p) - 1.6} width="16" height="3.2" rx="1" fill={L.c} style={{ filter: "drop-shadow(0 0 3px " + L.c + ")" }} />))}
            </g>
          )}
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        {SRC.map((s, i) => (<Btn key={s.k} small color={A} active={srcIdx === i} onClick={() => setSrcIdx(i)}>{s.name.split(" ")[0]}</Btn>))}
        <Slider val={density} set={setDensity} min={1} max={6} step={1} color={ink} label="Grating density" suffix={density * 150 + "/mm"} />
      </div>

      <Readout items={[
        { l: "Source", v: src.name, color: A },
        { l: "Spectrum", v: cont ? "continuous" : "bright lines", color: ink },
        { l: "Lines", v: cont ? "full rainbow" : src.lines.length },
        { l: "Grating", v: density * 150 + " /mm" },
      ]} />

      <Caption color={ink}>
        A diffraction grating bends each color by a different amount, red most and violet least, so
        white light fans out into a spectrum while the undiffracted beam passes straight through. A
        hot filament emits every visible wavelength and gives a smooth rainbow, but an excited gas
        emits only certain wavelengths, so you see separated bright lines. Pack more lines per
        millimeter onto the grating and the same spectrum spreads wider.
      </Caption>
    </div>
  );
}

export { DemoSpectra };
