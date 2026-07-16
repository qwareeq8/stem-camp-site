// ExtraDecision component for the STEM Camp interactive deck.
import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

const RAMP_BOARD = Object.freeze({
  lengthCm: 76.2,
  widthCm: 50.8,
  deckWidthCm: 15,
});

const RAMP_CLIENTS = Object.freeze([
  Object.freeze({
    id: "A",
    name: "Community school",
    riseCm: 5,
    runPerRise: 12,
    weightPieces: 1,
    foldPanels: 2,
    maxPanelCm: 31,
  }),
  Object.freeze({
    id: "B",
    name: "Public library",
    riseCm: 4,
    runPerRise: 14,
    weightPieces: 2,
    foldPanels: 2,
    maxPanelCm: 29,
  }),
  Object.freeze({
    id: "C",
    name: "Health clinic",
    riseCm: 6,
    runPerRise: 12,
    weightPieces: 3,
    foldPanels: 3,
    maxPanelCm: 25,
  }),
  Object.freeze({
    id: "D",
    name: "Science museum",
    riseCm: 4,
    runPerRise: 16,
    weightPieces: 4,
    foldPanels: 2,
    maxPanelCm: 33,
  }),
]);

const TEST_STAGES = Object.freeze([
  Object.freeze({ id: "plan", label: "Plan" }),
  Object.freeze({ id: "roll", label: "Roll check" }),
  Object.freeze({ id: "load", label: "Load check" }),
  Object.freeze({ id: "fold", label: "Fold check" }),
]);

/**
 * Calculate the checks that can be known before a prototype is tested.
 *
 * @param {typeof RAMP_CLIENTS[number]} client - Public client-card specification.
 * @param {number} runCm - Planned horizontal run in centimeters.
 * @returns {{requiredRunCm: number, slopeRatio: number, exactDeckCm: number,
 *   cutDeckCm: number, foldedPanelCm: number, loadG: number,
 *   isSlopeReady: boolean, isBoardReady: boolean, isFoldReady: boolean}}
 *   The calculated plan checks.
 * @example
 * calculateRampPlan(RAMP_CLIENTS[0], 60).cutDeckCm;
 * // => 61
 */
function calculateRampPlan(client, runCm) {
  const requiredRunCm = client.riseCm * client.runPerRise;
  const exactDeckCm = Math.hypot(runCm, client.riseCm);
  const cutDeckCm = Math.ceil(exactDeckCm);
  const foldedPanelCm = cutDeckCm / client.foldPanels;
  return {
    requiredRunCm,
    slopeRatio: runCm / client.riseCm,
    exactDeckCm,
    cutDeckCm,
    foldedPanelCm,
    loadG: client.weightPieces * 200,
    isSlopeReady: runCm >= requiredRunCm,
    isBoardReady: cutDeckCm <= RAMP_BOARD.lengthCm
      && RAMP_BOARD.deckWidthCm <= RAMP_BOARD.widthCm,
    isFoldReady: foldedPanelCm <= client.maxPanelCm,
  };
}

/**
 * Check the current operating-system motion preference.
 *
 * @returns {boolean} True when animation should complete immediately.
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
 * Track the phone layout breakpoint used by the inline-styled deck.
 *
 * @param {number} breakpointPx - Maximum narrow viewport width in pixels.
 * @returns {boolean} True when the viewport uses the compact diagram.
 */
function useIsNarrow(breakpointPx = 640) {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const query = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const updateLayout = () => setIsNarrow(query.matches);
    updateLayout();
    query.addEventListener("change", updateLayout);
    return () => query.removeEventListener("change", updateLayout);
  }, [breakpointPx]);

  return isNarrow;
}

/**
 * Animate the public PYS-12 client-card calculations and separate build tests.
 *
 * @returns {JSX.Element} The accessibility-ramp criteria interactive.
 */
