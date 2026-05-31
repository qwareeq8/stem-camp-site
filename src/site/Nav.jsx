// Top navigation: field-notebook brand mark plus section links. The admin link
// shows a small dot when an admin session is active.
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useConfig } from "./lib/store.js";
import { useAuth } from "./lib/auth.js";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/deck", label: "Deck" },
  { to: "/schedule", label: "Schedule" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/teams", label: "Teams" },
  { to: "/store", label: "Store" },
  { to: "/achievements", label: "Achievements" },
  { to: "/files", label: "Files" },
];

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21V11" stroke="#9D2235" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 13c-3.2 0-5-1.9-5-5 3.2 0 5 1.9 5 5Z" fill="#9D2235" opacity="0.85" />
      <path d="M12 11c0-3 1.8-5 5-5 0 3-1.8 5-5 5Z" fill="#7A1A29" opacity="0.85" />
      <circle cx="12" cy="21" r="1.5" fill="#9D2235" />
      <path d="M12 17h4.5M16.5 17v-3" stroke="#BCA685" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="16.5" cy="14" r="1.2" fill="#BCA685" />
    </svg>
  );
}

export default function Nav() {
  const cfg = useConfig();
  const { authed } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <Mark />
          <span>{cfg.siteTitle.replace(" Field Notebook", "")}</span>
          <small>Field Notebook</small>
        </NavLink>
        <button className="nav-toggle mono" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="site-nav-menu" aria-label="Toggle menu">
          MENU
        </button>
        <div id="site-nav-menu" className={`nav-links${open ? " open" : ""}`}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/admin" onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? "active" : "")}>
            Admin{authed && <span className="nav-admin-dot" aria-label="signed in" />}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
