// Site router and layout. Most routes flow in the normal scrolling page with the
// nav and footer. The deck route is the exception: it locks to the viewport
// (height = 100dvh minus the sticky nav, footer omitted) so the deck pins below
// the nav and its slides scroll inside the deck card instead of sliding under the
// sticky site nav. On mount the app hydrates every data collection from Supabase
// (PostgREST) so
// visitors see committed changes without a redeploy; any failure silently leaves
// the bundled seed in place, so the public site always renders.
//
// The deck and the admin console are loaded lazily (React.lazy + Suspense): the
// deck's ~76 station modules and the admin's form editors are pulled as separate
// async chunks only when their route is visited, so the initial bundle that every
// visitor downloads stays small.
import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { hydrateAll } from "./lib/store.js";
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

export default function App() {
  useEffect(() => {
    // Fire-and-forget: live data on success, bundled seed on any failure.
    hydrateAll();
  }, []);
  // The deck route is viewport-locked (see the layout note above); every other
  // route scrolls normally with a footer.
  const isDeck = useLocation().pathname === "/deck";
  return (
    <>
      <Nav />
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
