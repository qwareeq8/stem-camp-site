// Site router and layout. Most routes flow in the normal scrolling page with the
// nav and footer. The deck route is the exception: it locks to the viewport
// (height = 100dvh minus the sticky nav, footer omitted) so the deck pins below
// the nav and its slides scroll inside the deck card instead of sliding under the
// sticky site nav. On mount the app hydrates every data collection from Supabase
// (PostgREST) so
// visitors see committed changes without a redeploy. A failed or invalid live
// read leaves the bundled fallback in place and raises a visible accuracy banner.
//
// The deck and the admin console are loaded lazily (React.lazy + Suspense): the
// deck's 66 Demo/Extra modules and the admin's form editors are pulled as separate
// async chunks only when their route is visited, so the initial bundle that every
// visitor downloads stays small.
import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { hydrateAll, useCollectionStatus } from "./lib/store.js";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";
import Home from "./pages/Home.jsx";
import Schedule from "./pages/Schedule.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Teams from "./pages/Teams.jsx";
import Achievements from "./pages/Achievements.jsx";
import Store from "./pages/Store.jsx";
import Files from "./pages/Files.jsx";
import NotFound from "./pages/NotFound.jsx";

const DeckPage = lazy(() => import("./pages/DeckPage.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));

// Minimal in-layout fallback shown while a lazy route chunk loads.
function RouteFallback() {
  return (
    <div className="page">
      <div className="container">
        <p className="muted mono" role="status" aria-live="polite" style={{ padding: "40px 0" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}

const PUBLIC_STATUS_LABELS = [
  ["teams", "teams"],
  ["members", "roster"],
  ["scores", "scores"],
  ["tickets", "tickets"],
  ["catalog", "store"],
  ["schedule", "schedule"],
  ["achievements", "awards"],
  ["prizes", "prizes"],
  ["files", "files"],
  ["config", "site setup"],
];

function DataFallbackBanner() {
  const statuses = {
    teams: useCollectionStatus("teams"),
    members: useCollectionStatus("members"),
    scores: useCollectionStatus("scores"),
    tickets: useCollectionStatus("tickets"),
    catalog: useCollectionStatus("catalog"),
    schedule: useCollectionStatus("schedule"),
    achievements: useCollectionStatus("achievements"),
    prizes: useCollectionStatus("prizes"),
    files: useCollectionStatus("files"),
    config: useCollectionStatus("config"),
  };
  const unavailable = PUBLIC_STATUS_LABELS
    .map(([name, label]) => ({ status: statuses[name], label }))
    .filter(({ status }) => status.state === "failed" || status.state === "invalid")
    .map(({ label }) => label);
  if (!unavailable.length) return null;
  return (
    <div className="data-fallback" role="alert">
      <div className="container">
        <strong>Live data unavailable.</strong>{" "}
        Bundled fallback is showing for {unavailable.join(", ")}. Do not treat it as the final live record until the connection is restored.
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Fire-and-forget: live data on success, bundled seed on any failure.
    hydrateAll();
  }, []);
  // The deck route is viewport-locked (see the layout note above); every other
  // route scrolls normally with a footer.
  const pathname = useLocation().pathname;
  const isDeck = pathname === "/deck";
  const showDataStatus = !isDeck && pathname !== "/admin";
  return (
    <>
      <Nav />
      {showDataStatus && <DataFallbackBanner />}
      <main className={isDeck ? "main-deck" : undefined}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/deck" element={<DeckPage />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/store" element={<Store />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/files" element={<Files />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isDeck && <Footer />}
    </>
  );
}
