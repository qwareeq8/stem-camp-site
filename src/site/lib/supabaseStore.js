// Supabase-backed data layer. This is the single source of truth for the eight
// data collections behind the SAME component API that store.js has always
// exposed (useCollection, useConfig, getCollection, setCollection,
// resetCollection, clearAllCollectionOverlays, isOverridden, subscribe,
// SEED_DATA), so page components do
// not change. store.js re-exports this surface.
//
// Data model: one row per collection in a Postgres table (default name
// "collections"), the whole collection stored as a JSONB blob. This mirrors the
// bundled src/data/*.json model exactly, so the admin's per-collection editor and
// schema validation are unchanged. See supabase/schema.sql.
//
// Read path (public, no auth): on app start hydrateCollection fetches the live
// row from PostgREST with the publishable anon key (a plain fetch, so the
// supabase-js SDK stays out of the initial bundle) and publishes it into the
// store. The public view keeps rendering the compiled seed or last known value
// through an outage. A separate per-collection hydration status tells the admin
// whether that fallback is live, genuinely absent, still loading, or unsafe to
// overwrite. A persisted local overlay (setCollection) outranks the live value
// until it is committed or reset, so hydration never clobbers a local-only edit.
//
// Write path (admin, session required): commitCollection validates the edited
// JSON against its schema, then performs an atomic revision-checked update (or
// a primary-key-protected first insert) through supabase-js, loaded on demand.
// Row Level Security enforces the gate: anon may read, only an authenticated
// admin may write. After a successful write it publishes the returned row and
// server timestamp for read-after-write consistency.
//
// Security model: the SELECT policy makes every collection publicly readable,
// which is intended for a public leaderboard and schedule. Auth guards writes
// only. Store only data that is safe to be public; never personal data or
// anything about minors.
import { useSyncExternalStore } from "react";
import teams from "../../data/teams.json";
import members from "../../data/members.json";
import scores from "../../data/scores.json";
import tickets from "../../data/tickets.json";
import catalog from "../../data/catalog.json";
import schedule from "../../data/schedule.json";
import achievements from "../../data/achievements.json";
import prizes from "../../data/prizes.json";
import files from "../../data/files.json";
import config from "../../data/config.json";
import { validate } from "./schemas.js";
import { getSupabase } from "./supabaseClient.js";
import {
  isWritableHydrationStatus,
  sameHydrationRevision,
  writeCollectionIfCurrent,
} from "./supabaseConcurrency.js";
import { removedTeamReferenceSummaries } from "./crossCollectionIntegrity.js";
import { normalizeLiveCollection } from "./liveDataCompatibility.js";

const SEEDS = { teams, members, scores, tickets, catalog, schedule, achievements, prizes, files, config };
const COLLECTIONS = Object.keys(SEEDS);
const PREFIX = "stemcamp:";
const listeners = new Set();
const cache = {};
const hydrationRequests = {};
const overlayGenerations = {};
const overlayStates = {};
// Validated server snapshots stay separate from browser-only overlays. The
// central teams write guard uses these values so loading sample/starting data
// cannot hide a live reference that would become orphaned.
const serverValues = {};
const serverValueKnown = new Set();
const serverRowsPresent = new Set();

function makeStatus(state, updatedAt = null, error = null) {
  return Object.freeze({ state, updatedAt, error });
}

// pending: app hydration has not started yet
// seed-only: no backend is configured
// loading: a configured read is in flight
// live: a validated row and its revision were loaded
// absent: the read proved there is no row, so a first insert is safe
// failed/invalid/conflict: public fallback remains visible, but admin writes are blocked
const INITIAL_STATUSES = Object.fromEntries(
  COLLECTIONS.map((name) => [name, makeStatus("pending")]),
);
const hydrationStatuses = { ...INITIAL_STATUSES };
const UNKNOWN_STATUS = makeStatus("pending");

// ---- local overlay + cache (offline fallback) ----

