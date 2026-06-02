// Store: the ticket store. Lists the rewards teams can redeem their tickets for
// (the catalog collection) and each team's current ticket balance, so campers can
// see what they can afford. Tickets are a camp-facing reward currency that sits on
// top of the real points and awards; the Leaderboard carries the standings. All
// figures come from the data layer; nothing is hardcoded.
import { useCollection, useConfig } from "../lib/store.js";
import { ticketBalances } from "../lib/scoring.js";
import { Page, Card, Badge, SectionTitle, CampBadge, Empty } from "../ui.jsx";
import { Ticket } from "lucide-react";

export default function Store() {
  const cfg = useConfig();
  const catalog = useCollection("catalog");
  const teams = useCollection("teams");
  const tickets = useCollection("tickets");
  const balances = ticketBalances(tickets);

  // Order team cards by camp (config order), then any teams whose camp is not
  // listed, so the balances read camp-by-camp without nested-array key warnings.
  const camps = cfg.camps || [];
  const ordered = camps.flatMap((c) => teams.filter((t) => t.camp === c.id));
  const rest = teams.filter((t) => !ordered.includes(t));
  const allTeams = [...ordered, ...rest];

  return (
    <Page
      eyebrow="Reward currency"
      title="Ticket store"
      sub="Tickets are a camp-facing reward currency on top of the real points and awards. Earn them for teamwork, safety, and clean data, then redeem them for the rewards below."
    >
      <SectionTitle>Rewards you can redeem</SectionTitle>
      <p className="muted" style={{ margin: "-2px 0 12px", fontSize: 13 }}>
        Redeemed in person at the camp store with a facilitator; balances update on the leaderboard.
      </p>
      {catalog.length === 0 ? (
        <Empty>No rewards listed yet. An admin adds redeemable rewards from the data console.</Empty>
      ) : (
        <div className="grid auto">
          {catalog.map((c) => {
            const cost = Number(c.cost) || 0;
            return (
              <Card key={c.id} ticks>
                <div className="row" style={{ marginBottom: 12 }}>
                  <span className="badge">
                    <Ticket size={13} strokeWidth={1.9} aria-hidden="true" /> {cost} {cost === 1 ? "ticket" : "tickets"}
                  </span>
                  <span className="spacer" />
                  {c.limit ? <span className="meta" title="Maximum redemptions per team">Limit {c.limit} per team</span> : null}
                </div>
                <h3 style={{ fontSize: 21, marginBottom: 6 }}>{c.name}</h3>
                {c.desc && <p className="muted" style={{ margin: 0, fontSize: 14 }}>{c.desc}</p>}
              </Card>
            );
          })}
        </div>
      )}

      <SectionTitle>Team ticket balances</SectionTitle>
      {allTeams.length === 0 ? (
        <Empty>No teams yet. Balances appear once teams are added and tickets are granted.</Empty>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Team</th>
                <th scope="col" style={{ width: 120 }}>Camp</th>
                <th scope="col" style={{ width: 110, textAlign: "right" }}>Tickets</th>
              </tr>
            </thead>
            <tbody>
              {allTeams.map((team) => (
                <tr key={team.id}>
                  <td style={{ fontWeight: 600 }}>{team.name}</td>
                  <td><CampBadge camp={team.camp} /></td>
                  <td className="mono" style={{ textAlign: "right", fontSize: 16, fontWeight: 600 }}>{balances[team.id] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}
