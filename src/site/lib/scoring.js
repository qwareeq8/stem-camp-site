// Leaderboard math shared by Home and Leaderboard. Per the competition rules,
// only a team's best 9 station scores count toward the standings (12 primary
// stations, plus any scored warm-up like PYS-00), so one rough activity does
// not sink a team. teamTotals therefore sums each team's top scores up to
// COUNTING_SCORES.
export const COUNTING_SCORES = 9;

export function teamTotals(teams, scores, limit = COUNTING_SCORES) {
  const byTeam = {};
  for (const s of scores) {
    (byTeam[s.teamId] = byTeam[s.teamId] || []).push(Number(s.points) || 0);
  }
  return teams
    .map((t) => {
      const pts = (byTeam[t.id] || []).slice().sort((a, b) => b - a);
      const counted = pts.slice(0, limit);
      const raw = counted.reduce((a, b) => a + b, 0);
      // Round the displayed total to 2 decimals so floating-point sums never
      // leak artifacts like 173.92000000000002 onto the leaderboard; raw
      // keeps the ranking exact.
      const total = Math.round(raw * 100) / 100;
      return { ...t, raw, total, stations: pts.length, counted: counted.length };
    })
    .sort((a, b) => b.raw - a.raw || a.name.localeCompare(b.name));
}

export function maxTotal(rows) {
  return rows.reduce((m, r) => Math.max(m, r.total), 0);
}

// Tickets are a per-team reward currency the admin grants or deducts (a layer on
// top of the real points/awards). A team's balance is the running sum of its
// ledger entries. Returns a { teamId: balance } map; absent teams read as 0.
export function ticketBalances(tickets) {
  const byTeam = {};
  for (const t of tickets || []) {
    byTeam[t.teamId] = (byTeam[t.teamId] || 0) + (Number(t.amount) || 0);
  }
  return byTeam;
}

// Convenience: the ticket balance for one team id.
export function teamTickets(tickets, teamId) {
  return ticketBalances(tickets)[teamId] || 0;
}
