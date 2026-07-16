// Shared scaffolding for the admin authoring editors. Every per-collection
// editor uses useEditor(name) to hold a working draft of that collection, mutates
// it through the small form-field components and array helpers here, and renders
// <SaveBar ed={ed} /> to validate-and-save the draft to Supabase. This keeps each
// editor small and uniform; the store and schema layers underneath are unchanged.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DayPicker } from "@daypicker/react";
import "@daypicker/react/style.css";
import {
  getCollection,
  getCollectionStatus,
  useCollection,
  useCollectionStatus,
  commitCollection,
  retryCollection,
  isOverridden,
  isSupabaseConfigured,
} from "../../lib/store.js";
import {
  isWritableHydrationStatus,
  sameHydrationRevision,
} from "../../lib/supabaseConcurrency.js";
import { validateCollection } from "../../lib/schemas.js";
import { Card, Badge, Btn, downloadJson } from "../../ui.jsx";
import { Save, Trash2, Plus, Minus, ChevronUp, ChevronDown, CalendarDays, RefreshCw } from "lucide-react";

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const DAY_LABEL = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
});
// The plus/minus buttons nudge a time by this many minutes from its current
// value. This is only a convenience step, NOT a grid the value snaps to: a typed
// time is kept exactly as entered, so blocks can start and end at any minute.
const TIME_STEP_MINUTES = 5;

export function dayLabelFromDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!m) return "";
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return DAY_LABEL.format(date);
}

export function dateFromDayLabel(label, year) {
  const m = /\b([A-Z][a-z]{2})\s+(\d{1,2})\b/.exec(label || "");
  if (!m || MONTHS[m[1]] === undefined) return "";
  const month = String(MONTHS[m[1]] + 1).padStart(2, "0");
  const day = String(Number(m[2])).padStart(2, "0");
  return `${Number(year) || 2026}-${month}-${day}`;
}

