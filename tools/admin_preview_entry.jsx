// Preview entry for the admin form editors. Loads the sample data into the store
// as a local overlay, then renders every editor (each wrapped in an error
// boundary) so a headless run can confirm they render with no runtime errors and
// produce a screenshot. This is a dev harness only; it is never shipped.
import { Component } from "react";
import { createRoot } from "react-dom/client";
import { setCollection } from "../src/site/lib/store.js";
import { SAMPLE_DATA } from "../src/site/lib/sampleData.js";
import SetupEditor from "../src/site/pages/admin/SetupEditor.jsx";
import TeamsEditor from "../src/site/pages/admin/TeamsEditor.jsx";
import RosterEditor from "../src/site/pages/admin/RosterEditor.jsx";
import ScoresEditor from "../src/site/pages/admin/ScoresEditor.jsx";
import ScheduleEditor from "../src/site/pages/admin/ScheduleEditor.jsx";
import AwardsEditor from "../src/site/pages/admin/AwardsEditor.jsx";
import TicketsEditor from "../src/site/pages/admin/TicketsEditor.jsx";
import CatalogEditor from "../src/site/pages/admin/CatalogEditor.jsx";
import PrizesEditor from "../src/site/pages/admin/PrizesEditor.jsx";
import FilesEditor from "../src/site/pages/admin/FilesEditor.jsx";
import RawJsonEditor from "../src/site/pages/admin/RawJsonEditor.jsx";
import "../src/site/styles.css";

// Populate every collection the editors read so each render path exercises rows.
for (const [name, value] of Object.entries(SAMPLE_DATA)) setCollection(name, value);

class Boundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  render() {
    if (this.state.err) {
      return (
        <div data-crash="1" style={{ color: "#b00", fontFamily: "monospace", padding: 12, border: "2px solid #b00" }}>
          CRASH in {this.props.name}: {String(this.state.err && this.state.err.message)}
        </div>
      );
    }
    return this.props.children;
  }
}

const EDITORS = [
  ["Setup", SetupEditor],
  ["Teams", TeamsEditor],
  ["Roster", RosterEditor],
  ["Scores", ScoresEditor],
  ["Schedule", ScheduleEditor],
  ["Awards", AwardsEditor],
  ["Tickets", TicketsEditor],
  ["Catalog", CatalogEditor],
  ["Prizes", PrizesEditor],
  ["Files", FilesEditor],
  ["Advanced", RawJsonEditor],
];

createRoot(document.getElementById("root")).render(
  <div className="page">
    <div className="container">
      {EDITORS.map(([name, C]) => (
        <section key={name} style={{ marginBottom: 40 }}>
          <h2 className="page-title" style={{ fontSize: 28, margin: "24px 0 12px" }}>{name}</h2>
          <Boundary name={name}><C /></Boundary>
        </section>
      ))}
    </div>
  </div>,
);