function readRaw(name) {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    if (raw) {
      const parsed = JSON.parse(raw);
      overlayStates[name] = true;
      return parsed;
    }
  } catch (e) { /* ignore corrupt/unavailable storage */ }
  overlayStates[name] = false;
  return SEEDS[name];
}
function emit() { listeners.forEach((l) => l()); }

function setHydrationStatus(name, status, shouldEmit = true) {
  hydrationStatuses[name] = status;
  if (shouldEmit) emit();
}

// Publish a value into the in-memory store and notify subscribers WITHOUT
// persisting a local overlay. Used for live values (hydrate, commit) so they are
// never mistaken for a divergent local-only edit.
function publish(name, value, status) {
  cache[name] = value;
  if (status) hydrationStatuses[name] = status;
  emit();
}

// Drop any persisted local overlay for a name (used after a successful commit so
// the committed value is not flagged as a local-only edit).
function clearOverlay(name) {
  try { localStorage.removeItem(PREFIX + name); } catch (e) { /* ignore */ }
  overlayStates[name] = false;
  overlayGenerations[name] = (overlayGenerations[name] || 0) + 1;
}

function overlayGeneration(name) { return overlayGenerations[name] || 0; }

// A generation change can mean either "replace this preview with another
// preview" or "clear previews and reveal the server." Only the first case
// should keep browser state after an in-flight save returns.
export function shouldPreserveOverlayAfterWrite(
  generationAtStart,
  currentGeneration,
  isCurrentlyOverridden,
) {
  return currentGeneration !== generationAtStart && isCurrentlyOverridden;
}

function recordServerValue(name, value, { present = true } = {}) {
  serverValues[name] = value;
  serverValueKnown.add(name);
  if (present) serverRowsPresent.add(name);
  else serverRowsPresent.delete(name);
}

// A cleared browser preview should reveal the last validated published value,
// not silently replace it with the bundled seed. Confirmed-absent rows are the
// exception: there is no published value to reveal, so the public seed remains
// the intentional fallback.
function valueWithoutOverlay(name) {
  return serverRowsPresent.has(name) ? serverValues[name] : SEEDS[name];
}

export function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); }
export function getCollection(name) {
  if (cache[name] === undefined) cache[name] = readRaw(name);
  return cache[name];
}
export function setCollection(name, value) {
  try { localStorage.setItem(PREFIX + name, JSON.stringify(value)); } catch (e) { /* ignore */ }
  overlayStates[name] = true;
  overlayGenerations[name] = overlayGeneration(name) + 1;
  cache[name] = value;
  emit();
}
export function resetCollection(name) {
  clearOverlay(name);
  cache[name] = valueWithoutOverlay(name);
  emit();
}
export function clearAllCollectionOverlays() {
  for (const name of COLLECTIONS) {
    clearOverlay(name);
    cache[name] = valueWithoutOverlay(name);
  }
  emit();
}
export function isOverridden(name) {
  if (Object.prototype.hasOwnProperty.call(overlayStates, name)) return overlayStates[name];
  getCollection(name);
  return overlayStates[name] || false;
}

export function useCollection(name) {
  return useSyncExternalStore(subscribe, () => getCollection(name), () => SEEDS[name]);
}
export function getCollectionStatus(name) {
  return hydrationStatuses[name] || UNKNOWN_STATUS;
}
export function useCollectionStatus(name) {
  return useSyncExternalStore(
    subscribe,
    () => getCollectionStatus(name),
    () => INITIAL_STATUSES[name] || UNKNOWN_STATUS,
  );
}
export function useConfig() { return useCollection("config"); }
export const SEED_DATA = SEEDS;

// ---- Supabase config (non-secret; the anon key is publishable) ----

function env() {
  return (typeof import.meta !== "undefined" && import.meta.env) || {};
}

