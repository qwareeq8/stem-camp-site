// Admin: a Supabase-auth gate over a form-based data console. The admin signs in
// with the camp's Supabase account (email + password); Supabase issues a JWT held
// in this browser. When signed in, a tabbed set of editors authors each
// collection through friendly forms (with a raw-JSON Advanced tab as a fallback),
// then Save performs a revision-checked Supabase write under Row Level Security. Auth guards
// writes only: the table's read policy makes all data publicly readable, so the
// roster uses aliases and never real names or anything about minors.
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/auth.js";
import {
  setCollection,
  clearAllCollectionOverlays,
  isSupabaseConfigured,
} from "../lib/store.js";
import { SAMPLE_DATA } from "../lib/sampleData.js";
import { Page, Card, Btn } from "../ui.jsx";
import { Lock, LogOut, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { anyDirtyDraft } from "./admin/shared.jsx";

import SetupEditor from "./admin/SetupEditor.jsx";
import TeamsEditor from "./admin/TeamsEditor.jsx";
import RosterEditor from "./admin/RosterEditor.jsx";
import ScoresEditor from "./admin/ScoresEditor.jsx";
import ScheduleEditor from "./admin/ScheduleEditor.jsx";
import AwardsEditor from "./admin/AwardsEditor.jsx";
import TicketsEditor from "./admin/TicketsEditor.jsx";
import CatalogEditor from "./admin/CatalogEditor.jsx";
import PrizesEditor from "./admin/PrizesEditor.jsx";
import FilesEditor from "./admin/FilesEditor.jsx";
import RawJsonEditor from "./admin/RawJsonEditor.jsx";

const TABS = [
  { id: "setup", label: "Setup", Comp: SetupEditor },
  { id: "teams", label: "Teams", Comp: TeamsEditor },
  { id: "roster", label: "Roster", Comp: RosterEditor },
  { id: "scores", label: "Scores", Comp: ScoresEditor },
  { id: "schedule", label: "Schedule", Comp: ScheduleEditor },
  { id: "awards", label: "Awards", Comp: AwardsEditor },
  { id: "tickets", label: "Tickets", Comp: TicketsEditor },
  { id: "catalog", label: "Catalog", Comp: CatalogEditor },
  { id: "prizes", label: "Prizes", Comp: PrizesEditor },
  { id: "files", label: "Files", Comp: FilesEditor },
  { id: "advanced", label: "Advanced", Comp: RawJsonEditor },
];

function LoginGate({ login }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const configured = isSupabaseConfigured();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await login(email, password);
    setBusy(false);
    if (!res.ok) setError(res.error || "Sign in failed. Check your credentials and try again.");
  }

  return (
    <Page
      eyebrow="Restricted"
      title="Admin sign in"
      sub="Sign in to update teams, schedules, scores, awards, tickets, and public files."
    >
      <div className="grid" style={{ maxWidth: 520 }}>
        <Card padLg>
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="admin-email">Admin email</label>
              <input
                id="admin-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                spellCheck={false}
                placeholder="admin@example.com"
                aria-describedby={error ? "admin-auth-error" : "admin-auth-hint"}
                aria-invalid={error ? "true" : undefined}
              />
            </div>
            <div className="field">
              <label htmlFor="admin-password">Password</label>
              <div className="row" style={{ gap: 8, flexWrap: "nowrap", alignItems: "stretch" }}>
                <input
                  id="admin-password"
                  className="input mono"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  spellCheck={false}
                  placeholder="your admin password"
                  style={{ flex: 1, minWidth: 0 }}
                  aria-describedby={error ? "admin-auth-error" : "admin-auth-hint"}
                  aria-invalid={error ? "true" : undefined}
                />
                <Btn
                  type="button"
                  variant="ghost"
                  className="icon"
                  onClick={() => setShow((s) => !s)}
                  aria-pressed={show}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                </Btn>
              </div>
              <p id="admin-auth-hint" className="muted" style={{ fontSize: 12, marginTop: 6, marginBottom: 0 }}>
                {configured
                  ? "Use the camp admin account. For shared-device safety, Admin locks again on reload or tab close."
                  : "Admin sign in is disabled until publishing is connected."}
              </p>
            </div>
            <div className="row">
              <Btn type="submit" variant="accent" disabled={busy || !configured}>
                <Lock size={14} aria-hidden="true" /> {busy ? "Signing in..." : "Sign in"}
              </Btn>
            </div>
            {error && (
              <p
                id="admin-auth-error"
                className="mono"
                role="alert"
                style={{ color: "var(--warn-text)", fontSize: 13, marginTop: 12, marginBottom: 0 }}
              >
                {error}
              </p>
            )}
          </form>
        </Card>
        {!configured && (
          <div className="notice info" role="note">
            <strong style={{ display: "block", marginBottom: 6 }}>Admin connection not configured</strong>
            The public site still opens with its starting data.
          </div>
        )}
      </div>
    </Page>
  );
}

