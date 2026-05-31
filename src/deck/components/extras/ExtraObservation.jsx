// ExtraObservation component for the STEM Camp interactive deck.
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

function ExtraObservation() {
  // TTT-08 "Observation as evidence" (concept 1). Sibling ExtraFoodWeb is the
  // trophic energy web. This is the DICHOTOMOUS KEY: identifying a tree is
  // detective work, turning observed clues (leaf, bark, lobes) into a series of
  // either/or choices that narrow the candidates down to one name.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const NODES = {
    q1: { q: "Leaves needle-like?", a: { l: "needle-like", to: "q2" }, b: { l: "broad, flat", to: "q3" } },
    q2: { q: "Needles clustered?", a: { l: "in clusters", to: "pine" }, b: { l: "single", to: "q4" } },
    q4: { q: "Needles flat, soft?", a: { l: "flat, soft", to: "fir" }, b: { l: "sharp, square", to: "spruce" } },
    q3: { q: "Leaf edge lobed?", a: { l: "lobed", to: "q5" }, b: { l: "smooth edge", to: "q6" } },
    q5: { q: "Lobes pointed?", a: { l: "pointed lobes", to: "redoak" }, b: { l: "rounded lobes", to: "whiteoak" } },
    q6: { q: "Leaf heart-shaped?", a: { l: "heart-shaped", to: "redbud" }, b: { l: "papery bark", to: "birch" } },
  };
  const SP = [["pine", "Pine"], ["fir", "Fir"], ["spruce", "Spruce"], ["redoak", "Red oak"], ["whiteoak", "White oak"], ["redbud", "Redbud"], ["birch", "Birch"]];
  const NAME = {}; SP.forEach(([k, v]) => { NAME[k] = v; });
  const leavesUnder = (id) => NODES[id] ? [...leavesUnder(NODES[id].a.to), ...leavesUnder(NODES[id].b.to)] : [id];

  const [cur, setCur] = useState("q1");
  const [clues, setClues] = useState([]);
  const isLeaf = !NODES[cur];
  const node = NODES[cur];
  const cand = leavesUnder(cur);
  const choose = (opt) => { const br = node[opt]; setClues((c) => [...c, br.l]); setCur(br.to); };
  const restart = () => { setCur("q1"); setClues([]); };

  return (
    <div>
      <Field height={212}>
        <svg viewBox="0 0 440 212" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Observation as evidence</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>
            path: {clues.length ? clues.join("  ›  ") : "(start)"}
          </text>

          {/* ===== LEFT: candidates narrowing ===== */}
          <rect x="16" y="34" width="180" height="170" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="26" y="50" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>still possible</text>
          <text x="186" y="50" textAnchor="end" fill={cand.length === 1 ? okC : A} style={f.mono(700, 9.5)}>{cand.length}/7</text>
          {SP.map(([id, nm], i) => {
            const inC = cand.includes(id);
            const y = 68 + i * 19;
            return (
              <g key={id}>
                <circle cx="30" cy={y - 3} r="3.2" fill={inC ? C : "none"} stroke={inC ? C : T.rule22} strokeWidth="1" />
                <text x="42" y={y} fill={inC ? T.ink : T.mute}
                  style={{ ...f.sans(inC ? 600 : 400, 12), textDecoration: inC ? "none" : "line-through" }}>{nm}</text>
                {isLeaf && id === cur && <text x="178" y={y} textAnchor="end" fill={okC} style={f.mono(700, 8, { upper: true })}>this one</text>}
              </g>
            );
          })}

          {/* ===== RIGHT: question or result ===== */}
          <rect x="206" y="34" width="218" height="170" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {!isLeaf ? (
            <>
              <text x="222" y="58" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.12 })}>step {clues.length + 1}</text>
              <text x="222" y="92" fill={T.ink} style={f.display(500, 19, { italic: true, opsz: 40 })}>{node.q}</text>
              <text x="222" y="120" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.08 })}>choose the matching clue:</text>
              <g style={{ cursor: "pointer" }} onClick={() => choose("a")} data-choice="a">
                <rect x="222" y="132" width="186" height="26" rx="3" fill={T.paper} stroke={C} strokeWidth="1.2" />
                <text x="232" y="149" fill={C} style={f.mono(600, 11)}>{"▸ "}{node.a.l}</text>
              </g>
              <g style={{ cursor: "pointer" }} onClick={() => choose("b")} data-choice="b">
                <rect x="222" y="164" width="186" height="26" rx="3" fill={T.paper} stroke={A} strokeWidth="1.2" />
                <text x="232" y="181" fill={A} style={f.mono(600, 11)}>{"▸ "}{node.b.l}</text>
              </g>
            </>
          ) : (
            <>
              <path d="M222 54 l5 5 l9 -11" fill="none" stroke={okC} strokeWidth="2.4" />
              <text x="244" y="60" fill={okC} style={f.mono(700, 10, { upper: true, tracking: 0.12 })}>identified</text>
              <text x="222" y="104" fill={C} style={f.display(600, 30, { opsz: 60 })}>{NAME[cur]}</text>
              <text x="222" y="130" fill={T.mute} style={f.mono(500, 9)}>keyed out in {clues.length} either/or steps</text>
              <text x="222" y="156" fill={T.mute} style={f.sans(400, 9.5, { lh: 1.35 })}>evidence:</text>
              <text x="222" y="172" fill={T.ink} style={f.sans(400, 10, { lh: 1.35 })}>{clues.join(", ")}</text>
            </>
          )}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        {!isLeaf && <Btn small color={C} onClick={() => choose("a")}>{node.a.l}</Btn>}
        {!isLeaf && <Btn small color={A} onClick={() => choose("b")}>{node.b.l}</Btn>}
        <Btn small icon={RotateCcw} color={C} onClick={restart}>restart</Btn>
      </div>

      <Readout items={[
        { l: "Step", v: isLeaf ? "done" : clues.length + 1, color: isLeaf ? okC : C },
        { l: "Candidates", v: cand.length + " of 7", color: cand.length === 1 ? okC : A },
        { l: "Identified", v: isLeaf ? NAME[cur] : "-", color: isLeaf ? okC : T.mute },
        { l: "Clues used", v: clues.length ? clues.join(", ") : "none", color: C },
      ]} />

      <Caption color={C}>
        Identifying a tree is detective work. A dichotomous key turns what you observe, leaf shape,
        bark, lobes, into a chain of either/or choices, and each choice rules out half the
        candidates until one name is left. The answer is only as good as the evidence behind it.
      </Caption>
    </div>
  );
}

export { ExtraObservation };
