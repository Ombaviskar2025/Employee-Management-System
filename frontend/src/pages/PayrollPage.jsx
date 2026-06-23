import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jsPDF } from "jspdf";
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

  const handleDownloadPDF = (payslip) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("HR Connect Enterprise", 20, 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Salary Slip - ${payslip.month}`, 20, 32);
    
    doc.setDrawColor(200);
    doc.line(20, 37, 190, 37);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text("Employee Details", 20, 47);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${user?.fullName || user?.name || "Employee"}`, 20, 55);
    doc.text(`Email: ${user?.email || ""}`, 20, 62);
    doc.text(`Department: ${user?.department || "-"}`, 20, 69);
    doc.text(`Designation: ${user?.designation || "-"}`, 20, 76);
    
    doc.setFont("helvetica", "bold");
    doc.text("Salary Breakdown", 20, 91);
    
    doc.setFont("helvetica", "normal");
    doc.rect(20, 96, 170, 60);
    
    doc.text("Description", 25, 103);
    doc.text("Amount", 145, 103);
    doc.line(20, 106, 190, 106);
    
    doc.text("Basic Salary", 25, 113);
    doc.text(`$${payslip.basicSalary.toLocaleString()}`, 145, 113);
    
    doc.text("House Rent Allowance (HRA)", 25, 120);
    doc.text(`$${(payslip.hra || 0).toLocaleString()}`, 145, 120);
    
    doc.text("Allowances", 25, 127);
    doc.text(`$${payslip.allowances.toLocaleString()}`, 145, 127);
    
    doc.text("Deductions", 25, 134);
    doc.text(`-$${payslip.deductions.toLocaleString()}`, 145, 134);
    
    doc.text("Taxes", 25, 141);
    doc.text(`-$${(payslip.tax || 0).toLocaleString()}`, 145, 141);
    
    doc.line(20, 146, 190, 146);
    
    doc.setFont("helvetica", "bold");
    doc.text("Net Pay (Received)", 25, 152);
    doc.text(`$${payslip.netSalary.toLocaleString()}`, 145, 152);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Payment Status: ${payslip.status}`, 20, 170);
    doc.text(`Generated Date: ${new Date(payslip.createdAt || Date.now()).toLocaleDateString()}`, 20, 177);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("This is an electronically generated payslip and requires no signature.", 20, 200);
    
    doc.save(`Payslip-${(user?.fullName || user?.name || "Employee").replace(/\s+/g, "_")}-${payslip.month.replace(/\s+/g, "_")}.pdf`);
  };

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
                    {selectedPayslip.hra !== undefined && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>HRA (House Rent)</span>
                        <span>+${selectedPayslip.hra.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981" }}>
                      <span>Allowances</span>
                      <span>+${selectedPayslip.allowances.toLocaleString()}</span>
                    </div>
                    {selectedPayslip.grossSalary !== undefined && (
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "6px", fontWeight: "600" }}>
                        <span>Gross Salary</span>
                        <span>${selectedPayslip.grossSalary.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedPayslip.tax !== undefined && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#ef4444" }}>
                        <span>Taxes (10%)</span>
                        <span>-${selectedPayslip.tax.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#ef4444" }}>
                      <span>Deductions</span>
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
                <button className="btn btn--primary" onClick={() => handleDownloadPDF(selectedPayslip)}>
                  Download PDF
                </button>
                <button className="btn" style={{ background: "var(--clr-primary, #6366f1)", color: "white" }} onClick={handlePrint}>
                  <FiPrinter style={{ marginRight: "6px" }} /> Print
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
