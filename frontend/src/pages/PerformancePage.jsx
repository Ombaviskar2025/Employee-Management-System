/**
 * PerformancePage.jsx
 * Performance management screen with star ratings, reviewer tracking, and interactive feedback logging.
 */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees, selectEmployees } from "../redux/slices/employeeSlice";
import { FiStar, FiPlus, FiMessageSquare, FiAward, FiCheck, FiX } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const PerformancePage = () => {
  const dispatch = useDispatch();
  const employees = useSelector(selectEmployees);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewerName, setReviewerName] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await dispatch(fetchEmployees({ limit: 100 }));
      setLoading(false);
    };
    loadData();
  }, [dispatch]);

  // Load reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem("ems_performance_reviews");
    if (savedReviews) {
      const parsed = JSON.parse(savedReviews);
      // Filter out any leftover mock reviews
      const filtered = parsed.filter(rev => rev.id !== "mock-1" && rev.id !== "mock-2");
      if (filtered.length !== parsed.length) {
        localStorage.setItem("ems_performance_reviews", JSON.stringify(filtered));
      }
      setReviews(filtered);
    } else {
      setReviews([]);
      localStorage.setItem("ems_performance_reviews", JSON.stringify([]));
    }
  }, []);

  const handleOpenAddReview = () => {
    if (employees?.length > 0) {
      setSelectedEmployeeId(employees[0]._id);
    }
    setRating(5);
    setReviewerName("");
    setFeedback("");
    setShowModal(true);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!selectedEmployeeId || !reviewerName || !feedback) {
      toast.error("Please fill in all fields.");
      return;
    }

    const employee = employees.find((emp) => emp._id === selectedEmployeeId);
    if (!employee) return;

    const newReview = {
      id: Date.now().toString(),
      employeeName: employee.fullName,
      employeeId: employee._id,
      rating,
      reviewer: reviewerName,
      feedback,
      date: new Date().toLocaleDateString(),
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem("ems_performance_reviews", JSON.stringify(updated));
    setShowModal(false);
    toast.success("Performance review submitted successfully! 🌟");
  };

  // Math Calculations
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const highPerformers = reviews.filter((rev) => rev.rating >= 4).length;

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance Analytics</h1>
          <p className="page-subtitle">Track, evaluate, and review team performance with feedback scorecards.</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={handleOpenAddReview}
          disabled={employees?.length === 0}
        >
          <FiPlus size={16} />
          <span>Log Performance Review</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-card__orb stats-card__orb--purple">
            <FiStar size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Average Rating</span>
            <span className="stats-card__value" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {averageRating} <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/ 5.0</span>
            </span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__orb stats-card__orb--blue">
            <FiAward size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">High Performers (4★+)</span>
            <span className="stats-card__value">{highPerformers}</span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__orb stats-card__orb--green">
            <FiMessageSquare size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Total Reviews Logged</span>
            <span className="stats-card__value">{reviews.length}</span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="card" style={{ marginTop: "24px" }}>
        <div className="card__header">
          <h2 className="card__title">Evaluation Log</h2>
        </div>
        <div className="card__body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: "40px" }}>
              <LoadingSpinner size="md" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="empty-state">No performance reviews recorded yet. Log your first review!</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Score / Rating</th>
                    <th>Evaluated By</th>
                    <th style={{ width: "40%" }}>Feedback Remarks</th>
                    <th style={{ textAlign: "right" }}>Review Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((rev) => (
                    <tr key={rev.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="recent-item__avatar" style={{ margin: 0 }}>
                            {rev.employeeName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{rev.employeeName}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              className={`star ${star > rev.rating ? "star--empty" : ""}`}
                            />
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{rev.reviewer}</span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.5" }}>
                        &ldquo;{rev.feedback}&rdquo;
                      </td>
                      <td style={{ textAlign: "right", color: "var(--text-muted)", fontSize: "13px" }}>
                        {rev.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Log Performance Review</h3>
                <p className="modal-subtitle">Evaluate an employee&apos;s work contribution and log feedback.</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="modal-body modal-body--form">
                {/* Employee Selection */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Select Employee</label>
                  <select
                    className="form-input"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.fullName} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Input */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label" style={{ display: "block", marginBottom: "8px" }}>Score Rating</label>
                  <div className="star-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRating(star)}
                        className={`star-input__star ${
                          star <= rating ? "star-input__star--active" : ""
                        }`}
                      >
                        <FiStar fill={star <= rating ? "currentColor" : "none"} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reviewer Name */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Reviewer / Manager Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter reviewer name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    required
                  />
                </div>

                {/* Feedback Comment */}
                <div className="form-group">
                  <label className="form-label">Feedback Remarks</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Provide specific feedback details..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  <FiCheck size={16} />
                  <span>Submit Evaluation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePage;
