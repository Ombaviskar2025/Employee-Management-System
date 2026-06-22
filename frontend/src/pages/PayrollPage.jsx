import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayroll, updatePayrollStatus, processAllPayroll, fetchMyPayroll } from "../redux/slices/payrollSlice";
import { selectUser } from "../redux/slices/authSlice";
import { FiDollarSign, FiCheckCircle, FiClock, FiActivity, FiPrinter } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";

const PayrollPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { records, loading } = useSelector((state) => state.payroll);
  const isHR = user?.role === "master_hr";

  const [selectedMonth, setSelectedMonth] = useState("June 2026");
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const months = ["June 2026", "May 2026", "April 2026", "March 2026"];

  useEffect(() => {
    if (isHR) {
      dispatch(fetchPayroll(selectedMonth));
    } else {
      dispatch(fetchMyPayroll());
    }
  }, [dispatch, isHR, selectedMonth]);

  const handleToggleStatus = (id, currentStatus) => {
    const status = currentStatus === "Paid" ? "Pending" : "Paid";
    dispatch(updatePayrollStatus({ id, status }));
  };

  const handleProcessAll = () => {
    if (window.confirm(`Are you sure you want to process all payroll for ${selectedMonth}?`)) {
      dispatch(processAllPayroll(selectedMonth));
    }
  };

  // Math totals for HR
  let totalPayroll = 0;
  let paidAmount = 0;
  let pendingAmount = 0;
  let paidCount = 0;
  let pendingCount = 0;

  if (isHR && records?.length > 0) {
    records.forEach((rec) => {
      const net = rec.netSalary || 0;
      totalPayroll += net;
      if (rec.status === "Paid") {
        paidAmount += net;
        paidCount++;
      } else {
        pendingAmount += net;
        pendingCount++;
      }
    });
  }

  const handlePrint = () => {
    window.print();
  };

  if (!isHR) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Payslips</h1>
            <p className="page-desc">View and download your monthly salary statements</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : records.length === 0 ? (
          <div className="card card--empty">
            <p>No payslip records found.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            <div className="card overflow-hidden">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Basic Salary</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r._id}>
                        <td className="font-semibold text-white">{r.month}</td>
                        <td>${r.basicSalary.toLocaleString()}</td>
                        <td>${r.allowances.toLocaleString()}</td>
                        <td>${r.deductions.toLocaleString()}</td>
                        <td className="text-white font-semibold">${r.netSalary.toLocaleString()}</td>
                        <td>
                          <span className={`badge badge--${r.status === "Paid" ? "success" : "warning"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn btn--sm btn--primary"
                            onClick={() => setSelectedPayslip(r)}
                          >
                            View Payslip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedPayslip && (
          <div className="modal-overlay">
            <div className="modal-card payslip-modal" style={{ maxWidth: "500px", background: "#0f172a", color: "white", padding: "24px" }}>
              <div id="print-area">
                <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
                  <h2 style={{ margin: 0, fontSize: "22px", color: "white" }}>HR Connect</h2>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>SALARY SLIP - {selectedPayslip.month}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px", fontSize: "14px" }}>
                  <div>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Employee Name:</span>
                    <div style={{ fontWeight: "600" }}>{user?.fullName || user?.name}</div>
                  </div>
                  <div>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Email:</span>
                    <div style={{ fontWeight: "600" }}>{user?.email}</div>
                  </div>
                  <div>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Department:</span>
                    <div style={{ fontWeight: "600" }}>{user?.department || "-"}</div>
                  </div>
                  <div>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Designation:</span>
                    <div style={{ fontWeight: "600" }}>{user?.designation || "-"}</div>
                  </div>
                </div>

                <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.05)", fontWeight: "600" }}>
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  <div style={{ padding: "14px", display: "grid", gap: "10px", fontSize: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Basic Salary</span>
                      <span>${selectedPayslip.basicSalary.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981" }}>
                      <span>Allowances (Housing & Travel)</span>
                      <span>+${selectedPayslip.allowances.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#ef4444" }}>
                      <span>Deductions (Taxes)</span>
                      <span>-${selectedPayslip.deductions.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "10px", fontWeight: "700", fontSize: "16px" }}>
                      <span>Net Pay</span>
                      <span>${selectedPayslip.netSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Status:</span>
                    <span className={`badge badge--${selectedPayslip.status === "Paid" ? "success" : "warning"}`} style={{ marginLeft: "8px" }}>
                      {selectedPayslip.status}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px" }}>
                <button className="btn" style={{ background: "#374151" }} onClick={() => setSelectedPayslip(null)}>
                  Close
                </button>
                <button className="btn btn--primary" onClick={handlePrint}>
                  <FiPrinter style={{ marginRight: "6px" }} /> Print Payslip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-desc">Process employee salaries and payouts</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="form-input"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ background: "#1a1f36", color: "white", width: "160px" }}
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button
            className="btn btn--primary"
            onClick={handleProcessAll}
            disabled={records.length === 0 || pendingCount === 0}
          >
            Process All Payroll
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px" }}>
          <div style={{ background: "rgba(99,102,241,0.2)", padding: "10px", borderRadius: "8px", color: "#6366f1" }}>
            <FiActivity size={24} />
          </div>
          <div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Total Monthly Payroll</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "white" }}>${totalPayroll.toLocaleString()}</div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px" }}>
          <div style={{ background: "rgba(16,185,129,0.2)", padding: "10px", borderRadius: "8px", color: "#10b981" }}>
            <FiCheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Total Paid ({paidCount})</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "white" }}>${paidAmount.toLocaleString()}</div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px" }}>
          <div style={{ background: "rgba(245,158,11,0.2)", padding: "10px", borderRadius: "8px", color: "#f59e0b" }}>
            <FiClock size={24} />
          </div>
          <div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Total Pending ({pendingCount})</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "white" }}>${pendingAmount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : records.length === 0 ? (
        <div className="card card--empty">
          <p>No payroll records found for this month.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Base Salary</th>
                  <th>Allowances (10%)</th>
                  <th>Deductions (5%)</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="font-semibold text-white">{r.employeeId?.fullName}</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{r.employeeId?.email}</div>
                    </td>
                    <td>${r.basicSalary.toLocaleString()}</td>
                    <td>${r.allowances.toLocaleString()}</td>
                    <td>${r.deductions.toLocaleString()}</td>
                    <td className="text-white font-semibold">${r.netSalary.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge--${r.status === "Paid" ? "success" : "warning"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn--sm"
                        style={{ background: r.status === "Paid" ? "#ef4444" : "#10b981", color: "white" }}
                        onClick={() => handleToggleStatus(r._id, r.status)}
                      >
                        {r.status === "Paid" ? "Mark Pending" : "Mark Paid"}
                      </button>
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

export default PayrollPage;
