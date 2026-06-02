// Theme tokens, camp palettes (Trees / PY-STEM), and font helpers shared across the deck.

const T = {
  paper:    "#FFFFFF",        // surface (Temple): card fills + demo art stay white
  surface:  "#FAFAF8",        // warm shell background (matches site --paper); roots/headers/nav use this
  paper2:   "#F2F1EE",        // surfaceAlt
  paper3:   "#E7E6E2",        // deeper alt
  ink:      "#222222",        // text (Temple brand black)
  ink2:     "#5A564F",        // textMuted
  mute:     "#5A564F",        // textMuted
  mute2:    "#8A8D8F",        // textFaint (Temple silver)
  rule:     "#222222",
  rule12:   "rgba(34,34,34,.12)",
  rule22:   "rgba(34,34,34,.22)",
  rule06:   "rgba(34,34,34,.06)",
  warn:     "#C77A1F",        // amber: a fail never reads as the Cherry brand
  ok:       "#2E7D46",        // green
  // camp identity PRESERVED unchanged:
  treesInk: "#2a5736",
  treesAcc: "#b04a2f",
  pyInk:    "#1c3257",
  pyAcc:    "#A85F12",        // darkened amber so it passes WCAG AA as text on warm paper
  // site brand (Cherry) + AA-safe small-text status colors, used in SHELL chrome only:
  primary:     "#9D2235",
  primaryDark: "#7A1A29",
  primaryTint: "#F3E1E4",
  warnText:    "#8A5310",
  okText:      "#1E5C32",
};
const CAMP = {
  trees:  { ink: T.treesInk, acc: T.treesAcc, label: "From Trees to Tech",
            sub: "Field. Forest. Future.",
            tagline: "Nature as engineer: ecology, biomimicry, sensors, climate resilience." },
  pystem: { ink: T.pyInk,    acc: T.pyAcc,    label: "PY-STEM",
            sub: "Signal. System. Science.",
            tagline: "Applied STEM: biomedical, waves, optics, mechanics, materials, algorithms." },
};
const f = {
  display: (w, s, opts = {}) => ({
    fontFamily: "'Fraunces',Georgia,serif",
    fontWeight: w, fontSize: s,
    fontVariationSettings: `"opsz" ${opts.opsz || 80}, "SOFT" 50`,
    fontStyle: opts.italic ? "italic" : "normal",
    letterSpacing: opts.tracking != null ? opts.tracking : -0.012,
    lineHeight: opts.lh || 1.05,
  }),
  sans: (w, s, opts = {}) => ({
    fontFamily: "'Inter',system-ui,sans-serif",
    fontWeight: w, fontSize: s,
    letterSpacing: opts.tracking != null ? opts.tracking : 0,
    lineHeight: opts.lh || 1.5,
    textTransform: opts.upper ? "uppercase" : "none",
  }),
  mono: (w, s, opts = {}) => ({
    fontFamily: "'JetBrains Mono',ui-monospace,monospace",
    fontWeight: w, fontSize: s,
    letterSpacing: opts.tracking != null ? opts.tracking : 0,
    fontVariantNumeric: "tabular-nums",
    textTransform: opts.upper ? "uppercase" : "none",
  }),
};

export { T, CAMP, f };
