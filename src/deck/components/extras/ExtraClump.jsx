// ExtraClump component for the STEM Camp interactive deck.
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraClump() {
  // TTT-07 "Native and clumping logic" (concept 2). Sibling ExtraPollinatorNet
  // is the pollinator-flower network. This is FORAGING EFFICIENCY: a bee works a
  // nearest-flower route. Clumped planting shortens the hops, so the bee spends
  // its time feeding and visits many flowers; scattered planting wastes time in
  // flight. Clumping cuts the search/travel cost.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, bee = "#d39a3a";
  const [clump, setClump] = useState(100);
  const [playing, setPlaying] = useState(true);
  const [clk, setClk] = useState(0);

  const N = 15;
  const t = clump / 100;
  const pos = Array.from({ length: N }, (_, i) => {
    const sx = 30 + (0.5 + 0.5 * Math.sin(i * 12.9898 + 1)) * 206;
    const sy = 54 + (0.5 + 0.5 * Math.sin(i * 78.233 + 2)) * 148;
    const cx = 135 + Math.sin(i * 5.1) * 34, cy = 130 + Math.cos(i * 3.7) * 30;
    return { x: sx + (cx - sx) * t, y: sy + (cy - sy) * t };
  });

  // nearest-neighbor foraging tour
  const order = [0]; const used = new Set([0]); let cur = 0, tourLen = 0;
  while (order.length < N) {
    let best = -1, bd = 1e9;
    for (let j = 0; j < N; j++) {
      if (used.has(j)) continue;
      const d = Math.hypot(pos[j].x - pos[cur].x, pos[j].y - pos[cur].y);
      if (d < bd) { bd = d; best = j; }
    }
    order.push(best); used.add(best); tourLen += bd; cur = best;
  }
  const avgHop = tourLen / (N - 1);
  const feedT = 2.0, flyPerPx = 0.045;
  const tPer = feedT + avgHop * flyPerPx;
  const perMin = Math.round(60 / tPer);
  const feedPct = Math.round((feedT / tPer) * 100);
  const flyPct = 100 - feedPct;
  const layout = clump < 34 ? "scattered" : clump < 67 ? "mixed" : "clumped";

  useRAF(playing, (dt) => setClk((v) => (v + dt * 0.00018) % 1));

  // bee position along the tour
  const target = clk * tourLen; let acc = 0, bx = pos[order[0]].x, by = pos[order[0]].y, vis = 1;
  for (let k = 0; k < order.length - 1; k++) {
    const aP = pos[order[k]], bP = pos[order[k + 1]], d = Math.hypot(bP.x - aP.x, bP.y - aP.y);
    if (acc + d >= target) { const fr = (target - acc) / (d || 1); bx = aP.x + (bP.x - aP.x) * fr; by = aP.y + (bP.y - aP.y) * fr; vis = k + 1; break; }
    acc += d; bx = bP.x; by = bP.y; vis = k + 2;
  }
  const trail = order.slice(0, vis).map((idx) => pos[idx].x + "," + pos[idx].y).join(" ") + " " + bx + "," + by;

  return (
    <div>
      <Field height={226}>
        <svg viewBox="0 0 440 226" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="16" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Native + clumping logic</text>
          <text x="20" y="28" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.1 })}>a bee works the nearest flower next</text>

          {/* ===== LEFT: garden + foraging route ===== */}
          <rect x="16" y="34" width="236" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {/* bee trail */}
          <polyline points={trail} fill="none" stroke={A} strokeWidth="1.3" opacity="0.5" strokeLinejoin="round" />
          {/* flowers */}
          {pos.map((p, i) => {
            const done = order.slice(0, vis).includes(i);
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill={C} opacity={done ? 1 : 0.8} style={{ transition: "cx .4s, cy .4s" }} />
                {done && <circle cx={p.x} cy={p.y} r="2" fill={A} style={{ transition: "cx .4s, cy .4s" }} />}
              </g>
            );
          })}
          {/* bee */}
          <g style={{ transition: "none" }}>
            <ellipse cx={bx - 2.5} cy={by - 3} rx="3" ry="1.8" fill="#e7e0cf" opacity="0.9" transform={"rotate(-25 " + bx + " " + by + ")"} />
            <ellipse cx={bx + 2.5} cy={by - 3} rx="3" ry="1.8" fill="#e7e0cf" opacity="0.9" transform={"rotate(25 " + bx + " " + by + ")"} />
            <circle cx={bx} cy={by} r="3.6" fill={bee} stroke={T.ink} strokeWidth="0.8" />
          </g>

          {/* ===== RIGHT: foraging budget ===== */}
          <rect x="260" y="34" width="164" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="272" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>foraging rate</text>
          <text x="272" y="88" fill={perMin >= 14 ? okC : warnC} style={f.display(700, 27, { opsz: 54 })}>{perMin}</text>
          <text x="272" y="104" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.08 })}>flowers per minute</text>
          {/* time budget */}
          <text x="272" y="130" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.1 })}>time budget</text>
          <rect x="272" y="136" width={Math.max(0, 138 * feedPct / 100)} height="14" rx="2" fill={okC} />
          <rect x={272 + 138 * feedPct / 100} y="136" width={Math.max(0, 138 * flyPct / 100)} height="14" rx="2" fill={A} opacity="0.85" />
          <text x="272" y="166" fill={okC} style={f.mono(700, 9)}>{feedPct}% feeding</text>
          <text x="410" y="166" textAnchor="end" fill={A} style={f.mono(700, 9)}>{flyPct}% flying</text>
          <text x="272" y="192" fill={T.ink} style={f.mono(600, 9.5)}>avg hop {Math.round(avgHop)} px</text>
          <text x="272" y="208" fill={T.mute} style={f.sans(400, 8.5, { lh: 1.3 })}>less travel, more feeding</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Slider val={clump} set={setClump} min={0} max={100} step={1} color={C} label="Clumping" suffix={clump + "%"} />
        <Btn small icon={playing ? Pause : Play} color={C} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "foraging" : "paused"}</Btn>
      </div>

      <Readout items={[
        { l: "Flowers / min", v: perMin, color: perMin >= 14 ? okC : warnC },
        { l: "Layout", v: layout, color: clump >= 67 ? okC : clump < 34 ? warnC : A },
        { l: "Avg hop", v: Math.round(avgHop) + " px", color: C },
        { l: "Feeding", v: feedPct + "%", color: feedPct >= 55 ? okC : warnC },
      ]} />

      <Caption color={C}>
        A pollinator works the nearest flower it can find, so the layout decides how much time it
        wastes flying. Plant the same flowers in clumps and the hops between them shrink: the bee
        feeds more and travels less, visiting far more flowers per minute. Scatter them and most of
        its energy goes into flight. Native clumps are easy for local pollinators to find and work.
      </Caption>
    </div>
  );
}

export { ExtraClump };
