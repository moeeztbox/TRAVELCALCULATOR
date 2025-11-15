import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");

  // If not logged in, redirect to Home
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
