// Pure helpers for resolving award recipients and checking whether a team is
// still referenced by another collection. Keeping this logic outside React
// makes the Admin deletion guard and public missing-reference state share the
// same interpretation of legacy and current recipient records.

function positiveCount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(1, numeric) : 1;
}

function recipientReference(raw, teamById, memberById) {
  if (typeof raw === "string") {
    if (memberById.has(raw)) return { type: "member", id: raw, count: 1 };
    if (teamById.has(raw)) return { type: "team", id: raw, count: 1 };
    return { type: "recipient", id: raw, count: 1 };
  }

  if (!raw || typeof raw !== "object") {
    return { type: "recipient", id: "", count: 1 };
  }

  let type = "team";
  if (raw.type === "member" || raw.memberId) type = "member";
  else if (!raw.type && !raw.teamId && !raw.id) type = "recipient";

  const id = String(raw.id || raw.memberId || raw.teamId || "");
  return { type, id, count: positiveCount(raw.count) };
}

function missingRecipientName(type, id) {
  const noun = type === "team" ? "team" : type === "member" ? "member" : "recipient";
  return `Missing ${noun} reference: ${id || "(blank)"}`;
}

/**
 * Resolve the mixed legacy/current earnedBy shapes without discarding invalid
 * references. Missing IDs remain visible so public award cards never imply
 * that an award was unassigned when its saved recipient was deleted.
 */
export function resolveAchievementRecipients(earnedBy, teams, members) {
  const teamById = new Map((teams || []).map((team) => [team.id, team]));
  const memberById = new Map((members || []).map((member) => [member.id, member]));
  const grouped = new Map();

  for (const raw of earnedBy || []) {
    const reference = recipientReference(raw, teamById, memberById);
    const member = reference.type === "member" ? memberById.get(reference.id) : null;
    const team = reference.type === "member" ? teamById.get(member?.teamId) : teamById.get(reference.id);
    const entity = reference.type === "member" ? member : reference.type === "team" ? team : null;
    const isMissing = !entity;
    const key = `${reference.type}:${reference.id || "(blank)"}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.count += reference.count;
      continue;
    }

    grouped.set(key, {
      key,
      name: isMissing
        ? missingRecipientName(reference.type, reference.id)
        : entity.name || `Unnamed ${reference.type}: ${reference.id}`,
      count: reference.count,
      camp: team?.camp,
      missing: isMissing,
    });
  }

  return [...grouped.values()];
}

/**
 * Count every cross-collection record that must be removed or reassigned before
 * a team can be deleted safely from the form-based Admin console.
 */
export function teamReferenceSummary(teamId, { members, scores, tickets, achievements }) {
  const safeMembers = members || [];
  const teamById = new Map([[teamId, { id: teamId }]]);
  const memberById = new Map(safeMembers.map((member) => [member.id, member]));
  let achievementRecipients = 0;

  for (const achievement of achievements || []) {
    for (const raw of achievement.earnedBy || []) {
      const reference = recipientReference(raw, teamById, memberById);
      if (reference.type === "team" && reference.id === teamId) {
        achievementRecipients += 1;
      } else if (
        reference.type === "member"
        && memberById.get(reference.id)?.teamId === teamId
      ) {
        achievementRecipients += 1;
      }
    }
  }

  return {
    members: safeMembers.filter((member) => member.teamId === teamId).length,
    scores: (scores || []).filter((score) => score.teamId === teamId).length,
    tickets: (tickets || []).filter((ticket) => ticket.teamId === teamId).length,
    achievementRecipients,
  };
}

export function hasTeamReferences(summary) {
  return Object.values(summary).some((count) => count > 0);
}

/**
 * Compare a proposed whole-team collection with its live baseline and return
 * every removed team that still has a related live record. This is used again
 * at the central write boundary so Raw JSON and bulk-preview saves cannot
 * bypass the form's Remove-button guard.
 */
export function removedTeamReferenceSummaries(previousTeams, nextTeams, related) {
  const nextIds = new Set((nextTeams || []).map((team) => team.id));
  return (previousTeams || [])
    .filter((team) => !nextIds.has(team.id))
    .map((team) => ({
      team,
      summary: teamReferenceSummary(team.id, related),
    }))
    .filter(({ summary }) => hasTeamReferences(summary));
}
