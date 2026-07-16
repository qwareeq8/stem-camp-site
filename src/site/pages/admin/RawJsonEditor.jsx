// Advanced fallback editor: edit any collection as raw JSON. This is the escape
// hatch behind the friendly form editors -- it can express anything the schema
// allows, including fields the forms do not surface. It runs the same
// validate-then-commit path as the forms, so a malformed edit is rejected before
// any network call.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCollection,
  getCollectionStatus,
  useCollection,
  useCollectionStatus,
  commitCollection,
  retryCollection,
  isOverridden,
  isSupabaseConfigured,
  SEED_DATA,
} from "../../lib/store.js";
import {
  isWritableHydrationStatus,
  sameHydrationRevision,
} from "../../lib/supabaseConcurrency.js";
import { validate } from "../../lib/schemas.js";
import { verifyFileCollection } from "../../lib/fileSize.js";
import { Card, Badge, Btn, SectionTitle, downloadJson } from "../../ui.jsx";
import { Database, Save, RotateCcw, Download, RefreshCw } from "lucide-react";
import { reportDirtyDraft } from "./shared.jsx";

const COLLECTIONS = [
  "teams", "members", "scores", "tickets", "catalog",
  "schedule", "achievements", "prizes", "files", "config",
];

export default function RawJsonEditor({ onLoadSample, onClearPreviews }) {
  const [name, setName] = useState("teams");
  const [text, setTextState] = useState(() => JSON.stringify(getCollection("teams"), null, 2));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [overridden, setOverridden] = useState(() => isOverridden("teams"));
  const [stale, setStale] = useState(false);
  const configured = isSupabaseConfigured();
  const live = useCollection(name);
  const hydration = useCollectionStatus(name);
  const baseline = useRef(live);
  const baseStatus = useRef(hydration);
  const textRef = useRef(text);
  const operation = useRef(false);
  const baselineOverridden = useRef(isOverridden("teams"));

  function setText(next) {
    const value = typeof next === "function" ? next(textRef.current) : next;
    textRef.current = value;
    setTextState(value);
  }

  // True when the textarea no longer matches the revision it was loaded from.
  // Reported to the shared dirty registry so the console confirms before a tab
  // switch.
  const dirty = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(text)) !== JSON.stringify(baseline.current);
    } catch {
      return text !== JSON.stringify(baseline.current, null, 2);
    }
  }, [text, live, hydration]);
  const canSave = configured
    && isWritableHydrationStatus(hydration)
    && sameHydrationRevision(baseStatus.current, hydration)
    && !stale;
  useEffect(() => {
    reportDirtyDraft(`raw:${name}`, dirty);
    return () => reportDirtyDraft(`raw:${name}`, false);
  }, [name, dirty]);

  // The store value the textarea was rendered from. When the store moves
  // (hydrate, panel save) pristine text is refreshed so the editor never
  // trusts a pre-hydration snapshot; typed edits are never touched.
  useEffect(() => {
    const valueMoved = live !== baseline.current;
    const statusMoved = hydration !== baseStatus.current;
    if (!valueMoved && !statusMoved) return;
    const pristine = text === JSON.stringify(baseline.current, null, 2)
      && !baselineOverridden.current;
    if (pristine) {
      baseline.current = live;
      baseStatus.current = hydration;
      baselineOverridden.current = isOverridden(name);
      setText(JSON.stringify(live, null, 2));
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
        text: "Live data changed while this JSON draft was open. Reload live data before saving.",
      });
    }
  }, [name, live, hydration, text]);

  function select(next) {
    if (next === name || operation.current) return;
    // Guard against silently discarding unsaved edits: confirm before
    // switching collections while the text differs from the stored value.
    if (dirty && !window.confirm(`Discard unsaved edits to "${name}" and switch to "${next}"?`)) return;
    setName(next);
    const nextLive = getCollection(next);
    baseline.current = nextLive;
    baseStatus.current = getCollectionStatus(next);
    baselineOverridden.current = isOverridden(next);
    setText(JSON.stringify(nextLive, null, 2));
    setOverridden(isOverridden(next));
    setStale(false);
    setMessage(null);
  }

  async function onSave() {
    if (operation.current) return;
    const submittedText = textRef.current;
    let parsed;
    try { parsed = JSON.parse(submittedText); } catch (e) {
      setMessage({ tone: "warn", text: `Invalid JSON: ${e.message}` });
      return;
    }
    try { validate(name, parsed); } catch (e) {
      setMessage({ tone: "warn", text: e.message });
      return;
    }
    if (
      name === "config"
      && JSON.stringify(parsed.supabase || {}) !== JSON.stringify((baseline.current || {}).supabase || {})
    ) {
      setMessage({
        tone: "warn",
        text: "The publishing URL, key, and table are deployment-managed. Change the VITE_SUPABASE_* configuration, sign out, and reload instead of changing them in Admin.",
      });
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
      setMessage({ tone: "warn", text: "A newer live revision is available. Reload it before saving." });
      return;
    }
    operation.current = true;
    setBusy(true);
    setMessage({ tone: "ok", text: `Saving ${name}...` });
    try {
      if (name === "files") await verifyFileCollection(parsed);
      await commitCollection(name, parsed, { baseStatus: baseStatus.current });
      const fresh = getCollection(name);
      const editedWhileSaving = textRef.current !== submittedText;
      baseline.current = fresh;
      baseStatus.current = getCollectionStatus(name);
      baselineOverridden.current = false;
      if (!editedWhileSaving) setText(JSON.stringify(fresh, null, 2));
      setOverridden(isOverridden(name));
      setStale(false);
      setMessage({
        tone: "ok",
        text: editedWhileSaving
          ? `Saved ${name}. JSON typed during the save remains in this unsaved draft.`
          : `Saved ${name}. Visitors see it on their next page load.`,
      });
    } catch (e) {
      if (e.code === "COLLECTION_CONFLICT") setStale(true);
      setMessage({ tone: "warn", text: e.message });
    } finally {
      operation.current = false;
      setBusy(false);
    }
  }

  async function onRetry() {
    if (operation.current) return;
    const textAtStart = textRef.current;
    const wasPristine = !dirty && !baselineOverridden.current;
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
      const untouched = textRef.current === textAtStart;
      if (wasPristine && untouched) {
        baseline.current = fresh;
        baseStatus.current = freshStatus;
        baselineOverridden.current = false;
        setText(JSON.stringify(fresh, null, 2));
        setOverridden(false);
        setStale(false);
        setMessage({ tone: "ok", text: freshStatus.state === "absent" ? `No published ${name} row exists yet. The first Save will create it.` : `Reloaded live ${name}.` });
        return;
      }
      setStale(true);
      setMessage({
        tone: "warn",
        text: `Reloaded live ${name}, but kept your JSON draft unchanged. Reload live data to discard it before saving.`,
      });
    } finally {
      operation.current = false;
      setBusy(false);
    }
  }

  function onReloadLive() {
    if (!isWritableHydrationStatus(hydration)) return;
    const fresh = getCollection(name);
    baseline.current = fresh;
    baseStatus.current = getCollectionStatus(name);
    baselineOverridden.current = false;
    setText(JSON.stringify(fresh, null, 2));
    setOverridden(isOverridden(name));
    setStale(false);
    setMessage({ tone: "ok", text: `Reloaded live ${name}. The previous JSON draft was discarded.` });
  }

  function onReset() {
    setText(JSON.stringify(SEED_DATA[name], null, 2));
    setStale(false);
    setMessage({ tone: "ok", text: `Loaded the site's starting ${name} data into this draft. Save to publish it.` });
  }

  function onDownload() {
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) {
      setMessage({ tone: "warn", text: `Cannot download: invalid JSON. ${e.message}` });
      return;
    }
    downloadJson(`${name}.json`, parsed);
    setMessage({ tone: "ok", text: `Downloaded ${name}.json.` });
  }

  const needsRetry = configured && ["pending", "failed", "invalid", "conflict"].includes(hydration.state);
  const loadBlocked = configured && ["failed", "invalid", "conflict"].includes(hydration.state);
  let statusBadge = <Badge tone="ok">Saved</Badge>;
  if (!configured || hydration.state === "seed-only") statusBadge = <Badge tone="warn">Not connected</Badge>;
  else if (hydration.state === "pending" || hydration.state === "loading") statusBadge = <Badge tone="warn">Loading live data</Badge>;
  else if (hydration.state === "failed") statusBadge = <Badge tone="warn">Load failed</Badge>;
  else if (hydration.state === "invalid") statusBadge = <Badge tone="warn">Live data invalid</Badge>;
  else if (hydration.state === "conflict") statusBadge = <Badge tone="warn">Write conflict</Badge>;
  else if (stale) statusBadge = <Badge tone="warn">Newer live data</Badge>;
  else if (dirty) statusBadge = <Badge tone="warn">Unsaved changes</Badge>;
  else if (overridden) statusBadge = <Badge tone="warn">Preview only</Badge>;
  else if (hydration.state === "absent") statusBadge = <Badge tone="warn">Not published yet</Badge>;

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        Advanced tools for restoring sample data, downloading a backup, or editing
        raw data. Most updates should still happen in the regular tabs.
      </div>

      <div className="adm-row" style={{ marginBottom: 16 }}>
        <div className="adm-row-head">
          <span className="mono" style={{ flex: 1 }}>Browser previews and starting data</span>
        </div>
        <div className="row">
          <Btn variant="ghost" onClick={onLoadSample} disabled={busy}>
            <Database size={14} aria-hidden="true" /> Load sample data
          </Btn>
          <Btn variant="ghost" onClick={onClearPreviews} disabled={busy}>
            <RotateCcw size={14} aria-hidden="true" /> Clear browser previews
          </Btn>
        </div>
        <p className="muted" style={{ fontSize: 13, margin: "10px 0 0" }}>
          Sample data affects this browser first. Clearing previews restores the
          last safely loaded published values, or starting data when none were loaded.
          Use the selected-collection reset below to stage starting data for publishing.
        </p>
      </div>

      <div className="notice info" role="note" style={{ marginBottom: 16 }}>
        The publishing connection is deployment-managed through the
        VITE_SUPABASE_* environment. Admin can edit public content, but it cannot
        switch projects, keys, or tables during a signed-in browser session.
      </div>

      <div className="field" style={{ maxWidth: 280 }}>
        <label htmlFor="raw-collection">Collection</label>
        <select id="raw-collection" className="input" value={name} onChange={(e) => select(e.target.value)} disabled={busy}>
          {COLLECTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <SectionTitle>{name}.json</SectionTitle>
      <Card>
        {loadBlocked && (
          <div className="adm-err" role="alert" style={{ marginBottom: 12 }}>
            <strong>{hydration.state === "invalid" ? "Live data is invalid." : hydration.state === "conflict" ? "A newer live revision exists." : "Live data could not be loaded."}</strong>{" "}
            Saving is blocked until Retry live data completes and the draft is reviewed.
          </div>
        )}
        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="raw-editor">JSON editor</label>
          <textarea
            id="raw-editor"
            className="input mono"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            rows={22}
            style={{ resize: "vertical", whiteSpace: "pre", overflowWrap: "normal", width: "100%" }}
          />
        </div>
        <div className="row" aria-busy={busy || hydration.state === "loading" ? "true" : undefined}>
          <Btn variant="accent" onClick={onSave} disabled={busy || !canSave}>
            <Save size={14} aria-hidden="true" /> {busy ? "Saving..." : "Save"}
          </Btn>
          {needsRetry && (
            <Btn variant="ghost" onClick={onRetry} disabled={busy}>
              <RefreshCw size={14} aria-hidden="true" /> Retry live data
            </Btn>
          )}
          {stale && isWritableHydrationStatus(hydration) && (
            <Btn variant="ghost" onClick={onReloadLive} disabled={busy}>
              <RefreshCw size={14} aria-hidden="true" /> Reload live data
            </Btn>
          )}
          <Btn variant="ghost" onClick={onReset} disabled={busy}>
            <RotateCcw size={14} aria-hidden="true" /> Reset selected to starting data
          </Btn>
          <Btn variant="ghost" onClick={onDownload} disabled={busy}>
            <Download size={14} aria-hidden="true" /> Download selected JSON
          </Btn>
          <span className="spacer" />
          {statusBadge}
        </div>
        {message && (
          <p role="status" aria-live="polite" className="mono"
            style={{ fontSize: 13, marginTop: 14, marginBottom: 0, color: message.tone === "warn" ? "var(--warn-text)" : "var(--ok-text)" }}>
            {message.text}
          </p>
        )}
      </Card>
    </div>
  );
}
