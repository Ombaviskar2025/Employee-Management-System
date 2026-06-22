import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnnouncements, createAnnouncement, deleteAnnouncement } from "../redux/slices/announcementSlice";
import { selectUser } from "../redux/slices/authSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const AnnouncementPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { announcements, loading } = useSelector((state) => state.announcements);
  const isHR = user?.role === "master_hr";

  const [form, setForm] = useState({ title: "", content: "" });
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error("Please fill in all fields");
      return;
    }
    dispatch(createAnnouncement(form));
    setShowCreate(false);
    setForm({ title: "", content: "" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      dispatch(deleteAnnouncement(id));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Company Announcements</h1>
          <p className="page-desc">Stay updated with latest bulletins and notifications</p>
        </div>
        {isHR && (
          <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
            Post Announcement
          </button>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "450px" }}>
            <h2 className="modal-title">New Announcement</h2>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g. Town Hall Meeting"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Content</label>
                <textarea
                  name="content"
                  className="form-input"
                  rows="4"
                  placeholder="Type the message content..."
                  value={form.content}
                  onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" className="btn" style={{ background: "#374151" }} onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : announcements.length === 0 ? (
        <div className="card card--empty">
          <p>No announcements posted yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {announcements.map((a) => (
            <div key={a._id} className="card" style={{ borderLeft: "4px solid #6366f1", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <h3 style={{ margin: 0, color: "white", fontSize: "18px", fontWeight: "600" }}>{a.title}</h3>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                    Posted on {new Date(a.createdAt).toLocaleString()} by {a.createdBy?.name || "HR Admin"}
                  </div>
                </div>
                {isHR && (
                  <button
                    className="btn btn--sm"
                    style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" }}
                    onClick={() => handleDelete(a._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", whiteSpace: "pre-line", lineHeight: "1.5" }}>
                {a.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementPage;
