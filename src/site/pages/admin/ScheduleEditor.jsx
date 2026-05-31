// Schedule editor: the day-by-day plan for each camp week. This collection is
// nested: an array of DAYS, each with a label, camp, theme, and an inner array
// of BLOCKS (the timed activities). Day-level edits use the array helpers on the
// days list; block-level edits rebuild the inner blocks array and write it back
// with updateAt(days, i, { blocks: nextBlocks }), so a draft never aliases the
// store. A block with a station code is a scored activity; a block with no code
// is a field visit, lunch, or custom event.
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Btn } from "../../ui.jsx";
import {
  useEditor, useRefData, SaveBar, RowCard, AddButton, EmptyRows,
  TextField, TimeField, DatePickerField, SelectField, makeId, updateAt, removeAt, moveAt,
  dayLabelFromDate, dateFromDayLabel,
} from "./shared.jsx";

export default function ScheduleEditor() {
  const ed = useEditor("schedule");
  const { camps } = useRefData();
  const campOptions = camps.length
    ? camps.map((c) => ({ value: c.id, label: c.name }))
    : [{ value: "trees", label: "From Trees to Tech" }, { value: "pystem", label: "PY-STEM" }];
  // Block-level camp may be blank to inherit the day's camp (consumers read
  // b.camp || day.camp), so offer an explicit inherit option.
  const blockCampOptions = [{ value: "", label: "Inherit day" }, ...campOptions];

  const days = ed.draft;
  const setDay = (i, patch) => ed.setDraft(updateAt(days, i, patch));
  const campById = (campId) => camps.find((c) => c.id === campId);
  const campYear = (campId) => Number((campById(campId)?.startDate || "").slice(0, 4)) || 2026;
  const dayDate = (day) => day.date || dateFromDayLabel(day.day, campYear(day.camp));
  const setDayDate = (i, value) => setDay(i, { date: value, day: dayLabelFromDate(value) });

  function addDay() {
    ed.setDraft([...days, { day: "", camp: campOptions[0].value, theme: "", blocks: [] }]);
  }

  // Rebuild day i's blocks with one of the immutable helpers, then write the new
  // blocks array back onto that day.
  function setBlock(i, j, patch) {
    setDay(i, { blocks: updateAt(days[i].blocks || [], j, patch) });
  }
  function addBlock(i) {
    const blocks = days[i].blocks || [];
    // Carry the parent day's camp onto the block so a scored block keeps the
    // right camp tone everywhere a consumer reads the block-level camp.
    setDay(i, { blocks: [...blocks, { id: makeId("blk"), start: "", end: "", title: "", location: "", code: "", camp: days[i].camp }] });
  }
  function removeBlock(i, j) {
    setDay(i, { blocks: removeAt(days[i].blocks || [], j) });
  }
  function moveBlock(i, j, dir) {
    setDay(i, { blocks: moveAt(days[i].blocks || [], j, dir) });
  }

  return (
    <div>
      <div className="notice" role="note" style={{ marginBottom: 16 }}>
        Add one day at a time, then add the timed blocks for that day. Blocks
        inherit the day&apos;s camp unless changed. Use the calendar for dates and
        the time fields for 15-minute steps. Leave station code blank for lunch,
        field visits, or custom events.
      </div>

      {days.length === 0 && <EmptyRows>No schedule days yet. Add the first day to start building a week.</EmptyRows>}

      {days.map((d, i) => {
        const blocks = d.blocks || [];
        return (
          <RowCard
            key={i}
            onRemove={() => ed.setDraft(removeAt(days, i))}
            onUp={i > 0 ? () => ed.setDraft(moveAt(days, i, -1)) : undefined}
            onDown={i < days.length - 1 ? () => ed.setDraft(moveAt(days, i, 1)) : undefined}
            cols="2fr 1.5fr 2fr"
          >
            <DatePickerField
              label="Date"
              value={dayDate(d)}
              onChange={(v) => setDayDate(i, v)}
              startDate={campById(d.camp)?.startDate}
            />
            <SelectField label="Camp" value={d.camp} onChange={(v) => setDay(i, { camp: v })} options={campOptions} />
            <TextField label="Theme" value={d.theme} onChange={(v) => setDay(i, { theme: v })} placeholder="Orientation and bioenergy" />

            <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
              {blocks.length === 0 && (
                <EmptyRows>No blocks in this day yet. Add the first activity or event below.</EmptyRows>
              )}

              {blocks.map((b, j) => (
                <div key={b.id || j} className="adm-row schedule-block-row">
                  <div
                    className="adm-grid"
                    style={{
                      gridTemplateColumns:
                        "108px 108px minmax(160px, 2fr) minmax(126px, 1.2fr) minmax(124px, 1fr) minmax(98px, 0.8fr) 104px",
                    }}
                  >
                  <TimeField label="Start" value={b.start} onChange={(v) => setBlock(i, j, { start: v })} />
                  <TimeField label="End" value={b.end} onChange={(v) => setBlock(i, j, { end: v })} />
                  <TextField label="Title" value={b.title} onChange={(v) => setBlock(i, j, { title: v })} placeholder="Seed Dispersal Derby" />
                  <TextField label="Location" value={b.location} onChange={(v) => setBlock(i, j, { location: v })} placeholder="Field North" />
                  <SelectField
                    label="Camp"
                    value={b.camp || ""}
                    onChange={(v) => setBlock(i, j, { camp: v })}
                    options={blockCampOptions}
                  />
                  <TextField
                    label="Station code"
                    value={b.code}
                    onChange={(v) => setBlock(i, j, { code: v })}
                    placeholder="TTT-03"
                    mono
                  />
                    <div className="schedule-block-actions" aria-label="Block actions">
                      {j > 0 && (
                        <Btn variant="ghost" className="icon" onClick={() => moveBlock(i, j, -1)} aria-label="Move block up">
                          <ChevronUp size={14} aria-hidden="true" />
                        </Btn>
                      )}
                      {j < blocks.length - 1 && (
                        <Btn variant="ghost" className="icon" onClick={() => moveBlock(i, j, 1)} aria-label="Move block down">
                          <ChevronDown size={14} aria-hidden="true" />
                        </Btn>
                      )}
                      <Btn variant="ghost" className="icon" onClick={() => removeBlock(i, j)} aria-label="Remove block">
                        <Trash2 size={14} aria-hidden="true" />
                      </Btn>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 4 }}>
                <AddButton onClick={() => addBlock(i)}>Add activity / block</AddButton>
              </div>
            </div>
          </RowCard>
        );
      })}

      <div style={{ marginTop: 4 }}>
        <AddButton onClick={addDay}>Add day</AddButton>
      </div>

      <SaveBar ed={ed} />
    </div>
  );
}