function dateFromIso(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!m) return undefined;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function isoFromDate(date) {
  if (!(date instanceof Date)) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function minutesFromTime(value) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value || "");
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function timeFromMinutes(value) {
  const minutes = Math.max(0, Math.min(23 * 60 + 59, Math.round(value)));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function shiftTime(value, delta) {
  const current = minutesFromTime(value);
  const base = current == null ? 9 * 60 : current;
  return timeFromMinutes(base + delta);
}

// Deep-clone via JSON so a draft never aliases the live store value.
export function clone(value) {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

// A short unique-ish id for a new record. Called from event handlers only, so
// Date.now()/Math.random() are fine here (they never run during render).
export function makeId(prefix) {
  const rand = Math.floor(Math.random() * 1e4).toString(36);
  return `${prefix}-${Date.now().toString(36)}${rand}`;
}

// Immutable array helpers the list editors use.
export function updateAt(arr, i, patch) {
  return arr.map((row, idx) => (idx === i ? { ...row, ...patch } : row));
}
export function removeAt(arr, i) {
  return arr.filter((_, idx) => idx !== i);
}
export function moveAt(arr, i, dir) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

// Dirty drafts currently mounted, keyed per editor. The console checks this
// before a tab switch so unsaved edits are never silently discarded.
const dirtyDrafts = new Set();
export function reportDirtyDraft(key, dirty) {
  if (dirty) dirtyDrafts.add(key);
  else dirtyDrafts.delete(key);
}
export function anyDirtyDraft() {
  return dirtyDrafts.size > 0;
}

// The per-collection editor state: a working draft plus save/retry/download
// actions. Editors read ed.draft, write with ed.setDraft, and drop <SaveBar/> in.
export function useEditor(name) {
  // Subscribe to the live store so a hydrate that lands after mount is seen.
  const live = useCollection(name);
  const hydration = useCollectionStatus(name);
  const [draft, setDraftState] = useState(() => clone(live));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { tone: "ok" | "warn", text }
  const [overridden, setOverridden] = useState(() => isOverridden(name));
  const [stale, setStale] = useState(false);
  // The store value the draft was cloned from. When the store moves (hydrate,
  // raw-JSON save, bulk data op) a pristine draft is refreshed to match; a
  // dirty draft is never touched.
  const baseline = useRef(live);
  // Keep the latest draft available to an async save. Form controls remain
  // editable while the request is in flight; a response must never erase text
  // entered after Save was clicked.
  const draftRef = useRef(draft);
  const operation = useRef(false);
  // A persisted sample/starting-data overlay is a deliberate draft even when
  // its JSON exactly matches the current baseline reference.
  const baselineOverridden = useRef(isOverridden(name));
  // The server revision that produced the baseline. This deliberately does not
  // advance for a dirty draft: optimistic concurrency must check the version
  // the editor actually loaded, not whatever version the store learned later.
  const baseStatus = useRef(hydration);

  function setDraft(next) {
    const value = typeof next === "function" ? next(draftRef.current) : next;
    draftRef.current = value;
    setDraftState(value);
  }

  const errors = useMemo(() => validateCollection(name, draft), [name, draft]);
  const configured = isSupabaseConfigured();
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline.current);
  const canSave = configured
    && isWritableHydrationStatus(hydration)
    && sameHydrationRevision(baseStatus.current, hydration)
    && !stale;

  useEffect(() => {
    const valueMoved = live !== baseline.current;
    const statusMoved = hydration !== baseStatus.current;
    if (!valueMoved && !statusMoved) return;
    const pristine = JSON.stringify(draft) === JSON.stringify(baseline.current)
      && !baselineOverridden.current;
    if (pristine) {
      baseline.current = live;
      baseStatus.current = hydration;
      baselineOverridden.current = isOverridden(name);
      setDraft(clone(live));
      setOverridden(isOverridden(name));
      setStale(false);
      return;
    }
    if (
      isWritableHydrationStatus(hydration)
      && (valueMoved || !sameHydrationRevision(baseStatus.current, hydration))
    ) {
      setStale(true);
      setMessage({
        tone: "warn",
        text: "Live data changed while this draft was open. Reload the live data and review your changes before saving.",
      });
    }
  }, [name, live, hydration, draft]);

  useEffect(() => {
    reportDirtyDraft(name, dirty);
    return () => reportDirtyDraft(name, false);
  }, [name, dirty]);

  async function save() {
    if (operation.current) return;
    if (errors.length) {
      setMessage({ tone: "warn", text: `Fix ${errors.length} validation issue${errors.length === 1 ? "" : "s"} before saving.` });
      return;
    }
    if (!configured) {
      setMessage({ tone: "warn", text: "Publishing is not connected. Ask the site maintainer to connect the admin backend before saving." });
      return;
    }
    if (!isWritableHydrationStatus(hydration)) {
      setMessage({
        tone: "warn",
        text: hydration.state === "loading" || hydration.state === "pending"
          ? "Live data is still loading. Wait for it to finish before saving."
          : "Live data did not load safely. Retry the live load before saving.",
      });
      return;
    }
    if (!canSave) {
      setStale(true);
      setMessage({
        tone: "warn",
        text: "A newer live revision is available. Reload it and review your changes before saving.",
      });
      return;
    }
    const submitted = clone(draftRef.current);
    operation.current = true;
    setBusy(true);
    setMessage({ tone: "ok", text: `Saving ${name}...` });
    try {
      await commitCollection(name, submitted, { baseStatus: baseStatus.current });
      const fresh = getCollection(name);
      const editedWhileSaving = JSON.stringify(draftRef.current) !== JSON.stringify(submitted);
      baseline.current = fresh;
      baseStatus.current = getCollectionStatus(name);
      baselineOverridden.current = false;
      if (!editedWhileSaving) setDraft(clone(fresh));
      setOverridden(isOverridden(name));
      setStale(false);
      setMessage({
        tone: "ok",
        text: editedWhileSaving
          ? `Saved ${name}. Changes made during the save remain in this unsaved draft.`
          : `Saved ${name}. Visitors see it on their next page load.`,
      });
    } catch (err) {
      if (err.code === "COLLECTION_CONFLICT") setStale(true);
      setMessage({ tone: "warn", text: err.message });
    } finally {
      operation.current = false;
      setBusy(false);
    }
  }

  async function retry() {
    if (operation.current) return;
    const draftAtStart = JSON.stringify(draftRef.current);
    const wasPristine = draftAtStart === JSON.stringify(baseline.current)
      && !baselineOverridden.current;
    operation.current = true;
    setBusy(true);
    setMessage({ tone: "ok", text: `Reloading live ${name}...` });
    try {
      await retryCollection(name);
      const freshStatus = getCollectionStatus(name);
      const fresh = getCollection(name);
      if (!isWritableHydrationStatus(freshStatus)) {
        setMessage({
          tone: "warn",
          text: freshStatus.state === "invalid"
            ? `Live ${name} data is invalid. Saving remains blocked.`
            : `Could not load live ${name}. Saving remains blocked.`,
        });
        return;
      }
      const untouched = JSON.stringify(draftRef.current) === draftAtStart;
      if (wasPristine && untouched) {
        baseline.current = fresh;
        baseStatus.current = freshStatus;
        baselineOverridden.current = false;
        setDraft(clone(fresh));
        setOverridden(false);
        setStale(false);
        setMessage({ tone: "ok", text: freshStatus.state === "absent" ? `No published ${name} row exists yet. The first Save will create it.` : `Reloaded live ${name}.` });
        return;
      }
      setStale(true);
      setMessage({
        tone: "warn",
        text: `Reloaded live ${name}, but kept your draft unchanged. Use Reload live data to discard the draft before saving.`,
      });
    } finally {
      operation.current = false;
      setBusy(false);
    }
  }

  function reloadLive() {
    if (!isWritableHydrationStatus(hydration)) return;
    const fresh = getCollection(name);
    baseline.current = fresh;
    baseStatus.current = getCollectionStatus(name);
    baselineOverridden.current = false;
    setDraft(clone(fresh));
    setOverridden(isOverridden(name));
    setStale(false);
    setMessage({ tone: "ok", text: `Reloaded live ${name}. The previous draft was discarded.` });
  }

  function download() {
    if (errors.length) {
      setMessage({ tone: "warn", text: `Cannot download: ${errors.length} validation issue${errors.length === 1 ? "" : "s"}.` });
      return;
    }
    downloadJson(`${name}.json`, draft);
    setMessage({ tone: "ok", text: `Downloaded ${name}.json. Commit it to src/data, or Save to publish.` });
  }

  return {
    name,
    draft,
    setDraft,
    save,
    retry,
    reloadLive,
    download,
    busy,
    message,
    setMessage,
    errors,
    dirty,
    overridden,
    configured,
    hydration,
    stale,
    canSave,
  };
}

// ---- form field components (bound to a draft, controlled) ----

function useFieldId(prefix) {
  const id = useId();
  return `${prefix}-${id}`;
}

export function TextField({ label, value, onChange, placeholder, hint, mono, type = "text", step }) {
  const id = useFieldId("f");
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className={`input${mono ? " mono" : ""}`}
        type={type}
        value={value ?? ""}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
      {hint && <span className="muted" style={{ fontSize: 11 }}>{hint}</span>}
    </div>
  );
}

