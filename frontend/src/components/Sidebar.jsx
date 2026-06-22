/**
 * Sidebar.jsx
 * Left navigation sidebar with branding, nav links, actions, and user info.
 * HR Connect Midnight Indigo design.
 */

import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCreditCard,
  FiTrendingUp,
  FiSettings,
  FiPlus,
  FiHelpCircle,
  FiLogOut,
  FiX,
  FiUser
} from "react-icons/fi";
import useAuth from "../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", icon: FiHome, label: "Dashboard", adminOnly: true },
  { to: "/employees", icon: FiUsers, label: "Employees", adminOnly: true },
  { to: "/payroll", icon: FiCreditCard, label: "Payroll", adminOnly: true },
  { to: "/performance", icon: FiTrendingUp, label: "Performance", adminOnly: true },
  { to: "/settings", icon: FiSettings, label: "Settings", adminOnly: true },
  { to: "/profile", icon: FiUser, label: "My Profile" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAddEmployeeClick = () => {
    onClose();
    navigate("/employees?add=true");
  };

  const isMasterHr = user?.role === "master_hr";

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) {
      return isMasterHr;
    }
    return true;
  });

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
            <span className="sidebar__app-name">HR Connect</span>
            <span className="sidebar__app-sub">ENTERPRISE SUITE</span>
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
          {filteredNavItems.map(({ to, icon: Icon, label }) => (
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

          {/* Divider */}
          {isMasterHr && <div className="sidebar__divider" />}

          {/* Add Employee CTA Button */}
          {isMasterHr && (
            <button
              className="sidebar__action-btn"
              onClick={handleAddEmployeeClick}
              id="sidebar-add-employee-btn"
            >
              <FiPlus size={17} />
              <span>Add Employee</span>
            </button>
          )}
        </nav>

        {/* User info + links + logout */}
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
          
          <NavLink
            to="/help"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={onClose}
            style={{ marginTop: "4px" }}
          >
            <FiHelpCircle size={17} />
            <span>Help Center</span>
            <span className="sidebar__link-indicator" />
          </NavLink>

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
