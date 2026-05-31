// ExtraSoundMedia component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraSoundMedia() {
  // PYS-04 "Sound transmission" (concept 1). Distinct from ExtraHRRecovery.
  // The stethoscope: a wide funnel collects faint heart sounds and a sealed
  // tube channels them to the ear. A bigger funnel gathers more sound; a tight
  // seal keeps it in the tube. Loudness = collection x transmission.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [funnel, setFunnel] = useState(7);   // funnel size 1..10
  const [seal, setSeal] = useState(7);       // seal quality 0..10
  const [playing, setPlaying] = useState(true);
  const collection = 0.15 + ((funnel - 1) / 9) * 0.85;   // 0.15..1
  const transmission = seal / 10;                         // 0..1
  const leakAmt = 1 - transmission;
  const loudness = Math.round(collection * transmission * 100);
  const quality = loudness >= 55 ? "clear" : loudness >= 25 ? "faint" : "too quiet";
  const qC = loudness >= 55 ? okC : loudness >= 25 ? A : warnC;

  // ---- geometry ----
  const VW = 560, VH = 230;
  const yC = 118;
  const heartX = 58;
  const xMouth = 100, xThroat = 176;
  const hMouth = 16 + ((funnel - 1) / 9) * 36;   // funnel mouth half-height
  const hThroat = 7;
  const tubeX0 = xThroat, tubeX1 = 424;
  const earX = 436;
  const leaks = [248, 332];

  // ---- animation ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const cl = clockRef.current;

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>sound transmission</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>the stethoscope: funnel, tube, ear</text>

          {/* capture cone (wider funnel gathers more) */}
          <polygon points={heartX + "," + yC + " " + xMouth + "," + (yC - hMouth) + " " + xMouth + "," + (yC + hMouth)} fill={A} opacity={0.07 + collection * 0.12} />

          {/* heart + emitted sound rings */}
          {[0, 1, 2].map((k) => {
            const r = 6 + ((cl * 0.05 + k * 15) % 42);
            return <path key={k} d={"M" + (heartX + r * 0.5) + " " + (yC - r) + " A " + r + " " + r + " 0 0 1 " + (heartX + r * 0.5) + " " + (yC + r)} fill="none" stroke={A} strokeWidth="1.2" opacity={clamp(0.5 - r / 90, 0, 0.5)} />;
          })}
          <g transform={"translate(" + heartX + " " + yC + ")"}>
            <circle cx="-3" cy="0" r="4.5" fill={warnC} /><circle cx="3" cy="0" r="4.5" fill={warnC} />
            <path d="M-6.5,1.5 L0,9 L6.5,1.5 Z" fill={warnC} />
          </g>
          <text x={heartX} y={yC + 34} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>heart</text>

          {/* funnel (chestpiece) - mouth widens with funnel size */}
          <polygon points={xMouth + "," + (yC - hMouth) + " " + xThroat + "," + (yC - hThroat) + " " + xThroat + "," + (yC + hThroat) + " " + xMouth + "," + (yC + hMouth)}
            fill={T.paper3} stroke={T.ink} strokeWidth="1.2" />
          <ellipse cx={xMouth} cy={yC} rx="4" ry={hMouth} fill={C} opacity="0.25" stroke={T.ink} strokeWidth="0.8" />
          <text x={(xMouth + xThroat) / 2} y={yC + hMouth + 14} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>funnel</text>

          {/* tube */}
          <line x1={tubeX0} y1={yC - hThroat} x2={tubeX1} y2={yC - hThroat} stroke={T.ink} strokeWidth="1.2" />
          <line x1={tubeX0} y1={yC + hThroat} x2={tubeX1} y2={yC + hThroat} stroke={T.ink} strokeWidth="1.2" />
          <rect x={tubeX0} y={yC - hThroat + 1} width={tubeX1 - tubeX0} height={hThroat * 2 - 2} fill={T.paper3} opacity="0.4" />
          <text x={(tubeX0 + tubeX1) / 2} y={yC + 26} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>sealed tube</text>

          {/* travelling sound pulses (opacity scales with loudness) */}
          {[0, 1, 2, 3].map((k) => {
            const span = earX - heartX;
            const x = heartX + ((cl * 0.13 + k * (span / 4)) % span);
            const inTube = x > xThroat;
            return <circle key={k} cx={x} cy={yC} r={inTube ? 3.2 : 4} fill={A} opacity={(0.2 + loudness / 100 * 0.75) * (x < tubeX1 ? 1 : 0.4)} />;
          })}

          {/* leaks escaping where the seal is poor: a gap in the tube with sound puffing out */}
          {leaks.map((lx, i) => {
            if (leakAmt < 0.08) return null;
            return (
              <g key={i}>
                <circle cx={lx} cy={yC - hThroat} r={2 + leakAmt} fill={warnC} opacity={clamp(0.4 + leakAmt * 0.5, 0, 0.9)} />
                {[0, 1, 2].map((j) => {
                  const rise = (cl * 0.07 + j * 11 + i * 6) % 33;
                  const rr = 3 + j * 1.6 + leakAmt * 2.5;
                  const op = clamp((0.85 - rise / 33) * leakAmt, 0, 0.85);
                  const yTop = yC - hThroat - 4 - rise;
                  return <path key={j} d={"M " + (lx - rr) + " " + yTop + " a " + rr + " " + rr + " 0 0 1 " + (rr * 2) + " 0"} fill="none" stroke={warnC} strokeWidth="1.8" strokeLinecap="round" opacity={op} />;
                })}
              </g>
            );
          })}
          {leakAmt > 0.35 && <text x={(leaks[0] + leaks[1]) / 2} y={yC - hThroat - 42} textAnchor="middle" fill={warnC} style={f.mono(700, 9, { upper: true, tracking: 0.12 })}>sound leaks out</text>}

          {/* ear */}
          <g transform={"translate(" + earX + " " + yC + ")"}>
            <path d="M 7 -11 C -8 -14, -12 1, -6 9 C -3 13, 6 13, 9 6" fill={T.paper2} stroke={T.ink} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M 3 -6 C -4 -6, -6 2, -1 6" fill="none" stroke={T.ink} strokeWidth="1" opacity="0.6" />
            <ellipse cx="-4" cy="1.5" rx="2.8" ry="3.6" fill={C} opacity="0.4" stroke={T.ink} strokeWidth="0.7" />
            <circle cx="-4.5" cy="1.5" r="1.3" fill={T.ink} />
          </g>
          <text x={earX + 2} y={yC + 30} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>ear</text>

          {/* ===== loudness meter ===== */}
          {(() => {
            const mx = 474, mw = 30, mTop = 52, mBot = 178;
            const fillH = (loudness / 100) * (mBot - mTop);
            return (
              <g>
                <text x={mx + mw / 2} y={mTop - 8} textAnchor="middle" fill={T.mute} style={f.mono(700, 8.5, { upper: true, tracking: 0.16 })}>loudness</text>
                <rect x={mx} y={mTop} width={mw} height={mBot - mTop} rx={3} fill={T.paper2} stroke={C} strokeWidth="1" />
                <rect x={mx} y={mBot - fillH} width={mw} height={fillH} rx={2} fill={qC} opacity="0.85" />
                {[25, 55].map((z) => (
                  <line key={z} x1={mx} y1={mBot - (z / 100) * (mBot - mTop)} x2={mx + mw} y2={mBot - (z / 100) * (mBot - mTop)} stroke={T.ink} strokeWidth="0.6" strokeDasharray="2 2" opacity="0.5" />
                ))}
                <text x={mx + mw / 2} y={mBot + 14} textAnchor="middle" fill={qC} style={f.mono(700, 12)}>{loudness}%</text>
              </g>
            );
          })()}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={funnel} set={setFunnel} min={1} max={10} color={A} label="Funnel size" suffix={funnel} />
        <Slider val={seal} set={setSeal} min={0} max={10} color={C} label="Seal" suffix={seal} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Funnel gain", v: Math.round(collection * 100) + "%", color: A },
        { l: "Seal", v: seal * 10 + "%", color: C },
        { l: "Loudness", v: loudness + "%", color: qC },
        { l: "Heartbeat", v: quality, color: qC },
      ]} />

      <Caption color={C}>
        A stethoscope gathers faint heart sounds with a wide funnel and
        concentrates them into a narrow tube that carries them to your ear. A
        bigger funnel collects more sound, and a tight seal keeps it inside the
        tube. Leaks let sound escape, so seal quality decides how clearly you
        hear a quiet heartbeat.
      </Caption>
    </div>
  );
}

export { ExtraSoundMedia };