function Console({ logout }) {
  const [tab, setTab] = useState("setup");
  // Bumped after a bulk data op (Load sample / Clear browser previews) to
  // remount the active editor so it re-reads the store instead of keeping a
  // stale draft.
  const [version, setVersion] = useState(0);
  const [notice, setNotice] = useState(null);
  const tabRefs = useRef({});
  const active = TABS.find((t) => t.id === tab) || TABS[0];
  const ActiveEditor = active.Comp;

  // Reloading also clears the intentionally memory-only Admin session. Give a
  // dirty form the browser's standard leave-page warning before that happens.
  useEffect(() => {
    const confirmDirtyLeave = (event) => {
      if (!anyDirtyDraft()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", confirmDirtyLeave);
    return () => window.removeEventListener("beforeunload", confirmDirtyLeave);
  }, []);

  // Switching tabs unmounts the active editor, so a dirty draft must be
  // confirmed away rather than silently discarded. Returns false on cancel.
  function activateTab(id) {
    if (id === tab) return true;
    if (anyDirtyDraft() && !window.confirm("Discard unsaved changes and switch tabs?")) return false;
    setTab(id);
    setNotice(null);
    return true;
  }

  // Roving tabindex: Left/Right arrows move and select within the tablist.
  function onTabKeyDown(e, index) {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = TABS[(index + dir + TABS.length) % TABS.length];
    if (activateTab(next.id)) tabRefs.current[next.id]?.focus();
  }

  function loadSample() {
    if (anyDirtyDraft() && !window.confirm("Discard unsaved edits and load the browser-only sample data?")) return;
    // Local overlay only: never writes to Supabase. Reversible with the clear
    // browser previews action in Advanced.
    for (const [name, value] of Object.entries(SAMPLE_DATA)) setCollection(name, value);
    setVersion((v) => v + 1);
    setNotice({
      tone: "ok",
      text: "Loaded sample data in this browser only. Open a tab and Save to publish it, or clear browser previews to return to published data.",
    });
  }

  function clearBrowserPreviews() {
    if (anyDirtyDraft() && !window.confirm("Discard unsaved edits and clear all browser-only previews?")) return;
    clearAllCollectionOverlays();
    setVersion((v) => v + 1);
    setNotice({
      tone: "ok",
      text: "Cleared browser-only previews. Each collection now shows its last safely loaded published value, or the site's starting data when no published value was loaded.",
    });
  }

  function signOut() {
    if (anyDirtyDraft() && !window.confirm("Discard unsaved edits and sign out?")) return;
    logout();
  }

  return (
    <Page
      eyebrow="Restricted"
      title="Data console"
      sub="Author the site's content through forms, then Save to publish. Saved changes reach visitors on their next page load, with no redeploy."
      actions={
        <Btn variant="ghost" onClick={signOut}>
          <LogOut size={14} aria-hidden="true" /> Log out
        </Btn>
      }
    >
      <div className="notice" role="note" style={{ marginBottom: 14 }}>
        <strong style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <ShieldAlert size={15} aria-hidden="true" /> Public data warning
        </strong>
        Use aliases only. Never enter real camper names, personal details, private notes,
        allergy information, or anything sensitive about minors. Admin access is
        memory-only and locks again when this page reloads or the tab closes.
      </div>

      {notice && (
        <p role="status" aria-live="polite" className="mono"
          style={{ fontSize: 13, margin: "0 0 14", color: notice.tone === "warn" ? "var(--warn-text)" : "var(--ok-text)" }}>
          {notice.text}
        </p>
      )}

      <div className="adm-tabs" role="tablist" aria-label="Data collections">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { tabRefs.current[t.id] = el; }}
            id={`adm-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={t.id === tab}
            aria-controls={t.id === tab ? "adm-tabpanel" : undefined}
            tabIndex={t.id === tab ? 0 : -1}
            className={`adm-tab${t.id === tab ? " active" : ""}`}
            onClick={() => activateTab(t.id)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id="adm-tabpanel" role="tabpanel" aria-labelledby={`adm-tab-${tab}`}>
        <ActiveEditor
          key={`${tab}-${version}`}
          onLoadSample={loadSample}
          onClearPreviews={clearBrowserPreviews}
        />
      </div>
    </Page>
  );
}

export default function Admin() {
  const { authed, login, logout } = useAuth();
  if (!authed) return <LoginGate login={login} />;
  return <Console logout={logout} />;
}
