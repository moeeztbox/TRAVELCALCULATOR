import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Footer from "./Components/Main/Footer";
import AppLayout from "./Components/Main/AppLayout";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import CustomizePackage from "./Pages/CustomizePackage";
import PackagesView from "./Pages/PackagesView";
import SplashScreen from "./Components/Main/SplashScreen";

// Forms for each dashboard section
import HotelForm from "./Components/Dashboard/DashboardForms/HotelForm";
import VisaForm from "./Components/Dashboard/DashboardForms/VisaForm";
import TicketForm from "./Components/Dashboard/DashboardForms/TicketForm";
import TransportForm from "./Components/Dashboard/DashboardForms/TransportForm";
import ListingsForm from "./Components/Dashboard/DashboardForms/ListingsForm";

// Listing Pages
import HotelList from "./Components/Dashboard/DashboardForms/ListingsFormCards/ListingsForm/HotelList";
import TransportList from "./Components/Dashboard/DashboardForms/ListingsFormCards/ListingsForm/TransportList";
import VisaList from "./Components/Dashboard/DashboardForms/ListingsFormCards/ListingsForm/VisaList";
import TicketList from "./Components/Dashboard/DashboardForms/ListingsFormCards/ListingsForm/TicketList";
import PackageList from "./Components/Dashboard/DashboardForms/ListingsFormCards/ListingsForm/PackageList";

import PrivateRoute from "./Routes/PrivateRoute";
import PublicRoute from "./Routes/PublicRoute";
import { useAuth } from "./context/AuthContext";

// All routes live here so they render identically inside either chrome.
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Private routes */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/dashboard/hotels" element={<PrivateRoute><HotelForm /></PrivateRoute>} />
      <Route path="/dashboard/visa" element={<PrivateRoute><VisaForm /></PrivateRoute>} />
      <Route path="/dashboard/tickets" element={<PrivateRoute><TicketForm /></PrivateRoute>} />
      <Route path="/dashboard/transport" element={<PrivateRoute><TransportForm /></PrivateRoute>} />
      <Route path="/dashboard/listings" element={<PrivateRoute><ListingsForm /></PrivateRoute>} />
      <Route path="/dashboard/packages" element={<PrivateRoute><PackagesView /></PrivateRoute>} />
      <Route
        path="/dashboard/customize-package"
        element={<Navigate to="/dashboard/customize-package/normal" replace />}
      />
      <Route path="/dashboard/customize-package/:tab" element={<PrivateRoute><CustomizePackage /></PrivateRoute>} />

      {/* Listing sub-routes */}
      <Route path="/dashboard/listings/hotels" element={<PrivateRoute><HotelList /></PrivateRoute>} />
      <Route path="/dashboard/listings/transport" element={<PrivateRoute><TransportList /></PrivateRoute>} />
      <Route path="/dashboard/listings/visa" element={<PrivateRoute><VisaList /></PrivateRoute>} />
      <Route path="/dashboard/listings/tickets" element={<PrivateRoute><TicketList /></PrivateRoute>} />
      <Route path="/dashboard/listings/packages" element={<PrivateRoute><PackageList /></PrivateRoute>} />

      {/* Catch-all */}
      <Route
        path="*"
        element={
          loading ? null : isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
};

// Chooses the chrome: the authenticated app shell (sidebar + topbar) for
// dashboard routes, or a clean public layout for Home/Login.
const AppChrome = () => {
  const { isAuthenticated, loading, sessionExpired, clearSessionExpired } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const inAppArea =
    isAuthenticated && location.pathname.startsWith("/dashboard");

  // The auto-logout timer (AuthContext) can fire from anywhere in the app —
  // when it does, send the user to /login with an explanatory message.
  useEffect(() => {
    if (sessionExpired) {
      navigate("/login", {
        replace: true,
        state: {
          message: "You've been logged out due to inactivity. Please log in again.",
        },
      });
      clearSessionExpired();
    }
  }, [sessionExpired, navigate, clearSessionExpired]);

  // The splash runs exactly once per app launch — a single, final decision
  // made the moment the initial auth check (`loading`) resolves, and never
  // revisited afterward. Logging out, a session timing out, or an
  // auto-logout never re-arms it; only a genuine app restart (fresh mount
  // of this component, i.e. a real relaunch) does. It's also scoped to the
  // Home route ("/") only — landing or reloading directly on /login (or
  // anywhere else) never shows it.
  const [showSplash, setShowSplash] = useState(false);
  const splashDecided = useRef(false);

  useEffect(() => {
    if (loading || splashDecided.current) return;
    splashDecided.current = true;
    // Only play it if nobody is logged in yet AND the very first screen for
    // this launch is Home — an already-authenticated cold start, or landing
    // straight on /login, never shows it.
    if (!isAuthenticated && location.pathname === "/") setShowSplash(true);
  }, [loading, isAuthenticated, location.pathname]);

  // If login completes while the splash is still mid-animation, cut it off
  // immediately rather than waiting for its own timer — never show it
  // after a successful login, under any circumstance.
  useEffect(() => {
    if (isAuthenticated) setShowSplash(false);
  }, [isAuthenticated]);

  const content = inAppArea ? (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  ) : (
    <div className="flex flex-col min-h-screen app-canvas">
      <main className="flex-1 flex flex-col">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {content}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppChrome />
    </Router>
  );
};

export default App;
