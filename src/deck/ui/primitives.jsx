// Low-level UI primitives shared by every deck component (buttons, sliders, frames, readouts).
import { T, f } from "../theme.js";

function Btn({ children, onClick, color = T.ink, active, disabled, small, icon: Icon, style: sx, title, ...buttonProps }) {
  return (
    <button {...buttonProps} type="button" onClick={onClick} disabled={disabled} title={title} className="focusable"
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: small ? "6px 12px" : "9px 15px",
        borderRadius: 8,
        border: `1px solid ${active ? color : T.ink}`,
        background: active ? color : "transparent",
        color: active ? T.paper : color,
        ...f.mono(600, small ? 11 : 12, { tracking: 0.06, upper: true }),
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.32 : 1,
        transition: "background .18s, color .18s",
        whiteSpace: "nowrap",
        ...sx,
      }}>
      {Icon && <Icon size={small ? 12 : 14} strokeWidth={2.2} />}
      <span>{children}</span>
    </button>
  );
}
function Slider({ val, set, min, max, step = 1, color = T.ink, label, suffix }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 160 }}>
      <span style={{ ...f.sans(600, 10.5, { upper: true, tracking: 0.12 }), color: T.mute, display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        {suffix != null && <span className="ticker" style={{ color }}>{suffix}</span>}
      </span>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={(e) => set(+e.target.value)}
        style={{ accentColor: color, minHeight: 24, cursor: "pointer" }} />
    </label>
  );
}
function Tag({ children, color = T.ink, style: sx }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 9px",
      borderRadius: 999,
      border: `1px solid ${color}`,
      background: T.paper,
      color,
      ...f.mono(600, 10.5, { tracking: 0.06, upper: true }),
      ...sx,
    }}>
      {children}
    </span>
  );
}
function Corners() {
  return (
    <>
      <span className="corner tl" /><span className="corner tr" />
      <span className="corner bl" /><span className="corner br" />
    </>
  );
}
function Field({ children, height, padded = true }) {
  return (
    <div style={{ position: "relative", padding: padded ? "18px 14px 14px" : 0, marginBottom: 8 }}>
      <Corners />
      <div className="stage" style={{ height, padding: padded ? "12px" : 0 }}>
        {children}
      </div>
    </div>
  );
}
function Readout({ items, color = T.ink }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "10px 22px", alignItems: "baseline",
      paddingTop: 10, borderTop: `1px solid ${T.rule12}`,
    }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ ...f.sans(600, 9.5, { upper: true, tracking: 0.16 }), color: T.mute }}>{it.l}</span>
          <span className="ticker" style={{ ...f.mono(600, 16), color: it.color || color }}>{it.v}</span>
        </div>
      ))}
    </div>
  );
}
function Caption({ children, color = T.ink }) {
  return (
    <p style={{ ...f.sans(400, 13, { lh: 1.6 }), color: T.mute, paddingTop: 12 }}>
      <span style={{ color, ...f.sans(600, 13) }}>›</span>{" "}{children}
    </p>
  );
}

export { Btn, Slider, Tag, Corners, Field, Readout, Caption };
