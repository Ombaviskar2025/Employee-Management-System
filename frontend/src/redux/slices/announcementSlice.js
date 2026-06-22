import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/announcements");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch announcements.");
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  "announcements/create",
  async (annData, { rejectWithValue }) => {
    try {
      const response = await api.post("/announcements", annData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create announcement.");
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  "announcements/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/announcements/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete announcement.");
    }
  }
);

const announcementSlice = createSlice({
  name: "announcements",
  initialState: {
    announcements: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => { state.loading = true; })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.announcements.unshift(action.payload);
        toast.success("Announcement posted successfully! 📢");
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter(a => a._id !== action.payload);
        toast.success("Announcement deleted!");
      });
  }
});

export default announcementSlice.reducer;
