import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./Components/Main/Navbar";
import Footer from "./Components/Main/Footer";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import CustomizePackage from "./Pages/CustomizePackage";
import PackagesView from "./Pages/PackagesView";

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

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Navbar is always visible; it shows Logout only when logged in */}
        <Navbar />

        <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
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
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/hotels"
              element={
                <PrivateRoute>
                  <HotelForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/visa"
              element={
                <PrivateRoute>
                  <VisaForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/tickets"
              element={
                <PrivateRoute>
                  <TicketForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/transport"
              element={
                <PrivateRoute>
                  <TransportForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/listings"
              element={
                <PrivateRoute>
                  <ListingsForm />
                </PrivateRoute>
              }
            />

            {/* Customize Package builder */}
            <Route
              path="/dashboard/customize-package"
              element={
                <PrivateRoute>
                  <CustomizePackage />
                </PrivateRoute>
              }
            />

            {/* User-facing Packages browsing page (reads the same data the
                admin manages under Listings → Packages, separate UI) */}
            <Route
              path="/dashboard/packages"
              element={
                <PrivateRoute>
                  <PackagesView />
                </PrivateRoute>
              }
            />

            {/* LISTING SUB-ROUTES */}
            <Route
              path="/dashboard/listings/hotels"
              element={
                <PrivateRoute>
                  <HotelList />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/listings/transport"
              element={
                <PrivateRoute>
                  <TransportList />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/listings/visa"
              element={
                <PrivateRoute>
                  <VisaList />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/listings/tickets"
              element={
                <PrivateRoute>
                  <TicketList />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/listings/packages"
              element={
                <PrivateRoute>
                  <PackageList />
                </PrivateRoute>
              }
            />

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
        </main>

        {/* Footer/copyright is always visible */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
