// The field-notebook home screen: camp toggle, station grid, and home motifs.
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { CATMAP, PYB_DECK, PY_DECK, TREESB_DECK, TREES_DECK } from "./data/decks.js";
import { CAT_ICON, IconChip } from "./icons.jsx";
import { CAMP, T, f } from "./theme.js";
import { Btn, Corners, Tag } from "./ui/primitives.jsx";

function HomeMotif({ campKey, color, accent }) {
  if (campKey === "trees") {
    return (
      <svg viewBox="0 0 220 220" width="220" height="220" aria-hidden style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="tmVig" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.10" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="tmCan" cx="38%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="44%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </radialGradient>
          <linearGradient id="tmTrunk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="55%" stopColor={color} stopOpacity="0.92" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <circle cx="108" cy="96" r="94" fill="url(#tmVig)" />
        <ellipse cx="108" cy="196" rx="60" ry="7" fill={color} opacity="0.15" />
        <line x1="36" y1="196" x2="182" y2="196" stroke={color} strokeWidth="1.4" opacity="0.5" />
        <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5">
          <path d="M104 196 C 96 201 86 203 74 205" />
          <path d="M113 196 C 121 201 132 203 145 204" />
        </g>
        <path d="M103 196 C 104 170 104 150 106 134 L 112 134 C 114 152 114 174 115 196 Z"
          fill="url(#tmTrunk)" stroke={color} strokeWidth="0.8" />
        <path d="M108 192 C 107 172 107 152 109 136" fill="none" stroke={color} strokeWidth="0.7" opacity="0.4" />
        <g>
          <ellipse cx="86" cy="98" rx="34" ry="29" fill="url(#tmCan)" opacity="0.9" />
          <ellipse cx="130" cy="94" rx="35" ry="31" fill="url(#tmCan)" opacity="0.92" />
          <ellipse cx="108" cy="74" rx="36" ry="31" fill="url(#tmCan)" opacity="0.96" />
          <ellipse cx="106" cy="108" rx="42" ry="28" fill="url(#tmCan)" opacity="0.86" />
        </g>
        <g fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.22" strokeLinecap="round">
          <path d="M94 92 q11 -6 22 -2" />
          <path d="M102 106 q12 -4 24 0" />
        </g>
        <g fill="none" stroke={accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M150 80 H174 V58" />
          <path d="M156 100 H184 V118" />
          <path d="M146 66 H166 V48" />
        </g>
        <g>
          <rect x="159" y="40" width="14" height="9" rx="1.5" fill={accent} stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="174" cy="56" r="4" fill={accent} stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="184" cy="120" r="4" fill={accent} stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="150" cy="80" r="2.4" fill={accent} />
          <circle cx="156" cy="100" r="2.4" fill={accent} />
          <circle cx="146" cy="66" r="2.4" fill={accent} />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 220 220" width="220" height="220" aria-hidden style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="pmVig" cx="50%" cy="44%" r="62%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.10" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pmScr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.96" />
          <stop offset="100%" stopColor={color} stopOpacity="0.72" />
        </linearGradient>
        <radialGradient id="pmGear" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="48%" stopColor={color} stopOpacity="0.92" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="104" r="94" fill="url(#pmVig)" />
      <rect x="40" y="56" width="140" height="92" rx="11" fill="url(#pmScr)" stroke={color} strokeWidth="1.6" />
      <rect x="44" y="60" width="132" height="84" rx="8" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.16" />
      <g stroke="#ffffff" strokeWidth="0.5" opacity="0.15">
        <line x1="75" y1="60" x2="75" y2="144" />
        <line x1="110" y1="60" x2="110" y2="144" />
        <line x1="145" y1="60" x2="145" y2="144" />
        <line x1="44" y1="82" x2="176" y2="82" />
        <line x1="44" y1="102" x2="176" y2="102" />
        <line x1="44" y1="122" x2="176" y2="122" />
      </g>
      <path d="M46 102 C 64 64 78 64 95 102 S 128 140 146 102 S 172 70 176 94"
        fill="none" stroke={accent} strokeWidth="5.5" opacity="0.22" strokeLinecap="round" />
      <path d="M46 102 C 64 64 78 64 95 102 S 128 140 146 102 S 172 70 176 94"
        fill="none" stroke={accent} strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="95" cy="102" r="3" fill="#ffffff" />
      <circle cx="146" cy="102" r="3" fill="#ffffff" />
      <g transform="translate(50 150)">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <rect key={i} x="-3" y="-21" width="6" height="9" rx="1.4" fill={color}
            transform={`rotate(${i * 40})`} />
        ))}
        <circle r="15" fill="url(#pmGear)" stroke={color} strokeWidth="1" />
        <circle r="5.5" fill={T.paper} stroke={color} strokeWidth="1.3" />
      </g>
      <g>
        <circle cx="180" cy="54" r="15" fill={color} stroke="#ffffff" strokeWidth="0.7" />
        <circle cx="180" cy="54" r="15" fill="none" stroke={accent} strokeWidth="1.5" />
        <circle cx="180" cy="54" r="9.5" fill="none" stroke={accent} strokeWidth="1.1" opacity="0.85" />
        <circle cx="180" cy="54" r="4" fill={accent} />
        <circle cx="175" cy="49" r="2" fill="#ffffff" opacity="0.75" />
      </g>
    </svg>
  );
}
function StationCard({ a, campKey, accent, onSelect }) {
  const CatIco = CAT_ICON[a.cat] || Sparkles;
  const catColor = (CATMAP[a.cat] && CATMAP[a.cat].l) ? accent : T.ink;
  const num = a.code.split("-")[1];
  return (
    <button onClick={() => onSelect(a)} className="focusable"
      style={{
        position: "relative",
        textAlign: "left",
        padding: "18px 18px 16px",
        border: `1px solid ${T.ink}`,
        background: T.paper,
        cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 10,
        minHeight: 168,
        transition: "transform .18s ease, background .18s, border-color .18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = T.paper2;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = T.paper;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = T.ink;
      }}>
      {/* folded corner */}
      <span aria-hidden style={{
        position: "absolute", top: 0, right: 0, width: 14, height: 14,
        background: `linear-gradient(225deg, ${T.paper3} 0 50%, ${T.ink} 50% 53%, transparent 53%)`,
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="ticker" style={{ ...f.mono(600, 11), color: accent, letterSpacing: 0.06 }}>{a.code}</span>
        <IconChip icon={CatIco} color={accent} size={24} stroke={1.8} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ ...f.display(500, 22, { italic: true, opsz: 36, lh: 1.12 }), color: T.ink }}>
          {a.t}
        </h3>
      </div>
      <div className="accentRule" style={{ color: accent, height: 1, background: accent, opacity: 0.7, width: 36 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="smallcaps" style={{ ...f.mono(500, 10), color: T.mute }}>
          {(CATMAP[a.cat] && CATMAP[a.cat].l) || a.cat}
        </span>
        <span className="ticker" style={{ ...f.mono(500, 10), color: T.mute }}>№ {num}</span>
      </div>
    </button>
  );
}
function BackupCard({ a, campKey, accent, onSelect }) {
  const num = a.code.split("-")[1];
  return (
    <button onClick={() => onSelect(a)} className="focusable"
      style={{
        textAlign: "left",
        padding: "12px 14px",
        border: `1px dashed ${T.rule22}`,
        background: "transparent",
        cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 6,
        transition: "background .15s, border-color .15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.paper2; e.currentTarget.style.borderColor = accent; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.rule22; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="ticker" style={{ ...f.mono(500, 10.5), color: accent }}>{a.code}</span>
        <span className="ticker" style={{ ...f.mono(400, 9.5), color: T.mute }}>backup {num}</span>
      </div>
      <div style={{ ...f.display(500, 17, { italic: true, opsz: 28, lh: 1.18 }), color: T.ink2 }}>{a.t}</div>
    </button>
  );
}
function Home({ onSelect, camp, setCamp }) {
  const [filter, setFilter] = useState("all");
  const list = camp === "trees" ? TREES_DECK : PY_DECK;
  const backups = camp === "trees" ? TREESB_DECK : PYB_DECK;
  const theme = CAMP[camp];
  const cats = ["all", ...[...new Set(list.map((a) => a.cat))]];
  const shown = filter === "all" ? list : list.filter((a) => a.cat === filter);

  // small "year" stamp in the masthead
  const year = 2026;

  return (
    <div style={{ background: T.paper, color: T.ink, position: "relative" }}>
      <Corners />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 32px 70px",
        borderLeft: `1px solid ${T.rule12}`, borderRight: `1px solid ${T.rule12}`, position: "relative" }}>

        {/* masthead */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 28,
          borderBottom: `1px solid ${T.ink}`, paddingBottom: 18,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="smallcaps" style={{ ...f.mono(600, 11), color: T.mute }}>
              Middle School STEM · Edition {year}
            </span>
            <h2 style={{ ...f.display(500, 64, { italic: true, opsz: 144, lh: 0.92, tracking: -0.02 }), color: T.ink }}>
              Field Notebook
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <Tag color={T.ink}>vol I · {list.length + backups.length} stations</Tag>
            <span className="ticker" style={{ ...f.mono(500, 10), color: T.mute }}>
              ← → space  ·  esc to index
            </span>
          </div>
        </div>

        {/* camp switcher: two pages of a notebook */}
        <div role="tablist" aria-label="Choose camp"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginBottom: 36, border: `1px solid ${T.ink}` }}>
          {(["trees", "pystem"]).map((k) => {
            const active = camp === k;
            const t = CAMP[k];
            return (
              <button key={k} role="tab" aria-selected={active} className="focusable nofocus"
                onClick={() => { setCamp(k); setFilter("all"); }}
                style={{
                  border: "none",
                  padding: "20px 22px",
                  background: active ? t.ink : "transparent",
                  color: active ? T.paper : T.ink,
                  textAlign: "left", cursor: "pointer",
                  borderRight: k === "trees" ? `1px solid ${T.ink}` : "none",
                  transition: "background .2s, color .2s",
                }}>
                <div style={{ ...f.mono(600, 10.5, { upper: true, tracking: 0.18 }),
                  color: active ? t.acc : T.mute, marginBottom: 4 }}>
                  {k === "trees" ? "Camp I" : "Camp II"}
                </div>
                <div style={{ ...f.display(500, 30, { italic: true, opsz: 60, lh: 1 }) }}>{t.label}</div>
                <div style={{ ...f.sans(400, 13.5, { lh: 1.5 }), color: active ? T.paper3 : T.mute, marginTop: 6, maxWidth: 360 }}>
                  {t.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* hero strip: small camp marker + motif on the right (no duplicate title) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 28, alignItems: "center", marginBottom: 28, paddingTop: 4 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="smallcaps" style={{ ...f.mono(600, 11), color: theme.acc }}>
              {camp === "trees" ? "Section A: Field, Forest, Future" : "Section B: Signal, System, Science"}
            </span>
            <span style={{ ...f.sans(400, 13.5, { lh: 1.5 }), color: T.mute, maxWidth: 580 }}>
              {list.length} core stations · {backups.length} reserves
            </span>
          </div>
          <div style={{ transform: "scale(.78)", transformOrigin: "right center" }}>
            <HomeMotif campKey={camp} color={theme.ink} accent={theme.acc} />
          </div>
        </div>

        {/* category filter */}
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22, alignItems: "center",
          padding: "10px 14px", border: `1px solid ${T.rule12}`, background: T.paper2,
        }}>
          <span className="smallcaps" style={{ ...f.mono(700, 11, { tracking: 0.18 }), color: T.ink2, marginRight: 4 }}>filter</span>
          {cats.map((k) => {
            const lbl = k === "all" ? "All" : (CATMAP[k] ? CATMAP[k].l : k);
            return (
              <Btn key={k} small color={k === "all" ? theme.ink : (CATMAP[k] ? theme.ink : T.ink)}
                active={filter === k} onClick={() => setFilter(k)}>
                {lbl}
              </Btn>
            );
          })}
        </div>

        {/* grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
          {shown.map((a, i) => (
            <div key={a.code} className="fu" style={{ animationDelay: `${i * 24}ms` }}>
              <StationCard a={a} campKey={camp} accent={theme.acc} onSelect={onSelect} />
            </div>
          ))}
        </div>

        {/* backups */}
        <div style={{ marginTop: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <span className="smallcaps" style={{ ...f.mono(600, 11), color: T.mute }}>
              Reserve stations · backups
            </span>
            <span style={{ flex: 1, height: 1, background: T.rule12 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
            {backups.map((a) => (
              <BackupCard key={a.code} a={a} campKey={camp} accent={theme.acc} onSelect={onSelect} />
            ))}
          </div>
        </div>

        {/* footer rule */}
        <div style={{
          marginTop: 56, paddingTop: 18, borderTop: `1px solid ${T.rule12}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span className="smallcaps" style={{ ...f.mono(500, 10), color: T.mute }}>
            Tap a station to open · arrow keys move slides · esc returns
          </span>
          <span className="ticker" style={{ ...f.mono(500, 10), color: T.mute }}>
            {camp === "trees" ? "TTT · TTB" : "PYS · PYB"}
          </span>
        </div>
      </div>
    </div>
  );
}

export { HomeMotif, StationCard, BackupCard, Home };
