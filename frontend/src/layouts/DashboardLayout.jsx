/**
 * DashboardLayout.jsx
 * Main shell layout: Sidebar (left) + Navbar (top) + content area.
 * Manages sidebar open/close state and passes dark mode controls to Navbar.
 */

import { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useDarkMode from "../hooks/useDarkMode";
import useAuth from "../hooks/useAuth";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();
  const { user } = useAuth();
  const location = useLocation();

  // If user is employee, block them from super-admin pages
  const employeeRestrictedRoutes = [
    "/dashboard",
    "/employees",
    "/payroll",
    "/performance",
    "/settings"
  ];
  if (user?.role === "employee" && employeeRestrictedRoutes.includes(location.pathname)) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="layout__main">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          isDark={isDark}
          onDarkToggle={toggle}
        />

        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
