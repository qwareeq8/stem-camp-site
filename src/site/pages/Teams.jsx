// Teams: rosters and crews grouped by camp. Each card shows the team name,
// camp badge, motto, member roster with role badges, and a footer with the
// team total, ticket balance, and stations scored (from the shared scoring math).
import { useCollection, useConfig } from "../lib/store.js";
import { teamTotals, ticketBalances } from "../lib/scoring.js";
import { Page, Card, Badge, SectionTitle, CampBadge, Empty } from "../ui.jsx";
import {
  Atom, Bot, Box, CircuitBoard, Cog, Compass, Cpu, FlaskConical, Hammer,
  HeartPulse, Leaf, Lightbulb, Magnet, Microscope, RadioTower, Rocket, Sprout,
  Trees as TreesIcon, Waves,
} from "lucide-react";

const EMBLEMS = {
  atom: Atom,
  bot: Bot,
  box: Box,
  circuit: CircuitBoard,
  compass: Compass,
  cpu: Cpu,
  flask: FlaskConical,
  gear: Cog,
  hammer: Hammer,
  heart: HeartPulse,
  leaf: Leaf,
  light: Lightbulb,
  magnet: Magnet,
  microscope: Microscope,
  rocket: Rocket,
  signal: RadioTower,
  sprout: Sprout,
  trees: TreesIcon,
  wave: Waves,
};

export default function Teams() {
  const cfg = useConfig();
  const teams = useCollection("teams");
  const members = useCollection("members");
  const scores = useCollection("scores");
  const tickets = useCollection("tickets");

  // teamTotals returns sorted rows with .total and .stations per team.
  const rows = teamTotals(teams, scores);
  const byId = {};
  for (const r of rows) byId[r.id] = r;
  const balances = ticketBalances(tickets);

  // Members grouped by their team for quick roster lookup.
  const roster = {};
  for (const m of members) {
    (roster[m.teamId] || (roster[m.teamId] = [])).push(m);
  }

  // Sections by camp (config order), then a bucket for any teams whose camp is
  // not listed, so no team silently disappears (the Store page does the same).
  const camps = cfg.camps || [];
  const sections = camps.map((camp) => ({
    key: camp.id,
    label: camp.name,
    accent: camp.accent,
    teams: teams.filter((t) => t.camp === camp.id),
  }));
  const listed = new Set(camps.map((c) => c.id));
  const rest = teams.filter((t) => !listed.has(t.camp));
  if (rest.length > 0) sections.push({ key: "other", label: "Other teams", teams: rest });

  return (
    <Page
      eyebrow="Rosters and crews"
      title="Teams"
      sub="Every camper rides with a crew. Cards are grouped by camp and show the roster, the motto, and the running score."
    >
      {teams.length === 0 && (
        <Empty>No teams yet. An admin adds teams and rosters from the data console.</Empty>
      )}
      {sections.map((group) => {
        const campTeams = group.teams;
        if (campTeams.length === 0) return null;
        return (
          <section key={group.key} style={{ marginBottom: 10 }}>
            <SectionTitle>
              {group.label} &middot; {campTeams.length} {campTeams.length === 1 ? "team" : "teams"}
            </SectionTitle>
            <div className="grid auto" style={{ marginBottom: 18, alignItems: "start" }}>
              {campTeams.map((team) => {
                const stats = byId[team.id] || { total: 0, stations: 0 };
                const crew = roster[team.id] || [];
                const Emblem = EMBLEMS[team.emblem] || CircuitBoard;
                return (
                  <Card key={team.id} ticks padLg>
                    <div className="row">
                      <CampBadge camp={team.camp} />
                      <span className="spacer" />
                      <span className="mono muted" style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {crew.length} {crew.length === 1 ? "member" : "members"}
                      </span>
                    </div>

                    <div className="row" style={{ marginTop: 12, gap: 10, alignItems: "center" }}>
                      <span
                        aria-hidden="true"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          color: group.accent,
                          flexShrink: 0,
                        }}
                      >
                        <Emblem size={24} strokeWidth={1.8} />
                      </span>
                      <h3 style={{ fontSize: 26, color: group.accent }}>{team.name}</h3>
                    </div>
                    {team.motto && (
                      <p className="muted" style={{ marginTop: 6, marginBottom: 0, fontStyle: "italic" }}>
                        &ldquo;{team.motto}&rdquo;
                      </p>
                    )}

                    <h4 className="section-title" style={{ marginTop: 18 }}>Roster</h4>
                    {crew.length === 0 ? (
                      <Empty>No members assigned yet.</Empty>
                    ) : (
                      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {crew.map((m, i) => (
                          <li
                            key={m.id}
                            className="row"
                            style={{ padding: "8px 0", borderBottom: i < crew.length - 1 ? "1px solid var(--rule12)" : "none" }}
                          >
                            <span style={{ flex: 1, fontWeight: 500 }}>{m.name}</span>
                            {m.role === "counselor"
                              ? <Badge tone="ok">Counselor</Badge>
                              : <Badge>Camper</Badge>}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div
                      className="row"
                      style={{ marginTop: 18, paddingTop: 14, borderTop: "1.5px solid var(--ink)" }}
                    >
                      <div style={{ flex: 1 }}>
                        <div className="mono muted" style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          Total points
                        </div>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 600, lineHeight: 1 }}>
                          {stats.total}
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div className="mono muted" style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          Tickets
                        </div>
                        <div className="mono" style={{ fontSize: 18 }}>{balances[team.id] || 0}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="mono muted" style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          Stations scored
                        </div>
                        <div className="mono" style={{ fontSize: 18 }}>{stats.stations}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </Page>
  );
}
