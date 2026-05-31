// The slide presentation shell: slide frame, index side-tab, and navigation.
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ListChecks, Microscope, Pause, Play, RotateCcw, Sparkles, X } from "lucide-react";
import { DEMOS } from "./components/demos/index.js";
import { EXTRAS } from "./components/extras/index.js";
import { PYB_DECK, PY_DECK, TREESB_DECK, TREES_DECK } from "./data/decks.js";
import { CAT_ICON, DEMO_ICON, IconChip, PHASE_ICON } from "./icons.jsx";
import { CAMP, T, f } from "./theme.js";
import { Btn, Corners } from "./ui/primitives.jsx";

function splitPts(line) {
  const i = line.lastIndexOf(":");
  return i < 0 ? [line, ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
}
function SlideFrame({ children, page, total, accent, phase, code, title, campKey }) {
  const Icon = PHASE_ICON[phase] || Sparkles;
  return (
    <div style={{
      position: "relative",
      width: "100%", maxWidth: 820, margin: "0 auto",
      padding: "26px 30px 28px 70px",
    }}>
      {/* left ruled index column */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 50,
        borderRight: `1px solid ${T.rule12}`,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 28, gap: 18,
      }}>
        <span style={{ ...f.mono(500, 9.5, { upper: true, tracking: 0.18 }), color: T.mute,
          writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          {campKey === "trees" ? "Trees · Tech" : "PY · STEM"}
        </span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
          <IconChip icon={Icon} color={accent} size={28} stroke={1.9} />
          <span className="ticker" style={{ ...f.mono(600, 11), color: accent }}>{String(page + 1).padStart(2, "0")}</span>
          <span className="ticker" style={{ ...f.mono(400, 10), color: T.mute }}>/{String(total).padStart(2, "0")}</span>
        </div>
      </div>
      {/* top hairline with code + phase */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        borderBottom: `1px solid ${T.rule12}`,
        paddingBottom: 8, marginBottom: 20,
      }}>
        <span className="smallcaps" style={{ ...f.mono(600, 10), color: accent }}>{code}</span>
        <span className="smallcaps" style={{ ...f.mono(600, 10), color: T.mute }}>{phase}</span>
      </div>
      <div className="fu" key={page}>{children}</div>
    </div>
  );
}
function Presentation({ act, accent, ink, campKey, onBack, onJump }) {
  const C = accent;
  const [page, setPage] = useState(0);
  const tTotal = act.buildMin * 60;
  const [tSec, setTSec] = useState(tTotal);
  const [tRun, setTRun] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const rootRef = useRef(null);

  // Focus the deck root when a station opens so slide keys work immediately,
  // without scrolling the page to it.
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, [act.code]);

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
      if (e.key === "Escape") onBack();
    };
    node.addEventListener("keydown", h);
    return () => node.removeEventListener("keydown", h);
  }, [total, onBack, navOpen]);

  const Demo = sl.type === "science" ? (sl.data.demo ? DEMOS[sl.data.demo] : EXTRAS[sl.data.t]) : null;
  const DIcon = sl.type === "science" ? (sl.data.demo ? DEMO_ICON[sl.data.demo] : Microscope) : null;
  const phaseLabel = {
    title: "brief", science: "concept",
    materials: "kit", steps: "build",
    timer: "timer", compete: "score",
    debrief: "defend",
  }[sl.type];

  return (
    <div ref={rootRef} tabIndex={-1} style={{ minHeight: 0, display: "flex", flexDirection: "column",
      background: T.paper, color: T.ink, position: "relative", outline: "none" }}>
      <Corners />
      {/* top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 30px", borderBottom: `1px solid ${T.rule12}`,
        position: "sticky", top: 0, background: T.paper, zIndex: 4,
      }}>
        <button onClick={onBack} className="focusable"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "none", background: "transparent", cursor: "pointer",
            padding: 0,
            ...f.sans(600, 11, { upper: true, tracking: 0.18 }),
            color: T.ink2,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C)}
          onMouseLeave={(e) => (e.currentTarget.style.color = T.ink2)}>
          <ArrowLeft size={13} strokeWidth={2.4} />
          {act.campName}  ·  index
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {(tRun || tSec < tTotal) && act.buildMin > 0 && (
            <button className="focusable"
              onClick={() => setPage(slides.findIndex((s) => s.type === "timer"))}
              style={{ display: "inline-flex", alignItems: "center", gap: 6,
                border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: tRun ? T.warn : "#b48b3e",
                animation: tRun ? "blink 1s infinite" : "none" }} />
              <span className="ticker" style={{ ...f.mono(600, 12), color: tRun ? T.warn : T.ink2 }}>{tFmt}</span>
            </button>
          )}
          <span className="ticker" style={{ ...f.mono(500, 11), color: T.mute }}>
            {String(page + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* progress hairline */}
      <div style={{ height: 2, background: T.rule12, position: "relative" }}>
        <div style={{ height: 2, background: C, width: `${((page + 1) / total) * 100}%`,
          transition: "width .45s cubic-bezier(.22,1,.36,1)" }} />
      </div>

      {/* content */}
      <main style={{ flex: 1, padding: "30px 0 24px" }}>
        <SlideFrame page={page} total={total} accent={C} phase={phaseLabel}
          code={act.code} title={act.t} campKey={campKey}>

          {sl.type === "title" && (
            <div>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
                {(() => {
                  const Ico = CAT_ICON[act.cat] || Sparkles;
                  return <IconChip icon={Ico} color={C} size={36} stroke={1.8} />;
                })()}
                <span className="smallcaps" style={{ ...f.mono(600, 11), color: C }}>{act.catLabel}</span>
                <span style={{ flex: 1, height: 1, background: T.rule12 }} />
              </div>
              <h2 style={{ ...f.display(500, 64, { italic: true, opsz: 144, lh: 1.0 }), color: T.ink, marginBottom: 12, maxWidth: 720 }}>
                {act.t}
              </h2>
              <p style={{ ...f.sans(400, 20, { lh: 1.45 }), color: T.ink2, maxWidth: 620, marginBottom: 28 }}>{act.sub}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, maxWidth: 720 }}>
                <div style={{ padding: "20px 22px 18px", border: `1px solid ${T.ink}`,
                  background: `${C}10`, position: "relative" }}>
                  <span style={{
                    position: "absolute", top: -9, left: 14, padding: "0 10px",
                    background: T.paper, ...f.sans(700, 10.5, { upper: true, tracking: 0.24 }), color: C,
                  }}>Mission</span>
                  <p style={{ ...f.sans(500, 17, { lh: 1.55 }), color: T.ink, marginTop: 4 }}>{act.mission}</p>
                </div>
                <div style={{ display: "flex", gap: 18, color: T.mute,
                  ...f.mono(500, 10.5, { upper: true, tracking: 0.18 }) }}>
                  <span>Build {act.buildMin} min</span>
                  <span>·</span>
                  <span>{act.science.length} concept{act.science.length === 1 ? "" : "s"}</span>
                  <span>·</span>
                  <span>{act.steps.length} build steps</span>
                </div>
              </div>
            </div>
          )}

          {sl.type === "science" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                {DIcon && <IconChip icon={DIcon} color={C} size={28} stroke={1.7} />}
                <span className="smallcaps" style={{ ...f.mono(500, 10), color: T.mute }}>
                  Concept {sl.idx + 1} / {act.science.length}
                </span>
              </div>
              <h2 style={{ ...f.display(500, 44, { italic: true, opsz: 72, lh: 1.06 }), color: T.ink, marginBottom: 14, maxWidth: 720 }}>
                {sl.data.t}
              </h2>
              <p style={{ ...f.sans(400, 17, { lh: 1.65 }), color: T.ink2, marginBottom: 22, maxWidth: 680 }}>{sl.data.b}</p>
              {Demo && <div style={{ marginTop: 6 }}><Demo /></div>}
            </div>
          )}

          {sl.type === "materials" && (
            <div>
              <h2 style={{ ...f.display(500, 42, { italic: true, opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 18 }}>Kit list</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {act.materials.map((m, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.rule12}` }}>
                      <td style={{ ...f.mono(500, 11), color: T.mute, padding: "10px 0", width: 38 }}>
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td style={{ ...f.sans(500, 16, { lh: 1.4 }), color: T.ink, padding: "10px 0" }}>{m.n}</td>
                      <td style={{ ...f.mono(500, 13), color: T.ink2, textAlign: "right", padding: "10px 0" }}>{m.q}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {sl.type === "steps" && (
            <div>
              <h2 style={{ ...f.display(500, 42, { italic: true, opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 22 }}>Build or solve it</h2>
              <ol style={{ display: "flex", flexDirection: "column", gap: 20, listStyle: "none" }}>
                {act.steps.map((st, i) => (
                  <li key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 16, alignItems: "flex-start" }}>
                    <div style={{
                      ...f.display(600, 28, { italic: true, opsz: 60 }),
                      color: C, lineHeight: 1, paddingTop: 2, textAlign: "right",
                      borderRight: `1px solid ${T.rule12}`, paddingRight: 8,
                    }}>{i + 1}</div>
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
              <h2 style={{ ...f.display(500, 42, { italic: true, opsz: 72, lh: 1.05 }), color: T.ink }}>Work block</h2>
              <p style={{ ...f.mono(600, 13, { upper: true, tracking: 0.2 }), color: T.mute, marginTop: 2 }}>
                {act.buildMin} minutes
              </p>
              <div style={{ position: "relative", width: 260, height: 260, marginTop: 10 }}>
                <svg width="260" height="260" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="130" cy="130" r="118" fill="none" stroke={T.rule12} strokeWidth="1.5" />
                  <circle cx="130" cy="130" r="118" fill="none"
                    stroke={tSec <= 60 && tSec > 0 && tTotal > 60 ? T.warn : C}
                    strokeWidth="3.5"
                    strokeDasharray={`${(tSec / tTotal) * 2 * Math.PI * 118} ${2 * Math.PI * 118}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray .4s" }} />
                </svg>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column", gap: 8,
                }}>
                  <span className="ticker" style={{
                    ...f.mono(500, 46),
                    color: tSec <= 60 && tSec > 0 && tTotal > 60 ? T.warn : T.ink,
                    lineHeight: 1,
                  }}>{tFmt}</span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "3px 10px",
                    borderRadius: 999,
                    border: `1px solid ${tRun ? T.warn : (tSec < tTotal ? "#b48b3e" : C)}`,
                    color: tRun ? T.warn : (tSec < tTotal ? "#b48b3e" : C),
                    ...f.mono(700, 10, { upper: true, tracking: 0.22 }),
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: 3,
                      background: tRun ? T.warn : (tSec < tTotal ? "#b48b3e" : C),
                      animation: tRun ? "blink 1s infinite" : "none",
                    }} />
                    {tRun ? "running" : tSec < tTotal ? "paused" : "ready"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Btn color={tRun ? T.warn : C} icon={tRun ? Pause : Play}
                  onClick={() => setTRun((r) => !r)}>
                  {tRun ? "pause" : tSec < tTotal ? "resume" : "start"}
                </Btn>
                <Btn icon={RotateCcw} onClick={() => { setTSec(tTotal); setTRun(false); }}>reset</Btn>
              </div>
            </div>
          )}

          {sl.type === "compete" && (
            <div>
              <h2 style={{ ...f.display(500, 42, { italic: true, opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 4 }}>Competition</h2>
              <p style={{ ...f.sans(400, 14, { lh: 1.5 }), color: T.mute, marginBottom: 18 }}>{act.scoring}</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {act.compete.map((r, i) => {
                    const [crit, pts] = splitPts(r);
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.rule12}` }}>
                        <td style={{ ...f.sans(500, 15.5, { lh: 1.4 }), color: T.ink, padding: "11px 0" }}>{crit}</td>
                        <td className="ticker" style={{ ...f.mono(600, 14), color: C, textAlign: "right", padding: "11px 0" }}>{pts}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td style={{ ...f.sans(700, 14, { upper: true, tracking: 0.16 }), color: C, padding: "14px 0 0 0" }}>Total</td>
                    <td className="ticker" style={{ ...f.mono(700, 16), color: C, textAlign: "right", padding: "14px 0 0 0" }}>100 pts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {sl.type === "debrief" && (
            <div>
              <h2 style={{ ...f.display(500, 42, { italic: true, opsz: 72, lh: 1.05 }), color: T.ink, marginBottom: 4 }}>Defend your design</h2>
              <p style={{ ...f.sans(400, 14, { lh: 1.5 }), color: T.mute, marginBottom: 20 }}>Answer with evidence, not opinion.</p>
              <ol style={{ display: "flex", flexDirection: "column", gap: 16, listStyle: "none" }}>
                {act.debrief.map((q, i) => (
                  <li key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ ...f.display(600, 22, { italic: true, opsz: 36 }), color: C,
                      textAlign: "right", paddingRight: 8, borderRight: `1px solid ${T.rule12}` }}>{i + 1}</div>
                    <span style={{ ...f.sans(500, 15.5, { lh: 1.55 }), color: T.ink }}>{q}</span>
                  </li>
                ))}
              </ol>
              <div style={{ marginTop: 28, paddingTop: 14, borderTop: `1px solid ${T.rule12}`,
                ...f.mono(500, 10.5, { upper: true, tracking: 0.18 }), color: T.mute }}>
                Source · {act.source}
              </div>
            </div>
          )}
        </SlideFrame>
      </main>

      {/* nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 30px", borderTop: `1px solid ${T.rule12}`,
        background: T.paper,
      }}>
        <button onClick={() => page > 0 && setPage((p) => p - 1)}
          disabled={page === 0} className="focusable"
          style={{ display: "inline-flex", alignItems: "center", gap: 7,
            border: "none", background: "transparent",
            cursor: page === 0 ? "default" : "pointer", padding: 0,
            ...f.sans(600, 11, { upper: true, tracking: 0.18 }),
            color: page === 0 ? T.rule12 : T.ink }}>
          <ArrowLeft size={13} strokeWidth={2.2} /> back
        </button>
        <div style={{ display: "flex", gap: 4 }}>
          {slides.map((_, i) => (
            // 24px-tall transparent hit target around the 4px visual bar, so the
            // dots clear the minimum touch-target size without changing the look.
            <button key={i} onClick={() => setPage(i)} className="focusable"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === page ? "true" : undefined}
              style={{
                height: 24, minWidth: 16,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                border: "none", padding: 0, background: "transparent",
                cursor: "pointer",
              }}>
              <span aria-hidden style={{
                display: "block",
                width: i === page ? 22 : 8, height: 4, borderRadius: 0,
                background: i === page ? C : T.rule12,
                transition: "width .3s, background .25s",
              }} />
            </button>
          ))}
        </div>
        <button onClick={() => page < total - 1 && setPage((p) => p + 1)}
          disabled={page === total - 1} className="focusable"
          style={{ display: "inline-flex", alignItems: "center", gap: 7,
            border: "none", background: "transparent",
            cursor: page === total - 1 ? "default" : "pointer", padding: 0,
            ...f.sans(600, 11, { upper: true, tracking: 0.18 }),
            color: page === total - 1 ? T.rule12 : T.ink }}>
          next <ArrowRight size={13} strokeWidth={2.2} />
        </button>
      </nav>

      {/* ===== index side tab: jump to any slide or station without going home ===== */}
      <button onClick={() => setNavOpen(true)} aria-label="Open index" className="focusable"
        style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 6,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          background: C, color: T.paper, border: "none", borderRadius: "0 8px 8px 0",
          padding: "16px 7px", cursor: "pointer", boxShadow: "1px 0 8px rgba(0,0,0,.18)" }}>
        <ListChecks size={15} strokeWidth={2.2} />
        <span style={{ ...f.mono(700, 9.5, { upper: true, tracking: 0.16 }), writingMode: "vertical-rl" }}>Index</span>
      </button>
      {navOpen && (
        <>
          <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(28,24,20,.34)", zIndex: 2200 }} />
          <aside role="dialog" aria-modal="true" aria-label="Deck index" style={{ position: "fixed", left: 0, top: 0, bottom: 0, height: "100dvh", width: "min(310px, calc(100vw - 28px))", background: T.paper, borderRight: `1px solid ${T.ink}`, zIndex: 2201, overflowY: "auto", padding: "20px 18px 28px", boxShadow: "3px 0 22px rgba(0,0,0,.16)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, borderBottom: `1px solid ${T.rule12}`, paddingBottom: 10 }}>
              <span style={{ ...f.mono(700, 11, { upper: true, tracking: 0.2 }), color: T.ink }}>Index</span>
              <button onClick={() => setNavOpen(false)} aria-label="Close index" className="focusable" style={{ border: "none", background: "transparent", cursor: "pointer", color: T.mute, display: "inline-flex", padding: 2 }}><X size={16} strokeWidth={2.2} /></button>
            </div>
            <div style={{ ...f.mono(600, 9, { upper: true, tracking: 0.16 }), color: T.mute, marginBottom: 8 }}>{act.code} {"\u00b7"} this station</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 20 }}>
              {slides.map((s, i) => (
                <button key={i} onClick={() => { setPage(i); setNavOpen(false); }} className="focusable"
                  style={{ display: "flex", gap: 8, alignItems: "baseline", textAlign: "left", border: "none", cursor: "pointer",
                    background: i === page ? `${C}14` : "transparent", borderLeft: `2px solid ${i === page ? C : "transparent"}`,
                    padding: "6px 8px", color: i === page ? C : T.ink, ...f.sans(i === page ? 600 : 400, 12.5, { lh: 1.3 }) }}>
                  <span style={{ ...f.mono(600, 9), color: T.mute, minWidth: 16 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{slideLabel(s)}</span>
                </button>
              ))}
            </div>
            {[["From Trees to Tech", TREES_DECK], ["PY-STEM", PY_DECK], ["Backups", [...TREESB_DECK, ...PYB_DECK]]].map(([label, list]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ ...f.mono(600, 9, { upper: true, tracking: 0.16 }), color: T.mute, marginBottom: 6 }}>{label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {list.map((a) => {
                    const cur = a.code === act.code;
                    const acc = (CAMP[a.camp] || CAMP.trees).acc;
                    return (
                      <button key={a.code} onClick={() => { setNavOpen(false); onJump(a); }} className="focusable"
                        style={{ display: "flex", gap: 8, alignItems: "baseline", textAlign: "left", border: "none", cursor: "pointer",
                          background: cur ? `${acc}1c` : "transparent", padding: "5px 8px", color: cur ? acc : T.ink,
                          ...f.sans(cur ? 600 : 400, 12, { lh: 1.25 }) }}>
                        <span style={{ ...f.mono(600, 8.5), color: acc, minWidth: 34 }}>{a.code}</span>
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
