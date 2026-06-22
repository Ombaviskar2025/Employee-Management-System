/**
 * RegisterPage.jsx
 * New user registration page.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiGrid } from "react-icons/fi";
import { registerUser, selectIsAuthenticated } from "../redux/slices/authSlice";
import { validateRegisterForm } from "../utils/validators";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    const result = await dispatch(
      registerUser({ name: form.name, email: form.email, password: form.password })
    );
    setLoading(false);
    if (registerUser.fulfilled.match(result)) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />

      <div className="auth-card auth-card--wide">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo__icon">
            <FiGrid size={28} />
          </div>
          <div>
            <h1 className="auth-logo__title">EMS Pro</h1>
            <p className="auth-logo__sub">Employee Management System</p>
          </div>
        </div>

        <h2 className="auth-title">Create account 🚀</h2>
        <p className="auth-desc">Get started with EMS Pro today</p>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-grid">
            {/* Name */}
            <div className="form-group form-group--full">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div className="input-icon-wrap">
                <FiUser className="input-icon" size={16} />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className={`form-input form-input--icon ${errors.name ? "form-input--error" : ""}`}
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  autoFocus
                />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group form-group--full">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" size={16} />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className={`form-input form-input--icon ${errors.email ? "form-input--error" : ""}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" size={16} />
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  className={`form-input form-input--icon form-input--icon-r ${errors.password ? "form-input--error" : ""}`}
                  placeholder="Min 6 chars + 1 number"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" size={16} />
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showPass ? "text" : "password"}
                  className={`form-input form-input--icon ${errors.confirmPassword ? "form-input--error" : ""}`}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <span className="form-error">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
