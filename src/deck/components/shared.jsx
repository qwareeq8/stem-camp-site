// Illustration helper and the campus heat-grid helpers shared by a few science components.
import { T, f } from "../theme.js";
import { Field } from "../ui/primitives.jsx";

function Ill({ children, h = 180 }) { return <div><Field height={h}>{children}</Field></div>; }
const CAMPUS_MAP_LAYOUT = [
  // rows x cols. types: "P" = paved, "L" = lawn, "T" = tree-shaded, "B" = building shadow
  ["P", "P", "L", "P", "L", "P"],
  ["P", "T", "T", "P", "T", "P"],
  ["B", "T", "L", "T", "T", "B"],
  ["P", "P", "P", "P", "P", "P"],
];
const CAMPUS_BASE_TEMP = {
  P: 38,   // paved: hot
  L: 33,   // lawn: warm
  T: 27,   // tree-shaded: cool
  B: 29,   // building shadow: cool
};
const CAMPUS_TYPE_LABEL = { P: "paved", L: "lawn", T: "tree", B: "building" };
const campusGrid = () =>
  CAMPUS_MAP_LAYOUT.map((row, r) =>
    row.map((kind, c) => ({
      kind,
      temp: CAMPUS_BASE_TEMP[kind] + ((r * 7 + c * 11) % 5) * 0.4,
    })));
function heatColor(temp) {
  const tMin = 27, tMax = 40;
  const t = Math.max(0, Math.min(1, (temp - tMin) / (tMax - tMin)));
  // 3-stop ramp: green -> amber -> red
  const stops = [
    { p: 0.0, c: [62, 107, 60] },     // deep green
    { p: 0.5, c: [214, 161, 78] },    // amber
    { p: 1.0, c: [196, 69, 44] },     // red
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let k = 0; k < stops.length - 1; k++) {
    if (t >= stops[k].p && t <= stops[k + 1].p) { lo = stops[k]; hi = stops[k + 1]; break; }
  }
  const span = hi.p - lo.p;
  const u = span > 0 ? (t - lo.p) / span : 0;
  const rgb = [0, 1, 2].map((i) => Math.round(lo.c[i] + (hi.c[i] - lo.c[i]) * u));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}
const TYPE_CHIP_COLOR = {
  P: "#7a7470",   // paved -> warm gray
  L: "#a5c34d",   // lawn  -> lime
  T: "#2e6b3f",   // tree  -> deep moss
  B: "#5b6878",   // building -> slate blue
};
function TypeGlyph({ kind, gx, gy }) {
  const w = 14, h = 10;
  return (
    <g transform={`translate(${gx} ${gy})`}>
      <rect x={0} y={0} width={w} height={h} rx={2}
        fill={TYPE_CHIP_COLOR[kind]} stroke={T.ink} strokeWidth="0.4" />
      <text x={w / 2} y={h - 2.5} textAnchor="middle" fill={T.paper}
        style={f.mono(700, 7.5, { upper: true, tracking: 0.18 })}>{kind}</text>
    </g>
  );
}
function HeatTile({ x, y, w, h, kind, temp, highlight, onPointer, onLeave, faded, showText = true }) {
  const bg = heatColor(temp);
  const isDark = temp >= 33;    // text/glyph contrast
  const textColor = isDark ? T.paper : T.ink;
  const opacity = faded ? 0.55 : 1;
  return (
    <g style={{ cursor: onPointer ? "pointer" : "default" }}
       onPointerEnter={onPointer} onPointerLeave={onLeave}>
      <rect x={x} y={y} width={w} height={h}
        fill={bg} stroke={highlight ? T.ink : T.paper}
        strokeWidth={highlight ? 1.8 : 0.8} opacity={opacity} />
      {/* type chip: top-left corner */}
      <TypeGlyph kind={kind} gx={x + 4} gy={y + 4} />
      {/* temperature: centered, large */}
      {showText && (
        <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle"
          fill={textColor} opacity={opacity}
          style={f.mono(700, 14, { tracking: 0.1 })}>
          {temp.toFixed(0)}°
        </text>
      )}
    </g>
  );
}

export { Ill, CAMPUS_MAP_LAYOUT, CAMPUS_BASE_TEMP, CAMPUS_TYPE_LABEL, campusGrid, heatColor, TYPE_CHIP_COLOR, TypeGlyph, HeatTile };
