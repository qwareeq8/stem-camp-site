// Tickets editor: the per-team reward currency ledger. Each row is one grant or
// redemption ({ id, teamId, amount, reason, pickedUpBy, ts }); a team's balance is
// the running sum of its amounts. Tickets sit on top of the real points and awards
// as a camp-facing layer, so editing here never touches the scoring math. A balance
// summary at the top recomputes live from the draft as entries are edited.
//
// "Redeem a reward" pulls an item from the Catalog (the ticket store) and records
// the redemption as a negative ledger entry, including who physically picked the
// reward up (an alias), so a redemption is an auditable pickup, not just a deduction.
import { useState } from "react";
import {
  useEditor, useRefData, SaveBar, RowCard, AddButton, EmptyRows,
  TextField, DatePickerField, SelectField, NumberField, makeId, updateAt, removeAt, moveAt,
} from "./shared.jsx";
import { Btn } from "../../ui.jsx";
import { Ticket } from "lucide-react";

export default function TicketsEditor() {
  const ed = useEditor("tickets");
  const { teams, members, catalog } = useRefData();

  const teamOptions = teams.length
    ? teams.map((t) => ({ value: t.id, label: t.name || "Unnamed team" }))
    : [{ value: "", label: "(no teams yet)" }];
  const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
  function pickupOptionsForTeam(teamId, value = "") {
    const rows = members.filter((m) => m.teamId === teamId);
    const options = [
      { value: "", label: rows.length ? "No pickup" : "No roster aliases" },
      ...rows.map((m) => {
      const team = teamById[m.teamId];
      return {
        value: m.name || "",
        label: `${m.name || "Unnamed alias"}${team ? ` (${team.name || "team"})` : ""}`,
      };
      }).filter((m) => m.value),
    ];
    if (value && !options.some((opt) => opt.value === value)) return [{ value, label: value }, ...options];
    return options;
  }

  const entries = ed.draft;
  const set = (i, patch) => ed.setDraft(updateAt(entries, i, patch));

  // Running balance per team id, summed from the live draft.
  const balances = {};
  for (const e of entries) {
    balances[e.teamId] = (balances[e.teamId] || 0) + (Number(e.amount) || 0);
  }
  const teamName = (id) => (teams.find((t) => t.id === id) || {}).name || "Unnamed team";

  function addEntry() {
    ed.setDraft([
      ...entries,
      { id: makeId("tk"), teamId: teamOptions[0].value, amount: 1, reason: "", pickedUpBy: "", ts: "" },
    ]);
  }

  // ---- redeem from the catalog (the ticket store) ----
  const [redTeam, setRedTeam] = useState("");
  const [redItem, setRedItem] = useState("");
  const [pickedUpBy, setPickedUpBy] = useState("");
  const canRedeem = teams.length > 0 && catalog.length > 0;
  const itemOptions = catalog.map((c) => ({ value: c.id, label: `${c.name || "Unnamed reward"} - ${Number(c.cost) || 0}` }));
  const redTeamId = redTeam || teamOptions[0].value;
  const redItemObj = catalog.find((c) => c.id === redItem) || catalog[0] || null;
  // Clamp to >=0 so a misconfigured negative catalog cost can never turn a
  // redemption into a ticket grant (the raw-JSON editor can bypass the cost field's min).
  const redCost = redItemObj ? Math.max(0, Number(redItemObj.cost) || 0) : 0;
  const redBalance = balances[redTeamId] || 0;
  const shortfall = canRedeem && redItemObj && redCost > redBalance;
  // The catalog `limit` is a soft per-team cap (a hint, not enforced): count how
  // many times this team already redeemed this reward and warn at/over the cap.
  const redLimit = redItemObj && redItemObj.limit != null && redItemObj.limit !== ""
    ? Number(redItemObj.limit)
    : null;
  const priorRedemptions = redItemObj
    ? entries.filter((e) => e.teamId === redTeamId && e.reason === `Redeemed: ${redItemObj.name || "Unnamed reward"}`).length
    : 0;
  const limitReached = redLimit != null && priorRedemptions >= redLimit;

  function redeem() {
    if (!canRedeem || !redItemObj || !redTeamId) return;
    ed.setDraft([
      ...entries,
      {
        id: makeId("tk"),
        teamId: redTeamId,
        amount: -redCost,
        reason: `Redeemed: ${redItemObj.name || "Unnamed reward"}`,
        pickedUpBy: pickedUpBy.trim(),
        ts: "",
      },
    ]);
    setPickedUpBy("");
  }

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        Tickets are a camp-facing reward currency that sits on top of the real
        points and awards. Each row is one ledger entry: a positive amount grants
        tickets, a negative amount redeems them. A team's balance is the running
        sum of its entries.
      </div>

      <div
        className="adm-row"
        style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {teams.length === 0 ? (
          <span className="muted" style={{ fontSize: 13 }}>
            Add teams on the Teams tab to track ticket balances.
          </span>
        ) : (
          teams.map((t) => (
            <span
              key={t.id}
              className="mono"
              style={{
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid var(--rule22)",
              }}
            >
              {t.name || "Unnamed team"}: {balances[t.id] || 0}
            </span>
          ))
        )}
      </div>

      {/* redeem from the catalog */}
      <div className="adm-row" style={{ marginBottom: 18 }}>
        <div className="adm-row-head">
          <Ticket size={14} aria-hidden="true" />
          <span className="mono" style={{ flex: 1 }}>Redeem a reward</span>
        </div>
        {!canRedeem ? (
          <span className="muted" style={{ fontSize: 13 }}>
            Add at least one team (Teams tab) and one reward (Catalog tab) to redeem from the store.
          </span>
        ) : (
          <>
            <div className="adm-grid" style={{ gridTemplateColumns: "1.5fr 2fr 1.5fr auto" }}>
              <SelectField
                label="Team"
                value={redTeamId}
                onChange={(v) => {
                  setRedTeam(v);
                  setPickedUpBy("");
                }}
                options={teamOptions}
              />
              <SelectField
                label="Reward"
                value={redItemObj ? redItemObj.id : ""}
                onChange={setRedItem}
                options={itemOptions}
              />
              <SelectField
                label="Picked up by"
                value={pickedUpBy}
                onChange={setPickedUpBy}
                options={pickupOptionsForTeam(redTeamId, pickedUpBy)}
              />
              <div className="field" style={{ justifyContent: "flex-end" }}>
                <Btn variant="accent" onClick={redeem}>Redeem</Btn>
              </div>
            </div>
            {redItemObj && (
              <p
                className="mono"
                style={{ fontSize: 12, margin: "10px 0 0", color: shortfall || limitReached ? "var(--warn-text)" : "var(--mute)" }}
              >
                Costs {redCost} {redCost === 1 ? "ticket" : "tickets"}. {teamName(redTeamId)} has {redBalance}.
                {redLimit != null ? ` Redeemed ${priorRedemptions} of ${redLimit} allowed.` : ""}
                {shortfall ? " This redemption would put the balance below zero." : ""}
                {limitReached ? " This team has reached this reward's limit." : ""}
                {" "}Redeeming appends a ledger entry below; review it, then Save.
              </p>
            )}
          </>
        )}
      </div>

      {entries.length === 0 && (
        <EmptyRows>No ticket entries yet. Add the first grant or redemption to get started.</EmptyRows>
      )}

      {entries.map((e, i) => (
        <RowCard
          key={e.id || i}
          onRemove={() => ed.setDraft(removeAt(entries, i))}
          onUp={i > 0 ? () => ed.setDraft(moveAt(entries, i, -1)) : undefined}
          onDown={i < entries.length - 1 ? () => ed.setDraft(moveAt(entries, i, 1)) : undefined}
          cols="2fr 1fr 2.4fr 1.6fr 1.4fr"
        >
          <SelectField
            label="Team"
            value={e.teamId}
            onChange={(v) => set(i, { teamId: v, pickedUpBy: "" })}
            options={teamOptions}
          />
          <NumberField
            label="Amount"
            value={e.amount}
            onChange={(v) => set(i, { amount: v })}
            step={1}
          />
          <TextField
            label="Reason"
            value={e.reason}
            onChange={(v) => set(i, { reason: v })}
            placeholder="Cleanest cleanup"
          />
          <SelectField
            label="Picked up by"
            value={e.pickedUpBy}
            onChange={(v) => set(i, { pickedUpBy: v })}
            options={pickupOptionsForTeam(e.teamId, e.pickedUpBy)}
          />
          <DatePickerField
            label="Date"
            value={e.ts}
            onChange={(v) => set(i, { ts: v })}
          />
        </RowCard>
      ))}

      <div style={{ marginTop: 4 }}>
        <AddButton onClick={addEntry}>Add ticket entry</AddButton>
      </div>

      <SaveBar ed={ed} />
    </div>
  );
}
