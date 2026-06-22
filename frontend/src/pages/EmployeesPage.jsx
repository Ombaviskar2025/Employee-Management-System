/**
 * EmployeesPage.jsx
 * Full employee management page: search, filter, sort, CRUD, pagination.
 * HR Connect Midnight Indigo design.
 */

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { FiPlus, FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";

import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  selectEmployees,
  selectPagination,
  selectEmployeeLoading,
} from "../redux/slices/employeeSlice";

import EmployeeTable from "../components/EmployeeTable";
import EmployeeModal from "../components/EmployeeModal";
import DeleteModal from "../components/DeleteModal";
import SearchBar from "../components/SearchBar";
import FilterSort from "../components/FilterSort";
import Pagination from "../components/Pagination";

const DEFAULT_FILTERS = {
  search: "",
  department: "",
  status: "",
  sortBy: "createdAt",
  order: "desc",
};

const EmployeesPage = () => {
  const dispatch = useDispatch();
  const employees = useSelector(selectEmployees);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectEmployeeLoading);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modal states
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // Open modal if add=true is in URL query parameter
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setEditEmployee(null);
      setShowAddEdit(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch employees whenever filters/page change
  const loadEmployees = useCallback(() => {
    dispatch(
      fetchEmployees({
        ...filters,
        page,
        limit,
      })
    );
  }, [dispatch, filters, page, limit]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSearch = useCallback((value) => {
    setFilters((f) => ({ ...f, search: value }));
    setPage(1);
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSort = (sortBy, order) => {
    setFilters((f) => ({ ...f, sortBy, order }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenAdd = () => {
    setEditEmployee(null);
    setShowAddEdit(true);
  };

  const handleOpenEdit = (emp) => {
    setEditEmployee(emp);
    setShowAddEdit(true);
  };

  const handleOpenDelete = (emp) => {
    setDeleteTarget(emp);
  };

  const handleCloseModal = () => {
    setShowAddEdit(false);
    setEditEmployee(null);
  };

  const handleSubmit = async (formData) => {
    let result;
    if (editEmployee?._id) {
      result = await dispatch(
        updateEmployee({ id: editEmployee._id, employeeData: formData })
      );
    } else {
      result = await dispatch(createEmployee(formData));
    }
    if (
      updateEmployee.fulfilled.match(result) ||
      createEmployee.fulfilled.match(result)
    ) {
      handleCloseModal();
      loadEmployees();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const result = await dispatch(deleteEmployee(deleteTarget._id));
    setDeleteLoading(false);
    if (deleteEmployee.fulfilled.match(result)) {
      setDeleteTarget(null);
      loadEmployees();
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">
            {pagination.total} employee{pagination.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="page-header__actions">
          <button
            className="btn btn--ghost btn--sm"
            title="Export to CSV (Excel compatible)"
            onClick={() => {
              if (employees.length === 0) {
                toast.error("No employee data to export");
                return;
              }
              const headers = ["Full Name", "Email", "Mobile Number", "Department", "Designation", "Join Date", "Status"];
              const rows = employees.map(emp => [
                `"${emp.fullName}"`,
                emp.email,
                emp.mobileNumber,
                `"${emp.department}"`,
                `"${emp.designation}"`,
                new Date(emp.joinDate).toLocaleDateString(),
                emp.status
              ]);
              
              let csvContent = "data:text/csv;charset=utf-8," 
                + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `employees_report_${new Date().toISOString().split("T")[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success("Employees report exported! 📊");
            }}
          >
            <FiDownload size={15} />
            Export
          </button>
          <button
            className="btn btn--primary"
            onClick={handleOpenAdd}
            id="add-employee-btn"
          >
            <FiPlus size={17} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="toolbar">
        <SearchBar onSearch={handleSearch} initialValue={filters.search} />
        <FilterSort filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Table */}
      <div className="card">
        <EmployeeTable
          employees={employees}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          sortBy={filters.sortBy}
          order={filters.order}
          onSort={handleSort}
        />
      </div>

      {/* Pagination */}
      <Pagination
        pagination={{ ...pagination, page }}
        onPageChange={handlePageChange}
      />

      {/* Add / Edit Modal */}
      {showAddEdit && (
        <EmployeeModal
          employee={editEmployee}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteModal
          employee={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default EmployeesPage;
