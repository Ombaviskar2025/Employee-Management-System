/**
 * DashboardPage.jsx
 * Main HR dashboard showing KPI stats and recent employees.
 * HR Connect Midnight Indigo design.
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiUserCheck, FiUserX, FiActivity,
  FiArrowRight, FiBarChart2,
} from "react-icons/fi";
import { fetchStats, selectStats } from "../redux/slices/employeeSlice";
import { selectUser } from "../redux/slices/authSlice";
import StatsCard from "../components/StatsCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { format } from "date-fns";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stats = useSelector(selectStats);
  const user = useSelector(selectUser);
  const statsLoading = useSelector((s) => s.employees.statsLoading);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Good morning"
      : greetingHour < 18
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {greeting},{" "}
            <span className="text-gradient">{user?.name?.split(" ")[0]}</span>{" "}
            👋
          </h1>
          <p className="page-subtitle">
            Here&apos;s what&apos;s happening in your organization today.
          </p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => navigate("/employees")}
          id="goto-employees-btn"
        >
          <FiUsers size={16} />
          Manage Employees
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatsCard
          icon={FiUsers}
          label="Total Employees"
          value={stats?.totalEmployees ?? "—"}
          color="blue"
          loading={statsLoading}
        />
        <StatsCard
          icon={FiUserCheck}
          label="Active Employees"
          value={stats?.activeEmployees ?? "—"}
          color="green"
          loading={statsLoading}
        />
        <StatsCard
          icon={FiUserX}
          label="Inactive Employees"
          value={stats?.inactiveEmployees ?? "—"}
          color="red"
          loading={statsLoading}
        />
        <StatsCard
          icon={FiActivity}
          label="Departments"
          value={stats?.departmentStats?.length ?? "—"}
          color="purple"
          loading={statsLoading}
        />
      </div>

      {/* Bottom section */}
      <div className="dashboard-grid">
        {/* Recent Employees */}
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <FiUsers size={18} /> Recently Added
            </h2>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => navigate("/employees")}
            >
              View all <FiArrowRight size={13} />
            </button>
          </div>
          <div className="card__body">
            {statsLoading ? (
              <LoadingSpinner size="sm" />
            ) : stats?.recentEmployees?.length ? (
              <ul className="recent-list">
                {stats.recentEmployees.map((emp) => (
                  <li key={emp._id} className="recent-item">
                    <div className="recent-item__avatar">
                      {emp.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="recent-item__info">
                      <span className="recent-item__name">{emp.fullName}</span>
                      <span className="recent-item__meta">
                        {emp.department} · {emp.designation}
                      </span>
                    </div>
                    <span className="recent-item__date">
                      {emp.joiningDate
                        ? format(new Date(emp.joiningDate), "dd MMM")
                        : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No employees yet. Add your first one!</p>
            )}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <FiBarChart2 size={18} /> By Department
            </h2>
          </div>
          <div className="card__body">
            {statsLoading ? (
              <LoadingSpinner size="sm" />
            ) : stats?.departmentStats?.length ? (
              <ul className="dept-list">
                {stats.departmentStats.map((d) => {
                  const pct = stats.totalEmployees
                    ? Math.round((d.count / stats.totalEmployees) * 100)
                    : 0;
                  return (
                    <li key={d._id} className="dept-item">
                      <div className="dept-item__top">
                        <span className="dept-item__name">{d._id}</span>
                        <span className="dept-item__count">{d.count}</span>
                      </div>
                      <div className="dept-bar">
                        <div
                          className="dept-bar__fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="empty-state">No department data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
