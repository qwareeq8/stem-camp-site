// Root application component wiring the home screen to the presentation.
import { useState } from "react";
import { Home } from "./Home.jsx";
import { Presentation } from "./Presentation.jsx";
import { CATMAP } from "./data/decks.js";
import { CAMP, T } from "./theme.js";

function App() {
  const [sel, setSel] = useState(null);
  const [camp, setCamp] = useState("trees");

  const enrich = (a) => ({
    ...a,
    campName: a.camp === "trees" ? "From Trees to Tech" : "PY-STEM",
    catLabel: CATMAP[a.cat] ? CATMAP[a.cat].l : a.cat,
  });
  const themeFor = (a) => CAMP[a.camp] || CAMP.trees;
  const onJump = (a) => { setCamp(a.camp || "trees"); setSel(a); };

  return (
    <div className="stemdeck" style={{ background: T.paper, color: T.ink }}>
      {sel ? (
        <Presentation
          key={sel.code}
          act={enrich(sel)}
          accent={themeFor(sel).acc}
          ink={themeFor(sel).ink}
          campKey={sel.camp}
          onBack={() => { setCamp(sel.camp); setSel(null); }}
          onJump={onJump}
        />
      ) : (
        <Home onSelect={setSel} camp={camp} setCamp={setCamp} />
      )}
    </div>
  );
}

export default App;
