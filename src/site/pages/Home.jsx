// Landing page: hero, camp overview, quick stats, leaderboard snapshot, and
// up-next schedule, all driven by the data layer. It intentionally hand-rolls
// the hero rather than using the shared <Page> header used by the other pages.
import { Link } from "react-router-dom";
import { useConfig, useCollection } from "../lib/store.js";
import { teamTotals } from "../lib/scoring.js";
import { Card, Stat, Badge, Btn, SectionTitle, CampBadge } from "../ui.jsx";
import { TREES_DECK, PY_DECK, TREESB_DECK, PYB_DECK } from "../../deck/data/decks.js";

const PRIMARY = TREES_DECK.length + PY_DECK.length;
const BACKUPS = TREESB_DECK.length + PYB_DECK.length;
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const EASTERN = "America/New_York";
const EASTERN_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: EASTERN,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function campusLabel(campus) {
  if (!campus) return "";
  if (/ambler/i.test(campus)) return "Ambler Campus";
  if (/main campus/i.test(campus)) return "Main Campus";
  return campus;
}

function hostedByLabel(value) {
  const fallback = "Hosted by Temple University";
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (!clean || /yusuf qwareeq/i.test(clean)) return fallback;
  if (/^hosted by\b/i.test(clean)) return clean;
  return `Hosted by ${clean}`;
}

function minutesOfDay(value) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value || "");
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

