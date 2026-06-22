/**
 * authService.js
 * API calls for authentication endpoints.
 */

import api from "./api";

const authService = {
  /** Register a new user */
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /** Login and receive a JWT token */
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  /** Get current user profile (requires auth) */
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

export default authService;
