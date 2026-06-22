/**
 * LoginPage.jsx
 * Authentication login page.
 * HR Connect Midnight Indigo design — glassmorphism card, glowing background.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
              <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
              <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
              <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
            </svg>
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
              <FiMail className="input-icon" size={15} />
              <input
                id="login-email"
                name="email"
                type="email"
                className={`form-input form-input--icon ${errors.email ? "form-input--error" : ""}`}
                placeholder="Demo@gmail.com"
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
              <FiLock className="input-icon" size={15} />
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
                {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full btn--lg"
            disabled={loading}
            id="login-submit-btn"
            style={{ marginTop: "4px" }}
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
      </div>
    </div>
  );
};

export default LoginPage;
