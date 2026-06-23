/**
 * DashboardPage.jsx
 * Main HR dashboard showing Real-time KPIs, Recharts Analytics,
 * Recent Activities, and Quick Admin Action buttons.
 * HR Connect Midnight Indigo design.
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiUserCheck, FiUserX, FiActivity,
  FiArrowRight, FiBarChart2, FiCalendar, FiClock, FiPlus, FiAlertCircle
} from "react-icons/fi";
import { fetchStats, selectStats } from "../redux/slices/employeeSlice";
import { selectUser } from "../redux/slices/authSlice";
import StatsCard from "../components/StatsCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

const monthlyAttendanceData = [
  { name: "Jan", Present: 92, Late: 5, Absent: 3 },
  { name: "Feb", Present: 94, Late: 4, Absent: 2 },
  { name: "Mar", Present: 90, Late: 7, Absent: 3 },
  { name: "Apr", Present: 95, Late: 3, Absent: 2 },
  { name: "May", Present: 93, Late: 5, Absent: 2 },
  { name: "Jun", Present: 96, Late: 3, Absent: 1 },
];

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

  // Prep Recharts data for department pie chart
  const departmentPieData = stats?.departmentStats?.map((d) => ({
    name: d._id,
    value: d.count,
  })) || [];

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">
            {greeting},{" "}
            <span className="text-gradient" style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {user?.name?.split(" ")[0]}
            </span>{" "}
            👋
          </h1>
          <p className="page-subtitle">
            Here&apos;s what&apos;s happening in your organization today.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn btn--primary"
            onClick={() => navigate("/employees")}
            id="goto-employees-btn"
          >
            <FiUsers size={16} />
            Manage Employees
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "24px" }}>
        <StatsCard
          icon={FiUsers}
          label="Total Employees"
          value={stats?.totalEmployees ?? "—"}
          color="blue"
          loading={statsLoading}
        />
        <StatsCard
          icon={FiUserCheck}
          label="Present Today"
          value={stats?.presentToday ?? "—"}
          color="green"
          loading={statsLoading}
        />
        <StatsCard
          icon={FiUserX}
          label="On Leave"
          value={stats?.onLeave ?? "—"}
          color="red"
          loading={statsLoading}
        />
        <StatsCard
          icon={FiAlertCircle}
          label="Pending Requests"
          value={stats?.pendingRequests ?? "—"}
          color="yellow"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="card" style={{ marginTop: "24px" }}>
        <div className="card__body" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", padding: "16px" }}>
          <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-muted)", marginRight: "12px" }}>Quick Admin Actions:</span>
          <button className="btn btn--sm" style={{ background: "#4f46e5", color: "white" }} onClick={() => navigate("/employees?add=true")}>
            <FiPlus size={14} style={{ marginRight: "4px" }} /> Add Employee
          </button>
          <button className="btn btn--sm" style={{ background: "#10b981", color: "white" }} onClick={() => navigate("/leaves")}>
            Approve Leaves
          </button>
          <button className="btn btn--sm" style={{ background: "#f59e0b", color: "white" }} onClick={() => navigate("/payroll")}>
            View Payroll
          </button>
          <button className="btn btn--sm" style={{ background: "#374151", color: "white" }} onClick={() => navigate("/audit-logs")}>
            View Reports
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", marginTop: "24px" }}>
        {/* Attendance Trends Bar Chart */}
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <FiCalendar size={18} /> Attendance Trends (%)
            </h2>
          </div>
          <div className="card__body" style={{ height: "300px", padding: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} />
                <ChartTooltip
                  contentStyle={{ backgroundColor: "#1f1f27", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ color: "white" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="Present" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Pie Chart */}
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <FiActivity size={18} /> Departments
            </h2>
          </div>
          <div className="card__body" style={{ height: "300px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {statsLoading ? (
              <LoadingSpinner size="sm" />
            ) : departmentPieData.length ? (
              <div style={{ width: "100%", height: "100%", position: "relative" }}>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={departmentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {departmentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      contentStyle={{ backgroundColor: "#1f1f27", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                  {departmentPieData.map((d, i) => (
                    <span key={d.name} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                      {d.name} ({d.value})
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="empty-state">No department statistics found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section: Recent hires & department breakdown */}
      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
        {/* Recent Hires Feed */}
        <div className="card">
          <div className="card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="card__title">
              <FiUsers size={18} /> Recently Added Employees
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
              <ul className="recent-list" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px" }}>
                {stats.recentEmployees.map((emp) => (
                  <li key={emp._id} className="recent-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="recent-item__avatar" style={{ margin: 0, width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--clr-primary, #6366f1)" }}>
                        {emp.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="recent-item__info">
                        <span className="recent-item__name" style={{ fontWeight: 600, display: "block", color: "white" }}>{emp.fullName}</span>
                        <span className="recent-item__meta" style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {emp.department} · {emp.designation}
                        </span>
                      </div>
                    </div>
                    <span className="recent-item__date" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                      {emp.createdAt
                        ? format(new Date(emp.createdAt), "dd MMM")
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

        {/* Detailed Department Table List */}
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <FiBarChart2 size={18} /> Department Headcount
            </h2>
          </div>
          <div className="card__body">
            {statsLoading ? (
              <LoadingSpinner size="sm" />
            ) : stats?.departmentStats?.length ? (
              <ul className="dept-list" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>
                {stats.departmentStats.map((d) => {
                  const pct = stats.totalEmployees
                    ? Math.round((d.count / stats.totalEmployees) * 100)
                    : 0;
                  return (
                    <li key={d._id} className="dept-item">
                      <div className="dept-item__top" style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span className="dept-item__name" style={{ fontWeight: 500, color: "white" }}>{d._id}</span>
                        <span className="dept-item__count" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{d.count} ({pct}%)</span>
                      </div>
                      <div className="dept-bar" style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                        <div
                          className="dept-bar__fill"
                          style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #a78bfa)", borderRadius: "3px" }}
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
