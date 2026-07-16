// Interactive TTT-12 standardized-field counting and comparison practice.
import { useEffect, useId, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { Btn, Caption, Field, Readout, Slider, Tag } from "../../ui/primitives.jsx";

const PRACTICE_SAMPLES = [
  { id: "A", counts: [18, 22, 16, 20, 19, 23] },
  { id: "B", counts: [11, 14, 13, 12, 16, 10] },
];

const METHOD_CHECKS = [
  ["Surface", "same leaf surface"],
  ["Preparation", "same peel or slide method"],
  ["Magnification", "same setting"],
  ["Field area", "same circle"],
  ["Count rule", "fully inside only"],
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

function summarize(values, fieldCount) {
  const included = values.slice(0, fieldCount);
  const total = included.reduce((sum, value) => sum + value, 0);
  return {
    mean: total / included.length,
    min: Math.min(...included),
    max: Math.max(...included),
  };
}

function makeStomata(count, seed) {
  return Array.from({ length: count }, (_, index) => {
    const angle = ((index * 137.508 + seed * 31) * Math.PI) / 180;
    const radialFraction = ((index * 43 + seed * 17) % 101) / 100;
    const radius = 10 + Math.sqrt(radialFraction) * 55;
    return {
      dx: Math.cos(angle) * radius,
      dy: Math.sin(angle) * radius,
      rotation: (index * 47 + seed * 23) % 180,
    };
  });
}

function StomaGlyph({ x, y, rotation, color, opacity = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`} opacity={opacity}>
      <ellipse cx="-2.6" cy="0" rx="2.1" ry="4.2" fill={color} />
      <ellipse cx="2.6" cy="0" rx="2.1" ry="4.2" fill={color} />
      <line x1="0" y1="-3" x2="0" y2="3" stroke={T.paper} strokeWidth="0.7" />
    </g>
  );
}

function FieldPanel({ x, y, width, sample, fieldCount, stomata, clipId, isNarrow, accent, color }) {
  const centerX = isNarrow ? 160 : 143;
  const centerY = isNarrow ? 151 : 141;
  const radius = isNarrow ? 78 : 74;
  const panelHeight = isNarrow ? 220 : 197;
  const edgeX = centerX + radius - 2;
  const edgeY = centerY - 9;

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <circle cx={centerX} cy={centerY} r={radius} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={width} height={panelHeight} rx="5" fill={T.paper} stroke={T.rule12} />
      <text x={x + 14} y={y + 19} fill={color} style={f.mono(700, isNarrow ? 11 : 9, { upper: true, tracking: 0.12 })}>
        Sample {sample.id} / field {fieldCount}
      </text>
      <text x={x + width - 14} y={y + 19} textAnchor="end" fill={accent} style={f.mono(700, isNarrow ? 10 : 8, { upper: true, tracking: 0.07 })}>
        practice data
      </text>

      <circle cx={centerX} cy={centerY} r={radius} fill="#e5ead9" stroke={color} strokeWidth="1.8" />
      <g clipPath={`url(#${clipId})`} stroke={T.rule22} strokeWidth="0.7" opacity="0.75">
        {[-50, -25, 0, 25, 50].map((offset) => (
          <g key={offset}>
            <line x1={centerX + offset} y1={centerY - radius} x2={centerX + offset} y2={centerY + radius} />
            <line x1={centerX - radius} y1={centerY + offset} x2={centerX + radius} y2={centerY + offset} />
          </g>
        ))}
      </g>
      <g clipPath={`url(#${clipId})`}>
        {stomata.map((stoma, index) => (
          <StomaGlyph
            key={index}
            x={centerX + stoma.dx}
            y={centerY + stoma.dy}
            rotation={stoma.rotation}
            color={color}
          />
        ))}
      </g>

      <StomaGlyph x={edgeX} y={edgeY} rotation={20} color={T.mute} opacity={0.45} />
      <line x1={edgeX + 3} y1={edgeY - 9} x2={x + width - 34} y2={y + 57} stroke={T.mute} strokeWidth="0.8" />
      <text x={x + width - 14} y={y + 55} textAnchor="end" fill={T.mute} style={f.mono(600, isNarrow ? 9.5 : 6.7, { upper: true, tracking: 0.04 })}>
        exclude edge
      </text>
      <text x={centerX} y={y + panelHeight - 12} textAnchor="middle" fill={T.mute} style={f.mono(600, isNarrow ? 10 : 7.4, { upper: true, tracking: 0.07 })}>
        count only stomata fully inside
      </text>
    </g>
  );
}

function MethodPanel({ x, y, width, summaries, isReady, isNarrow, accent, color }) {
  const panelHeight = isNarrow ? 255 : 197;
  const innerX = x + 14;
  const columnGap = isNarrow ? 137 : 115;
  const methodStartY = y + 36;
  const methodRowGap = isNarrow ? 32 : 25;
  const dividerY = isNarrow ? y + 130 : y + 106;
  const statsTitleY = dividerY + 15;
  const axisY = dividerY + 26;
  const firstRowY = dividerY + (isNarrow ? 57 : 49);
  const rowGap = isNarrow ? 36 : 25;
  const plotLeft = isNarrow ? x + 32 : x + 36;
  const plotRight = isNarrow ? x + 132 : x + 118;
  const statsX = isNarrow ? x + 145 : x + 128;
  const plotWidth = plotRight - plotLeft;
  const xForCount = (value) => plotLeft + (value / 25) * plotWidth;

  return (
    <g>
      <rect x={x} y={y} width={width} height={panelHeight} rx="5" fill={T.paper2} stroke={T.rule12} />
      <text x={innerX} y={y + 19} fill={color} style={f.mono(700, isNarrow ? 11 : 9, { upper: true, tracking: 0.12 })}>
        One fixed method
      </text>

      {METHOD_CHECKS.map(([label, value], index) => {
        const itemX = innerX + (index % 2) * columnGap;
        const itemY = methodStartY + Math.floor(index / 2) * methodRowGap;
        return (
          <g key={label}>
            <circle cx={itemX + 4} cy={itemY + 4} r={isNarrow ? 5 : 4} fill={T.ok} />
            <path d={`M ${itemX + 2} ${itemY + 4} l 1.5 1.5 l 3 -3.5`} fill="none" stroke={T.paper} strokeWidth="0.9" />
            <text x={itemX + 13} y={itemY + 2} fill={color} style={f.mono(700, isNarrow ? 9.5 : 6.8, { upper: true, tracking: 0.05 })}>
              {label}
            </text>
            <text x={itemX + 13} y={itemY + (isNarrow ? 14 : 12)} fill={T.mute} style={f.sans(400, isNarrow ? 10 : 7.6)}>
              {value}
            </text>
          </g>
        );
      })}

      <line x1={innerX} y1={dividerY} x2={x + width - 14} y2={dividerY} stroke={T.rule12} />
      <text x={innerX} y={statsTitleY} fill={color} style={f.mono(700, isNarrow ? 10.5 : 8, { upper: true, tracking: 0.1 })}>
        Mean and range per equal field
      </text>
      <line x1={plotLeft} y1={axisY} x2={plotRight} y2={axisY} stroke={T.rule22} strokeWidth="0.7" />
      {[0, 10, 20].map((value) => (
        <g key={value}>
          <line x1={xForCount(value)} y1={axisY - 3} x2={xForCount(value)} y2={axisY + 3} stroke={T.rule22} />
          <text x={xForCount(value)} y={axisY + (isNarrow ? 14 : 10)} textAnchor="middle" fill={T.mute} style={f.mono(500, isNarrow ? 8.5 : 6.5)}>
            {value}
          </text>
        </g>
      ))}

      {PRACTICE_SAMPLES.map((sample, index) => {
        const summary = summaries[index];
        const rowY = firstRowY + index * rowGap;
        const sampleColor = index === 0 ? color : accent;
        return (
          <g key={sample.id} opacity={isReady ? 1 : 0.38}>
            <text x={innerX} y={rowY + 3} fill={sampleColor} style={f.mono(700, isNarrow ? 10.5 : 8.5)}>
              {sample.id}
            </text>
            <line x1={xForCount(summary.min)} y1={rowY} x2={xForCount(summary.max)} y2={rowY} stroke={sampleColor} strokeWidth="2" />
            <line x1={xForCount(summary.min)} y1={rowY - 4} x2={xForCount(summary.min)} y2={rowY + 4} stroke={sampleColor} />
            <line x1={xForCount(summary.max)} y1={rowY - 4} x2={xForCount(summary.max)} y2={rowY + 4} stroke={sampleColor} />
            <circle cx={xForCount(summary.mean)} cy={rowY} r="4" fill={sampleColor} stroke={T.paper} strokeWidth="1" />
            <text x={statsX} y={rowY + 3} fill={sampleColor} style={f.mono(700, isNarrow ? 9.5 : 7.2)}>
              {isReady ? `mean ${summary.mean.toFixed(1)} / range ${summary.min}-${summary.max}` : "need 3+ fields"}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function ExtraSampling() {
  const C = CAMP.trees.ink;
  const A = CAMP.trees.acc;
  const [sampleIndex, setSampleIndex] = useState(0);
  const [fieldCount, setFieldCount] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const svgTitleId = useId();
  const svgDescriptionId = useId();
  const clipId = `stomata-field-${useId().replaceAll(":", "")}`;
  const isNarrow = useMediaQuery("(max-width: 520px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const currentSample = PRACTICE_SAMPLES[sampleIndex];
  const currentFieldIndex = fieldCount - 1;
  const currentCount = currentSample.counts[currentFieldIndex];
  const isReady = fieldCount >= 3;
  const summaries = PRACTICE_SAMPLES.map((sample) => summarize(sample.counts, fieldCount));
  const currentSummary = summaries[sampleIndex];
  const practiceConclusion = isReady
    ? `sample ${summaries[0].mean > summaries[1].mean ? "A" : "B"} has the higher mean per equal field`
    : "count at least 3 fields before comparing";

  const stomata = useMemo(
    () => makeStomata(currentCount, sampleIndex * 10 + currentFieldIndex + 1),
    [currentCount, currentFieldIndex, sampleIndex],
  );

  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return undefined;
    if (fieldCount >= 6) {
      setIsPlaying(false);
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setFieldCount((current) => Math.min(6, current + 1));
    }, 950);
    return () => window.clearTimeout(timeoutId);
  }, [fieldCount, isPlaying, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) setIsPlaying(false);
  }, [prefersReducedMotion]);

  const selectSample = (nextIndex) => {
    setSampleIndex(nextIndex);
    setIsPlaying(false);
  };

  const selectFieldCount = (nextCount) => {
    setFieldCount(nextCount);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (prefersReducedMotion) {
      setFieldCount(6);
      setIsPlaying(false);
      return;
    }
    if (!isPlaying && fieldCount >= 6) setFieldCount(1);
    setIsPlaying((current) => !current);
  };

  const viewBox = isNarrow ? "0 0 320 550" : "0 0 560 270";
  const fieldLayout = isNarrow
    ? { x: 12, y: 48, width: 296 }
    : { x: 20, y: 49, width: 252 };
  const methodLayout = isNarrow
    ? { x: 12, y: 280, width: 296 }
    : { x: 290, y: 49, width: 250 };
  const playbackLabel = prefersReducedMotion
    ? fieldCount >= 6 ? "all fields shown" : "show all fields"
    : isPlaying ? "pause fields" : "play fields";
  const motionStyle = prefersReducedMotion ? { transition: "none" } : undefined;

  return (
    <div>
      <Field height={isNarrow ? 568 : 286}>
        <svg
          viewBox={viewBox}
          role="img"
          aria-labelledby={`${svgTitleId} ${svgDescriptionId}`}
          style={{ width: "100%", height: "100%" }}
        >
          <title id={svgTitleId}>Standardized stomata field-counting practice</title>
          <desc id={svgDescriptionId}>
            Practice sample {currentSample.id}, field {fieldCount}, contains {currentCount} fully visible stomata. Statistics use {fieldCount} equal fields. The comparison is evidence about relative stomatal density only, not actual water use.
          </desc>

          <text x={isNarrow ? 12 : 20} y="22" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.16 })}>
            Sampling and counting
          </text>
          <text x={isNarrow ? 12 : 20} y="37" fill={T.mute} style={f.mono(500, isNarrow ? 10 : 8.5, { upper: true, tracking: 0.09 })}>
            {isNarrow ? "equal fields, density-only conclusion" : "compare equal fields, then keep the conclusion limited"}
          </text>

          <FieldPanel
            {...fieldLayout}
            sample={currentSample}
            fieldCount={fieldCount}
            stomata={stomata}
            clipId={clipId}
            isNarrow={isNarrow}
            accent={A}
            color={C}
          />
          <MethodPanel
            {...methodLayout}
            summaries={summaries}
            isReady={isReady}
            isNarrow={isNarrow}
            accent={A}
            color={C}
          />
        </svg>
      </Field>

      <div
        role="group"
        aria-label="Practice leaf sample"
        style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}
      >
        {PRACTICE_SAMPLES.map((sample, index) => (
          <Btn
            key={sample.id}
            small
            color={index === 0 ? C : A}
            active={sampleIndex === index}
            aria-pressed={sampleIndex === index}
            style={motionStyle}
            title={`Inspect practice sample ${sample.id}`}
            onClick={() => selectSample(index)}
          >
            sample {sample.id}
          </Btn>
        ))}
        <Btn
          small
          icon={isPlaying ? Pause : Play}
          color={A}
          active={isPlaying}
          aria-pressed={prefersReducedMotion ? undefined : isPlaying}
          style={motionStyle}
          disabled={prefersReducedMotion && fieldCount >= 6}
          onClick={togglePlayback}
        >
          {playbackLabel}
        </Btn>
        <Tag color={isReady ? T.ok : T.warn}>{isReady ? "3+ fields ready" : "need 3+ fields"}</Tag>
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "10px 4px 0" }}>
        <Slider
          val={fieldCount}
          set={selectFieldCount}
          min={1}
          max={6}
          step={1}
          color={A}
          label="Fields included"
          suffix={`${fieldCount} / 6`}
        />
      </div>

      <div aria-live="polite" aria-atomic="true">
        <Readout items={[
          { l: "Current field", v: `${currentCount} stomata`, color: C },
          { l: "Fields used", v: `${fieldCount} equal fields`, color: A },
          { l: "Sample mean", v: isReady ? currentSummary.mean.toFixed(1) : "need 3+", color: isReady ? T.ok : T.warn },
          { l: "Sample range", v: isReady ? `${currentSummary.min}-${currentSummary.max}` : "need 3+" },
        ]} />
      </div>

      <Caption color={C}>
        This is an authored practice dataset. Use the same leaf surface, preparation,
        magnification, field area, and fully-inside counting rule for every sample. Count at
        least three fields, then report the mean and range. Here, {practiceConclusion}. Because
        the field area is held constant, that supports a relative stomatal-density comparison,
        not a whole-leaf total or an absolute per-area density unless the field is calibrated.
        Counts alone cannot rank actual water use. Aperture, pore size, gas exchange, species,
        leaf area, and growing conditions also matter.
      </Caption>
    </div>
  );
}

export { ExtraSampling };
