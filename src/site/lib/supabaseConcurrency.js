// Small, dependency-free helpers for the collection store's optimistic
// concurrency boundary. Keeping this logic separate makes the exact write
// contract testable without loading React, bundled JSON, or a real Supabase
// client.

export function isWritableHydrationStatus(status) {
  return status?.state === "live" || status?.state === "absent";
}

export function sameHydrationRevision(left, right) {
  if (!left || !right || left.state !== right.state) return false;
  if (left.state === "live") return left.updatedAt === right.updatedAt;
  return left.state === "absent";
}

// Perform one atomic write against the revision the editor actually loaded.
// Existing rows use a conditional UPDATE on both the primary key and
// updated_at. Missing rows use INSERT, whose primary-key constraint detects a
// concurrent first writer. No read-then-upsert window is left between the
// version check and the write.
export async function writeCollectionIfCurrent(client, table, name, value, baseStatus) {
  if (baseStatus.state === "absent") {
    const result = await client
      .from(table)
      .insert({ name, data: value })
      .select("data,updated_at")
      .single();
    return { ...result, conflict: result.error?.code === "23505" };
  }

  const result = await client
    .from(table)
    .update({ data: value })
    .eq("name", name)
    .eq("updated_at", baseStatus.updatedAt)
    .select("data,updated_at")
    .maybeSingle();
  return { ...result, conflict: !result.error && result.data == null };
}
