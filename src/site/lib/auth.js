// Auth entry point. The implementation lives in supabaseAuth.js, which gates the
// data console behind a Supabase Auth email/password session validated by
// Supabase; Row Level Security uses the issued JWT to allow writes. This module
// re-exports the stable surface (login, logout, useAuth) plus getToken, so
// existing imports from "./lib/auth.js" keep working. login resolves to
// { ok, error } so callers can show a precise reason on failure; useAuth exposes
// { authed, login, logout, getToken }.
export { login, logout, getToken, useAuth } from "./supabaseAuth.js";
