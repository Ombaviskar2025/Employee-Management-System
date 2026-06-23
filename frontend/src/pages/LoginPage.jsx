/**
 * LoginPage.jsx
 * Employee Sign In page.
 * Compact, premium Tailwind CSS + glassmorphism design that fits perfectly within the viewport.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, selectIsAuthenticated } from "../redux/slices/authSlice";
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
    const result = await dispatch(loginUser({ ...form, requiredRole: "employee" }));
    setLoading(false);
    if (loginUser.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-y-auto relative" style={{ backgroundColor: "#0d0d15", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Dynamic Background Elements */}
      <div className="mesh-blob bg-secondary-container top-[-10%] left-[-10%]"></div>
      <div className="mesh-blob bg-primary-container bottom-[-10%] right-[-10%]" style={{ animationDelay: "-5s" }}></div>
      <div className="mesh-blob bg-tertiary-container top-[30%] left-[30%]" style={{ width: "300px", height: "300px", opacity: 0.15 }}></div>

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-container-padding-mobile md:px-container-padding-desktop py-3 bg-surface/30 backdrop-blur-xl border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-on-surface">HR Connect</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-container-padding-mobile pt-16 pb-4">
        <div className="glass-card w-full max-w-[420px] p-6 md:p-8 rounded-xl flex flex-col gap-5 transition-all duration-500 hover:scale-[1.01]">
          {/* Logo and Header */}
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center mb-2 shadow-xl shadow-primary/30 group">
              <span className="material-symbols-outlined text-white text-xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold text-on-surface tracking-tight">Employee Sign In</h1>
              <span className="text-xl animate-bounce" style={{ animationDuration: "2s" }}>👋</span>
            </div>
            <p className="text-sm text-on-surface-variant max-w-[260px]">
              Sign in to your employee account to continue
            </p>
          </div>

          {/* Sign In Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-outline uppercase tracking-widest pl-1 font-semibold" htmlFor="login-email">Email Address</label>
              <div className={`input-glow flex items-center gap-2.5 px-4 py-2.5 bg-white/5 border ${errors.email ? "border-red-500" : "border-white/10"} rounded-full transition-all group`}>
                <span className="material-symbols-outlined text-on-surface-variant text-lg group-focus-within:text-primary transition-colors">mail</span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className="bg-transparent border-none p-0 w-full text-on-surface placeholder-on-surface-variant/40 focus:ring-0 text-sm"
                  placeholder="Demo@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.email && (
                <span className="text-red-400 text-xs pl-4">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-outline uppercase tracking-widest pl-1 font-semibold" htmlFor="login-password">Password</label>
              <div className={`input-glow flex items-center gap-2.5 px-4 py-2.5 bg-white/5 border ${errors.password ? "border-red-500" : "border-white/10"} rounded-full transition-all group relative`}>
                <span className="material-symbols-outlined text-on-surface-variant text-lg group-focus-within:text-primary transition-colors">lock</span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="bg-transparent border-none p-0 w-full text-on-surface placeholder-on-surface-variant/40 focus:ring-0 text-sm"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  className="absolute right-4 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <span className="text-red-400 text-xs pl-4">{errors.password}</span>
              )}
              <div className="flex justify-end">
                <Link className="text-xs text-secondary hover:text-primary transition-colors font-semibold" to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>

            {/* Primary Action */}
            <button
              className="primary-gradient w-full py-3.5 rounded-full text-base font-bold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99] transition-all relative overflow-hidden group"
              id="submitBtn"
              type="submit"
              disabled={loading}
            >
              <span className={`relative z-10 ${loading ? "opacity-0" : ""}`} id="btnText">Sign In</span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10" id="btnLoader">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
              <div className="shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          {/* Secondary Links */}
          <div className="flex flex-col items-center gap-3 border-t border-white/5 pt-5">
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
              <span>Don't have an account?</span>
              <Link className="text-secondary font-bold hover:underline transition-all" to="/register">Register here</Link>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant/80">
              <span>Are you a Super HR Admin?</span>
              <Link className="text-on-secondary-container font-bold hover:underline decoration-dotted transition-all" to="/super-hr-login">Super HR Portal</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Shell */}
      <footer className="w-full py-4 flex flex-col items-center gap-2 mt-auto relative z-10">
        <p className="text-xs uppercase tracking-widest text-outline">HR CONNECT PORTAL</p>
        <p className="text-xs text-on-surface-variant/60">© 2026 HR Connect Portal</p>
      </footer>
    </div>
  );
};

export default LoginPage;
