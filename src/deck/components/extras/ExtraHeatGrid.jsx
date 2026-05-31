// ExtraHeatGrid component for the STEM Camp interactive deck.
import { useMemo, useState } from "react";
import { CAMPUS_BASE_TEMP, CAMPUS_TYPE_LABEL, HeatTile, TypeGlyph, campusGrid, heatColor } from "../shared.jsx";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout } from "../../ui/primitives.jsx";

function ExtraHeatGrid() {
  // Interactive campus heat map: hover any tile to see its temperature and type.
  const grid = useMemo(() => campusGrid(), []);
  const [hover, setHover] = useState(null);
  const A = CAMP.trees.acc, C = CAMP.trees.ink;
  const okC = T.ok;

  const ROWS = grid.length, COLS = grid[0].length;
  // ----- Layout (everything has its own zone, no overlap) -----
  const W = 580, H = 340;
  const titleY = 30;                 // map title
  const mapX = 20, mapY = 56;
  const tileW = 60, tileH = 52;
  const mapW = tileW * COLS;         // 360
  const mapH = tileH * ROWS;         // 208
  // Right panel
  const panelX = mapX + mapW + 16;   // 396
  const panelY = mapY;
  const panelW = W - panelX - 16;    // 168
  const panelH = mapH;
  // Sun (top-right corner, above the panel)
  const sunCx = panelX + panelW / 2;
  const sunCy = 32;
  // Legend (below map, full map width)
  const legendY = mapY + mapH + 28;

  const flat = grid.flat();
  const allTemps = flat.map((t) => t.temp);
  const tMin = Math.min(...allTemps), tMax = Math.max(...allTemps);
  const tAvg = allTemps.reduce((s, v) => s + v, 0) / allTemps.length;
  const counts = { P: 0, L: 0, T: 0, B: 0 };
  flat.forEach((t) => counts[t.kind]++);

  return (
    <div>
      <Field height={340}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* ===== Title ===== */}
          <text x={mapX} y={titleY} fill={C}
            style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>campus heat map</text>
          <text x={mapX} y={titleY + 12} fill={T.mute}
            style={f.mono(500, 8.5, { upper: true, tracking: 0.18 })}>surface temperature · noon</text>

          {/* ===== Sun (top-right, outside the map) ===== */}
          <defs>
            <radialGradient id="hgSun" cx="0.38" cy="0.34" r="0.7">
              <stop offset="0" stopColor="#ffe79a" />
              <stop offset="0.55" stopColor="#f3c95c" />
              <stop offset="1" stopColor="#e0a83c" />
            </radialGradient>
          </defs>
          <g transform={`translate(${sunCx} ${sunCy})`}>
            <circle r={17} fill="#f3c95c" opacity="0.16" />
            {Array.from({ length: 8 }, (_, k) => {
              const a = (k / 8) * Math.PI * 2;
              return (
                <line key={k}
                  x1={Math.cos(a) * 14} y1={Math.sin(a) * 14}
                  x2={Math.cos(a) * 19} y2={Math.sin(a) * 19}
                  stroke="#cf963b" strokeWidth="1.5" strokeLinecap="round" />
              );
            })}
            <circle r={10} fill="url(#hgSun)" stroke={T.ink} strokeWidth="0.9" />
          </g>
          <text x={sunCx} y={sunCy + 30} textAnchor="middle" fill={T.mute}
            style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>noon sun</text>

          {/* ===== Tiles ===== */}
          {grid.map((row, r) => row.map((cell, c) => (
            <HeatTile key={r + "," + c}
              x={mapX + c * tileW} y={mapY + r * tileH}
              w={tileW} h={tileH}
              kind={cell.kind} temp={cell.temp}
              highlight={hover && hover.r === r && hover.c === c}
              onPointer={() => setHover({ r, c, ...cell })}
              onLeave={() => setHover(null)}
            />
          )))}
          {/* Map border */}
          <rect x={mapX} y={mapY} width={mapW} height={mapH}
            fill="none" stroke={T.ink} strokeWidth="1.4" />

          {/* ===== Legend row (below map) ===== */}
          {(() => {
            const items = [
              { kind: "P", label: "paved" },
              { kind: "L", label: "lawn" },
              { kind: "T", label: "tree" },
              { kind: "B", label: "building" },
            ];
            const slotW = mapW / items.length;
            return items.map((it, i) => (
              <g key={it.kind} transform={`translate(${mapX + i * slotW} ${legendY})`}>
                <TypeGlyph kind={it.kind} gx={0} gy={-10} />
                <text x={22} y={0} fill={C}
                  style={f.mono(700, 9.5, { upper: true, tracking: 0.18 })}>
                  {it.label}
                </text>
                <text x={22} y={12} fill={T.mute}
                  style={f.mono(500, 8, { upper: true, tracking: 0.14 })}>
                  {counts[it.kind]} tiles · ~{CAMPUS_BASE_TEMP[it.kind]}°
                </text>
              </g>
            ));
          })()}

          {/* ===== Heat scale bar (right side under the panel) ===== */}
          {(() => {
            const sbX = mapX, sbY = legendY + 28;
            const sbW = mapW, sbH = 10;
            const stops = 24;
            return (
              <g>
                <text x={sbX} y={sbY - 4} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>cool</text>
                <text x={sbX + sbW} y={sbY - 4} textAnchor="end" fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>hot</text>
                {Array.from({ length: stops }, (_, k) => (
                  <rect key={k} x={sbX + (k * sbW) / stops} y={sbY}
                    width={sbW / stops + 0.5} height={sbH}
                    fill={heatColor(27 + (k / (stops - 1)) * 13)} />
                ))}
                <rect x={sbX} y={sbY} width={sbW} height={sbH}
                  fill="none" stroke={T.ink} strokeWidth="0.6" />
                {/* tick: hover temp */}
                {hover && (() => {
                  const px = sbX + ((hover.temp - 27) / 13) * sbW;
                  return (
                    <g>
                      <line x1={px} y1={sbY - 3} x2={px} y2={sbY + sbH + 3}
                        stroke={T.ink} strokeWidth="1.4" />
                      <polygon
                        points={`${px - 4},${sbY + sbH + 3} ${px + 4},${sbY + sbH + 3} ${px},${sbY + sbH + 9}`}
                        fill={T.ink} />
                    </g>
                  );
                })()}
              </g>
            );
          })()}

          {/* ===== Right panel ===== */}
          {(() => {
            const px = panelX, py = panelY, pw = panelW, ph = panelH;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" />
                {hover ? (
                  <g>
                    <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                      style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>tile reading</text>

                    <text x={px + 12} y={py + 42} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>type</text>
                    <g transform={`translate(${px + 12} ${py + 50})`}>
                      <TypeGlyph kind={hover.kind} gx={0} gy={0} />
                    </g>
                    <text x={px + 36} y={py + 62} fill={C}
                      style={f.mono(700, 12, { upper: true, tracking: 0.18 })}>
                      {CAMPUS_TYPE_LABEL[hover.kind]}
                    </text>

                    <line x1={px + 10} y1={py + 78} x2={px + pw - 10} y2={py + 78}
                      stroke={T.rule22} strokeWidth="0.6" />

                    <text x={px + 12} y={py + 96} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>temperature</text>
                    <text x={px + 12} y={py + 122} fill={hover.temp > 33 ? A : okC}
                      style={f.mono(700, 24)}>{hover.temp.toFixed(1)}°</text>

                    <text x={px + 12} y={py + 140} fill={T.mute}
                      style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>
                      +{(hover.temp - tMin).toFixed(1)}° vs coolest
                    </text>
                    <text x={px + 12} y={py + 152} fill={T.mute}
                      style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>
                      {(hover.temp - tMax).toFixed(1)}° vs hottest
                    </text>

                    <line x1={px + 10} y1={py + 168} x2={px + pw - 10} y2={py + 168}
                      stroke={T.rule22} strokeWidth="0.6" />

                    <text x={px + 12} y={py + 186} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>position</text>
                    <text x={px + 12} y={py + 200} fill={C}
                      style={f.mono(700, 11)}>row {hover.r + 1} · col {hover.c + 1}</text>
                  </g>
                ) : (
                  <g>
                    <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                      style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>map stats</text>

                    <text x={px + 12} y={py + 44} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>average</text>
                    <text x={px + pw - 12} y={py + 44} textAnchor="end" fill={C}
                      style={f.mono(700, 14)}>{tAvg.toFixed(1)}°</text>

                    <text x={px + 12} y={py + 70} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>coolest</text>
                    <text x={px + pw - 12} y={py + 70} textAnchor="end" fill={okC}
                      style={f.mono(700, 14)}>{tMin.toFixed(1)}°</text>

                    <text x={px + 12} y={py + 96} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>hottest</text>
                    <text x={px + pw - 12} y={py + 96} textAnchor="end" fill={A}
                      style={f.mono(700, 14)}>{tMax.toFixed(1)}°</text>

                    <text x={px + 12} y={py + 122} fill={T.mute}
                      style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>spread</text>
                    <text x={px + pw - 12} y={py + 122} textAnchor="end" fill={C}
                      style={f.mono(700, 14)}>{(tMax - tMin).toFixed(1)}°</text>

                    <line x1={px + 10} y1={py + 138} x2={px + pw - 10} y2={py + 138}
                      stroke={T.rule22} strokeWidth="0.6" />

                    <text x={px + pw / 2} y={py + 160} textAnchor="middle" fill={T.mute}
                      style={f.mono(500, 8.5, { upper: true, tracking: 0.18 })}>hover a tile</text>
                    <text x={px + pw / 2} y={py + 174} textAnchor="middle" fill={T.mute}
                      style={f.mono(500, 8.5, { upper: true, tracking: 0.18 })}>for details</text>
                  </g>
                )}
              </g>
            );
          })()}
        </svg>
      </Field>
      <Readout items={[
        { l: "Coolest", v: tMin.toFixed(1) + "°", color: okC },
        { l: "Hottest", v: tMax.toFixed(1) + "°", color: A },
        { l: "Spread", v: (tMax - tMin).toFixed(1) + "°" },
      ]} />

      <Caption color={C}>
        Paved surfaces in the sun get much hotter than shaded ones. The map
        shows surface temperature for each block on a small campus. Hover any
        tile to see its reading; the difference between sunny pavement and
        tree shade is several degrees.
      </Caption>
    </div>
  );
}

export { ExtraHeatGrid };
