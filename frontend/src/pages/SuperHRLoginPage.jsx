/**
 * SuperHRLoginPage.jsx
 * Dedicated login page for Super HR Admins.
 * Premium Dark Purple & Violet theme with glassmorphism and subtle animations.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiShield } from "react-icons/fi";
import { loginUser, selectIsAuthenticated } from "../redux/slices/authSlice";
import { validateLoginForm } from "../utils/validators";

const SuperHRLoginPage = () => {
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
    const result = await dispatch(loginUser({ ...form, requiredRole: "master_hr" }));
    setLoading(false);
    if (loginUser.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="auth-page overflow-y-auto" style={{ background: "radial-gradient(circle at 50% 50%, #0d091e 0%, #05030a 100%)" }}>
      {/* Premium Purple glowing blobs */}
      <div className="auth-blob" style={{ background: "rgba(168, 85, 247, 0.15)", top: "10%", left: "10%", width: "400px", height: "400px", filter: "blur(120px)" }} />
      <div className="auth-blob" style={{ background: "rgba(236, 72, 153, 0.12)", bottom: "10%", right: "10%", width: "450px", height: "450px", filter: "blur(130px)" }} />

      <div className="auth-card" style={{ borderColor: "rgba(168, 85, 247, 0.25)", boxShadow: "0 0 40px rgba(168, 85, 247, 0.1)" }}>
        {/* Back Link */}
        <Link 
          to="/login" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "6px", 
            color: "rgba(255,255,255,0.5)", 
            textDecoration: "none", 
            fontSize: "13px", 
            marginBottom: "20px",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.color = "#a855f7"}
          onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.5)"}
        >
          <FiArrowLeft size={14} /> Back to Employee Portal
        </Link>

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo__icon" style={{ background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)" }}>
            <FiShield size={20} color="white" />
          </div>
          <div>
            <h1 className="auth-logo__title" style={{ background: "linear-gradient(to right, #ffffff, #d8b4fe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HR Connect</h1>
            <p className="auth-logo__sub" style={{ color: "#c084fc", fontWeight: "600", letterSpacing: "1px" }}>SUPER HR PORTAL</p>
          </div>
        </div>

        <h2 className="auth-title" style={{ fontSize: "22px" }}>Administrative Access 🔐</h2>
        <p className="auth-desc">Authenticate to manage employee records & settings</p>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Admin Email Address
            </label>
            <div className="input-icon-wrap">
              <FiMail className="input-icon" size={15} style={{ color: "#c084fc" }} />
              <input
                id="admin-email"
                name="email"
                type="email"
                className={`form-input form-input--icon ${errors.email ? "form-input--error" : ""}`}
                placeholder="admin@hrconnect.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
                style={{
                  borderColor: "rgba(168, 85, 247, 0.2)",
                  background: "rgba(13, 9, 30, 0.5)",
                }}
              />
            </div>
            {errors.email && (
              <span className="form-error">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Security Key / Password
            </label>
            <div className="input-icon-wrap">
              <FiLock className="input-icon" size={15} style={{ color: "#c084fc" }} />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`form-input form-input--icon form-input--icon-r ${errors.password ? "form-input--error" : ""}`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                style={{
                  borderColor: "rgba(168, 85, 247, 0.2)",
                  background: "rgba(13, 9, 30, 0.5)",
                }}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ color: "#c084fc" }}
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
            id="admin-submit-btn"
            style={{ 
              marginTop: "16px",
              background: "linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)",
              boxShadow: "0 4px 15px rgba(168, 85, 247, 0.3)",
              border: "none"
            }}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Authenticating HR...
              </>
            ) : (
              "Access Admin Console"
            )}
          </button>
        </form>
        
        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
          🔒 Secure Administrative Zone · Unauthorized access is prohibited.
        </div>
      </div>
    </div>
  );
};

export default SuperHRLoginPage;
