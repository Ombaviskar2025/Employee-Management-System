/**
 * App.jsx
 * Root routing component.
 * Defines all routes and wraps protected areas with ProtectedRoute.
 */

import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import AttendancePage from "./pages/AttendancePage";
import LeavePage from "./pages/LeavePage";
import AnnouncementPage from "./pages/AnnouncementPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import DocumentPage from "./pages/DocumentPage";
import AuditLogPage from "./pages/AuditLogPage";

import LoginPage from "./pages/LoginPage";
import SuperHRLoginPage from "./pages/SuperHRLoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import PayrollPage from "./pages/PayrollPage";
import PerformancePage from "./pages/PerformancePage";
import SettingsPage from "./pages/SettingsPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import ProfilePage from "./pages/ProfilePage";
import DepartmentsPage from "./pages/DepartmentsPage";

function App() {
  // Initialize dark mode theme globally on mount
  useEffect(() => {
    const stored = localStorage.getItem("ems_dark_mode");
    const isDark =
      stored !== null
        ? stored === "true"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, []);

  return (
    <>
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/super-hr-login" element={<SuperHRLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected Routes — wrapped in DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/registrations" element={<RegistrationsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leaves" element={<LeavePage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/announcements" element={<AnnouncementPage />} />
            <Route path="/recruitment" element={<RecruitmentPage />} />
            <Route path="/documents" element={<DocumentPage />} />
            <Route path="/audit-logs" element={<AuditLogPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
