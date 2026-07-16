// Schedule: two separate camp weeks at two campuses, each as its own section
// with a banner (camp name, dates, campus) and day-by-day station blocks. The
// filter focuses on one week or shows both. Camp dates and campus come from the
// config camps[] entries; each schedule day carries a camp id so the weeks never
// interleave.
import { useMemo, useState } from "react";
import { useCollection, useConfig } from "../lib/store.js";
import { Page, Card, Badge, SectionTitle, CampBadge, Empty } from "../ui.jsx";
import { FileText, BookOpen } from "lucide-react";

const FILTERS = [
  { id: "all", label: "Both weeks" },
  { id: "trees", label: "From Trees to Tech" },
  { id: "pystem", label: "PY-STEM" },
];

const docHref = (p) => `${import.meta.env.BASE_URL}${String(p).replace(/^\/+/, "")}`;

export default function Schedule() {
  const schedule = useCollection("schedule");
  const files = useCollection("files");
  const cfg = useConfig();
  const [filter, setFilter] = useState("all");
  const camps = (cfg.camps || []).filter((c) => filter === "all" || c.id === filter);
  // Whether any camp in the current view has schedule days; drives the empty state.
  const hasDays = camps.some((camp) => schedule.some((d) => d.camp === camp.id));

  // Map each station code to its handout and guide so a block can link straight
  // to its documents (see the Files page for the full library).
  const docsByCode = useMemo(() => {
    const m = {};
    for (const f of files) {
      if (f.category === "Activity" && f.code && f.kind) (m[f.code] ||= {})[f.kind] = f.path;
    }
    return m;
  }, [files]);

  return (
    <Page
      eyebrow="Daily plan"
      title="Schedule"
      sub="The 2026 actual itinerary for two separate camp weeks. The live event used a documented scoring override: ordinary entries were scored out of 100, the Friday Crank Championship was worth up to 300 and always counted, and each team's lowest quarter of other entered scores was canceled."
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
      {!hasDays && (
        <Empty>No schedule yet. The day-by-day plan appears here once it is published.</Empty>
      )}
      {camps.map((camp) => {
        const days = schedule.filter((d) => d.camp === camp.id);
        if (!days.length) return null;
        return (
          <section key={camp.id} style={{ marginBottom: 10 }}>
            <Card ticks padLg style={{ marginBottom: 16, background: "var(--paper2)" }}>
              <div className="row">
                <CampBadge camp={camp.id} />
                <span className="spacer" />
                <span className="meta">{days.length} days</span>
              </div>
              <h2 style={{ marginTop: 10, marginBottom: 4, fontSize: 24, color: camp.accent }}>{camp.name}</h2>
              {(camp.dates || camp.campus) && (
                <div className="mono muted" style={{ fontSize: 13 }}>
                  {camp.dates}
                  {camp.dates && camp.campus ? " · " : ""}
                  {camp.campus}
                </div>
              )}
            </Card>
            {days.map((day) => (
              <section key={day.day} style={{ marginBottom: 6 }}>
                <SectionTitle>
                  {day.day}
                  {day.theme ? ` · ${day.theme}` : ""}
                </SectionTitle>
                <Card style={{ marginBottom: 18 }}>
                  {(day.blocks || []).map((b, i, arr) => (
                    <div
                      key={(b.code || b.start || "") + "-" + i}
                      className="row sched-row"
                      style={{ padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--rule12)" : "none" }}
                    >
                      <span className="mono muted block-time" style={{ fontSize: 13 }}>{b.start}&ndash;{b.end}</span>
                      <div style={{ minWidth: 0 }}>
                        {/* Scored stations read as ink headings. Unscored break rows
                            (Lunch, showcases, defenses) stay muted so they sit quieter
                            than stations, but get a heavier weight so the title out-ranks
                            its own muted location subtext instead of blending into it. */}
                        <div style={{ fontWeight: b.code ? 500 : 600, color: b.code ? "var(--ink)" : "var(--mute)" }}>{b.title}</div>
                        {b.location && <div className="muted" style={{ fontSize: 13 }}>{b.location}</div>}
                        {(b.note || (b.scoreCode && b.scoreCode !== b.code)) && (
                          <div className="mono muted" style={{ fontSize: 16, marginTop: 4 }}>
                            {[
                              b.note,
                              b.scoreCode && b.scoreCode !== b.code ? `Leaderboard score key: ${b.scoreCode}` : "",
                            ].filter(Boolean).join(" · ")}
                          </div>
                        )}
                        {b.code && docsByCode[b.code] && (
                          <div className="row block-docs" style={{ gap: 12, marginTop: 5 }}>
                            {docsByCode[b.code].handout && (
                              <a className="block-doc mono" href={docHref(docsByCode[b.code].handout)} download aria-label={`Download ${b.code} handout`}>
                                <FileText size={12} aria-hidden="true" /> Handout
                              </a>
                            )}
                            {docsByCode[b.code].guide && (
                              <a className="block-doc mono" href={docHref(docsByCode[b.code].guide)} download aria-label={`Download ${b.code} guide`}>
                                <BookOpen size={12} aria-hidden="true" /> Guide
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      {b.code && <Badge tone={(b.camp || day.camp) === "trees" ? "trees" : "py"}>{b.code}</Badge>}
                    </div>
                  ))}
                </Card>
              </section>
            ))}
          </section>
        );
      })}
    </Page>
  );
}
