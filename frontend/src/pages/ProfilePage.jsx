/**
 * ProfilePage.jsx
 * Profile management screen showing personal info, edit capabilities,
 * password change, and department team members for employees.
 */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateUserProfile, updateUserPassword, selectUser, selectAuthLoading } from "../redux/slices/authSlice";
import { fetchMyDepartment, selectEmployees } from "../redux/slices/employeeSlice";
import { FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiLock, FiCheckCircle, FiUsers, FiShield } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthLoading);
  const teamMembers = useSelector(selectEmployees);

  const [activeTab, setActiveTab] = useState("personal");
  const [isHovered, setIsHovered] = useState(false);

  // Form State: Personal Details
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  // Form State: Change Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Update form fields when user profile loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || "");
      setMobileNumber(user.mobileNumber || "");
      setProfilePhoto(user.profilePhoto || "");
    }
  }, [user]);

  // Load department colleagues only when employee selects "My Department" tab
  useEffect(() => {
    if (user && user.role === "employee" && activeTab === "department") {
      dispatch(fetchMyDepartment());
    }
  }, [user, activeTab, dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max_size = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        setProfilePhoto(compressedBase64);
        toast.success("Image selected and optimized!");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName) {
      toast.error(user?.role === "employee" ? "Full Name is required" : "Name is required");
      return;
    }
    const payload = user?.role === "employee"
      ? { fullName, mobileNumber, profilePhoto }
      : { name: fullName, profilePhoto };
    dispatch(updateUserProfile(payload));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setPasswordLoading(true);
    const result = await dispatch(updateUserPassword({ currentPassword, newPassword }));
    setPasswordLoading(false);

    if (updateUserPassword.fulfilled.match(result)) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully! 🔒");
    } else {
      toast.error(result.payload || "Incorrect current password");
    }
  };

  const isEmployee = user?.role === "employee";
  const currencySymbol = localStorage.getItem("ems_settings_currency") || "$";

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Account Profile</h1>
          <p className="page-subtitle">Manage your personal HR record, profile photo, and secure credentials.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: "24px", gridTemplateColumns: "1fr 2.2fr" }}>
        {/* Left: User Card */}
        <div className="card" style={{ height: "fit-content" }}>
          <div className="card__body" style={{ textAlign: "center", padding: "32px 24px" }}>
            <div
              className="recent-item__avatar"
              style={{
                width: "96px",
                height: "96px",
                fontSize: "36px",
                margin: "0 auto 16px",
                background: "linear-gradient(135deg, var(--clr-primary-cta), var(--clr-primary-dark))",
                border: "2px solid rgba(192, 193, 255, 0.3)",
                boxShadow: "var(--shadow-primary-glow)",
                position: "relative",
                cursor: "pointer",
                overflow: "hidden",
              }}
              onClick={() => document.getElementById("profile-file-input").click()}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              title="Click to upload profile photo"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={fullName}
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                fullName.charAt(0).toUpperCase() || "U"
              )}
              {/* Overlay hover effect */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.65)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 600,
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                  borderRadius: "50%",
                }}
              >
                <span>Upload</span>
              </div>
            </div>
            {/* Hidden File Input */}
            <input
              type="file"
              id="profile-file-input"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>{fullName}</h2>
            <span
              className={`badge`}
              style={{
                display: "inline-block",
                marginTop: "8px",
                background: user?.role === "master_hr" ? "rgba(73, 75, 214, 0.15)" : "rgba(16, 185, 129, 0.12)",
                color: user?.role === "master_hr" ? "var(--clr-primary)" : "#10b981",
                textTransform: "uppercase",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              {user?.role === "master_hr" ? "Master HR" : "Employee"}
            </span>

            <div
              style={{
                marginTop: "28px",
                borderTop: "1px solid rgba(70, 69, 84, 0.15)",
                paddingTop: "20px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FiMail size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                <div>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>Email Address</span>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{user?.email}</span>
                </div>
              </div>

              {user?.mobileNumber && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <FiPhone size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <div>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>Mobile Number</span>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{user.mobileNumber}</span>
                  </div>
                </div>
              )}

              {isEmployee && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <FiBriefcase size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <div>
                      <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>Job Title / Dept</span>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                        {user.designation} · {user.department}
                      </span>
                    </div>
                  </div>


                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Tabs & Forms */}
        <div className="card">
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(70, 69, 84, 0.15)",
              background: "rgba(6, 14, 32, 0.05)",
              padding: "0 16px",
            }}
          >
            <button
              className={`settings-nav__btn ${activeTab === "personal" ? "settings-nav__btn--active" : ""}`}
              style={{ borderBottom: activeTab === "personal" ? "2px solid var(--clr-primary)" : "none", borderRadius: 0 }}
              onClick={() => setActiveTab("personal")}
            >
              <FiUser size={15} />
              Personal Info
            </button>
            <button
              className={`settings-nav__btn ${activeTab === "security" ? "settings-nav__btn--active" : ""}`}
              style={{ borderBottom: activeTab === "security" ? "2px solid var(--clr-primary)" : "none", borderRadius: 0 }}
              onClick={() => setActiveTab("security")}
            >
              <FiLock size={15} />
              Security Settings
            </button>
            {isEmployee && (
              <button
                className={`settings-nav__btn ${activeTab === "department" ? "settings-nav__btn--active" : ""}`}
                style={{ borderBottom: activeTab === "department" ? "2px solid var(--clr-primary)" : "none", borderRadius: 0 }}
                onClick={() => setActiveTab("department")}
              >
                <FiUsers size={15} />
                My Department
              </button>
            )}
            <button
              className={`settings-nav__btn ${activeTab === "permissions" ? "settings-nav__btn--active" : ""}`}
              style={{ borderBottom: activeTab === "permissions" ? "2px solid var(--clr-primary)" : "none", borderRadius: 0 }}
              onClick={() => setActiveTab("permissions")}
            >
              <FiShield size={15} />
              My Permissions
            </button>
          </div>

          <div className="card__body" style={{ padding: "28px" }}>
            {activeTab === "personal" && (
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter 10-digit number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Profile Photo</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>Supports direct upload or image URL</span>
                  </label>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => document.getElementById("profile-file-input").click()}
                      style={{ padding: "8px 16px", fontSize: "13px", height: "40px", flexShrink: 0 }}
                    >
                      Choose Image
                    </button>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Or paste image URL here..."
                      value={profilePhoto && profilePhoto.startsWith("data:image/") ? "[Uploaded Image]" : profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn--primary" disabled={authLoading}>
                    {authLoading ? <LoadingSpinner size="sm" /> : <FiCheckCircle size={16} />}
                    <span>Update Profile Info</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handleChangePassword}>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn--primary" disabled={passwordLoading}>
                    {passwordLoading ? <LoadingSpinner size="sm" /> : <FiLock size={16} />}
                    <span>Update Security Password</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === "department" && isEmployee && (
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px", color: "var(--text-primary)" }}>
                  Department: {user.department}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
                  Below is the directory list of your colleagues in the same department unit.
                </p>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Job Designation</th>
                        <th>Email Address</th>
                        <th style={{ textAlign: "right" }}>Account Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers
                        .filter((m) => m.email !== user.email) // filter out self
                        .map((member) => (
                          <tr key={member._id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div className="recent-item__avatar" style={{ margin: 0 }}>
                                  {member.fullName.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                  {member.fullName}
                                </span>
                              </div>
                            </td>
                            <td>{member.designation}</td>
                            <td>{member.email}</td>
                            <td style={{ textAlign: "right" }}>
                              <span
                                className="badge"
                                style={{
                                  background: member.status === "active" ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 180, 171, 0.12)",
                                  color: member.status === "active" ? "#10b981" : "#ffb4ab",
                                }}
                              >
                                {member.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      {teamMembers.filter((m) => m.email !== user.email).length === 0 && (
                        <tr>
                          <td colSpan="4" className="empty-state">
                            You are the only member registered in this department.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "permissions" && (
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "var(--text-primary)" }}>
                  Assigned Role: {user?.role === "master_hr" ? "Master HR / Super Admin" : "Employee"}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                  Below are the authorized operations associated with your current access level.
                </p>

                <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {user?.role === "master_hr" ? (
                    <>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <FiCheckCircle size={16} style={{ color: "#10b981" }} /> Full system read and write control
                      </li>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <FiCheckCircle size={16} style={{ color: "#10b981" }} /> Create and register new employee accounts
                      </li>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <FiCheckCircle size={16} style={{ color: "#10b981" }} /> Edit, update, and delete employee records
                      </li>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <FiCheckCircle size={16} style={{ color: "#10b981" }} /> Reset employee passwords and de-activate accounts
                      </li>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <FiCheckCircle size={16} style={{ color: "#10b981" }} /> Access aggregate reports and adjust system settings
                      </li>
                    </>
                  ) : (
                    <>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <FiCheckCircle size={16} style={{ color: "#10b981" }} /> View and inspect own personal profile details
                      </li>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <FiCheckCircle size={16} style={{ color: "#10b981" }} /> Modify personal details (Mobile and Photo)
                      </li>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <FiCheckCircle size={16} style={{ color: "#10b981" }} /> Securely change own account password
                      </li>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <FiCheckCircle size={16} style={{ color: "#10b981" }} /> View colleagues registered inside same department
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
