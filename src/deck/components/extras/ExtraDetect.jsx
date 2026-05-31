// ExtraDetect component for the STEM Camp interactive deck.
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

function ExtraDetect() {
  // Barcode-scanner detection demo. Each scan lands in one of four quadrants
  // of a confusion matrix. Correct outcomes are green; mistakes are red/copper.
  // Up to 40 chips per cell, tiled 10 wide x 4 tall.
  const [trials, setTrials] = useState([]);
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;
  const okC = T.ok;
  const failC = T.warn;

  const MAX_PER_CELL = 40;

  const add = (real, alarm) =>
    setTrials((arr) => [...arr, { real, alarm, id: Date.now() + Math.random() }]);
  const reset = () => setTrials([]);

  const tp = trials.filter((t) => t.real && t.alarm).length;
  const fp = trials.filter((t) => !t.real && t.alarm).length;
  const fn = trials.filter((t) => t.real && !t.alarm).length;
  const tn = trials.filter((t) => !t.real && !t.alarm).length;
  const total = trials.length;
  const hit = tp + fn ? Math.round((tp / (tp + fn)) * 100) : null;
  const falseAlarm = fp + tn ? Math.round((fp / (fp + tn)) * 100) : null;

  const last = trials[trials.length - 1];

  // ----- Geometry -----
  const W = 560, H = 320;
  const stripY = 18, stripH = 56;
  const matX = 100, matY = 116;
  const cellW = 180, cellH = 86;

  const cells = {
    TP: { row: 0, col: 0, color: okC,   label: "caught",      desc: "rejected a bad code",  count: tp },
    FP: { row: 0, col: 1, color: A,     label: "false alarm", desc: "rejected a good code", count: fp },
    FN: { row: 1, col: 0, color: failC, label: "miss",        desc: "passed a bad code",    count: fn },
    TN: { row: 1, col: 1, color: okC,   label: "passed",      desc: "passed a good code",   count: tn },
  };

  const cellOf = (t) => {
    if (t.real && t.alarm) return "TP";
    if (!t.real && t.alarm) return "FP";
    if (t.real && !t.alarm) return "FN";
    return "TN";
  };

  // Compact chip: 12 wide, 6 tall, with a 2.5 px outcome dot at the corner
  const Chip = ({ x, y, ok }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={12} height={6} rx={1}
        fill={T.paper} stroke={T.ink} strokeWidth="0.5" />
      {[2, 4, 6, 8, 10].map((sx, k) => (
        <line key={k} x1={sx} y1={1} x2={sx} y2={5} stroke={T.ink}
          strokeWidth={k % 2 === 0 ? 0.5 : 0.35} />
      ))}
      <circle cx={12} cy={1} r={2} fill={ok ? okC : failC} stroke={T.ink} strokeWidth="0.35" />
    </g>
  );

  // Chip layout: 10 columns x 4 rows = 40
  const COLS = 10;
  const CHIP_W = 16;     // 12 + dot overhang
  const CHIP_DX = 16;    // column step
  const CHIP_DY = 11;    // row step
  const chipsForCell = (k) => {
    const cell = cells[k];
    const slots = trials
      .map((t, idx) => ({ t, idx }))
      .filter(({ t }) => cellOf(t) === k);
    const shown = slots.slice(-MAX_PER_CELL);
    return shown.map(({ t }, slot) => {
      const col = slot % COLS;
      const row = Math.floor(slot / COLS);
      return {
        id: t.id,
        x: matX + cell.col * cellW + 8 + col * CHIP_DX,
        y: matY + cell.row * cellH + 30 + row * CHIP_DY,
        ok: cell.color === okC,
      };
    });
  };

  return (
    <div>
      <Field height={330}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* ================ SCANNER STRIP ================ */}
          <rect x={20} y={stripY} width={W - 40} height={stripH}
            rx={8} fill={T.paper2} stroke={C} strokeWidth="1.1" />
          <text x={32} y={stripY + 16} fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>scanner</text>
          <g transform={`translate(58 ${stripY + 30})`}>
            <rect x={0} y={-10} width={26} height={20} rx={3}
              fill={C} stroke={T.ink} strokeWidth="1" />
            <polygon points="26,-7 50,-14 50,14 26,7" fill={A} opacity="0.45" />
            <line x1={50} y1={-14} x2={50} y2={14} stroke={A} strokeWidth="1.2" />
          </g>
          {last ? (
            <g transform={`translate(150 ${stripY + 18})`}>
              <rect x={0} y={0} width={70} height={24} rx={2}
                fill={T.paper} stroke={T.ink} strokeWidth="0.7" />
              {[6, 10, 14, 20, 26, 32, 38, 46, 52, 58, 64].map((sx, k) => (
                <line key={k} x1={sx} y1={2} x2={sx} y2={22}
                  stroke={T.ink} strokeWidth={k % 3 === 0 ? 1.4 : 0.6} />
              ))}
              <text x={84} y={16} fill={last.real ? failC : okC}
                style={f.mono(700, 11, { upper: true, tracking: 0.16 })}>
                {last.real ? "bad" : "good"}
              </text>
              <text x={120} y={16} fill={T.mute} style={f.mono(700, 14)}>→</text>
              <text x={138} y={16} fill={last.alarm ? failC : okC}
                style={f.mono(700, 11, { upper: true, tracking: 0.16 })}>
                {last.alarm ? "reject" : "pass"}
              </text>
              <circle cx={210} cy={12} r={8}
                fill={cells[cellOf(last)].color === okC ? okC : (cells[cellOf(last)].color === A ? A : failC)}
                stroke={T.ink} strokeWidth="0.8" />
              <text x={232} y={16} fill={T.ink}
                style={f.mono(700, 11, { upper: true, tracking: 0.18 })}>
                {cellOf(last)} · {cells[cellOf(last)].label}
              </text>
            </g>
          ) : (
            <text x={150} y={stripY + 32} fill={T.mute}
              style={f.mono(500, 10, { upper: true, tracking: 0.16 })}>
              click a button below to scan a code
            </text>
          )}
          <text x={W - 28} y={stripY + 22} textAnchor="end" fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>scanned</text>
          <text x={W - 28} y={stripY + 44} textAnchor="end" fill={C}
            style={f.mono(700, 18)}>{total}</text>

          {/* ================ MATRIX HEADERS ================ */}
          <text x={matX + cellW} y={matY - 32} textAnchor="middle" fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>truth</text>
          <text x={matX + cellW / 2} y={matY - 16} textAnchor="middle" fill={failC}
            style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>bad code</text>
          <text x={matX + cellW * 1.5} y={matY - 16} textAnchor="middle" fill={okC}
            style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>good code</text>

          <text x={matX - 60} y={matY + cellH} fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>scanner</text>
          <text x={matX - 8} y={matY + cellH / 2 + 4} textAnchor="end" fill={failC}
            style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>reject</text>
          <text x={matX - 8} y={matY + cellH * 1.5 + 4} textAnchor="end" fill={okC}
            style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>pass</text>

          {/* ================ MATRIX CELLS ================ */}
          {Object.entries(cells).map(([k, cell]) => {
            const x = matX + cell.col * cellW;
            const y = matY + cell.row * cellH;
            const isGood = cell.color === okC;
            const bg = isGood ? "#e1ecd6" : (cell.color === A ? "#f1d8b8" : "#f0cdc3");
            const tone = cell.color;
            const overflow = cell.count - MAX_PER_CELL;
            return (
              <g key={k}>
                <rect x={x} y={y} width={cellW} height={cellH}
                  fill={bg} stroke={tone} strokeWidth="1.2" />
                <text x={x + 9} y={y + 16} fill={tone}
                  style={f.mono(700, 10, { upper: true, tracking: 0.22 })}>{k}</text>
                <text x={x + cellW - 12} y={y + 22} textAnchor="end" fill={tone}
                  style={f.mono(700, 20)}>{cell.count}</text>
                <text x={x + 9} y={y + cellH - 7} fill={T.mute}
                  style={f.mono(500, 8.5, { upper: true, tracking: 0.16 })}>{cell.desc}</text>
                {chipsForCell(k).map((c) => (
                  <Chip key={c.id} x={c.x} y={c.y} ok={isGood} />
                ))}
                {overflow > 0 && (
                  <text x={x + cellW - 9} y={y + cellH - 9} textAnchor="end" fill={tone}
                    style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>
                    +{overflow} more
                  </text>
                )}
              </g>
            );
          })}

          {/* ================ RATES PANEL (inside viewBox, below matrix headers row) ================ */}
          {(() => {
            const px = matX + cellW * 2 + 10;
            const py = matY;
            const pw = W - px - 10;
            const ph = cellH * 2;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" />
                <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>rates</text>

                <text x={px + 8} y={py + 40} fill={okC}
                  style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>hit</text>
                <text x={px + pw - 8} y={py + 40} textAnchor="end" fill={okC}
                  style={f.mono(700, 13)}>{hit == null ? "-" : hit + "%"}</text>
                <text x={px + 8} y={py + 52} fill={T.mute}
                  style={f.mono(500, 7, { upper: true, tracking: 0.14 })}>caught bad</text>

                <text x={px + 8} y={py + 84} fill={A}
                  style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>false</text>
                <text x={px + pw - 8} y={py + 84} textAnchor="end" fill={A}
                  style={f.mono(700, 13)}>{falseAlarm == null ? "-" : falseAlarm + "%"}</text>
                <text x={px + 8} y={py + 96} fill={T.mute}
                  style={f.mono(500, 7, { upper: true, tracking: 0.14 })}>wrong alarm</text>

                <text x={px + 8} y={py + 130} fill={T.ink}
                  style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>goal</text>
                <text x={px + 8} y={py + 144} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>high hit</text>
                <text x={px + 8} y={py + 156} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>low false</text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Btn small color={okC} onClick={() => add(true, true)}>bad → caught</Btn>
        <Btn small color={failC} onClick={() => add(true, false)}>bad → missed</Btn>
        <Btn small color={A} onClick={() => add(false, true)}>good → false alarm</Btn>
        <Btn small color={okC} onClick={() => add(false, false)}>good → passed</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Hit rate", v: hit == null ? "-" : hit + "%", color: okC },
        { l: "False alarm rate", v: falseAlarm == null ? "-" : falseAlarm + "%", color: A },
        { l: "Best", v: "high hit, low false" },
      ]} />

      <Caption color={C}>
        A scanner has to catch the bad codes without crying wolf on the good ones.
        Every scan lands in one of four boxes: caught a real bad code, missed a real
        bad code, raised a false alarm on a good code, or correctly passed a good
        code. The goal is a high hit rate with a low false-alarm rate.
      </Caption>
    </div>
  );
}

export { ExtraDetect };
