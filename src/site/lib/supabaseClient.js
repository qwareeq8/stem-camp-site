// Lazy Supabase client. @supabase/supabase-js is loaded ONLY through the dynamic
// import() inside getSupabase, so it never enters the initial bundle: the public
// read path (supabaseStore.hydrate*) uses a plain fetch with the publishable anon
// key, and only Admin sign-in/write work pulls the SDK as a separate async
// chunk.
//
// A single memoized client is shared by supabaseAuth.js and supabaseStore.js so
// the admin's in-memory session is attached to write requests automatically.

// Legacy storage key retained only so sign-out can remove a token written by an
// older deployment. New sessions are intentionally memory-only on shared camp
// devices and disappear on reload/tab close.
export const SB_STORAGE_KEY = "stemcamp:sb-auth";

let clientPromise = null;
let clientIdentity = null;

// Resolve to the shared supabase-js client, creating it on first use. Throws if
// the project is not configured. Callers pass the resolved config so this module
// never imports the store (keeps the dependency graph acyclic).
export async function getSupabase({ url, anonKey }) {
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured (missing project URL or anon key).");
  }
  const identity = `${url}\n${anonKey}`;
  if (clientPromise) {
    if (clientIdentity !== identity) {
      throw new Error(
        "The Supabase connection changed after this browser session started. Sign out and reload the page before using the new connection.",
      );
    }
    return clientPromise;
  }
  const pending = import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false, // hash router owns the URL fragment
      },
    }),
  );
  // A failed chunk load is never memoized: drop the cached promise so the next
  // call retries instead of replaying the same rejection for the whole session.
  clientIdentity = identity;
  pending.catch(() => {
    if (clientPromise === pending) {
      clientPromise = null;
      clientIdentity = null;
    }
  });
  clientPromise = pending;
  return clientPromise;
}
