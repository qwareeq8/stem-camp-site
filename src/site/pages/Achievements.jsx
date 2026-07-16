// Achievements: the eight daily and final awards from the camp's Reward and
// Competition Kit, plus the per-camp standings. Driven by the data layer
// (achievements, prizes, teams, roster aliases) -- no hardcoded seeds.
import { useCollection } from "../lib/store.js";
import { resolveAchievementRecipients } from "../lib/crossCollectionIntegrity.js";
import { Page, Card, Badge, SectionTitle, Empty } from "../ui.jsx";
import { Search, ShieldCheck, Wrench, Users, RefreshCw, Sparkles, Lightbulb, TrendingUp, Award } from "lucide-react";

// Map the data's icon strings onto lucide components. Award is the fallback.
const ICONS = {
  search: Search,
  shield: ShieldCheck,
  wrench: Wrench,
  users: Users,
  redesign: RefreshCw,
  sparkles: Sparkles,
  idea: Lightbulb,
  comeback: TrendingUp,
  award: Award,
};

// Tone the tier badge to mirror the field-notebook palette.
const TIER_TONE = { Camp: "ok", Growth: "warn" };

export default function Achievements() {
  const achievements = useCollection("achievements");
  const prizes = useCollection("prizes");
  const teams = useCollection("teams");
  const members = useCollection("members");

  return (
    <Page
      eyebrow="Field log"
      title="Achievements"
      sub="The camp's daily and final awards, and how the per-camp standings are decided."
    >
      <div className="notice" role="note" style={{ marginBottom: 18 }}>
        This page preserves the 2026 live-event override. Ordinary entries are scored out of 100 points for design, clean data, teamwork, and explanation, not just
        the fastest finish. The Friday Crank Championship is worth up to 300 points
        because teams built their machines all week; it always counts and is never canceled. A team&apos;s lowest quarter of other entered scores is canceled (shown crossed out on the
        leaderboard) and the rest count toward the standings, and a 20-point
        redesign improvement or a strong evidence defense earns a comeback bonus. Standings are posted as the
        top three plus a growth award per camp; individual score slips stay private. The original reviewed kit used best 9 of 12 primary stations, before the live additions.
      </div>

      <SectionTitle>Daily and final awards</SectionTitle>
      {achievements.length === 0 ? (
        <Empty>No awards logged yet.</Empty>
      ) : (
        <div className="grid auto">
          {achievements.map((a) => {
            const Icon = ICONS[a.icon] || Award;
            const earned = resolveAchievementRecipients(a.earnedBy, teams, members);
            const earnedCount = earned.reduce((sum, recipient) => sum + recipient.count, 0);
            const missingCount = earned
              .filter((recipient) => recipient.missing)
              .reduce((sum, recipient) => sum + recipient.count, 0);
            return (
              <Card key={a.id} ticks className="award-card">
                <div className="row" style={{ marginBottom: 12 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 38,
                      height: 38,
                      borderRadius: 9,
                      border: "1px solid var(--rule22)",
                      background: "var(--paper)",
                      color: "var(--accent)",
                    }}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <span className="spacer" />
                  <span className="meta">
                    {missingCount > 0
                      ? `${earnedCount} recorded / ${missingCount} missing`
                      : `${earnedCount} earned`}
                  </span>
                </div>
                <h3 style={{ fontSize: 21, marginBottom: 6 }}>{a.name}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>{a.desc}</p>
                <div className="row award-recipients" style={{ gap: 6 }}>
                  {earned.length === 0 ? (
                    <span className="mono muted" style={{ fontSize: 11 }}>Not yet awarded</span>
                  ) : (
                    earned.map((recipient) => {
                      return (
                        <Badge
                          key={recipient.key}
                          tone={recipient.missing ? "warn" : recipient.camp === "trees" ? "trees" : recipient.camp === "pystem" ? "py" : undefined}
                        >
                          {recipient.name}{recipient.count > 1 ? ` x${recipient.count}` : ""}
                        </Badge>
                      );
                    })
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <SectionTitle>Standings and growth awards</SectionTitle>
      {prizes.length === 0 ? (
        <Empty>No standings announced yet.</Empty>
      ) : (
        <div className="grid cols-2">
          {prizes.map((p) => (
            <Card key={p.id} className="award-card">
              <div className="row" style={{ marginBottom: 10 }}>
                <Badge tone={TIER_TONE[p.tier]}>{p.tier}</Badge>
                <span className="spacer" />
                <Award size={16} strokeWidth={1.75} aria-hidden="true" style={{ color: "var(--mute)" }} />
              </div>
              <h3 style={{ fontSize: 22, marginBottom: 6 }}>{p.name}</h3>
              <p style={{ margin: "0 0 10px", fontSize: 15 }}>{p.desc}</p>
              <div className="mono muted award-foot" style={{ fontSize: 12 }}>{p.criteria}</div>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
