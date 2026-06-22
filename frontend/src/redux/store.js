/**
 * store.js
 * Redux Toolkit store configuration.
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import employeeReducer from "./slices/employeeSlice";
import attendanceReducer from "./slices/attendanceSlice";
import leaveReducer from "./slices/leaveSlice";
import payrollReducer from "./slices/payrollSlice";
import announcementReducer from "./slices/announcementSlice";
import recruitmentReducer from "./slices/recruitmentSlice";
import documentReducer from "./slices/documentSlice";
import auditLogReducer from "./slices/auditLogSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    attendance: attendanceReducer,
    leaves: leaveReducer,
    payroll: payrollReducer,
    announcements: announcementReducer,
    recruitment: recruitmentReducer,
    documents: documentReducer,
    auditLogs: auditLogReducer,
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
