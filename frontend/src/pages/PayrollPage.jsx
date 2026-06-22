/**
 * PayrollPage.jsx
 * Displays employee salaries, calculates allowances/deductions/net pay,
 * and allows processing payroll.
 */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees, selectEmployees } from "../redux/slices/employeeSlice";
import { FiDollarSign, FiCheckCircle, FiClock, FiSettings, FiActivity } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const PayrollPage = () => {
  const dispatch = useDispatch();
  const employees = useSelector(selectEmployees);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentStatuses, setPaymentStatuses] = useState({});

  // Get settings from localStorage
  const currencySymbol = localStorage.getItem("ems_settings_currency") || "$";
  const taxRate = parseFloat(localStorage.getItem("ems_settings_tax_rate") || "5");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await dispatch(fetchEmployees({ limit: 100 }));
      setLoading(false);
    };
    loadData();
  }, [dispatch]);

  // Load status from local state or initialize
  useEffect(() => {
    if (employees?.length > 0) {
      const savedStatuses = localStorage.getItem("ems_payroll_statuses");
      if (savedStatuses) {
        setPaymentStatuses(JSON.parse(savedStatuses));
      } else {
        const initial = {};
        employees.forEach((emp) => {
          initial[emp._id] = "Pending";
        });
        setPaymentStatuses(initial);
        localStorage.setItem("ems_payroll_statuses", JSON.stringify(initial));
      }
    }
  }, [employees]);

  // Toggle individual status
  const toggleStatus = (id) => {
    const updated = {
      ...paymentStatuses,
      [id]: paymentStatuses[id] === "Paid" ? "Pending" : "Paid",
    };
    setPaymentStatuses(updated);
    localStorage.setItem("ems_payroll_statuses", JSON.stringify(updated));
    toast.success("Payroll status updated!");
  };

  // Process all payroll
  const handleProcessAll = () => {
    setProcessing(true);
    setTimeout(() => {
      const updated = {};
      employees.forEach((emp) => {
        updated[emp._id] = "Paid";
      });
      setPaymentStatuses(updated);
      localStorage.setItem("ems_payroll_statuses", JSON.stringify(updated));
      setProcessing(false);
      toast.success("All payroll processed and paid successfully! 💸");
    }, 1500);
  };

  // Math calculations
  const calculateDetails = (baseSalary) => {
    const allowance = baseSalary * 0.1; // 10%
    const deduction = baseSalary * (taxRate / 100); // from settings
    const netPay = baseSalary + allowance - deduction;
    return { allowance, deduction, netPay };
  };

  // Calculate overall totals
  let totalPayroll = 0;
  let paidAmount = 0;
  let pendingAmount = 0;
  let paidCount = 0;
  let pendingCount = 0;

  if (employees?.length > 0) {
    employees.forEach((emp) => {
      const base = emp.salary || 0;
      const { netPay } = calculateDetails(base);
      totalPayroll += netPay;
      const status = paymentStatuses[emp._id] || "Pending";
      if (status === "Paid") {
        paidAmount += netPay;
        paidCount++;
      } else {
        pendingAmount += netPay;
        pendingCount++;
      }
    });
  }

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-subtitle">Calculate net salaries, process payments, and track payout statuses.</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={handleProcessAll}
          disabled={processing || employees?.length === 0 || pendingCount === 0}
        >
          {processing ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <FiDollarSign size={16} />
              <span>Process All Payroll</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-card__orb stats-card__orb--blue">
            <FiActivity size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Total Monthly Payroll</span>
            <span className="stats-card__value">
              {currencySymbol}
              {totalPayroll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__orb stats-card__orb--green">
            <FiCheckCircle size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Total Paid ({paidCount})</span>
            <span className="stats-card__value">
              {currencySymbol}
              {paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__orb stats-card__orb--yellow">
            <FiClock size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Total Pending ({pendingCount})</span>
            <span className="stats-card__value">
              {currencySymbol}
              {pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="card" style={{ marginTop: "24px" }}>
        <div className="card__header">
          <h2 className="card__title">Employee Salary Breakdown</h2>
        </div>
        <div className="card__body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: "40px" }}>
              <LoadingSpinner size="md" />
            </div>
          ) : employees?.length === 0 ? (
            <p className="empty-state">No employees found. Add employees to process payroll.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Base Salary</th>
                    <th>Allowance (10%)</th>
                    <th>Deduction ({taxRate}%)</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const base = emp.salary || 0;
                    const { allowance, deduction, netPay } = calculateDetails(base);
                    const status = paymentStatuses[emp._id] || "Pending";

                    return (
                      <tr key={emp._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="recent-item__avatar" style={{ margin: 0 }}>
                              {emp.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                {emp.fullName}
                              </div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                {emp.department} · {emp.designation}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {currencySymbol}
                          {base.toLocaleString()}
                        </td>
                        <td style={{ color: "#10b981" }}>
                          +{currencySymbol}
                          {allowance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ color: "#ef4444" }}>
                          -{currencySymbol}
                          {deduction.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ fontWeight: 700, color: "var(--clr-primary)" }}>
                          {currencySymbol}
                          {netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              status === "Paid" ? "badge--paid" : "badge--pending"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className={`btn ${
                              status === "Paid" ? "btn--ghost" : "btn--primary"
                            } btn--sm`}
                            onClick={() => toggleStatus(emp._id)}
                          >
                            {status === "Paid" ? "Mark Pending" : "Mark Paid"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;
