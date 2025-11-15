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

// Forms for each dashboard section
import HotelForm from "./Components/Dashboard/DashboardForms/HotelForm";
import VisaForm from "./Components/Dashboard/DashboardForms/VisaForm";
import TicketForm from "./Components/Dashboard/DashboardForms/TicketForm";
import TransportForm from "./Components/Dashboard/DashboardForms/TransportForm";
import PackageForm from "./Components/Dashboard/DashboardForms/PackageForm";

import PrivateRoute from "./Routes/PrivateRoute";
import PublicRoute from "./Routes/PublicRoute";

const App = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar />}

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
              path="/dashboard/packages"
              element={
                <PrivateRoute>
                  <PackageForm />
                </PrivateRoute>
              }
            />

            {/* Catch-all */}
            <Route
              path="*"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </main>

        {isAuthenticated && <Footer />}
      </div>
    </Router>
  );
};

export default App;
