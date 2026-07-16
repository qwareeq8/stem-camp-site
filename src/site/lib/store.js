// Data layer entry point. The implementation lives in supabaseStore.js, which
// reads each collection at runtime from a Supabase (Postgres + PostgREST) table
// with the bundled src/data JSON as the offline/fallback default, and commits
// admin edits back via authenticated revision-checked writes under Row Level
// Security. This module re-exports the stable component API (useCollection,
// useConfig, getCollection, setCollection, resetCollection,
// clearAllCollectionOverlays, isOverridden, subscribe, SEED_DATA) so existing
// page imports from "./lib/store.js" keep working unchanged.
export {
  subscribe,
  getCollection,
  setCollection,
  resetCollection,
  clearAllCollectionOverlays,
  isOverridden,
  useCollection,
  getCollectionStatus,
  useCollectionStatus,
  useConfig,
  SEED_DATA,
  // Supabase-backed extensions (used by App.jsx hydration and the admin console):
  hydrateCollection,
  retryCollection,
  hydrateAll,
  commitCollection,
  supabaseCfg,
  isSupabaseConfigured,
} from "./supabaseStore.js";
