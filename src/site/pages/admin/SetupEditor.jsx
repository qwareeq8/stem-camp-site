// Setup editor: edit the site-wide config object. Unlike the list editors, the
// "config" draft is a single object, not an array. The top section covers the
// site title, tagline, hosted-by line, dates, and year. The camps section is a list
// editor over config.camps, where each camp's id is referenced by teams and the
// schedule. Publishing connection settings live in Advanced.
import { useEffect, useId, useRef, useState } from "react";
import { Plus } from "lucide-react";
import {
  useEditor, SaveBar, RowCard, AddButton,
  TextField, DatePickerField, NumberField, makeId, updateAt, removeAt, moveAt,
} from "./shared.jsx";
import { SectionTitle } from "../../ui.jsx";

const ACCENT_OPTIONS = [
  { label: "Trees", value: "#b04a2f" },
  { label: "PY-STEM", value: "#A85F12" },
  { label: "Cherry", value: "#9D2235" },
  { label: "Forest", value: "#2a5736" },
];
const TONE_OPTIONS = [
  { saturation: 52, lightness: 34 },
  { saturation: 58, lightness: 42 },
  { saturation: 62, lightness: 50 },
  { saturation: 56, lightness: 58 },
  { saturation: 50, lightness: 66 },
];
const DATE_FMT = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const DATE_PARTS = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });

