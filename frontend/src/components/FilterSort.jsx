/**
 * FilterSort.jsx
 * Department filter + sort controls for the employee table.
 * HR Connect Midnight Indigo design.
 */

import { FiArrowUp, FiArrowDown } from "react-icons/fi";

const DEPARTMENTS = [
  "Engineering", "IT", "HR", "Finance", "Marketing",
  "Sales", "Operations", "Legal", "Design", "Product",
  "Customer Support", "Management", "Other",
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Date Added" },
  { value: "fullName", label: "Name" },
  { value: "department", label: "Department" },
  { value: "designation", label: "Designation" },

  { value: "salary", label: "Salary" },
];

const FilterSort = ({ filters, onFilterChange }) => {
  const { department, status, sortBy, order } = filters;

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleOrder = () => {
    onFilterChange({ ...filters, order: order === "asc" ? "desc" : "asc" });
  };

  return (
    <div className="filter-sort">
      {/* Department Filter */}
      <select
        id="dept-filter"
        className="filter-select"
        value={department}
        onChange={(e) => handleChange("department", e.target.value)}
        aria-label="Filter by department"
      >
        <option value="">All Departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        id="status-filter"
        className="filter-select"
        value={status}
        onChange={(e) => handleChange("status", e.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="on-leave">On Leave</option>
      </select>

      {/* Sort By */}
      <select
        id="sort-select"
        className="filter-select"
        value={sortBy}
        onChange={(e) => handleChange("sortBy", e.target.value)}
        aria-label="Sort by"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Order toggle */}
      <button
        className="btn btn--ghost btn--sm"
        onClick={toggleOrder}
        title={`Sort ${order === "asc" ? "descending" : "ascending"}`}
        aria-label="Toggle sort order"
        style={{ padding: "9px 12px" }}
      >
        {order === "asc" ? <FiArrowUp size={15} /> : <FiArrowDown size={15} />}
      </button>
    </div>
  );
};

export default FilterSort;
