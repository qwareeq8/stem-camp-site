// Renders the interactive deck as a viewport-locked route (see App.jsx): the
// route fills the height under the sticky nav with no page scroll and no footer,
// so the deck pins below the nav and its slides scroll inside the deck card
// rather than sliding under the nav. There is no separate fullscreen mode.
import DeckApp from "../../deck/index.js";

export default function DeckPage() {
  return (
    <div className="page deck-page">
      <div className="container">
        <div className="page-head">
          <div className="page-eyebrow">Interactive</div>
          <h1 className="page-title">Field deck</h1>
          <p className="page-sub" id="deck-host-hint">
            Pick a camp and a station. Inside a station, click the deck and use
            the arrow keys or the on-screen controls to move through slides.
          </p>
        </div>
        <div
          className="deck-host"
          tabIndex={-1}
          role="group"
          aria-label="Interactive field deck"
          aria-describedby="deck-host-hint"
        >
          <DeckApp />
        </div>
      </div>
    </div>
  );
}
