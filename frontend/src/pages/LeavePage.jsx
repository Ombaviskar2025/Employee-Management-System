import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { applyLeave, fetchMyLeaves, fetchAllLeaves, updateLeaveStatus } from "../redux/slices/leaveSlice";
import { selectUser } from "../redux/slices/authSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const LeavePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { leaves, loading } = useSelector((state) => state.leaves);
  const isHR = user?.role === "master_hr";

  const [form, setForm] = useState({
    type: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    if (isHR) {
      dispatch(fetchAllLeaves());
    } else {
      dispatch(fetchMyLeaves());
    }
  }, [dispatch, isHR]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason) {
      toast.error("Please fill in all fields");
      return;
    }
    dispatch(applyLeave(form));
    setShowApplyModal(false);
    setForm({ type: "Casual", startDate: "", endDate: "", reason: "" });
  };

  const handleUpdateStatus = (id, status) => {
    if (window.confirm(`Are you sure you want to set this leave status to ${status}?`)) {
      dispatch(updateLeaveStatus({ id, status }));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-desc">{isHR ? "Review and approve leave applications" : "Apply for leaves and track approval status"}</p>
        </div>
        {!isHR && (
          <button className="btn btn--primary" onClick={() => setShowApplyModal(true)}>
            Apply for Leave
          </button>
        )}
      </div>

      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "450px" }}>
            <h2 className="modal-title">Apply for Leave</h2>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
              <div>
                <label className="form-label">Leave Type</label>
                <select
                  name="type"
                  className="form-input"
                  value={form.type}
                  onChange={handleChange}
                  required
                  style={{ background: "#1a1f36", color: "white" }}
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Maternity">Maternity Leave</option>
                  <option value="Paternity">Paternity Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-input"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-input"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Reason</label>
                <textarea
                  name="reason"
                  className="form-input"
                  rows="3"
                  placeholder="Explain the reason for leave..."
                  value={form.reason}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" className="btn" style={{ background: "#374151" }} onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : leaves.length === 0 ? (
        <div className="card card--empty">
          <p>No leave requests found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {isHR && <th>Employee</th>}
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {isHR && <th style={{ textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id}>
                    {isHR && (
                      <td>
                        <div className="font-semibold text-white">{l.employeeId?.fullName || "Employee"}</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{l.employeeId?.email}</div>
                      </td>
                    )}
                    <td>{l.type}</td>
                    <td>
                      {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td>{l.reason}</td>
                    <td>
                      <span className={`badge badge--${l.status === "Approved" ? "success" : l.status === "Pending" ? "warning" : "danger"}`}>
                        {l.status}
                      </span>
                    </td>
                    {isHR && (
                      <td>
                        {l.status === "Pending" ? (
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              className="btn btn--sm"
                              style={{ background: "#10b981", color: "white" }}
                              onClick={() => handleUpdateStatus(l._id, "Approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn--sm"
                              style={{ background: "#ef4444", color: "white" }}
                              onClick={() => handleUpdateStatus(l._id, "Rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div style={{ textAlign: "right", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Processed</div>
                        )}
                      </td>
                    )}
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

export default LeavePage;
