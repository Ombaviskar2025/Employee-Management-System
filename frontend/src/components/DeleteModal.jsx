/**
 * DeleteModal.jsx
 * Confirmation modal before deleting an employee.
 * HR Connect Midnight Indigo design.
 */

import { FiAlertTriangle, FiX } from "react-icons/fi";

const DeleteModal = ({ employee, onConfirm, onCancel, loading = false }) => {
  if (!employee) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div
        className="modal-box"
        style={{ maxWidth: "440px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Delete Employee</h2>
          <button
            className="modal-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ textAlign: "center" }}>
          <div className="delete-modal-icon">
            <FiAlertTriangle size={28} />
          </div>
          <p className="delete-modal-text">
            Are you sure you want to permanently delete{" "}
            <span className="delete-modal-name">{employee.fullName}</span>?
          </p>
          <p className="delete-modal-text" style={{ marginTop: "8px", fontSize: "13px" }}>
            This action cannot be undone. All associated data will be removed.
          </p>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn btn--ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={loading}
            id="confirm-delete-btn"
          >
            {loading ? (
              <>
                <span className="btn-spinner" style={{ borderTopColor: "currentColor" }} />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
