// ExtraSearch component for the STEM Camp interactive deck.
import { useMemo, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

function ExtraSearch() {
  // BookBot warehouse top-down view: a grid of addressed bins, an order
  // list, and a crane that traces a fetch route. Compares NAIVE (visit in
  // listed order) vs SMART (nearest-neighbor) routing.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const okC = T.ok;
  const failC = T.warn;

  // ===== Geometry =====
  const W = 540, H = 320;
  const ROWS = 3, COLS = 6;
  const gridX = 24, gridY = 60;
  const binW = 60, binH = 50;
  const gridW = COLS * binW, gridH = ROWS * binH;   // 360x150
  // home / dock
  const homeCell = { r: ROWS, c: 0 };
  // panel on the right
  const panelX = gridX + gridW + 18;
  const panelY = 30;
  const panelW = W - panelX - 18;
  const panelH = 270;

  const center = (r, c) => ({
    x: gridX + c * binW + binW / 2,
    y: gridY + r * binH + binH / 2,
  });
  const homePos = () => ({
    x: gridX + homeCell.c * binW + binW / 2,
    y: gridY + gridH + 22,    // crane sits on top of the dock platform
  });

  const addrOf = (r, c) => String.fromCharCode(65 + r) + (c + 1);

  // Fixed order: 5 bins the BookBot must fetch.
  const order = useMemo(() => [
    { r: 0, c: 4 },
    { r: 2, c: 1 },
    { r: 0, c: 0 },
    { r: 1, c: 5 },
    { r: 2, c: 3 },
  ], []);

  // Manhattan distance helper for the smart route
  const manhattan = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
  const smartOrder = useMemo(() => {
    const remaining = order.slice();
    const result = [];
    let cur = homeCell;
    while (remaining.length > 0) {
      let bestIdx = 0;
      let bestD = manhattan(cur, remaining[0]);
      for (let k = 1; k < remaining.length; k++) {
        const d = manhattan(cur, remaining[k]);
        if (d < bestD) { bestD = d; bestIdx = k; }
      }
      const picked = remaining.splice(bestIdx, 1)[0];
      result.push(picked);
      cur = picked;
    }
    return result;
  }, [order]);

  // Distances in grid steps (Manhattan), including return to home
  const routeDist = (path) => {
    let d = manhattan(homeCell, path[0]);
    for (let k = 1; k < path.length; k++) d += manhattan(path[k - 1], path[k]);
    d += manhattan(path[path.length - 1], homeCell);
    return d;
  };
  const naiveDist = routeDist(order);
  const smartDist = routeDist(smartOrder);
  const saved = naiveDist - smartDist;

  // ===== Animation =====
  const [mode, setMode] = useState("naive");    // "naive" or "smart"
  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const [, force] = useState(0);

  const activePath = mode === "naive" ? order : smartOrder;
  // Build a list of waypoints: home -> bin1 -> bin2 -> ... -> home
  const waypoints = useMemo(() => {
    const wps = [{ ...homeCell, kind: "home" }];
    activePath.forEach((b, i) => wps.push({ ...b, kind: "bin", idx: i }));
    wps.push({ ...homeCell, kind: "home" });
    return wps;
  }, [mode, activePath]);

  // Per-leg time
  const stepMs = 600;
  useRAF(running, (dt) => {
    tRef.current += dt;
    const total = (waypoints.length - 1) * stepMs;
    if (tRef.current > total + 200) {
      setRunning(false);
    }
    force((v) => v + 1);
  });

  // Compute crane position based on tRef. Guard against waypoint array sizes
  // smaller than expected (defensive: should not happen, but cheap insurance).
  const cranePos = (() => {
    if (!waypoints || waypoints.length < 2) {
      const h = homePos();
      return { x: h.x, y: h.y, legIdx: 0, legT: 0 };
    }
    const elapsed = tRef.current;
    const legs = waypoints.length - 1;
    const legIdx = Math.max(0, Math.min(legs - 1, Math.floor(elapsed / stepMs)));
    const legT = Math.max(0, Math.min(1, (elapsed - legIdx * stepMs) / stepMs));
    const a = waypoints[legIdx] || waypoints[0];
    const b = waypoints[legIdx + 1] || waypoints[waypoints.length - 1];
    const ap = a.kind === "home" ? homePos() : center(a.r, a.c);
    const bp = b.kind === "home" ? homePos() : center(b.r, b.c);
    return {
      x: ap.x + (bp.x - ap.x) * legT,
      y: ap.y + (bp.y - ap.y) * legT,
      legIdx,
      legT,
    };
  })();

  // Bins that have been visited
  const visited = new Set();
  for (let k = 0; k <= cranePos.legIdx && k < waypoints.length; k++) {
    const wp = waypoints[k];
    if (wp && wp.kind === "bin") visited.add(addrOf(wp.r, wp.c));
  }
  const isOrdered = (addr) => order.some((b) => addrOf(b.r, b.c) === addr);
  const isCurrentTarget = (() => {
    const next = waypoints[cranePos.legIdx + 1];
    if (next && next.kind === "bin") return addrOf(next.r, next.c);
    return null;
  })();

  const start = () => { tRef.current = 0; setRunning(true); };
  const reset = () => { tRef.current = 0; setRunning(false); force((v) => v + 1); };

  return (
    <div>
      <Field height={330}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* Title */}
          <text x={gridX} y={22} fill={C}
            style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>bookbot warehouse</text>
          <text x={gridX} y={36} fill={T.mute}
            style={f.mono(500, 8.5, { upper: true, tracking: 0.18 })}>top-down · same 5 fetches, different routes</text>

          {/* ===== Aisle lanes ===== */}
          <rect x={gridX} y={gridY} width={gridW} height={gridH}
            fill={T.paper2} stroke={C} strokeWidth="1.2" />
          {/* horizontal aisle lines (between rows) */}
          {Array.from({ length: ROWS + 1 }, (_, r) => (
            <line key={"hl" + r}
              x1={gridX} y1={gridY + r * binH}
              x2={gridX + gridW} y2={gridY + r * binH}
              stroke={T.ink} strokeWidth="0.5" opacity="0.5" />
          ))}
          {Array.from({ length: COLS + 1 }, (_, c) => (
            <line key={"vl" + c}
              x1={gridX + c * binW} y1={gridY}
              x2={gridX + c * binW} y2={gridY + gridH}
              stroke={T.ink} strokeWidth="0.5" opacity="0.5" />
          ))}

          {/* ===== Bins with addresses ===== */}
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const addr = addrOf(r, c);
              const ordered = isOrdered(addr);
              const done = visited.has(addr);
              const target = isCurrentTarget === addr;
              const cp = center(r, c);
              const bg = done ? "#9ec39b" : (ordered ? "#f0d2a3" : T.paper);
              return (
                <g key={addr}>
                  <rect x={gridX + c * binW + 6} y={gridY + r * binH + 6}
                    width={binW - 12} height={binH - 12} rx={3}
                    fill={bg} stroke={target ? A : T.ink}
                    strokeWidth={target ? 1.8 : 0.7}
                    style={{ transition: "fill 0.2s, stroke 0.2s" }} />
                  <text x={cp.x} y={cp.y - 4} textAnchor="middle"
                    fill={ordered || done ? T.ink : T.mute}
                    style={f.mono(700, 10, { tracking: 0.08 })}>{addr}</text>
                  {ordered && (
                    <text x={cp.x} y={cp.y + 10} textAnchor="middle"
                      fill={done ? okC : (target ? A : T.mute)}
                      style={f.mono(600, 7.5, { upper: true, tracking: 0.18 })}>
                      {done ? "got" : "need"}
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* ===== Home / dock (small platform; label sits BELOW so the crane never covers it) ===== */}
          {(() => {
            const hp = homePos();
            return (
              <g>
                {/* dock platform */}
                <rect x={hp.x - 18} y={hp.y - 4} width={36} height={10} rx={2}
                  fill={C} stroke={T.ink} strokeWidth="0.8" />
                {/* dock label below platform */}
                <text x={hp.x} y={hp.y + 18} textAnchor="middle" fill={T.mute}
                  style={f.mono(700, 8.5, { upper: true, tracking: 0.22 })}>dock</text>
              </g>
            );
          })()}

          {/* ===== Route trace (light dashed lines under the crane) ===== */}
          {(() => {
            const d = waypoints.map((wp, i) => {
              const p = wp.kind === "home" ? homePos() : center(wp.r, wp.c);
              return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
            }).join(" ");
            return (
              <path d={d} fill="none" stroke={A} strokeWidth="1.2"
                strokeDasharray="4 4" opacity="0.55" />
            );
          })()}

          {/* ===== Crane ===== */}
          <g transform={`translate(${cranePos.x} ${cranePos.y})`}>
            <rect x={-9} y={-9} width={18} height={18} rx={3}
              fill={A} stroke={T.ink} strokeWidth="0.9" />
            <circle cx={0} cy={0} r={3} fill={T.paper} />
          </g>

          {/* ===== Right panel: order list + stats ===== */}
          {(() => {
            const px = panelX, py = panelY, pw = panelW, ph = panelH;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" />
                <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>order</text>

                {/* Order rows */}
                {order.map((b, i) => {
                  const addr = addrOf(b.r, b.c);
                  const idxInActive = activePath.findIndex((x) => x.r === b.r && x.c === b.c);
                  const done = visited.has(addr);
                  return (
                    <g key={i}>
                      <text x={px + 12} y={py + 38 + i * 16} fill={T.mute}
                        style={f.mono(700, 9)}>{i + 1}.</text>
                      <text x={px + 30} y={py + 38 + i * 16} fill={done ? okC : T.ink}
                        style={f.mono(700, 10)}>{addr}</text>
                      <text x={px + pw - 12} y={py + 38 + i * 16} textAnchor="end"
                        fill={T.mute}
                        style={f.mono(500, 8, { upper: true, tracking: 0.16 })}>
                        visit #{idxInActive + 1}
                      </text>
                    </g>
                  );
                })}

                <line x1={px + 10} y1={py + 130} x2={px + pw - 10} y2={py + 130}
                  stroke={T.rule22} strokeWidth="0.6" />

                {/* Mode + distances */}
                <text x={px + 12} y={py + 150} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>route</text>
                <text x={px + 12} y={py + 168} fill={C}
                  style={f.mono(700, 11, { upper: true, tracking: 0.2 })}>{mode}</text>

                <text x={px + 12} y={py + 192} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>naive</text>
                <text x={px + pw - 12} y={py + 192} textAnchor="end" fill={T.ink}
                  style={f.mono(700, 11)}>{naiveDist} steps</text>

                <text x={px + 12} y={py + 212} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>smart</text>
                <text x={px + pw - 12} y={py + 212} textAnchor="end" fill={okC}
                  style={f.mono(700, 11)}>{smartDist} steps</text>

                <text x={px + 12} y={py + 234} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>saved</text>
                <text x={px + pw - 12} y={py + 234} textAnchor="end" fill={A}
                  style={f.mono(700, 11)}>{saved} steps</text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Btn small color={C} active={mode === "naive"}
          onClick={() => { setMode("naive"); reset(); }}>naive route</Btn>
        <Btn small color={okC} active={mode === "smart"}
          onClick={() => { setMode("smart"); reset(); }}>smart route</Btn>
        <Btn small icon={Play} color={A} onClick={start}>run</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Naive", v: naiveDist + " steps", color: C },
        { l: "Smart", v: smartDist + " steps", color: okC },
        { l: "Saved", v: saved + " steps (" + Math.round(saved / naiveDist * 100) + "%)", color: A },
      ]} />

      <Caption color={C}>
        Books are stored by address, not by subject. The BookBot crane fetches
        five bins per order. A naive route follows the list in order; a smart
        route visits the nearest unvisited bin next. Same fetches, fewer steps.
      </Caption>
    </div>
  );
}

export { ExtraSearch };
