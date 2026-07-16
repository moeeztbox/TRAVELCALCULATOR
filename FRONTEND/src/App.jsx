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
      <Route path="/dashboard/customize-package" element={<PrivateRoute><CustomizePackage /></PrivateRoute>} />

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

  // The splash is driven purely by real auth state, not by route: it plays
  // once for the "nobody is logged in yet" experience (app start, or after
  // logging out), and is never shown once isAuthenticated is true — not on
  // the dashboard, not immediately after a successful login, not ever,
  // regardless of which route that login happened to occur on. Waiting for
  // `loading` to resolve before deciding (rather than guessing) is what
  // guarantees an already-logged-in user never sees even a brief flash of it.
  const [splashDismissed, setSplashDismissed] = useState(false);
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    // Logging out re-enters the "nobody is logged in" state — let the
    // splash play again for that next unauthenticated visit.
    if (wasAuthenticated.current && !isAuthenticated) {
      setSplashDismissed(false);
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  const showSplash = !loading && !isAuthenticated && !splashDismissed;

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
      {showSplash && (
        <SplashScreen onFinish={() => setSplashDismissed(true)} />
      )}
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
