// ExtraCER component for the STEM Camp interactive deck.
import { useState } from "react";
import { Crosshair, Hash, Microscope, Network } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

function ExtraCER() {
  // TTT-10 "Claim, evidence, reasoning" (concept 2). Sibling DemoTreering owns
  // the ring-core reader (proxy data). This is the ARGUMENT builder: a claim is
  // only strong when specific evidence and the reasoning that links it to the
  // claim are both present. Drop any link and the argument collapses.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const [claim, setClaim] = useState(true);
  const [evid, setEvid] = useState(true);
  const [reas, setReas] = useState(true);
  const [specific, setSpecific] = useState(true);
  const [clk, setClk] = useState(0);

  const n = (claim ? 1 : 0) + (evid ? 1 : 0) + (reas ? 1 : 0);
  const complete = n === 3;
  const strength = complete ? (specific ? 100 : 70) : n === 2 ? 45 : n === 1 ? 18 : 0;

  const judge = () => {
    if (complete) return specific
      ? { v: "complete argument", d: ["Claim, evidence, and", "reasoning all connect."], fix: "ready to defend" }
      : { v: "needs specifics", d: ["Cite the exact rings,", "not a vague impression."], fix: "make evidence specific" };
    if (n === 2) {
      if (claim && evid) return { v: "unjustified leap", d: ["Data and a claim, but the", "link is left unstated."], fix: "add reasoning" };
      if (claim && reas) return { v: "opinion", d: ["Reasoning with no data", "is just assertion."], fix: "add evidence" };
      return { v: "no claim", d: ["Analysis that never", "answers the question."], fix: "state a claim" };
    }
    if (n === 1) {
      if (claim) return { v: "bare assertion", d: ["A claim by itself", "is only an opinion."], fix: "add evidence + reasoning" };
      if (evid) return { v: "data dump", d: ["Raw data with no", "point and no link."], fix: "add a claim + reasoning" };
      return { v: "principle only", d: ["A rule with nothing", "to apply it to."], fix: "add a claim + evidence" };
    }
    return { v: "empty", d: ["Nothing to evaluate yet.", "Start with a claim."], fix: "start with a claim" };
  };
  const J = judge();
  const tier = strength >= 70 ? okC : strength >= 40 ? A : warnC;
  const missing = [!claim && "claim", !evid && "evidence", !reas && "reasoning"].filter(Boolean);
  const missStr = missing.length ? missing.join(", ") : (complete && !specific ? "specifics" : "none");

  useRAF(complete, (dt) => setClk((v) => (v + dt * 0.004) % 1));

  // ---- chain cards (top to bottom: claim, reasoning, evidence) ----
  const cards = [
    { y: 46, label: "CLAIM", on: claim, lines: ["A multi-year drought hit", "this tree around 1967."] },
    { y: 108, label: "REASONING", on: reas, lines: ["Narrow rings mean weak growth,", "so a run of them signals drought."] },
    { y: 170, label: "EVIDENCE", on: evid, lines: specific ? ["Rings 23 to 30 are the", "narrowest in the whole core."] : ["Some rings look a little", "thin in the middle part."] },
  ];
  // connectors: evidence(bottom)->reasoning, reasoning->claim
  const connER = evid && reas;   // evidence -> reasoning intact
  const connRC = reas && claim;  // reasoning -> claim intact
  const dashoff = -(clk * 14);

  const conn = (yTop, yBot, intact, key) => {
    const xm = 129;
    if (intact) {
      return (
        <g key={key}>
          <line x1={xm} y1={yBot} x2={xm} y2={yTop + 4} stroke={C} strokeWidth="2"
            strokeDasharray={complete ? "4 3" : "0"} strokeDashoffset={complete ? dashoff : 0} />
          <path d={"M " + (xm - 4) + " " + (yTop + 7) + " L " + xm + " " + (yTop + 1) + " L " + (xm + 4) + " " + (yTop + 7)} fill="none" stroke={C} strokeWidth="2" />
        </g>
      );
    }
    return (
      <g key={key}>
        <line x1={xm} y1={yBot} x2={xm} y2={yTop + 4} stroke={warnC} strokeWidth="1.6" strokeDasharray="2 3" opacity="0.9" />
        <line x1={xm - 6} y1={(yTop + yBot) / 2 - 1} x2={xm + 6} y2={(yTop + yBot) / 2 - 5} stroke={warnC} strokeWidth="1.6" />
        <line x1={xm - 6} y1={(yTop + yBot) / 2 + 5} x2={xm + 6} y2={(yTop + yBot) / 2 + 1} stroke={warnC} strokeWidth="1.6" />
      </g>
    );
  };

  return (
    <div>
      <Field height={250}>
        <svg viewBox="0 0 440 250" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="19" fill={C} style={f.mono(700, 12.5, { upper: true, tracking: 0.04 })}>Claim, evidence, reasoning</text>
          <text x="20" y="32" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.12 })}>an argument is only as strong as its weakest link</text>

          {/* ===== LEFT: the CER chain ===== */}
          {conn(92, 108, connRC, "rc")}
          {conn(154, 170, connER, "er")}
          {cards.map((cd) => {
            const x = 22, w = 214, h = 46;
            return (
              <g key={cd.label}>
                <rect x={x} y={cd.y} width={w} height={h} rx="3"
                  fill={cd.on ? T.paper2 : T.paper}
                  stroke={cd.on ? C : T.rule22} strokeWidth={cd.on ? 1.4 : 1}
                  strokeDasharray={cd.on ? "0" : "4 3"} />
                <rect x={x} y={cd.y} width="4" height={h} rx="2" fill={cd.on ? C : T.rule22} />
                <text x={x + 14} y={cd.y + 16} fill={cd.on ? C : T.mute} style={f.mono(700, 9.5, { upper: true, tracking: 0.12 })}>{cd.label}</text>
                {cd.on ? (
                  <>
                    <path d={"M " + (x + 195) + " " + (cd.y + 10) + " l 3 3 l 6 -7"} fill="none" stroke={okC} strokeWidth="1.8" />
                    <text x={x + 14} y={cd.y + 30} fill={T.ink} style={f.sans(400, 9.5, { lh: 1.3 })}>{cd.lines[0]}</text>
                    <text x={x + 14} y={cd.y + 40} fill={T.ink} style={f.sans(400, 9.5, { lh: 1.3 })}>{cd.lines[1]}</text>
                  </>
                ) : (
                  <>
                    <line x1={x + 195} y1={cd.y + 8} x2={x + 203} y2={cd.y + 16} stroke={warnC} strokeWidth="1.6" />
                    <line x1={x + 203} y1={cd.y + 8} x2={x + 195} y2={cd.y + 16} stroke={warnC} strokeWidth="1.6" />
                    <text x={x + 14} y={cd.y + 32} fill={T.mute} style={f.sans(400, 11, { italic: true })}>(not provided)</text>
                  </>
                )}
              </g>
            );
          })}

          {/* ===== RIGHT: strength gauge ===== */}
          <rect x="262" y="46" width="162" height="170" rx="4" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="278" y="66" fill={T.mute} style={f.mono(600, 9, { upper: true, tracking: 0.1 })}>argument strength</text>
          <text x="278" y="100" fill={tier} style={f.display(700, 30, { opsz: 60 })}>{strength}%</text>
          <rect x="278" y="110" width="130" height="9" rx="4.5" fill={T.rule12} />
          <rect x="278" y="110" width={Math.max(0, 130 * strength / 100)} height="9" rx="4.5" fill={tier} />
          <text x="278" y="144" fill={tier} style={f.mono(700, 12)}>{J.v}</text>
          <text x="278" y="160" fill={T.mute} style={f.sans(400, 9, { lh: 1.3 })}>{J.d[0]}</text>
          <text x="278" y="171" fill={T.mute} style={f.sans(400, 9, { lh: 1.3 })}>{J.d[1]}</text>
          {/* C/E/R status dots */}
          {[{ l: "C", on: claim, x: 290 }, { l: "E", on: evid, x: 330 }, { l: "R", on: reas, x: 370 }].map((s) => (
            <g key={s.l}>
              <circle cx={s.x} cy="196" r="9" fill={s.on ? C : "none"} stroke={s.on ? C : T.rule22} strokeWidth="1.4" />
              <text x={s.x} y="200" textAnchor="middle" fill={s.on ? T.paper : T.mute} style={f.mono(700, 10)}>{s.l}</text>
            </g>
          ))}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small icon={Crosshair} color={C} active={claim} onClick={() => setClaim((v) => !v)}>claim</Btn>
        <Btn small icon={Microscope} color={C} active={evid} onClick={() => setEvid((v) => !v)}>evidence</Btn>
        <Btn small icon={Network} color={C} active={reas} onClick={() => setReas((v) => !v)}>reasoning</Btn>
        <Btn small icon={Hash} color={A} active={specific} disabled={!evid} onClick={() => setSpecific((v) => !v)}>{specific ? "specific" : "vague"}</Btn>
      </div>

      <Readout items={[
        { l: "Parts present", v: n + " / 3", color: tier },
        { l: "Strength", v: strength + "%", color: tier },
        { l: "Missing", v: missStr, color: missing.length || (complete && !specific) ? warnC : okC },
        { l: "Next step", v: J.fix, color: C },
      ]} />

      <Caption color={C}>
        A scientific argument is a claim backed by specific evidence and the reasoning that links
        them. Drop any part and it collapses: a claim alone is an opinion, data alone is a dump,
        reasoning alone is abstract. In the tree-ring game you cite the exact narrow rings
        (evidence) and explain that narrow rings mean a poor growing season (reasoning) to support
        the claim that a drought struck.
      </Caption>
    </div>
  );
}

export { ExtraCER };
