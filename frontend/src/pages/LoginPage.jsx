/**
 * LoginPage.jsx
 * Authentication login page with form validation and animated UI.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiMail, FiLock, FiEye, FiEyeOff, FiGrid } from "react-icons/fi";
import { loginUser } from "../redux/slices/authSlice";
import { selectIsAuthenticated } from "../redux/slices/authSlice";
import { useSelector } from "react-redux";
import { validateLoginForm } from "../utils/validators";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    const result = await dispatch(loginUser(form));
    setLoading(false);
    if (loginUser.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="auth-page">
      {/* Background blobs */}
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />

      <div className="auth-card">
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

        <h2 className="auth-title">Welcome back 👋</h2>
        <p className="auth-desc">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="input-icon-wrap">
              <FiMail className="input-icon" size={16} />
              <input
                id="login-email"
                name="email"
                type="email"
                className={`form-input form-input--icon ${errors.email ? "form-input--error" : ""}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
              />
            </div>
            {errors.email && (
              <span className="form-error">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div className="input-icon-wrap">
              <FiLock className="input-icon" size={16} />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`form-input form-input--icon form-input--icon-r ${errors.password ? "form-input--error" : ""}`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-link">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
