import { useState, useEffect } from "react";
import { FiPlus, FiBriefcase, FiUser, FiInfo, FiTrash2, FiEdit2, FiX } from "react-icons/fi";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState({ name: "", head: "", description: "" });
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get("/departments"),
        api.get("/employees?limit=200"),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (err) {
      toast.error("Failed to load department dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setForm({ name: "", head: "", description: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setForm({
      name: dept.name,
      head: dept.head?._id || "",
      description: dept.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    try {
      if (editingDept) {
        // Update
        const response = await api.put(`/departments/${editingDept._id}`, form);
        if (response.data.success) {
          toast.success("Department updated successfully! 🚀");
          loadData();
          setShowModal(false);
        }
      } else {
        // Create
        const response = await api.post("/departments", form);
        if (response.data.success) {
          toast.success("Department created successfully! 🎉");
          loadData();
          setShowModal(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save department details");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the ${name} department?`)) {
      try {
        const response = await api.delete(`/departments/${id}`);
        if (response.data.success) {
          toast.success("Department deleted successfully! 🗑️");
          loadData();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete department");
      }
    }
  };

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-desc">Create corporate units, assign department heads, and track employee distributions.</p>
        </div>
        <button className="btn btn--primary" onClick={handleOpenAdd}>
          <FiPlus size={16} style={{ marginRight: "6px" }} /> Add Department
        </button>
      </div>

      {/* Search Filter */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by department name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "400px" }}
        />
      </div>

      {/* Main Body */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredDepts.length === 0 ? (
        <div className="card card--empty">
          <p>No departments found. Create your first operational department!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredDepts.map((d) => (
            <div className="card" key={d._id} style={{ display: "flex", flexDirection: "column", justifyBetween: "space-between" }}>
              <div className="card__body" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyCenter: "center", color: "#6366f1" }}>
                      <FiBriefcase size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "white", margin: 0 }}>{d.name}</h3>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Unit Code: {d._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn--icon" onClick={() => handleOpenEdit(d)} title="Edit Unit">
                      <FiEdit2 size={13} />
                    </button>
                    <button className="btn btn--icon btn--danger" onClick={() => handleDelete(d._id, d.name)} title="Delete Unit">
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, minHeight: "36px" }}>
                  {d.description || "No unit description provided."}
                </p>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "8px", fontSize: "12px" }}>
                  <div>
                    <span style={{ display: "block", color: "rgba(255,255,255,0.4)" }}>Department Head</span>
                    <span style={{ fontWeight: 600, color: "white" }}>
                      {d.head ? d.head.fullName : "Not Assigned"}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "block", color: "rgba(255,255,255,0.4)" }}>Headcount</span>
                    <span style={{ fontWeight: 600, color: "#10b981", fontSize: "14px" }}>
                      {employees.filter(emp => emp.department === d.name).length} Employees
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "450px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="modal-title">{editingDept ? "Modify Department" : "Add New Department"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                <FiX size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
              <div>
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Finance & Auditing"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="form-label">Department Head</label>
                <select
                  className="form-input"
                  value={form.head}
                  onChange={(e) => setForm(prev => ({ ...prev, head: e.target.value }))}
                  style={{ background: "#1a1f36", color: "white" }}
                >
                  <option value="">Select Department Head...</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Summarize the core operational focus of this corporate unit..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" className="btn" style={{ background: "#374151" }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  {editingDept ? "Save Changes" : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
