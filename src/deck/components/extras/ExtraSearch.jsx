// ExtraSearch component for the STEM Camp interactive deck.
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

const ROW_LABELS = ["A", "B", "C", "D"];
const COLUMN_LABELS = [1, 2, 3, 4, 5, 6];
const DEPOT = Object.freeze({ row: 0, column: -1, label: "DEPOT" });
const A1 = Object.freeze({ row: 0, column: 0, label: "A1" });
const MOVE_DURATION_MS = 360;
const PRACTICE_REQUEST = Object.freeze(["A6", "C2", "D5"]);

/**
 * Convert a tabletop bin address to its zero-based grid coordinates.
 *
 * @param {string} address - An address from A1 through D6.
 * @returns {{row: number, column: number, label: string}} The addressed cell.
 * @throws {Error} If the address is outside the activity grid.
 * @example
 * addressToCell("C2");
 * // => { row: 2, column: 1, label: "C2" }
 */
function addressToCell(address) {
  const match = /^([A-D])([1-6])$/.exec(address);
  if (!match) {
    throw new Error(`Invalid BookBot practice address: ${address}`);
  }
  return {
    row: match[1].charCodeAt(0) - 65,
    column: Number(match[2]) - 1,
    label: address,
  };
}

/**
 * Add orthogonally adjacent grid cells until a route reaches its target.
 *
 * @param {Array<{row: number, column: number, label: string}>} route - Route to extend.
 * @param {{row: number, column: number, label: string}} target - Target grid cell.
 * @returns {void}
 * @example
 * const route = [addressToCell("A1")];
 * appendGridMoves(route, addressToCell("B2"));
 */
function appendGridMoves(route, target) {
  let current = route[route.length - 1];
  while (current.column !== target.column) {
    const column = current.column + Math.sign(target.column - current.column);
    current = {
      row: current.row,
      column,
      label: `${ROW_LABELS[current.row]}${column + 1}`,
    };
    route.push(current);
  }
  while (current.row !== target.row) {
    const row = current.row + Math.sign(target.row - current.row);
    current = {
      row,
      column: current.column,
      label: `${ROW_LABELS[row]}${current.column + 1}`,
    };
    route.push(current);
  }
}

/**
 * Expand a visit order into every legal tabletop move, including DEPOT.
 *
 * @param {string[]} visitOrder - Requested addresses in visit order.
 * @returns {Array<{row: number, column: number, label: string}>} Adjacent route cells.
 * @example
 * expandLegalRoute(["A1"]);
 * // => [DEPOT, A1, DEPOT]
 */
function expandLegalRoute(visitOrder) {
  const route = [DEPOT, A1];
  for (const address of visitOrder) {
    appendGridMoves(route, addressToCell(address));
  }
  appendGridMoves(route, A1);
  route.push(DEPOT);
  return route;
}

/**
 * Return whether two consecutive route cells form one permitted move.
 *
 * @param {{row: number, column: number, label: string}} from - Starting cell.
 * @param {{row: number, column: number, label: string}} to - Ending cell.
 * @returns {boolean} True for one orthogonal edge, including DEPOT to A1.
 * @example
 * isLegalMove(DEPOT, A1);
 * // => true
 */
function isLegalMove(from, to) {
  const distance = Math.abs(from.row - to.row)
    + Math.abs(from.column - to.column);
  const touchesDepot = from.label === "DEPOT" || to.label === "DEPOT";
  if (touchesDepot) {
    return distance === 1
      && new Set([from.label, to.label]).has("A1");
  }
  return distance === 1;
}

/**
 * Check the current operating-system motion preference.
 *
 * @returns {boolean} True when animation should complete without tweening.
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

const ROUTE_OPTIONS = Object.freeze({
  listed: Object.freeze({
    label: "Listed order",
    visitOrder: PRACTICE_REQUEST,
    route: Object.freeze(expandLegalRoute(PRACTICE_REQUEST)),
  }),
  shorter: Object.freeze({
    label: "Shorter route",
    visitOrder: Object.freeze(["C2", "D5", "A6"]),
    route: Object.freeze(expandLegalRoute(["C2", "D5", "A6"])),
  }),
});

for (const option of Object.values(ROUTE_OPTIONS)) {
  const hasIllegalMove = option.route
    .slice(1)
    .some((cell, index) => !isLegalMove(option.route[index], cell));
  if (hasIllegalMove) {
    throw new Error(`BookBot ${option.label} contains an illegal move.`);
  }
}

/**
 * Animate a public practice route on the PYS-11 tabletop model.
 *
 * @returns {JSX.Element} The BookBot route-planning interactive.
 */
