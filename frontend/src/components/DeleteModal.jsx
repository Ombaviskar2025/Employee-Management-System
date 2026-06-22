/**
 * DeleteModal.jsx
 * Confirmation modal before deleting an employee.
 * Shows employee name for confirmation.
 */

import { FiAlertTriangle, FiX } from "react-icons/fi";

const DeleteModal = ({ employee, onConfirm, onCancel, loading = false }) => {
  if (!employee) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div
        className="modal-box modal-box--danger"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__icon modal-header__icon--danger">
            <FiAlertTriangle size={24} />
          </div>
          <button
            className="modal-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <h2 className="modal-title">Delete Employee</h2>
          <p className="modal-desc">
            Are you sure you want to delete{" "}
            <strong>{employee.fullName}</strong>?
          </p>
          <p className="modal-desc modal-desc--muted">
            This action cannot be undone. All data associated with this
            employee will be permanently removed.
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
                <span className="btn-spinner" />
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
