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
  // Tree-and-circuit emblem served from public/logo.svg (BASE_URL keeps the path
  // correct under the GitHub Pages project subpath).
  return <img className="mark" src={`${import.meta.env.BASE_URL}logo.svg`} alt="" aria-hidden="true" width="22" height="22" />;
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
