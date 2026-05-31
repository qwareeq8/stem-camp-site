// Teams editor: add, edit, reorder, and remove the camp teams. Each team has a
// name, a camp, and an optional emblem keyword and motto. The team id is
// generated on add and kept out of the form UI; related collections reference it
// behind the scenes.
import {
  Atom, Bot, Box, CircuitBoard, Cog, Compass, Cpu, FlaskConical, Hammer,
  HeartPulse, Leaf, Lightbulb, Magnet, Microscope, RadioTower, Rocket, Sprout,
  Trees, Waves,
} from "lucide-react";
import {
  useEditor, useRefData, SaveBar, RowCard, AddButton, EmptyRows,
  TextField, SelectField, IconChoiceField, makeId, updateAt, removeAt, moveAt,
} from "./shared.jsx";

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
  const { camps } = useRefData();
  const campOptions = camps.length
    ? camps.map((c) => ({ value: c.id, label: c.name }))
    : [{ value: "trees", label: "From Trees to Tech" }, { value: "pystem", label: "PY-STEM" }];

  const teams = ed.draft;
  const set = (i, patch) => ed.setDraft(updateAt(teams, i, patch));

  function addTeam() {
    ed.setDraft([...teams, { id: makeId("t"), name: "", camp: campOptions[0].value, emblem: "circuit", motto: "" }]);
  }

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        Add each crew once, then use the Roster, Scores, Awards, and Tickets tabs
        to connect activity to that crew.
      </div>

      {teams.length === 0 && <EmptyRows>No teams yet. Add the first team to get started.</EmptyRows>}

      {teams.map((t, i) => (
        <RowCard
          key={t.id || i}
          onRemove={() => ed.setDraft(removeAt(teams, i))}
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
            <SelectField label="Camp" value={t.camp} onChange={(v) => set(i, { camp: v })} options={campOptions} />
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
