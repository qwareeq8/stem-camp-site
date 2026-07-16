// The deck landing, themed in the site's design system: camp tiles, a category
// filter, and station/reserve cards built from the site's .card / .badge / .btn
// vocabulary so the deck reads as a route of the website, not a separate notebook.
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { CATMAP, PYB_DECK, PY_DECK, TREESB_DECK, TREES_DECK } from "./data/decks.js";
import { CAT_ICON } from "./icons.jsx";
import { CAMP, T, f } from "./theme.js";

function StationCard({ a, accent, onSelect }) {
  const CatIco = CAT_ICON[a.cat] || Sparkles;
  const num = a.code.split("-")[1];
  return (
    <button onClick={() => onSelect(a)} className="card ticks card-link focusable"
      style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 150 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="meta" style={{ color: accent }}>{a.code}</span>
        <CatIco size={18} strokeWidth={1.9} color={accent} aria-hidden />
      </div>
      <h3 style={{ flex: 1 }}>{a.t}</h3>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span className="meta">{(CATMAP[a.cat] && CATMAP[a.cat].l) || a.cat}</span>
        <span className="meta">№ {num}</span>
      </div>
    </button>
  );
}

function BackupCard({ a, accent, onSelect }) {
  const num = a.code.split("-")[1];
  return (
    <button onClick={() => onSelect(a)} className="card card-link focusable"
      style={{ display: "flex", flexDirection: "column", gap: 6, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span className="meta" style={{ color: accent }}>{a.code}</span>
        <span className="meta">backup {num}</span>
      </div>
      <h3 style={{ fontSize: 16, color: T.ink2 }}>{a.t}</h3>
    </button>
  );
}

// Track a narrow (phone) viewport so the camp tiles collapse to one column. The
// deck is inline-styled, so the breakpoint lives here as a matchMedia hook.
function useIsNarrow(bp = 640) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [bp]);
  return narrow;
}

function Home({ onSelect, camp, setCamp }) {
  const [filter, setFilter] = useState("all");
  const isNarrow = useIsNarrow(640);
  const list = camp === "trees" ? TREES_DECK : PY_DECK;
  const backups = camp === "trees" ? TREESB_DECK : PYB_DECK;
  const theme = CAMP[camp];
  // The welcome deck is an orientation card, not one of the numbered stations, so it
  // is left out of the station count, the category filter, and the station grid, and
  // shown as its own "Start here" card instead.
  const welcome = list.find((a) => a.welcome);
  const stations = list.filter((a) => !a.welcome);
  const cats = ["all", ...[...new Set(stations.map((a) => a.cat))]];
  const shown = filter === "all" ? stations : stations.filter((a) => a.cat === filter);
  const gridCols = "repeat(auto-fill,minmax(220px,1fr))";

  return (
    <div className="deck-landing" style={{ position: "relative" }}>
      {/* camp switcher: two site-style cards */}
      <div role="group" aria-label="Choose camp" className="grid"
        style={{ gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr", marginBottom: 6 }}>
        {(["trees", "pystem"]).map((k) => {
          const active = camp === k;
          const t = CAMP[k];
          return (
            <button key={k} aria-pressed={active}
              className={`card card-link focusable camp-tile${active ? " is-active" : ""}`}
              style={{ "--camp-acc": t.acc }}
              onClick={() => { setCamp(k); setFilter("all"); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span className={`badge ${k === "trees" ? "trees" : "py"}`}>{k === "trees" ? "Trees" : "PY-STEM"}</span>
                <span className="meta">{k === "trees" ? "Camp I" : "Camp II"}</span>
              </div>
              <h2 style={{ fontSize: 24, color: t.acc, marginBottom: 4 }}>{t.label}</h2>
              <div style={{ ...f.sans(400, 13.5, { lh: 1.5 }), color: T.mute }}>{t.sub}</div>
            </button>
          );
        })}
      </div>

      {/* section label: camp framing + station count. On narrow phones the full tagline
          wraps and collapses the trailing rule line, so show a short one-line label there. */}
      <h2 className="section-title">
        {isNarrow
          ? `${stations.length} stations`
          : `${camp === "trees" ? "Field · Forest · Future" : "Signal · System · Science"} · ${stations.length} stations`}
      </h2>

      {/* welcome / orientation card: reachable, but not counted as a station */}
      {welcome && (
        <button onClick={() => onSelect(welcome)} className="card card-link focusable"
          style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="meta" style={{ color: theme.acc }}>Start here</span>
            <Sparkles size={18} strokeWidth={1.9} color={theme.acc} aria-hidden />
          </div>
          <h3 style={{ margin: 0 }}>{welcome.t}</h3>
          <div className="meta">{welcome.sub}</div>
        </button>
      )}

      {/* category filter */}
      <div className="row" style={{ flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {cats.map((k) => {
          const lbl = k === "all" ? "All" : (CATMAP[k] ? CATMAP[k].l : k);
          const on = filter === k;
          return (
            <button key={k} className={`btn${on ? "" : " ghost"} focusable`} onClick={() => setFilter(k)}>
              {lbl}
            </button>
          );
        })}
      </div>

      {/* station grid */}
      <div className="grid" style={{ gridTemplateColumns: gridCols }}>
        {shown.map((a) => (
          <StationCard key={a.code} a={a} accent={theme.acc} onSelect={onSelect} />
        ))}
      </div>

      {/* reserves */}
      <h2 className="section-title" style={{ marginTop: 30 }}>Reserve stations</h2>
      <div className="grid" style={{ gridTemplateColumns: gridCols }}>
        {backups.map((a) => (
          <BackupCard key={a.code} a={a} accent={theme.acc} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

export { StationCard, BackupCard, Home };
