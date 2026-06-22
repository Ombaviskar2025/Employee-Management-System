import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

export const applyLeave = createAsyncThunk(
  "leaves/apply",
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await api.post("/leaves", leaveData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit leave request.");
    }
  }
);

export const fetchMyLeaves = createAsyncThunk(
  "leaves/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/leaves/my-leaves");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch your leave requests.");
    }
  }
);

export const fetchAllLeaves = createAsyncThunk(
  "leaves/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/leaves");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch leave records.");
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  "leaves/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/leaves/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update leave status.");
    }
  }
);

const leaveSlice = createSlice({
  name: "leaves",
  initialState: {
    leaves: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.leaves.unshift(action.payload);
        toast.success("Leave applied successfully! 📅");
      })
      .addCase(fetchMyLeaves.pending, (state) => { state.loading = true; })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
      })
      .addCase(fetchMyLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllLeaves.pending, (state) => { state.loading = true; })
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
      })
      .addCase(fetchAllLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        const index = state.leaves.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        toast.success(`Leave request ${action.payload.status.toLowerCase()}!`);
      });
  }
});

export default leaveSlice.reducer;