export function TimeField({ label, value, onChange }) {
  const id = useFieldId("time");

  function normalize() {
    const minutes = minutesFromTime(value);
    if (minutes != null) onChange(timeFromMinutes(minutes));
  }

  return (
    <div className="field time-step-field">
      <label htmlFor={id}>{label}</label>
      <div className="time-step-wrap">
        <input
          id={id}
          className="input mono"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{1,2}:[0-9]{2}"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={normalize}
          placeholder="09:00"
          spellCheck={false}
        />
        <div className="time-step-actions" role="group" aria-label={`${label} time controls`}>
          <Btn
            type="button"
            variant="ghost"
            className="icon"
            onClick={() => onChange(shiftTime(value, TIME_STEP_MINUTES))}
            aria-label={`Increase ${label} by ${TIME_STEP_MINUTES} minutes`}
          >
            <Plus size={13} aria-hidden="true" />
          </Btn>
          <Btn
            type="button"
            variant="ghost"
            className="icon"
            onClick={() => onChange(shiftTime(value, -TIME_STEP_MINUTES))}
            aria-label={`Decrease ${label} by ${TIME_STEP_MINUTES} minutes`}
          >
            <Minus size={13} aria-hidden="true" />
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function DatePickerField({ label, value, onChange, startDate }) {
  const id = useId();
  const popoverId = `${id}-popover`;
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const selected = dateFromIso(value);
  const defaultMonth = selected || dateFromIso(startDate) || new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(defaultMonth);
  const baseYear = defaultMonth.getFullYear();
  const fromMonth = useMemo(() => new Date(baseYear - 2, 0, 1), [baseYear]);
  const toMonth = useMemo(() => new Date(baseYear + 2, 11, 1), [baseYear]);

  useEffect(() => {
    if (selected) setMonth(selected);
  }, [selected?.getTime()]);

  // Close the popover and return focus to the trigger so a keyboard user keeps
  // their place (the dialog otherwise unmounts with focus inside it).
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (!wrapRef.current?.contains(e.target)) close();
    }
    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="field date-picker-field" ref={wrapRef}>
      <label id={`${id}-label`} htmlFor={`${id}-trigger`}>{label}</label>
      <button
        type="button"
        id={`${id}-trigger`}
        ref={triggerRef}
        className="input date-picker-trigger"
        aria-labelledby={`${id}-label`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{value ? dayLabelFromDate(value) : "Choose date"}</span>
        <CalendarDays size={14} aria-hidden="true" />
      </button>
      {open && (
        <div id={popoverId} className="date-picker-popover" role="dialog" aria-labelledby={`${id}-label`}>
          <DayPicker
            mode="single"
            selected={selected}
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              if (!date) return;
              onChange(isoFromDate(date));
              close();
            }}
            startMonth={fromMonth}
            endMonth={toMonth}
            defaultMonth={defaultMonth}
            captionLayout="dropdown"
            navLayout="after"
            role="application"
            aria-label={`Calendar for ${label}`}
            autoFocus
            footer={value ? `Selected ${dayLabelFromDate(value)}` : "No date selected"}
          />
        </div>
      )}
    </div>
  );
}