function hexToRgb(hex) {
  const clean = String(hex || "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(clean)) return { r: 157, g: 34, b: 53 };
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function hexToHue(hex) {
  const { r, g, b } = hexToRgb(hex);
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  if (max === min) return 350;
  let hue;
  if (max === r1) hue = (60 * ((g1 - b1) / (max - min)) + 360) % 360;
  else if (max === g1) hue = 60 * ((b1 - r1) / (max - min)) + 120;
  else hue = 60 * ((r1 - g1) / (max - min)) + 240;
  return Math.round(hue);
}

function hslToHex(hue, saturation, lightness) {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return `#${[r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("")}`;
}

// Camp accents render as small text on the public pages' light paper (Home,
// Schedule, Teams), so every color the picker offers must meet WCAG AA (4.5:1)
// against it.
const PAPER = "#FAFAF8";
const MIN_CONTRAST = 4.5;

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const channel = v / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastOnPaper(hex) {
  const lum = relativeLuminance(hex);
  const paperLum = relativeLuminance(PAPER);
  return (Math.max(lum, paperLum) + 0.05) / (Math.min(lum, paperLum) + 0.05);
}

// Darken a tone just enough to pass AA on paper, keeping the hue recognizable.
// Tones that already pass come back unchanged.
function accessibleToneHex(hue, saturation, lightness) {
  let l = lightness;
  let hex = hslToHex(hue, saturation, l);
  while (l > 0 && contrastOnPaper(hex) < MIN_CONTRAST) {
    l -= 1;
    hex = hslToHex(hue, saturation, l);
  }
  return hex;
}

function dateParts(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!m) return null;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return {
    date,
    year: Number(m[1]),
    month: DATE_PARTS.formatToParts(date).find((p) => p.type === "month")?.value || "",
    day: Number(m[3]),
    label: DATE_FMT.format(date),
  };
}

function formatDateRange(startDate, endDate, includeYear = true) {
  const start = dateParts(startDate);
  const end = dateParts(endDate);
  if (!start && !end) return "";
  if (start && !end) return start.label;
  if (!start && end) return end.label;
  if (start.year === end.year && start.month === end.month) {
    return `${start.month} ${start.day} to ${end.day}${includeYear ? `, ${start.year}` : ""}`;
  }
  if (start.year === end.year) {
    return `${start.month} ${start.day} to ${end.month} ${end.day}${includeYear ? `, ${start.year}` : ""}`;
  }
  return `${start.label} to ${end.label}`;
}

function formatOverallDates(camps) {
  const ranges = camps
    .map((camp) => ({
      full: formatDateRange(camp.startDate, camp.endDate, true),
      short: formatDateRange(camp.startDate, camp.endDate, false),
      year: dateParts(camp.endDate || camp.startDate)?.year,
    }))
    .filter((range) => range.full);
  if (!ranges.length) return "";
  const sameYear = ranges.every((range) => range.year && range.year === ranges[0].year);
  if (sameYear && ranges.length > 1) {
    return `${ranges.map((range) => range.short).join(" and ")}, ${ranges[0].year}`;
  }
  return ranges.map((range) => range.full).join(" and ");
}

function DateSummary({ label, value, className = "" }) {
  return (
    <div className={`field${className ? ` ${className}` : ""}`}>
      <label>{label}</label>
      <div className="input date-summary" aria-live="polite">
        {value || "Choose start and end dates"}
      </div>
    </div>
  );
}

function AccentPicker({ value, onChange }) {
  const current = value || ACCENT_OPTIONS[0].value;
  const id = useId();
  const popoverId = `${id}-popover`;
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState(hexToHue(current));
  const wrapRef = useRef(null);
  const isPreset = ACCENT_OPTIONS.some((opt) => opt.value.toLowerCase() === String(current).toLowerCase());

  useEffect(() => {
    setHue(hexToHue(current));
  }, [current]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="field accent-field" ref={wrapRef}>
      <label>Accent</label>
      <div className="accent-picker" role="radiogroup" aria-label="Accent color">
        {ACCENT_OPTIONS.map((opt) => {
          const active = opt.value.toLowerCase() === String(current).toLowerCase();
          return (
            <button
              key={opt.value}
              type="button"
              className={`accent-swatch${active ? " active" : ""}`}
              style={{ background: opt.value }}
              onClick={() => onChange(opt.value)}
              role="radio"
              aria-checked={active}
              aria-label={opt.label}
              title={opt.label}
            />
          );
        })}
        <button
          type="button"
          className={`accent-swatch accent-custom-trigger${!isPreset ? " active" : ""}`}
          style={!isPreset ? { background: current, color: "#fff" } : undefined}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          aria-label="Custom accent color"
          title="Custom accent"
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div id={popoverId} className="accent-popover" role="dialog" aria-label="Custom accent color">
          <label className="accent-custom-label" htmlFor={`${id}-hue`}>Hue</label>
          <input
            id={`${id}-hue`}
            className="accent-hue-range"
            type="range"
            min="0"
            max="359"
            value={hue}
            onChange={(e) => {
              const nextHue = Number(e.target.value);
              setHue(nextHue);
              onChange(accessibleToneHex(nextHue, 58, 42));
            }}
          />
          <div className="accent-tone-grid" role="radiogroup" aria-label="Custom accent tone">
            {TONE_OPTIONS.map((tone) => {
              const color = accessibleToneHex(hue, tone.saturation, tone.lightness);
              const active = color.toLowerCase() === String(current).toLowerCase();
              return (
                <button
                  key={`${tone.saturation}-${tone.lightness}`}
                  type="button"
                  className={`accent-tone${active ? " active" : ""}`}
                  style={{ background: color }}
                  onClick={() => onChange(color)}
                  role="radio"
                  aria-checked={active}
                  aria-label="Choose custom tone"
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SetupEditor() {
  const ed = useEditor("config");
  const cfg = ed.draft || {};
  const camps = cfg.camps || [];

  // Update a top-level config key immutably.
  const setKey = (key, value) => ed.setDraft({ ...cfg, [key]: value });

  function withDerivedDates(nextCamps) {
    // Derive a dates label only where picker dates exist; a legacy row may
    // carry only its hand-written string, which unrelated edits must keep.
    const next = {
      ...cfg,
      camps: nextCamps.map((camp) => (
        camp.startDate || camp.endDate
          ? { ...camp, dates: formatDateRange(camp.startDate, camp.endDate, true) }
          : camp
      )),
    };
    const overall = formatOverallDates(next.camps);
    if (overall) next.dates = overall;
    return next;
  }

  // Camp list helpers: patch, add, remove, and reorder within config.camps.
  const setCamp = (i, patch) => ed.setDraft(withDerivedDates(updateAt(camps, i, patch)));
  const removeCamp = (i) => ed.setDraft(withDerivedDates(removeAt(camps, i)));
  const moveCamp = (i, dir) => ed.setDraft(withDerivedDates(moveAt(camps, i, dir)));

  function addCamp() {
    ed.setDraft(withDerivedDates([
        ...camps,
        { id: makeId("camp"), name: "", sub: "", accent: "#9D2235", tagline: "", dates: "", startDate: "", endDate: "", campus: "" },
      ]));
  }

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        Setup holds the site-wide basics: the title and tagline in the header, the
        dates and hosted-by line shown around the site, and the list of camps that teams
        and the schedule reference by id.
      </div>

      <SectionTitle>Site basics</SectionTitle>
      <div className="adm-row setup-site-row">
        <div className="setup-basic-grid">
          <TextField label="Site title" value={cfg.siteTitle} onChange={(v) => setKey("siteTitle", v)} placeholder="STEM Camp Field Notebook" />
          <div className="setup-year-field">
            <NumberField
              label="Year"
              value={cfg.year}
              onChange={(v) => {
                // Clearing an optional number must DELETE the key, not store
                // "": the schema check uses hasOwnProperty, so an own
                // `year: ""` would fail validation and block Save.
                const next = { ...cfg };
                if (v === "") delete next.year; else next.year = v;
                ed.setDraft(next);
              }}
              placeholder="2026"
            />
          </div>
          <div className="setup-wide-field">
            <TextField label="Tagline" value={cfg.tagline} onChange={(v) => setKey("tagline", v)} placeholder="Two camps, one notebook." />
          </div>
          <div className="setup-dates-row">
            <DateSummary label="Dates" value={cfg.dates || formatOverallDates(camps)} className="setup-overall-dates" />
            <TextField label="Hosted by" value={cfg.location} onChange={(v) => setKey("location", v)} placeholder="Hosted by Temple University College of Engineering" />
          </div>
        </div>
      </div>

      <SectionTitle>Camps</SectionTitle>
      {camps.map((c, i) => (
        <RowCard
          key={c.id || i}
          className="setup-camp-row"
          onRemove={() => removeCamp(i)}
          onUp={i > 0 ? () => moveCamp(i, -1) : undefined}
          onDown={i < camps.length - 1 ? () => moveCamp(i, 1) : undefined}
          cols="minmax(18ch, 24ch) minmax(20ch, 28ch) max-content"
        >
          <TextField label="Camp name" value={c.name} onChange={(v) => setCamp(i, { name: v })} placeholder="From Trees to Tech" />
          <TextField label="Subtitle" value={c.sub} onChange={(v) => setCamp(i, { sub: v })} placeholder="Field. Forest. Future." />
          <AccentPicker value={c.accent} onChange={(v) => setCamp(i, { accent: v })} />
          <div className="setup-wide-field">
            <TextField label="Tagline" value={c.tagline} onChange={(v) => setCamp(i, { tagline: v })} placeholder="Nature as engineer: ecology, biomimicry, sensors." />
          </div>
          <div className="setup-camp-meta-grid">
            <DateSummary label="Dates" value={c.dates || formatDateRange(c.startDate, c.endDate, true)} className="setup-camp-dates" />
            <TextField label="Campus" value={c.campus} onChange={(v) => setCamp(i, { campus: v })} placeholder="Ambler Campus" />
            <DatePickerField label="Start date" value={c.startDate} onChange={(v) => setCamp(i, { startDate: v })} startDate={c.startDate || c.endDate} />
            <DatePickerField label="End date" value={c.endDate} onChange={(v) => setCamp(i, { endDate: v })} startDate={c.startDate || c.endDate} />
          </div>
        </RowCard>
      ))}

      <div style={{ marginTop: 4, marginBottom: 16 }}>
        <AddButton onClick={addCamp}>Add camp</AddButton>
      </div>

      <SaveBar ed={ed} />
    </div>
  );
}
