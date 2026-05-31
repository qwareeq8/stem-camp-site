// Site entry: hash-routed React app (HashRouter is GitHub-Pages-safe -- no
// server rewrites needed for deep links).
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./site/App.jsx";
import "./site/styles.css";

createRoot(document.getElementById("root")).render(
  <HashRouter>
    <App />
  </HashRouter>
);
