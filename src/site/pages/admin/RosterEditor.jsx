// Roster editor: add, edit, reorder, and remove camp members (the per-team
// roster). Each member has an alias display name, the team it rides with, and a
// role. PRIVACY: the database is publicly readable, so the alias is a display
// handle only, never a real camper name or any personal detail about a minor.
import { useEffect } from "react";
import {
  useEditor, useRefData, SaveBar, RowCard, AddButton, EmptyRows,
  TextField, SelectField, makeId, updateAt, removeAt, moveAt,
} from "./shared.jsx";

const ROLE_OPTIONS = [
  { value: "camper", label: "Camper" },
  { value: "counselor", label: "Counselor" },
];

export default function RosterEditor() {
  const ed = useEditor("members");
  const { teams } = useRefData();
  const teamOptions = teams.map((t) => ({ value: t.id, label: t.name || "Unnamed team" }));

  const members = ed.draft;
  const set = (i, patch) => ed.setDraft(updateAt(members, i, patch));

  useEffect(() => {
    const next = members.map((m) => (
      m.role === "counselor" && m.teamId ? { ...m, teamId: "" } : m
    ));
    if (JSON.stringify(next) !== JSON.stringify(members)) ed.setDraft(next);
  }, [members]);

  function addMember() {
    ed.setDraft([...members, { id: makeId("m"), name: "", teamId: teamOptions[0]?.value || "", role: "camper" }]);
  }

  function teamOptionsFor(member) {
    if (member.role === "counselor") return [{ value: "", label: "Not assigned" }];
    return teamOptions;
  }

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        This roster is publicly readable. Enter an alias or display handle only,
        never a real camper name and never any personal detail about a minor.
        Aliases like "Sparky", "Echo", or "Coach Vee" are perfect; a legal name
        is not.
      </div>

      {members.length === 0 && (
        <EmptyRows>
          {teamOptions.length === 0
            ? "Add a team first, then add roster aliases here."
            : "No members yet. Add the first alias to build a roster."}
        </EmptyRows>
      )}

      {members.map((m, i) => (
        <RowCard
          key={m.id || i}
          onRemove={() => ed.setDraft(removeAt(members, i))}
          onUp={i > 0 ? () => ed.setDraft(moveAt(members, i, -1)) : undefined}
          onDown={i < members.length - 1 ? () => ed.setDraft(moveAt(members, i, 1)) : undefined}
          cols="minmax(16ch, 22ch) minmax(14ch, 20ch) 11rem"
        >
          <TextField
            label="Alias (display name)"
            value={m.name}
            onChange={(v) => set(i, { name: v })}
            placeholder="Sparky"
          />
          <SelectField
            label="Team"
            value={m.role === "counselor" ? "" : m.teamId}
            onChange={(v) => set(i, { teamId: v })}
            options={teamOptionsFor(m)}
            disabled={m.role === "counselor"}
          />
          <SelectField
            label="Role"
            value={m.role}
            onChange={(v) => set(i, {
              role: v,
              teamId: v === "counselor" ? "" : m.teamId || teamOptions[0]?.value || "",
            })}
            options={ROLE_OPTIONS}
          />
        </RowCard>
      ))}

      <div style={{ marginTop: 4 }}>
        <AddButton onClick={addMember}>Add member</AddButton>
      </div>

      <SaveBar ed={ed} />
    </div>
  );
}
