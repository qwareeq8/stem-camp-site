// Pure schedule-editor transitions live outside the React component so the
// inheritance contract can be regression-tested without a browser.

export function newScheduleBlock(makeId) {
  return {
    id: makeId("blk"),
    start: "",
    end: "",
    title: "",
    location: "",
    code: "",
    scoreCode: "",
    note: "",
    camp: "",
  };
}

export function changeScheduleDayCamp(day, nextCamp) {
  const previousCamp = day.camp;
  if (previousCamp === nextCamp) return day;

  return {
    ...day,
    camp: nextCamp,
    blocks: (day.blocks || []).map((block) => (
      block.camp === previousCamp
        ? { ...block, camp: "" }
        : block
    )),
  };
}
