// Live file-size measurement. The downloadable library is just static files
// under public/files, so the source of truth for a file's size is the file
// itself. We read Content-Length with a HEAD request and format it on demand,
// rather than storing a size string that has to be hand-updated on every
// rebuild. Results are cached per URL for the page's lifetime, so each file is
// measured at most once. Used by the public Files page and the admin editor.
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

const cache = new Map(); // resolved URL -> formatted size string ("" when unknown)

async function measure(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return "";
    return formatBytes(Number(res.headers.get("content-length")));
  } catch {
    return "";
  }
}

// Returns the file's size as a formatted string, measured live from the served
// file, or "" while loading or when it cannot be determined.
export function useFileSize(path) {
  const url = fileHref(path);
  const [size, setSize] = useState(() => cache.get(url) ?? "");
  useEffect(() => {
    if (!url) {
      setSize("");
      return undefined;
    }
    if (cache.has(url)) {
      setSize(cache.get(url));
      return undefined;
    }
    let alive = true;
    measure(url).then((s) => {
      cache.set(url, s);
      if (alive) setSize(s);
    });
    return () => {
      alive = false;
    };
  }, [url]);
  return size;
}
