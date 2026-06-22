/**
 * SettingsPage.jsx
 * Application configurations settings with localStorage persistence.
 */

import { useState, useEffect } from "react";
import { FiSettings, FiBriefcase, FiDollarSign, FiSave, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  // Settings State
  const [companyName, setCompanyName] = useState("HR Connect Inc.");
  const [currency, setCurrency] = useState("$");
  const [taxRate, setTaxRate] = useState("5");
  const [supportEmail, setSupportEmail] = useState("support@hrconnect.com");
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [autoProcessPayroll, setAutoProcessPayroll] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCompany = localStorage.getItem("ems_settings_company_name");
    const savedCurrency = localStorage.getItem("ems_settings_currency");
    const savedTaxRate = localStorage.getItem("ems_settings_tax_rate");
    const savedEmail = localStorage.getItem("ems_settings_support_email");
    const savedTimeout = localStorage.getItem("ems_settings_session_timeout");
    const savedAutoPay = localStorage.getItem("ems_settings_autopay");

    if (savedCompany) setCompanyName(savedCompany);
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedTaxRate) setTaxRate(savedTaxRate);
    if (savedEmail) setSupportEmail(savedEmail);
    if (savedTimeout) setSessionTimeout(savedTimeout);
    if (savedAutoPay) setAutoProcessPayroll(savedAutoPay === "true");
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("ems_settings_company_name", companyName);
    localStorage.setItem("ems_settings_currency", currency);
    localStorage.setItem("ems_settings_tax_rate", taxRate);
    localStorage.setItem("ems_settings_support_email", supportEmail);
    localStorage.setItem("ems_settings_session_timeout", sessionTimeout);
    localStorage.setItem("ems_settings_autopay", autoProcessPayroll.toString());

    toast.success("Settings saved successfully! ⚙️");
  };

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure application settings, company preferences, and system parameters.</p>
        </div>
      </div>

      <div className="settings-section" style={{ marginTop: "24px" }}>
        {/* Settings Navigation Sidebar */}
        <div className="settings-nav">
          <button
            className={`settings-nav__btn ${activeTab === "general" ? "settings-nav__btn--active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <FiBriefcase size={16} />
            <span>Company Info</span>
          </button>
          <button
            className={`settings-nav__btn ${activeTab === "payroll" ? "settings-nav__btn--active" : ""}`}
            onClick={() => setActiveTab("payroll")}
          >
            <FiDollarSign size={16} />
            <span>Payroll Config</span>
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="card">
          <form onSubmit={handleSave}>
            <div className="card__body" style={{ padding: "28px" }}>
              {activeTab === "general" && (
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>
                    Company Information
                  </h3>

                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label">Support / Contact Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Admin Session Timeout (Minutes)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="5"
                      max="1440"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {activeTab === "payroll" && (
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>
                    Payroll Configurations
                  </h3>

                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label">Business Currency Symbol</label>
                    <select
                      className="form-input"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      required
                    >
                      <option value="$">USD ($) - US Dollar</option>
                      <option value="₹">INR (₹) - Indian Rupee</option>
                      <option value="€">EUR (€) - Euro</option>
                      <option value="£">GBP (£) - British Pound</option>
                      <option value="¥">JPY (¥) - Japanese Yen</option>
                      <option value="₩">KRW (₩) - Korean Won</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label">Standard Deduction / Tax Rate (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max="50"
                      step="0.5"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      id="autopay"
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "4px",
                        borderColor: "rgba(70, 69, 84, 0.4)",
                        backgroundColor: "var(--bg-surface-container-low)",
                        cursor: "pointer",
                      }}
                      checked={autoProcessPayroll}
                      onChange={(e) => setAutoProcessPayroll(e.target.checked)}
                    />
                    <label htmlFor="autopay" style={{ color: "var(--text-secondary)", fontSize: "14px", cursor: "pointer", fontWeight: 500 }}>
                      Auto-generate monthly invoice slips for paid payroll
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div
              className="card__footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "20px 28px",
                borderTop: "1px solid rgba(70, 69, 84, 0.2)",
                background: "rgba(6, 14, 32, 0.1)",
              }}
            >
              <button type="submit" className="btn btn--primary">
                <FiSave size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
