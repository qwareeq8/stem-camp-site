// ExtraStress component for the STEM Camp interactive deck.
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout } from "../../ui/primitives.jsx";

function ExtraStress() {
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  // both pencils use the SAME 50 N force; only contact area differs
  const F = 50;                       // N
  const sharpArea = 0.2;              // cm², bare sharp tip
  const padArea   = 9.0;              // cm², padded tip
  const sharpPressure = F / sharpArea;
  const padPressure   = F / padArea;
  const sharpDent  = Math.min(38, sharpPressure * 0.15);
  const padDent    = Math.min(38, padPressure   * 0.15);
  const sharpDentW = 6;
  const padDentW   = 70;


  const Panel = ({ x, label, sub, dent, dentW, denomArea, denomP, padded }) => {
    // Surface top is at y=172.
    // Pencil body sits with its tip apex AT the surface (or at the top of the pad).
    const tipApexY = padded ? 160 : 172;             // bare tip touches clay; padded tip rests on the pad top
    const coneTopY = tipApexY - 24;                  // 24-tall triangle tip
    const bodyTopY = coneTopY - 64;                  // 64-tall pencil body
    return (
      <g transform={`translate(${x} 0)`}>
        {/* title + subtitle (well above the arrow) */}
        <text x={110} y={18} textAnchor="middle" fill={T.ink} style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>{label}</text>
        <text x={110} y={32} textAnchor="middle" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>{sub}</text>
        {/* clean single-shape down-arrow */}
        <g stroke={T.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1={110} y1={44} x2={110} y2={62} />
          <polyline points="103,55 110,64 117,55" />
        </g>
        <text x={132} y={58} fill={T.mute} style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>50 N</text>
        {/* pencil (body + tip cone + lead) */}
        <g transform="translate(110 0)">
          <rect x={-8} y={bodyTopY} width={16} height={64} fill="url(#psWood)" stroke={T.ink} strokeWidth="0.6" />
          <rect x={-8} y={bodyTopY} width={16} height={6} fill="#b08840" />
          <polygon points={`-8,${coneTopY} 8,${coneTopY} 0,${tipApexY}`} fill="#c79a4e" stroke={T.ink} strokeWidth="0.6" />
          <polygon points={`-2,${tipApexY - 6} 2,${tipApexY - 6} 0,${tipApexY}`} fill="#1d1916" />
        </g>
        {/* clay surface */}
        <rect x={20} y={172} width={180} height={50} fill="url(#psClay)" stroke={T.ink} strokeWidth="0.8" />
        {/* the pad sits ON the surface, BETWEEN the pencil tip and the clay */}
        {padded && (
          <g>
            <ellipse cx={110} cy={167} rx={36} ry={7} fill={A} stroke={T.ink} strokeWidth="0.6" />
            <text x={110} y={170} textAnchor="middle" fill={T.paper} style={f.mono(700, 8, { upper: true, tracking: 0.18 })}>PAD</text>
          </g>
        )}
        {/* dent carved into the clay */}
        <path d={`M ${110 - dentW / 2 - 4} 172 Q 110 ${172 + dent} ${110 + dentW / 2 + 4} 172 L ${110 + dentW / 2 + 4} 171 L ${110 - dentW / 2 - 4} 171 Z`}
          fill={padded ? "rgba(29,25,22,0.18)" : "rgba(29,25,22,0.6)"} />
        {/* dent depth callout */}
        <line x1={208} y1={172} x2={216} y2={172} stroke={T.ink} strokeWidth="0.8" />
        <line x1={208} y1={172 + dent} x2={216} y2={172 + dent} stroke={A} strokeWidth="1.4" />
        <line x1={212} y1={172} x2={212} y2={172 + dent} stroke={A} strokeWidth="1.4" />
        <text x={220} y={172 + dent / 2 + 3} fill={A} style={f.mono(700, 10, { upper: true, tracking: 0.18 })}>
          {dent.toFixed(0)} deep
        </text>
        {/* formula row */}
        <g transform="translate(20 240)">
          <text x={0} y={0} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>P = F / A</text>
          <text x={0} y={14} fill={T.ink} style={f.mono(600, 11)}>
            50 / {denomArea} = <tspan fill={A} style={{ fontWeight: 700 }}>{denomP} N/cm²</tspan>
          </text>
        </g>
      </g>
    );
  };

  return (
    <div>
      <Field height={300}>
        <svg viewBox="0 0 440 280" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="psClay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9dcc1" /><stop offset="1" stopColor="#cbb78f" /></linearGradient>
            <linearGradient id="psWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#cda24f" /><stop offset="0.5" stopColor="#f2dca0" /><stop offset="1" stopColor="#cda24f" /></linearGradient>
          </defs>
          <Panel x={0}   label="bare tip" sub="tiny contact area" dent={sharpDent} dentW={sharpDentW}
                 denomArea={sharpArea.toFixed(1)} denomP={sharpPressure.toFixed(0)} padded={false} />
          <Panel x={220} label="with pad" sub="wide contact area"  dent={padDent}   dentW={padDentW}
                 denomArea={padArea.toFixed(1)}   denomP={padPressure.toFixed(1)}   padded={true} />
        </svg>
      </Field>
      <Readout items={[
        { l: "Pressure drop", v: ((1 - padPressure / sharpPressure) * 100).toFixed(0) + "% lower", color: A },
        { l: "Why", v: "same force spread over more area" },
        { l: "Use", v: "helmets, snowshoes, seatbelts" },
      ]} />

      <Caption color={C}>
        Both pencils push with the same 50 N force, but the padded tip spreads that force over
        a much larger area. Since P = F / A, the pressure drops dramatically and the dent
        almost disappears. That's why helmets, snowshoes, and seatbelts work.
      </Caption>
    </div>
  );
}

export { ExtraStress };
