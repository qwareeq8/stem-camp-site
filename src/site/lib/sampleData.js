// Sample (demo) data set. The shipped src/data/*.json files start cleared so a
// real camp begins from an empty notebook; this module preserves a fully
// populated example so the admin console's "Load sample data" button can fill
// the site for a demo, a screenshot, or a dry run. It writes into the in-browser
// store as a local overlay only (it never touches Supabase), so loading it is
// always reversible with "Reset to seed".
//
// Every person here is a fictional ALIAS, not a real name. That is the rule the
// roster editor enforces too: the database is publicly readable, so never enter a
// real camper's name. These handles are camp-themed nicknames on purpose, to model
// what good aliases look like.

export const SAMPLE_TEAMS = [
  { id: "t-moss", name: "Moss Circuit", camp: "trees", emblem: "circuit", motto: "Power from the soil up." },
  { id: "t-canopy", name: "Canopy Crew", camp: "trees", emblem: "leaf", motto: "Read the rings, plant the future." },
  { id: "t-root", name: "Root Signal", camp: "trees", emblem: "sprout", motto: "Sense the forest." },
  { id: "t-delta", name: "Delta Wave", camp: "pystem", emblem: "wave", motto: "Every echo is a measurement." },
  { id: "t-photon", name: "Photon Pack", camp: "pystem", emblem: "light", motto: "Bend light, find the answer." },
  { id: "t-vector", name: "Vector Unit", camp: "pystem", emblem: "compass", motto: "Direction is half the force." },
];

export const SAMPLE_MEMBERS = [
  { id: "m-01", name: "Sparky", teamId: "t-moss", role: "camper" },
  { id: "m-02", name: "Mossling", teamId: "t-moss", role: "camper" },
  { id: "m-03", name: "Coach Vee", teamId: "t-moss", role: "counselor" },
  { id: "m-04", name: "Ringer", teamId: "t-canopy", role: "camper" },
  { id: "m-05", name: "Leaflet", teamId: "t-canopy", role: "camper" },
  { id: "m-06", name: "Skyhook", teamId: "t-canopy", role: "camper" },
  { id: "m-07", name: "Tuber", teamId: "t-root", role: "camper" },
  { id: "m-08", name: "Sensor", teamId: "t-root", role: "camper" },
  { id: "m-09", name: "Coach Fern", teamId: "t-root", role: "counselor" },
  { id: "m-10", name: "Echo", teamId: "t-delta", role: "camper" },
  { id: "m-11", name: "Ripple", teamId: "t-delta", role: "camper" },
  { id: "m-12", name: "Coach Sonic", teamId: "t-delta", role: "counselor" },
  { id: "m-13", name: "Lumen", teamId: "t-photon", role: "camper" },
  { id: "m-14", name: "Prism", teamId: "t-photon", role: "camper" },
  { id: "m-15", name: "Flash", teamId: "t-photon", role: "camper" },
  { id: "m-16", name: "Newton", teamId: "t-vector", role: "camper" },
  { id: "m-17", name: "Compass", teamId: "t-vector", role: "camper" },
  { id: "m-18", name: "Coach Axis", teamId: "t-vector", role: "counselor" },
];

export const SAMPLE_SCORES = [
  { teamId: "t-moss", code: "TTT-01", points: 88 },
  { teamId: "t-moss", code: "TTT-02", points: 74 },
  { teamId: "t-moss", code: "TTT-03", points: 81 },
  { teamId: "t-canopy", code: "TTT-01", points: 79 },
  { teamId: "t-canopy", code: "TTT-02", points: 90 },
  { teamId: "t-canopy", code: "TTT-04", points: 72 },
  { teamId: "t-root", code: "TTT-02", points: 85 },
  { teamId: "t-root", code: "TTT-03", points: 77 },
  { teamId: "t-root", code: "TTT-05", points: 93 },
  { teamId: "t-delta", code: "PYS-01", points: 82 },
  { teamId: "t-delta", code: "PYS-06", points: 91 },
  { teamId: "t-delta", code: "PYS-04", points: 70 },
  { teamId: "t-photon", code: "PYS-07", points: 88 },
  { teamId: "t-photon", code: "PYS-10", points: 84 },
  { teamId: "t-photon", code: "PYS-01", points: 69 },
  { teamId: "t-vector", code: "PYS-08", points: 80 },
  { teamId: "t-vector", code: "PYS-12", points: 86 },
  { teamId: "t-vector", code: "PYS-03", points: 75 },
];

