// DemoBookbot component for the STEM Camp interactive deck.
import { useEffect, useRef, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF, useTimeouts } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Tag } from "../../ui/primitives.jsx";

function DemoBookbot() {
  // PYS-11 "Automated storage and retrieval" (concept 1). The sibling ExtraSearch
  // is the top-down ROUTING optimizer (naive vs nearest-neighbor across many
  // fetches). This demo isolates ADDRESSING: books live in any bin regardless of
  // subject, and the crane fetches one by its address using a two-axis lookup
  // (slide to the column, drop to the row, grab the bin), exactly how a database
  // index finds a record. Click bins (or request a random one) to queue fetches.
  const cols = ["1", "2", "3", "4", "5"];
  const rows = ["A", "B", "C", "D"];
  const colX = (c) => 70 + c * 58;
  const rowY = (r) => 86 + r * 38;
  const railY = 46, homeY = 58;
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const SPINE = ["#a8472f", "#355a7a", "#b58a32", "#5f7a3a", "#7d5577", "#c77a2b"];
  const binColor = (bin) => { let h = 0; for (let i = 0; i < bin.length; i++) h = (h * 31 + bin.charCodeAt(i)) >>> 0; return SPINE[h % SPINE.length]; };

  const [queue, setQueue] = useState(["B3", "D1", "A4"]);
  const [active, setActive] = useState(null);   // { c, r, bin }
  const [phase, setPhase] = useState("idle");    // idle | toCol | toRow | grab | toHome
  const [cur, setCur] = useState({ x: colX(0), y: homeY });
  const [served, setServed] = useState(0);
  const targetRef = useRef(null);
  const to = useTimeouts();
  const running = phase !== "idle";

  const startBin = (bin) => {
    const c = cols.indexOf(bin[1]), r = rows.indexOf(bin[0]);
    if (c < 0 || r < 0) return;
    targetRef.current = { x: colX(c), y: rowY(r), c, r, bin };
    setActive({ c, r, bin });
    setPhase("toCol");
  };

  useRAF(running, (dt) => {
    setCur((p) => {
      const tg = targetRef.current; if (!tg) return p;
      const step = (a, b) => a + (b - a) * Math.min(1, dt / 200);
      if (phase === "toCol") { const nx = step(p.x, tg.x); if (Math.abs(nx - tg.x) < 0.6) setPhase("toRow"); return { x: nx, y: homeY }; }
      if (phase === "toRow") { const ny = step(p.y, tg.y); if (Math.abs(ny - tg.y) < 0.6) { setPhase("grab"); to(() => setPhase("toHome"), 420); } return { x: tg.x, y: ny }; }
      if (phase === "grab") return p;
      if (phase === "toHome") {
        const ny = step(p.y, homeY);
        if (Math.abs(ny - homeY) < 0.6) {
          setServed((s) => s + 1); setQueue((q) => q.slice(1)); setActive(null); targetRef.current = null;
          to(() => setPhase("idle"), 200);
          return { x: tg.x, y: homeY };
        }
        return { x: tg.x, y: ny };
      }
      return p;
    });
  });

  useEffect(() => { if (phase === "idle" && queue.length > 0) startBin(queue[0]); }, [phase, queue]);

  const enqueue = (bin) => setQueue((q) => (q.includes(bin) ? q : [...q, bin]));
  const randomReq = () => enqueue(rows[Math.floor(Math.random() * rows.length)] + cols[Math.floor(Math.random() * cols.length)]);
  const carrying = active && (phase === "grab" || phase === "toHome");

  return (
    <div>
      <Field height={264}>
        <svg viewBox="0 0 460 264" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="16" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>BookBot: store by address</text>
          <text x="20" y="28" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.06 })}>any book in any bin {"·"} the crane fetches by address, not by subject</text>

          {/* two-axis lookup highlight: column while seeking, column + row once found */}
          {active && <rect x={colX(active.c) - 27} y={railY} width="54" height={rowY(rows.length - 1) + 15 - railY} fill={A} opacity="0.09" rx="3" />}
          {active && (phase === "toRow" || phase === "grab" || phase === "toHome") && <rect x="44" y={rowY(active.r) - 16} width={colX(cols.length - 1) + 25 - 44} height="32" fill={A} opacity="0.10" rx="3" />}

          {/* rail */}
          <line x1="40" y1={railY} x2="356" y2={railY} stroke={T.ink} strokeWidth="2.4" />

          {/* bins, each holding a book (subject color is unrelated to address) */}
          {rows.map((rl, r) => cols.map((cl, c) => {
            const bin = rl + cl, isActive = active && active.bin === bin, inQ = queue.includes(bin);
            const x = colX(c), y = rowY(r);
            return (
              <g key={bin} style={{ cursor: "pointer" }} onClick={() => enqueue(bin)}>
                <rect x={x - 25} y={y - 15} width="50" height="30" rx="2" fill={T.paper} stroke={isActive ? A : T.ink} strokeWidth={isActive ? 1.8 : 0.8} />
                <rect x={x - 21} y={y - 11} width="8" height="22" rx="1" fill={binColor(bin)} opacity={isActive ? 1 : 0.82} />
                <text x={x + 5} y={y + 4} textAnchor="middle" fill={inQ ? A : T.ink} style={f.mono(700, 11, { tracking: 0.04 })}>{bin}</text>
              </g>
            );
          }))}

          {/* crane: carriage on the rail, lift column, gripper (carries the book home) */}
          <rect x={cur.x - 15} y={railY - 9} width="30" height="15" rx="2" fill={C} />
          <line x1={cur.x} y1={railY + 6} x2={cur.x} y2={cur.y + 6} stroke={C} strokeWidth="2" />
          <rect x={cur.x - 9} y={cur.y - 2} width="18" height="14" rx="1.5" fill={phase === "grab" ? A : C} stroke={T.ink} strokeWidth="0.6" />
          {carrying && <rect x={cur.x - 4} y={cur.y + 1} width="8" height="10" rx="1" fill={binColor(active.bin)} />}

          {/* request + delivered panel */}
          <rect x="370" y="44" width="82" height="184" rx="4" fill={T.paper2} stroke={C} strokeWidth="1" />
          <text x="411" y="60" textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>request</text>
          <text x="411" y="88" textAnchor="middle" fill={active ? A : T.mute} style={f.mono(700, 22)}>{active ? active.bin : "-"}</text>
          <text x="411" y="108" textAnchor="middle" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.06 })}>{active ? "col " + active.bin[1] : "idle"}</text>
          <text x="411" y="121" textAnchor="middle" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.06 })}>{active ? "row " + active.bin[0] : ""}</text>
          <line x1="380" y1="136" x2="442" y2="136" stroke={T.rule22} strokeWidth="1" />
          <text x="411" y="154" textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>delivered</text>
          <text x="411" y="182" textAnchor="middle" fill={C} style={f.mono(700, 20)}>{served}</text>
          {Array.from({ length: Math.min(served, 8) }, (_, i) => (<rect key={"d" + i} x={382 + i * 8} y="196" width="6" height="14" rx="1" fill={SPINE[i % SPINE.length]} />))}

          <text x="20" y="252" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.12 })}>click a bin to queue {"·"} crane fetches in order</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ ...f.sans(600, 10.5, { upper: true, tracking: 0.12 }), color: T.mute }}>queue</span>
          <div style={{ display: "flex", gap: 6 }}>
            {queue.length === 0
              ? <span className="ticker" style={{ color: T.mute, ...f.mono(500, 12) }}>empty</span>
              : queue.map((b, i) => <Tag key={b + i} color={i === 0 ? A : T.ink}>{b}</Tag>)}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <Btn small icon={Plus} color={A} onClick={randomReq}>request</Btn>
        <Btn small icon={RotateCcw} onClick={() => { setQueue([]); setActive(null); setPhase("idle"); }}>clear</Btn>
      </div>

      <Readout items={[
        { l: "Address", v: active ? active.bin : "idle", color: active ? A : C },
        { l: "Crane", v: phase, color: phase === "grab" ? A : C },
        { l: "Delivered", v: served },
        { l: "Lookup", v: "column, then row" },
      ]} />

      <Caption color={C}>
        An automated storage cell stores by address, not by subject: a book can live in any free
        bin as long as the system records where. To retrieve one, the crane resolves its address in
        two axes: it slides along the rail to the column, drops the lift to the row, and grabs the bin, the
        same two-step lookup a database index uses to find a record fast. Storing by address packs
        shelves densely and makes retrieval a quick, predictable trip.
      </Caption>
    </div>
  );
}

export { DemoBookbot };
