import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clockIn, clockOut, fetchMyAttendance, fetchAllAttendance, submitManualAttendance } from "../redux/slices/attendanceSlice";
import { fetchEmployees, selectEmployees } from "../redux/slices/employeeSlice";
import { selectUser } from "../redux/slices/authSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const AttendancePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { records, loading } = useSelector((state) => state.attendance);
  const employees = useSelector(selectEmployees);

  const isHR = user?.role === "master_hr";
  
  const [manualForm, setManualForm] = useState({
    employeeId: "",
    date: "",
    checkIn: "09:00",
    checkOut: "17:00",
    status: "Present",
  });
  
  const [showManualModal, setShowManualModal] = useState(false);

  useEffect(() => {
    if (isHR) {
      dispatch(fetchAllAttendance());
      dispatch(fetchEmployees({ limit: 100 }));
    } else {
      dispatch(fetchMyAttendance());
    }
  }, [dispatch, isHR]);

  const handleClockIn = () => {
    dispatch(clockIn());
  };

  const handleClockOut = () => {
    dispatch(clockOut());
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualForm.employeeId || !manualForm.date) {
      toast.error("Please fill in all fields");
      return;
    }
    dispatch(submitManualAttendance(manualForm));
    setShowManualModal(false);
  };

  // Check if clocked in today
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecord = records.find(r => r.date === todayStr || (r.date && r.date.startsWith(todayStr)));
  const isClockedIn = !!todayRecord;
  const isClockedOut = todayRecord && !!todayRecord.checkOut;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Attendance Tracking</h1>
          <p className="page-desc">{isHR ? "Monitor organization-wide daily logins" : "Log your check-in/out and view records"}</p>
        </div>
        
        {!isHR && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn"
              style={{ background: isClockedIn ? "#4b5563" : "#6366f1", color: "white" }}
              disabled={isClockedIn}
              onClick={handleClockIn}
            >
              Clock In
            </button>
            <button
              className="btn"
              style={{ background: !isClockedIn || isClockedOut ? "#4b5563" : "#ec4899", color: "white" }}
              disabled={!isClockedIn || isClockedOut}
              onClick={handleClockOut}
            >
              Clock Out
            </button>
          </div>
        )}

        {isHR && (
          <button className="btn btn--primary" onClick={() => {
            if (employees.length > 0) {
              setManualForm(prev => ({ ...prev, employeeId: employees[0]._id }));
            }
            setShowManualModal(true);
          }}>
            Manual Attendance Log
          </button>
        )}
      </div>

      {showManualModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "450px" }}>
            <h2 className="modal-title">Log Manual Attendance</h2>
            <form onSubmit={handleManualSubmit} style={{ display: "grid", gap: "12px" }}>
              <div>
                <label className="form-label">Employee</label>
                <select
                  className="form-input"
                  value={manualForm.employeeId}
                  onChange={(e) => setManualForm(prev => ({ ...prev, employeeId: e.target.value }))}
                  required
                  style={{ background: "#1a1f36", color: "white" }}
                >
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.department})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={manualForm.date}
                  onChange={(e) => setManualForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="form-label">Check-In Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={manualForm.checkIn}
                    onChange={(e) => setManualForm(prev => ({ ...prev, checkIn: e.target.value }))}
                    required
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <label className="form-label">Check-Out Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={manualForm.checkOut}
                    onChange={(e) => setManualForm(prev => ({ ...prev, checkOut: e.target.value }))}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={manualForm.status}
                  onChange={(e) => setManualForm(prev => ({ ...prev, status: e.target.value }))}
                  style={{ background: "#1a1f36", color: "white" }}
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-Day">Half-Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" className="btn" style={{ background: "#374151" }} onClick={() => setShowManualModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : records.length === 0 ? (
        <div className="card card--empty">
          <p>No attendance logs found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {isHR && <th>Employee</th>}
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration (Mins)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    {isHR && (
                      <td>
                        <div className="font-semibold text-white">{r.employeeId?.fullName || "Admin"}</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{r.employeeId?.email}</div>
                      </td>
                    )}
                    <td>{r.date}</td>
                    <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}</td>
                    <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-"}</td>
                    <td>{r.duration || "-"}</td>
                    <td>
                      <span className={`badge badge--${r.status === "Present" ? "success" : r.status === "Late" ? "warning" : r.status === "Half-Day" ? "info" : "danger"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
