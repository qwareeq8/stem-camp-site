// Teams: rosters and crews grouped by camp. Each card shows the team name,
// camp badge, motto, member roster with role badges, and a footer with the
// team total and stations scored (from the shared scoring math).
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

  return (
    <Page
      eyebrow="Rosters and crews"
      title="Teams"
      sub="Every camper rides with a crew. Cards are grouped by camp and show the roster, the motto, and the running score."
    >
      {teams.length === 0 && (
        <Empty>No teams yet. An admin adds teams and rosters from the data console.</Empty>
      )}
      {cfg.camps.map((camp) => {
        const campTeams = teams.filter((t) => t.camp === camp.id);
        if (campTeams.length === 0) return null;
        return (
          <section key={camp.id} style={{ marginBottom: 10 }}>
            <SectionTitle>
              {camp.name} &middot; {campTeams.length} {campTeams.length === 1 ? "team" : "teams"}
            </SectionTitle>
            <div className="grid cols-2" style={{ marginBottom: 18, alignItems: "start" }}>
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
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          border: "1px solid var(--rule22)",
                          color: camp.accent,
                          background: "var(--paper)",
                          flexShrink: 0,
                        }}
                      >
                        <Emblem size={18} strokeWidth={1.8} />
                      </span>
                      <h3 style={{ fontSize: 26, color: camp.accent }}>{team.name}</h3>
                    </div>
                    {team.motto && (
                      <p className="muted" style={{ marginTop: 6, marginBottom: 0, fontStyle: "italic" }}>
                        &ldquo;{team.motto}&rdquo;
                      </p>
                    )}

                    <div className="section-title" style={{ marginTop: 18 }}>Roster</div>
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
