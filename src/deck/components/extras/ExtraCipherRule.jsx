// ExtraCipherRule component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { FlipHorizontal2, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function ExtraCipherRule() {
  // PYB-05 "A cipher is a rule, not magic". A substitution cipher is one fixed,
  // reversible rule applied to every letter: slide the alphabet a set number of
  // steps (Caesar) or mirror it end to end (Atbash). The scanner sweeps the
  // alphabet to show that EVERY plain letter maps to its cipher letter by the
  // same rule, and the sample word is enciphered live.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const [mode, setMode] = useState("caesar"); // "caesar" | "atbash"
  const [shift, setShift] = useState(3);
  const SAMPLE = "CODE";

  // The rule: cipher letter for a plain-alphabet index.
  const enc = (i) => (mode === "atbash" ? AZ[25 - i] : AZ[(i + shift) % 26]);
  const ruleName = mode === "atbash" ? "Atbash mirror" : `Caesar shift ${shift}`;

  // A scanner head sweeps the 26 columns continuously so the mapping reads as a
  // rule, not a lookup. Position lives in a ref; the frame loop nudges it.
  const posRef = useRef(0);
  const [, force] = useState(0);
  useRAF(true, (dt) => {
    posRef.current = (posRef.current + dt / 150) % 26; // ~6.7 columns per second
    force((v) => v + 1);
  });
  const active = Math.floor(posRef.current) % 26;

  const x0 = 26, step = 16.4, colX = (i) => x0 + i * step + step / 2;
  const topY = 74, botY = 128;

  return (
    <div>
      <Field height={250}>
        <svg viewBox="0 0 460 232" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="20" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>A cipher is a rule</text>
          <text x="20" y="34" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.14 })}>one fixed rule maps every letter</text>
          <rect x="330" y="9" width="118" height="22" rx="4" fill={T.paper} stroke={A} strokeWidth="1.3" />
          <text x="389" y="24" textAnchor="middle" fill={A} style={f.mono(700, 10, { upper: true, tracking: 0.08 })}>{ruleName}</text>

          {/* row labels */}
          <text x="20" y={topY - 12} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>plain</text>
          <text x="20" y={botY + 26} fill={A} style={f.mono(700, 7.5, { upper: true, tracking: 0.1 })}>cipher</text>

          {/* the two alphabet tracks, column-aligned so top[i] maps straight down to bottom[i] */}
          {AZ.split("").map((ch, i) => {
            const on = i === active;
            const cx = colX(i);
            return (
              <g key={i}>
                {on && (
                  <line x1={cx} y1={topY + 8} x2={cx} y2={botY - 12} stroke={A} strokeWidth="1.4" opacity="0.9" />
                )}
                <rect x={cx - step / 2 + 1} y={topY - 11} width={step - 2} height={19} rx="2"
                  fill={on ? C : T.paper2} stroke={on ? C : T.rule22} strokeWidth={on ? 1.4 : 0.7} />
                <text x={cx} y={topY + 3} textAnchor="middle" fill={on ? T.paper : T.ink} style={f.mono(700, 10)}>{ch}</text>
                <rect x={cx - step / 2 + 1} y={botY - 8} width={step - 2} height={19} rx="2"
                  fill={on ? A : T.paper} stroke={on ? A : T.rule22} strokeWidth={on ? 1.4 : 0.7} />
                <text x={cx} y={botY + 6} textAnchor="middle" fill={on ? T.paper : C} style={f.mono(700, 10)}>{enc(i)}</text>
              </g>
            );
          })}

          {/* live mapping callout for the scanned letter */}
          <text x="230" y={botY + 40} textAnchor="middle" fill={C} style={f.mono(700, 13)}>
            {AZ[active]} <tspan fill={T.mute}>&#8594;</tspan> {enc(active)}
          </text>

          {/* sample word, enciphered live */}
          <text x="20" y={192} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.1 })}>sample</text>
          {SAMPLE.split("").map((ch, i) => {
            const bx = 96 + i * 34;
            return (
              <g key={i}>
                <rect x={bx} y={178} width={26} height={22} rx="3" fill={T.paper2} stroke={T.rule22} strokeWidth="0.8" />
                <text x={bx + 13} y={194} textAnchor="middle" fill={T.ink} style={f.mono(700, 13)}>{ch}</text>
              </g>
            );
          })}
          <text x="248" y="194" textAnchor="middle" fill={T.mute} style={f.mono(700, 13)}>&#8594;</text>
          {SAMPLE.split("").map((ch, i) => {
            const bx = 274 + i * 34;
            return (
              <g key={i}>
                <rect x={bx} y={178} width={26} height={22} rx="3" fill={T.paper} stroke={A} strokeWidth="1.2" />
                <text x={bx + 13} y={194} textAnchor="middle" fill={A} style={f.mono(700, 13)}>{enc(AZ.indexOf(ch))}</text>
              </g>
            );
          })}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={shift} set={setShift} min={1} max={25} step={1} color={A}
          label="Caesar shift" suffix={mode === "atbash" ? "off" : "+" + shift} />
        <Btn small icon={FlipHorizontal2} color={C} active={mode === "atbash"}
          onClick={() => setMode((m) => (m === "atbash" ? "caesar" : "atbash"))}>Atbash mirror</Btn>
        <Btn small icon={RotateCcw} onClick={() => { setMode("caesar"); setShift(3); }}>reset</Btn>
      </div>

      <Readout items={[
        { l: "Rule", v: ruleName, color: A },
        { l: "Sample", v: SAMPLE },
        { l: "Enciphered", v: SAMPLE.split("").map((ch) => enc(AZ.indexOf(ch))).join(""), color: C },
        { l: "To decode", v: "run the rule backward" },
      ]} />

      <Caption color={C}>
        A cipher is not magic, it is one fixed rule applied to every letter. Caesar slides the whole
        alphabet a set number of steps; Atbash mirrors it so A trades with Z and B with Y. Because the
        rule is the same everywhere, running it backward decodes the message. Writing a word backward or
        reading down the first letters of each line are the same idea: a rule you can undo.
      </Caption>
    </div>
  );
}

export { ExtraCipherRule };
