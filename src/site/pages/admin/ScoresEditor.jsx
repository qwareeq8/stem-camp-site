// Scores editor: add, edit, reorder, and remove the raw per-station scores that
// drive the leaderboard. Each row points at a team (teamId), names the station
// (code), and records the points earned. Rows have no id of their own, so the
// list index is the React key. teamTotals() later keeps only each team's best 9
// of 12, so the admin just enters every activity at face value here.
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Btn } from "../../ui.jsx";
import {
  useEditor, useRefData, SaveBar, RowCard, AddButton, EmptyRows,
  TextField, NumberField, SelectField, updateAt,
} from "./shared.jsx";

export default function ScoresEditor() {
  const ed = useEditor("scores");
  const { teams, codes } = useRefData();
  const [emptyStations, setEmptyStations] = useState([]);

  const teamOptions = teams.length
    ? teams.map((t) => ({ value: t.id, label: t.name || "Unnamed team" }))
    : [];
  const codeOptions = codes.map((c) => ({ value: c.code, label: `${c.code} — ${c.title}` }));
  const codeLabel = Object.fromEntries(codeOptions.map((c) => [c.value, c.label]));
  const codeOrder = Object.fromEntries(codeOptions.map((c, i) => [c.value, i]));

  const scores = ed.draft;
  const set = (i, patch) => ed.setDraft(updateAt(scores, i, patch));
  const scoreGroups = Object.values(scores.reduce((acc, score, index) => {
    const key = score.code || "";
    if (!acc[key]) acc[key] = { code: key, rows: [] };
    acc[key].rows.push({ score, index });
    return acc;
  }, {}));
  const scoreCodes = new Set(scoreGroups.map((group) => group.code));
  const groups = [
    ...scoreGroups,
    ...emptyStations
      .filter((code) => !scoreCodes.has(code))
      .map((code) => ({ code, rows: [], empty: true })),
  ].sort((a, b) => {
    const ai = codeOrder[a.code] ?? 9999;
    const bi = codeOrder[b.code] ?? 9999;
    if (ai !== bi) return ai - bi;
    return (codeLabel[a.code] || a.code).localeCompare(codeLabel[b.code] || b.code);
  });

  function addScore(code = codeOptions[0]?.value || "", teamId = teamOptions[0]?.value || "") {
    ed.setDraft([
      ...scores,
      { teamId, code, points: 0 },
    ]);
  }

  function addScoreToStation(code) {
    addScore(code);
  }

  function addAllTeamsToStation(code) {
    const existing = new Set(scores.filter((score) => score.code === code).map((score) => score.teamId));
    const rows = teamOptions
      .filter((team) => !existing.has(team.value))
      .map((team) => ({ teamId: team.value, code, points: 0 }));
    if (!rows.length) return;
    ed.setDraft([...scores, ...rows]);
    setEmptyStations((current) => current.filter((c) => c !== code));
  }

  function addStation() {
    const used = new Set([...scoreCodes, ...emptyStations]);
    const nextCode = codeOptions.find((option) => !used.has(option.value))?.value || "";
    setEmptyStations((current) => current.includes(nextCode) ? current : [...current, nextCode]);
  }

  function setStationCode(group, code) {
    if (group.empty) {
      setEmptyStations((current) => current.map((c) => (c === group.code ? code : c)));
      return;
    }
    const rows = group.rows;
    const indexes = new Set(rows.map((row) => row.index));
    ed.setDraft(scores.map((score, index) => (indexes.has(index) ? { ...score, code } : score)));
  }

  function removeScore(index) {
    ed.setDraft(scores.filter((_, i) => i !== index));
  }

  function removeStation(group) {
    if (group.empty) {
      setEmptyStations((current) => current.filter((code) => code !== group.code));
      return;
    }
    const rows = group.rows;
    const indexes = new Set(rows.map((row) => row.index));
    ed.setDraft(scores.filter((_, index) => !indexes.has(index)));
  }

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        Every activity is scored out of 100. Enter each station score here at face
        value; only a team's best 9 of 12 count toward the standings, and that math
        is automatic.
      </div>

      {groups.length === 0 && (
        <EmptyRows>No scores yet. Add a station, then add one team score or all teams.</EmptyRows>
      )}

      {groups.map((group) => (
          <RowCard
            key={group.code || "uncoded"}
            onRemove={() => removeStation(group)}
            cols="minmax(22ch, 42ch)"
          >
            {codeOptions.length ? (
              <SelectField
                label="Station"
                value={group.code}
                onChange={(v) => setStationCode(group, v)}
                options={codeOptions}
              />
            ) : (
              <TextField
                label="Station"
                value={group.code}
                onChange={(v) => setStationCode(group, v)}
                placeholder="S1"
                mono
                hint="No schedule blocks with codes yet; type the code by hand."
              />
            )}
            <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
              {group.rows.map(({ score, index }) => (
                <div key={index} className="adm-row schedule-block-row score-team-row">
                  <div className="adm-grid" style={{ gridTemplateColumns: "minmax(170px, 1fr) 96px 34px" }}>
                    <SelectField
                      label="Team"
                      value={score.teamId}
                      onChange={(v) => set(index, { teamId: v })}
                      options={teamOptions}
                      hint={teamOptions.length ? undefined : "Add teams on the Teams tab first."}
                    />
                    <NumberField
                      label="Points"
                      value={score.points}
                      onChange={(v) => set(index, { points: v })}
                      min={0}
                      max={100}
                      step={1}
                      placeholder="0"
                    />
                    <div className="field award-recipient-actions">
                      <Btn
                        variant="ghost"
                        className="icon"
                        onClick={() => removeScore(index)}
                        aria-label="Remove score"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </Btn>
                    </div>
                  </div>
                </div>
              ))}
              <div className="row" style={{ marginTop: 4, gap: 8 }}>
                <AddButton onClick={() => addScoreToStation(group.code)}>Add team score</AddButton>
                <AddButton onClick={() => addAllTeamsToStation(group.code)}>Add all teams</AddButton>
              </div>
            </div>
          </RowCard>
      ))}

      <div style={{ marginTop: 4 }}>
        <AddButton onClick={addStation}>Add station</AddButton>
      </div>

      <SaveBar ed={ed} />
    </div>
  );
}
