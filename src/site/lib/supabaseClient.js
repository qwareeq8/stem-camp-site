// Lazy Supabase client. @supabase/supabase-js is loaded ONLY through the dynamic
// import() inside getSupabase, so it never enters the initial bundle: the public
// read path (supabaseStore.hydrate*) uses a plain fetch with the publishable anon
// key, and only the admin write path and an existing-session restore pull the
// SDK as a separate async chunk.
//
// A single memoized client is shared by supabaseAuth.js and supabaseStore.js so
// the admin's signed-in session is attached to write requests automatically.

// localStorage key the SDK persists the auth session under. We set it explicitly
// so a public visitor can be detected (and the SDK skipped) without importing it.
export const SB_STORAGE_KEY = "stemcamp:sb-auth";

let clientPromise = null;

// Resolve to the shared supabase-js client, creating it on first use. Throws if
// the project is not configured. Callers pass the resolved config so this module
// never imports the store (keeps the dependency graph acyclic).
export async function getSupabase({ url, anonKey }) {
  if (clientPromise) return clientPromise;
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured (missing project URL or anon key).");
  }
  const pending = import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // hash router owns the URL fragment
        storageKey: SB_STORAGE_KEY,
      },
    }),
  );
  // A failed chunk load is never memoized: drop the cached promise so the next
  // call retries instead of replaying the same rejection for the whole session.
  pending.catch(() => { if (clientPromise === pending) clientPromise = null; });
  clientPromise = pending;
  return clientPromise;
}

// True when an admin auth session is persisted in this browser. Lets the auth
// module restore a session on load without importing the SDK for public
// visitors who never signed in.
export function hasPersistedSession() {
  try {
    return !!localStorage.getItem(SB_STORAGE_KEY);
  } catch {
    return false;
  }
}
