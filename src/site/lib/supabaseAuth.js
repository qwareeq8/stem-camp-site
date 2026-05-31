// Supabase email/password auth. The admin signs in with the credentials of the
// single Supabase Auth account created for the camp; Supabase issues a JWT and
// Row Level Security uses it to allow writes. Reading the public bundle grants no
// write: only a holder of valid admin credentials gets a write-capable session.
//
// This module exposes the SAME surface as the old auth (login -> {ok, error},
// logout, getToken, useAuth) so Nav.jsx and Admin.jsx change minimally. The
// supabase-js SDK is loaded on demand: a public visitor with no persisted session
// never imports it; only sign-in or restoring an existing session does.
import { useSyncExternalStore } from "react";
import { getSupabase, hasPersistedSession } from "./supabaseClient.js";
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

// Restore an existing admin session on load WITHOUT pulling supabase-js for
// public visitors. Only runs when a session is persisted in this browser.
async function bootstrap() {
  try {
    const sb = await ensureClient();
    const { data } = await sb.auth.getSession();
    currentSession = data.session || null;
    watch(sb);
    emit();
  } catch { /* leave signed-out; sign-in still works on demand */ }
}

if (typeof window !== "undefined" && hasPersistedSession()) {
  bootstrap();
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

export async function logout() {
  try {
    const sb = await ensureClient();
    await sb.auth.signOut();
  } catch { /* clear locally even if the network call fails */ }
  currentSession = null;
  emit();
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