// Resolve the project URL, publishable anon key, and table name. Build-time
// VITE_SUPABASE_* env vars win; a non-secret "supabase" block in config.json is
// the fallback for local dev. owner/url is null when unconfigured (placeholder
// or empty) so the read path stays seed-only and the write path refuses to act.
export function supabaseCfg() {
  const e = env();
  let block = {};
  try { block = (getCollection("config") || {}).supabase || {}; } catch { /* config not ready */ }
  const rawUrl = e.VITE_SUPABASE_URL || block.url || "";
  const rawKey = e.VITE_SUPABASE_ANON_KEY || block.anonKey || "";
  const table = e.VITE_SUPABASE_TABLE || block.table || "collections";
  const isPlaceholder = (v) => !v || /YOUR[-_]|PLACEHOLDER/i.test(String(v));
  return {
    url: isPlaceholder(rawUrl) ? null : String(rawUrl).replace(/\/+$/, ""),
    anonKey: isPlaceholder(rawKey) ? null : rawKey,
    table,
  };
}

// True when a real project URL and anon key are configured (not placeholders).
// The read path uses this to decide whether to attempt a live fetch at all.
export function isSupabaseConfigured() {
  const { url, anonKey } = supabaseCfg();
  return !!(url && anonKey);
}

// ---- read path: PostgREST with seed fallback ----

// Fetch the live row for a collection from PostgREST and publish it into the
// store. Public rendering keeps its fallback on failure, while the explicit
// status blocks admin writes until a validated row (or confirmed absence) is
// known. A request counter prevents a slow, older retry from replacing a newer
// result.
export async function hydrateCollection(name, { replaceOverlay = false } = {}) {
  // Advance the generation before checking configuration. This also invalidates
  // an older request when the connection has just been removed.
  const requestId = (hydrationRequests[name] || 0) + 1;
  hydrationRequests[name] = requestId;
  const overlayAtStart = overlayGeneration(name);
  const { url, anonKey, table } = supabaseCfg();
  if (!url || !anonKey) {
    setHydrationStatus(name, makeStatus("seed-only"));
    return SEEDS[name];
  }

  setHydrationStatus(name, makeStatus("loading"));
  const isCurrentRequest = () => hydrationRequests[name] === requestId;
  const fail = (state, message) => {
    if (isCurrentRequest()) setHydrationStatus(name, makeStatus(state, null, message));
    return getCollection(name);
  };

  const endpoint = `${url}/rest/v1/${encodeURIComponent(table)}?name=eq.${encodeURIComponent(name)}&select=data,updated_at`;
  try {
    const r = await fetch(endpoint, {
      cache: "no-store",
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, Accept: "application/json" },
    });
    if (!r.ok) {
      const message = `${r.status} ${r.statusText}`.trim();
      console.warn(`hydrate ${name}: ${message}; keeping public fallback`);
      return fail("failed", message);
    }
    const rows = await r.json();
    if (!Array.isArray(rows)) {
      console.warn(`hydrate ${name}: unexpected response; keeping public fallback`);
      return fail("failed", "The backend returned an unexpected response.");
    }
    if (rows.length === 0) {
      if (!isCurrentRequest()) return getCollection(name);
      const absent = makeStatus("absent");
      recordServerValue(name, name === "config" ? {} : [], { present: false });
      const localStateChanged = overlayGeneration(name) !== overlayAtStart;
      if (replaceOverlay && !localStateChanged) clearOverlay(name);
      if (isOverridden(name)) setHydrationStatus(name, absent);
      else publish(name, SEEDS[name], absent);
      return SEEDS[name];
    }
    const data = normalizeLiveCollection(name, rows[0].data);
    const updatedAt = rows[0].updated_at;
    if (data == null || typeof updatedAt !== "string" || !updatedAt) {
      console.warn(`hydrate ${name}: row is missing data or updated_at; keeping public fallback`);
      return fail("invalid", "The live row is missing data or its revision timestamp.");
    }
    // Only publish a value that passes the shape check, so a corrupt remote row
    // cannot poison the running UI; otherwise keep the seed/overlay.
    try { validate(name, data); } catch (e) {
      console.warn(`hydrate ${name}: remote row failed schema; keeping public fallback`, e);
      return fail("invalid", e && e.message ? e.message : "The live row failed validation.");
    }
    if (!isCurrentRequest()) return getCollection(name);
    recordServerValue(name, data);
    const live = makeStatus("live", updatedAt);
    // A persisted local overlay is a deliberate local-only edit; it stays
    // authoritative until commit or reset, so the live value is not published
    // over it (checked here, not before the fetch, because an overlay can be
    // written while this request is in flight).
    const localStateChanged = overlayGeneration(name) !== overlayAtStart;
    if (replaceOverlay && !localStateChanged) clearOverlay(name);
    if (isOverridden(name)) setHydrationStatus(name, live);
    else publish(name, data, live);
    return data;
  } catch (e) {
    const message = e && e.message ? e.message : String(e);
    console.warn(`hydrate ${name}: ${message}; keeping public fallback`);
    return fail("failed", message);
  }
}

