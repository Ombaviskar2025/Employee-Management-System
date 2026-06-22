/**
 * Navbar.jsx
 * Top navigation bar with breadcrumb, dark mode toggle, and user avatar.
 * HR Connect Midnight Indigo design.
 */

import { useLocation } from "react-router-dom";
import { FiMenu, FiSun, FiMoon, FiBell } from "react-icons/fi";
import useAuth from "../hooks/useAuth";

const BREADCRUMBS = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
};

const Navbar = ({ onMenuClick, isDark, onDarkToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  const pageTitle = BREADCRUMBS[location.pathname] || "EMS Pro";

  return (
    <header className="navbar">
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
          <span className="navbar__page">EMS Pro</span>
          <span className="navbar__separator">/</span>
          <span className="navbar__current">{pageTitle}</span>
        </div>
      </div>

      {/* Right: dark mode + notifications + avatar */}
      <div className="navbar__right">
        {/* Dark mode toggle */}
        <button
          className="navbar__icon-btn"
          onClick={onDarkToggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notifications */}
        <button className="navbar__icon-btn navbar__notif" aria-label="Notifications">
          <FiBell size={18} />
          <span className="navbar__notif-dot" />
        </button>

        <div className="navbar__divider" />

        {/* User avatar */}
        <div className="navbar__user">
          <div className="navbar__avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="navbar__user-info">
            <span className="navbar__user-name">{user?.name || "User"}</span>
            <span className="navbar__user-role">{user?.role || "user"}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
