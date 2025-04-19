import HospitalResource from "@/models/HospitalResource";
import { IHospitalResourceRequest } from "@/models/HospitalResourceRequest";
import request from "@/utils/request";
import { HospitalResourceState } from "@/utils/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Initial state for the message slice
const initialState: HospitalResourceState = {
  resources: [],
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

// const fetchAllResources = createAsyncThunk(
//   "hospitalResourceRequests/fetchOutgoingHospitalResourceRequests",
//   async (hospitalId: string) => {
//     try {
//       const response = await request(
//         `/api/hospital-resources-requests/${hospitalId}/outgoing`,
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         },
//       );
//       return response;
//     } catch (error) {
//       console.error("Error fetching hostpitals:", error);
//       throw error;
//     }
//   },
// );

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
  },
});

export {
  fetchHospitalResourcesForSpecificHospital,
};
export default hospitalResourceRequestSlice.reducer 
