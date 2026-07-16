// Dependency-free JSON-shape validation for the data collections. Each
// collection is checked against a tiny hand-rolled schema before any write so a
// malformed edit is rejected in the browser, before any network call, and never
// reaches a commit. This intentionally adds no package. In addition to required
// keys and primitive types, the collection-level checks below enforce the small
// set of invariants that can otherwise corrupt scoring or hide files in the
// public library. Cross-collection deletion integrity is enforced separately at
// the Admin write boundary, where the validated live collections are available
// together.

// A field spec is { type, required, allowBlank? } where type is one of:
// "string", "number", "boolean", "array", "object". An "array" field spec may
// carry a nested item spec that validates each element as an object. An item
// spec validates the elements of an array collection; a record spec validates
// an object collection.

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
      continue;
    }
    if (spec.required && spec.type === "string" && !spec.allowBlank && obj[key].trim() === "") {
      errors.push(`${path}.${key}: required text cannot be blank`);
      continue;
    }
    if (spec.type === "number" && !Number.isFinite(obj[key])) {
      errors.push(`${path}.${key}: expected a finite number`);
      continue;
    }
    if (spec.type === "array" && spec.item) {
      obj[key].forEach((el, i) => checkFields(el, spec.item, `${path}.${key}[${i}]`, errors));
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
      teamId: { type: "string", required: true, allowBlank: true },
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
      camp: { type: "string", required: true },
      date: { type: "string", required: false },
      theme: { type: "string", required: false },
      // Each block is one row on the public Schedule page; start/end/title are
      // what the page renders unconditionally.
      blocks: {
        type: "array",
        required: true,
        item: {
          start: { type: "string", required: true },
          end: { type: "string", required: true },
          title: { type: "string", required: true },
          code: { type: "string", required: false },
          // A repeated activity can keep its resource code while using a
          // distinct leaderboard key (for example PYS-02R for a rematch).
          scoreCode: { type: "string", required: false },
          note: { type: "string", required: false },
          camp: { type: "string", required: false },
          location: { type: "string", required: false },
        },
      },
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
      desc: { type: "string", required: false },
      // Optional grouping hints used by the public Files page: camp ("trees" |
      // "pystem" | "" for program-wide), the activity code a doc belongs to,
      // and kind ("handout" | "guide" | "print" | "") for per-activity
      // documents and station printables.
      camp: { type: "string", required: false },
      code: { type: "string", required: false },
      kind: { type: "string", required: false },
      // Exact bytes are stamped from public/files at authoring time so the
      // public page does not issue one HEAD request per document.
      bytes: { type: "number", required: true },
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
      // Each camp drives a section on Home, Schedule, Teams, and Store; id is
      // the join key into teams and schedule rows.
      camps: {
        type: "array",
        required: true,
        item: {
          id: { type: "string", required: true },
          name: { type: "string", required: true },
          sub: { type: "string", required: false },
          accent: { type: "string", required: false },
          tagline: { type: "string", required: false },
          dates: { type: "string", required: false },
          startDate: { type: "string", required: false },
          endDate: { type: "string", required: false },
          campus: { type: "string", required: false },
        },
      },
    },
  },
};

function duplicateErrors(items, keyFor, path, label) {
  const seen = new Map();
  const errors = [];
  for (const [index, item] of items.entries()) {
    const key = keyFor(item);
    if (!key) continue;
    if (seen.has(key)) {
      errors.push(`${path}[${index}]: duplicate ${label} "${key}" (first used at ${path}[${seen.get(key)}])`);
    } else {
      seen.set(key, index);
    }
  }
  return errors;
}

