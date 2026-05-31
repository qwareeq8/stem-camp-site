// Files: camp resources grouped by category. Each row is a Card with a type
// badge, size, description, and a real download link built off BASE_URL so the
// static asset resolves under the GitHub Pages subpath.
import { useCollection } from "../lib/store.js";
import { Page, Card, Badge, Btn, SectionTitle, Empty } from "../ui.jsx";
import { FileText, FileSpreadsheet, FileType, Download } from "lucide-react";

// Stable display order for the category sections; anything unexpected falls in
// after these, in first-seen order.
const CATEGORY_ORDER = ["Handouts", "Scoring", "Signage", "Logistics"];

// Map a file type to a badge tone and an icon so the row reads at a glance.
const TYPE_META = {
  pdf: { tone: "warn", Icon: FileText },
  docx: { tone: "py", Icon: FileType },
  csv: { tone: "ok", Icon: FileSpreadsheet },
};

export default function Files() {
  const files = useCollection("files");

  // Collect categories in the canonical order first, then append any extras.
  const seen = new Set(files.map((f) => f.category));
  const categories = [
    ...CATEGORY_ORDER.filter((c) => seen.has(c)),
    ...[...seen].filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <Page
      eyebrow="Resources"
      title="Files"
      sub="Camp resources for facilitators and campers: station handouts, instructor guides, score sheets, signage, and the materials buy list."
    >
      {files.length === 0 ? (
        <Empty>No files yet.</Empty>
      ) : (
        categories.map((category) => {
          const group = files.filter((f) => f.category === category);
          if (group.length === 0) return null;
          return (
            <section key={category} style={{ marginBottom: 6 }}>
              <SectionTitle>
                {category} &middot; {group.length} {group.length === 1 ? "file" : "files"}
              </SectionTitle>
              <div className="grid cols-2">
                {group.map((file) => {
                  const meta = TYPE_META[file.type] || { tone: undefined, Icon: FileType };
                  const Icon = meta.Icon;
                  const type = file.type || "file";
                  // The download attribute forces a save only for same-origin assets;
                  // BASE_URL is relative (vite base "./"), so this stays same-origin.
                  const href = `${import.meta.env.BASE_URL}${file.path}`;
                  return (
                    <Card key={file.id}>
                      <div className="row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                        <Icon size={18} aria-hidden="true" style={{ color: "var(--mute)", marginTop: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: 18 }}>{file.name}</h3>
                          <div className="row" style={{ gap: 8, marginTop: 6 }}>
                            <Badge tone={meta.tone}>{type}</Badge>
                            <span className="mono muted" style={{ fontSize: 12 }}>{file.size}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: "12px 0 0", color: "var(--ink2)", fontSize: 14 }}>{file.desc}</p>
                      <div className="row" style={{ marginTop: 14 }}>
                        <Btn
                          href={href}
                          download
                          variant="ghost"
                          aria-label={`Download ${file.name} (${type.toUpperCase()}, ${file.size})`}
                        >
                          <Download size={14} aria-hidden="true" /> Download
                        </Btn>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </Page>
  );
}
