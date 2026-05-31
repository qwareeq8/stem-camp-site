// ExtraChecksum component for the STEM Camp interactive deck.
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraChecksum() {
  // PYB-04 "Check digits catch errors". Sibling ExtraDetect ("Detect without false
  // alarms") is about a detector's hit/false-alarm tradeoff. This demo owns the
  // check-digit rule: a barcode carries one extra digit computed from the data by a
  // fixed rule (sum of the data mod 10). Corrupt any data digit and the recomputed
  // rule no longer matches the stored check digit, so the scanner rejects the code.
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;
  const data = useMemo(() => [4, 2, 7, 1, 9, 3, 5], []);
  const stored = data.reduce((s, v) => s + v, 0) % 10;
  const [corrupt, setCorrupt] = useState(0);
  const shown = data.map((v, i) => (corrupt === i + 1) ? (v + 3) % 10 : v);
  const dataSum = shown.reduce((s, v) => s + v, 0);
  const recompute = dataSum % 10;
  const ok = recompute === stored;
  const digits = [...shown, stored];
  const N = digits.length, cw = 40, gap = 4, x0 = 56, cellX = (i) => x0 + i * (cw + gap), cellY = 92, cellH = 38;
  const bits = (v, j) => (v >> j) & 1;

  return (
    <div>
      <Field height={210}>
        <svg viewBox="0 0 460 200" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="20" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Check digits catch errors</text>
          <text x="20" y="34" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.14 })}>a barcode rejects a mistyped digit</text>

          <rect x="350" y="9" width="98" height="22" rx="4" fill={T.paper} stroke={ok ? T.ok : T.warn} strokeWidth="1.4" />
          <text x="399" y="24" textAnchor="middle" fill={ok ? T.ok : T.warn} style={f.mono(700, 12, { upper: true, tracking: 0.1 })}>{ok ? "accepted" : "rejected"}</text>

          {digits.map((v, i) => { const x = cellX(i), isCheck = i === N - 1, isErr = corrupt === i + 1 && !isCheck; const bf = isErr ? T.warn : isCheck ? A : T.ink; return (
            <g key={i}>
              {Array.from({ length: 4 }, (_, j) => <rect key={j} x={x + 6 + j * 8} y="40" width={1.6 + bits(v, j) * 2.6} height="36" fill={bf} />)}
              <rect x={x} y={cellY} width={cw} height={cellH} rx="2" fill={isErr ? T.warn : T.paper2} stroke={isCheck ? A : T.rule22} strokeWidth={isCheck ? 1.6 : 0.8} />
              <text x={x + cw / 2} y={cellY + 25} textAnchor="middle" fill={isErr ? T.paper : C} style={f.mono(700, 15)}>{v}</text>
            </g>
          ); })}
          <text x={x0} y={cellY - 6} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>data digits</text>
          <text x={cellX(N - 1) + cw / 2} y={cellY - 6} textAnchor="middle" fill={A} style={f.mono(700, 7.5, { upper: true, tracking: 0.08 })}>check</text>

          <text x="20" y="156" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.06 })}>rule: (sum of data digits) mod 10 must equal the check digit</text>
          <text x="20" y="176" fill={C} style={f.mono(700, 9)}>sum {dataSum} mod 10 = {recompute}</text>
          <text x="240" y="176" fill={C} style={f.mono(700, 9)}>stored check = {stored}</text>
          <text x="392" y="176" fill={ok ? T.ok : T.warn} style={f.mono(700, 9, { upper: true, tracking: 0.06 })}>{ok ? "match" : "no match"}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={corrupt} set={setCorrupt} min={0} max={7} step={1} color={A} label="Corrupt a data digit" suffix={corrupt === 0 ? "none" : "digit " + corrupt} />
        <Btn small icon={RotateCcw} onClick={() => setCorrupt(0)}>reset</Btn>
      </div>

      <Readout items={[
        { l: "Verdict", v: ok ? "accepted" : "rejected", color: ok ? T.ok : T.warn },
        { l: "Check digit", v: stored, color: A },
        { l: "Recomputed", v: recompute },
        { l: "Single error", v: "always caught" },
      ]} />

      <Caption color={C}>
        A barcode carries one extra check digit, computed from the data digits by a fixed rule: here,
        their sum modulo 10. The scanner recomputes the rule and compares it to the printed check
        digit. Mistype or smudge any single digit and the recomputed value no longer matches, so the
        code is rejected on the spot. Real product codes use this trick to catch errors automatically.
      </Caption>
    </div>
  );
}

export { ExtraChecksum };
