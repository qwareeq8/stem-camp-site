// Files: the camp document library. Every station has a student handout (for
// campers) and an instructor guide (for facilitators); on top of that sit the
// printable packets, score sheets, signage, and program-wide guides. With ~77
// documents the page leans on grouping and search rather than a wall of cards:
// a camp filter narrows the set, a search box matches across names and codes,
// and per-activity documents collapse into one compact card with a Handout and
// a Guide link so the list stays scannable. Download links are built off
// BASE_URL so the static assets resolve under the GitHub Pages subpath.
import { useMemo, useState } from "react";
import { useCollection } from "../lib/store.js";
import { useFileSize, fileHref } from "../lib/fileSize.js";
import { Page, Badge, Btn, Empty } from "../ui.jsx";
import {
  FileText, FileSpreadsheet, FileType, Download, Search,
  BookOpen, ClipboardCheck, Layers, Tag, X, Printer,
} from "lucide-react";

const CAMP_FILTERS = [
  { id: "all", label: "All" },
  { id: "trees", label: "From Trees to Tech" },
  { id: "pystem", label: "PY-STEM" },
  { id: "program", label: "Program-wide" },
];

const CAMP_NAME = { trees: "From Trees to Tech", pystem: "PY-STEM" };
const CAMP_TONE = { trees: "trees", pystem: "py" };

// Type -> badge tone + icon, so each document reads at a glance.
const TYPE_META = {
  pdf: { tone: "warn", Icon: FileText },
  xlsx: { tone: "ok", Icon: FileSpreadsheet },
  csv: { tone: "ok", Icon: FileSpreadsheet },
  docx: { tone: "py", Icon: FileType },
};

// Per-activity kind -> button label + icon. Handouts are written for campers;
// guides are for facilitators.
const KIND_META = {
  handout: { label: "Handout", Icon: FileText },
  guide: { label: "Guide", Icon: BookOpen },
};

// Size is measured live from the served file (see lib/fileSize), so meta takes
// the already-resolved size string rather than reading a stored field.
const meta = (f, size) => `${(f.type || "file").toUpperCase()}${size ? ` · ${size}` : ""}`;

// A single-document card (program guides, packets, score sheets, signage).
function DocCard({ file }) {
  const { Icon } = TYPE_META[file.type] || { Icon: FileType };
  const size = useFileSize(file.path);
  const label = meta(file, size);
  return (
    <a className="doc-card" href={fileHref(file.path)} download
       aria-label={`Download ${file.name} (${label})`}>
      <div className="doc-row">
        <Icon size={17} aria-hidden="true" className="doc-icon" />
        <h3 className="doc-name">{file.name}</h3>
      </div>
      {file.desc && <p className="doc-desc">{file.desc}</p>}
      <div className="doc-foot">
        <span className="mono doc-meta">{label}</span>
        <span className="doc-get mono"><Download size={13} aria-hidden="true" /> Get</span>
      </div>
    </a>
  );
}

// One download button for an activity document, measuring its size live.
function DocBtn({ name, file, kind }) {
  const { label, Icon } = KIND_META[kind];
  const size = useFileSize(file.path);
  return (
    <Btn href={fileHref(file.path)} download variant="ghost" className="doc-dl"
         aria-label={`Download ${name} ${label.toLowerCase()} (${meta(file, size)})`}>
      <Icon size={13} aria-hidden="true" /> {label}
    </Btn>
  );
}

// One activity, with up to two documents (handout + guide) on a single card.
function ActivityCard({ code, camp, name, sub, docs }) {
  return (
    <div className="doc-card">
      <div className="doc-row">
        <Badge tone={CAMP_TONE[camp]}>{code}</Badge>
        <h3 className="doc-name">{name}</h3>
      </div>
      {sub && <p className="doc-desc">{sub}</p>}
      <div className="doc-actions">
        {["handout", "guide"].map((k) => {
          const f = docs[k];
          if (!f) return null;
          return <DocBtn key={k} name={name} file={f} kind={k} />;
        })}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, count, children }) {
  return (
    <section className="doc-section">
      <h2 className="section-title">
        {Icon && <Icon size={14} aria-hidden="true" />}
        {title}
        {count != null && <span className="doc-count">{count}</span>}
      </h2>
      {children}
    </section>
  );
}

