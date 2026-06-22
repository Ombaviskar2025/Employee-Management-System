import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

export const clockIn = createAsyncThunk(
  "attendance/clockIn",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/attendance/checkin");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Clock in failed.");
    }
  }
);

export const clockOut = createAsyncThunk(
  "attendance/clockOut",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/attendance/checkout");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Clock out failed.");
    }
  }
);

export const fetchMyAttendance = createAsyncThunk(
  "attendance/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/attendance/my-attendance");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch attendance.");
    }
  }
);

export const fetchAllAttendance = createAsyncThunk(
  "attendance/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/attendance");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch attendance records.");
    }
  }
);

export const submitManualAttendance = createAsyncThunk(
  "attendance/submitManual",
  async (attendanceData, { rejectWithValue }) => {
    try {
      const response = await api.post("/attendance/manual", attendanceData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to log attendance manually.");
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    records: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(clockIn.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
        toast.success("Clocked in successfully!");
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        const index = state.records.findIndex(r => r.date === action.payload.date);
        if (index !== -1) {
          state.records[index] = action.payload;
        } else {
          state.records.unshift(action.payload);
        }
        toast.success("Clocked out successfully!");
      })
      .addCase(fetchMyAttendance.pending, (state) => { state.loading = true; })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllAttendance.pending, (state) => { state.loading = true; })
      .addCase(fetchAllAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAllAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitManualAttendance.fulfilled, (state, action) => {
        const index = state.records.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        } else {
          state.records.unshift(action.payload);
        }
        toast.success("Attendance logged successfully!");
      });
  }
});

export default attendanceSlice.reducer;
