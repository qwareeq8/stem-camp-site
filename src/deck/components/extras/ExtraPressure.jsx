// ExtraPressure component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraPressure() {
  const [area, setArea] = useState(2);   // contact area in cm²  (0.5 to 8)
  const force = 50;                       // newtons (constant)
  const pressure = force / area;
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;

  // visual mapping (px in viewBox)
  const baseW = Math.max(8, area * 22);   // contact patch width
  const dentDepth = Math.min(34, pressure * 0.9);  // how deep the dent goes
  const cx = 180;                          // center x of pusher/dent column
  const surfaceY = 168;                    // top of the clay surface
  const dentColor = `rgba(29,25,22,${0.25 + Math.min(0.55, pressure * 0.02)})`;

  // pressure gauge mapping
  const gaugeMax = 110;                    // max N/cm² shown
  const gaugePct = Math.min(1, pressure / gaugeMax);

  return (
    <div>
      <Field height={260}>
        <svg viewBox="0 0 440 250" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="ppClay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9dcc1" /><stop offset="1" stopColor="#cbb78f" /></linearGradient>
            <linearGradient id="ppBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e3a85f" /><stop offset="1" stopColor="#a8631f" /></linearGradient>
          </defs>
          {/* === LEFT: side-view block pressing into clay === */}
          {/* labeled force arrow */}
          <text x={cx} y={26} textAnchor="middle" fill={T.ink} style={f.mono(700, 12, { upper: true, tracking: 0.2 })}>F = 50 N</text>
          <line x1={cx} y1={32} x2={cx} y2={62} stroke={T.ink} strokeWidth="2.2" />
          <polygon points={`${cx - 7},${56} ${cx + 7},${56} ${cx},${68}`} fill={T.ink} />

          {/* pusher block, wider when area is large */}
          <rect x={cx - baseW / 2} y={68} width={baseW} height={64} rx="2" fill={C} stroke={T.ink} strokeWidth="0.8"
            style={{ transition: "width .25s, x .25s" }} />
          <rect x={cx - baseW / 2 + 1.5} y={70} width={Math.max(2, baseW - 3)} height={9} rx="2" fill="#ffffff" opacity="0.16"
            style={{ transition: "width .25s, x .25s" }} />
          <rect x={cx - baseW / 2 + 1.5} y={123} width={Math.max(2, baseW - 3)} height={7} fill="#000000" opacity="0.16"
            style={{ transition: "width .25s, x .25s" }} />
          {/* tiny dimensioning arrows under pusher showing the contact width */}
          <line x1={cx - baseW / 2} y1={140} x2={cx + baseW / 2} y2={140} stroke={A} strokeWidth="1.2"
            style={{ transition: "x1 .25s, x2 .25s" }} />
          <line x1={cx - baseW / 2} y1={136} x2={cx - baseW / 2} y2={144} stroke={A} strokeWidth="1.2" />
          <line x1={cx + baseW / 2} y1={136} x2={cx + baseW / 2} y2={144} stroke={A} strokeWidth="1.2" />
          <text x={cx} y={155} textAnchor="middle" fill={A} style={f.mono(700, 11)}>{area.toFixed(1)} cm²</text>

          {/* clay surface, soft beige slab with depth grid lines */}
          <rect x={40} y={surfaceY} width={280} height={66} fill="url(#ppClay)" stroke={T.ink} strokeWidth="0.8" />
          {/* depth grid lines */}
          {[8, 16, 24, 32].map((d) => (
            <line key={d} x1={40} y1={surfaceY + d} x2={320} y2={surfaceY + d}
              stroke={T.ink} strokeWidth="0.4" opacity="0.18" />
          ))}
          {/* the actual dent: a smooth concave curve pushed into the clay */}
          <path d={`M ${cx - baseW / 2 - 6} ${surfaceY} Q ${cx} ${surfaceY + dentDepth} ${cx + baseW / 2 + 6} ${surfaceY} L ${cx + baseW / 2 + 6} ${surfaceY - 1} L ${cx - baseW / 2 - 6} ${surfaceY - 1} Z`}
            fill={dentColor}
            style={{ transition: "d .25s" }} />
          {/* dent depth tick on the left edge of the surface */}
          <line x1={36} y1={surfaceY} x2={32} y2={surfaceY} stroke={T.ink} strokeWidth="0.8" />
          <line x1={36} y1={surfaceY + dentDepth} x2={32} y2={surfaceY + dentDepth} stroke={A} strokeWidth="1.4" />
          <text x={28} y={surfaceY + dentDepth + 3} textAnchor="end" fill={A} style={f.mono(700, 10, { upper: true, tracking: 0.14 })}>
            {dentDepth.toFixed(0)}
          </text>
          <text x={28} y={surfaceY + dentDepth + 14} textAnchor="end" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.14 })}>
            depth
          </text>
          {/* surface label moved to the LEFT of the slab so it doesn't collide with the formula */}
          <text x={40} y={surfaceY - 4} fill={T.mute} style={f.mono(600, 9, { upper: true, tracking: 0.2 })}>soft clay</text>

          {/* === RIGHT: vertical pressure gauge === */}
          <g transform="translate(360 30)">
            <text x={20} y={-4} textAnchor="middle" fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>pressure</text>
            <rect x={0} y={0} width={40} height={180} fill="none" stroke={T.ink} strokeWidth="0.8" />
            {/* tick marks */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <g key={t}>
                <line x1={-4} y1={180 - t * 180} x2={0} y2={180 - t * 180} stroke={T.ink} strokeWidth="0.6" />
                <text x={-7} y={183 - t * 180} textAnchor="end" fill={T.mute} style={f.mono(500, 8)}>
                  {Math.round(t * gaugeMax)}
                </text>
              </g>
            ))}
            <rect x={2} y={180 - gaugePct * 180} width={36} height={gaugePct * 180}
              fill="url(#ppBar)" opacity="0.95"
              style={{ transition: "y .25s, height .25s" }} />
            <text x={20} y={200} textAnchor="middle" fill={T.ink} style={f.mono(700, 11)}>
              {pressure.toFixed(1)}
            </text>
            <text x={20} y={211} textAnchor="middle" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.14 })}>n/cm²</text>
          </g>

          {/* === Formula bar at very bottom, in its own row === */}
          <g transform="translate(40 245)">
            <text x={0} y={0} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.22 })}>P = F / A</text>
            <text x={60} y={0} fill={T.ink} style={f.mono(600, 11)}>
              50 N / {area.toFixed(1)} cm² = <tspan fill={A} style={{ fontWeight: 700 }}>{pressure.toFixed(1)} N/cm²</tspan>
            </text>
          </g>
        </svg>
      </Field>
      <div style={{ padding: "0 4px" }}>
        <Slider val={area * 10} set={(v) => setArea(v / 10)} min={5} max={80} step={5}
          color={A} label="Contact area" suffix={area.toFixed(1) + " cm²"} />
      </div>
      <Readout items={[
        { l: "Pressure", v: pressure.toFixed(1) + " N/cm²", color: A },
        { l: "Dent depth", v: pressure > 20 ? "deep" : pressure > 8 ? "moderate" : "shallow" },
        { l: "Why", v: "same force, smaller area → bigger dent" },
      ]} />

      <Caption color={C}>
        Pressure is force divided by area: <strong>P = F / A</strong>. The block always pushes
        with the same 50 N, but a smaller contact area concentrates the force into a higher
        pressure and a deeper dent in the clay.
      </Caption>
    </div>
  );
}

export { ExtraPressure };
