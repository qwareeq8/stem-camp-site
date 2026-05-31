// ExtraCoolRoute component for the STEM Camp interactive deck.
import { useMemo, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { HeatTile, campusGrid } from "../shared.jsx";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

function ExtraCoolRoute() {
  // Same campus map. Compare a "cool route" (greedy by temperature) with the
  // "direct route" (stay on the shortest grid path) from start to end.
  const grid = useMemo(() => campusGrid(), []);
  const ROWS = grid.length, COLS = grid[0].length;
  const start = [0, 0], end = [ROWS - 1, COLS - 1];
  const C = CAMP.trees.ink;
  const coolColor = "#2c5b85";   // cool: deep blue
  const hotColor = "#c4452c";    // direct: hot red
  const okC = T.ok;

  // Direct route: down then right (stair-step along the diagonal)
  const directPath = useMemo(() => {
    const path = [];
    let r = start[0], c = start[1];
    path.push([r, c]);
    while (r < end[0] || c < end[1]) {
      // alternate down/right so it looks diagonal
      if (r < end[0] && c < end[1]) {
        if ((r + c) % 2 === 0) r++; else c++;
      } else if (r < end[0]) r++;
      else c++;
      path.push([r, c]);
    }
    return path;
  }, []);

  // Cool route: at each step pick the move that lands on the cooler tile
  // (with a small bias toward making progress toward the goal so it terminates)
  const coolPath = useMemo(() => {
    const path = [[...start]];
    let r = start[0], c = start[1];
    let guard = 0;
    while ((r !== end[0] || c !== end[1]) && guard < 50) {
      guard++;
      const options = [];
      if (r < end[0]) options.push([r + 1, c]);
      if (c < end[1]) options.push([r, c + 1]);
      // pick coolest
      options.sort((a, b) => grid[a[0]][a[1]].temp - grid[b[0]][b[1]].temp);
      const [nr, nc] = options[0];
      r = nr; c = nc;
      path.push([r, c]);
    }
    return path;
  }, [grid]);

  const tempSum = (path) => path.reduce((s, [r, c]) => s + grid[r][c].temp, 0);
  const coolSum = tempSum(coolPath);
  const directSum = tempSum(directPath);
  const coolAvg = coolSum / coolPath.length;
  const directAvg = directSum / directPath.length;
  const savings = directAvg - coolAvg;

  // Animation
  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const [, force] = useState(0);
  useRAF(running, (dt) => {
    tRef.current += dt;
    force((v) => v + 1);
    const total = (coolPath.length + directPath.length) * 220;
    if (tRef.current > total + 600) setRunning(false);
  });
  const start_ = () => { tRef.current = 0; setRunning(true); };
  const reset = () => { tRef.current = 0; setRunning(false); force((v) => v + 1); };

  // Geometry: narrower tiles so the right panel can be wider
  const W = 540, H = 290;
  const mapX = 20, mapY = 30;
  const tileW = 56, tileH = 50;
  const mapW = tileW * COLS;
  const mapH = tileH * ROWS;

  // Two routes often share a tile, so offset each path by a small diagonal
  // amount so both stay visible on shared segments.
  const COOL_DX = -3, COOL_DY = -3;
  const DIR_DX = 3,  DIR_DY = 3;
  const center = (r, c) => ({ x: mapX + c * tileW + tileW / 2, y: mapY + r * tileH + tileH / 2 });
  const centerOff = (r, c, dx, dy) => {
    const p = center(r, c);
    return { x: p.x + dx, y: p.y + dy };
  };

  // How many path nodes to draw based on animation progress
  const stepMs = 220;
  const elapsed = tRef.current;
  const coolN = Math.min(coolPath.length, Math.floor(elapsed / stepMs) + 1);
  const directStart = coolPath.length * stepMs + 200;
  const directN = Math.min(directPath.length, Math.max(0, Math.floor((elapsed - directStart) / stepMs) + 1));

  return (
    <div>
      <Field height={300}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* tiles (faded so paths stand out) */}
          {grid.map((row, r) => row.map((cell, c) => (
            <HeatTile key={r + "," + c}
              x={mapX + c * tileW} y={mapY + r * tileH}
              w={tileW} h={tileH}
              kind={cell.kind} temp={cell.temp}
              highlight={false} faded
            />
          )))}
          <rect x={mapX} y={mapY} width={mapW} height={mapH}
            fill="none" stroke={T.ink} strokeWidth="1.4" />

          {/* direct route (drawn first, offset +3/+3 so it doesn't hide behind cool) */}
          {(() => {
            const d = directPath.slice(0, directN).map(([r, c], i) => {
              const p = centerOff(r, c, DIR_DX, DIR_DY);
              return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
            }).join(" ");
            return d && (
              <g>
                <path d={d} stroke={hotColor} strokeWidth="3" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" />
                {directPath.slice(0, directN).map(([r, c], i) => {
                  const p = centerOff(r, c, DIR_DX, DIR_DY);
                  return <circle key={"d" + i} cx={p.x} cy={p.y} r={3.2} fill={hotColor} stroke={T.ink} strokeWidth="0.5" />;
                })}
              </g>
            );
          })()}

          {/* cool route (drawn on top, offset -3/-3) */}
          {(() => {
            const d = coolPath.slice(0, coolN).map(([r, c], i) => {
              const p = centerOff(r, c, COOL_DX, COOL_DY);
              return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
            }).join(" ");
            return d && (
              <g>
                <path d={d} stroke={coolColor} strokeWidth="3" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" />
                {coolPath.slice(0, coolN).map(([r, c], i) => {
                  const p = centerOff(r, c, COOL_DX, COOL_DY);
                  return <circle key={"c" + i} cx={p.x} cy={p.y} r={3.2} fill={coolColor} stroke={T.ink} strokeWidth="0.5" />;
                })}
              </g>
            );
          })()}

          {/* start and end markers (drawn LAST so they sit on top of all paths) */}
          {(() => {
            const s = center(start[0], start[1]);
            const e = center(end[0], end[1]);
            const r = 16;
            return (
              <g>
                {/* white halo so markers stand out against routes */}
                <circle cx={s.x} cy={s.y} r={r + 2} fill={T.paper} stroke={T.ink} strokeWidth="0.7" />
                <circle cx={s.x} cy={s.y} r={r} fill={C} stroke={T.ink} strokeWidth="1.1" />
                <text x={s.x} y={s.y + 3} textAnchor="middle" fill={T.paper}
                  style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>start</text>
                <circle cx={e.x} cy={e.y} r={r + 2} fill={T.paper} stroke={T.ink} strokeWidth="0.7" />
                <circle cx={e.x} cy={e.y} r={r} fill={okC} stroke={T.ink} strokeWidth="1.1" />
                <text x={e.x} y={e.y + 3} textAnchor="middle" fill={T.paper}
                  style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>end</text>
              </g>
            );
          })()}

          {/* legend (route colors) bottom-left */}
          {(() => {
            const lx = mapX, ly = mapY + mapH + 18;
            return (
              <g>
                <line x1={lx} y1={ly} x2={lx + 22} y2={ly}
                  stroke={coolColor} strokeWidth="3.4" strokeLinecap="round" />
                <text x={lx + 28} y={ly + 4} fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.16 })}>cool route</text>
                <line x1={lx + 130} y1={ly} x2={lx + 152} y2={ly}
                  stroke={hotColor} strokeWidth="3" strokeLinecap="round" />
                <text x={lx + 158} y={ly + 4} fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.16 })}>direct route</text>
              </g>
            );
          })()}

          {/* comparison panel (right) */}
          {(() => {
            const px = mapX + mapW + 14, py = mapY, pw = W - px - 16, ph = mapH;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" />
                <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>route stats</text>

                <text x={px + 10} y={py + 42} fill={coolColor}
                  style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>cool</text>
                <text x={px + 10} y={py + 60} fill={coolColor}
                  style={f.mono(700, 14)}>{coolAvg.toFixed(1)}° avg</text>
                <text x={px + 10} y={py + 72} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>
                  {coolPath.length} tiles · sum {coolSum.toFixed(0)}°
                </text>

                <line x1={px + 8} y1={py + 86} x2={px + pw - 8} y2={py + 86}
                  stroke={T.rule22} strokeWidth="0.6" />

                <text x={px + 10} y={py + 104} fill={hotColor}
                  style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>direct</text>
                <text x={px + 10} y={py + 122} fill={hotColor}
                  style={f.mono(700, 14)}>{directAvg.toFixed(1)}° avg</text>
                <text x={px + 10} y={py + 134} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>
                  {directPath.length} tiles · sum {directSum.toFixed(0)}°
                </text>

                <line x1={px + 8} y1={py + 148} x2={px + pw - 8} y2={py + 148}
                  stroke={T.rule22} strokeWidth="0.6" />

                <text x={px + 10} y={py + 170} fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.16 })}>savings per tile</text>
                <text x={px + 10} y={py + 190} fill={okC}
                  style={f.mono(700, 16)}>
                  {savings >= 0 ? "−" : "+"}{Math.abs(savings).toFixed(1)}°</text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Btn small icon={Play} color={coolColor} onClick={start_}>trace routes</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Cool avg", v: coolAvg.toFixed(1) + "°", color: coolColor },
        { l: "Direct avg", v: directAvg.toFixed(1) + "°", color: hotColor },
        { l: "Savings", v: "−" + Math.max(0, savings).toFixed(1) + "° / tile", color: okC },
      ]} />

      <Caption color={C}>
        Two routes from start to end across the same campus. The direct
        route cuts diagonally over hot pavement. The cool route detours
        through tree shade and building shadow. Using the heat data, the
        cool route averages several degrees cooler per tile of walking.
      </Caption>
    </div>
  );
}

export { ExtraCoolRoute };