function semanticErrors(name, value) {
  if (!Array.isArray(value)) {
    if (name !== "config" || !value || typeof value !== "object") return [];
    return duplicateErrors(value.camps || [], (camp) => String(camp.id || "").trim(), "config.camps", "camp id");
  }

  if (["teams", "members", "achievements", "prizes", "catalog", "files"].includes(name)) {
    const errors = duplicateErrors(value, (item) => String(item.id || "").trim(), name, "id");
    if (name === "members") {
      for (const [index, member] of value.entries()) {
        const unassigned = !String(member.teamId || "").trim();
        const counselor = String(member.role || "").trim().toLowerCase() === "counselor";
        if (unassigned && !counselor) {
          errors.push(`members[${index}].teamId: only counselors may be unassigned`);
        }
      }
      return errors;
    }
    if (name === "achievements") {
      for (const [achievementIndex, achievement] of value.entries()) {
        for (const [recipientIndex, recipient] of (achievement.earnedBy || []).entries()) {
          const at = `achievements[${achievementIndex}].earnedBy[${recipientIndex}]`;
          // Legacy award data stored a team/member id directly as a string.
          // Current Admin writes an explicit { type, id, count } object.
          if (typeof recipient === "string") {
            if (!recipient.trim()) errors.push(`${at}: legacy recipient id cannot be blank`);
            continue;
          }
          if (!recipient || typeof recipient !== "object" || Array.isArray(recipient)) {
            errors.push(`${at}: expected a legacy id string or recipient object`);
            continue;
          }
          if (!["team", "member"].includes(recipient.type)) {
            errors.push(`${at}.type: expected "team" or "member"`);
          }
          if (typeof recipient.id !== "string" || !recipient.id.trim()) {
            errors.push(`${at}.id: recipient id cannot be blank`);
          }
          if (
            recipient.count !== undefined
            && (!Number.isInteger(recipient.count) || recipient.count < 1)
          ) {
            errors.push(`${at}.count: expected a positive integer`);
          }
        }
      }
      return errors;
    }
    if (name !== "files") return errors;

    errors.push(...duplicateErrors(value, (item) => String(item.path || "").trim(), name, "path"));
    for (const [index, file] of value.entries()) {
      const at = `files[${index}]`;
      const filePath = String(file.path || "").trim();
      if (filePath && (!filePath.startsWith("files/") || filePath.includes(".."))) {
        errors.push(`${at}.path: must stay under public/files`);
      }
      if (file.bytes !== undefined && (!Number.isInteger(file.bytes) || file.bytes <= 0)) {
        errors.push(`${at}.bytes: expected a positive integer`);
      }
      if (file.category === "Activity") {
        if (!String(file.camp || "").trim()) errors.push(`${at}.camp: activity documents need a camp`);
        if (!String(file.code || "").trim()) errors.push(`${at}.code: activity documents need a station code`);
        if (!["handout", "guide"].includes(file.kind)) errors.push(`${at}.kind: activity documents must be a handout or guide`);
      }
      if (file.category === "Printable") {
        if (file.camp && !String(file.code || "").trim()) errors.push(`${at}.code: camp printables need a station code`);
        if (file.kind !== "print") errors.push(`${at}.kind: printables must use kind "print"`);
      }
    }
    return errors;
  }

  if (name === "scores") {
    const errors = duplicateErrors(
      value,
      (score) => `${String(score.teamId || "").trim()}::${String(score.code || "").trim().toUpperCase()}`,
      "scores",
      "team and station pair",
    );
    for (const [index, score] of value.entries()) {
      if (!Number.isFinite(score.points)) continue;
      const code = String(score.code || "").trim().toUpperCase();
      const max = code === "CRANK" ? 300 : 100;
      if (score.points < 0 || score.points > max) {
        errors.push(`scores[${index}].points: ${code || "station"} must be between 0 and ${max}`);
      }
    }
    return errors;
  }

  if (name === "schedule") {
    const scored = [];
    for (const day of value) {
      for (const block of day.blocks || []) {
        const code = String(block.scoreCode || block.code || "").trim().toUpperCase();
        if (code) scored.push({ code });
      }
    }
    return duplicateErrors(scored, (block) => block.code, "schedule scored blocks", "score code");
  }

  return [];
}

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
  if (errors.length === 0) errors.push(...semanticErrors(name, value));
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
