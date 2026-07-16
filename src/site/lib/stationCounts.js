// Public-site station totals. Keep this small module independent of the deck so
// ordinary routes do not download the interactive presentation just to render
// three counts. The cross-cutting content test verifies these values against the
// canonical deck catalog.
export const PRIMARY_STATIONS_BY_CAMP = Object.freeze({
  trees: 12,
  pystem: 12,
});

export const PRIMARY_STATION_COUNT = Object.values(PRIMARY_STATIONS_BY_CAMP)
  .reduce((total, count) => total + count, 0);

export const BACKUP_STATION_COUNT = 9;
