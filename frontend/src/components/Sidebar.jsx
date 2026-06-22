/**
 * Sidebar.jsx
 * Left navigation sidebar with branding, nav links, and user info.
 * HR Connect Midnight Indigo design.
 */

import { NavLink } from "react-router-dom";
import { FiHome, FiUsers, FiLogOut, FiX } from "react-icons/fi";
import useAuth from "../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", icon: FiHome, label: "Dashboard" },
  { to: "/employees", icon: FiUsers, label: "Employees" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        {/* Branding */}
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
              <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
              <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
              <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
            </svg>
          </div>
          <div className="sidebar__brand-text">
            <span className="sidebar__app-name">EMS Pro</span>
            <span className="sidebar__app-sub">HR Dashboard</span>
          </div>
          <button
            className="sidebar__close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="sidebar__nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
              onClick={onClose}
            >
              <Icon size={17} />
              <span>{label}</span>
              <span className="sidebar__link-indicator" />
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.name || "User"}</span>
              <span className="sidebar__user-email">{user?.email || ""}</span>
            </div>
          </div>
          <button
            className="sidebar__logout"
            onClick={logout}
            title="Log out"
            aria-label="Log out"
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
