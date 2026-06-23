/**
 * Navbar.jsx
 * Top navigation bar with breadcrumb, dark mode toggle, bell notification dropdown, and user avatar.
 * HR Connect Midnight Indigo design.
 */

import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { FiMenu, FiSun, FiMoon, FiBell, FiCheckSquare, FiInfo, FiTrash2 } from "react-icons/fi";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import toast from "react-hot-toast";

const BREADCRUMBS = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/attendance": "Attendance",
  "/leaves": "Leaves",
  "/payroll": "Payroll",
  "/announcements": "Announcements",
  "/documents": "Documents",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings",
  "/profile": "My Profile",
  "/help": "Help Center",
  "/recruitment": "Recruitment",
  "/performance": "Performance"
};

const Navbar = ({ onMenuClick, isDark, onDarkToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  const pageTitle = BREADCRUMBS[location.pathname] || "EMS Pro";

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for live notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      const response = await api.put(`/notifications/${id}`);
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        toast.success("Notification read");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await api.put("/notifications/read-all");
      if (response.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All marked as read");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="navbar" style={{ position: "relative" }}>
      {/* Left: hamburger + breadcrumb */}
      <div className="navbar__left">
        <button
          className="navbar__menu-btn"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <FiMenu size={20} />
        </button>
        <div className="navbar__breadcrumb">
          <span className="navbar__page">HR Connect</span>
          <span className="navbar__separator">/</span>
          <span className="navbar__current">{pageTitle}</span>
        </div>
      </div>

      {/* Right: dark mode + notifications + avatar */}
      <div className="navbar__right" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Dark mode toggle */}
        <button
          className="navbar__icon-btn"
          onClick={onDarkToggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notifications Bell Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            className="navbar__icon-btn navbar__notif"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            aria-label="Notifications"
            style={{ position: "relative" }}
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  background: "var(--clr-primary, #6366f1)",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "bold",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #0f1015",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Glassmorphic Dropdown List */}
          {showNotifDropdown && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 12px)",
                right: 0,
                width: "320px",
                backgroundColor: "rgba(31, 31, 39, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                zIndex: 1000,
                overflow: "hidden",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--clr-primary, #6366f1)",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "rgba(255, 255, 255, 0.4)", fontSize: "13px" }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        backgroundColor: n.isRead ? "transparent" : "rgba(99, 102, 241, 0.04)",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onClick={() => handleMarkAsRead(n._id)}
                    >
                      <div style={{ display: "flex", justifyBetween: "space-between", gap: "8px" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: n.isRead ? 500 : 700,
                            color: n.isRead ? "rgba(255, 255, 255, 0.8)" : "white",
                          }}
                        >
                          {n.title}
                        </div>
                        {!n.isRead && (
                          <div
                            style={{
                              width: "6px",
                              height: "6px",
                              backgroundColor: "var(--clr-primary, #6366f1)",
                              borderRadius: "50%",
                              marginTop: "5px",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.3)", marginTop: "6px" }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="navbar__divider" />

        {/* User avatar */}
        <div className="navbar__user">
          <div className="navbar__avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="navbar__user-info">
            <span className="navbar__user-name">{user?.name || "User"}</span>
            <span className="navbar__user-role">{user?.role === "master_hr" ? "Master HR" : "Employee"}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
