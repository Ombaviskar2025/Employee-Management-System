import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadDocument, fetchMyDocuments, fetchAllDocuments, updateDocumentStatus } from "../redux/slices/documentSlice";
import { selectUser } from "../redux/slices/authSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const DocumentPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { documents, loading } = useSelector((state) => state.documents);
  const isHR = user?.role === "master_hr";

  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "ID Proof",
    url: "",
  });

  useEffect(() => {
    if (isHR) {
      dispatch(fetchAllDocuments());
    } else {
      dispatch(fetchMyDocuments());
    }
  }, [dispatch, isHR]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.url) {
      toast.error("Please fill in all fields");
      return;
    }
    dispatch(uploadDocument(form));
    setShowUpload(false);
    setForm({ name: "", type: "ID Proof", url: "" });
  };

  const handleUpdateStatus = (id, status) => {
    if (window.confirm(`Are you sure you want to set this document status to ${status}?`)) {
      dispatch(updateDocumentStatus({ id, status }));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Document Management</h1>
          <p className="page-desc">{isHR ? "Review and approve employee document submissions" : "Upload required documents and view status"}</p>
        </div>
        {!isHR && (
          <button className="btn btn--primary" onClick={() => setShowUpload(true)}>
            Upload Document
          </button>
        )}
      </div>

      {showUpload && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "450px" }}>
            <h2 className="modal-title">Upload Document</h2>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
              <div>
                <label className="form-label">Document Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Passport Copy"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Document Type</label>
                <select
                  className="form-input"
                  value={form.type}
                  onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                  style={{ background: "#1a1f36", color: "white" }}
                >
                  <option value="ID Proof">ID Proof</option>
                  <option value="Contract">Contract</option>
                  <option value="Resume">Resume</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">File Link / URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste URL to your document..."
                  value={form.url}
                  onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" className="btn" style={{ background: "#374151" }} onClick={() => setShowUpload(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : documents.length === 0 ? (
        <div className="card card--empty">
          <p>No documents found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {isHR && <th>Employee</th>}
                  <th>Document Name</th>
                  <th>Type</th>
                  <th>Link</th>
                  <th>Status</th>
                  {isHR && <th style={{ textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d._id}>
                    {isHR && (
                      <td>
                        <div className="font-semibold text-white">{d.employeeId?.fullName || "Employee"}</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{d.employeeId?.email}</div>
                      </td>
                    )}
                    <td>{d.name}</td>
                    <td>{d.type}</td>
                    <td>
                      <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8", textDecoration: "underline" }}>
                        View Document
                      </a>
                    </td>
                    <td>
                      <span className={`badge badge--${d.status === "Approved" ? "success" : d.status === "Pending" ? "warning" : "danger"}`}>
                        {d.status}
                      </span>
                    </td>
                    {isHR && (
                      <td>
                        {d.status === "Pending" ? (
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              className="btn btn--sm"
                              style={{ background: "#10b981", color: "white" }}
                              onClick={() => handleUpdateStatus(d._id, "Approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn--sm"
                              style={{ background: "#ef4444", color: "white" }}
                              onClick={() => handleUpdateStatus(d._id, "Rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div style={{ textAlign: "right", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Processed</div>
                        )}
                      </td>
                    )}
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

export default DocumentPage;
