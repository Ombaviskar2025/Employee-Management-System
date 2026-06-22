import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

export const uploadDocument = createAsyncThunk(
  "documents/upload",
  async (docData, { rejectWithValue }) => {
    try {
      const response = await api.post("/documents/upload", docData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to upload document.");
    }
  }
);

export const fetchMyDocuments = createAsyncThunk(
  "documents/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/documents/my-documents");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch your documents.");
    }
  }
);

export const fetchAllDocuments = createAsyncThunk(
  "documents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/documents");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch document records.");
    }
  }
);

export const updateDocumentStatus = createAsyncThunk(
  "documents/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/documents/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status.");
    }
  }
);

const documentSlice = createSlice({
  name: "documents",
  initialState: {
    documents: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.documents.unshift(action.payload);
        toast.success("Document uploaded successfully! 📁");
      })
      .addCase(fetchMyDocuments.pending, (state) => { state.loading = true; })
      .addCase(fetchMyDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchAllDocuments.pending, (state) => { state.loading = true; })
      .addCase(fetchAllDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(updateDocumentStatus.fulfilled, (state, action) => {
        const index = state.documents.findIndex(d => d._id === action.payload._id);
        if (index !== -1) { state.documents[index] = action.payload; }
        toast.success(`Document status updated to ${action.payload.status}`);
      });
  }
});

export default documentSlice.reducer;