function ExtraSearch() {
  const ink = CAMP.pystem.ink;
  const accent = CAMP.pystem.acc;
  const isNarrow = useIsNarrow();
  const [routeKey, setRouteKey] = useState("listed");
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [, renderFrame] = useState(0);
  const elapsedRef = useRef(0);

  const option = ROUTE_OPTIONS[routeKey];
  const route = option.route;
  const totalMoves = route.length - 1;

  useRAF(isRunning, (deltaTime) => {
    elapsedRef.current += deltaTime;
    if (elapsedRef.current >= MOVE_DURATION_MS) {
      const completedMoves = Math.floor(
        elapsedRef.current / MOVE_DURATION_MS,
      );
      elapsedRef.current %= MOVE_DURATION_MS;
      setStepIndex((current) => Math.min(
        totalMoves,
        current + completedMoves,
      ));
    }
    renderFrame((frame) => (frame + 1) % 1000000);
  });

  useEffect(() => {
    if (stepIndex >= totalMoves) {
      elapsedRef.current = 0;
      setIsRunning(false);
    }
  }, [stepIndex, totalMoves]);

  const selectRoute = (nextKey) => {
    elapsedRef.current = 0;
    setIsRunning(false);
    setStepIndex(0);
    setRouteKey(nextKey);
  };

  const run = () => {
    if (prefersReducedMotion()) {
      elapsedRef.current = 0;
      setStepIndex(totalMoves);
      setIsRunning(false);
      return;
    }
    if (stepIndex >= totalMoves) {
      elapsedRef.current = 0;
      setStepIndex(0);
    }
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);
  const step = () => {
    elapsedRef.current = 0;
    setIsRunning(false);
    setStepIndex((current) => Math.min(totalMoves, current + 1));
  };
  const reset = () => {
    elapsedRef.current = 0;
    setIsRunning(false);
    setStepIndex(0);
  };

  const width = isNarrow ? 380 : 560;
  const height = isNarrow ? 260 : 338;
  const gridX = 72;
  const gridY = 64;
  const cellWidth = 48;
  const cellHeight = 44;
  const gridWidth = COLUMN_LABELS.length * cellWidth;
  const gridHeight = ROW_LABELS.length * cellHeight;
  const panelX = gridX + gridWidth + 18;
  const panelWidth = width - panelX - 18;

  const cellPosition = (cell) => ({
    x: cell.label === "DEPOT"
      ? gridX - 34
      : gridX + cell.column * cellWidth + cellWidth / 2,
    y: gridY + cell.row * cellHeight + cellHeight / 2,
  });

  const segmentProgress = Math.min(
    1,
    elapsedRef.current / MOVE_DURATION_MS,
  );
  const fromCell = route[stepIndex];
  const toCell = route[Math.min(stepIndex + 1, totalMoves)];
  const fromPosition = cellPosition(fromCell);
  const toPosition = cellPosition(toCell);
  const cursorPosition = {
    x: fromPosition.x
      + (toPosition.x - fromPosition.x) * segmentProgress,
    y: fromPosition.y
      + (toPosition.y - fromPosition.y) * segmentProgress,
  };
  const completedCells = route.slice(0, stepIndex + 1);
  const completedPoints = [
    ...completedCells.map((cell) => cellPosition(cell)),
    ...(segmentProgress > 0 ? [cursorPosition] : []),
  ];
  const completedPath = completedPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const fullPath = route
    .map((cell) => {
      const point = cellPosition(cell);
      return `${point.x},${point.y}`;
    })
    .join(" ");
  const visited = new Set(completedCells.map((cell) => cell.label));
  const nextRequest = option.visitOrder.find((address) => !visited.has(address));
  let routeStatus = `Paused at ${fromCell.label}, ${stepIndex} of ${totalMoves} moves complete.`;
  if (stepIndex >= totalMoves) {
    routeStatus = `Complete at DEPOT after ${totalMoves} legal moves.`;
  } else if (isRunning) {
    routeStatus = `Move ${stepIndex + 1} of ${totalMoves}: ${fromCell.label} to ${toCell.label}.`;
  } else if (segmentProgress > 0) {
    routeStatus = `Paused between ${fromCell.label} and ${toCell.label}, with ${stepIndex} of ${totalMoves} moves complete.`;
  }
  const savedMoves = ROUTE_OPTIONS.listed.route.length
    - ROUTE_OPTIONS.shorter.route.length;
  const currentLocation = segmentProgress > 0
    ? `${fromCell.label} to ${toCell.label}`
    : fromCell.label;

  return (
    <div>
      <Field height={isNarrow ? 220 : 350}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby="bookbot-route-title bookbot-route-description"
          style={{ width: "100%", height: "100%" }}
        >
          <title id="bookbot-route-title">
            PYS-11 legal route practice
          </title>
          <desc id="bookbot-route-description">
            A four-row by six-column tabletop grid. DEPOT is immediately left
            of A1. The marker follows one orthogonal edge per move, visits the
            three practice addresses, and returns to DEPOT.
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
            BookBot route practice
          </text>
          <text
            x="20"
            y="40"
            fill={T.mute}
            style={f.mono(500, isNarrow ? 11.5 : 9, {
              upper: true,
              tracking: 0.12,
            })}
          >
            tabletop model, one orthogonal edge per move
          </text>

          <rect
            x={gridX}
            y={gridY}
            width={gridWidth}
            height={gridHeight}
            rx="4"
            fill={T.paper2}
            stroke={ink}
            strokeWidth="1.2"
          />

          {ROW_LABELS.map((rowLabel, row) => (
            <g key={rowLabel}>
              {COLUMN_LABELS.map((columnLabel, column) => {
                const address = `${rowLabel}${columnLabel}`;
                const isRequested = PRACTICE_REQUEST.includes(address);
                const isVisited = visited.has(address) && isRequested;
                const isNext = nextRequest === address;
                const x = gridX + column * cellWidth;
                const y = gridY + row * cellHeight;
                return (
                  <g key={address}>
                    <rect
                      x={x + 3}
                      y={y + 3}
                      width={cellWidth - 6}
                      height={cellHeight - 6}
                      rx="3"
                      fill={isVisited
                        ? T.ok
                        : isRequested
                          ? T.paper
                          : T.paper3}
                      fillOpacity={isVisited ? 0.3 : 1}
                      stroke={isNext ? accent : T.rule22}
                      strokeWidth={isNext ? 2 : 0.7}
                    />
                    <text
                      x={x + cellWidth / 2}
                      y={y + 20}
                      textAnchor="middle"
                      fill={isRequested ? ink : T.mute}
                      style={f.mono(700, isNarrow ? 13 : 9.5, {
                        tracking: 0.06,
                      })}
                    >
                      {address}
                    </text>
                    {isRequested && !isNarrow && (
                      <text
                        x={x + cellWidth / 2}
                        y={y + 32}
                        textAnchor="middle"
                        fill={isVisited ? T.ok : isNext ? accent : T.mute}
                        style={f.mono(700, 6.8, {
                          upper: true,
                          tracking: 0.08,
                        })}
                      >
                        {isVisited ? "retrieved" : isNext ? "next" : "needed"}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          ))}

          <line
            x1={gridX - 18}
            y1={gridY + cellHeight / 2}
            x2={gridX}
            y2={gridY + cellHeight / 2}
            stroke={ink}
            strokeWidth="2"
          />
          <rect
            x={gridX - 58}
            y={gridY + 7}
            width="40"
            height="30"
            rx="3"
            fill={ink}
          />
          <text
            x={gridX - 38}
            y={gridY + 26}
            textAnchor="middle"
            fill={T.paper}
            style={f.mono(700, isNarrow ? 12 : 7.5, {
              upper: true,
              tracking: 0.08,
            })}
          >
            DEPOT
          </text>

          <polyline
            points={fullPath}
            fill="none"
            stroke={T.rule22}
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinejoin="round"
          />
          {completedPath && (
            <polyline
              points={completedPath}
              fill="none"
              stroke={accent}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          <g transform={`translate(${cursorPosition.x} ${cursorPosition.y})`}>
            <rect
              x="-8"
              y="-8"
              width="16"
              height="16"
              rx="3"
              fill={accent}
              stroke={ink}
              strokeWidth="1"
            />
            <circle cx="0" cy="0" r="2.5" fill={T.paper} />
          </g>

          {!isNarrow && (
            <g>
              <rect
                x={panelX}
                y={gridY}
                width={panelWidth}
                height={gridHeight}
                rx="6"
                fill={T.paper2}
                stroke={ink}
                strokeWidth="1"
              />
              <text
                x={panelX + 12}
                y={gridY + 20}
                fill={T.mute}
                style={f.mono(700, 8, { upper: true, tracking: 0.12 })}
              >
                practice request
              </text>
              <text
                x={panelX + 12}
                y={gridY + 42}
                fill={ink}
                style={f.mono(700, 13)}
              >
                {PRACTICE_REQUEST.join("  ")}
              </text>
              <line
                x1={panelX + 10}
                y1={gridY + 54}
                x2={panelX + panelWidth - 10}
                y2={gridY + 54}
                stroke={T.rule22}
              />
              <text
                x={panelX + 12}
                y={gridY + 75}
                fill={T.mute}
                style={f.mono(700, 8, { upper: true, tracking: 0.12 })}
              >
                visit order
              </text>
              {option.visitOrder.map((address, index) => (
                <text
                  key={address}
                  x={panelX + 12}
                  y={gridY + 94 + index * 17}
                  fill={visited.has(address) ? T.ok : ink}
                  style={f.mono(700, 9)}
                >
                  {index + 1}. {address}
                </text>
              ))}
              <text
                x={panelX + 12}
                y={gridY + 154}
                fill={T.mute}
                style={f.mono(700, 8, { upper: true, tracking: 0.12 })}
              >
                legal moves
              </text>
              <text
                x={panelX + 12}
                y={gridY + 174}
                fill={accent}
                style={f.mono(700, 15)}
              >
                {stepIndex} / {totalMoves}
              </text>
            </g>
          )}

          {!isNarrow && (
            <text
              x={gridX}
              y={gridY + gridHeight + 24}
              fill={T.mute}
              style={f.mono(600, 8, { upper: true, tracking: 0.1 })}
            >
              practice only: official order-card answers stay with staff
            </text>
          )}
        </svg>
      </Field>

      {isNarrow && (
        <div
          aria-label="Practice route details"
          style={{
            display: "grid",
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gap: "5px 12px",
            margin: "0 4px 10px",
            padding: "9px 10px",
            border: `1px solid ${T.rule12}`,
            borderRadius: 6,
            background: T.paper2,
          }}
        >
          <span style={{ color: T.mute, ...f.sans(700, 10) }}>Request</span>
          <span style={{ color: ink, ...f.mono(700, 12) }}>
            {PRACTICE_REQUEST.join(" / ")}
          </span>
          <span style={{ color: T.mute, ...f.sans(700, 10) }}>Order</span>
          <span style={{ color: ink, ...f.mono(700, 12) }}>
            {option.visitOrder.join(" -> ")}
          </span>
          <span style={{ color: T.mute, ...f.sans(700, 10) }}>Moves</span>
          <span style={{ color: accent, ...f.mono(700, 12) }}>
            {stepIndex} / {totalMoves}
          </span>
          <span
            style={{
              gridColumn: "1 / -1",
              color: T.mute,
              ...f.sans(500, 10.5, { lh: 1.4 }),
            }}
          >
            Practice route only. Staff keep the official order-card answers.
          </span>
        </div>
      )}

      <div
        role="group"
        aria-label="Choose the practice visit order"
        style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 4px" }}
      >
        {Object.entries(ROUTE_OPTIONS).map(([key, routeOption]) => (
          <button
            key={key}
            type="button"
            aria-pressed={routeKey === key}
            className={`btn${routeKey === key ? "" : " ghost"} focusable`}
            onClick={() => selectRoute(key)}
          >
            {routeOption.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          flexWrap: "wrap",
          padding: "10px 4px 0",
        }}
      >
        <Btn
          small
          icon={isRunning ? Pause : Play}
          color={accent}
          active={isRunning}
          aria-pressed={isRunning}
          onClick={isRunning ? pause : run}
        >
          {isRunning ? "pause" : "run"}
        </Btn>
        <Btn small disabled={stepIndex >= totalMoves} onClick={step}>
          one move
        </Btn>
        <Btn small icon={RotateCcw} onClick={reset}>
          reset
        </Btn>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          margin: "10px 4px 0",
          color: T.mute,
          ...f.sans(500, 12.5, { lh: 1.45 }),
        }}
      >
        {routeStatus}
      </div>

      <Readout
        items={[
          { l: "At", v: currentLocation, color: accent },
          { l: "Moves", v: `${stepIndex} / ${totalMoves}`, color: ink },
          { l: "Next request", v: nextRequest || "return to DEPOT" },
          {
            l: "Comparison",
            v: routeKey === "shorter" ? `${savedMoves} fewer moves` : "listed order",
            color: routeKey === "shorter" ? T.ok : ink,
          },
        ]}
      />

      <Caption color={ink}>
        Temple's BookBot is an automated storage and retrieval system: a
        catalog request triggers retrieval and the material goes to a
        processing station. This A1 to D6 grid is the camp's tabletop model,
        not the real BookBot floor plan. Compare two orders for the same public
        practice request. Every run starts and finishes at DEPOT, and every
        counted move crosses one orthogonal edge. Time is only a tie-breaker
        after legal-move count.
      </Caption>
    </div>
  );
}

export { ExtraSearch };