// Public retry surface used by the admin after a failed or invalid read.
export function retryCollection(name) {
  // A retry is an explicit Admin request for the backend value. Clear a local
  // overlay only after a valid row (or confirmed absence) is received; the
  // editor itself keeps any draft so it can warn instead of discarding it.
  return hydrateCollection(name, { replaceOverlay: true });
}

// Hydrate every collection in parallel. Called once on app mount. Each failure
// is isolated, so one unreachable row does not block the others.
export async function hydrateAll() {
  if (!isSupabaseConfigured()) {
    for (const name of COLLECTIONS) {
      hydrationRequests[name] = (hydrationRequests[name] || 0) + 1;
      setHydrationStatus(name, makeStatus("seed-only"), false);
    }
    emit();
    return;
  }
  await Promise.allSettled(COLLECTIONS.map((n) => hydrateCollection(n)));
}

// ---- write path: revision-checked Supabase writes under RLS ----

function friendlyWriteError(error) {
  const msg = (error && error.message) || "Unknown error";
  const code = error && error.code;
  if (code === "42501" || /row-level security|violates row-level/i.test(msg)) {
    return "Write blocked by Row Level Security. Confirm you are signed in as the admin and that the table's write policy allows your account.";
  }
  if (/jwt|token is expired|invalid claim/i.test(msg)) {
    return "Your admin session expired. Log out and sign in again.";
  }
  return `Supabase write failed: ${msg}`;
}

function hydrationBlockMessage(status) {
  if (status?.state === "loading" || status?.state === "pending") {
    return "Live data is still loading. Wait for it to finish, then try again.";
  }
  if (status?.state === "invalid") {
    return "The live collection failed validation. Saving is blocked so fallback data cannot replace it. Retry the live load or repair the row first.";
  }
  if (status?.state === "failed") {
    return "The live collection could not be loaded. Saving is blocked so fallback data cannot replace it. Retry the live load first.";
  }
  if (status?.state === "conflict") {
    return "A newer live revision exists. Retry the live load and review your draft before saving again.";
  }
  return "This collection is not ready for a safe write. Reload its live data before saving.";
}

function conflictError(name) {
  const error = new Error(
    `A newer ${name} revision exists. Your draft was not saved. Retry the live data and review your changes before trying again.`,
  );
  error.code = "COLLECTION_CONFLICT";
  return error;
}

