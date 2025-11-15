import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");

  // If logged in, block access to public pages
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute;
