// Pure schedule-time helpers used by the landing page and its regression tests.
// Camp times are local to Temple's Pennsylvania campuses, so comparisons are
// deliberately evaluated in America/New_York rather than the viewer's zone.
const MONTHS = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const EASTERN_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function minutesOfDay(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value || "");
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

function easternNow(now) {
  const parts = Object.fromEntries(EASTERN_PARTS.formatToParts(now).map((part) => [part.type, part.value]));
  return {
    key: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function dateFromLabel(label, year) {
  const match = /\b([A-Z][a-z]{2})\s+(\d{1,2})\b/.exec(label || "");
  if (!match || MONTHS[match[1]] === undefined) return null;
  const normalizedYear = Number(year) || 2026;
  const month = String(MONTHS[match[1]] + 1).padStart(2, "0");
  const day = String(Number(match[2])).padStart(2, "0");
  return `${normalizedYear}-${month}-${day}`;
}

function normalizedScheduleDays(schedule, year) {
  return (schedule || [])
    .map((day) => ({ ...day, dateKey: day.date || dateFromLabel(day.day, year) }))
    .filter((day) => day.dateKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

export function upcomingSchedule(schedule, year, now = new Date()) {
  const current = easternNow(now);
  const days = normalizedScheduleDays(schedule, year);
  if (!days.length) return null;

  const index = days.findIndex((day) => day.dateKey >= current.key);
  if (index === -1) return null;
  const upcoming = days[index];
  if (upcoming.dateKey !== current.key) return upcoming;

  const blocks = (upcoming.blocks || []).filter((block) => minutesOfDay(block.end) >= current.minutes);
  if (blocks.length) return { ...upcoming, blocks };
  return index + 1 < days.length ? days[index + 1] : null;
}

export function isScheduleComplete(schedule, year, now = new Date()) {
  const days = normalizedScheduleDays(schedule, year);
  if (!days.length) return false;

  const current = easternNow(now);
  const lastDay = days[days.length - 1];
  if (current.key > lastDay.dateKey) return true;
  if (current.key < lastDay.dateKey) return false;

  return !(lastDay.blocks || []).some((block) => minutesOfDay(block.end) >= current.minutes);
}
