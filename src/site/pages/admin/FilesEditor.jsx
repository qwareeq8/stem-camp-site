// Files editor: add, edit, reorder, and remove the downloadable camp resources.
// Each file has a name, a category, a type, a public path, a human-readable
// stamped byte size, and a short description. The path is relative to public/, so the actual
// file must be placed under public/files for the download link to resolve.
import { useEffect } from "react";
import { measuredBytesFromProbe, useFileProbe } from "../../lib/fileSize.js";
import {
  useEditor, SaveBar, RowCard, AddButton, EmptyRows,
  TextField, SelectField, TextAreaField, makeId, updateAt, removeAt, moveAt,
} from "./shared.jsx";

const CATEGORY_OPTIONS = ["Activity", "Printable", "Packet", "Scoring", "Signage", "Program", "Logistics"];
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
  { value: "print", label: "Printable (station)" },
];

// A live row may predate the editor's vocabulary. Keep an unmatched stored
// value visible and selectable instead of letting the browser display the first
// option while the draft silently holds something else.
function withCurrentOption(options, current) {
  if (!current) return options;
  const hasCurrent = options.some((option) =>
    (typeof option === "string" ? option : option.value) === current);
  return hasCurrent ? options : [{ value: current, label: `Saved value: ${current}` }, ...options];
}

// Published files use stamped bytes; a newly entered path falls back to a HEAD
// request. This field is a read-only formatted display (see lib/fileSize).
function AutoSizeField({ path, bytes, onMeasured }) {
  const probe = useFileProbe(path, bytes);
  const measuredBytes = measuredBytesFromProbe(path, bytes, probe);
  useEffect(() => {
    if (measuredBytes > 0) onMeasured(measuredBytes);
  }, [measuredBytes, onMeasured]);

  let display = "Add a path";
  if (path && probe.status === "pending") display = "Checking…";
  else if (path && probe.status === "missing") display = "File not found";
  else if (path && probe.status === "unavailable") display = "Size unavailable";
  else if (path && probe.status === "ready") display = probe.size;

  return (
    <div className="field">
      <label>Size</label>
      <div className="input date-summary" aria-live="polite">
        {display}
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
            options={withCurrentOption(CATEGORY_OPTIONS, f.category)}
          />
          <SelectField
            label="Type"
            value={f.type}
            onChange={(v) => set(i, { type: v })}
            options={withCurrentOption(TYPE_OPTIONS, f.type)}
          />
          <AutoSizeField
            path={f.path}
            bytes={f.bytes}
            onMeasured={(measuredBytes) => set(i, { bytes: measuredBytes })}
          />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Path"
              value={f.path}
              onChange={(v) => set(i, { path: v, bytes: undefined })}
              placeholder="files/handout.pdf"
              mono
            />
          </div>
          <div className="adm-grid" style={{ gridColumn: "1 / -1", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <SelectField
              label="Camp"
              value={f.camp || ""}
              onChange={(v) => set(i, { camp: v })}
              options={withCurrentOption(CAMP_OPTIONS, f.camp)}
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
              options={withCurrentOption(KIND_OPTIONS, f.kind)}
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
