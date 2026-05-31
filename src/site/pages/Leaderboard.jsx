// Leaderboard: ranked team standings with a camp filter, a progress-bar table,
// and a per-team "by station" breakdown. All figures derive from the data layer
// via teamTotals(); nothing is hardcoded.
import { useState } from "react";
import { useCollection } from "../lib/store.js";
import { teamTotals, maxTotal, ticketBalances } from "../lib/scoring.js";
import { Page, Card, Badge, SectionTitle, Progress, CampBadge, Empty } from "../ui.jsx";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "trees", label: "Trees" },
  { id: "pystem", label: "PY-STEM" },
];

export default function Leaderboard() {
  const teams = useCollection("teams");
  const scores = useCollection("scores");
  const tickets = useCollection("tickets");
  const balances = ticketBalances(tickets);
  const [filter, setFilter] = useState("all");

  // Rank across all teams first so positions are absolute, then narrow the view.
  const allRows = teamTotals(teams, scores);
  const ranked = allRows.map((r, i) => ({ ...r, rank: i + 1 }));
  const rows = ranked.filter((r) => filter === "all" || r.camp === filter);
  const ceiling = maxTotal(allRows);

  // Group raw score entries by team for the per-station breakdown.
  const byTeam = {};
  for (const s of scores) {
    (byTeam[s.teamId] = byTeam[s.teamId] || []).push(s);
  }

  return (
    <Page
      eyebrow="Standings"
      title="Leaderboard"
      sub="Every activity is scored out of 100; only a team's best 9 of 12 primary scores count toward the total. Rank is absolute across both camps; use the filter to focus on one."
      actions={
        <div className="row" role="group" aria-label="Filter by camp">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`btn ${filter === f.id ? "" : "ghost"}`}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      {rows.length === 0 ? (
        <Empty>No standings yet. Scores will appear here once stations are judged.</Empty>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col" style={{ width: 64 }}>Rank</th>
                <th scope="col">Team</th>
                <th scope="col" style={{ width: 120 }}>Stations</th>
                <th scope="col" style={{ minWidth: 160 }}>Progress</th>
                <th scope="col" style={{ width: 96, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const lead = t.rank === 1;
                return (
                  <tr key={t.id}>
                    <td className="rank" style={{ fontSize: lead ? 24 : 18, color: lead ? "var(--accent)" : "var(--ink)" }}>
                      {t.rank}
                    </td>
                    <td>
                      <div className="row" style={{ gap: 10 }}>
                        <span style={{ fontWeight: lead ? 700 : 600 }}>{t.name}</span>
                        <CampBadge camp={t.camp} />
                      </div>
                      {t.motto && <div className="muted" style={{ fontSize: 12 }}>{t.motto}</div>}
                    </td>
                    <td className="mono muted">{t.stations}</td>
                    <td><Progress value={t.total} max={ceiling} /></td>
                    <td className="mono" style={{ textAlign: "right", fontSize: lead ? 22 : 18, fontWeight: 600 }}>
                      {t.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <SectionTitle>By station</SectionTitle>
      {rows.length === 0 ? (
        <Empty>No per-station scores recorded yet.</Empty>
      ) : (
        <div className="grid cols-3">
          {rows.map((t) => {
            const entries = byTeam[t.id] || [];
            return (
              <Card key={t.id}>
                <div className="row">
                  <span style={{ fontWeight: 600 }}>{t.name}</span>
                  <span className="spacer" />
                  <CampBadge camp={t.camp} />
                </div>
                <div className="mono muted" style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>
                  Rank {t.rank} &middot; {t.total} pts &middot; {balances[t.id] || 0} tickets
                </div>
                {entries.length === 0 ? (
                  <div className="muted" style={{ fontSize: 13, marginTop: 12 }}>No stations scored.</div>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    {entries.map((s, i) => (
                      <div
                        key={s.code + "-" + i}
                        className="row"
                        style={{ padding: "7px 0", borderBottom: i < entries.length - 1 ? "1px solid var(--rule12)" : "none" }}
                      >
                        <Badge tone={t.camp === "trees" ? "trees" : "py"}>{s.code}</Badge>
                        <span className="spacer" />
                        <span className="mono" style={{ fontSize: 15, fontWeight: 600 }}>{s.points}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
}
