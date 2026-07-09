// Leaderboard math shared by Home, Teams, and Leaderboard. Per the competition
// rules, the lowest quarter of a team's station scores is canceled: with n
// scores on the books, the floor(n/4) lowest are dropped and only the rest sum
// into the total, so a few rough activities do not sink a team. With all 12
// primary stations scored this is exactly the classic "best 9 of 12". Canceled
// entries still appear in station lists, crossed out.
export const DROP_FRACTION = 1 / 4;

// How many of a team's n scores are canceled.
export function droppedCount(n) {
  return Math.floor(n * DROP_FRACTION);
}

// Split one team's score entries into counted and dropped (canceled) sets.
// The sort is deterministic (points descending, then station code) so a tie at
// the cut line cancels the same entry everywhere on the site.
export function splitScores(entries) {
  const sorted = (entries || [])
    .slice()
    .sort(
      (a, b) =>
        (Number(b.points) || 0) - (Number(a.points) || 0) ||
        String(a.code || "").localeCompare(String(b.code || "")),
    );
  const keep = sorted.length - droppedCount(sorted.length);
  return { counted: sorted.slice(0, keep), dropped: sorted.slice(keep) };
}

export function teamTotals(teams, scores) {
  const byTeam = {};
  for (const s of scores) {
    (byTeam[s.teamId] = byTeam[s.teamId] || []).push(s);
  }
  return teams
    .map((t) => {
      const { counted, dropped } = splitScores(byTeam[t.id] || []);
      const raw = counted.reduce((a, s) => a + (Number(s.points) || 0), 0);
      // Round the displayed total to 2 decimals so floating-point sums never
      // leak artifacts like 173.92000000000002 onto the leaderboard; raw
      // keeps the ranking exact.
      const total = Math.round(raw * 100) / 100;
      return {
        ...t,
        raw,
        total,
        stations: counted.length + dropped.length,
        counted: counted.length,
        dropped: dropped.length,
      };
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
