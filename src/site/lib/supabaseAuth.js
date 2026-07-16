// Supabase email/password auth. The admin signs in with the credentials of the
// single Supabase Auth account created for the camp; Supabase issues a JWT and
// Row Level Security uses it to allow writes. Reading the public bundle grants no
// write: only a holder of valid admin credentials gets a write-capable session.
//
// This module exposes the SAME surface as the old auth (login -> {ok, error},
// logout, getToken, useAuth) so Nav.jsx and Admin.jsx change minimally. The
// supabase-js SDK is loaded on demand only for sign-in/write work. Sessions are
// memory-only so a shared camp device cannot silently restore Admin after a
// reload or reopened tab.
import { useSyncExternalStore } from "react";
import { getSupabase, SB_STORAGE_KEY } from "./supabaseClient.js";
import { supabaseCfg } from "./supabaseStore.js";

const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

let currentSession = null;
let watching = false; // onAuthStateChange installed?

async function ensureClient() {
  const cfg = supabaseCfg();
  if (!cfg.url || !cfg.anonKey) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or the supabase block in config.json) before signing in.");
  }
  return getSupabase(cfg);
}

// Install the auth-state listener once so external sign-out/refresh keeps the
// snapshot in sync.
function watch(sb) {
  if (watching) return;
  watching = true;
  sb.auth.onAuthStateChange((_event, session) => {
    currentSession = session || null;
    emit();
  });
}

function friendlyLoginError(error) {
  const msg = (error && error.message) || "Sign in failed.";
  if (/invalid login credentials/i.test(msg)) return "Email or password is incorrect.";
  if (/email not confirmed/i.test(msg)) return "This account's email is not confirmed yet. Confirm it in Supabase, then try again.";
  if (/rate limit/i.test(msg)) return "Too many attempts. Wait a minute and try again.";
  return msg;
}

// Sign in with the admin email and password. Resolves to { ok } on success or
// { ok: false, error } with an actionable reason.
export async function login(email, password) {
  const e = (email || "").trim();
  if (!e || !password) return { ok: false, error: "Enter the admin email and password." };
  let sb;
  try {
    sb = await ensureClient();
  } catch (err) {
    return { ok: false, error: err.message };
  }
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email: e, password });
    if (error) return { ok: false, error: friendlyLoginError(error) };
    currentSession = data.session || null;
    watch(sb);
    emit();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach Supabase. Check your connection and the project URL." };
  }
}

// Sign out and clear the persisted session. signOut resolves with { error }
// instead of throwing, and on a network failure the SDK keeps the local token,
// so a failed global sign-out falls back to a local-scope sign-out and, as a
// last resort, removes the persisted token directly. Local state is cleared
// regardless. Resolves to { ok } or { ok: false, error }.
export async function logout() {
  let error = null;
  try {
    const sb = await ensureClient();
    ({ error } = await sb.auth.signOut());
    if (error) ({ error } = await sb.auth.signOut({ scope: "local" }));
  } catch (err) {
    error = err;
  }
  if (error) {
    try { localStorage.removeItem(SB_STORAGE_KEY); } catch { /* storage unavailable */ }
  }
  currentSession = null;
  emit();
  if (error) return { ok: false, error: (error && error.message) || "Sign out failed." };
  return { ok: true };
}

export function getToken() {
  return (currentSession && currentSession.access_token) || null;
}

function authed() {
  return !!currentSession;
}

export function useAuth() {
  const a = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    authed,
    () => false,
  );
  return { authed: a, login, logout, getToken };
}
