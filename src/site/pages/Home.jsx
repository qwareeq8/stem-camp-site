// Landing page: hero, camp overview, quick stats, leaderboard snapshot, and
// up-next schedule, all driven by the data layer. It intentionally hand-rolls
// the hero rather than using the shared <Page> header used by the other pages.
import { Link } from "react-router-dom";
import { useConfig, useCollection } from "../lib/store.js";
import { rankedTeamTotalsByCamp } from "../lib/scoring.js";
import { isScheduleComplete, upcomingSchedule } from "../lib/scheduleTiming.js";
import {
  BACKUP_STATION_COUNT,
  PRIMARY_STATION_COUNT,
  PRIMARY_STATIONS_BY_CAMP,
} from "../lib/stationCounts.js";
import { Card, Stat, Badge, Btn, SectionTitle, CampBadge } from "../ui.jsx";

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

export default function Home() {
  const cfg = useConfig();
  const camps = cfg.camps || [];
  const teams = useCollection("teams");
  const members = useCollection("members");
  const scores = useCollection("scores");
  const schedule = useCollection("schedule");
  const rankedRows = rankedTeamTotalsByCamp(teams, scores);
  const leadersByCamp = camps.map((camp) => ({
    camp,
    rows: rankedRows.filter((row) => row.camp === camp.id && row.rank <= 3),
  }));
  const hasLeaders = leadersByCamp.some((group) => group.rows.length > 0);
  const now = new Date();
  const day0 = upcomingSchedule(schedule, cfg.year, now);
  const scheduleComplete = isScheduleComplete(schedule, cfg.year, now);
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
          <Card><Stat num={PRIMARY_STATION_COUNT} label="Stations" /></Card>
          <Card><Stat num={teams.length} label="Teams" /></Card>
          <Card><Stat num={members.length} label="Campers and staff" /></Card>
          <Card><Stat num={BACKUP_STATION_COUNT} label="Backup stations" /></Card>
        </div>

        {/* camps */}
        <SectionTitle>The two camps</SectionTitle>
        <div className="grid cols-2">
          {camps.map((c) => {
            const n = PRIMARY_STATIONS_BY_CAMP[c.id] ?? 0;
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
              {!hasLeaders ? (
                <div className="muted" style={{ fontSize: 14 }}>No standings yet. Scores appear once stations are judged.</div>
              ) : (
                leadersByCamp.map(({ camp, rows: leaders }) => leaders.length > 0 && (
                  <div key={camp.id} style={{ marginBottom: 12 }}>
                    <div className="row" style={{ paddingBottom: 4 }}>
                      <CampBadge camp={camp.id} />
                      <span className="mono muted" style={{ fontSize: 10.5 }}>ranked within camp</span>
                    </div>
                    {leaders.map((team, index) => (
                      <div key={team.id} className="row" style={{ padding: "7px 0", borderBottom: index < leaders.length - 1 ? "1px solid var(--rule12)" : "none" }}>
                        <span style={{ fontFamily: "var(--serif)", fontSize: 22, width: 26 }}>{team.rank}</span>
                        <div style={{ flex: 1, fontWeight: 600 }}>{team.name}</div>
                        <span className="mono" style={{ fontSize: 18 }}>{team.total}</span>
                      </div>
                    ))}
                  </div>
                ))
              )}
              <Link to="/leaderboard" className="mono see-more" style={{ fontSize: 11, display: "inline-block", marginTop: 10 }}>Full standings &rarr;</Link>
            </Card>
          </div>
          <div>
            <SectionTitle>{day0 ? `Up next: ${day0.day}` : scheduleComplete ? "2026 camps complete" : "Schedule"}</SectionTitle>
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
              ) : scheduleComplete ? (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>The 2026 camp sessions are complete.</div>
                  <div className="muted" style={{ fontSize: 14 }}>
                    Review the full two-week plan, station sequence, and field visits in the schedule archive.
                  </div>
                  <Link to="/schedule" className="mono see-more" style={{ fontSize: 11, display: "inline-block", marginTop: 10 }}>Review the schedule &rarr;</Link>
                </>
              ) : <div className="muted">No schedule yet.</div>}
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
