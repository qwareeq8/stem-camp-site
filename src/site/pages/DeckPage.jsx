// Renders the interactive deck inside the normal site layout. Fullscreen mode is
// handled around the deck host, leaving the deck internals untouched.
import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import DeckApp from "../../deck/index.js";
import { Btn } from "../ui.jsx";

export default function DeckPage() {
  const hostRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);

  function enterFullscreen() {
    setFullscreen(true);
    hostRef.current?.focus();
    hostRef.current?.requestFullscreen?.().catch(() => {});
  }

  function exitFullscreen() {
    setFullscreen(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }

  useEffect(() => {
    function onFullscreenChange() {
      if (!document.fullscreenElement) setFullscreen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape" && fullscreen && !document.fullscreenElement) exitFullscreen();
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.toggle("deck-fullscreen-active", fullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("deck-fullscreen-active");
    };
  }, [fullscreen]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div className="row" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div className="page-eyebrow">Interactive</div>
              <h1 className="page-title">Field deck</h1>
              <p className="page-sub" id="deck-host-hint">
                Pick a camp and a station. Inside a station, click the deck and use
                the arrow keys or the on-screen controls to move through slides.
              </p>
            </div>
            <Btn variant="ghost" onClick={enterFullscreen}>
              <Maximize2 size={14} aria-hidden="true" /> Full screen
            </Btn>
          </div>
        </div>
        <div
          ref={hostRef}
          className={`deck-host${fullscreen ? " deck-host-fullscreen" : ""}`}
          tabIndex={-1}
          role="group"
          aria-label="Interactive field deck"
          aria-describedby="deck-host-hint"
        >
          {fullscreen && (
            <Btn
              variant="ghost"
              className="deck-fullscreen-exit"
              onClick={exitFullscreen}
              aria-label="Exit full screen"
            >
              <Minimize2 size={14} aria-hidden="true" /> Exit full screen
            </Btn>
          )}
          <DeckApp />
        </div>
      </div>
    </div>
  );
}
