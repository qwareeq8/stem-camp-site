// ExtraStrengthWeight component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraStrengthWeight() {
  // PYS-02 "Material efficiency" (concept 2). Distinct from DemoOobleck (the
  // shear-thickening physics). More oobleck armor protects better but weighs and
  // costs more, with diminishing returns. The efficient design is the LEAST
  // material that still protects the target.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [amount, setAmount] = useState(5);   // material amount (scoops) 1..10
  const [playing, setPlaying] = useState(true);
  const protFn = (a) => 100 * (1 - Math.exp(-a / 3.2));
  const prot = Math.round(protFn(amount));
  const safe = prot >= 70;
  const weightG = amount * 22;
  const minAmt = 4;                            // protection crosses 70 near here
  const verdict = !safe ? "target breaks" : amount <= minAmt + 2 ? "efficient" : "over-built";
  const vC = !safe ? warnC : amount <= minAmt + 2 ? okC : A;

  // ---- animation: impactor taps the pad ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const ph = (clockRef.current % 1200) / 1200;
  const down = ph < 0.5 ? Math.pow(ph * 2, 1.6) : Math.pow((1 - ph) * 2, 1.6);
  const hit = down > 0.82;

  // ---- scene geometry ----
  const VW = 560, VH = 230;
  const cx = 150, groundY = 178, targetY = 167;
  const padH = 16 + amount * 4.6;             // pad thickness
  const padBotY = targetY - 14, padTopY = padBotY - padH;
  const impRest = 70, reach = clamp(padTopY - impRest - 6, 8, 80), impY = impRest + down * reach;
  const padW = 70;

  // ---- chart geometry ----
  const pn = { x: 300, y: 52, w: 216, h: 138 };
  const plotL = pn.x + 36, plotR = pn.x + pn.w - 14, plotTop = pn.y + 30, plotBot = pn.y + pn.h - 22;
  const aX = (a) => plotL + ((a - 1) / 9) * (plotR - plotL);
  const yV = (v) => plotBot - (v / 100) * (plotBot - plotTop);
  const protPts = [], wPts = [];
  for (let a = 1; a <= 10; a += 0.5) { protPts.push(aX(a).toFixed(1) + "," + yV(protFn(a)).toFixed(1)); wPts.push(aX(a).toFixed(1) + "," + yV(a * 10).toFixed(1)); }

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>material efficiency</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>least armor that still protects</text>

          <defs>
            <linearGradient id="oobPad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e3a563" />
              <stop offset="0.5" stopColor={A} />
              <stop offset="1" stopColor="#9c581f" />
            </linearGradient>
          </defs>
          {/* ground + target */}
          <line x1={56} y1={groundY} x2={258} y2={groundY} stroke={T.ink} strokeWidth="1" />
          {/* target: a glossy bullseye sensor resting on the ground; it cracks if the armor fails */}
          <ellipse cx={cx} cy={groundY} rx="14" ry="3" fill={T.ink} opacity="0.12" />
          <ellipse cx={cx} cy={targetY} rx="13.5" ry="12" fill={T.paper} stroke={T.ink} strokeWidth="1.4" />
          <ellipse cx={cx} cy={targetY} rx="9.4" ry="8.2" fill="none" stroke={warnC} strokeWidth="1.7" />
          <ellipse cx={cx} cy={targetY} rx="5" ry="4.3" fill={warnC} opacity="0.16" />
          <ellipse cx={cx} cy={targetY} rx="5" ry="4.3" fill="none" stroke={warnC} strokeWidth="1.5" />
          <ellipse cx={cx} cy={targetY} rx="2" ry="1.8" fill={warnC} />
          <path d={"M " + (cx - 9) + " " + (targetY - 6) + " A 12 11 0 0 1 " + (cx + 4) + " " + (targetY - 10)} fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
          {!safe && (
            <g>
              <ellipse cx={cx} cy={targetY} rx="13.5" ry="12" fill={warnC} opacity="0.18" />
              <polyline points={(cx - 9) + "," + (targetY - 8) + " " + (cx - 1) + "," + (targetY - 1) + " " + (cx - 5) + "," + (targetY + 3) + " " + (cx + 5) + "," + (targetY + 9)} fill="none" stroke={T.ink} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
            </g>
          )}
          <text x={cx} y={groundY + 14} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>target</text>

          {/* oobleck armor pad (thickness = material amount): gradient body, top gloss, bottom shadow */}
          <rect x={cx - padW / 2} y={padTopY} width={padW} height={padH} rx="7"
            fill="url(#oobPad)" stroke={T.ink} strokeWidth="1.1" opacity={hit && safe ? 1 : 0.9} />
          <rect x={cx - padW / 2 + 4} y={padTopY + 3} width={padW - 8} height="4" rx="2" fill="#ffffff" opacity="0.4" />
          <line x1={cx - padW / 2 + 5} y1={padBotY - 3} x2={cx + padW / 2 - 5} y2={padBotY - 3} stroke="#7a4416" strokeWidth="1.6" opacity="0.4" />
          {hit && safe && <rect x={cx - padW / 2 + 3} y={padTopY + 2} width={padW - 6} height="6" rx="2" fill="#ffffff" opacity="0.5" />}
          <text x={cx + padW / 2 + 6} y={padTopY + padH / 2} fill={A} style={f.mono(600, 8, { upper: true, tracking: 0.1 })}>{weightG} g</text>

          {/* impactor */}
          <g transform={"translate(" + cx + " " + impY + ")"}>
            <rect x="-20" y="-16" width="40" height="16" rx="2" fill={C} stroke={T.ink} strokeWidth="1" />
            <text x="0" y="-4" textAnchor="middle" fill={T.paper} style={f.mono(700, 8, { upper: true, tracking: 0.1 })}>press</text>
          </g>

          {/* verdict tag (clear of the impactor) */}
          <rect x={198} y={94} width="86" height="17" rx="3" fill={T.paper} stroke={vC} strokeWidth="1.1" />
          <text x={241} y={106} textAnchor="middle" fill={vC} style={f.mono(700, 9, { upper: true, tracking: 0.08 })}>{safe ? "protected" : "broken"}</text>

          {/* ===== efficiency chart ===== */}
          <g>
            <rect x={pn.x} y={pn.y} width={pn.w} height={pn.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            {[["protect", A], ["weight", C]].map(([lab, col], i) => (
              <g key={i} transform={"translate(" + (pn.x + 12 + i * 64) + " " + (pn.y + 14) + ")"}>
                <line x1={0} y1={0} x2={12} y2={0} stroke={col} strokeWidth="2.4" />
                <text x={15} y={3} fill={col} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>{lab}</text>
              </g>
            ))}
            {/* efficient zone */}
            <rect x={aX(minAmt)} y={plotTop} width={aX(minAmt + 2) - aX(minAmt)} height={plotBot - plotTop} fill={okC} opacity="0.12" />
            <text x={(aX(minAmt) + aX(minAmt + 2)) / 2} y={plotTop - 3} textAnchor="middle" fill={okC} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>efficient</text>
            {/* protected threshold */}
            <line x1={plotL} y1={yV(70)} x2={plotR} y2={yV(70)} stroke={okC} strokeDasharray="3 3" strokeWidth="0.9" />
            <rect x={plotL - 1} y={yV(70) - 11} width="52" height="10" rx="2" fill={T.paper2} opacity="0.92" />
            <text x={plotL + 2} y={yV(70) - 3} textAnchor="start" fill={okC} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>protected</text>
            {/* baseline */}
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            {/* curves */}
            <polyline points={wPts.join(" ")} fill="none" stroke={C} strokeWidth="1.8" opacity="0.85" />
            <polyline points={protPts.join(" ")} fill="none" stroke={A} strokeWidth="2.4" />
            {/* current amount marker */}
            <line x1={aX(amount)} y1={plotTop} x2={aX(amount)} y2={plotBot} stroke={T.ink} strokeDasharray="2 3" strokeWidth="1" opacity="0.6" />
            <circle cx={aX(amount)} cy={yV(prot)} r="3.4" fill={A} stroke={T.paper} strokeWidth="1.2" />
            {/* axis labels */}
            <text x={plotL} y={plotBot + 13} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>less</text>
            <text x={plotR} y={plotBot + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>more material</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={amount} set={setAmount} min={1} max={10} color={A} label="Material amount" suffix={amount + " scoops"} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Armor", v: amount + " scoops", color: A },
        { l: "Weight", v: weightG + " g", color: C },
        { l: "Protection", v: prot + "%", color: vC },
        { l: "Verdict", v: verdict, color: vC },
      ]} />

      <Caption color={C}>
        More oobleck protects better, but it weighs and costs more, and the gains
        shrink as you pile it on. The efficient design uses the least material
        that still crosses the protection line. Below it the target breaks; far
        above it you carry dead weight for little extra safety.
      </Caption>
    </div>
  );
}

export { ExtraStrengthWeight };
