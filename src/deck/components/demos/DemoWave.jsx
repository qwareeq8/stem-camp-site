// DemoWave component for the STEM Camp interactive deck.
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function DemoWave() {
  // PYS-06 "Longitudinal waves" (concept 1). Sibling ExtraSonarRange (concept 2)
  // owns the ranging math: a sensor, a stopwatch, and distance = speed x time / 2,
  // with no medium. This demo is the wave itself: a slinky of coils that bunch
  // (compression) and spread (rarefaction) ALONG the axis. One tracked coil shows
  // that each coil only moves back and forth parallel to the travel direction,
  // which is what makes the wave longitudinal. A pulse reflects off the fixed end
  // and returns; a continuous mode shows a steady train of compressions, like
  // sound in air. No timing, no distance readout: that is the sibling's job.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerpC = (t) => { t = cl(t, 0, 1); const a = [28, 50, 87], b = [199, 122, 43]; return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * t) + "," + Math.round(a[1] + (b[1] - a[1]) * t) + "," + Math.round(a[2] + (b[2] - a[2]) * t) + ")"; };

  const [mode, setMode] = useState("pulse");
  const [speed, setSpeed] = useState(9);
  const [refl, setRefl] = useState(0);
  const [, force] = useState(0);
  const tRef = useRef(0);
  const modeRef = useRef(mode); useEffect(() => { modeRef.current = mode; }, [mode]);
  const speedRef = useRef(speed); useEffect(() => { speedRef.current = speed; }, [speed]);
  const reflRef = useRef(0);
  const pa = useRef({ active: false, xc: 0, dir: 1, amp: 0 });

  // ----- bounded geometry -----
  const VW = 560, VH = 240, x0 = 60, x1 = 512, yCoil = 102, coilH = 27;
  const N = 44, dx = (x1 - x0) / (N - 1), ti = Math.round(N * 0.42);
  const stripY = 150, stripH = 14;
  const launch = () => { pa.current = { active: true, xc: x0 + 8, dir: 1, amp: 13 }; reflRef.current = 0; setRefl(0); };
  useEffect(() => { launch(); }, []);

  useRAF(true, (dt) => {
    tRef.current += dt;
    if (modeRef.current === "pulse" && pa.current.active) {
      const c = speedRef.current * 0.05;            // px per ms
      let { xc, dir, amp } = pa.current;
      xc += dir * c * dt;
      let bounced = false;
      if (xc >= x1 - 8) { xc = (x1 - 8) - (xc - (x1 - 8)); dir = -1; amp *= 0.84; bounced = true; }
      if (xc <= x0 + 8) { xc = (x0 + 8) + ((x0 + 8) - xc); dir = 1; amp *= 0.84; bounced = true; }
      amp *= Math.pow(0.9986, dt / 16);
      if (bounced) { reflRef.current += 1; setRefl(reflRef.current); }
      pa.current = { active: amp > 1.4, xc, dir, amp };
    }
    force((n) => (n + 1) % 1000000);
  });

  // ----- coil displacement field -----
  const t = tRef.current;
  const lambda = 94, k = (2 * Math.PI) / lambda, Ac = 9, omega = speed * 0.05 * k;
  const coils = Array.from({ length: N }, (_, i) => {
    const bx = x0 + i * dx;
    let d = 0;
    if (mode === "continuous") d = Ac * Math.sin(k * (bx - x0) - omega * t);
    else if (pa.current.active) { const u = (bx - pa.current.xc) / 24; d = -pa.current.amp * u * Math.exp(-u * u) * 1.9; }
    return { bx, x: bx + d, d };
  });
  const comp = (i) => { const j = Math.min(i, N - 2); const sp = coils[j + 1].x - coils[j].x; return cl((dx / Math.max(2, sp) - 1) / 0.7, 0, 1); };
  const handX = x0 + (mode === "continuous" ? Ac * Math.sin(-omega * t) : 0);
  const pulse = pa.current;
  const reflDisp = mode === "pulse" ? String(refl) : "n/a";

  return (
    <div>
      <Field height={240}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          {/* ===== header ===== */}
          <text x="20" y="24" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Longitudinal waves</text>
          <text x="20" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>coils bunch and spread along the travel</text>

          {/* compression / rarefaction legend (top-right) */}
          <rect x={398} y={14} width={12} height={9} fill={A} opacity="0.7" />
          <text x={414} y={22} fill={T.mute} style={f.mono(600, 8, { tracking: 0.02 })}>compression</text>
          <rect x={398} y={28} width={12} height={9} fill={A} opacity="0.14" />
          <text x={414} y={36} fill={T.mute} style={f.mono(600, 8, { tracking: 0.02 })}>rarefaction</text>

          {/* wave-travels arrow (top of slinky) */}
          <line x1={x1 - 78} y1={48} x2={x1 - 14} y2={48} stroke={T.mute} strokeWidth="1.1" />
          <polygon points={(x1 - 14) + ",48 " + (x1 - 22) + ",44 " + (x1 - 22) + ",52"} fill={T.mute} />
          <text x={x1 - 80} y={51} textAnchor="end" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.1 })}>wave travels</text>

          {/* rest axis */}
          <line x1={x0} y1={yCoil} x2={x1} y2={yCoil} stroke={T.rule12} strokeWidth="0.6" />

          {/* hand / plunger (drives the wave) */}
          <rect x={handX - 14} y={yCoil - 20} width={11} height={40} rx="2.5" fill={C} stroke={T.ink} strokeWidth="0.8" />
          <line x1={handX - 3} y1={yCoil} x2={handX + 2} y2={yCoil} stroke={A} strokeWidth="2" />

          {/* fixed end (clamp + hatching) */}
          <rect x={x1 + 2} y={yCoil - coilH - 4} width="6" height={(coilH + 4) * 2} fill={T.ink} />
          {Array.from({ length: 7 }, (_, i) => <line key={"h" + i} x1={x1 + 8} y1={yCoil - coilH + i * 9} x2={x1 + 14} y2={yCoil - coilH + i * 9 - 6} stroke={T.ink} strokeWidth="0.8" opacity="0.6" />)}

          {/* slinky coils (vertical turns) coloured by compression */}
          {coils.map((cc, i) => {
            const tc = comp(i);
            const tracked = i === ti;
            return <line key={"c" + i} x1={cc.x} y1={yCoil - coilH} x2={cc.x} y2={yCoil + coilH} stroke={tracked ? A : lerpC(tc)} strokeWidth={tracked ? 3 : 1 + tc * 1.4} opacity={tracked ? 1 : 0.55 + tc * 0.4} />;
          })}

          {/* pulse marker + label */}
          {mode === "pulse" && pulse.active && (
            <g>
              <text x={pulse.xc} y={yCoil - coilH - 6} textAnchor="middle" fill={A} style={f.mono(700, 8.5, { upper: true, tracking: 0.1 })}>{pulse.dir > 0 ? "compression" : "reflected"}</text>
              <polygon points={(pulse.xc + pulse.dir * 9) + "," + (yCoil - coilH - 2) + " " + (pulse.xc + pulse.dir * 2) + "," + (yCoil - coilH - 6) + " " + (pulse.xc + pulse.dir * 2) + "," + (yCoil - coilH + 2)} fill={A} />
            </g>
          )}

          {/* end labels */}
          <text x={x0 - 2} y={yCoil + coilH + 16} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>push</text>
          <text x={x1 + 4} y={yCoil + coilH + 16} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>fixed end</text>

          {/* compression / rarefaction pressure strip */}
          {coils.slice(0, N - 1).map((cc, i) => {
            const w = Math.max(0.5, coils[i + 1].x - cc.x);
            return <rect key={"s" + i} x={cc.x} y={stripY} width={w} height={stripH} fill={A} opacity={cl(comp(i) * 0.78, 0, 0.78)} />;
          })}
          <rect x={x0} y={stripY} width={x1 - x0} height={stripH} fill="none" stroke={T.rule22} strokeWidth="0.7" />
          <text x={x0} y={stripY + stripH + 12} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>pressure: dark bands are compressions, like sound in air</text>

          {/* tracked-coil motion indicator */}
          <line x1={coils[ti].bx - 26} y1={196} x2={coils[ti].bx + 26} y2={196} stroke={T.rule22} strokeWidth="0.8" />
          <line x1={coils[ti].bx} y1={192} x2={coils[ti].bx} y2={200} stroke={T.mute} strokeWidth="0.8" />
          <line x1={coils[ti].bx - 20} y1={208} x2={coils[ti].bx + 20} y2={208} stroke={A} strokeWidth="1.1" />
          <polygon points={(coils[ti].bx - 20) + ",208 " + (coils[ti].bx - 13) + ",205 " + (coils[ti].bx - 13) + ",211"} fill={A} />
          <polygon points={(coils[ti].bx + 20) + ",208 " + (coils[ti].bx + 13) + ",205 " + (coils[ti].bx + 13) + ",211"} fill={A} />
          <circle cx={coils[ti].x} cy={196} r="3.4" fill={A} stroke={T.paper} strokeWidth="1" />
          <line x1={coils[ti].x} y1={yCoil + coilH} x2={coils[ti].bx} y2={192} stroke={A} strokeWidth="0.6" strokeDasharray="2 2" opacity="0.5" />
          <text x={coils[ti].bx} y={224} textAnchor="middle" fill={A} style={f.mono(700, 8, { upper: true, tracking: 0.08 })}>one coil: motion is parallel to travel</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Btn small icon={Play} active={mode === "pulse"} onClick={() => { setMode("pulse"); launch(); }}>send pulse</Btn>
        <Btn small active={mode === "continuous"} onClick={() => setMode("continuous")}>continuous</Btn>
        <Slider val={speed} set={setSpeed} min={4} max={16} step={1} color={A} label="Wave speed" suffix={speed} />
      </div>

      <Readout items={[
        { l: "Wave type", v: "longitudinal", color: A },
        { l: "Coil motion", v: "along travel", color: C },
        { l: "Mode", v: mode },
        { l: "Reflections", v: reflDisp },
      ]} />

      <Caption color={C}>
        Push one end and the coils bunch into a compression that travels along the slinky. Each coil
        only slides back and forth along the line, the same direction the wave moves, so this is a
        longitudinal wave, exactly how sound travels through air as bands of high and low pressure. In
        pulse mode the compression reflects off the fixed end and comes back; in continuous mode a
        steady train of compressions and rarefactions streams down the line. Watch the marked coil: it
        never moves across the line, only along it.
      </Caption>
    </div>
  );
}

export { DemoWave };
