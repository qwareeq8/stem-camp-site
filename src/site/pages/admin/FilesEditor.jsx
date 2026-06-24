// Files editor: add, edit, reorder, and remove the downloadable camp resources.
// Each file has a name, a category, a type, a public path, a human-readable
// size, and a short description. The path is relative to public/, so the actual
// file must be placed under public/files for the download link to resolve.
import { useFileSize } from "../../lib/fileSize.js";
import {
  useEditor, SaveBar, RowCard, AddButton, EmptyRows,
  TextField, SelectField, TextAreaField, makeId, updateAt, removeAt, moveAt,
} from "./shared.jsx";

const CATEGORY_OPTIONS = ["Activity", "Packet", "Scoring", "Signage", "Program", "Logistics"];
const TYPE_OPTIONS = ["pdf", "docx", "xlsx", "csv", "other"];
const CAMP_OPTIONS = [
  { value: "", label: "Program-wide" },
  { value: "trees", label: "From Trees to Tech" },
  { value: "pystem", label: "PY-STEM" },
];
const KIND_OPTIONS = [
  { value: "", label: "Standalone" },
  { value: "handout", label: "Handout (campers)" },
  { value: "guide", label: "Guide (facilitators)" },
];

// Size is measured live from the served file, not stored, so this is a
// read-only display of the file's current size (see lib/fileSize).
function AutoSizeField({ path }) {
  const size = useFileSize(path);
  return (
    <div className="field">
      <label>Size</label>
      <div className="input date-summary" aria-live="polite">
        {path ? (size || "—") : "Add a path"}
      </div>
    </div>
  );
}

export default function FilesEditor() {
  const ed = useEditor("files");
  const files = ed.draft;
  const set = (i, patch) => ed.setDraft(updateAt(files, i, patch));

  function addFile() {
    ed.setDraft([
      ...files,
      { id: makeId("f"), name: "", category: "Activity", type: "pdf", path: "", desc: "", camp: "", code: "", kind: "" },
    ]);
  }

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        Files are the downloadable resources listed on the public Files page:
        station handouts, score sheets, signage, and logistics. Each entry just
        points at a path; the actual file must live under public/files so its
        download link resolves.
      </div>

      {files.length === 0 && (
        <EmptyRows>No files yet. Add the first resource to get started.</EmptyRows>
      )}

      {files.map((f, i) => (
        <RowCard
          key={f.id || i}
          onRemove={() => ed.setDraft(removeAt(files, i))}
          onUp={i > 0 ? () => ed.setDraft(moveAt(files, i, -1)) : undefined}
          onDown={i < files.length - 1 ? () => ed.setDraft(moveAt(files, i, 1)) : undefined}
          cols="minmax(180px, 2fr) minmax(110px, 1fr) minmax(90px, 0.8fr) minmax(105px, 0.8fr)"
        >
          <TextField
            label="Name"
            value={f.name}
            onChange={(v) => set(i, { name: v })}
            placeholder="PY-STEM Student Handout Packet"
          />
          <SelectField
            label="Category"
            value={f.category}
            onChange={(v) => set(i, { category: v })}
            options={CATEGORY_OPTIONS}
          />
          <SelectField
            label="Type"
            value={f.type}
            onChange={(v) => set(i, { type: v })}
            options={TYPE_OPTIONS}
          />
          <AutoSizeField path={f.path} />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Path"
              value={f.path}
              onChange={(v) => set(i, { path: v })}
              placeholder="files/handout.pdf"
              mono
            />
          </div>
          <div className="adm-grid" style={{ gridColumn: "1 / -1", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <SelectField
              label="Camp"
              value={f.camp || ""}
              onChange={(v) => set(i, { camp: v })}
              options={CAMP_OPTIONS}
            />
            <TextField
              label="Activity code"
              value={f.code || ""}
              onChange={(v) => set(i, { code: v.trim() })}
              placeholder="TTT-01"
              hint="Pairs a handout and guide on the Files page."
              mono
            />
            <SelectField
              label="Kind"
              value={f.kind || ""}
              onChange={(v) => set(i, { kind: v })}
              options={KIND_OPTIONS}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <TextAreaField
              label="Description"
              value={f.desc}
              onChange={(v) => set(i, { desc: v })}
              rows={2}
              placeholder="All twelve PY-STEM station handouts for campers."
            />
          </div>
        </RowCard>
      ))}

      <div style={{ marginTop: 4 }}>
        <AddButton onClick={addFile}>Add file</AddButton>
      </div>

      <SaveBar ed={ed} />
    </div>
  );
}
