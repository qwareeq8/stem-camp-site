// Interactive TTT-10 practice-card reader with explicit real-study limits.
import { useEffect, useId, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { Btn, Caption, Field, Readout, Slider, Tag } from "../../ui/primitives.jsx";

const PRACTICE_CARDS = [
  { id: "A", widths: [2, 2, 2, 2, 2, 2, 2, 2] },
  { id: "B", widths: [2, 3, 2, 1, 1, 1, 1, 3, 2] },
  { id: "C", widths: [2, 3, 2, 2, 1, 1, 2, 3], mark: 4 },
  { id: "D", widths: [1, 1, 1, 1, 1, 3, 3, 3] },
  { id: "E", widths: [3, 3, 3, 2, 2, 1, 1, 1] },
  { id: "F", widths: [3, 2, 1, 1, 2, 3, 1, 2], mark: 6 },
];

const BAND_FILLS = ["#dedbd3", "#f8f6f1"];

const STUDY_STEPS = [
  ["01", "Replicate", "many cores, same species and site"],
  ["02", "Cross-date", "match shared patterns to calendar years"],
  ["03", "Measure", "width or density, then standardize"],
  ["04", "Calibrate", "compare with local weather records"],
];

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function halfAnnulusPath(cx, top, innerRadius, outerRadius) {
  return [
    `M ${cx - outerRadius} ${top}`,
    `A ${outerRadius} ${outerRadius} 0 0 0 ${cx + outerRadius} ${top}`,
    `L ${cx + innerRadius} ${top}`,
    `A ${innerRadius} ${innerRadius} 0 0 1 ${cx - innerRadius} ${top}`,
    "Z",
  ].join(" ");
}

function halfArcPath(cx, top, radius) {
  return `M ${cx - radius} ${top} A ${radius} ${radius} 0 0 0 ${cx + radius} ${top}`;
}

function getObservedPattern(width, hasMark) {
  const widthLabel = width === 1 ? "relatively narrow" : width === 3 ? "relatively wide" : "reference width";
  return hasMark ? `${widthLabel} + black mark` : widthLabel;
}

function getPracticeLabel(width, hasMark) {
  if (hasMark) return "model-disturbance";
  if (width === 1) return "model-stress";
  if (width === 3) return "model-favorable";
  return "compare in sequence";
}

function PracticeCardPanel({ card, geometry, bandIndex, x, y, width, isNarrow, accent, color }) {
  const cx = isNarrow ? 160 : 159;
  const top = isNarrow ? 88 : 82;
  const selectedGeometry = geometry[bandIndex];
  const markGeometry = card.mark == null ? null : geometry[card.mark];
  const selectedMidRadius = (selectedGeometry.innerRadius + selectedGeometry.outerRadius) / 2;
  const pointerAngle = Math.PI * 0.62;
  const pointerX = cx + Math.cos(pointerAngle) * selectedMidRadius;
  const pointerY = top + Math.sin(pointerAngle) * selectedMidRadius;
  const legendY = isNarrow ? y + 184 : y + 171;
  const panelHeight = isNarrow ? 218 : 201;

  return (
    <g>
      <rect x={x} y={y} width={width} height={panelHeight} rx="5" fill={T.paper} stroke={T.rule12} />
      <text x={x + 14} y={y + 19} fill={color} style={f.mono(700, isNarrow ? 11 : 9, { upper: true, tracking: 0.12 })}>
        Practice card {card.id}
      </text>
      <text x={x + width - 16} y={y + 19} textAnchor="end" fill={accent} style={f.mono(700, isNarrow ? 10 : 8, { upper: true, tracking: 0.07 })}>
        pith to bark
      </text>

      {geometry.map(({ innerRadius, outerRadius }, index) => (
        <path
          key={`${card.id}-${index}`}
          d={halfAnnulusPath(cx, top, innerRadius, outerRadius)}
          fill={BAND_FILLS[index % BAND_FILLS.length]}
          stroke="none"
        />
      ))}
      {geometry.map(({ outerRadius }, index) => (
        <path
          key={`line-${card.id}-${index}`}
          d={halfArcPath(cx, top, outerRadius)}
          fill="none"
          stroke={T.ink}
          strokeWidth={index === geometry.length - 1 ? 2.4 : 0.9}
        />
      ))}
      <line x1={cx - 100} y1={top} x2={cx + 100} y2={top} stroke={T.ink} strokeWidth="1.2" />
      <path
        d={`M ${cx - 12} ${top} A 12 12 0 0 0 ${cx + 12} ${top} Z`}
        fill={T.paper}
        stroke={T.ink}
        strokeWidth="0.9"
      />
      <circle cx={cx} cy={top} r="2.5" fill={T.ink} />

      {markGeometry && (
        <path
          d={`M ${cx - 6} ${top + markGeometry.outerRadius} L ${cx + 6} ${top + markGeometry.outerRadius} L ${cx} ${top + markGeometry.innerRadius} Z`}
          fill={T.ink}
        />
      )}

      <path d={halfArcPath(cx, top, selectedGeometry.innerRadius)} fill="none" stroke={accent} strokeWidth="2.2" />
      <path d={halfArcPath(cx, top, selectedGeometry.outerRadius)} fill="none" stroke={accent} strokeWidth="2.2" />
      <line x1={cx} y1={top} x2={pointerX} y2={pointerY} stroke={accent} strokeWidth="1.1" strokeDasharray="3 3" />
      <circle cx={pointerX} cy={pointerY} r="3.2" fill={accent} stroke={T.paper} strokeWidth="1" />

      <rect x={x + 15} y={legendY} width={width - 30} height={isNarrow ? 24 : 20} rx="3" fill={T.paper2} stroke={T.rule12} />
      <rect x={x + 23} y={legendY + 6} width="13" height="8" fill={BAND_FILLS[0]} stroke={T.rule22} strokeWidth="0.5" />
      <rect x={x + 36} y={legendY + 6} width="13" height="8" fill={BAND_FILLS[1]} stroke={T.rule22} strokeWidth="0.5" />
      <text x={x + 58} y={legendY + (isNarrow ? 16 : 14)} fill={T.mute} style={f.mono(600, isNarrow ? 9.5 : 7.4, { upper: true, tracking: 0.04 })}>
        neutral fill separates authored years only
      </text>
    </g>
  );
}

function RealStudyPanel({ x, y, width, isNarrow, accent, color }) {
  const panelHeight = isNarrow ? 238 : 201;
  const innerX = x + 14;
  const barY = y + 47;
  const stepStartY = isNarrow ? y + 107 : y + 95;
  const stepGap = isNarrow ? 30 : 24;

  return (
    <g>
      <rect x={x} y={y} width={width} height={panelHeight} rx="5" fill={T.paper2} stroke={T.rule12} />
      <text x={innerX} y={y + 19} fill={color} style={f.mono(700, isNarrow ? 11 : 9, { upper: true, tracking: 0.12 })}>
        What a real study requires
      </text>
      <text x={innerX} y={y + 39} fill={T.mute} style={f.mono(600, isNarrow ? 10 : 7.4, { upper: true, tracking: 0.08 })}>
        one annual ring
      </text>
      <rect x={innerX} y={barY} width={isNarrow ? 116 : 90} height={isNarrow ? 18 : 14} rx="2" fill="#d9c49e" stroke={T.ink} strokeWidth="0.7" />
      <rect x={innerX + (isNarrow ? 78 : 60)} y={barY} width={isNarrow ? 38 : 30} height={isNarrow ? 18 : 14} rx="2" fill="#745638" />
      <text x={innerX} y={barY + (isNarrow ? 32 : 25)} fill={T.mute} style={f.mono(600, isNarrow ? 9.5 : 7.2, { upper: true, tracking: 0.05 })}>
        light earlywood
      </text>
      <text x={innerX + (isNarrow ? 138 : 100)} y={barY + (isNarrow ? 32 : 25)} fill={T.mute} style={f.mono(600, isNarrow ? 9.5 : 7.2, { upper: true, tracking: 0.05 })}>
        dark latewood
      </text>

      {STUDY_STEPS.map(([number, label, detail], index) => {
        const stepY = stepStartY + index * stepGap;
        return (
          <g key={number}>
            <circle cx={innerX + 9} cy={stepY - 2} r={isNarrow ? 9 : 8} fill={index === 3 ? accent : color} />
            <text x={innerX + 9} y={stepY + 1} textAnchor="middle" fill={T.paper} style={f.mono(700, isNarrow ? 7.5 : 6.8)}>
              {number}
            </text>
            <text x={innerX + 23} y={stepY - 2} fill={T.ink} style={f.mono(700, isNarrow ? 10.5 : 8, { upper: true, tracking: 0.07 })}>
              {label}
            </text>
            <text x={innerX + 23} y={stepY + (isNarrow ? 11 : 9)} fill={T.mute} style={f.sans(400, isNarrow ? 10 : 8)}>
              {detail}
            </text>
          </g>
        );
      })}

      <text x={innerX} y={y + panelHeight - 9} fill={accent} style={f.mono(700, isNarrow ? 10 : 7.2, { upper: true, tracking: 0.04 })}>
        {isNarrow ? "species and site still shape interpretation" : "interpretation still depends on species and site"}
      </text>
    </g>
  );
}

function DemoTreering() {
  const C = CAMP.trees.ink;
  const A = CAMP.trees.acc;
  const [cardIndex, setCardIndex] = useState(0);
  const [bandIndex, setBandIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const svgTitleId = useId();
  const svgDescriptionId = useId();
  const isNarrow = useMediaQuery("(max-width: 520px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const card = PRACTICE_CARDS[cardIndex];
  const width = card.widths[bandIndex];
  const hasMark = card.mark === bandIndex;
  const observedPattern = getObservedPattern(width, hasMark);
  const practiceLabel = getPracticeLabel(width, hasMark);

  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return undefined;
    const intervalId = window.setInterval(() => {
      setBandIndex((current) => (current + 1) % card.widths.length);
    }, 950);
    return () => window.clearInterval(intervalId);
  }, [card.widths.length, isPlaying, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) setIsPlaying(false);
  }, [prefersReducedMotion]);

  const geometry = useMemo(() => {
    const pithRadius = 12;
    const maxRadius = 100;
    const totalWidth = card.widths.reduce((sum, bandWidth) => sum + bandWidth, 0);
    let cumulativeWidth = 0;
    return card.widths.map((bandWidth) => {
      const innerRadius = pithRadius + (cumulativeWidth / totalWidth) * (maxRadius - pithRadius);
      cumulativeWidth += bandWidth;
      const outerRadius = pithRadius + (cumulativeWidth / totalWidth) * (maxRadius - pithRadius);
      return { innerRadius, outerRadius };
    });
  }, [card]);

  const selectCard = (nextIndex) => {
    setCardIndex(nextIndex);
    setBandIndex(0);
    setIsPlaying(false);
  };

  const selectBand = (nextIndex) => {
    setBandIndex(nextIndex);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (prefersReducedMotion) {
      setBandIndex((current) => (current + 1) % card.widths.length);
      setIsPlaying(false);
      return;
    }
    setIsPlaying((current) => !current);
  };

  const viewBox = isNarrow ? "0 0 320 530" : "0 0 560 280";
  const practiceLayout = isNarrow
    ? { x: 12, y: 48, width: 296 }
    : { x: 20, y: 49, width: 278 };
  const studyLayout = isNarrow
    ? { x: 12, y: 278, width: 296 }
    : { x: 316, y: 49, width: 224 };
  const playbackLabel = prefersReducedMotion ? "next band" : isPlaying ? "pause bands" : "play bands";
  const motionStyle = prefersReducedMotion ? { transition: "none" } : undefined;

  return (
    <div>
      <Field height={isNarrow ? 548 : 294}>
        <svg
          viewBox={viewBox}
          role="img"
          aria-labelledby={`${svgTitleId} ${svgDescriptionId}`}
          style={{ width: "100%", height: "100%" }}
        >
          <title id={svgTitleId}>Authored tree-ring practice card {card.id}</title>
          <desc id={svgDescriptionId}>
            Card {card.id}, band {bandIndex + 1} of {card.widths.length}, is {observedPattern} under the printed practice code. The adjacent panel explains that real studies replicate, cross-date, measure, and calibrate many samples.
          </desc>

          <text x={isNarrow ? 12 : 20} y="22" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.16 })}>
            Rings as proxy data
          </text>
          <text x={isNarrow ? 12 : 20} y="37" fill={T.mute} style={f.mono(500, isNarrow ? 10 : 8.5, { upper: true, tracking: 0.09 })}>
            {isNarrow ? "authored practice, not a real climate record" : "authored pattern practice, not a real climate record"}
          </text>

          <PracticeCardPanel
            card={card}
            geometry={geometry}
            bandIndex={bandIndex}
            {...practiceLayout}
            isNarrow={isNarrow}
            accent={A}
            color={C}
          />
          <RealStudyPanel {...studyLayout} isNarrow={isNarrow} accent={A} color={C} />
        </svg>
      </Field>

      <div
        role="group"
        aria-label="Authored tree-ring practice card"
        style={{ display: "flex", gap: 7, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}
      >
        {PRACTICE_CARDS.map((practiceCard, index) => (
          <Btn
            key={practiceCard.id}
            small
            color={C}
            active={index === cardIndex}
            aria-pressed={index === cardIndex}
            style={motionStyle}
            title={`Show practice card ${practiceCard.id}`}
            onClick={() => selectCard(index)}
          >
            card {practiceCard.id}
          </Btn>
        ))}
        <Btn
          small
          icon={isPlaying ? Pause : Play}
          color={A}
          active={isPlaying}
          aria-pressed={prefersReducedMotion ? undefined : isPlaying}
          style={motionStyle}
          onClick={togglePlayback}
        >
          {playbackLabel}
        </Btn>
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "10px 4px 0" }}>
        <Slider
          val={bandIndex}
          set={selectBand}
          min={0}
          max={card.widths.length - 1}
          step={1}
          color={A}
          label="Inspect annual band"
          suffix={`${bandIndex + 1} / ${card.widths.length}`}
        />
        <Tag color={A}>authored example</Tag>
      </div>

      <div aria-live="polite" aria-atomic="true">
        <Readout items={[
          { l: "Card", v: card.id, color: C },
          { l: "Band", v: `${bandIndex + 1} of ${card.widths.length}`, color: A },
          { l: "Observed", v: observedPattern },
          { l: "Practice code", v: practiceLabel, color: hasMark ? T.warn : C },
        ]} />
      </div>

      <Caption color={C}>
        These six stylized cards use an authored practice code only: relatively wide means
        model-favorable, relatively narrow means model-stress, and a black mark means
        model-disturbance. Neutral shading separates adjacent authored years. It does not label
        favorable or stressful conditions. In a real tree, light earlywood and dark latewood form
        one annual ring. Climate interpretation requires replicated, cross-dated measurements,
        local weather calibration, and species and site context. One card cannot prove a real
        drought, fire, temperature, or rainfall history.
      </Caption>
    </div>
  );
}

export { DemoTreering };