function assertTeamReplacementIntegrity(nextTeams) {
  if (!serverValueKnown.has("teams")) {
    throw new Error("Live teams data is not available for a safe replacement. Retry the live data before saving.");
  }
  const previousTeams = serverValues.teams || [];
  const nextIds = new Set((nextTeams || []).map((team) => team.id));
  const removesTeam = previousTeams.some((team) => !nextIds.has(team.id));
  if (!removesTeam) return;

  const relatedNames = ["members", "scores", "tickets", "achievements"];
  const unresolved = relatedNames.filter((relatedName) => (
    !serverValueKnown.has(relatedName)
    || !isWritableHydrationStatus(getCollectionStatus(relatedName))
  ));
  if (unresolved.length) {
    throw new Error(
      `Cannot save a team deletion while live ${unresolved.join(", ")} data is not safely loaded. Retry those collections first.`,
    );
  }

  const references = removedTeamReferenceSummaries(previousTeams, nextTeams, {
    members: serverValues.members,
    scores: serverValues.scores,
    tickets: serverValues.tickets,
    achievements: serverValues.achievements,
  });
  if (!references.length) return;

  const labels = references.map(({ team, summary }) => {
    const count = Object.values(summary).reduce((sum, value) => sum + value, 0);
    return `${team.name || team.id} (${count} related record${count === 1 ? "" : "s"})`;
  });
  throw new Error(
    `Cannot delete referenced teams: ${labels.join(", ")}. Remove or reassign roster, score, ticket, and award records first.`,
  );
}

// Validate, then write only against the revision the editor actually loaded.
// Existing rows use an atomic conditional UPDATE on updated_at. A genuinely
// absent row uses INSERT, whose primary key rejects a concurrent first writer.
// The caller must pass its captured baseStatus; consulting only the store's
// latest status here would lose the provenance of a draft that stayed open.
export async function commitCollection(name, value, { baseStatus } = {}) {
  validate(name, value); // schema check before any network call
  const overlayAtStart = overlayGeneration(name);
  const cfg = supabaseCfg();
  if (!cfg.url || !cfg.anonKey) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or the supabase block in config.json).");
  }

  const currentStatus = getCollectionStatus(name);
  if (!isWritableHydrationStatus(currentStatus)) {
    throw new Error(hydrationBlockMessage(currentStatus));
  }
  if (!baseStatus || !sameHydrationRevision(baseStatus, currentStatus)) {
    throw conflictError(name);
  }
  if (name === "teams") assertTeamReplacementIntegrity(value);

  let sb;
  try {
    sb = await getSupabase(cfg);
  } catch (e) {
    throw new Error(e && e.message ? e.message : "Could not load the Supabase client.");
  }

  const { data, error, conflict } = await writeCollectionIfCurrent(
    sb,
    cfg.table,
    name,
    value,
    baseStatus,
  );
  if (conflict) {
    // Preserve every local overlay and draft. Mark the collection non-writable;
    // the explicit Retry action fetches the newer row without silently rebasing.
    setHydrationStatus(
      name,
      makeStatus("conflict", currentStatus.updatedAt, "A newer live revision exists."),
    );
    throw conflictError(name);
  }
  if (error) throw new Error(friendlyWriteError(error));

  const fresh = data && data.data != null ? data.data : value; // read-after-write
  recordServerValue(name, fresh);
  const updatedAt = data && data.updated_at;
  if (typeof updatedAt !== "string" || !updatedAt) {
    // The write may have landed, but without its server revision the next edit
    // cannot be made safely. Re-read before reporting the collection as live.
    if (overlayGeneration(name) === overlayAtStart) clearOverlay(name);
    await hydrateCollection(name);
    if (getCollectionStatus(name).state !== "live") {
      throw new Error("The save response did not include a revision timestamp. Reload live data before editing again.");
    }
    return getCollection(name);
  }

  const preserveNewerOverlay = shouldPreserveOverlayAfterWrite(
    overlayAtStart,
    overlayGeneration(name),
    isOverridden(name),
  );
  if (!preserveNewerOverlay) {
    clearOverlay(name); // the committed value is not a local-only edit
    publish(name, fresh, makeStatus("live", updatedAt));
  } else {
    // A bulk/sample action landed while the write was in flight. Preserve that
    // newer local intent while still advancing the known server revision.
    setHydrationStatus(name, makeStatus("live", updatedAt));
  }
  return fresh;
}