function ExtraDecision() {
  const ink = CAMP.pystem.ink;
  const accent = CAMP.pystem.acc;
  const isNarrow = useIsNarrow();
  const [clientIndex, setClientIndex] = useState(0);
  const [runCm, setRunCm] = useState(
    RAMP_CLIENTS[0].riseCm * RAMP_CLIENTS[0].runPerRise,
  );
  const [stage, setStage] = useState("plan");
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [rollObservation, setRollObservation] = useState("not recorded");
  const [loadObservation, setLoadObservation] = useState("not recorded");

  const client = RAMP_CLIENTS[clientIndex];
  const plan = calculateRampPlan(client, runCm);
  const isAnimatedStage = stage !== "plan";

  useRAF(isRunning, (deltaTime) => {
    setProgress((current) => Math.min(1, current + deltaTime / 1500));
  });

  useEffect(() => {
    if (progress >= 1) {
      setIsRunning(false);
    }
  }, [progress]);

  const resetAnimation = () => {
    setIsRunning(false);
    setProgress(0);
  };

  const selectClient = (nextIndex) => {
    const nextClient = RAMP_CLIENTS[nextIndex];
    setClientIndex(nextIndex);
    setRunCm(nextClient.riseCm * nextClient.runPerRise);
    setRollObservation("not recorded");
    setLoadObservation("not recorded");
    resetAnimation();
  };

  const selectStage = (nextStage) => {
    setStage(nextStage);
    resetAnimation();
  };

  const changeRun = (nextRunCm) => {
    setRunCm(nextRunCm);
    setRollObservation("not recorded");
    setLoadObservation("not recorded");
    resetAnimation();
  };

  const runAnimation = () => {
    if (!isAnimatedStage) return;
    if (prefersReducedMotion()) {
      setProgress(1);
      setIsRunning(false);
      return;
    }
    if (progress >= 1) setProgress(0);
    setIsRunning(true);
  };

  const pauseAnimation = () => setIsRunning(false);
  const stepAnimation = () => {
    setIsRunning(false);
    setProgress((current) => Math.min(1, current + 0.25));
  };

  const width = isNarrow ? 380 : 560;
  const height = isNarrow ? 314 : 338;
  const sceneX = 20;
  const sceneY = 58;
  const sceneWidth = 340;
  const sceneHeight = 224;
  const panelX = 374;
  const panelWidth = 168;
  const groundY = 224;
  const rampStartX = 54;
  const drawingScale = 3.55;
  const runPixels = runCm * drawingScale;
  const risePixels = client.riseCm * drawingScale;
  const rampEndX = rampStartX + runPixels;
  const rampEndY = groundY - risePixels;
  const carProgress = stage === "roll" ? progress : 0;
  const carX = rampEndX - runPixels * carProgress;
  const carY = rampEndY + risePixels * carProgress;
  const rampAngle = Math.atan2(risePixels, runPixels) * 180 / Math.PI;
  const observedLoadSags = loadObservation === "sags";

  const calculationStatus = (isReady, readyText, needsText) => ({
    color: isReady ? T.ok : T.warn,
    text: isReady ? readyText : needsText,
  });
  const slopeStatus = calculationStatus(
    plan.isSlopeReady,
    "meets card",
    "too steep",
  );
  const boardStatus = calculationStatus(
    plan.isBoardReady,
    "fits board",
    "too long",
  );
  const foldStatus = calculationStatus(
    plan.isFoldReady,
    "fits limit",
    "too long",
  );
  const rollStatus = {
    color: rollObservation === "straight"
      ? T.ok
      : rollObservation === "needs redesign"
        ? T.warn
        : T.mute,
    text: rollObservation,
  };
  const loadStatus = {
    color: loadObservation === "holds"
      ? T.ok
      : loadObservation === "sags"
        ? T.warn
        : T.mute,
    text: loadObservation,
  };

  const stageStatus = (() => {
    if (stage === "plan") {
      return `Client ${client.id}: calculate slope, cut length, and folded size before testing.`;
    }
    if (isRunning) {
      return `${TEST_STAGES.find((item) => item.id === stage).label} running, ${Math.round(progress * 100)} percent complete.`;
    }
    if (progress >= 1 && stage === "roll") {
      return "Roll setup complete. Record whether the unwound car rolled straight or needs redesign.";
    }
    if (progress >= 1 && stage === "load") {
      return `Load setup complete with ${client.weightPieces} weights of 200 grams. Record whether the prototype held or sagged.`;
    }
    if (progress >= 1 && stage === "fold") {
      return `Fold check complete: ${client.foldPanels} panels at ${plan.foldedPanelCm.toFixed(1)} centimeters each.`;
    }
    return `${TEST_STAGES.find((item) => item.id === stage).label} paused at ${Math.round(progress * 100)} percent.`;
  })();

  const criteriaRow = (y, label, value, status) => (
    <g key={label}>
      <text
        x={panelX + 10}
        y={y}
        fill={T.mute}
        style={f.mono(600, 7.2, { upper: true, tracking: 0.08 })}
      >
        {label}
      </text>
      <text
        x={panelX + 10}
        y={y + 12}
        fill={ink}
        style={f.mono(700, 8.5)}
      >
        {value}
      </text>
      <text
        x={panelX + panelWidth - 10}
        y={y + 12}
        textAnchor="end"
        fill={status.color}
        style={f.mono(700, 7.2, { upper: true, tracking: 0.05 })}
      >
        {status.text}
      </text>
    </g>
  );

  return (
    <div>
      <Field height={isNarrow ? 260 : 350}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby="ramp-decision-title ramp-decision-description"
          style={{ width: "100%", height: "100%" }}
        >
          <title id="ramp-decision-title">
            PYS-12 client criteria and prototype checks
          </title>
          <desc id="ramp-decision-description">
            An exact scale-ramp plan for one of four public client cards. The
            diagram separates calculated slope, board, and fold checks from the
            observed free-rolling car and hanging mid-span load tests.
          </desc>

          <text
            x="20"
            y="24"
            fill={ink}
            style={f.mono(700, isNarrow ? 14 : 12, {
              upper: true,
              tracking: 0.16,
            })}
          >
            Criteria and constraints
          </text>
          <text
            x="20"
            y="40"
            fill={T.mute}
            style={f.mono(500, isNarrow ? 11 : 9, {
              upper: true,
              tracking: 0.12,
            })}
          >
            calculate first, then run two separate build tests
          </text>

          <rect
            x={sceneX}
            y={sceneY}
            width={sceneWidth}
            height={sceneHeight}
            rx="6"
            fill={T.paper2}
            stroke={ink}
            strokeWidth="1"
          />

          {(stage === "plan" || stage === "roll") && (
            <g>
              <text
                x={sceneX + 12}
                y={sceneY + 18}
                fill={T.mute}
                style={f.mono(700, isNarrow ? 10.5 : 8, {
                  upper: true,
                  tracking: 0.12,
                })}
              >
                {stage === "roll" ? "free-rolling car check" : "running-slope plan"}
              </text>
              <line
                x1={sceneX + 12}
                y1={groundY}
                x2={sceneX + sceneWidth - 12}
                y2={groundY}
                stroke={T.ink}
                strokeWidth="1"
              />
              <polygon
                points={`${rampStartX},${groundY} ${rampEndX},${rampEndY} ${rampEndX},${groundY}`}
                fill={accent}
                opacity="0.08"
              />
              <line
                x1={rampStartX}
                y1={groundY}
                x2={rampEndX}
                y2={rampEndY}
                stroke={slopeStatus.color}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <rect
                x={rampEndX}
                y={rampEndY}
                width={sceneX + sceneWidth - 12 - rampEndX}
                height={groundY - rampEndY}
                fill={ink}
                opacity="0.12"
              />

              <line
                x1={rampStartX}
                y1={groundY + 18}
                x2={rampEndX}
                y2={groundY + 18}
                stroke={T.mute}
                strokeWidth="0.8"
              />
              <line
                x1={rampStartX}
                y1={groundY + 14}
                x2={rampStartX}
                y2={groundY + 22}
                stroke={T.mute}
              />
              <line
                x1={rampEndX}
                y1={groundY + 14}
                x2={rampEndX}
                y2={groundY + 22}
                stroke={T.mute}
              />
              <text
                x={(rampStartX + rampEndX) / 2}
                y={groundY + 32}
                textAnchor="middle"
                fill={T.mute}
                style={f.mono(700, isNarrow ? 10 : 8)}
              >
                horizontal run {runCm} cm
              </text>

              <line
                x1={rampEndX + 10}
                y1={rampEndY}
                x2={rampEndX + 10}
                y2={groundY}
                stroke={T.mute}
                strokeWidth="0.8"
              />
              <text
                x={rampEndX + 15}
                y={(rampEndY + groundY) / 2 + 3}
                fill={T.mute}
                style={f.mono(700, isNarrow ? 9.5 : 7.5)}
              >
                rise {client.riseCm}
              </text>

              <text
                x={sceneX + 14}
                y={sceneY + 42}
                fill={ink}
                style={f.mono(700, isNarrow ? 11 : 9)}
              >
                deck {plan.exactDeckCm.toFixed(1)} cm, cut {plan.cutDeckCm} cm
              </text>
              <text
                x={sceneX + 14}
                y={sceneY + 57}
                fill={slopeStatus.color}
                style={f.mono(700, isNarrow ? 10 : 8, {
                  upper: true,
                  tracking: 0.08,
                })}
              >
                planned 1:{plan.slopeRatio.toFixed(1)} / card 1:{client.runPerRise}
              </text>

              {stage === "roll" && (
                <g transform={`translate(${carX} ${carY}) rotate(${rampAngle})`}>
                  <rect
                    x="-12"
                    y="-11"
                    width="24"
                    height="10"
                    rx="2"
                    fill={accent}
                    stroke={ink}
                    strokeWidth="0.8"
                  />
                  <circle cx="-7" cy="1" r="3" fill={ink} />
                  <circle cx="7" cy="1" r="3" fill={ink} />
                  <path
                    d="M -7 -11 L -3 -17 L 7 -17 L 11 -11 Z"
                    fill={ink}
                    opacity="0.75"
                  />
                </g>
              )}
              {stage === "roll" && (
                <text
                  x={sceneX + 14}
                  y={sceneY + sceneHeight - 14}
                  fill={T.mute}
                  style={f.mono(700, isNarrow ? 9.5 : 7.5, {
                    upper: true,
                    tracking: 0.08,
                  })}
                >
                  unwound car only, no weights on the car
                </text>
              )}
            </g>
          )}

          {stage === "load" && (
            <g>
              <text
                x={sceneX + 12}
                y={sceneY + 18}
                fill={T.mute}
                style={f.mono(700, isNarrow ? 10.5 : 8, {
                  upper: true,
                  tracking: 0.12,
                })}
              >
                separate mid-span load check
              </text>
              <line
                x1="64"
                y1="148"
                x2="324"
                y2="148"
                stroke={T.rule22}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <path
                d={observedLoadSags
                  ? "M 64 148 Q 194 163 324 148"
                  : "M 64 148 L 324 148"}
                fill="none"
                stroke={loadStatus.color === T.mute ? ink : loadStatus.color}
                strokeWidth="5"
                strokeLinecap="round"
              />
              {[64, 324].map((supportX) => (
                <g key={supportX}>
                  <rect
                    x={supportX - 18}
                    y="151"
                    width="36"
                    height="72"
                    fill={ink}
                    opacity="0.1"
                    stroke={ink}
                    strokeWidth="1"
                  />
                  <line
                    x1={supportX - 20}
                    y1="224"
                    x2={supportX + 20}
                    y2="224"
                    stroke={ink}
                    strokeWidth="2"
                  />
                </g>
              ))}
              <circle cx="194" cy="148" r="4" fill={accent} />
              <line
                x1="194"
                y1="148"
                x2="194"
                y2={158 + progress * 42}
                stroke={accent}
                strokeWidth="2"
              />
              {Array.from({ length: client.weightPieces }, (_, index) => (
                <g
                  key={index}
                  transform={`translate(194 ${166 + progress * 42 + index * 14})`}
                >
                  <rect
                    x="-18"
                    y="0"
                    width="36"
                    height="11"
                    rx="2"
                    fill={accent}
                    stroke={ink}
                    strokeWidth="0.7"
                  />
                  <text
                    x="0"
                    y="8"
                    textAnchor="middle"
                    fill={T.paper}
                    style={f.mono(700, isNarrow ? 8.5 : 6.8)}
                  >
                    200 g
                  </text>
                </g>
              ))}
              <text
                x="194"
                y="102"
                textAnchor="middle"
                fill={ink}
                style={f.mono(700, isNarrow ? 12 : 10)}
              >
                {client.weightPieces} x 200 g = {plan.loadG} g
              </text>
              <text
                x="194"
                y="120"
                textAnchor="middle"
                fill={T.mute}
                style={f.mono(600, isNarrow ? 9.5 : 7.5, {
                  upper: true,
                  tracking: 0.08,
                })}
              >
                hang at midpoint and observe
              </text>
              <text
                x={sceneX + 14}
                y={sceneY + sceneHeight - 14}
                fill={T.mute}
                style={f.mono(700, isNarrow ? 9 : 7.5, {
                  upper: true,
                  tracking: 0.08,
                })}
              >
                {isNarrow
                  ? "observe only; the model does not predict hold or sag"
                  : "the model does not predict whether a build holds or sags"}
              </text>
            </g>
          )}

          {stage === "fold" && (
            <g>
              <text
                x={sceneX + 12}
                y={sceneY + 18}
                fill={T.mute}
                style={f.mono(700, isNarrow ? 10.5 : 8, {
                  upper: true,
                  tracking: 0.12,
                })}
              >
                fold-flat portability check
              </text>
              <text
                x="190"
                y="96"
                textAnchor="middle"
                fill={ink}
                opacity={1 - progress}
                style={f.mono(700, isNarrow ? 11.5 : 9)}
              >
                cut deck {plan.cutDeckCm} cm
              </text>
              {Array.from({ length: client.foldPanels }, (_, index) => {
                const unfoldedWidth = 260 / client.foldPanels;
                return (
                  <rect
                    key={`open-${index}`}
                    x={60 + index * unfoldedWidth}
                    y="112"
                    width={unfoldedWidth - 2}
                    height="28"
                    fill={index % 2 === 0 ? accent : ink}
                    opacity={(1 - progress) * 0.75}
                    stroke={ink}
                    strokeWidth="0.7"
                  />
                );
              })}
              <text
                x="190"
                y="184"
                textAnchor="middle"
                fill={foldStatus.color}
                opacity={progress}
                style={f.mono(700, isNarrow ? 12 : 10)}
              >
                {client.foldPanels} folded panels
              </text>
              {Array.from({ length: client.foldPanels }, (_, index) => (
                <rect
                  key={`stack-${index}`}
                  x={190 - plan.foldedPanelCm * 1.7}
                  y={202 - index * 6}
                  width={plan.foldedPanelCm * 3.4}
                  height="16"
                  rx="2"
                  fill={index % 2 === 0 ? accent : ink}
                  opacity={progress * 0.78}
                  stroke={ink}
                  strokeWidth="0.7"
                />
              ))}
              <line
                x1={190 - client.maxPanelCm * 1.7}
                y1="238"
                x2={190 + client.maxPanelCm * 1.7}
                y2="238"
                stroke={foldStatus.color}
                strokeWidth="1.2"
                opacity={progress}
              />
              <text
                x="190"
                y="255"
                textAnchor="middle"
                fill={foldStatus.color}
                opacity={progress}
                style={f.mono(700, isNarrow ? 10 : 8)}
              >
                {plan.foldedPanelCm.toFixed(1)} cm / max {client.maxPanelCm} cm
              </text>
            </g>
          )}

          {!isNarrow && (
            <g>
              <rect
                x={panelX}
                y={sceneY}
                width={panelWidth}
                height={sceneHeight}
                rx="6"
                fill={T.paper2}
                stroke={ink}
                strokeWidth="1"
              />
              <text
                x={panelX + 10}
                y={sceneY + 18}
                fill={accent}
                style={f.mono(700, 9, { upper: true, tracking: 0.1 })}
              >
                Client {client.id}
              </text>
              <text
                x={panelX + 10}
                y={sceneY + 34}
                fill={ink}
                style={f.mono(700, 9)}
              >
                {client.name}
              </text>
              <line
                x1={panelX + 9}
                y1={sceneY + 43}
                x2={panelX + panelWidth - 9}
                y2={sceneY + 43}
                stroke={T.rule22}
              />
              <text
                x={panelX + 10}
                y={sceneY + 57}
                fill={T.mute}
                style={f.mono(700, 7.2, { upper: true, tracking: 0.1 })}
              >
                calculated checks
              </text>
              {criteriaRow(
                sceneY + 70,
                "running slope",
                `1:${plan.slopeRatio.toFixed(1)}`,
                slopeStatus,
              )}
              {criteriaRow(
                sceneY + 102,
                "board length",
                `${plan.cutDeckCm} / ${RAMP_BOARD.lengthCm} cm`,
                boardStatus,
              )}
              {criteriaRow(
                sceneY + 134,
                "folded panel",
                `${plan.foldedPanelCm.toFixed(1)} / ${client.maxPanelCm} cm`,
                foldStatus,
              )}
              <line
                x1={panelX + 9}
                y1={sceneY + 155}
                x2={panelX + panelWidth - 9}
                y2={sceneY + 155}
                stroke={T.rule22}
              />
              <text
                x={panelX + 10}
                y={sceneY + 169}
                fill={T.mute}
                style={f.mono(700, 7.2, { upper: true, tracking: 0.1 })}
              >
                observed build checks
              </text>
              {criteriaRow(sceneY + 179, "car tracking", "test build", rollStatus)}
              {criteriaRow(sceneY + 199, "mid-span load", `${plan.loadG} g`, loadStatus)}
            </g>
          )}

          <text
            x={sceneX + 12}
            y={sceneY + sceneHeight + 24}
            fill={T.mute}
            style={f.mono(600, isNarrow ? 10 : 8, {
              upper: true,
              tracking: 0.08,
            })}
          >
            {isNarrow
              ? "scale model, not a complete compliance review"
              : "scale activity model, not a complete code-compliance review"}
          </text>
        </svg>
      </Field>

      {isNarrow && (
        <div
          aria-label={`Client ${client.id} criteria summary`}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 8,
            margin: "0 4px 10px",
          }}
        >
          {[
            ["Client", `${client.id}: ${client.name}`, { color: ink }],
            ["Slope", slopeStatus.text, slopeStatus],
            ["Board", boardStatus.text, boardStatus],
            ["Fold", foldStatus.text, foldStatus],
            ["Car", rollStatus.text, rollStatus],
            ["Load", loadStatus.text, loadStatus],
          ].map(([label, value, status]) => (
            <div
              key={label}
              style={{
                minWidth: 0,
                padding: "8px 9px",
                border: `1px solid ${T.rule12}`,
                borderRadius: 6,
                background: T.paper2,
              }}
            >
              <div
                style={{
                  color: T.mute,
                  ...f.sans(700, 9, { upper: true, tracking: 0.12 }),
                }}
              >
                {label}
              </div>
              <div
                style={{
                  color: status.color,
                  overflowWrap: "anywhere",
                  ...f.mono(700, 11.5),
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        role="group"
        aria-label="Choose a public ramp client card"
        style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 4px" }}
      >
        {RAMP_CLIENTS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={clientIndex === index}
            className={`btn${clientIndex === index ? "" : " ghost"} focusable`}
            onClick={() => selectClient(index)}
          >
            Client {item.id}
          </button>
        ))}
      </div>

      <div
        role="group"
        aria-label="Choose a ramp design or test view"
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          padding: "10px 4px 0",
        }}
      >
        {TEST_STAGES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={stage === item.id}
            className={`btn${stage === item.id ? "" : " ghost"} focusable`}
            onClick={() => selectStage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
          flexWrap: "wrap",
          padding: "10px 4px 0",
        }}
      >
        <Slider
          val={runCm}
          set={changeRun}
          min={40}
          max={76}
          step={1}
          color={accent}
          label="Planned horizontal run"
          suffix={`${runCm} cm`}
        />
        <Btn
          small
          icon={isRunning ? Pause : Play}
          color={accent}
          active={isRunning}
          aria-pressed={isRunning}
          disabled={!isAnimatedStage}
          onClick={isRunning ? pauseAnimation : runAnimation}
        >
          {isRunning ? "pause" : "run"}
        </Btn>
        <Btn
          small
          disabled={!isAnimatedStage || progress >= 1}
          onClick={stepAnimation}
        >
          one step
        </Btn>
        <Btn small icon={RotateCcw} onClick={resetAnimation}>
          reset view
        </Btn>
      </div>

      {stage === "roll" && (
        <div
          role="group"
          aria-label="Record the observed car tracking result"
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            padding: "10px 4px 0",
          }}
        >
          {[
            ["straight", "Record straight"],
            ["needs redesign", "Record needs redesign"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={rollObservation === value}
              className={`btn${rollObservation === value ? "" : " ghost"} focusable`}
              disabled={progress < 1}
              onClick={() => setRollObservation(value)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {stage === "load" && (
        <div
          role="group"
          aria-label="Record the observed mid-span load result"
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            padding: "10px 4px 0",
          }}
        >
          {[
            ["holds", "Record holds"],
            ["sags", "Record sags"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={loadObservation === value}
              className={`btn${loadObservation === value ? "" : " ghost"} focusable`}
              disabled={progress < 1}
              onClick={() => setLoadObservation(value)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          margin: "10px 4px 0",
          color: T.mute,
          ...f.sans(500, 12.5, { lh: 1.45 }),
        }}
      >
        {stageStatus}
      </div>

      <Readout
        items={[
          {
            l: "Slope",
            v: `1:${plan.slopeRatio.toFixed(1)}`,
            color: slopeStatus.color,
          },
          { l: "Deck cut", v: `${plan.cutDeckCm} x 15 cm`, color: ink },
          {
            l: "Folded panel",
            v: `${plan.foldedPanelCm.toFixed(1)} cm`,
            color: foldStatus.color,
          },
          { l: "Load setup", v: `${client.weightPieces} x 200 g`, color: accent },
        ]}
      />

      <Caption color={ink}>
        Running slope compares vertical rise with horizontal run, while the
        sloped deck is the slightly longer hypotenuse. The card math can check
        slope, board fit, and folded-panel size. It cannot predict prototype
        strength or tracking. Use the unwound car for a separate smooth,
        straight roll check, then bridge the ramp and hang the listed 200 g
        weights at mid-span. This scale exercise explores selected constraints;
        a real accessible ramp has additional requirements beyond this model.
      </Caption>
    </div>
  );
}

export { ExtraDecision };
