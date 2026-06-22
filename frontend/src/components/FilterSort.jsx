/**
 * FilterSort.jsx
 * Department filter + sort controls for the employee table.
 */

import { FiFilter, FiArrowUp, FiArrowDown } from "react-icons/fi";

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
  { value: "joiningDate", label: "Joining Date" },
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
      <div className="filter-sort__group">
        <FiFilter size={15} />
        <select
          id="dept-filter"
          className="filter-sort__select"
          value={department}
          onChange={(e) => handleChange("department", e.target.value)}
          aria-label="Filter by department"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="filter-sort__group">
        <select
          id="status-filter"
          className="filter-sort__select"
          value={status}
          onChange={(e) => handleChange("status", e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on-leave">On Leave</option>
        </select>
      </div>

      {/* Sort By */}
      <div className="filter-sort__group">
        <select
          id="sort-select"
          className="filter-sort__select"
          value={sortBy}
          onChange={(e) => handleChange("sortBy", e.target.value)}
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          className="filter-sort__order-btn"
          onClick={toggleOrder}
          title={`Sort ${order === "asc" ? "descending" : "ascending"}`}
          aria-label="Toggle sort order"
        >
          {order === "asc" ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
        </button>
      </div>
    </div>
  );
};

export default FilterSort;
