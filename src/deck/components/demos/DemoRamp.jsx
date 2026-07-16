// DemoRamp component for the STEM Camp interactive deck.
import { useEffect, useId, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

const RAMP_CLIENTS = Object.freeze([
  Object.freeze({
    id: "A",
    name: "Community school",
    riseCm: 5,
    runPerRise: 12,
    weightPieces: 1,
  }),
  Object.freeze({
    id: "B",
    name: "Public library",
    riseCm: 4,
    runPerRise: 14,
    weightPieces: 2,
  }),
  Object.freeze({
    id: "C",
    name: "Health clinic",
    riseCm: 6,
    runPerRise: 12,
    weightPieces: 3,
  }),
  Object.freeze({
    id: "D",
    name: "Science museum",
    riseCm: 4,
    runPerRise: 16,
    weightPieces: 4,
  }),
]);

/**
 * Calculate the exact slope geometry printed on a public PYS-12 client card.
 *
 * @param {typeof RAMP_CLIENTS[number]} client - Selected client specification.
 * @returns {{runCm: number, deckCm: number, cutCm: number,
 *   slopePercent: number}} The card's geometry values.
 * @example
 * calculateRampGeometry(RAMP_CLIENTS[0]).runCm;
 * // => 60
 */
function calculateRampGeometry(client) {
  const runCm = client.riseCm * client.runPerRise;
  const deckCm = Math.hypot(runCm, client.riseCm);
  return {
    runCm,
    deckCm,
    cutCm: Math.ceil(deckCm),
    slopePercent: 100 / client.runPerRise,
  };
}

/**
 * Check whether motion should resolve without tweening.
 *
 * @returns {boolean} True when the user requests reduced motion.
 * @example
 * prefersReducedMotion();
 * // => false
 */
function prefersReducedMotion() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animate the slope-only geometry and unweighted roll check for PYS-12.
 *
 * @returns {JSX.Element} The accessible ramp-geometry interactive.
 */
function DemoRamp() {
  const ink = CAMP.pystem.ink;
  const accent = CAMP.pystem.acc;
  const [clientIndex, setClientIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const svgTitleId = useId();
  const svgDescriptionId = useId();

  const client = RAMP_CLIENTS[clientIndex];
  const geometry = calculateRampGeometry(client);

  useRAF(isRolling, (deltaTime) => {
    setProgress((current) => Math.min(1, current + deltaTime / 1600));
  });

  useEffect(() => {
    if (progress >= 1) setIsRolling(false);
  }, [progress]);

  const reset = () => {
    setIsRolling(false);
    setProgress(0);
  };

  const selectClient = (nextIndex) => {
    setClientIndex(nextIndex);
    reset();
  };

  const startRoll = () => {
    if (prefersReducedMotion()) {
      setProgress(1);
      setIsRolling(false);
      return;
    }
    if (progress >= 1) setProgress(0);
    setIsRolling(true);
  };

  const width = 460;
  const height = 276;
  const groundY = 220;
  const topX = 426;
  const pixelsPerCm = 4.45;
  const runPixels = geometry.runCm * pixelsPerCm;
  const risePixels = client.riseCm * pixelsPerCm;
  const baseX = topX - runPixels;
  const topY = groundY - risePixels;
  const guideFootX = topX - client.riseCm * 12 * pixelsPerCm;
  const rampAngle = Math.atan2(risePixels, runPixels) * 180 / Math.PI;
  const cartX = topX - progress * runPixels;
  const cartY = topY + progress * risePixels;
  const slopeLabel = client.runPerRise === 12
    ? "At the 1:12 maximum"
    : "Gentler than 1:12";
  const rollStatus = isRolling
    ? `Unweighted roll check in progress, ${Math.round(progress * 100)} percent complete.`
    : progress >= 1
      ? "Roll check complete. Record smooth, straight travel on the physical prototype."
      : `Client ${client.id} is ready. The cart is unwound and carries no weights.`;

  return (
    <div>
      <Field height={290}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${svgTitleId} ${svgDescriptionId}`}
          style={{ width: "100%", height: "100%" }}
        >
          <title id={svgTitleId}>Client {client.id} ramp slope geometry</title>
          <desc id={svgDescriptionId}>
            A scale ramp with {client.riseCm} centimeters of rise,
            {geometry.runCm} centimeters of horizontal run, and an unwound,
            unweighted cart that moves only after the roll-check button is used.
            The diagram is a slope check, not an accessibility-compliance verdict.
          </desc>

          <rect
            x="14"
            y="16"
            width="226"
            height="104"
            rx="6"
            fill={T.paper2}
            stroke={ink}
            strokeWidth="1"
          />
          <text
            x="26"
            y="34"
            fill={ink}
            style={f.mono(700, 10, { upper: true, tracking: 0.1 })}
          >
            Client {client.id} · {client.name}
          </text>
          <text x="26" y="56" fill={T.ink} style={f.mono(700, 13)}>
            {client.riseCm} cm × {client.runPerRise} = {geometry.runCm} cm
          </text>
          <text x="26" y="72" fill={T.mute} style={f.sans(500, 10.5)}>
            rise × ratio = minimum horizontal run
          </text>
          <text x="26" y="92" fill={T.ink} style={f.mono(600, 11)}>
            sloped deck = {geometry.deckCm.toFixed(1)} cm
          </text>
          <text x="26" y="108" fill={accent} style={f.mono(700, 10.5)}>
            card cut = {geometry.cutCm} × 15 cm
          </text>

          <rect
            x="268"
            y="16"
            width="176"
            height="54"
            rx="6"
            fill={T.paper}
            stroke={accent}
            strokeWidth="1.2"
          />
          <text
            x="356"
            y="36"
            textAnchor="middle"
            fill={accent}
            style={f.mono(700, 9.5, { upper: true, tracking: 0.1 })}
          >
            slope geometry only
          </text>
          <text
            x="356"
            y="55"
            textAnchor="middle"
            fill={client.runPerRise === 12 ? T.warn : T.ok}
            style={f.mono(700, 10, { upper: true })}
          >
            {slopeLabel}
          </text>
          <text
            x="356"
            y="87"
            textAnchor="middle"
            fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.08 })}
          >
            unwound cart · no weights
          </text>

          <line
            x1="8"
            y1={groundY}
            x2="454"
            y2={groundY}
            stroke={T.ink}
            strokeWidth="1.2"
          />
          {Array.from({ length: 28 }, (_, index) => (
            <line
              key={`ground-${index}`}
              x1={14 + index * 16}
              y1={groundY + 1}
              x2={8 + index * 16}
              y2={groundY + 7}
              stroke={T.ink}
              strokeWidth="0.5"
              opacity="0.35"
            />
          ))}

          <line
            x1={guideFootX}
            y1={groundY}
            x2={topX}
            y2={topY}
            stroke={T.mute}
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.75"
          />
          <text
            x={guideFootX}
            y={groundY - 8}
            textAnchor="middle"
            fill={T.mute}
            style={f.mono(600, 9, { upper: true })}
          >
            1:12 guide
          </text>

          <polygon
            points={`${baseX},${groundY} ${topX},${groundY} ${topX},${topY}`}
            fill={ink}
            opacity="0.08"
          />
          <line
            x1={baseX}
            y1={groundY}
            x2={topX}
            y2={topY}
            stroke={ink}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect
            x={topX}
            y={topY}
            width="28"
            height={risePixels}
            fill={ink}
            opacity="0.82"
          />
          <rect
            x={topX - 4}
            y={topY - 4}
            width="32"
            height="4"
            rx="1"
            fill={ink}
          />

          <g
            transform={`translate(${cartX} ${cartY}) rotate(${-rampAngle})`}
          >
            <rect x="-13" y="-11" width="26" height="10" rx="2" fill={accent} />
            <path d="M-8 -11 L-4 -18 H7 L11 -11 Z" fill={T.paper} stroke={accent} />
            <circle cx="-7" cy="1" r="3.5" fill={T.ink} />
            <circle cx="7" cy="1" r="3.5" fill={T.ink} />
          </g>

          <line
            x1={baseX}
            y1="247"
            x2={topX}
            y2="247"
            stroke={accent}
            strokeWidth="1.2"
          />
          <line x1={baseX} y1="241" x2={baseX} y2="253" stroke={accent} />
          <line x1={topX} y1="241" x2={topX} y2="253" stroke={accent} />
          <text
            x={(baseX + topX) / 2}
            y="267"
            textAnchor="middle"
            fill={accent}
            style={f.mono(700, 10)}
          >
            horizontal run {geometry.runCm} cm
          </text>

        </svg>
      </Field>

      <div
        aria-label={`Client ${client.id} geometry summary`}
        style={{
          margin: "0 4px 10px",
          padding: "8px 10px",
          borderLeft: `3px solid ${accent}`,
          background: T.paper2,
          color: T.ink,
          ...f.sans(500, 13, { lh: 1.45 }),
        }}
      >
        <span style={{ color: ink, ...f.sans(700, 13) }}>
          Client {client.id} geometry:
        </span>{" "}
        {client.riseCm} cm rise × {client.runPerRise} = {geometry.runCm} cm
        horizontal run; {geometry.deckCm.toFixed(1)} cm sloped deck, rounded up
        to a {geometry.cutCm} × 15 cm cut.
      </div>

      <div
        role="group"
        aria-label="Select a public ramp client card"
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          padding: "0 4px 10px",
        }}
      >
        {RAMP_CLIENTS.map((option, index) => (
          <Btn
            key={option.id}
            small
            color={ink}
            active={clientIndex === index}
            aria-pressed={clientIndex === index}
            onClick={() => selectClient(index)}
          >
            client {option.id} · 1:{option.runPerRise}
          </Btn>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          padding: "0 4px",
        }}
      >
        <Btn
          small
          icon={isRolling ? Pause : Play}
          color={accent}
          active={isRolling}
          aria-pressed={isRolling}
          onClick={isRolling ? () => setIsRolling(false) : startRoll}
        >
          {isRolling ? "pause" : "roll check"}
        </Btn>
        <Btn small icon={RotateCcw} onClick={reset}>
          reset
        </Btn>
      </div>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          margin: "10px 4px 0",
          color: T.mute,
          ...f.sans(500, 12.5, { lh: 1.45 }),
        }}
      >
        {rollStatus}
      </div>

      <Readout
        items={[
          { l: "Slope", v: `1:${client.runPerRise}`, color: ink },
          { l: "Running slope", v: `${geometry.slopePercent.toFixed(1)}%` },
          { l: "Rise", v: `${client.riseCm} cm` },
          { l: "Horizontal run", v: `${geometry.runCm} cm`, color: accent },
          { l: "Deck cut", v: `${geometry.cutCm} × 15 cm` },
        ]}
      />

      <Caption color={ink}>
        Running slope compares vertical rise with horizontal run; the sloped
        deck is the slightly longer hypotenuse. This animation traces an
        unwound, unweighted cart, so it does not predict roll speed, strength,
        or accessibility compliance. Test strength separately by bridging the
        prototype and hanging Client {client.id}'s {client.weightPieces} × 200 g
        {client.weightPieces === 1 ? " piece" : " pieces"} at mid-span. A real
        ramp review also checks landings, clear width, cross slope, surface,
        handrails when required, and edge protection.
      </Caption>
    </div>
  );
}

export { DemoRamp };
