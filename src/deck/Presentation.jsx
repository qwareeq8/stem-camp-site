// The slide presentation shell, themed in the site's design system (section-title
// labels, .card/.table/.badge/.btn). The slide nav, work-block timer, demo mount,
// and every transition timing are preserved exactly; only the chrome is re-skinned.
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize, Minimize, Pause, Play, RotateCcw, TableOfContents, X } from "lucide-react";
import { DEMOS } from "./components/demos/index.js";
import { EXTRAS } from "./components/extras/index.js";
import { PYB_DECK, PY_DECK, TREESB_DECK, TREES_DECK } from "./data/decks.js";
import { T, f } from "./theme.js";
import { Btn } from "./ui/primitives.jsx";

function splitPts(line) {
  const i = line.lastIndexOf(":");
  return i < 0 ? [line, ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
}
function SlideFrame({ children, page, accent, phase, code, campKey }) {
  return (
    <div style={{
      position: "relative",
      width: "100%", maxWidth: 820, margin: "0 auto",
      padding: "8px 30px 28px",
    }}>
      {/* top hairline: camp badge + code + phase */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
        borderBottom: `1px solid ${T.rule12}`,
        paddingBottom: 10, marginBottom: 22,
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span className={`badge ${campKey === "trees" ? "trees" : "py"}`}>
            {campKey === "trees" ? "Trees" : "PY-STEM"}
          </span>
          <span className="smallcaps" style={{ ...f.mono(600, 10), color: accent }}>{code}</span>
        </span>
        <span className="smallcaps" style={{ ...f.mono(600, 10), color: T.mute }}>{phase}</span>
      </div>
      <div className="fu" key={page}>{children}</div>
    </div>
  );
}
function Presentation({ act, accent, campKey, onBack, onJump }) {
  const C = accent;
  const [page, setPage] = useState(0);
  const tTotal = act.buildMin * 60;
  const [tSec, setTSec] = useState(tTotal);
  const [tRun, setTRun] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [fsOk, setFsOk] = useState(false);
  const rootRef = useRef(null);

  // Full-screen the deck host -- the in-page scroll container (.deck-host), so a tall
  // slide keeps its own internal scroll. The toggle mounts only where the browser
  // allows full screen, and its icon mirrors the browser, so leaving by any route --
  // the button, Escape, or the OS -- keeps it in sync.
  const toggleFs = () => {
    const host = rootRef.current?.closest(".deck-host");
    if (!host) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else host.requestFullscreen?.();
  };
  // Leaving a station for the landing also drops full screen, so Home never inherits
  // a full-screen shell it has no control to exit. Jumping between stations is not
  // routed through here, so a full-screen talk stays full screen across jumps.
  const goBack = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    onBack();
  };
  // Reconcile the icon with the live browser state on mount as well as on change:
  // .deck-host outlives this station-keyed component, so a remount (e.g. a jump) made
  // while full screen must adopt the running state -- fullscreenchange will not fire.
  useEffect(() => {
    setFsOk(!!document.fullscreenEnabled);
    const sync = () => setIsFs(document.fullscreenElement === rootRef.current?.closest(".deck-host"));
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  // Focus the deck root when a station opens so slide keys work immediately,
  // without scrolling the page to it.
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, [act.code]);

  // The deck pane (.deck-host) is an internal scroll container. Reset it to the
  // top on every slide and station change, so a residual scroll carried over from
  // the landing or a previous slide never tucks the slide's top context band
  // (camp, code, phase) up behind the sticky deck header.
  useEffect(() => {
    rootRef.current?.closest(".deck-host")?.scrollTo({ top: 0 });
  }, [page]);

  useEffect(() => {
    if (!tRun || tSec <= 0) return;
    const id = setInterval(() => setTSec((p) => (p <= 1 ? (setTRun(false), 0) : p - 1)), 1000);
    return () => clearInterval(id);
  }, [tRun, tSec]);

  useEffect(() => {
    if (!navOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [navOpen]);

  const tFmt = `${Math.floor(tSec / 60)}:${String(tSec % 60).padStart(2, "0")}`;

  const slides = [{ type: "title" }];
  act.science.forEach((s, i) => slides.push({ type: "science", data: s, idx: i }));
  slides.push({ type: "materials" }, { type: "steps" });
  if (act.buildMin > 0) slides.push({ type: "timer" });
  slides.push({ type: "compete" }, { type: "debrief" });
  const total = slides.length;
  const sl = slides[page];
  const slideLabel = (s) => s.type === "title" ? "Title" : s.type === "science" ? s.data.t : s.type === "materials" ? "Kit list" : s.type === "steps" ? "Build or solve" : s.type === "timer" ? "Work block" : s.type === "compete" ? "Competition" : "Defend";

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const h = (e) => {
      // Only act when focus is inside the deck, so Space and the arrow keys
      // never swallow page scroll or interfere with the rest of the site.
      if (!node.contains(document.activeElement)) return;
      if (navOpen) { if (e.key === "Escape") setNavOpen(false); return; }
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setPage((p) => Math.min(p + 1, total - 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPage((p) => Math.max(p - 1, 0));
      }
      // In full screen, let Escape exit it (the browser default) rather than close
      // the station, so one keystroke does one thing.
      if (e.key === "Escape" && !document.fullscreenElement) onBack();
    };
    node.addEventListener("keydown", h);
    return () => node.removeEventListener("keydown", h);
  }, [total, onBack, navOpen]);

  const Demo = sl.type === "science" ? (sl.data.demo ? DEMOS[sl.data.demo] : EXTRAS[sl.data.t]) : null;
  const phaseLabel = {
    title: "brief", science: "concept",
    materials: "kit", steps: "build",
    timer: "timer", compete: "score",
    debrief: "defend",
  }[sl.type];

  return (
    <div ref={rootRef} tabIndex={-1} style={{ minHeight: 0, display: "flex", flexDirection: "column",
      background: T.surface, color: T.ink, position: "relative", outline: "none" }}>
      {/* top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        padding: "12px 18px", borderBottom: `1px solid ${T.rule12}`,
        position: "sticky", top: 0, background: T.surface, zIndex: 4,
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <button onClick={goBack} className="btn ghost focusable" style={{ padding: "7px 12px" }}>
            <ArrowLeft size={13} strokeWidth={2.2} /> Back
          </button>
          <button onClick={() => setNavOpen(true)} className="btn ghost focusable" style={{ padding: "7px 12px" }}>
            <TableOfContents size={13} strokeWidth={2.2} /> Index
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {(tRun || tSec < tTotal) && act.buildMin > 0 && (
            <button className="focusable" aria-label="Go to work block timer"
              onClick={() => setPage(slides.findIndex((s) => s.type === "timer"))}
              style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "inline-flex" }}>
              <span className={`badge${tRun ? " warn" : ""}`}>{tFmt}</span>
            </button>
          )}
          <span className="ticker" style={{ ...f.mono(500, 11), color: T.mute }}>
            {String(page + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          {fsOk && (
            <button onClick={toggleFs} className="btn ghost focusable"
              aria-label={isFs ? "Exit full screen" : "Full screen"}
              title={isFs ? "Exit full screen" : "Full screen"}
              style={{ padding: "7px 9px" }}>
              {isFs ? <Minimize size={13} strokeWidth={2.2} /> : <Maximize size={13} strokeWidth={2.2} />}
            </button>
          )}
        </div>
      </header>

      {/* progress hairline */}
      <div style={{ height: 2, background: T.rule12, position: "relative" }}>
        <div style={{ height: 2, background: C, width: `${((page + 1) / total) * 100}%`,
          transition: "width .45s cubic-bezier(.22,1,.36,1)" }} />
      </div>

      {/* content */}
      <div style={{ flex: 1, padding: "26px 0 24px" }}>
        <SlideFrame page={page} accent={C} phase={phaseLabel} code={act.code} campKey={campKey}>

          {sl.type === "title" && (
            <div>
              <div className="section-title" style={{ marginTop: 0 }}>{act.catLabel}</div>
              <h2 style={{ ...f.display(500, 60, { opsz: 144, lh: 1.02 }), color: T.ink, marginBottom: 12, maxWidth: 720 }}>
                {act.t}
              </h2>
              <p style={{ ...f.sans(400, 20, { lh: 1.45 }), color: T.ink2, maxWidth: 620, marginBottom: 24 }}>{act.sub}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 720 }}>
                <div className="card ticks">
                  <h3 className="section-title" style={{ margin: "0 0 6px" }}>Mission</h3>
                  <p style={{ ...f.sans(500, 17, { lh: 1.55 }), color: T.ink, margin: 0 }}>{act.mission}</p>
                </div>
                {/* Each "· label" segment is kept intact (nowrap) and breaks happen
                    only between segments, so a wrap never strands a separator dot. */}
                <div style={{ color: T.mute, ...f.mono(500, 10.5, { upper: true, tracking: 0.12 }) }}>
                  {act.buildMin > 0 && (
                    <span style={{ whiteSpace: "nowrap" }}>Build {act.buildMin} min ·{" "}</span>
                  )}
                  <span style={{ whiteSpace: "nowrap" }}>{act.science.length} concept{act.science.length === 1 ? "" : "s"}</span>{" "}
                  <span style={{ whiteSpace: "nowrap" }}>· {act.steps.length} build steps</span>
                </div>
              </div>
            </div>
          )}

          {sl.type === "science" && (
            <div>
              <div className="section-title" style={{ marginTop: 0 }}>Concept {sl.idx + 1} / {act.science.length}</div>
              <h2 style={{ ...f.display(500, 42, { opsz: 72, lh: 1.06 }), color: T.ink, marginBottom: 14, maxWidth: 720 }}>
                {sl.data.t}
              </h2>
              <p style={{ ...f.sans(400, 17, { lh: 1.65 }), color: T.ink2, marginBottom: 22, maxWidth: 680 }}>{sl.data.b}</p>
              {Demo && <div style={{ marginTop: 6 }}><Demo /></div>}
            </div>
          )}

          {sl.type === "materials" && (
            <div>
              <h2 style={{ ...f.display(500, 40, { opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 18 }}>Kit list</h2>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th style={{ width: 44 }}>#</th><th>Item</th><th className="deck-kit-qty" style={{ textAlign: "right" }}>Qty</th></tr>
                  </thead>
                  <tbody>
                    {act.materials.map((m, i) => (
                      <tr key={i}>
                        <td className="meta">{String(i + 1).padStart(2, "0")}</td>
                        <td>{m.n}</td>
                        <td className="deck-kit-qty" style={{ textAlign: "right", fontFamily: "var(--mono)" }}>{m.q}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sl.type === "steps" && (
            <div>
              <h2 style={{ ...f.display(500, 40, { opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 14 }}>Build or solve it</h2>
              <ol style={{ display: "flex", flexDirection: "column", gap: 0, listStyle: "none", margin: 0, padding: 0 }}>
                {act.steps.map((st, i) => (
                  <li key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, alignItems: "flex-start",
                    padding: "16px 0", borderTop: i === 0 ? "none" : `1px solid ${T.rule12}` }}>
                    <div className="meta" style={{ color: C, paddingTop: 3 }}>{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <div style={{ ...f.sans(700, 15.5, { lh: 1.3 }), color: T.ink, marginBottom: 4 }}>{st.t}</div>
                      <div style={{ ...f.sans(400, 14.5, { lh: 1.6 }), color: T.ink2 }}>{st.b}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {sl.type === "timer" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <h2 style={{ ...f.display(500, 40, { opsz: 72, lh: 1.05 }), color: T.ink }}>Work block</h2>
              <p style={{ ...f.mono(600, 13, { upper: true, tracking: 0.2 }), color: T.mute, marginTop: 2 }}>
                {act.buildMin} minutes
              </p>
              <div style={{ position: "relative", width: 260, height: 260, marginTop: 10 }}>
                <svg aria-hidden="true" width="260" height="260" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="130" cy="130" r="118" fill="none" stroke={T.rule12} strokeWidth="1.5" />
                  <circle cx="130" cy="130" r="118" fill="none"
                    stroke={tSec <= 60 && tSec > 0 && tTotal > 60 ? T.warn : T.primary}
                    strokeWidth="3.5"
                    strokeDasharray={`${(tSec / tTotal) * 2 * Math.PI * 118} ${2 * Math.PI * 118}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray .4s" }} />
                </svg>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column", gap: 10,
                }}>
                  <span className="ticker" style={{
                    ...f.mono(500, 46),
                    color: tSec <= 60 && tSec > 0 && tTotal > 60 ? T.warnText : T.ink,
                    lineHeight: 1,
                  }}>{tFmt}</span>
                  <span className={`badge${tRun ? " warn" : (tSec < tTotal ? "" : " ok")}`}>
                    {tRun ? "running" : tSec < tTotal ? "paused" : "ready"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Btn color={tRun ? T.warn : T.primary} active icon={tRun ? Pause : Play}
                  onClick={() => setTRun((r) => !r)}>
                  {tRun ? "pause" : tSec < tTotal ? "resume" : "start"}
                </Btn>
                <Btn icon={RotateCcw} onClick={() => { setTSec(tTotal); setTRun(false); }}>reset</Btn>
              </div>
            </div>
          )}

          {sl.type === "compete" && (
            <div>
              <h2 style={{ ...f.display(500, 40, { opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 4 }}>Competition</h2>
              <p style={{ ...f.sans(400, 14, { lh: 1.5 }), color: T.mute, marginBottom: 18 }}>{act.scoring}</p>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Criterion</th><th style={{ textAlign: "right" }}>Points</th></tr>
                  </thead>
                  <tbody>
                    {act.compete.map((r, i) => {
                      const [crit, pts] = splitPts(r);
                      return (
                        <tr key={i}>
                          <td>{crit}</td>
                          <td style={{ textAlign: "right", fontFamily: "var(--mono)", color: T.ink }}>{pts}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td style={{ ...f.sans(700, 14, { upper: true, tracking: 0.14 }), color: T.primary }}>Total</td>
                      <td style={{ textAlign: "right", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 16, color: T.primary, whiteSpace: "nowrap" }}>100 pts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sl.type === "debrief" && (
            <div>
              <h2 style={{ ...f.display(500, 40, { opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 4 }}>Defend your design</h2>
              <p style={{ ...f.sans(400, 14, { lh: 1.5 }), color: T.mute, marginBottom: 12 }}>Answer with evidence, not opinion.</p>
              <ol style={{ display: "flex", flexDirection: "column", gap: 0, listStyle: "none", margin: 0, padding: 0 }}>
                {act.debrief.map((q, i) => (
                  <li key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, alignItems: "flex-start",
                    padding: "14px 0", borderTop: i === 0 ? "none" : `1px solid ${T.rule12}` }}>
                    <div className="meta" style={{ color: C, paddingTop: 3 }}>{String(i + 1).padStart(2, "0")}</div>
                    <span style={{ ...f.sans(500, 15.5, { lh: 1.55 }), color: T.ink }}>{q}</span>
                  </li>
                ))}
              </ol>
              <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${T.rule12}`,
                ...f.mono(500, 10.5, { upper: true, tracking: 0.18 }), color: T.mute }}>
                Source · {act.source}
              </div>
            </div>
          )}
        </SlideFrame>
      </div>

      {/* nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        padding: "14px 16px", borderTop: `1px solid ${T.rule12}`,
        background: T.surface,
      }}>
        <button onClick={() => page > 0 && setPage((p) => p - 1)}
          disabled={page === 0} className="btn ghost focusable">
          <ArrowLeft size={13} strokeWidth={2.2} /> Back
        </button>
        <div style={{ display: "flex", gap: 4, flex: 1, minWidth: 0, overflow: "hidden", justifyContent: "center" }}>
          {slides.map((_, i) => (
            // At least a 24px transparent hit target around the 4px visual bar
            // keeps every dot directly tappable without changing the look.
            <button key={i} onClick={() => setPage(i)} className="focusable"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === page ? "true" : undefined}
              style={{
                height: 28, minWidth: 24,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                border: "none", padding: 0, background: "transparent",
                cursor: "pointer",
              }}>
              <span aria-hidden style={{
                display: "block",
                width: i === page ? 22 : 8, height: 4, borderRadius: 999,
                background: i === page ? C : T.rule22,
                transition: "width .3s, background .25s",
              }} />
            </button>
          ))}
        </div>
        <button onClick={() => page < total - 1 && setPage((p) => p + 1)}
          disabled={page === total - 1} className="btn ghost focusable">
          Next <ArrowRight size={13} strokeWidth={2.2} />
        </button>
      </nav>

      {/* ===== index drawer: jump to any slide or station without going home ===== */}
      {navOpen && (
        <>
          {/* transparent catcher: the index stays open while you jump; clicking the deck outside it closes it */}
          <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, background: "transparent", zIndex: 2200 }} />
          <aside role="dialog" aria-modal="false" aria-label="Deck index" style={{ position: "fixed", left: 0, top: "var(--nav-h)", bottom: 0, height: "auto", width: "min(320px, calc(100vw - 28px))", background: T.surface, borderRight: `1px solid ${T.rule22}`, zIndex: 2201, overflowY: "auto", padding: "18px 16px 28px", boxShadow: "3px 0 22px rgba(0,0,0,.16)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="section-title" style={{ margin: 0 }}>Index</div>
              <button onClick={() => setNavOpen(false)} aria-label="Close index" className="btn ghost focusable" style={{ padding: "5px 8px" }}><X size={15} strokeWidth={2.2} /></button>
            </div>
            <div className="meta" style={{ marginBottom: 10 }}>{act.code} {"·"} this station</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>
              {slides.map((s, i) => (
                <button key={i} onClick={() => setPage(i)} className="focusable"
                  style={{ display: "flex", gap: 8, alignItems: "baseline", textAlign: "left", border: "none", cursor: "pointer",
                    background: i === page ? `${C}1A` : "transparent", borderLeft: `2px solid ${i === page ? C : "transparent"}`,
                    borderRadius: 6, padding: "7px 9px", color: i === page ? C : T.ink, ...f.sans(i === page ? 600 : 400, 12.5, { lh: 1.3 }) }}>
                  <span className="meta" style={{ minWidth: 18 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{slideLabel(s)}</span>
                </button>
              ))}
            </div>
            {[["From Trees to Tech", TREES_DECK], ["PY-STEM", PY_DECK], ["Backups", [...TREESB_DECK, ...PYB_DECK]]].map(([label, list]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div className="section-title" style={{ margin: "0 0 6px" }}>{label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {list.map((a) => {
                    const cur = a.code === act.code;
                    return (
                      <button key={a.code} onClick={() => onJump(a)} className="focusable"
                        style={{ display: "flex", gap: 8, alignItems: "baseline", textAlign: "left", border: "none", cursor: "pointer",
                          background: cur ? `${C}1A` : "transparent", borderRadius: 6, padding: "6px 9px", color: cur ? C : T.ink,
                          ...f.sans(cur ? 600 : 400, 12, { lh: 1.25 }) }}>
                        <span className="meta" style={{ minWidth: 38 }}>{a.code}</span>
                        <span>{a.t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>
        </>
      )}
    </div>
  );
}

export { splitPts, SlideFrame, Presentation };
