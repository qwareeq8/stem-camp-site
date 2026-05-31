// Prizes editor: add, edit, reorder, and remove the per-camp standings and
// growth awards shown on the Achievements page. Each prize has a name, a tier
// ("Camp" or "Growth", which tones its badge), a short description, and the
// criteria line that explains how it is decided.
import {
  useEditor, SaveBar, RowCard, AddButton, EmptyRows,
  TextField, SelectField, TextAreaField, makeId, updateAt, removeAt, moveAt,
} from "./shared.jsx";

const TIER_OPTIONS = ["Camp", "Growth"];

export default function PrizesEditor() {
  const ed = useEditor("prizes");

  const prizes = ed.draft;
  const set = (i, patch) => ed.setDraft(updateAt(prizes, i, patch));

  function addPrize() {
    ed.setDraft([...prizes, { id: makeId("pz"), name: "", tier: "Camp", desc: "", criteria: "" }]);
  }

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        Prizes are the standings and growth awards on the Achievements page. Set a
        tier of "Camp" for the per-camp top-three standings or "Growth" for the
        most-improved award; the tier tones the badge. The criteria line explains
        how each award is decided.
      </div>

      {prizes.length === 0 && <EmptyRows>No prizes yet. Add the first award to get started.</EmptyRows>}

      {prizes.map((p, i) => (
        <RowCard
          key={p.id || i}
          onRemove={() => ed.setDraft(removeAt(prizes, i))}
          onUp={i > 0 ? () => ed.setDraft(moveAt(prizes, i, -1)) : undefined}
          onDown={i < prizes.length - 1 ? () => ed.setDraft(moveAt(prizes, i, 1)) : undefined}
          cols="2fr 1fr"
        >
          <TextField label="Name" value={p.name} onChange={(v) => set(i, { name: v })} placeholder="PY-STEM: Top Three" />
          <SelectField label="Tier" value={p.tier} onChange={(v) => set(i, { tier: v })} options={TIER_OPTIONS} />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextAreaField
              label="Description"
              value={p.desc}
              onChange={(v) => set(i, { desc: v })}
              rows={2}
              placeholder="The three highest-scoring PY-STEM teams of the week."
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Criteria"
              value={p.criteria}
              onChange={(v) => set(i, { criteria: v })}
              placeholder="Top three by best 9 of 12 station scores."
            />
          </div>
        </RowCard>
      ))}

      <div style={{ marginTop: 4 }}>
        <AddButton onClick={addPrize}>Add prize</AddButton>
      </div>

      <SaveBar ed={ed} />
    </div>
  );
}
