import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Wait for the session check (/api/auth/me) before deciding to redirect,
  // otherwise a logged-in user would briefly bounce to Home on refresh.
  if (loading) return null;

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
