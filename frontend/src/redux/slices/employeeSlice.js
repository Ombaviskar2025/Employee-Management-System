/**
 * employeeSlice.js
 * Redux Toolkit slice for employee state management.
 * Handles CRUD operations and pagination state.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import employeeService from "../../services/employeeService";
import toast from "react-hot-toast";

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchEmployees = createAsyncThunk(
  "employees/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const data = await employeeService.getEmployees(params);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch employees.";
      return rejectWithValue(message);
    }
  }
);

export const fetchEmployee = createAsyncThunk(
  "employees/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const data = await employeeService.getEmployee(id);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Employee not found.";
      return rejectWithValue(message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  "employees/create",
  async (employeeData, { rejectWithValue }) => {
    try {
      const data = await employeeService.createEmployee(employeeData);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create employee.";
      return rejectWithValue(message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employees/update",
  async ({ id, employeeData }, { rejectWithValue }) => {
    try {
      const data = await employeeService.updateEmployee(id, employeeData);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update employee.";
      return rejectWithValue(message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employees/delete",
  async (id, { rejectWithValue }) => {
    try {
      await employeeService.deleteEmployee(id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete employee.";
      return rejectWithValue(message);
    }
  }
);

export const fetchStats = createAsyncThunk(
  "employees/stats",
  async (_, { rejectWithValue }) => {
    try {
      const data = await employeeService.getStats();
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch stats.";
      return rejectWithValue(message);
    }
  }
);

export const approveEmployee = createAsyncThunk(
  "employees/approve",
  async (id, { rejectWithValue }) => {
    try {
      const data = await employeeService.approveEmployee(id);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to approve employee.";
      return rejectWithValue(message);
    }
  }
);

export const rejectEmployee = createAsyncThunk(
  "employees/reject",
  async (id, { rejectWithValue }) => {
    try {
      await employeeService.rejectEmployee(id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to reject employee.";
      return rejectWithValue(message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    employees: [],
    selectedEmployee: null,
    stats: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    loading: false,
    statsLoading: false,
    error: null,
  },
  reducers: {
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch All ───────────────────────────────────────────────────────────
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Fetch One ───────────────────────────────────────────────────────────
    builder
      .addCase(fetchEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEmployee = action.payload;
      })
      .addCase(fetchEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Create ──────────────────────────────────────────────────────────────
    builder
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.unshift(action.payload); // Prepend new employee
        state.pagination.total += 1;
        toast.success("Employee added successfully! 🎉");
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Update ──────────────────────────────────────────────────────────────
    builder
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.employees.findIndex(
          (e) => e._id === action.payload._id
        );
        if (index !== -1) state.employees[index] = action.payload;
        state.selectedEmployee = null;
        toast.success("Employee updated successfully! ✅");
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Delete ──────────────────────────────────────────────────────────────
    builder
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(
          (e) => e._id !== action.payload
        );
        state.pagination.total -= 1;
        toast.success("Employee deleted successfully! 🗑️");
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Stats ───────────────────────────────────────────────────────────────
    builder
      .addCase(fetchStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.statsLoading = false;
      });

    // ── Approve Employee ──
    builder
      .addCase(approveEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.map((emp) =>
          emp._id === action.payload._id ? action.payload : emp
        );
        toast.success("Employee approved successfully! 🎉");
      })
      .addCase(approveEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Reject Employee ──
    builder
      .addCase(rejectEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter((emp) => emp._id !== action.payload);
        toast.success("Employee registration rejected. ❌");
      })
      .addCase(rejectEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearSelectedEmployee, clearError, setPage } =
  employeeSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectEmployees = (state) => state.employees.employees;
export const selectSelectedEmployee = (state) => state.employees.selectedEmployee;
export const selectPagination = (state) => state.employees.pagination;
export const selectEmployeeLoading = (state) => state.employees.loading;
export const selectStats = (state) => state.employees.stats;

export default employeeSlice.reducer;
