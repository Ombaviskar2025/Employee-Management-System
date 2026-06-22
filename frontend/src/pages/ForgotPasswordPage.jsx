import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success(res.data.message);
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />

      <div className="auth-card">
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
            <p className="auth-logo__sub">Employee Management System</p>
          </div>
        </div>

        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-desc">Enter your registered email to receive a password reset token</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Demo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
            {loading ? "Sending..." : "Request Reset Token"}
          </button>
        </form>

        {resetToken && (
          <div style={{ marginTop: "20px", padding: "12px", background: "rgba(99,102,241,0.1)", borderRadius: "8px", border: "1px solid rgba(99,102,241,0.3)" }}>
            <p style={{ color: "#818cf8", fontSize: "14px", margin: "0 0 8px 0" }}>🔑 <strong>Demo Mode Reset Link</strong>:</p>
            <Link to={`/reset-password/${resetToken}`} style={{ color: "#a5b4fc", wordBreak: "break-all", fontSize: "13px" }}>
              Click here to Reset Password
            </Link>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/login" style={{ color: "#6366f1", fontWeight: "600", textDecoration: "none", fontSize: "14px" }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
