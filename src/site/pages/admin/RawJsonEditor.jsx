// Advanced fallback editor: edit any collection as raw JSON. This is the escape
// hatch behind the friendly form editors -- it can express anything the schema
// allows, including fields the forms do not surface. It runs the same
// validate-then-commit path as the forms, so a malformed edit is rejected before
// any network call.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCollection,
  useCollection,
  commitCollection,
  resetCollection,
  isOverridden,
  isSupabaseConfigured,
} from "../../lib/store.js";
import { validate } from "../../lib/schemas.js";
import { Card, Badge, Btn, SectionTitle, downloadJson } from "../../ui.jsx";
import { Database, Save, RotateCcw, Download } from "lucide-react";
import { useEditor, SaveBar, TextField, clone, reportDirtyDraft } from "./shared.jsx";

const COLLECTIONS = [
  "teams", "members", "scores", "tickets", "catalog",
  "schedule", "achievements", "prizes", "files", "config",
];

function PublishingConnection() {
  const ed = useEditor("config");
  const cfg = ed.draft || {};
  const supabase = cfg.supabase || {};
  // Rebase every edit on the live config so this panel only authors the
  // supabase block; a raw-JSON save of other config keys on this same screen
  // is never reverted by saving here.
  const setSupabase = (key, value) =>
    ed.setDraft({ ...clone(getCollection("config")), supabase: { ...supabase, [key]: value } });

  return (
    <div className="adm-row" style={{ marginBottom: 16 }}>
      <div className="adm-row-head">
        <span className="mono" style={{ flex: 1 }}>Publishing connection</span>
      </div>
      <div className="notice" role="note" style={{ marginBottom: 12 }}>
        Maintainer settings for publishing admin changes. Use only the publishable
        key; never paste a secret or service-role key here.
      </div>
      <div className="adm-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 12 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <TextField label="Project URL" value={supabase.url} onChange={(v) => setSupabase("url", v)} mono placeholder="https://YOUR-PROJECT.supabase.co" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <TextField label="Publishable key" value={supabase.anonKey} onChange={(v) => setSupabase("anonKey", v)} mono />
        </div>
        <TextField label="Table name" value={supabase.table} onChange={(v) => setSupabase("table", v)} mono placeholder="collections" />
      </div>
      <SaveBar ed={ed} />
    </div>
  );
}

export default function RawJsonEditor({ onLoadSample, onResetAll }) {
  const [name, setName] = useState("teams");
  const [text, setText] = useState(() => JSON.stringify(getCollection("teams"), null, 2));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [overridden, setOverridden] = useState(() => isOverridden("teams"));
  const configured = isSupabaseConfigured();
  const live = useCollection(name);

  // True when the textarea no longer matches the stored value. Reported to the
  // shared dirty registry so the console confirms before a tab switch.
  const dirty = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(text)) !== JSON.stringify(live);
    } catch {
      return text !== JSON.stringify(live, null, 2);
    }
  }, [text, live]);
  useEffect(() => {
    reportDirtyDraft(`raw:${name}`, dirty);
    return () => reportDirtyDraft(`raw:${name}`, false);
  }, [name, dirty]);

  // The store value the textarea was rendered from. When the store moves
  // (hydrate, panel save) pristine text is refreshed so the editor never
  // trusts a pre-hydration snapshot; typed edits are never touched.
  const baseline = useRef(live);
  useEffect(() => {
    if (live === baseline.current) return;
    if (text === JSON.stringify(baseline.current, null, 2)) {
      setText(JSON.stringify(live, null, 2));
      setOverridden(isOverridden(name));
    }
    baseline.current = live;
  }, [name, live, text]);

  function select(next) {
    if (next === name) return;
    // Guard against silently discarding unsaved edits: confirm before
    // switching collections while the text differs from the stored value.
    if (dirty && !window.confirm(`Discard unsaved edits to "${name}" and switch to "${next}"?`)) return;
    setName(next);
    setText(JSON.stringify(getCollection(next), null, 2));
    setOverridden(isOverridden(next));
    setMessage(null);
  }

  async function onSave() {
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) {
      setMessage({ tone: "warn", text: `Invalid JSON: ${e.message}` });
      return;
    }
    try { validate(name, parsed); } catch (e) {
      setMessage({ tone: "warn", text: e.message });
      return;
    }
    if (!configured) {
      setMessage({ tone: "warn", text: "Publishing is not connected. Ask the site maintainer to connect the admin backend before saving." });
      return;
    }
    setBusy(true);
    setMessage({ tone: "ok", text: `Saving ${name}...` });
    try {
      await commitCollection(name, parsed);
      setText(JSON.stringify(getCollection(name), null, 2));
      setOverridden(isOverridden(name));
      setMessage({ tone: "ok", text: `Saved ${name}. Visitors see it on their next page load.` });
    } catch (e) {
      setMessage({ tone: "warn", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  function onReset() {
    resetCollection(name);
    setText(JSON.stringify(getCollection(name), null, 2));
    setOverridden(isOverridden(name));
    setMessage({ tone: "ok", text: `Reset "${name}" to the site's starting data in this browser. Save to publish it.` });
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

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        Advanced tools for restoring sample data, downloading a backup, or editing
        raw data. Most updates should still happen in the regular tabs.
      </div>

      <div className="adm-row" style={{ marginBottom: 16 }}>
        <div className="adm-row-head">
          <span className="mono" style={{ flex: 1 }}>Starting data and samples</span>
        </div>
        <div className="row">
          <Btn variant="ghost" onClick={onLoadSample}>
            <Database size={14} aria-hidden="true" /> Load sample data
          </Btn>
          <Btn variant="ghost" onClick={onResetAll}>
            <RotateCcw size={14} aria-hidden="true" /> Reset all to starting data
          </Btn>
        </div>
        <p className="muted" style={{ fontSize: 13, margin: "10px 0 0" }}>
          These affect this browser first. Save each collection you want visitors to see.
        </p>
      </div>

      <PublishingConnection />

      <div className="field" style={{ maxWidth: 280 }}>
        <label htmlFor="raw-collection">Collection</label>
        <select id="raw-collection" className="input" value={name} onChange={(e) => select(e.target.value)}>
          {COLLECTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <SectionTitle>{name}.json</SectionTitle>
      <Card>
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
        <div className="row">
          <Btn variant="accent" onClick={onSave} disabled={busy}>
            <Save size={14} aria-hidden="true" /> {busy ? "Saving..." : "Save"}
          </Btn>
          <Btn variant="ghost" onClick={onReset} disabled={busy}>
            <RotateCcw size={14} aria-hidden="true" /> Reset selected to starting data
          </Btn>
          <Btn variant="ghost" onClick={onDownload} disabled={busy}>
            <Download size={14} aria-hidden="true" /> Download selected JSON
          </Btn>
          <span className="spacer" />
          {overridden ? <Badge tone="warn">Preview only</Badge> : <Badge tone="ok">Saved</Badge>}
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
