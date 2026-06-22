/**
 * ProtectedRoute.jsx
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to /login.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../redux/slices/authSlice";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (isAuthenticated === undefined) {
    return <LoadingSpinner fullPage />;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