function easternNow(now = new Date()) {
  const parts = Object.fromEntries(EASTERN_PARTS.formatToParts(now).map((p) => [p.type, p.value]));
  return {
    key: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function dateFromLabel(label, year) {
  const m = /\b([A-Z][a-z]{2})\s+(\d{1,2})\b/.exec(label || "");
  if (!m || MONTHS[m[1]] === undefined) return null;
  const y = Number(year) || 2026;
  const month = String(MONTHS[m[1]] + 1).padStart(2, "0");
  const day = String(Number(m[2])).padStart(2, "0");
  return `${y}-${month}-${day}`;
}

function upcomingSchedule(schedule, year, now = new Date()) {
  const current = easternNow(now);
  const days = (schedule || [])
    .map((day) => ({ ...day, dateKey: day.date || dateFromLabel(day.day, year) }))
    .filter((day) => day.dateKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  if (!days.length) return null;

  const idx = days.findIndex((day) => day.dateKey >= current.key);
  const upcoming = idx === -1 ? days[days.length - 1] : days[idx];
  const isToday = upcoming.dateKey === current.key;
  if (!isToday) return upcoming;

  // Today: show only the blocks still to come. Once the whole day has wrapped,
  // advance to the next camp day; the final day keeps its full plan as a recap.
  const blocks = (upcoming.blocks || []).filter((b) => minutesOfDay(b.end) >= current.minutes);
  if (blocks.length) return { ...upcoming, blocks };
  return idx + 1 < days.length ? days[idx + 1] : upcoming;
}

export default function Home() {
  const cfg = useConfig();
  const camps = cfg.camps || [];
  const teams = useCollection("teams");
  const members = useCollection("members");
  const scores = useCollection("scores");
  const schedule = useCollection("schedule");
  const rows = teamTotals(teams, scores);
  const top = rows.slice(0, 3);
  const day0 = upcomingSchedule(schedule, cfg.year);
  const hostedBy = hostedByLabel(cfg.location);

  return (
    <div className="page">
      <div className="container">
        {/* hero */}
        <Card ticks padLg style={{ marginBottom: 22, background: "var(--paper2)" }}>
          <div className="hero-grid">
            <div>
              <div className="page-eyebrow">
                {cfg.dates}
                {cfg.dates && hostedBy ? " · " : ""}
                {hostedBy}
              </div>
              <h1 style={{ fontSize: "clamp(34px, 6vw, 60px)", maxWidth: "16ch", marginTop: 6 }}>{cfg.siteTitle}</h1>
              <p className="page-sub" style={{ fontSize: 17 }}>{cfg.tagline}</p>
              <div className="row" style={{ marginTop: 18 }}>
                <Btn to="/deck" variant="accent">Open the interactive deck</Btn>
                <Btn to="/schedule" variant="ghost">View schedule</Btn>
                <Btn to="/leaderboard" variant="ghost">Leaderboard</Btn>
              </div>
            </div>
            {camps.length > 0 && (
              <div className="hero-aside">
                <div className="hero-aside-label">Two sessions</div>
                {camps.map((c) => (
                  <div key={c.id} className="hero-session">
                    <CampBadge camp={c.id} />
                    <div className="hero-session-name" style={{ color: c.accent }}>{c.name}</div>
                    <div className="mono muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {c.dates}
                      {c.dates && campusLabel(c.campus) ? " · " : ""}
                      {campusLabel(c.campus)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* quick stats */}
        <div className="grid cols-4" style={{ marginBottom: 8 }}>
          <Card><Stat num={PRIMARY} label="Stations" /></Card>
          <Card><Stat num={teams.length} label="Teams" /></Card>
          <Card><Stat num={members.length} label="Campers and staff" /></Card>
          <Card><Stat num={BACKUPS} label="Backup stations" /></Card>
        </div>

        {/* camps */}
        <SectionTitle>The two camps</SectionTitle>
        <div className="grid cols-2">
          {camps.map((c) => {
            const n = c.id === "trees" ? TREES_DECK.length : PY_DECK.length;
            const campus = campusLabel(c.campus);
            return (
              <Card key={c.id} to="/deck" padLg className="card-link">
                <div className="row">
                  <CampBadge camp={c.id} />
                  <span className="spacer" />
                  <span className="meta">{n} stations</span>
                </div>
                <h3 style={{ marginTop: 12, fontSize: 26, color: c.accent }}>{c.name}</h3>
                <div className="mono muted" style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>{c.sub}</div>
                <p style={{ marginTop: 10, marginBottom: 0 }}>{c.tagline}</p>
                {(c.dates || campus) && (
                  <div className="mono muted" style={{ fontSize: 12, marginTop: 12 }}>
                    {c.dates}
                    {c.dates && campus ? " · " : ""}
                    {campus}
                  </div>
                )}
                <div className="mono" style={{ marginTop: 14, color: "var(--primary)", fontSize: 11.5, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Open the deck &rarr;
                </div>
              </Card>
            );
          })}
        </div>

        {/* two-column: leaderboard + up next */}
        <div className="grid cols-2" style={{ marginTop: 22, alignItems: "start" }}>
          <div>
            <SectionTitle>Top of the leaderboard</SectionTitle>
            <Card>
              {top.length === 0 ? (
                <div className="muted" style={{ fontSize: 14 }}>No standings yet. Scores appear once stations are judged.</div>
              ) : (
                top.map((t, i) => (
                  <div key={t.id} className="row" style={{ padding: "9px 0", borderBottom: i < top.length - 1 ? "1px solid var(--rule12)" : "none" }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 22, width: 26 }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <CampBadge camp={t.camp} />
                    </div>
                    <span className="mono" style={{ fontSize: 18 }}>{t.total}</span>
                  </div>
                ))
              )}
              <Link to="/leaderboard" className="mono see-more" style={{ fontSize: 11, display: "inline-block", marginTop: 10 }}>Full standings &rarr;</Link>
            </Card>
          </div>
          <div>
            <SectionTitle>{day0 ? `Up next: ${day0.day}` : "Schedule"}</SectionTitle>
            <Card>
              {day0 ? (
                <>
                  <div className="meta" style={{ marginBottom: 10 }}>{day0.theme}</div>
                  {(day0.blocks || []).slice(0, 4).map((b, i, arr) => (
                    <div key={(b.code || b.start || "") + "-" + i} className="row up-next-row" style={{ padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--rule12)" : "none" }}>
                      <span className="mono muted up-next-time" style={{ fontSize: 12 }}>{b.start}-{b.end}</span>
                      <span className="up-next-title" style={{ flex: 1 }}>{b.title}</span>
                      {b.code && <Badge tone={(b.camp || day0.camp) === "trees" ? "trees" : "py"}>{b.code}</Badge>}
                    </div>
                  ))}
                  <Link to="/schedule" className="mono see-more" style={{ fontSize: 11, display: "inline-block", marginTop: 10 }}>Full schedule &rarr;</Link>
                </>
              ) : <div className="muted">No schedule yet.</div>}
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
