// File-size formatting for the downloadable library. Published entries carry
// exact byte metadata stamped from public/files, so the public page does not
// launch one HEAD request per document. The HEAD fallback is retained for a
// newly typed Admin path that has not been stamped yet.
import { useEffect, useState } from "react";

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

// Resolve a public-relative path (e.g. "files/x.pdf") to a served URL under the
// app's base, so links and HEAD checks agree.
export function fileHref(path) {
  if (!path) return "";
  return `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, "")}`;
}

const cache = new Map(); // resolved URL -> successful { bytes, size } measurement

function probeRequestKey(url, bytes) {
  return `${url}\n${formatBytes(bytes) ? bytes : ""}`;
}

function tagProbe(url, bytes, probe) {
  return {
    ...probe,
    url,
    requestKey: probeRequestKey(url, bytes),
  };
}

function initialProbe(url, bytes) {
  const bundled = formatBytes(bytes);
  if (bundled) {
    return tagProbe(url, bytes, { status: "ready", bytes, size: bundled });
  }
  if (!url) {
    return tagProbe(url, bytes, { status: "idle", bytes: 0, size: "" });
  }
  return tagProbe(
    url,
    bytes,
    cache.get(url) || { status: "pending", bytes: 0, size: "" },
  );
}

// React renders once with the previous hook state before a path-change effect
// can reset it. Mask that state synchronously so callers never observe a
// successful measurement that belongs to another URL (or byte declaration).
export function fileProbeForRequest(probe, url, bytes) {
  return probe?.requestKey === probeRequestKey(url, bytes)
    ? probe
    : initialProbe(url, bytes);
}

// Defense in depth for Admin's automatic metadata stamp: even if a caller
// supplies an out-of-date probe, only a result for the row's current URL may be
// copied into that row.
export function measuredBytesFromProbe(path, bytes, probe) {
  if (bytes || !path || probe?.url !== fileHref(path)) return 0;
  return probe.status === "ready" && probe.bytes > 0 ? probe.bytes : 0;
}

async function measure(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return { status: "missing", bytes: 0, size: "" };
    const bytes = Number(res.headers.get("content-length"));
    const size = formatBytes(bytes);
    return size
      ? { status: "ready", bytes, size }
      : { status: "unavailable", bytes: 0, size: "" };
  } catch {
    return { status: "unavailable", bytes: 0, size: "" };
  }
}

// The Advanced JSON editor has no per-row probe UI, so it verifies the whole
// submitted catalog before publishing. Check in small batches to avoid a burst
// of 108 simultaneous requests, and require the claimed byte count to match the
// served object so fabricated metadata cannot bless a broken path.
export async function verifyFileCollection(files) {
  const problems = [];
  const batchSize = 8;
  for (let start = 0; start < files.length; start += batchSize) {
    const batch = files.slice(start, start + batchSize);
    const results = await Promise.all(batch.map(async (file) => ({
      file,
      result: await measure(fileHref(file.path)),
    })));
    for (const { file, result } of results) {
      if (result.status !== "ready") {
        problems.push(`${file.path}: file is missing or its size cannot be read`);
      } else if (result.bytes !== file.bytes) {
        problems.push(`${file.path}: metadata says ${file.bytes} bytes but the served file is ${result.bytes} bytes`);
      }
    }
  }
  if (problems.length) {
    const shown = problems.slice(0, 4).join("; ");
    const more = problems.length > 4 ? ` (+${problems.length - 4} more)` : "";
    throw new Error(`File checks failed: ${shown}${more}`);
  }
}

// Returns stamped metadata immediately. For a newly authored path without
// metadata, measures the served file and exposes whether that check is pending,
// missing, or unavailable. Successful measurements are cached; failures are not
// so editing away from a path and back can re-check a newly deployed file.
export function useFileProbe(path, bytes) {
  const url = fileHref(path);
  const bundled = formatBytes(bytes);
  const [probe, setProbe] = useState(() => initialProbe(url, bytes));
  useEffect(() => {
    if (bundled) {
      setProbe(tagProbe(url, bytes, { status: "ready", bytes, size: bundled }));
      return undefined;
    }
    if (!url) {
      setProbe(tagProbe(url, bytes, { status: "idle", bytes: 0, size: "" }));
      return undefined;
    }
    if (cache.has(url)) {
      setProbe(tagProbe(url, bytes, cache.get(url)));
      return undefined;
    }
    setProbe(tagProbe(url, bytes, { status: "pending", bytes: 0, size: "" }));
    let alive = true;
    measure(url).then((result) => {
      if (result.status === "ready") cache.set(url, result);
      if (alive) setProbe(tagProbe(url, bytes, result));
    });
    return () => {
      alive = false;
    };
  }, [url, bytes, bundled]);
  return fileProbeForRequest(probe, url, bytes);
}

// Public file cards only need the formatted value. Admin uses the richer probe
// above to prevent a missing path from being saved as a broken download.
export function useFileSize(path, bytes) {
  return useFileProbe(path, bytes).size;
}
