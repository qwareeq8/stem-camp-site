// Site theme: re-exports the deck's tokens so the site and the embedded deck
// share one palette, type system, and camp identity.
export { T, CAMP, f } from "../deck/theme.js";

// Site-level layout constants.
export const LAYOUT = {
  maxWidth: 1120,
  navHeight: 60,
};
