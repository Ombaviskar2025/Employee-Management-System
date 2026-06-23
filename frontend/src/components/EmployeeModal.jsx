/**
 * EmployeeModal.jsx
 * Add / Edit employee form modal.
 * Validates all fields before submit.
 */

import { useState, useEffect } from "react";
import { FiX, FiUser, FiMail, FiPhone, FiBriefcase, FiCalendar, FiDollarSign, FiLock } from "react-icons/fi";
import { validateEmployeeForm } from "../utils/validators";
import api from "../services/api";

const STATIC_DEPARTMENTS = [
  "Engineering", "IT", "HR", "Finance", "Marketing",
  "Sales", "Operations", "Legal", "Design", "Product",
  "Customer Support", "Management", "Other",
];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  mobileNumber: "",
  department: "Engineering",
  designation: "",
  salary: "",
  status: "active",
  password: "",
};

const EmployeeModal = ({ employee, onSubmit, onClose, loading = false }) => {
  const isEdit = Boolean(employee?._id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);

  // Fetch departments dynamically
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const response = await api.get("/departments");
        if (response.data.success && response.data.data.length > 0) {
          setDepartments(response.data.data.map(d => d.name));
        } else {
          setDepartments(STATIC_DEPARTMENTS);
        }
      } catch (err) {
        console.error("Failed to load departments from database, using fallback:", err);
        setDepartments(STATIC_DEPARTMENTS);
      }
    };
    fetchDepts();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (employee) {
      setForm({
        fullName: employee.fullName || "",
        email: employee.email || "",
        mobileNumber: employee.mobileNumber || "",
        department: employee.department || "",
        designation: employee.designation || "",
        salary: employee.salary || "",
        status: employee.status || "active",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateEmployeeForm(form, !isEdit);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({ ...form, salary: form.salary ? Number(form.salary) : 0 });
  };

  const inputClass = (field) =>
    `form-input ${errors[field] ? "form-input--error" : ""}`;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-box modal-box--large"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header modal-header--form">
          <div>
            <h2 className="modal-title">
              {isEdit ? "Edit Employee" : "Add New Employee"}
            </h2>
            <p className="modal-subtitle">
              {isEdit
                ? "Update the employee's information below."
                : "Fill in the details to add a new employee."}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body modal-body--form">
            <div className="form-grid">
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="emp-fullName">
                  <FiUser size={14} /> Full Name *
                </label>
                <input
                  id="emp-fullName"
                  name="fullName"
                  type="text"
                  className={inputClass("fullName")}
                  placeholder="Name Surname"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <span className="form-error">{errors.fullName}</span>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="emp-email">
                  <FiMail size={14} /> Email Address *
                </label>
                <input
                  id="emp-email"
                  name="email"
                  type="email"
                  className={inputClass("email")}
                  placeholder="Demo@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && (
                  <span className="form-error">{errors.email}</span>
                )}
              </div>

              {/* Mobile */}
              <div className="form-group">
                <label className="form-label" htmlFor="emp-mobile">
                  <FiPhone size={14} /> Mobile Number *
                </label>
                <input
                  id="emp-mobile"
                  name="mobileNumber"
                  type="tel"
                  className={inputClass("mobileNumber")}
                  placeholder="9876543210"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  maxLength={10}
                  autoComplete="tel"
                />
                {errors.mobileNumber && (
                  <span className="form-error">{errors.mobileNumber}</span>
                )}
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label" htmlFor="emp-dept">
                  <FiBriefcase size={14} /> Department *
                </label>
                <select
                  id="emp-dept"
                  name="department"
                  className={inputClass("department")}
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value="">Select department...</option>
                   {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.department && (
                  <span className="form-error">{errors.department}</span>
                )}
              </div>

              {/* Designation */}
              <div className="form-group">
                <label className="form-label" htmlFor="emp-designation">
                  <FiBriefcase size={14} /> Designation *
                </label>
                <input
                  id="emp-designation"
                  name="designation"
                  type="text"
                  className={inputClass("designation")}
                  placeholder="Software Engineer"
                  value={form.designation}
                  onChange={handleChange}
                />
                {errors.designation && (
                  <span className="form-error">{errors.designation}</span>
                )}
              </div>



              {/* Salary */}
              <div className="form-group">
                <label className="form-label" htmlFor="emp-salary">
                  <FiDollarSign size={14} /> Salary (₹)
                </label>
                <input
                  id="emp-salary"
                  name="salary"
                  type="number"
                  className="form-input"
                  placeholder="50000"
                  value={form.salary}
                  onChange={handleChange}
                  min={0}
                />
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label" htmlFor="emp-status">
                  Status
                </label>
                <select
                  id="emp-status"
                  name="status"
                  className="form-input"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>

              {/* Password (Only on Create) */}
              {!isEdit && (
                <div className="form-group">
                  <label className="form-label" htmlFor="emp-password">
                    <FiLock size={14} /> Password *
                  </label>
                  <input
                    id="emp-password"
                    name="password"
                    type="password"
                    className={inputClass("password")}
                    placeholder="Enter login password"
                    value={form.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <span className="form-error">{errors.password}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
              id="submit-employee-btn"
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  {isEdit ? "Updating..." : "Adding..."}
                </>
              ) : isEdit ? (
                "Update Employee"
              ) : (
                "Add Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
