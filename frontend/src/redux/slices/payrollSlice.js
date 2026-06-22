import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

export const fetchPayroll = createAsyncThunk(
  "payroll/fetch",
  async (month, { rejectWithValue }) => {
    try {
      const response = await api.get("/payroll", { params: { month } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch payroll.");
    }
  }
);

export const updatePayrollStatus = createAsyncThunk(
  "payroll/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/payroll/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status.");
    }
  }
);

export const processAllPayroll = createAsyncThunk(
  "payroll/processAll",
  async (month, { rejectWithValue }) => {
    try {
      await api.post("/payroll/process-all", { month });
      return month;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to process payroll.");
    }
  }
);

export const fetchMyPayroll = createAsyncThunk(
  "payroll/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/payroll/my-payroll");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch payslips.");
    }
  }
);

const payrollSlice = createSlice({
  name: "payroll",
  initialState: {
    records: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayroll.pending, (state) => { state.loading = true; })
      .addCase(fetchPayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePayrollStatus.fulfilled, (state, action) => {
        const index = state.records.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        toast.success("Payroll record updated!");
      })
      .addCase(processAllPayroll.pending, (state) => { state.loading = true; })
      .addCase(processAllPayroll.fulfilled, (state) => {
        state.loading = false;
        state.records = state.records.map(r => ({ ...r, status: "Paid" }));
        toast.success("Processed all payroll successfully!");
      })
      .addCase(fetchMyPayroll.pending, (state) => { state.loading = true; })
      .addCase(fetchMyPayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchMyPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default payrollSlice.reducer;
