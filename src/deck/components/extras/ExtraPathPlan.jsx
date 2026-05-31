// ExtraPathPlan component for the STEM Camp interactive deck.
import { useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraPathPlan() {
  // PYS-01 "Path planning" (concept 2). Distinct from DemoMagnet (remote
  // actuation). You plan a route through the maze, then control the magnet's
  // speed: too fast and the capsule overshoots corners and touches walls; too
  // slow and you waste time. The goal is the fastest CLEAN run.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const grid = [
    "..#......",
    "..#.###..",
    ".....#...",
    "###..#.#.",
    "...#...#.",
    ".#.#.###.",
    ".#.....#.",
    ".#######.",
    ".........",
  ];
  const start = [0, 0], goal = [8, 8];
  const route = useMemo(() => {
    const rows = grid.length, cols = grid[0].length;
    const open = [{ x: start[0], y: start[1], path: [start] }];
    const seen = new Set([start.join(",")]);
    while (open.length) {
      const cur = open.shift();
      if (cur.x === goal[0] && cur.y === goal[1]) return cur.path;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cur.x + dx, ny = cur.y + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        if (grid[ny][nx] === "#") continue;
        const k = nx + "," + ny;
        if (seen.has(k)) continue;
        seen.add(k);
        open.push({ x: nx, y: ny, path: [...cur.path, [nx, ny]] });
      }
    }
    return [start];
  }, []);

  const corners = useMemo(() => {
    const cs = [];
    for (let i = 1; i < route.length - 1; i++) {
      const a1 = route[i][0] - route[i - 1][0], b1 = route[i][1] - route[i - 1][1];
      const a2 = route[i + 1][0] - route[i][0], b2 = route[i + 1][1] - route[i][1];
      if (a1 !== a2 || b1 !== b2) cs.push({ x: route[i][0], y: route[i][1], dx: a1, dy: b1 });
    }
    return cs;
  }, [route]);

  const [speed, setSpeed] = useState(7);   // magnet speed 1..10 (default shows touches)
  const [playing, setPlaying] = useState(true);
  const touches = clamp(Math.round((speed - 5) * 0.9), 0, 4);
  const timeS = (80 / speed).toFixed(1);
  const verdict = touches > 0 ? "too fast" : speed >= 4 ? "fast and clean" : "too slow";
  const vC = touches > 0 ? warnC : speed >= 4 ? okC : A;

  // ---- animation: capsule travels the route ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const dur = clamp(5200 / speed, 700, 5200);
  const p = (clockRef.current % dur) / dur;
  const last = Math.max(0, route.length - 1);
  const fidx = clamp(Number.isFinite(p) ? p : 0, 0, 0.999999) * last;
  const i0 = clamp(Math.floor(fidx), 0, last), i1 = clamp(i0 + 1, 0, last), fr = fidx - i0;

  // ---- maze geometry ----
  const VW = 560, VH = 230, cell = 18, ox = 48, oy = 46;
  const ccx = (cxy) => ox + cxy * cell + cell / 2;
  const cap = {
    x: ox + (route[i0][0] + (route[i1][0] - route[i0][0]) * fr) * cell + cell / 2,
    y: oy + (route[i0][1] + (route[i1][1] - route[i0][1]) * fr) * cell + cell / 2,
  };
  const segdx = route[i1][0] - route[i0][0], segdy = route[i1][1] - route[i0][1];
  const heading = (segdx === 0 && segdy === 0) ? 0 : (Math.atan2(segdy, segdx) * 180) / Math.PI;
  const routePts = route.map(([x, y]) => (ox + x * cell + cell / 2).toFixed(1) + "," + (oy + y * cell + cell / 2).toFixed(1)).join(" ");

  // ---- tradeoff chart ----
  const pn = { x: 262, y: 52, w: 252, h: 150 };
  const plotL = pn.x + 38, plotR = pn.x + pn.w - 16, plotTop = pn.y + 30, plotBot = pn.y + pn.h - 24;
  const sX = (s) => plotL + ((s - 1) / 9) * (plotR - plotL);
  const yN = (v) => plotBot - (v / 100) * (plotBot - plotTop);
  const touchAt = (s) => clamp(Math.round((s - 5) * 0.9), 0, 4);
  const timePts = [], touchPts = [];
  for (let s = 1; s <= 10; s += 0.5) { timePts.push(sX(s).toFixed(1) + "," + yN(100 / s).toFixed(1)); }
  for (let s = 1; s <= 10; s += 0.5) { touchPts.push(sX(s).toFixed(1) + "," + yN((touchAt(s) / 4) * 100).toFixed(1)); }

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>path planning</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>fast, clean run, fewest wall touches</text>

          {/* maze cells */}
          {grid.map((row, y) => row.split("").map((ch, x) => (
            <rect key={x + "," + y} x={ox + x * cell} y={oy + y * cell} width={cell - 1.4} height={cell - 1.4}
              fill={ch === "#" ? T.ink : T.paper} stroke={T.rule12} strokeWidth="0.5" />
          )))}
          {/* planned route */}
          <polyline points={routePts} fill="none" stroke={A} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.5" strokeDasharray="1 4" />
          {/* touched corners (overshoot skids) */}
          {corners.slice(0, touches).map((c, k) => {
            const bx = ccx(c.x), by = oy + c.y * cell + cell / 2;
            const ex = bx + c.dx * cell * 0.95, ey = by + c.dy * cell * 0.95;
            return (
              <g key={k}>
                <line x1={bx} y1={by} x2={ex} y2={ey} stroke={warnC} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="2.5 2" />
                {[0, 1, 2, 3, 4].map((j) => { const a = (j / 5) * Math.PI * 2; return <line key={j} x1={ex} y1={ey} x2={ex + Math.cos(a) * 5} y2={ey + Math.sin(a) * 5} stroke={warnC} strokeWidth="1.7" strokeLinecap="round" />; })}
                <circle cx={ex} cy={ey} r="2.4" fill={warnC} />
              </g>
            );
          })}
          {/* start + goal */}
          <circle cx={ccx(start[0])} cy={oy + start[1] * cell + cell / 2} r="5.5" fill={C} />
          <circle cx={ccx(goal[0])} cy={oy + goal[1] * cell + cell / 2} r="5.5" fill={A} stroke={T.ink} strokeWidth="1" />
          {/* capsule pill-camera: body + clear lens dome with LEDs, pointed along travel */}
          <g transform={"translate(" + cap.x.toFixed(1) + " " + cap.y.toFixed(1) + ") rotate(" + heading.toFixed(1) + ")"}>
            <rect x="-7" y="-3.6" width="14" height="7.2" rx="3.6" fill={A} stroke={T.ink} strokeWidth="0.9" />
            <line x1="1.5" y1="-3.4" x2="1.5" y2="3.4" stroke={T.ink} strokeWidth="0.6" opacity="0.45" />
            <rect x="-5" y="-2.7" width="5.5" height="1.5" rx="0.7" fill="#ffffff" opacity="0.45" />
            <path d="M 3.4 -3.5 A 3.6 3.6 0 0 1 3.4 3.5 Z" fill="#bfe2ec" stroke={T.ink} strokeWidth="0.7" />
            <circle cx="4.6" cy="0" r="1.3" fill={C} opacity="0.85" />
            <circle cx="3.7" cy="-1.7" r="0.7" fill="#fff8d8" />
            <circle cx="3.7" cy="1.7" r="0.7" fill="#fff8d8" />
          </g>
          <text x={ox} y={oy + 9 * cell + 12} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>maze + planned route</text>

          {/* ===== tradeoff chart ===== */}
          <g>
            <rect x={pn.x} y={pn.y} width={pn.w} height={pn.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            {[["time", C], ["touches", warnC]].map(([lab, col], i) => (
              <g key={i} transform={"translate(" + (pn.x + 12 + i * 70) + " " + (pn.y + 14) + ")"}>
                <line x1={0} y1={0} x2={12} y2={0} stroke={col} strokeWidth="2.4" />
                <text x={15} y={3} fill={col} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>{lab}</text>
              </g>
            ))}
            {/* clean zone (speed <= 5) */}
            <rect x={sX(1)} y={plotTop} width={sX(5) - sX(1)} height={plotBot - plotTop} fill={okC} opacity="0.1" />
            <text x={(sX(1) + sX(5)) / 2} y={plotTop - 3} textAnchor="middle" fill={okC} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>clean</text>
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            <polyline points={timePts.join(" ")} fill="none" stroke={C} strokeWidth="2" />
            <polyline points={touchPts.join(" ")} fill="none" stroke={warnC} strokeWidth="2" />
            {/* fastest-clean sweet spot */}
            <line x1={sX(5)} y1={plotTop} x2={sX(5)} y2={plotBot} stroke={okC} strokeDasharray="3 3" strokeWidth="1" />
            <text x={sX(5)} y={plotBot + 22} textAnchor="middle" fill={okC} style={f.mono(700, 7.5, { upper: true, tracking: 0.08 })}>fastest clean</text>
            {/* current speed marker */}
            <line x1={sX(speed)} y1={plotTop} x2={sX(speed)} y2={plotBot} stroke={T.ink} strokeDasharray="2 3" strokeWidth="1" opacity="0.6" />
            <circle cx={sX(speed)} cy={yN(100 / speed)} r="3.2" fill={C} stroke={T.paper} strokeWidth="1" />
            <text x={plotL} y={plotBot + 13} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>slow</text>
            <text x={plotR} y={plotBot + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>fast</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={speed} set={setSpeed} min={1} max={10} color={A} label="Magnet speed" suffix={speed} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Speed", v: speed, color: A },
        { l: "Run time", v: timeS + " s", color: C },
        { l: "Wall touches", v: touches, color: touches > 0 ? warnC : okC },
        { l: "Verdict", v: verdict, color: vC },
      ]} />

      <Caption color={C}>
        Plan a route through the maze, then steer the magnet at the right speed.
        Too fast and the capsule overshoots corners and scrapes the walls; too
        slow and you waste time. The best run is the fastest one that stays clean,
        with no wall touches.
      </Caption>
    </div>
  );
}

export { ExtraPathPlan };