export default function Files() {
  const files = useCollection("files");
  const [camp, setCamp] = useState("all");
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const matches = (f) =>
    !query ||
    [f.name, f.code, f.desc, f.category].some((v) => String(v || "").toLowerCase().includes(query));

  // Bucket the (filtered) files once.
  const view = useMemo(() => {
    const inCamp = (f) =>
      camp === "all" ||
      (camp === "program" ? !f.camp : f.camp === camp);
    const pool = files.filter((f) => inCamp(f) && matches(f));

    const program = pool.filter((f) => !f.camp);

    function campBucket(id) {
      const mine = pool.filter((f) => f.camp === id);
      const docs = mine.filter((f) => ["Packet", "Scoring", "Signage"].includes(f.category));
      const prints = mine.filter((f) => f.category === "Printable");
      // Group per-activity files by code, preserving first-seen (deck) order.
      const order = [];
      const byCode = {};
      for (const f of mine) {
        if (f.category !== "Activity" || !f.code) continue;
        if (!byCode[f.code]) { byCode[f.code] = { code: f.code, camp: id, name: f.name, sub: f.desc, docs: {} }; order.push(f.code); }
        if (f.kind) byCode[f.code].docs[f.kind] = f;
      }
      const acts = order.map((c) => byCode[c]);
      return {
        docs,
        prints,
        primary: acts.filter((a) => !a.code.includes("B-")),
        backup: acts.filter((a) => a.code.includes("B-")),
      };
    }
    return { program, trees: campBucket("trees"), pystem: campBucket("pystem") };
  }, [files, camp, query]);

  const showCamp = (id) => camp === "all" || camp === id;
  const showProgram = camp === "all" || camp === "program";

  const total =
    (showProgram ? view.program.length : 0) +
    ["trees", "pystem"].reduce((n, id) => {
      if (!showCamp(id)) return n;
      const b = view[id];
      return n + b.docs.length + b.prints.length + b.primary.length + b.backup.length;
    }, 0);

  return (
    <Page
      eyebrow="Resources"
      title="Files"
      sub="Every camp document in one place. Each station has a student handout for campers and an instructor guide for facilitators, plus printable packets, score sheets, signage, and program-wide guides."
    >
      <div className="files-toolbar">
        <div className="files-chips row" role="group" aria-label="Filter by camp">
          {CAMP_FILTERS.map((f) => (
            <button key={f.id} className={`btn ${camp === f.id ? "" : "ghost"}`}
                    onClick={() => setCamp(f.id)} aria-pressed={camp === f.id}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="files-search">
          <Search size={15} aria-hidden="true" className="files-search-icon" />
          <input
            className="input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search documents or codes"
            aria-label="Search documents"
          />
          {q && (
            <button className="files-search-clear" onClick={() => setQ("")} aria-label="Clear search">
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {total === 0 ? (
        <Empty>
          {query ? `No documents match "${q}".` : "No files yet."}
        </Empty>
      ) : (
        <>
          {showProgram && view.program.length > 0 && (
            <Section icon={Tag} title="Program-wide" count={view.program.length}>
              <div className="doc-grid">
                {view.program.map((f) => <DocCard key={f.id} file={f} />)}
              </div>
            </Section>
          )}

          {["trees", "pystem"].map((id) => {
            if (!showCamp(id)) return null;
            const b = view[id];
            if (!b.docs.length && !b.prints.length && !b.primary.length && !b.backup.length) return null;
            return (
              <div key={id} className="doc-camp">
                {camp === "all" && (
                  <h2 className="doc-camp-head">
                    <Badge tone={CAMP_TONE[id]}>{id === "trees" ? "Trees" : "PY-STEM"}</Badge>
                    {CAMP_NAME[id]}
                  </h2>
                )}
                {b.docs.length > 0 && (
                  <Section icon={Layers} title="Packets, scoring, and signage" count={b.docs.length}>
                    <div className="doc-grid">
                      {b.docs.map((f) => <DocCard key={f.id} file={f} />)}
                    </div>
                  </Section>
                )}
                {b.primary.length > 0 && (
                  <Section icon={ClipboardCheck} title="Station activities" count={b.primary.length}>
                    <div className="doc-grid">
                      {b.primary.map((a) => <ActivityCard key={a.code} {...a} />)}
                    </div>
                  </Section>
                )}
                {b.backup.length > 0 && (
                  <Section icon={ClipboardCheck} title="Backup activities" count={b.backup.length}>
                    <div className="doc-grid">
                      {b.backup.map((a) => <ActivityCard key={a.code} {...a} />)}
                    </div>
                  </Section>
                )}
                {b.prints.length > 0 && (
                  <Section icon={Printer} title="Station printables" count={b.prints.length}>
                    <div className="doc-grid">
                      {b.prints.map((f) => <DocCard key={f.id} file={f} />)}
                    </div>
                  </Section>
                )}
              </div>
            );
          })}
        </>
      )}
    </Page>
  );
}
