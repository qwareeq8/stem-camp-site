// ExtraEncode component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MORSE = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
};
// Classic 5x5 Polybius square, I and J share a cell.
const POLY = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
const DOT_MS = 240, DASH_MS = DOT_MS * 3, GAP_MS = DOT_MS, LETTER_GAP_MS = DOT_MS * 3;

function encodings(letter) {
  const i = AZ.indexOf(letter);
  const p = POLY.indexOf(letter === "J" ? "I" : letter);
  return {
    num: i + 1,
    morse: MORSE[letter],
    grid: `${Math.floor(p / 5) + 1}${(p % 5) + 1}`,
    bin: (i + 1).toString(2).padStart(5, "0"),
  };
}

// One letter's Morse as timed pulse segments, so the playhead and the pulse lane
// share a single timeline.
function morseSegments(letter) {
  const segs = [];
  let t = 0;
  const symbols = MORSE[letter].split("");
  symbols.forEach((s, k) => {
    const dur = s === "-" ? DASH_MS : DOT_MS;
    segs.push({ sym: s, start: t, end: t + dur });
    t += dur;
    if (k < symbols.length - 1) t += GAP_MS;
  });
  return { segs, total: t };
}

function ExtraEncode() {
  // PYB-05 "Codes swap symbols, not meaning". The same letter can be carried as a
  // number (A1Z26), Morse dots and dashes, a grid coordinate (Polybius), or five
  // bits. The telegraph transmits the sample word letter by letter, playing the
  // Morse in real time while every other encoding of the live letter lights up,
  // so the four codes read as different clothes on the same message.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const WORD = "CODE";
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);       // active letter index
  const tRef = useRef(0);                    // ms into the current letter timeline
  const [, force] = useState(0);

  const letter = WORD[idx];
  const enc = encodings(letter);
  const { segs, total } = morseSegments(letter);

  useRAF(playing, (dt) => {
    tRef.current += dt;
    if (tRef.current >= total + LETTER_GAP_MS) {
      tRef.current = 0;
      setIdx((v) => (v + 1) % WORD.length);
    }
    force((v) => v + 1);
  });

  const reset = () => { setPlaying(false); setIdx(0); tRef.current = 0; force((v) => v + 1); };
  const step = () => { tRef.current = 0; setIdx((v) => (v + 1) % WORD.length); };

  // Morse pulse-lane geometry.
  const laneX = 150, laneW = 288, laneY = 150, laneH = 26;
  const pxPerMs = laneW / Math.max(total, 1);
  const headX = laneX + Math.min(total, tRef.current) * pxPerMs;

  const chips = [
    { k: "number", v: enc.num, hint: "A=1 . Z=26" },
    { k: "grid", v: enc.grid, hint: "row, column" },
    { k: "binary", v: enc.bin, hint: "5 bits" },
  ];

  return (
    <div>
      <Field height={262}>
        <svg viewBox="0 0 460 246" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="20" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Codes swap symbols</text>
          <text x="20" y="34" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.14 })}>one letter, four codes, same meaning</text>

          {/* the word being transmitted */}
          {WORD.split("").map((ch, i) => {
            const on = i === idx;
            const bx = 150 + i * 42;
            return (
              <g key={i}>
                <rect x={bx} y={50} width={34} height={34} rx="4"
                  fill={on ? C : T.paper2} stroke={on ? C : T.rule22} strokeWidth={on ? 1.6 : 0.8} />
                <text x={bx + 17} y={73} textAnchor="middle" fill={on ? T.paper : T.ink} style={f.mono(700, 18)}>{ch}</text>
              </g>
            );
          })}
          <text x="20" y="72" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>message</text>

          {/* three static encodings of the live letter */}
          {chips.map((c, i) => {
            const cx = 20 + i * 150;
            return (
              <g key={c.k} transform={`translate(${cx} 100)`}>
                <rect x={0} y={0} width={132} height={30} rx="5" fill={T.paper} stroke={T.rule22} strokeWidth="0.9" />
                <text x={8} y={12} fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.14 })}>{c.k}</text>
                <text x={8} y={25} fill={C} style={f.mono(700, 13)}>{c.v}</text>
                <text x={124} y={25} textAnchor="end" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.08 })}>{c.hint}</text>
              </g>
            );
          })}

          {/* morse pulse lane with a live playhead */}
          <text x="20" y={laneY + 17} fill={A} style={f.mono(700, 8, { upper: true, tracking: 0.12 })}>morse</text>
          <rect x={laneX} y={laneY} width={laneW} height={laneH} rx="5" fill={T.paper2} stroke={T.rule22} strokeWidth="0.8" />
          {segs.map((s, k) => {
            const on = playing ? tRef.current >= s.start && tRef.current < s.end : false;
            const past = tRef.current >= s.end;
            const sx = laneX + s.start * pxPerMs, sw = (s.end - s.start) * pxPerMs;
            return (
              <rect key={k} x={sx} y={laneY + 5} width={Math.max(2, sw)} height={laneH - 10} rx="2.5"
                fill={on ? A : past ? "#d8b487" : T.paper} stroke={A} strokeWidth={on ? 1.4 : 0.8} />
            );
          })}
          {playing && <line x1={headX} y1={laneY - 3} x2={headX} y2={laneY + laneH + 3} stroke={C} strokeWidth="1.4" />}
          <text x={laneX + laneW} y={laneY + 17} textAnchor="end" fill={C} style={f.mono(700, 13)}>{enc.morse}</text>

          {/* transmit lamp */}
          <text x="20" y={214} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>signal</text>
          {(() => {
            const lit = playing && segs.some((s) => tRef.current >= s.start && tRef.current < s.end);
            return (
              <>
                <circle cx="150" cy="210" r="11" fill={lit ? A : T.paper2} stroke={lit ? A : T.rule22} strokeWidth="1.3" />
                <text x="172" y="214" fill={lit ? A : T.mute} style={f.mono(700, 10, { upper: true, tracking: 0.12 })}>
                  {lit ? "on air" : playing ? "gap" : "idle"}
                </text>
              </>
            );
          })()}
          <text x={laneX + laneW} y="214" textAnchor="end" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.1 })}>
            letter {idx + 1} of {WORD.length}
          </text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Btn small color={A} active={playing} icon={playing ? Pause : Play}
          onClick={() => setPlaying((p) => !p)}>{playing ? "pause" : "transmit"}</Btn>
        <Btn small onClick={step}>next letter</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>

      <Readout items={[
        { l: "Letter", v: letter, color: C },
        { l: "Number", v: enc.num, color: A },
        { l: "Grid", v: enc.grid },
        { l: "Binary", v: enc.bin },
      ]} />

      <Caption color={C}>
        The same letter can travel as a number (A is 1, Z is 26), a pattern of Morse dots and dashes,
        a grid coordinate of row then column, or five bits of binary. The code changes the symbols, not
        the meaning, so knowing which table to reach for is the whole skill. Transmit the word and watch
        one letter light up in all four codes at once.
      </Caption>
    </div>
  );
}

export { ExtraEncode };
