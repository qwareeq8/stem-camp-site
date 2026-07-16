import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";
import {
  isWritableHydrationStatus,
  sameHydrationRevision,
  writeCollectionIfCurrent,
} from "../src/site/lib/supabaseConcurrency.js";
import { getSupabase } from "../src/site/lib/supabaseClient.js";

function fakeClient(result) {
  const calls = [];
  const query = {
    insert(value) { calls.push(["insert", value]); return query; },
    update(value) { calls.push(["update", value]); return query; },
    eq(column, value) { calls.push(["eq", column, value]); return query; },
    select(columns) { calls.push(["select", columns]); return query; },
    single() { calls.push(["single"]); return Promise.resolve(result); },
    maybeSingle() { calls.push(["maybeSingle"]); return Promise.resolve(result); },
  };
  return {
    calls,
    client: {
      from(table) { calls.push(["from", table]); return query; },
    },
  };
}

async function loadIsolatedStore() {
  const result = await build({
    entryPoints: [new URL("../src/site/lib/supabaseStore.js", import.meta.url).pathname],
    bundle: true,
    format: "esm",
    platform: "browser",
    write: false,
  });
  const source = Buffer.from(result.outputFiles[0].text).toString("base64");
  return import(`data:text/javascript;base64,${source}`);
}

async function loadIsolatedFileSize() {
  const result = await build({
    entryPoints: [new URL("../src/site/lib/fileSize.js", import.meta.url).pathname],
    bundle: true,
    define: { "import.meta.env.BASE_URL": '"/preview/"' },
    format: "esm",
    platform: "browser",
    write: false,
  });
  const source = Buffer.from(result.outputFiles[0].text).toString("base64");
  return import(`data:text/javascript;base64,${source}`);
}

test("a changed file path cannot reuse or stamp the previous path's measurement", async () => {
  const fileSize = await loadIsolatedFileSize();
  const oldProbe = fileSize.fileProbeForRequest(
    undefined,
    "/preview/files/old.pdf",
    4096,
  );

  const newProbe = fileSize.fileProbeForRequest(
    oldProbe,
    "/preview/files/new.pdf",
    undefined,
  );

  assert.equal(newProbe.url, "/preview/files/new.pdf");
  assert.equal(newProbe.status, "pending");
  assert.equal(newProbe.bytes, 0);
  assert.equal(
    fileSize.measuredBytesFromProbe("files/new.pdf", undefined, oldProbe),
    0,
  );
});

test("save completion distinguishes a cleared preview from a newer preview", async () => {
  const store = await loadIsolatedStore();

  assert.equal(store.shouldPreserveOverlayAfterWrite(4, 5, false), false);
  assert.equal(store.shouldPreserveOverlayAfterWrite(4, 5, true), true);
  assert.equal(store.shouldPreserveOverlayAfterWrite(4, 4, true), false);
});

test("clearing previews reveals validated published values and seed fallbacks", async () => {
  const savedLocalStorage = globalThis.localStorage;
  const savedFetch = globalThis.fetch;
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };

  try {
    const store = await loadIsolatedStore();
    const configured = structuredClone(store.SEED_DATA.config);
    configured.supabase = {
      url: "https://preview-test.invalid",
      anonKey: "publishable-test-key",
      table: "collections",
    };
    store.setCollection("config", configured);

    const publishedTeams = [{ id: "published", name: "Published", camp: "trees" }];
    globalThis.fetch = async (url) => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => String(url).includes("name=eq.teams")
        ? [{ data: publishedTeams, updated_at: "2026-07-15T12:00:00.000Z" }]
        : [],
    });

    await store.hydrateCollection("teams");
    await store.hydrateCollection("prizes");
    store.setCollection("teams", [{ id: "preview", name: "Preview", camp: "trees" }]);
    store.setCollection("prizes", [{ id: "preview", name: "Preview" }]);
    store.clearAllCollectionOverlays();

    assert.deepEqual(store.getCollection("teams"), publishedTeams);
    assert.deepEqual(store.getCollection("prizes"), store.SEED_DATA.prizes);
    assert.equal(store.isOverridden("teams"), false);
    assert.equal(store.isOverridden("prizes"), false);
  } finally {
    if (savedLocalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = savedLocalStorage;
    globalThis.fetch = savedFetch;
  }
});

test("only validated live rows and confirmed absence are writable", () => {
  assert.equal(isWritableHydrationStatus({ state: "live" }), true);
  assert.equal(isWritableHydrationStatus({ state: "absent" }), true);
  for (const state of ["pending", "seed-only", "loading", "failed", "invalid", "conflict"]) {
    assert.equal(isWritableHydrationStatus({ state }), false, state);
  }
});

test("a browser session refuses to silently switch Supabase projects", async () => {
  await getSupabase({ url: "https://first-project.invalid", anonKey: "publishable-first-key" });
  await assert.rejects(
    getSupabase({ url: "https://second-project.invalid", anonKey: "publishable-second-key" }),
    /connection changed/i,
  );
});

test("a live draft is tied to its exact updated_at revision", () => {
  const loaded = { state: "live", updatedAt: "2026-07-15T12:00:00.000Z" };
  assert.equal(sameHydrationRevision(loaded, { ...loaded }), true);
  assert.equal(sameHydrationRevision(loaded, { ...loaded, updatedAt: "2026-07-15T12:01:00.000Z" }), false);
  assert.equal(sameHydrationRevision({ state: "absent" }, { state: "absent" }), true);
  assert.equal(sameHydrationRevision({ state: "failed" }, { state: "failed" }), false);
});

test("an existing row uses one atomic conditional update", async () => {
  const stored = {
    data: { data: [{ id: "team-1" }], updated_at: "2026-07-15T12:01:00.000Z" },
    error: null,
  };
  const fake = fakeClient(stored);
  const result = await writeCollectionIfCurrent(
    fake.client,
    "collections",
    "teams",
    [{ id: "team-1" }],
    { state: "live", updatedAt: "2026-07-15T12:00:00.000Z" },
  );

  assert.equal(result.conflict, false);
  assert.deepEqual(fake.calls, [
    ["from", "collections"],
    ["update", { data: [{ id: "team-1" }] }],
    ["eq", "name", "teams"],
    ["eq", "updated_at", "2026-07-15T12:00:00.000Z"],
    ["select", "data,updated_at"],
    ["maybeSingle"],
  ]);
});

test("zero updated rows is reported as a concurrency conflict", async () => {
  const fake = fakeClient({ data: null, error: null });
  const result = await writeCollectionIfCurrent(
    fake.client,
    "collections",
    "scores",
    [],
    { state: "live", updatedAt: "old-revision" },
  );
  assert.equal(result.conflict, true);
});

test("a confirmed missing row uses insert and detects a concurrent creator", async () => {
  const fake = fakeClient({ data: null, error: { code: "23505", message: "duplicate key" } });
  const result = await writeCollectionIfCurrent(
    fake.client,
    "collections",
    "scores",
    [],
    { state: "absent", updatedAt: null },
  );

  assert.equal(result.conflict, true);
  assert.deepEqual(fake.calls, [
    ["from", "collections"],
    ["insert", { name: "scores", data: [] }],
    ["select", "data,updated_at"],
    ["single"],
  ]);
});
