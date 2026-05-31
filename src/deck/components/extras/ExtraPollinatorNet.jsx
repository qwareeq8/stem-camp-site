// ExtraPollinatorNet component for the STEM Camp interactive deck.
import { useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Tag } from "../../ui/primitives.jsx";

function ExtraPollinatorNet() {
  // TTT-07 "Networks, not single plants" (concept 1). Sibling ExtraClump is the
  // spatial foraging model. This is the SEASONAL network: pollinators need food
  // all season, so a habitat must have something in bloom from spring to fall.
  // Toggle plants and watch the bloom calendar; a gap with no flowers starves
  // the pollinators active then.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const PLANTS = [
    { id: "willow", n: "willow", s: 0.00, e: 0.20 },
    { id: "clover", n: "clover", s: 0.18, e: 0.50 },
    { id: "coneflower", n: "coneflower", s: 0.38, e: 0.64 },
    { id: "beebalm", n: "bee balm", s: 0.52, e: 0.74 },
    { id: "goldenrod", n: "goldenrod", s: 0.66, e: 0.88 },
    { id: "aster", n: "aster", s: 0.80, e: 1.00 },
  ];
  const POLL = [
    { n: "mason bee", s: 0.00, e: 0.34 },
    { n: "honeybee", s: 0.06, e: 0.96 },
    { n: "butterfly", s: 0.44, e: 1.00 },
  ];
  const [on, setOn] = useState(() => PLANTS.map((p) => p.id));
  const [playing, setPlaying] = useState(true);
  const [clk, setClk] = useState(0);
  useRAF(playing, (dt) => setClk((v) => (v + dt * 0.00016) % 1));
  const toggle = (id) => setOn((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const sel = PLANTS.filter((p) => on.includes(p.id));

  // coverage sampling
  const M = 120;
  const cov = Array.from({ length: M + 1 }, (_, k) => sel.some((p) => k / M >= p.s && k / M <= p.e));
  const covPct = Math.round((cov.filter(Boolean).length / (M + 1)) * 100);
  // runs for the food strip
  const runs = []; let st = 0;
  for (let k = 1; k <= M; k++) { if (cov[k] !== cov[st] || k === M) { runs.push({ a: st / M, b: k / M, c: cov[st] }); st = k; } }
  // biggest gap (weeks, season ~ 32 wk)
  let gap = 0, run = 0;
  for (let k = 0; k <= M; k++) { if (!cov[k]) { run++; gap = Math.max(gap, run); } else run = 0; }
  const gapWk = Math.round((gap / M) * 32);
  // pollinators fed (whole active window covered)
  const fed = POLL.filter((p) => { for (let k = 0; k <= M; k++) { const x = k / M; if (x >= p.s && x <= p.e && !cov[k]) return false; } return true; });

  const X0 = 126, X1 = 422, W = X1 - X0;
  const px = (f) => X0 + f * W;
  const tier = covPct >= 95 ? okC : covPct >= 70 ? A : warnC;

  return (
    <div>
      <Field height={228}>
        <svg viewBox="0 0 440 228" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Networks, not single plants</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>something must bloom from spring to fall</text>

          {/* season bands */}
          {[["spring", X0, px(0.34)], ["summer", px(0.34), px(0.67)], ["fall", px(0.67), X1]].map((b, i) => (
            <text key={i} x={(b[1] + b[2]) / 2} y="44" textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>{b[0]}</text>
          ))}
          <line x1={px(0.34)} y1="48" x2={px(0.34)} y2="190" stroke={T.rule12} strokeWidth="0.8" strokeDasharray="2 3" />
          <line x1={px(0.67)} y1="48" x2={px(0.67)} y2="190" stroke={T.rule12} strokeWidth="0.8" strokeDasharray="2 3" />

          {/* plant rows (click to toggle) */}
          {PLANTS.map((p, i) => {
            const y = 60 + i * 18, isOn = on.includes(p.id);
            const blooming = isOn && clk >= p.s && clk <= p.e;
            return (
              <g key={p.id} data-plant={p.id} style={{ cursor: "pointer" }} onClick={() => toggle(p.id)}>
                <circle cx="24" cy={y - 3} r="3.2" fill={isOn ? C : "none"} stroke={isOn ? C : T.rule22} strokeWidth="1" />
                <text x="34" y={y} fill={isOn ? T.ink : T.mute}
                  style={{ ...f.sans(isOn ? 600 : 400, 11), textDecoration: isOn ? "none" : "line-through" }}>{p.n}</text>
                {isOn ? (
                  <rect x={px(p.s)} y={y - 9} width={Math.max(2, (p.e - p.s) * W)} height="11" rx="2.5"
                    fill={C} opacity={blooming ? 1 : 0.62} stroke={blooming ? A : "none"} strokeWidth={blooming ? 1.4 : 0} />
                ) : (
                  <rect x={px(p.s)} y={y - 9} width={Math.max(2, (p.e - p.s) * W)} height="11" rx="2.5"
                    fill="none" stroke={T.rule22} strokeWidth="1" strokeDasharray="3 3" />
                )}
              </g>
            );
          })}

          {/* food availability strip */}
          <text x="34" y="182" textAnchor="end" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>food</text>
          {runs.map((r, i) => (
            <rect key={i} x={px(r.a)} y="172" width={Math.max(0.5, (r.b - r.a) * W)} height="12"
              fill={r.c ? okC : warnC} opacity={r.c ? 0.85 : 0.9} />
          ))}
          {runs.filter((r) => !r.c && (r.b - r.a) > 0.04).map((r, i) => (
            <text key={"g" + i} x={px((r.a + r.b) / 2)} y="181" textAnchor="middle" fill={T.paper} style={f.mono(700, 7, { upper: true })}>gap</text>
          ))}

          {/* time cursor */}
          <line x1={px(clk)} y1="48" x2={px(clk)} y2="190" stroke={A} strokeWidth="1.4" />
          <circle cx={px(clk)} cy="48" r="3" fill={A} />
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small icon={playing ? Pause : Play} color={C} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "season running" : "paused"}</Btn>
        <Btn small icon={RotateCcw} color={C} onClick={() => setOn(PLANTS.map((p) => p.id))}>all plants</Btn>
        <Tag color={C} style={{ marginLeft: 2 }}>click a plant to add or remove</Tag>
      </div>

      <Readout items={[
        { l: "Season covered", v: covPct + "%", color: tier },
        { l: "Biggest gap", v: gapWk === 0 ? "none" : gapWk + " wk", color: gapWk === 0 ? okC : warnC },
        { l: "Pollinators fed", v: fed.length + " / " + POLL.length, color: fed.length === POLL.length ? okC : warnC },
        { l: "In habitat", v: sel.length + " / " + PLANTS.length, color: C },
      ]} />

      <Caption color={C}>
        A pollinator habitat is a network across time, not a single showy bloom. Bees and
        butterflies need food every week they are active, so plants must hand off through spring,
        summer, and fall. Drop one and a gap can open in the calendar; any pollinator flying during
        that gap goes hungry. Aim for continuous bloom, not just the prettiest day.
      </Caption>
    </div>
  );
}

export { ExtraPollinatorNet };
