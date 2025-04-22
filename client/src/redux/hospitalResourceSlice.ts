import HospitalResource from "@/models/HospitalResource";
import request from "@/utils/request";
import { HospitalResourceState } from "@/utils/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Initial state for the message slice
const initialState: HospitalResourceState = {
  resources: [],
  hospitalResourceGroupedByResource: {},
  loading: false, // Indicates if a message operation is in progress
  error: null, // Stores any error that occurred during message operations
};

/* ---------------------- Async Thunk to Fetch Hospital Resource Requests ---------------------- */
const fetchHospitalResourcesForSpecificHospital = createAsyncThunk(
  "hospitalResources/fetchHospitalResourcesForSpecificHospital",
  async (hospitalId: string) => {
    try {
      const response = await request(
        `/api/hospital-resource/allResources/${hospitalId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching hostpitals:", error);
      throw error;
    }
  },
);

export const fetchAllHospitalResources = createAsyncThunk(
  "hospitalResources/fetchAllHospitalResources",
  async () => {
    try {
      const response = await request(`/api/hospital-resource`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      return response;
    } catch (error) {
      console.error("Error fetching all hospital resources:", error);
      throw error;
    }
  },
);

export const searchHospitalResourcesByName = createAsyncThunk(
  "hospitalResources/searchHospitalResourcesByName",
  async (resourceName: string) => {
    try {
      const response = await request(
        `/api/hospital-resource/search/${resourceName}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching all hospital resources:", error);
      throw error;
    }
  },
);
const hospitalResourceRequestSlice = createSlice({
  name: "hospitalReasourceRequests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitalResourcesForSpecificHospital.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchHospitalResourcesForSpecificHospital.fulfilled,
        (state, action: PayloadAction<HospitalResource[]>) => {
          state.resources = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchAllHospitalResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllHospitalResources.fulfilled,
        (state, action: PayloadAction<Record<string, HospitalResource[]>>) => {
          state.hospitalResourceGroupedByResource = action.payload; // Update the resources in the state
          state.loading = false;
        },
      )
      .addCase(fetchAllHospitalResources.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch hospital resources";
      })
      .addCase(
        searchHospitalResourcesByName.fulfilled,
        (state, action: PayloadAction<Record<string, HospitalResource[]>>) => {
          state.hospitalResourceGroupedByResource = action.payload; // Update the resources in the state
          state.loading = false;
        },
      );
  },
});

export { fetchHospitalResourcesForSpecificHospital };
export default hospitalResourceRequestSlice.reducer;
