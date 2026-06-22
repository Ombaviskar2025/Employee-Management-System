/**
 * store.js
 * Redux Toolkit store configuration.
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import employeeReducer from "./slices/employeeSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ["auth/login/fulfilled", "auth/register/fulfilled"],
      },
    }),
  devTools: import.meta.env.DEV, // Enable Redux DevTools only in development
});

export default store;
