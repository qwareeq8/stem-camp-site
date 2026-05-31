// Browser entry: mount the full modular deck App (home + presentation shell).
import React from "react";
import { createRoot } from "react-dom/client";
import App from "../src/deck/index.js";

const el = document.getElementById("root");
if (el) createRoot(el).render(React.createElement(App));
