/**
 * authSlice.js
 * Redux Toolkit slice for authentication state management.
 * Handles login, logout, register, and profile fetching.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import toast from "react-hot-toast";

// ── Load persisted user from localStorage ─────────────────────────────────────
const storedUser = localStorage.getItem("ems_user");
const initialUser = storedUser ? JSON.parse(storedUser) : null;

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData);
      // Persist to localStorage
      localStorage.setItem("ems_token", data.data.token);
      localStorage.setItem("ems_user", JSON.stringify(data.data));
      return data.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      // Persist to localStorage
      localStorage.setItem("ems_token", data.data.token);
      localStorage.setItem("ems_user", JSON.stringify(data.data));
      return data.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please check your credentials.";
      return rejectWithValue(message);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getProfile();
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch profile.";
      return rejectWithValue(message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,
    isAuthenticated: !!initialUser,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("ems_token");
      localStorage.removeItem("ems_user");
      toast.success("Logged out successfully");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Register ────────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        toast.success("Account created successfully! 🎉");
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Login ───────────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        toast.success(`Welcome back, ${action.payload.name}! 👋`);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Profile ─────────────────────────────────────────────────────────────
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
