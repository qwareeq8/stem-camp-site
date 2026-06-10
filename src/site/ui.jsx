// Shared UI primitives for the field-notebook site. These wrap the CSS classes
// in styles.css so every page composes from the same vocabulary.
import { Link } from "react-router-dom";

export function Page({ eyebrow, title, sub, actions, children }) {
  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <div className="row">
            <div style={{ flex: 1 }}>
              {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
              <h1 className="page-title">{title}</h1>
              {sub && <p className="page-sub">{sub}</p>}
            </div>
            {actions && <div className="row">{actions}</div>}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function SectionTitle({ children, as: Tag = "h2" }) {
  return <Tag className="section-title">{children}</Tag>;
}

export function Card({ children, className = "", to, href, ticks, padLg, ...rest }) {
  const cls = `card${padLg ? " pad-lg" : ""}${ticks ? " ticks" : ""}${(to || href) ? " card-link" : ""} ${className}`.trim();
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return <div className={cls} {...rest}>{children}</div>;
}

export function Stat({ num, label }) {
  return (
    <div className="stat">
      <span className="num">{num}</span>
      <span className="lab">{label}</span>
    </div>
  );
}

export function Badge({ children, tone }) {
  return <span className={`badge${tone ? " " + tone : ""}`}>{children}</span>;
}

export function Btn({ children, to, href, variant, type = "button", disabled, className = "", ...rest }) {
  const cls = `btn${variant ? " " + variant : ""}${className ? " " + className : ""}`;
  if (to && !disabled) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href && !disabled) return <a href={href} className={cls} {...rest}>{children}</a>;
  return <button type={type} className={cls} disabled={disabled} {...rest}>{children}</button>;
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

export function Progress({ value, max }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return <div className="progress" aria-hidden="true"><span style={{ width: pct + "%" }} /></div>;
}

export function CampBadge({ camp }) {
  if (camp === "trees") return <Badge tone="trees">Trees</Badge>;
  if (camp === "pystem") return <Badge tone="py">PY-STEM</Badge>;
  return <Badge>{camp}</Badge>;
}

// Download an in-memory object as a JSON file (used by the static admin "save").
export function downloadJson(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
