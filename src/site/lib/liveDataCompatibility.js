// Read-time compatibility for live records created by earlier versions of the
// 2026 site. Keep these conversions narrow and deterministic: hydration may
// publish the normalized value in the browser, but it never writes to Supabase.

const LEGACY_CRANK_CODE = "PYS-03";
const CRANK_CODE = "CRANK";
const LEGACY_CRANK_TEAM_COUNT = 6;
const LEGACY_CRANK_POINTS = Object.freeze([215, 232, 237, 261, 265, 274]);

function scoreCode(score) {
  return String(score?.code || "").trim().toUpperCase();
}

function hasKnownCrankPoints(scores) {
  const points = scores.map((score) => score?.points);
  const hasOnlyFiniteNumbers = points.every(
    (point) => typeof point === "number" && Number.isFinite(point),
  );
  if (!hasOnlyFiniteNumbers) {
    return false;
  }
  return [...points]
    .sort((pointA, pointB) => pointA - pointB)
    .every((point, index) => point === LEGACY_CRANK_POINTS[index]);
}

// The six 2026 Crank Championship results were historically saved under the
// Cardboard Automata resource code (PYS-03). Ordinary PYS-03 scores are capped
// at 100. Only normalize the closed event's complete six-team batch: accepting
// any isolated value above 100 would turn a future malformed ordinary score
// into an always-counted Crank entry instead of failing closed.
function isLegacyCrankBatch(scores) {
  if (!Array.isArray(scores) || scores.some((score) => scoreCode(score) === CRANK_CODE)) {
    return false;
  }
  const legacyRows = scores.filter((score) => scoreCode(score) === LEGACY_CRANK_CODE);
  if (legacyRows.length !== LEGACY_CRANK_TEAM_COUNT) return false;

  const teamIds = legacyRows.map((score) => (
    typeof score?.teamId === "string" ? score.teamId.trim() : ""
  ));
  return (
    teamIds.every(Boolean)
    && new Set(teamIds).size === LEGACY_CRANK_TEAM_COUNT
    && hasKnownCrankPoints(legacyRows)
  );
}

/**
 * Normalize the known legacy batch before validation and leaderboard math.
 *
 * This preserves the live revision and every point while restoring the
 * intended 300-point, always-counted treatment. A later authenticated Admin
 * save may persist the canonical key through the normal revision-checked write
 * path.
 *
 * @param {unknown} scores - Candidate score collection from live storage.
 * @returns {unknown} The original value, or a normalized score array.
 */
export function normalizeLegacyScores(scores) {
  if (!isLegacyCrankBatch(scores)) return scores;
  return scores.map((score) => {
    if (scoreCode(score) !== LEGACY_CRANK_CODE) return score;
    return { ...score, code: CRANK_CODE };
  });
}

/**
 * Apply read-time compatibility for a named live collection.
 *
 * @param {string} name - Collection name.
 * @param {unknown} value - Candidate collection value from live storage.
 * @returns {unknown} The value used for schema validation and publication.
 */
export function normalizeLiveCollection(name, value) {
  return name === "scores" ? normalizeLegacyScores(value) : value;
}
