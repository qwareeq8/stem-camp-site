// Catalog editor: the ticket store. Each row is a reward teams can redeem their
// tickets for ({ id, name, cost, desc, limit }). The cost is a positive number of
// tickets; redeeming happens on the Tickets tab, which appends a negative ledger
// entry, so editing the catalog here never touches a team's balance directly. The
// catalog is the camp-facing layer on top of the real points and awards.
import {
  useEditor, SaveBar, RowCard, AddButton, EmptyRows,
  TextField, NumberField, TextAreaField, makeId, updateAt, removeAt, moveAt,
} from "./shared.jsx";

export default function CatalogEditor() {
  const ed = useEditor("catalog");

  const items = ed.draft;
  const set = (i, patch) => ed.setDraft(updateAt(items, i, patch));

  function addItem() {
    ed.setDraft([...items, { id: makeId("cat"), name: "", cost: 1, desc: "" }]);
  }

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        The ticket store: rewards teams can redeem their tickets for. Set a name
        and a cost in tickets. Teams spend tickets on the Tickets tab, where
        "Redeem a reward" records the matching negative ledger entry. The store is
        shown publicly on the Store page.
      </div>

      {items.length === 0 && (
        <EmptyRows>No rewards yet. Add the first item teams can redeem tickets for.</EmptyRows>
      )}

      {items.map((c, i) => (
        <RowCard
          key={c.id || i}
          onRemove={() => ed.setDraft(removeAt(items, i))}
          onUp={i > 0 ? () => ed.setDraft(moveAt(items, i, -1)) : undefined}
          onDown={i < items.length - 1 ? () => ed.setDraft(moveAt(items, i, 1)) : undefined}
          cols="3fr 1fr 1fr"
        >
          <TextField label="Reward" value={c.name} onChange={(v) => set(i, { name: v })} placeholder="Front of the lunch line" />
          <NumberField
            label="Cost (tickets)"
            value={c.cost}
            onChange={(v) => set(i, { cost: v })}
            min={0}
            step={1}
          />
          <NumberField
            label="Limit"
            value={c.limit}
            onChange={(v) => ed.setDraft(items.map((row, idx) => {
              // Clearing an optional number must DELETE the key, not set it to
              // undefined: the schema check uses hasOwnProperty, so an own
              // `limit: undefined` would fail validation and block Save.
              if (idx !== i) return row;
              const r = { ...row };
              if (v === "") delete r.limit; else r.limit = v;
              return r;
            }))}
            min={0}
            step={1}
          />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextAreaField
              label="Description"
              value={c.desc}
              onChange={(v) => set(i, { desc: v })}
              rows={2}
              placeholder="Skip to the front of the lunch line once."
            />
          </div>
        </RowCard>
      ))}

      <div style={{ marginTop: 4 }}>
        <AddButton onClick={addItem}>Add reward</AddButton>
      </div>

      <SaveBar ed={ed} />
    </div>
  );
}
