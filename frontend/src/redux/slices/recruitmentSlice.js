import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

export const fetchJobs = createAsyncThunk(
  "recruitment/fetchJobs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/recruitment/jobs");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch jobs.");
    }
  }
);

export const createJob = createAsyncThunk(
  "recruitment/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await api.post("/recruitment/jobs", jobData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create job opening.");
    }
  }
);

export const updateJob = createAsyncThunk(
  "recruitment/updateJob",
  async ({ id, jobData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/recruitment/jobs/${id}`, jobData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update job opening.");
    }
  }
);

export const deleteJob = createAsyncThunk(
  "recruitment/deleteJob",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/recruitment/jobs/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete job.");
    }
  }
);

export const applyToJob = createAsyncThunk(
  "recruitment/apply",
  async ({ jobId, appData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/recruitment/jobs/${jobId}/apply`, appData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Application submission failed.");
    }
  }
);

export const fetchApplications = createAsyncThunk(
  "recruitment/fetchApps",
  async (jobId = null, { rejectWithValue }) => {
    try {
      const url = jobId ? `/recruitment/jobs/${jobId}/applications` : "/recruitment/applications";
      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch applications.");
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  "recruitment/updateAppStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/recruitment/applications/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status.");
    }
  }
);

const recruitmentSlice = createSlice({
  name: "recruitment",
  initialState: {
    jobs: [],
    applications: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
        toast.success("Job opening created! 💼");
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(j => j._id === action.payload._id);
        if (index !== -1) { state.jobs[index] = action.payload; }
        toast.success("Job posting updated!");
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(j => j._id !== action.payload);
        toast.success("Job posting deleted.");
      })
      .addCase(applyToJob.fulfilled, () => {
        toast.success("Thank you! Your application has been submitted successfully.");
      })
      .addCase(fetchApplications.pending, (state) => { state.loading = true; })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const index = state.applications.findIndex(a => a._id === action.payload._id);
        if (index !== -1) { state.applications[index] = action.payload; }
        toast.success(`Application updated to ${action.payload.status}`);
      });
  }
});

export default recruitmentSlice.reducer;
