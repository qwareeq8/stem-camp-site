// Browser audit page for the MODULAR deck: render every Extra*/Demo* stacked.
import React from "react";
import { createRoot } from "react-dom/client";
import * as Deck from "../src/deck/index.js";

const NAMES = Object.keys(Deck).filter(
  (k) => /^(Extra|Demo)/.test(k) && typeof Deck[k] === "function"
);
function Cell({ name }) {
  const C = Deck[name];
  return React.createElement(
    "section",
    { "data-comp": name, style: { padding: 12, borderBottom: "1px solid #ddd" } },
    React.createElement("h3", { style: { font: "13px monospace" } }, name),
    React.createElement(C, {})
  );
}
function Audit() {
  return React.createElement("div", null, NAMES.map((n) => React.createElement(Cell, { key: n, name: n })));
}
const el = document.getElementById("root");
if (el) createRoot(el).render(React.createElement(Audit));
