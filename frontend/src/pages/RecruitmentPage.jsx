import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs, createJob, updateJob, deleteJob, fetchApplications, updateApplicationStatus, applyToJob } from "../redux/slices/recruitmentSlice";
import { selectUser } from "../redux/slices/authSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const RecruitmentPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { jobs, applications, loading } = useSelector((state) => state.recruitment);
  const isHR = user?.role === "master_hr";

  const [activeTab, setActiveTab] = useState("jobs"); // jobs | applications
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  });

  const [applyForm, setApplyForm] = useState({
    fullName: "",
    email: "",
    resume: "",
  });

  useEffect(() => {
    dispatch(fetchJobs());
    if (isHR) {
      dispatch(fetchApplications());
    }
  }, [dispatch, isHR]);

  const handleJobSubmit = (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.description || !jobForm.location) {
      toast.error("Please fill in all fields");
      return;
    }
    if (selectedJob) {
      dispatch(updateJob({ id: selectedJob._id, jobData: jobForm }));
    } else {
      dispatch(createJob(jobForm));
    }
    setShowJobModal(false);
    setSelectedJob(null);
    setJobForm({ title: "", description: "", department: "Engineering", location: "Remote", type: "Full-time" });
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applyForm.fullName || !applyForm.email || !applyForm.resume) {
      toast.error("Please fill in all fields");
      return;
    }
    dispatch(applyToJob({ jobId: selectedJob._id, appData: applyForm }));
    setShowApplyModal(false);
    setSelectedJob(null);
    setApplyForm({ fullName: "", email: "", resume: "" });
  };

  const handleDeleteJob = (id) => {
    if (window.confirm("Are you sure you want to delete this job posting? All related applications will be deleted.")) {
      dispatch(deleteJob(id));
    }
  };

  const handleAppStatusChange = (id, status) => {
    dispatch(updateApplicationStatus({ id, status }));
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Recruitment Portal</h1>
          <p className="page-desc">{isHR ? "Manage job openings and candidate applications" : "View internal job openings and career listings"}</p>
        </div>
        {isHR && activeTab === "jobs" && (
          <button className="btn btn--primary" onClick={() => {
            setSelectedJob(null);
            setJobForm({ title: "", description: "", department: "Engineering", location: "Remote", type: "Full-time" });
            setShowJobModal(true);
          }}>
            Create Job Opening
          </button>
        )}
      </div>

      {isHR && (
        <div className="tabs-container" style={{ display: "flex", gap: "10px", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
          <button className={`btn ${activeTab === "jobs" ? "btn--primary" : ""}`} style={{ background: activeTab === "jobs" ? "" : "#1f2937" }} onClick={() => setActiveTab("jobs")}>
            Job Openings
          </button>
          <button className={`btn ${activeTab === "applications" ? "btn--primary" : ""}`} style={{ background: activeTab === "applications" ? "" : "#1f2937" }} onClick={() => setActiveTab("applications")}>
            Applications
          </button>
        </div>
      )}

      {showJobModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "450px" }}>
            <h2 className="modal-title">{selectedJob ? "Edit Job Opening" : "Create Job Opening"}</h2>
            <form onSubmit={handleJobSubmit} style={{ display: "grid", gap: "12px" }}>
              <div>
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g. Senior Backend Developer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="form-label">Department</label>
                  <select
                    className="form-input"
                    value={jobForm.department}
                    onChange={(e) => setJobForm(prev => ({ ...prev, department: e.target.value }))}
                    style={{ background: "#1a1f36", color: "white" }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Job Type</label>
                  <select
                    className="form-input"
                    value={jobForm.type}
                    onChange={(e) => setJobForm(prev => ({ ...prev, type: e.target.value }))}
                    style={{ background: "#1a1f36", color: "white" }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Remote / New York"
                  value={jobForm.location}
                  onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Job Description</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Responsibilities, requirements, and benefits..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" className="btn" style={{ background: "#374151" }} onClick={() => setShowJobModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  {selectedJob ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "450px" }}>
            <h2 className="modal-title">Apply for {selectedJob?.title}</h2>
            <form onSubmit={handleApplySubmit} style={{ display: "grid", gap: "12px" }}>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your full name"
                  value={applyForm.fullName}
                  onChange={(e) => setApplyForm(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Your email address"
                  value={applyForm.email}
                  onChange={(e) => setApplyForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Resume Link / Text</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Paste your LinkedIn/portfolio URL or resume content..."
                  value={applyForm.resume}
                  onChange={(e) => setApplyForm(prev => ({ ...prev, resume: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" className="btn" style={{ background: "#374151" }} onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : activeTab === "jobs" ? (
        jobs.length === 0 ? (
          <div className="card card--empty">
            <p>No job openings listed at this time.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {jobs.map((j) => (
              <div key={j._id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "white", fontSize: "18px", fontWeight: "600" }}>{j.title}</h3>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                      <span>{j.department}</span>
                      <span>•</span>
                      <span>{j.location}</span>
                      <span>•</span>
                      <span style={{ color: "#818cf8" }}>{j.type}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {isHR ? (
                      <>
                        <button className="btn btn--sm" style={{ background: "#374151" }} onClick={() => {
                          setSelectedJob(j);
                          setJobForm({ title: j.title, description: j.description, department: j.department, location: j.location, type: j.type });
                          setShowJobModal(true);
                        }}>
                          Edit
                        </button>
                        <button className="btn btn--sm" style={{ background: "#ef4444", color: "white" }} onClick={() => handleDeleteJob(j._id)}>
                          Delete
                        </button>
                      </>
                    ) : (
                      <button className="btn btn--primary btn--sm" onClick={() => {
                        setSelectedJob(j);
                        setShowApplyModal(true);
                      }}>
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ margin: "12px 0 0 0", color: "rgba(255,255,255,0.7)", whiteSpace: "pre-line", lineHeight: "1.5" }}>
                  {j.description}
                </p>
              </div>
            ))}
          </div>
        )
      ) : applications.length === 0 ? (
        <div className="card card--empty">
          <p>No candidate applications received yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Applied Position</th>
                  <th>Resume/Info</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div className="font-semibold text-white">{app.fullName}</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{app.email}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-white">{app.jobId?.title || "Deleted Job"}</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{app.jobId?.department}</div>
                    </td>
                    <td>{app.resume}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge--${app.status === "Offered" || app.status === "Interview" ? "success" : app.status === "Applied" || app.status === "Screening" ? "warning" : "danger"}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <select
                          className="form-input form-input--sm"
                          value={app.status}
                          onChange={(e) => handleAppStatusChange(app._id, e.target.value)}
                          style={{ background: "#1a1f36", color: "white", width: "auto" }}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Screening">Screening</option>
                          <option value="Interview">Interview</option>
                          <option value="Offered">Offered</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentPage;
