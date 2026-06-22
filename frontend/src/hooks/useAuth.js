/**
 * useAuth.js
 * Custom hook for accessing auth state and actions conveniently.
 */

import { useDispatch, useSelector } from "react-redux";
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  logout,
  clearError,
} from "../redux/slices/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    ...auth,
    user,
    isAuthenticated,
    loading,
    logout: handleLogout,
    clearError: handleClearError,
  };
};

export default useAuth;
