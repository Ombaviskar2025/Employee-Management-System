/**
 * EmployeeTable.jsx
 * Data table for employees with sort headers, status badge,
 * and edit/delete action buttons.
 */

import { format } from "date-fns";
import { FiEdit2, FiTrash2, FiChevronUp, FiChevronDown, FiMinus } from "react-icons/fi";
import LoadingSpinner from "./LoadingSpinner";

const STATUS_COLORS = {
  active: "badge--green",
  inactive: "badge--red",
  "on-leave": "badge--yellow",
};

const STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  "on-leave": "On Leave",
};

const SortIcon = ({ field, currentSort, currentOrder }) => {
  if (currentSort !== field)
    return <FiMinus size={12} className="sort-icon sort-icon--none" />;
  return currentOrder === "asc" ? (
    <FiChevronUp size={14} className="sort-icon sort-icon--active" />
  ) : (
    <FiChevronDown size={14} className="sort-icon sort-icon--active" />
  );
};

const EmployeeTable = ({
  employees,
  loading,
  onEdit,
  onDelete,
  sortBy,
  order,
  onSort,
}) => {
  const handleSort = (field) => {
    if (sortBy === field) {
      onSort(field, order === "asc" ? "desc" : "asc");
    } else {
      onSort(field, "asc");
    }
  };

  const thBtn = (field, label) => (
    <button
      className="th-sort-btn"
      onClick={() => handleSort(field)}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <SortIcon field={field} currentSort={sortBy} currentOrder={order} />
    </button>
  );

  if (loading) {
    return (
      <div className="table-loading">
        <LoadingSpinner size="lg" text="Loading employees..." />
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="table-empty">
        <div className="table-empty__icon">👥</div>
        <h3>No employees found</h3>
        <p>Try adjusting your search or filters, or add a new employee.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="emp-table" aria-label="Employee list">
        <thead>
          <tr>
            <th className="th">#</th>
            <th className="th">{thBtn("fullName", "Name")}</th>
            <th className="th">Email</th>
            <th className="th">Mobile</th>
            <th className="th">{thBtn("department", "Department")}</th>
            <th className="th">{thBtn("designation", "Designation")}</th>
            <th className="th">{thBtn("joiningDate", "Joining Date")}</th>
            <th className="th">Status</th>
            <th className="th th--actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, idx) => (
            <tr key={emp._id} className="emp-table__row">
              <td className="td td--num">{idx + 1}</td>
              <td className="td td--name">
                <div className="emp-avatar-wrap">
                  <div className="emp-avatar">
                    {emp.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span>{emp.fullName}</span>
                </div>
              </td>
              <td className="td">{emp.email}</td>
              <td className="td">{emp.mobileNumber}</td>
              <td className="td">
                <span className="dept-tag">{emp.department}</span>
              </td>
              <td className="td">{emp.designation}</td>
              <td className="td">
                {emp.joiningDate
                  ? format(new Date(emp.joiningDate), "dd MMM yyyy")
                  : "—"}
              </td>
              <td className="td">
                <span className={`badge ${STATUS_COLORS[emp.status] || "badge--green"}`}>
                  {STATUS_LABELS[emp.status] || "Active"}
                </span>
              </td>
              <td className="td td--actions">
                <div className="action-btns">
                  <button
                    className="action-btn action-btn--edit"
                    onClick={() => onEdit(emp)}
                    title="Edit employee"
                    aria-label={`Edit ${emp.fullName}`}
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    className="action-btn action-btn--delete"
                    onClick={() => onDelete(emp)}
                    title="Delete employee"
                    aria-label={`Delete ${emp.fullName}`}
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
