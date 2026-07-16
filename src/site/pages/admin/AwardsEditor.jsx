// Awards editor: add, edit, reorder, and remove the camp's daily and final
// awards. Each award has a name, an icon keyword (drawn from the Achievements
// page icon set), a short description, and a recipient list. Recipients can be
// roster aliases or whole teams; older team-id entries are still understood.
import {
  Award, Lightbulb, RefreshCw, Search, ShieldCheck, Sparkles, Trash2,
  TrendingUp, Users, Wrench,
} from "lucide-react";
import { Btn } from "../../ui.jsx";
import {
  useEditor, useRefData, SaveBar, RowCard, AddButton, EmptyRows,
  TextField, SelectField, IconChoiceField, TextAreaField, NumberField, makeId, updateAt, removeAt, moveAt,
} from "./shared.jsx";

// Icon keys recognized by the Achievements page ICONS map; "award" is fallback.
const ICON_OPTIONS = [
  { value: "search", label: "Data detective", Icon: Search },
  { value: "shield", label: "Safety captain", Icon: ShieldCheck },
  { value: "wrench", label: "Prototype MVP", Icon: Wrench },
  { value: "users", label: "Best teammate", Icon: Users },
  { value: "redesign", label: "Best redesign", Icon: RefreshCw },
  { value: "sparkles", label: "Cleanest cleanup", Icon: Sparkles },
  { value: "idea", label: "Creative design", Icon: Lightbulb },
  { value: "comeback", label: "Comeback", Icon: TrendingUp },
  { value: "award", label: "Award", Icon: Award },
];

function normalizeRecipient(raw, teams, members) {
  if (typeof raw === "string") {
    const type = members.some((m) => m.id === raw) ? "member" : "team";
    return { type, id: raw, count: 1 };
  }
  if (!raw || typeof raw !== "object") return { type: "member", id: "", count: 1 };
  const type = raw.type || (raw.memberId ? "member" : "team");
  const id = raw.id || raw.memberId || raw.teamId || "";
  return { type, id, count: Math.max(1, Number(raw.count) || 1) };
}

function recipientValue(recipient) {
  return recipient.id ? `${recipient.type}:${recipient.id}` : "";
}

function recipientFromValue(value) {
  const [type, id] = String(value || "").split(":");
  return { type: type || "member", id: id || "", count: 1 };
}

export default function AwardsEditor() {
  const ed = useEditor("achievements");
  const { teams, members } = useRefData();
  const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
  const recipientOptions = [
    ...members.map((m) => {
      const team = teamById[m.teamId];
      return {
        value: `member:${m.id}`,
        label: `${m.name || "Unnamed alias"}${team ? ` (${team.name || "team"})` : ""}`,
      };
    }),
    ...teams.map((t) => ({ value: `team:${t.id}`, label: `Team: ${t.name || "Unnamed team"}` })),
  ];

  const awards = ed.draft;
  const set = (i, patch) => ed.setDraft(updateAt(awards, i, patch));

  function recipientsFor(i) {
    return (awards[i].earnedBy || []).map((r) => normalizeRecipient(r, teams, members));
  }

  function setRecipients(i, recipients) {
    set(i, { earnedBy: recipients });
  }

  function addRecipient(i) {
    const fallback = recipientOptions[0]?.value || "";
    setRecipients(i, [...recipientsFor(i), recipientFromValue(fallback)]);
  }

  function updateRecipient(i, j, patch) {
    const recipients = recipientsFor(i);
    setRecipients(i, updateAt(recipients, j, patch));
  }

  function removeRecipient(i, j) {
    setRecipients(i, removeAt(recipientsFor(i), j));
  }

  function addAward() {
    ed.setDraft([...awards, { id: makeId("aw"), name: "", icon: "award", desc: "", earnedBy: [] }]);
  }

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        These are the camp's daily and final awards. Give each one a name, an icon,
        and a short description, then add roster aliases or whole teams as recipients.
        Use Count when the same person or team earns it more than once. At final
        closeout, Save this tab, verify the public Achievements page, then use
        Advanced to download achievements.json before logging out.
      </div>

      {awards.length === 0 && <EmptyRows>No awards yet. Add the first award to get started.</EmptyRows>}

      {awards.map((a, i) => {
        const recipients = recipientsFor(i);
        return (
          <RowCard
            key={a.id || i}
            onRemove={() => ed.setDraft(removeAt(awards, i))}
            onUp={i > 0 ? () => ed.setDraft(moveAt(awards, i, -1)) : undefined}
            onDown={i < awards.length - 1 ? () => ed.setDraft(moveAt(awards, i, 1)) : undefined}
            cols="minmax(180px, 1.2fr) minmax(220px, 1.3fr)"
          >
            <TextField label="Name" value={a.name} onChange={(v) => set(i, { name: v })} placeholder="Data Detective" />
            <IconChoiceField label="Icon" value={a.icon} onChange={(v) => set(i, { icon: v })} options={ICON_OPTIONS} />
            <div style={{ gridColumn: "1 / -1" }}>
              <TextAreaField
                label="Description"
                value={a.desc}
                onChange={(v) => set(i, { desc: v })}
                rows={2}
                placeholder="Sharpest evidence of the day: clean data and an inference that holds up."
              />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Recipients</label>
              {recipientOptions.length === 0 ? (
                <span className="muted" style={{ fontSize: 11 }}>Add roster aliases or teams to assign winners.</span>
              ) : (
                <>
                  {recipients.length === 0 && (
                    <span className="muted" style={{ fontSize: 12 }}>No recipients yet.</span>
                  )}
                  <div className="award-recipient-list">
                    {recipients.map((recipient, j) => {
                      const currentValue = recipientValue(recipient);
                      const options = recipientOptions.some((opt) => opt.value === currentValue)
                        ? recipientOptions
                        : [{ value: currentValue, label: "Saved recipient" }, ...recipientOptions];
                      return (
                        <div key={`${currentValue || "recipient"}-${j}`} className="adm-row schedule-block-row award-recipient-row">
                          <div
                            className="adm-grid"
                            style={{ gridTemplateColumns: "minmax(180px, 1fr) 92px 34px" }}
                          >
                            <SelectField
                              label="Recipient"
                              value={currentValue}
                              onChange={(v) => updateRecipient(i, j, recipientFromValue(v))}
                              options={options}
                            />
                            <NumberField
                              label="Count"
                              value={recipient.count}
                              onChange={(v) => updateRecipient(i, j, { count: Math.max(1, Number(v) || 1) })}
                              min={1}
                              step={1}
                            />
                            <div className="field award-recipient-actions">
                              <Btn
                                variant="ghost"
                                className="icon"
                                onClick={() => removeRecipient(i, j)}
                                aria-label="Remove recipient"
                              >
                                <Trash2 size={14} aria-hidden="true" />
                              </Btn>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <AddButton onClick={() => addRecipient(i)}>Add recipient</AddButton>
                  </div>
                </>
              )}
            </div>
          </RowCard>
        );
      })}

      <div style={{ marginTop: 4 }}>
        <AddButton onClick={addAward}>Add award</AddButton>
      </div>

      <SaveBar ed={ed} />
    </div>
  );
}
