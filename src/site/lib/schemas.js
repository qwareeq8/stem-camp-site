// Dependency-free JSON-shape validation for the data collections. Each
// collection is checked against a tiny hand-rolled schema before any write so a
// malformed edit is rejected in the browser, before any network call, and never
// reaches a commit. This intentionally adds no package: the checks are required
// keys and primitive-type assertions, which is all the kilobyte-scale dataset
// needs. Validation is shape-only; it does not enforce referential integrity
// (for example that a member's teamId names an existing team), which stays the
// admin's responsibility.

// A field spec is { type, required } where type is one of:
// "string", "number", "boolean", "array", "object". An item spec validates the
// elements of an array collection; a record spec validates an object collection.

function typeOf(v) {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  return typeof v; // "string" | "number" | "boolean" | "object" | "undefined"
}

function checkFields(obj, fields, path, errors) {
  if (typeOf(obj) !== "object") {
    errors.push(`${path}: expected an object`);
    return;
  }
  for (const [key, spec] of Object.entries(fields)) {
    const present = Object.prototype.hasOwnProperty.call(obj, key);
    if (!present) {
      if (spec.required) errors.push(`${path}.${key}: missing required key`);
      continue;
    }
    const actual = typeOf(obj[key]);
    if (actual !== spec.type) {
      errors.push(`${path}.${key}: expected ${spec.type}, got ${actual}`);
    }
  }
}

// Per-collection schemas. Item schemas describe each element of an array
// collection; the config schema describes the single object.
const SCHEMAS = {
  teams: {
    kind: "array",
    item: {
      id: { type: "string", required: true },
      name: { type: "string", required: true },
      camp: { type: "string", required: true },
      emblem: { type: "string", required: false },
      motto: { type: "string", required: false },
    },
  },
  members: {
    kind: "array",
    item: {
      id: { type: "string", required: true },
      name: { type: "string", required: true },
      teamId: { type: "string", required: true },
      role: { type: "string", required: false },
    },
  },
  scores: {
    kind: "array",
    item: {
      teamId: { type: "string", required: true },
      code: { type: "string", required: true },
      points: { type: "number", required: true },
    },
  },
  // Tickets: a per-team reward currency the admin grants or deducts. This is a
  // camp-facing layer on top of the real points/awards, not from the source kit.
  // Each entry is one grant (positive amount) or redemption (negative amount);
  // a team's balance is the running sum (see scoring.teamTickets).
  tickets: {
    kind: "array",
    item: {
      id: { type: "string", required: false },
      teamId: { type: "string", required: true },
      amount: { type: "number", required: true },
      reason: { type: "string", required: false },
      pickedUpBy: { type: "string", required: false },
      ts: { type: "string", required: false },
    },
  },
  schedule: {
    kind: "array",
    item: {
      day: { type: "string", required: true },
      date: { type: "string", required: false },
      theme: { type: "string", required: false },
      blocks: { type: "array", required: true },
    },
  },
  achievements: {
    kind: "array",
    item: {
      id: { type: "string", required: true },
      name: { type: "string", required: true },
      icon: { type: "string", required: false },
      desc: { type: "string", required: false },
      earnedBy: { type: "array", required: false },
    },
  },
  prizes: {
    kind: "array",
    item: {
      id: { type: "string", required: true },
      name: { type: "string", required: true },
      tier: { type: "string", required: false },
      desc: { type: "string", required: false },
      criteria: { type: "string", required: false },
    },
  },
  // Catalog: the ticket store. Each item is a reward a team can redeem tickets
  // for, with a cost in tickets. Redemption is recorded as a negative tickets
  // ledger entry (see scoring.teamTickets); this collection only describes the
  // rewards on offer, so it never changes a balance by itself.
  catalog: {
    kind: "array",
    item: {
      id: { type: "string", required: true },
      name: { type: "string", required: true },
      cost: { type: "number", required: true },
      desc: { type: "string", required: false },
      limit: { type: "number", required: false },
    },
  },
  files: {
    kind: "array",
    item: {
      id: { type: "string", required: true },
      name: { type: "string", required: true },
      category: { type: "string", required: false },
      type: { type: "string", required: false },
      path: { type: "string", required: true },
      size: { type: "string", required: false },
      desc: { type: "string", required: false },
      // Optional grouping hints used by the public Files page: camp ("trees" |
      // "pystem" | "" for program-wide), the activity code a doc belongs to,
      // and kind ("handout" | "guide" | "") for per-activity documents.
      camp: { type: "string", required: false },
      code: { type: "string", required: false },
      kind: { type: "string", required: false },
    },
  },
  config: {
    kind: "object",
    record: {
      siteTitle: { type: "string", required: true },
      tagline: { type: "string", required: false },
      year: { type: "number", required: false },
      dates: { type: "string", required: false },
      location: { type: "string", required: false },
      supabase: { type: "object", required: false },
      camps: { type: "array", required: true },
    },
  },
};

// Validate value for the named collection. Returns an array of human-readable
// error strings; an empty array means valid. Unknown collection names are
// accepted (return no errors) so adding a collection later does not hard-fail.
export function validateCollection(name, value) {
  const schema = SCHEMAS[name];
  if (!schema) return [];
  const errors = [];
  if (schema.kind === "array") {
    if (typeOf(value) !== "array") {
      errors.push(`${name}: expected a top-level array`);
      return errors;
    }
    value.forEach((item, i) => checkFields(item, schema.item, `${name}[${i}]`, errors));
  } else {
    checkFields(value, schema.record, name, errors);
  }
  return errors;
}

// Throwing wrapper used by the write path. Throws an Error whose message lists
// up to the first few problems, so the admin banner shows actionable detail.
export function validate(name, value) {
  const errors = validateCollection(name, value);
  if (errors.length) {
    const head = errors.slice(0, 4).join("; ");
    const more = errors.length > 4 ? ` (+${errors.length - 4} more)` : "";
    throw new Error(`Schema check failed for ${name}: ${head}${more}`);
  }
}

export { SCHEMAS };
