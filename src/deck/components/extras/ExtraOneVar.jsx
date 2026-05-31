// ExtraOneVar component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Btn, Caption, Field, Readout, Tag } from "../../ui/primitives.jsx";

function ExtraOneVar() {
  // TTT-03 "One variable at a time" (concept 2). Sibling DemoSamara is the
  // falling-seed physics. This is EXPERIMENT DESIGN: change exactly one variable
  // and the difference in hang time is attributable to it; change none and there
  // is no test; change two or more and the result is confounded.
  const C = CAMP.trees.ink, A = CAMP.trees.acc, brown = "#7a5732";
  const okC = T.ok, warnC = T.warn;
  const [vWing, setVWing] = useState(true);
  const [vMass, setVMass] = useState(false);
  const [vAngle, setVAngle] = useState(false);
  const VARS = [{ k: "wing", on: vWing, eff: 1.5, n: "wing length" }, { k: "mass", on: vMass, eff: -1.1, n: "added mass" }, { k: "angle", on: vAngle, eff: 0.7, n: "fold angle" }];
  const changed = VARS.filter((v) => v.on);
  const n = changed.length;
  const base = 3.0;
  const trial = Math.max(0.4, base + changed.reduce((s, v) => s + v.eff, 0));
  const valid = n === 1 ? "valid test" : n === 0 ? "no test" : "confounded";
  const vC = n === 1 ? okC : n === 0 ? T.mute : warnC;
  const attributed = n === 1 ? changed[0].n : n === 0 ? "nothing changed" : "unclear (" + n + " changed)";

  // seed drawing: same tapered-blade samara as DemoSamara (concept 1), for visual continuity
  const seed = (cx, cy, wl, ms, ang, hl) => { const L = wl, wWid = 5 + (wl - 24) * 0.16, bodyR = 4 + ms * 0.6; return (
    <g transform={"translate(" + cx + " " + cy + ") rotate(" + ang + ")"}>
      <path d={"M 0 0 Q " + (L * 0.5) + " " + (-wWid) + " " + L + " " + (-wWid * 0.4) + " Q " + (L * 0.95) + " 0 " + L + " " + (wWid * 0.4) + " Q " + (L * 0.5) + " " + wWid + " 0 0 Z"} fill={hl.wing ? A : C} opacity="0.92" stroke={T.ink} strokeWidth="0.5" />
      <line x1="0" y1="0" x2={L * 0.88} y2="0" stroke={T.ink} strokeWidth="0.4" opacity="0.5" />
      <ellipse cx="-3" cy="0" rx={bodyR} ry={bodyR * 0.72} fill={hl.mass ? A : brown} stroke={T.ink} strokeWidth="0.5" />
      {hl.angle && <path d="M 9 9 A 12 12 0 0 1 19 2" fill="none" stroke={A} strokeWidth="1.6" />}
    </g>
  ); };
  const baseHL = { wing: false, mass: false, angle: false };
  const trialHL = { wing: vWing, mass: vMass, angle: vAngle };
  const tWl = vWing ? 36 : 24, tMs = vMass ? 8 : 3, tAng = vAngle ? -30 : -12;

  const barW = (t) => Math.max(3, (t / 5.6) * 150);

  return (
    <div>
      <Field height={230}>
        <svg viewBox="0 0 440 230" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>One variable at a time</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>change one thing, or you cannot tell what mattered</text>

          {/* ===== LEFT: baseline vs trial seed ===== */}
          <rect x="16" y="34" width="224" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          <text x="28" y="58" fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>baseline</text>
          {seed(150, 80, 24, 3, -12, baseHL)}
          <line x1="28" y1="112" x2="228" y2="112" stroke={T.rule12} strokeWidth="1" strokeDasharray="3 3" />
          <text x="28" y="134" fill={n === 1 ? okC : n >= 2 ? warnC : T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>trial {"·"} {n} changed</text>
          {seed(150, 158, tWl, tMs, tAng, trialHL)}
          {/* changed tags */}
          <text x="28" y="206" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.06 })}>
            {n ? "changed: " + changed.map((v) => v.k).join(", ") : "changed: none"}
          </text>

          {/* ===== RIGHT: hang time + verdict ===== */}
          <rect x="248" y="34" width="176" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="260" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>hang time</text>
          {/* baseline bar */}
          <text x="260" y="78" fill={T.mute} style={f.mono(600, 8, { upper: true })}>baseline</text>
          <rect x="260" y="84" width={barW(base)} height="14" rx="2" fill={C} opacity="0.55" />
          <text x={264 + barW(base)} y="95" fill={C} style={f.mono(700, 9)}>{base.toFixed(1)}s</text>
          {/* trial bar */}
          <text x="260" y="118" fill={T.mute} style={f.mono(600, 8, { upper: true })}>trial</text>
          <rect x="260" y="124" width={barW(trial)} height="14" rx="2" fill={vC} opacity={n ? 0.9 : 0.4} />
          <text x={264 + barW(trial)} y="135" fill={vC} style={f.mono(700, 9)}>{trial.toFixed(1)}s</text>
          {/* verdict */}
          <rect x="260" y="152" width="150" height="22" rx="4" fill={vC} opacity="0.16" />
          <text x="335" y="167" textAnchor="middle" fill={vC} style={f.mono(700, 10, { upper: true, tracking: 0.06 })}>{valid}</text>
          <text x="260" y="192" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.06 })}>difference due to</text>
          <text x="260" y="205" fill={vC} style={f.mono(700, 9.5)}>{attributed}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small color={vWing ? A : C} active={vWing} onClick={() => setVWing((v) => !v)}>vary wing</Btn>
        <Btn small color={vMass ? A : C} active={vMass} onClick={() => setVMass((v) => !v)}>vary mass</Btn>
        <Btn small color={vAngle ? A : C} active={vAngle} onClick={() => setVAngle((v) => !v)}>vary angle</Btn>
        <Tag color={C} style={{ marginLeft: 2 }}>toggle what changes vs the baseline</Tag>
      </div>

      <Readout items={[
        { l: "Variables changed", v: n, color: vC },
        { l: "Experiment", v: valid, color: vC },
        { l: "Attributed to", v: attributed, color: vC },
        { l: "Trial hang", v: trial.toFixed(1) + "s (" + (trial >= base ? "+" : "") + (trial - base).toFixed(1) + ")", color: C },
      ]} />

      <Caption color={C}>
        To learn what a change does, hold everything constant and alter a single variable, then
        compare to the baseline. Change only the wing and any difference in hang time is the wing's
        doing. Change the wing and the mass at once and the seeds may fly differently, but you can
        no longer say which one caused it: the test is confounded.
      </Caption>
    </div>
  );
}

export { ExtraOneVar };
