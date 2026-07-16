// Teams editor: add, edit, reorder, and remove the camp teams. Each team has a
// name, a camp, and an optional emblem keyword and motto. The team id is
// generated on add and kept out of the form UI; related collections reference it
// behind the scenes.
import { useState } from "react";
import {
  Atom, Bot, Box, CircuitBoard, Cog, Compass, Cpu, FlaskConical, Hammer,
  HeartPulse, Leaf, Lightbulb, Magnet, Microscope, RadioTower, Rocket, Sprout,
  Trees, Waves,
} from "lucide-react";
import {
  useEditor, useRefData, SaveBar, RowCard, AddButton, EmptyRows,
  TextField, SelectField, IconChoiceField, makeId, updateAt, removeAt, moveAt,
} from "./shared.jsx";
import { useCollection, useCollectionStatus } from "../../lib/store.js";
import { isWritableHydrationStatus } from "../../lib/supabaseConcurrency.js";
import {
  hasTeamReferences,
  teamReferenceSummary,
} from "../../lib/crossCollectionIntegrity.js";

const EMBLEM_OPTIONS = [
  { value: "circuit", label: "Circuit", Icon: CircuitBoard },
  { value: "leaf", label: "Leaf", Icon: Leaf },
  { value: "sprout", label: "Sprout", Icon: Sprout },
  { value: "wave", label: "Wave", Icon: Waves },
  { value: "light", label: "Light", Icon: Lightbulb },
  { value: "compass", label: "Compass", Icon: Compass },
  { value: "atom", label: "Atom", Icon: Atom },
  { value: "microscope", label: "Microscope", Icon: Microscope },
  { value: "flask", label: "Lab flask", Icon: FlaskConical },
  { value: "rocket", label: "Rocket", Icon: Rocket },
  { value: "bot", label: "Bot", Icon: Bot },
  { value: "gear", label: "Gear", Icon: Cog },
  { value: "trees", label: "Trees", Icon: Trees },
  { value: "cpu", label: "Chip", Icon: Cpu },
  { value: "heart", label: "Biomedical", Icon: HeartPulse },
  { value: "magnet", label: "Magnet", Icon: Magnet },
  { value: "box", label: "Build box", Icon: Box },
  { value: "hammer", label: "Maker", Icon: Hammer },
  { value: "signal", label: "Signal", Icon: RadioTower },
];

export default function TeamsEditor() {
  const ed = useEditor("teams");
  const { camps, members } = useRefData();
  const scores = useCollection("scores") || [];
  const tickets = useCollection("tickets") || [];
  const achievements = useCollection("achievements") || [];
  const membersStatus = useCollectionStatus("members");
  const scoresStatus = useCollectionStatus("scores");
  const ticketsStatus = useCollectionStatus("tickets");
  const achievementsStatus = useCollectionStatus("achievements");
  const [removalMessage, setRemovalMessage] = useState("");
  const campOptions = camps.length
    ? camps.map((c) => ({ value: c.id, label: c.name }))
    : [{ value: "trees", label: "From Trees to Tech" }, { value: "pystem", label: "PY-STEM" }];

  const teams = ed.draft;
  const set = (i, patch) => ed.setDraft(updateAt(teams, i, patch));

  // A saved camp id that no longer exists stays visible as a Missing option
  // instead of a blank select that the next change would silently overwrite.
  const campOptionsFor = (team) => (
    team.camp && !campOptions.some((opt) => opt.value === team.camp)
      ? [{ value: team.camp, label: `Missing: ${team.camp}` }, ...campOptions]
      : campOptions
  );

  function addTeam() {
    setRemovalMessage("");
    ed.setDraft([...teams, { id: makeId("t"), name: "", camp: campOptions[0].value, emblem: "circuit", motto: "" }]);
  }

  function removeTeam(team, index) {
    const unresolvedCollections = [
      ["Roster", membersStatus],
      ["Scores", scoresStatus],
      ["Tickets", ticketsStatus],
      ["Awards", achievementsStatus],
    ].filter(([, status]) => !isWritableHydrationStatus(status));

    if (unresolvedCollections.length > 0) {
      setRemovalMessage(
        `Cannot remove ${team.name || team.id || "this team"}. `
        + `Live ${unresolvedCollections.map(([name]) => name).join(", ")} data is not safely loaded, so its references cannot be checked. `
        + "Open those tabs and retry the live data before deleting a team.",
      );
      return;
    }

    const references = teamReferenceSummary(team.id, {
      members,
      scores,
      tickets,
      achievements,
    });
    if (hasTeamReferences(references)) {
      const labels = [
        [references.members, "roster alias", "roster aliases"],
        [references.scores, "score", "scores"],
        [references.tickets, "ticket entry", "ticket entries"],
        [references.achievementRecipients, "award recipient", "award recipients"],
      ]
        .filter(([count]) => count > 0)
        .map(([count, singular, plural]) => `${count} ${count === 1 ? singular : plural}`);
      setRemovalMessage(
        `Cannot remove ${team.name || team.id || "this team"}. It is still used by ${labels.join(", ")}. `
        + "Remove or reassign those records on the Roster, Scores, Tickets, and Awards tabs first.",
      );
      return;
    }

    setRemovalMessage("");
    ed.setDraft(removeAt(teams, index));
  }

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        Add each crew once, then use the Roster, Scores, Awards, and Tickets tabs
        to connect activity to that crew.
      </div>

      {removalMessage && (
        <div className="adm-err" role="alert" style={{ marginBottom: 16 }}>
          {removalMessage}
        </div>
      )}

      {teams.length === 0 && <EmptyRows>No teams yet. Add the first team to get started.</EmptyRows>}

      {teams.map((t, i) => (
        <RowCard
          key={t.id || i}
          entityLabel={t.name || t.id || `team ${i + 1}`}
          onRemove={() => removeTeam(t, i)}
          onUp={i > 0 ? () => ed.setDraft(moveAt(teams, i, -1)) : undefined}
          onDown={i < teams.length - 1 ? () => ed.setDraft(moveAt(teams, i, 1)) : undefined}
          cols="1fr"
        >
          <IconChoiceField
            label="Emblem"
            value={t.emblem}
            onChange={(v) => set(i, { emblem: v })}
            options={EMBLEM_OPTIONS}
            className="team-emblem-field"
          />
          <div className="team-main-grid">
            <TextField label="Team name" value={t.name} onChange={(v) => set(i, { name: v })} placeholder="Moss Circuit" />
            <SelectField label="Camp" value={t.camp} onChange={(v) => set(i, { camp: v })} options={campOptionsFor(t)} />
            <TextField label="Motto" value={t.motto} onChange={(v) => set(i, { motto: v })} placeholder="Power from the soil up." />
          </div>
        </RowCard>
      ))}

      <div style={{ marginTop: 4 }}>
        <AddButton onClick={addTeam}>Add team</AddButton>
      </div>

      <SaveBar ed={ed} />
    </div>
  );
}
