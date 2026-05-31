// ExtraRootsAnchor component for the STEM Camp interactive deck.
import { useMemo, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraRootsAnchor() {
  // Same standard storm, two soil trays side-by-side. Only the root network
  // changes between them. Roots are clipped inside the soil mass. (Slope is
  // covered by ExtraRunoff so we don't vary it here.)
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, failC = T.warn;
  const SOIL = "#9a774a", SOIL_DARK = "#6d4f2c", SOIL_TOP = "#a8855a";
  const WATER = "#3a7aa6";

  // Density: 0=light, 1=medium, 2=dense
  const [density, setDensity] = useState(1);
  const densityLabel = ["light", "medium", "dense"][density];
  const gripFactor = [0.4, 0.65, 0.9][density];   // fraction of particles held

  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const rainRefL = useRef([]);     // bare side rain
  const rainRefR = useRef([]);     // rooted side rain
  const partsL = useRef([]);       // bare side dislodged particles
  const partsR = useRef([]);       // rooted side dislodged particles
  const lostLRef = useRef(0);
  const lostRRef = useRef(0);
  const [, force] = useState(0);

  // ===== Geometry =====
  const W = 540, H = 320;
  const cardW = 250, cardH = 230;
  const gap = 20;
  const totalW = cardW * 2 + gap;
  const cardLX = (W - totalW) / 2;     // 10
  const cardRX = cardLX + cardW + gap; // 280
  const cardY = 30;
  // Cloud zone at top of card
  const cloudH = 36;
  // Tray (the soil container) inside the card
  const trayPad = 14;
  const trayLeft = (cx) => cx + trayPad;
  const trayRight = (cx) => cx + cardW - trayPad;
  const trayW = cardW - trayPad * 2;   // 222
  const trayTop = cardY + cloudH + 12; // 78
  const trayBot = trayTop + 80;        // 158
  // Soil surface sits a few px below the tray top (tray walls extend above)
  const soilTopY = trayTop + 8;
  // Trough below the tray for collected runoff
  const troughTop = trayBot + 6;       // 164
  const troughBot = troughTop + 38;    // 202

  // ===== Generate roots once for the rooted card =====
  const rootSegments = useMemo(() => {
    // Build a tree-like root network within the rooted soil mass.
    // The tray local coords (relative to its left edge).
    const segs = [];
    const trayInner = { x: 0, y: 0, w: trayW, h: trayBot - soilTopY };
    // Place several "plants" along the tray. Density controls count + depth.
    const plantCount = [3, 5, 7][density];
    const maxDepth = [(trayBot - soilTopY) * 0.55, (trayBot - soilTopY) * 0.78, (trayBot - soilTopY) * 0.95][density];
    for (let p = 0; p < plantCount; p++) {
      const px = ((p + 0.5) * trayInner.w) / plantCount;
      const py = 0; // soil surface
      // Main taproot, straight down
      segs.push({ x1: px, y1: py, x2: px, y2: py + maxDepth, w: 1.6 });
      // Laterals branching off at intervals
      const lateralLevels = [0.25, 0.5, 0.78];
      lateralLevels.forEach((lvl, li) => {
        const ly = maxDepth * lvl;
        const sign = li % 2 === 0 ? 1 : -1;
        const reach = 10 + density * 6 + li * 4;
        const lex = px + sign * reach;
        const ley = ly + 4;
        segs.push({ x1: px, y1: ly, x2: lex, y2: ley, w: 1.1 });
        // small branchlet off each lateral
        segs.push({ x1: lex, y1: ley, x2: lex + sign * 6, y2: ley + 4, w: 0.8 });
        // and on the other side
        segs.push({ x1: px, y1: ly, x2: px - sign * (reach - 3), y2: ly + 5, w: 1 });
        segs.push({ x1: px - sign * (reach - 3), y1: ly + 5, x2: px - sign * (reach - 3) - sign * 4, y2: ly + 9, w: 0.7 });
      });
    }
    // small surface "grass" plants drawn separately (returned with the same data)
    const plants = Array.from({ length: plantCount }, (_, p) => ({
      x: ((p + 0.5) * trayInner.w) / plantCount,
    }));
    return { segs, plants, maxDepth };
  }, [density]);

  // Storm timing
  const stormDuration = 4200; // ms
  useRAF(running, (dt) => {
    tRef.current += dt;
    if (tRef.current >= stormDuration) {
      setRunning(false);
      return;
    }

    // Spawn rain drops on each side
    const dropsPerSec = 50;
    const spawn = (rainRef, cx) => {
      if (Math.random() < dropsPerSec * dt / 1000) {
        rainRef.current.push({
          id: Math.random(),
          x: cx + trayPad + Math.random() * trayW,
          y: cardY + cloudH - 6,
          vy: 0.22 + Math.random() * 0.05,
        });
      }
    };
    spawn(rainRefL, cardLX);
    spawn(rainRefR, cardRX);

    // Update rain on each side
    const step = (rainRef, partsRef, isBare, cx, lostRef) => {
      const surf = soilTopY;
      const newRain = [];
      for (const d of rainRef.current) {
        d.y += d.vy * dt;
        if (d.y >= surf) {
          // splatter; chance of dislodging a particle
          const dislodgeP = isBare ? 0.55 : 0.55 * (1 - gripFactor);
          if (Math.random() < dislodgeP) {
            partsRef.current.push({
              id: Math.random(),
              x: d.x,
              y: surf - 2,
              vx: (Math.random() - 0.3) * 0.06, // tend to drift toward tray edge
              vy: -0.04 - Math.random() * 0.03,  // little hop
              age: 0,
            });
          }
          continue;
        }
        if (d.y < trayBot + 30) newRain.push(d);
      }
      rainRef.current = newRain;
      // Update particles - they fly out the side of the tray and fall into trough
      const newParts = [];
      for (const part of partsRef.current) {
        part.age += dt;
        part.vy += 0.0005 * dt; // gravity
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        // tray-edge cutoff (tray sits between trayLeft(cx) and trayRight(cx))
        const insideTray = part.x >= trayLeft(cx) && part.x <= trayRight(cx);
        if (!insideTray) {
          // free-falling out the side
          part.outOfTray = true;
        }
        if (part.y >= troughTop) {
          lostRef.current += 1;
          continue;
        }
        if (part.age < 4000) newParts.push(part);
      }
      partsRef.current = newParts;
    };
    step(rainRefL, partsL, true, cardLX, lostLRef);
    step(rainRefR, partsR, false, cardRX, lostRRef);

    force((v) => v + 1);
  });

  const startStorm = () => {
    if (running) return;
    tRef.current = 0;
    rainRefL.current = [];
    rainRefR.current = [];
    partsL.current = [];
    partsR.current = [];
    lostLRef.current = 0;
    lostRRef.current = 0;
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    tRef.current = 0;
    rainRefL.current = [];
    rainRefR.current = [];
    partsL.current = [];
    partsR.current = [];
    lostLRef.current = 0;
    lostRRef.current = 0;
    force((v) => v + 1);
  };

  const lostBare = lostLRef.current;
  const lostRoot = lostRRef.current;
  const ratio = lostRoot > 0 ? (lostBare / lostRoot).toFixed(1) : "-";

  // ===== Render helpers =====
  const Card = ({ cx, label, isBare }) => {
    const tx = trayLeft(cx);
    const trayId = "soilClip" + (isBare ? "B" : "R");
    const cloudCx = cx + cardW / 2;
    const cloudCy = cardY + cloudH / 2;
    const lost = isBare ? lostBare : lostRoot;
    return (
      <g>
        <defs>
          <clipPath id={trayId}>
            <rect x={tx} y={soilTopY} width={trayW} height={trayBot - soilTopY} />
          </clipPath>
        </defs>
        {/* Card header label (drawn ABOVE the card so it never collides with the cloud) */}
        <text x={cx + cardW / 2} y={cardY - 8} textAnchor="middle"
          fill={isBare ? failC : okC}
          style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>
          {label}
        </text>

        {/* Card outer (paper2) */}
        <rect x={cx} y={cardY} width={cardW} height={cardH} rx={8}
          fill={T.paper2} stroke={C} strokeWidth="1.1" />

        {/* Cloud (simple soft cloud) */}
        {(() => {
          const ccx = cloudCx, ccy = cloudCy + 4;
          const sil = `
            M ${ccx - 30} ${ccy + 8}
            C ${ccx - 42} ${ccy + 8} ${ccx - 42} ${ccy - 4} ${ccx - 26} ${ccy - 4}
            C ${ccx - 26} ${ccy - 16} ${ccx - 6} ${ccy - 18} ${ccx} ${ccy - 10}
            C ${ccx + 6} ${ccy - 20} ${ccx + 26} ${ccy - 16} ${ccx + 28} ${ccy - 4}
            C ${ccx + 42} ${ccy - 4} ${ccx + 42} ${ccy + 8} ${ccx + 26} ${ccy + 8}
            Z`;
          return (
            <g>
              <path d={sil} fill="#000" opacity="0.10" transform={`translate(1 2)`} />
              <path d={sil} fill="url(#raCloudGrad)" stroke={T.ink} strokeWidth="0.9" />
              <ellipse cx={ccx - 12} cy={ccy - 6} rx={10} ry={3}
                fill="#ffffff" opacity="0.7" />
            </g>
          );
        })()}

        {/* Tray walls */}
        <rect x={tx - 2} y={trayTop} width={trayW + 4} height={trayBot - trayTop + 2}
          fill="none" stroke={C} strokeWidth="1.4" />

        {/* Soil block (clipped horizon) */}
        <rect x={tx} y={soilTopY} width={trayW} height={trayBot - soilTopY}
          fill="url(#raSoilGrad)" />
        {/* slightly lighter top horizon */}
        <rect x={tx} y={soilTopY} width={trayW} height={5}
          fill={SOIL_TOP} />
        {/* soil texture: small darker speckles */}
        {(() => {
          const dots = [];
          for (let k = 0; k < 24; k++) {
            const ax = tx + ((k * 17) % (trayW - 10)) + 4;
            const ay = soilTopY + 8 + ((k * 13) % (trayBot - soilTopY - 16));
            dots.push(<circle key={k} cx={ax} cy={ay} r={0.9} fill={SOIL_DARK} opacity="0.5" />);
          }
          return dots;
        })()}

        {/* Roots (CLIPPED to soil bounds) - only on rooted card */}
        {!isBare && (
          <g clipPath={`url(#${trayId})`}>
            {/* roots are drawn in card-relative coords, so translate */}
            <g transform={`translate(${tx} ${soilTopY})`}>
              {rootSegments.segs.map((s, k) => (
                <line key={"r" + k}
                  x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                  stroke={SOIL_DARK} strokeWidth={s.w} strokeLinecap="round" />
              ))}
            </g>
          </g>
        )}

        {/* Plants on top of soil (rooted only) - drawn after soil for the surface */}
        {!isBare && rootSegments.plants.map((pl, k) => {
          const px = tx + pl.x;
          return (
            <g key={"p" + k}>
              {/* simple grass-tree: a stem with 3 leaves */}
              <line x1={px} y1={soilTopY} x2={px} y2={soilTopY - 10}
                stroke="#2e6b3f" strokeWidth="1.2" strokeLinecap="round" />
              <ellipse cx={px - 3} cy={soilTopY - 9} rx={3.6} ry={2}
                fill="#3a7b3a" />
              <ellipse cx={px + 3} cy={soilTopY - 7} rx={3.6} ry={2}
                fill="#3a7b3a" />
              <ellipse cx={px} cy={soilTopY - 12} rx={3.6} ry={2.5}
                fill="#4a8b4a" />
            </g>
          );
        })}

        {/* Bare specimen indicator: lots of loose surface dots */}
        {isBare && (() => {
          const surface = [];
          for (let k = 0; k < 12; k++) {
            const ax = tx + 8 + ((k * 19) % (trayW - 16));
            surface.push(
              <circle key={"sl" + k} cx={ax} cy={soilTopY + 0.5}
                r={1.1} fill={SOIL_DARK} opacity="0.7" />
            );
          }
          return surface;
        })()}

        {/* Rain drops */}
        {(isBare ? rainRefL : rainRefR).current.map((d) => (
          <line key={d.id} x1={d.x} y1={d.y - 5} x2={d.x} y2={d.y}
            stroke={WATER} strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
        ))}

        {/* Dislodged particles */}
        {(isBare ? partsL : partsR).current.map((part) => (
          <circle key={part.id} cx={part.x} cy={part.y} r={1.6}
            fill={SOIL_DARK} stroke={T.ink} strokeWidth="0.2" opacity="0.95" />
        ))}

        {/* Trough beneath the tray */}
        <path d={`M ${tx - 2} ${troughTop}
                  L ${tx - 2} ${troughBot}
                  L ${tx + trayW + 2} ${troughBot}
                  L ${tx + trayW + 2} ${troughTop}`}
          fill="none" stroke={C} strokeWidth="1.2" />
        {/* sediment in trough proportional to lost */}
        {(() => {
          const cap = 80;
          const lvl = Math.min(1, lost / cap);
          const sH = (troughBot - troughTop - 4) * lvl;
          return (
            <rect x={tx} y={troughBot - sH - 1}
              width={trayW} height={sH}
              fill={SOIL_DARK} opacity="0.95" />
          );
        })()}

        {/* SOIL LOST counter inside the card */}
        <text x={cx + cardW / 2} y={troughBot + 16} textAnchor="middle" fill={T.mute}
          style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>
          soil lost: <tspan fill={isBare ? failC : okC}
            style={f.mono(700, 11)}>{lost}</tspan>
        </text>
      </g>
    );
  };

  return (
    <div>
      <Field height={330}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* Title */}
          <text x={W / 2} y={18} textAnchor="middle" fill={C}
            style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>
            root grip trial
          </text>
          <text x={W / 2} y={H - 8} textAnchor="middle" fill={T.mute}
            style={f.mono(500, 8.5, { upper: true, tracking: 0.18 })}>
            same storm · only the root network differs
          </text>

          <defs>
            <linearGradient id="raSoilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={SOIL_TOP} />
              <stop offset="0.34" stopColor={SOIL} />
              <stop offset="1" stopColor={SOIL_DARK} />
            </linearGradient>
            <linearGradient id="raCloudGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#e7ddc9" />
            </linearGradient>
          </defs>
          <Card cx={cardLX} label="bare soil" isBare={true} />
          <Card cx={cardRX} label={`rooted (${densityLabel})`} isBare={false} />

          {/* Center divider */}
          <line x1={W / 2} y1={cardY + 8} x2={W / 2} y2={cardY + cardH - 8}
            stroke={T.rule22} strokeWidth="0.6" strokeDasharray="4 4" />

          {/* Storm progress bar at bottom of the field */}
          {(() => {
            const px = 20, py = 280, pw = W - 40, ph = 5;
            const frac = Math.min(1, tRef.current / stormDuration);
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={2}
                  fill={T.paper3} stroke={T.ink} strokeWidth="0.4" />
                <rect x={px} y={py} width={pw * frac} height={ph} rx={2}
                  fill={running ? WATER : T.paper3} />
                <text x={px} y={py - 4} fill={T.mute}
                  style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>storm</text>
                <text x={px + pw} y={py - 4} textAnchor="end" fill={T.mute}
                  style={f.mono(500, 8, { upper: true, tracking: 0.14 })}>
                  {(tRef.current / 1000).toFixed(1)}s / {(stormDuration / 1000).toFixed(1)}s
                </text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={density} set={setDensity} min={0} max={2} color={C}
          label="Root density" suffix={densityLabel} />
        <Btn small icon={Play} color={A} onClick={startStorm}>storm</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Bare loss", v: lostBare, color: failC },
        { l: "Rooted loss", v: lostRoot, color: okC },
        { l: "Bare ÷ rooted", v: ratio + "×", color: A },
      ]} />

      <Caption color={C}>
        Roots grip soil. The same rainstorm hits both trays, but the rooted
        tray loses far fewer particles because the root network holds them
        in place. Denser, deeper roots hold even better, with more contact
        points and more grip.
      </Caption>
    </div>
  );
}

export { ExtraRootsAnchor };