export function NumberField({ label, value, onChange, placeholder, hint, min, max, step }) {
  const id = useFieldId("n");
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input mono"
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        placeholder={placeholder}
      />
      {hint && <span className="muted" style={{ fontSize: 11 }}>{hint}</span>}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, hint, disabled }) {
  // options: [{ value, label }] or string[]
  const id = useFieldId("s");
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && <span className="muted" style={{ fontSize: 11 }}>{hint}</span>}
    </div>
  );
}

export function IconChoiceField({ label, value, onChange, options, className = "" }) {
  const labelId = useFieldId("icon");
  const btnRefs = useRef([]);
  const current = value || options[0]?.value || "";
  // The single tab stop for the radio group; falls back to the first option
  // when the stored value matches none.
  const currentIndex = Math.max(0, options.findIndex((o) => o.value === current));

  // Radio-group keyboard model: arrows move (and select) within the group.
  function onKeyDown(e, index) {
    const dir =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1
      : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (index + dir + options.length) % options.length;
    onChange(options[next].value);
    btnRefs.current[next]?.focus();
  }

  return (
    <div className={`field icon-choice-field${className ? ` ${className}` : ""}`}>
      <label id={labelId}>{label}</label>
      <div className="icon-choice-grid" role="radiogroup" aria-labelledby={labelId}>
        {options.map(({ value: optionValue, label: optionLabel, Icon }, index) => {
          const active = optionValue === current;
          return (
            <button
              key={optionValue}
              ref={(el) => { btnRefs.current[index] = el; }}
              type="button"
              className={`icon-choice${active ? " active" : ""}`}
              onClick={() => onChange(optionValue)}
              onKeyDown={(e) => onKeyDown(e, index)}
              role="radio"
              aria-checked={active}
              tabIndex={index === currentIndex ? 0 : -1}
              aria-label={optionLabel}
              title={optionLabel}
            >
              <Icon size={18} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, hint, rows = 3 }) {
  const id = useFieldId("t");
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        className="input"
        value={value ?? ""}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        style={{ resize: "vertical" }}
      />
      {hint && <span className="muted" style={{ fontSize: 11 }}>{hint}</span>}
    </div>
  );
}

// A single editable record: a bordered card with an optional title and a remove
// button, plus a CSS-grid body whose columns the caller controls via `cols`.
// `entityLabel` (or a string `title`) names the row inside the action buttons'
// accessible names, e.g. "Remove Moss Circuit".
export function RowCard({ title, entityLabel, onRemove, onUp, onDown, children, cols = "1fr", className = "" }) {
  const hasActions = Boolean(onUp || onDown || onRemove);
  const subject = entityLabel || (typeof title === "string" ? title : "");
  const actionName = (verb) => (subject ? `${verb} ${subject}` : verb);
  return (
    <div className={`adm-row${className ? ` ${className}` : ""}`}>
      {title != null && <div className="adm-row-head"><span className="mono">{title}</span></div>}
      {hasActions && (
        <div className="adm-row-actions" role="group" aria-label="Row actions">
          {onUp && (
            <Btn variant="ghost" className="icon" onClick={onUp} aria-label={actionName("Move up")}><ChevronUp size={13} aria-hidden="true" /></Btn>
          )}
          {onDown && (
            <Btn variant="ghost" className="icon" onClick={onDown} aria-label={actionName("Move down")}><ChevronDown size={13} aria-hidden="true" /></Btn>
          )}
          {onRemove && (
            <Btn variant="ghost" className="icon" onClick={onRemove} aria-label={actionName("Remove")}><Trash2 size={13} aria-hidden="true" /></Btn>
          )}
        </div>
      )}
      <div className="adm-grid" style={{ gridTemplateColumns: cols }}>{children}</div>
    </div>
  );
}

export function AddButton({ onClick, children }) {
  return (
    <Btn variant="ghost" onClick={onClick}>
      <Plus size={14} aria-hidden="true" /> {children}
    </Btn>
  );
}

// An empty-state row prompting the first add, shown when a list draft is empty.
export function EmptyRows({ children }) {
  return <div className="empty" style={{ padding: 24, marginBottom: 10 }}>{children}</div>;
}

// The persistent action bar: Save / Reset / Download, the live-vs-overlay badge,
// validation errors, and the status line. Every editor renders one of these.
export function SaveBar({ ed }) {
  const { errors, dirty, overridden, busy, message, hydration, stale, configured, canSave } = ed;
  const needsRetry = configured && ["pending", "failed", "invalid", "conflict"].includes(hydration.state);
  const loadBlocked = configured && ["failed", "invalid", "conflict"].includes(hydration.state);

  let badge = <Badge tone="ok">Saved</Badge>;
  if (!configured || hydration.state === "seed-only") badge = <Badge tone="warn">Not connected</Badge>;
  else if (hydration.state === "pending" || hydration.state === "loading") badge = <Badge tone="warn">Loading live data</Badge>;
  else if (hydration.state === "failed") badge = <Badge tone="warn">Load failed</Badge>;
  else if (hydration.state === "invalid") badge = <Badge tone="warn">Live data invalid</Badge>;
  else if (hydration.state === "conflict") badge = <Badge tone="warn">Write conflict</Badge>;
  else if (stale) badge = <Badge tone="warn">Newer live data</Badge>;
  else if (dirty) badge = <Badge tone="warn">Unsaved changes</Badge>;
  else if (overridden) badge = <Badge tone="warn">Preview only</Badge>;
  else if (hydration.state === "absent") badge = <Badge tone="warn">Not published yet</Badge>;

  return (
    <>
      {loadBlocked && (
        <div className="adm-err" role="alert">
          <strong>{hydration.state === "invalid" ? "Live data is invalid." : hydration.state === "conflict" ? "A newer live revision exists." : "Live data could not be loaded."}</strong>{" "}
          Saving is blocked until Retry live data completes and the draft is reviewed.
        </div>
      )}
      {errors.length > 0 && (
        <div className="adm-err" role="alert">
          {errors.length} validation issue{errors.length === 1 ? "" : "s"}:
          <ul>
            {errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
            {errors.length > 5 && <li>(+{errors.length - 5} more)</li>}
          </ul>
        </div>
      )}
      <div className="adm-bar" aria-busy={busy || hydration.state === "loading" ? "true" : undefined}>
        <Btn variant="accent" onClick={ed.save} disabled={busy || errors.length > 0 || !canSave}>
          <Save size={14} aria-hidden="true" /> {busy ? "Saving..." : "Save"}
        </Btn>
        {needsRetry && (
          <Btn variant="ghost" onClick={ed.retry} disabled={busy}>
            <RefreshCw size={14} aria-hidden="true" /> Retry live data
          </Btn>
        )}
        {stale && isWritableHydrationStatus(hydration) && (
          <Btn variant="ghost" onClick={ed.reloadLive} disabled={busy}>
            <RefreshCw size={14} aria-hidden="true" /> Reload live data
          </Btn>
        )}
        <span className="spacer" />
        {badge}
      </div>
      {message && (
        <p
          role="status"
          aria-live="polite"
          className="mono"
          style={{ fontSize: 13, marginTop: 12, marginBottom: 0, color: message.tone === "warn" ? "var(--warn-text)" : "var(--ok-text)" }}
        >
          {message.text}
        </p>
      )}
    </>
  );
}

// Used by editors that need the current list of teams/camps/station codes for
// select inputs. Subscribes to the live store (not a draft) so cross-references
// resolve and pickers refresh when hydration or a save lands.
export function useRefData() {
  const teams = useCollection("teams") || [];
  const members = useCollection("members") || [];
  const config = useCollection("config") || {};
  const camps = config.camps || [];
  const schedule = useCollection("schedule") || [];
  const catalog = useCollection("catalog") || [];
  // Station codes that appear in the schedule, grouped for score/award pickers.
  const codes = [];
  for (const day of schedule) {
    for (const b of day.blocks || []) {
      const scoreCode = b.scoreCode || b.code;
      if (scoreCode && !codes.find((c) => c.code === scoreCode)) {
        codes.push({ code: scoreCode, resourceCode: b.code || scoreCode, title: b.title, camp: b.camp || day.camp });
      }
    }
  }
  codes.sort((a, b) => a.code.localeCompare(b.code));
  return { teams, members, camps, schedule, codes, catalog };
}

export { Card };
