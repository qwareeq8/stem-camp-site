// ExtraBilayer component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraBilayer() {
  // TTT-06 "Bilayer biomimicry" (concept 2). Sibling ExtraPinecone is the
  // natural cone. This is the ENGINEERED bilayer: one layer absorbs water and
  // grows, the other stays put, so the strip curls. Read the curl off a dial to
  // get a humidity signal. Tune the layer mismatch so the needle reads true.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const [humid, setHumid] = useState(70);
  const [mismatch, setMismatch] = useState(1.0);

  const thetaDeg = (humid - 20) * mismatch * 1.05;
  const reading = Math.max(15, Math.min(98, Math.round(20 + (humid - 20) * mismatch)));
  const err = reading - humid;
  const cal = Math.abs(err) <= 4 ? "calibrated" : err < 0 ? "under-reads" : "over-reads";
  const calC = Math.abs(err) <= 4 ? okC : warnC;

  // ---- curling bilayer geometry (circular arc) ----
  const L = 150, tk = 11, ax = 56, ay = 58;
  const th = Math.max(0.0001, thetaDeg * Math.PI / 180);
  const R = L / th, Npt = 22;
  const cl = [], outer = [], inner = [], norm = [];
  for (let k = 0; k <= Npt; k++) {
    const s = (k / Npt) * L, phi = (s / L) * th;
    const x = ax + R * Math.sin(phi), y = ay + R * (1 - Math.cos(phi));
    const nx = Math.sin(phi), ny = -Math.cos(phi);
    cl.push([x, y]); outer.push([x + nx * tk / 2, y + ny * tk / 2]); inner.push([x - nx * tk / 2, y - ny * tk / 2]); norm.push([nx, ny]);
  }
  const j = (a) => a.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ");
  const topPath = "M " + j(outer) + " L " + j(cl.slice().reverse()) + " Z";
  const botPath = "M " + j(cl) + " L " + j(inner.slice().reverse()) + " Z";
  const tip = cl[Npt];
  const nDrop = Math.round(Math.max(0, (humid - 25) / 11));

  // ---- dial ----
  const cx = 338, cy = 150, rD = 64;
  const ang = (r) => Math.PI - ((Math.max(20, Math.min(95, r)) - 20) / 75) * Math.PI;
  const onRim = (r, rad) => [cx + Math.cos(ang(r)) * rad, cy - Math.sin(ang(r)) * rad];
  const needle = onRim(reading, rD * 0.84);
  const trueM = onRim(humid, rD);

  return (
    <div>
      <Field height={226}>
        <svg viewBox="0 0 440 226" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Bilayer biomimicry</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>two layers swell unequally, so the strip curls</text>

          {/* ===== LEFT: curling bilayer ===== */}
          <rect x="16" y="34" width="222" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {/* clamp / mount */}
          <rect x={ax - 12} y={ay - 16} width="12" height="32" rx="2" fill={T.ink} />
          {/* dry reference ghost */}
          <rect x={ax} y={ay - tk / 2} width={L} height={tk} rx="2" fill="none" stroke={T.rule22} strokeWidth="1" strokeDasharray="3 3" />
          {/* bilayer */}
          <path d={botPath} fill={C} />
          <path d={topPath} fill={A} />
          {/* absorbed-water droplets on the active (top) layer */}
          {Array.from({ length: nDrop }, (_, i) => {
            const idx = Math.min(outer.length - 1, 3 + i * 3), p = outer[idx], nrm = norm[idx];
            return <circle key={i} cx={p[0] + nrm[0] * 3} cy={p[1] + nrm[1] * 3} r="1.7" fill="#5a93c9" opacity="0.8" />;
          })}
          {/* tip dot */}
          <circle cx={tip[0]} cy={tip[1]} r="3" fill={A} stroke={T.ink} strokeWidth="0.8" />
          {/* legend */}
          <g>
            <rect x="24" y="196" width="9" height="7" fill={A} /><text x="37" y="203" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>wet layer grows</text>
            <rect x="150" y="196" width="9" height="7" fill={C} /><text x="163" y="203" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>dry layer</text>
          </g>

          {/* ===== RIGHT: hygrometer dial ===== */}
          <rect x="250" y="34" width="174" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="338" y="52" textAnchor="middle" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>humidity dial</text>
          {/* rim */}
          <path d={"M " + (cx - rD) + " " + cy + " A " + rD + " " + rD + " 0 0 1 " + (cx + rD) + " " + cy} fill="none" stroke={T.rule22} strokeWidth="1.4" />
          {/* ticks */}
          {[20, 40, 60, 80, 95].map((r) => {
            const a = onRim(r, rD), b = onRim(r, rD - 7), lb = onRim(r, rD - 17);
            return (
              <g key={r}>
                <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={T.mute} strokeWidth="1" />
                <text x={lb[0]} y={lb[1] + 3} textAnchor="middle" fill={T.mute} style={f.mono(500, 7.5)}>{r}</text>
              </g>
            );
          })}
          {/* true-humidity target marker */}
          <circle cx={trueM[0]} cy={trueM[1]} r="3" fill="none" stroke={C} strokeWidth="1.6" />
          <text x={cx} y="78" textAnchor="middle" fill={C} style={f.mono(500, 7.5, { upper: true })}>{"○"} true {humid}%</text>
          {/* needle */}
          <line x1={cx} y1={cy} x2={needle[0]} y2={needle[1]} stroke={A} strokeWidth="2.4" />
          <circle cx={cx} cy={cy} r="4" fill={A} />
          {/* reading */}
          <text x={cx} y="182" textAnchor="middle" fill={calC} style={f.display(700, 24, { opsz: 48 })}>{reading}%</text>
          <text x={cx} y="200" textAnchor="middle" fill={calC} style={f.mono(700, 9, { upper: true, tracking: 0.08 })}>{cal}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Slider val={humid} set={setHumid} min={20} max={95} step={1} color={C} label="Humidity" suffix={humid + "%"} />
        <Slider val={mismatch} set={setMismatch} min={0.3} max={1.7} step={0.1} color={A} label="Layer mismatch" suffix={mismatch.toFixed(1) + "x"} />
      </div>

      <Readout items={[
        { l: "Humidity", v: humid + "%", color: C },
        { l: "Strip curl", v: Math.round(thetaDeg) + "°", color: A },
        { l: "Dial reads", v: reading + "%", color: calC },
        { l: "Calibration", v: cal, color: calC },
      ]} />

      <Caption color={C}>
        Glue a layer that drinks in moisture to one that does not, and rising humidity makes the
        wet layer grow longer than the dry one, so the strip curls. A needle on the curl turns that
        bend into a humidity reading, no battery needed. The trick is tuning the layer mismatch:
        swell too little and it under-reads, too much and it over-reads. Get it right and it tracks
        true humidity.
      </Caption>
    </div>
  );
}

export { ExtraBilayer };
