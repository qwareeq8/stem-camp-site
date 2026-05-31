// Supabase-backed data layer. This is the single source of truth for the eight
// data collections behind the SAME component API that store.js has always
// exposed (useCollection, useConfig, getCollection, setCollection,
// resetCollection, isOverridden, subscribe, SEED_DATA), so page components do
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
// store. Any failure (offline, not configured, no row yet) leaves the
// compiled-in seed in place, so the public site always renders. useCollection
// returns the seed/overlay synchronously on first paint and re-renders when the
// live value arrives.
//
// Write path (admin, session required): commitCollection validates the edited
// JSON against its schema, then upserts the row through supabase-js (loaded on
// demand) using the signed-in admin's session. Row Level Security enforces the
// gate: anon may read, only an authenticated admin may write. After a successful
// upsert it publishes the returned row for read-after-write consistency.
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

const SEEDS = { teams, members, scores, tickets, catalog, schedule, achievements, prizes, files, config };
const PREFIX = "stemcamp:";
const listeners = new Set();
const cache = {};

function devWarn(...args) {
  try {
    if (import.meta.env && import.meta.env.DEV) console.warn(...args);
  } catch { /* import.meta unavailable */ }
}

// ---- local overlay + cache (offline fallback) ----

function readRaw(name) {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore corrupt/unavailable storage */ }
  return SEEDS[name];
}
function emit() { listeners.forEach((l) => l()); }

// Publish a value into the in-memory store and notify subscribers WITHOUT
// persisting a local overlay. Used for live values (hydrate, commit) so they are
// never mistaken for a divergent local-only edit.
function publish(name, value) {
  cache[name] = value;
  emit();
}

// Drop any persisted local overlay for a name (used after a successful commit so
// the committed value is not flagged as a local-only edit).
function clearOverlay(name) {
  try { localStorage.removeItem(PREFIX + name); } catch (e) { /* ignore */ }
}

export function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); }
export function getCollection(name) {
  if (cache[name] === undefined) cache[name] = readRaw(name);
  return cache[name];
}
export function setCollection(name, value) {
  try { localStorage.setItem(PREFIX + name, JSON.stringify(value)); } catch (e) { /* ignore */ }
  cache[name] = value;
  emit();
}
export function resetCollection(name) {
  try { localStorage.removeItem(PREFIX + name); } catch (e) { /* ignore */ }
  cache[name] = SEEDS[name];
  emit();
}
export function isOverridden(name) {
  try { return localStorage.getItem(PREFIX + name) != null; } catch (e) { return false; }
}

export function useCollection(name) {
  return useSyncExternalStore(subscribe, () => getCollection(name), () => SEEDS[name]);
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
// store. On any failure return the seed and leave the store untouched, so the
// public site always renders. Failure is silent by design (graceful fallback).
export async function hydrateCollection(name) {
  const { url, anonKey, table } = supabaseCfg();
  if (!url || !anonKey) return SEEDS[name]; // not configured: seed only
  const endpoint = `${url}/rest/v1/${encodeURIComponent(table)}?name=eq.${encodeURIComponent(name)}&select=data`;
  try {
    const r = await fetch(endpoint, {
      cache: "no-store",
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, Accept: "application/json" },
    });
    if (!r.ok) {
      devWarn(`hydrate ${name}: ${r.status} ${r.statusText}; using bundled seed`);
      return SEEDS[name];
    }
    const rows = await r.json();
    if (!Array.isArray(rows) || rows.length === 0 || rows[0].data == null) {
      return SEEDS[name]; // no row committed yet: keep the seed
    }
    const data = rows[0].data;
    // Only publish a value that passes the shape check, so a corrupt remote row
    // cannot poison the running UI; otherwise keep the seed/overlay.
    try { validate(name, data); } catch (e) {
      devWarn(`hydrate ${name}: remote row failed schema, using seed`, e);
      return SEEDS[name];
    }
    publish(name, data);
    return data;
  } catch (e) {
    devWarn(`hydrate ${name}: ${e && e.message ? e.message : e}; using seed`);
    return SEEDS[name];
  }
}

// Hydrate every collection in parallel. Called once on app mount. Each failure
// is isolated, so one unreachable row does not block the others.
const COLLECTIONS = Object.keys(SEEDS);
export async function hydrateAll() {
  if (!isSupabaseConfigured()) return; // nothing to fetch; seeds already in place
  await Promise.allSettled(COLLECTIONS.map((n) => hydrateCollection(n)));
}

// ---- write path: supabase-js upsert under RLS ----

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

// Validate then upsert the new value for a collection. The upsert runs under the
// signed-in admin's session (RLS enforces write access). On success the returned
// row is published locally for immediate read-after-write. Returns the stored
// value. The optional message is accepted for call-site compatibility; Supabase
// has no commit message.
export async function commitCollection(name, value, message) { // eslint-disable-line no-unused-vars
  validate(name, value); // schema check before any network call
  const cfg = supabaseCfg();
  if (!cfg.url || !cfg.anonKey) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or the supabase block in config.json).");
  }
  let sb;
  try {
    sb = await getSupabase(cfg);
  } catch (e) {
    throw new Error(e && e.message ? e.message : "Could not load the Supabase client.");
  }
  const { data, error } = await sb
    .from(cfg.table)
    .upsert({ name, data: value, updated_at: new Date().toISOString() }, { onConflict: "name" })
    .select("data")
    .single();
  if (error) throw new Error(friendlyWriteError(error));
  const fresh = data && data.data != null ? data.data : value; // read-after-write
  clearOverlay(name); // the committed value is not a local-only edit
  publish(name, fresh);
  return fresh;
}