// The 8 real award definitions with example winners filled in.
export const SAMPLE_ACHIEVEMENTS = [
  { id: "aw-data-detective", name: "Data Detective", icon: "search", desc: "Sharpest evidence of the day: clean data and an inference that holds up.", earnedBy: ["t-root", "t-photon"] },
  { id: "aw-safety-captain", name: "Safety Captain", icon: "shield", desc: "Ran the station with PPE on and zero safety flags.", earnedBy: ["t-moss", "t-delta"] },
  { id: "aw-prototype-mvp", name: "Prototype MVP", icon: "wrench", desc: "The build that carried the team: reliable and well made.", earnedBy: ["t-canopy"] },
  { id: "aw-best-teammate", name: "Best Teammate", icon: "users", desc: "Lifted the whole crew across the rotating roles.", earnedBy: ["t-vector", "t-moss"] },
  { id: "aw-best-redesign", name: "Best Redesign", icon: "redesign", desc: "Changed one variable and measurably improved the result.", earnedBy: ["t-canopy", "t-delta"] },
  { id: "aw-cleanest-cleanup", name: "Cleanest Cleanup", icon: "sparkles", desc: "Left the bench spotless and the materials reset.", earnedBy: ["t-root"] },
  { id: "aw-most-creative", name: "Most Creative Design", icon: "idea", desc: "The most original approach that still met the win condition.", earnedBy: ["t-photon"] },
  { id: "aw-comeback", name: "Comeback of the Day", icon: "comeback", desc: "Earned the comeback bonus: a 20-point redesign gain or a strong evidence defense.", earnedBy: ["t-delta"] },
];

// Per-team ticket ledger: positive grants, negative redemptions. Balance is the
// running sum per team (see scoring.teamTickets).
export const SAMPLE_TICKETS = [
  { id: "tk-01", teamId: "t-moss", amount: 5, reason: "Cleanest cleanup", ts: "2026-06-23" },
  { id: "tk-02", teamId: "t-moss", amount: 3, reason: "Sharp question in debrief", ts: "2026-06-24" },
  { id: "tk-03", teamId: "t-canopy", amount: 4, reason: "Great teamwork", ts: "2026-06-23" },
  { id: "tk-04", teamId: "t-root", amount: 6, reason: "Best evidence defense", ts: "2026-06-25" },
  { id: "tk-05", teamId: "t-root", amount: -2, reason: "Redeemed: Sticker pack", pickedUpBy: "Sensor", ts: "2026-06-26" },
  { id: "tk-06", teamId: "t-delta", amount: 5, reason: "Comeback bonus", ts: "2026-07-08" },
  { id: "tk-07", teamId: "t-photon", amount: 3, reason: "Most creative design", ts: "2026-07-08" },
  { id: "tk-08", teamId: "t-vector", amount: 4, reason: "Safety streak", ts: "2026-07-09" },
  { id: "tk-09", teamId: "t-vector", amount: -1, reason: "Redeemed: Front of the lunch line", pickedUpBy: "Compass", ts: "2026-07-10" },
];

// The ticket store: rewards teams can redeem their tickets for. Cost is in tickets.
export const SAMPLE_CATALOG = [
  { id: "cat-sticker", name: "Sticker pack", cost: 2, desc: "A pack of camp science stickers." },
  { id: "cat-lunchline", name: "Front of the lunch line", cost: 3, desc: "Skip to the front of the lunch line once." },
  { id: "cat-playlist", name: "Pick the lab playlist", cost: 5, desc: "Your team picks the music for one work block." },
  { id: "cat-badge", name: "Custom team badge", cost: 6, desc: "A printed badge with your team emblem." },
  { id: "cat-warmup", name: "Lead the morning warm-up", cost: 8, desc: "Your team runs the morning warm-up activity." },
];

// The collections the "Load sample data" button overwrites. The kept-as-real
// collections (schedule, prizes, files, config) are intentionally not included:
// the sample only fills the participants, results, tickets, and the ticket store.
export const SAMPLE_DATA = {
  teams: SAMPLE_TEAMS,
  members: SAMPLE_MEMBERS,
  scores: SAMPLE_SCORES,
  achievements: SAMPLE_ACHIEVEMENTS,
  tickets: SAMPLE_TICKETS,
  catalog: SAMPLE_CATALOG,
};
