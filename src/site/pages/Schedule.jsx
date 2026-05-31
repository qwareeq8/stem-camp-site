// Schedule: two separate camp weeks at two campuses, each as its own section
// with a banner (camp name, dates, campus) and day-by-day station blocks. The
// filter focuses on one week or shows both. Camp dates and campus come from the
// config camps[] entries; each schedule day carries a camp id so the weeks never
// interleave.
import { useState } from "react";
import { useCollection, useConfig } from "../lib/store.js";
import { Page, Card, Badge, SectionTitle, CampBadge } from "../ui.jsx";

const FILTERS = [
  { id: "all", label: "Both weeks" },
  { id: "trees", label: "From Trees to Tech" },
  { id: "pystem", label: "PY-STEM" },
];

export default function Schedule() {
  const schedule = useCollection("schedule");
  const cfg = useConfig();
  const [filter, setFilter] = useState("all");
  const camps = (cfg.camps || []).filter((c) => filter === "all" || c.id === filter);

  return (
    <Page
      eyebrow="Daily plan"
      title="Schedule"
      sub="Two separate weeks at two campuses. Every activity is scored out of 100; the best 9 of 12 count toward the leaderboard."
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
                      className="row"
                      style={{ padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--rule12)" : "none" }}
                    >
                      <span className="mono muted" style={{ fontSize: 13, width: 110 }}>{b.start}&ndash;{b.end}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{b.title}</div>
                        {b.location && <div className="muted" style={{ fontSize: 13 }}>{b.location}</div>}
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
