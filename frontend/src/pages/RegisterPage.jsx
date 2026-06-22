import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const DEPARTMENTS = [
  "Engineering",
  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Legal",
  "Design",
  "Product",
  "Customer Support",
  "Management",
  "Other",
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    department: "Engineering",
    designation: "",
    joiningDate: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.mobileNumber || !form.designation || !form.joiningDate || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (form.mobileNumber.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      toast.success(res.data.message || "Registration successful! Pending approval.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />

      <div className="auth-card" style={{ maxWidth: "480px" }}>
        <div className="auth-logo">
          <div className="auth-logo__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
              <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
              <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
              <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <h1 className="auth-logo__title">HR Connect</h1>
            <p className="auth-logo__sub">Employee Registration Portal</p>
          </div>
        </div>

        <h2 className="auth-title">Self Registration</h2>
        <p className="auth-desc">Apply for an employee account in the organization</p>

        <form onSubmit={handleSubmit} className="auth-form" style={{ display: "grid", gap: "12px" }}>
          <div>
            <label className="form-label">Full Name</label>
            <input
              name="fullName"
              type="text"
              className="form-input"
              placeholder="Name Surname"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label className="form-label">Email Address</label>
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="Demo@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Mobile Number</label>
              <input
                name="mobileNumber"
                type="text"
                className="form-input"
                placeholder="10-digit number"
                value={form.mobileNumber}
                onChange={handleChange}
                maxLength="10"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label className="form-label">Department</label>
              <select
                name="department"
                className="form-input"
                value={form.department}
                onChange={handleChange}
                required
                style={{ background: "#1a1f36", color: "white" }}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Designation</label>
              <input
                name="designation"
                type="text"
                className="form-input"
                placeholder="e.g. Software Engineer"
                value={form.designation}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label className="form-label">Joining Date</label>
              <input
                name="joiningDate"
                type="date"
                className="form-input"
                value={form.joiningDate}
                onChange={handleChange}
                required
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full btn--lg"
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading ? "Registering..." : "Submit Registration"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#6366f1", fontWeight: "600", textDecoration: "none" }}>
              Sign In
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
