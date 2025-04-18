import { IHospitalResourceRequest } from "@/models/HospitalResourceRequest";
import request from "@/utils/request";
import { HospitalResourceRequestState } from "@/utils/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Initial state for the message slice
const initialState: HospitalResourceRequestState = {
  incomingRequests: [],
  outgoingRequests: [],
  loading: false, // Indicates if a message operation is in progress
  error: null, // Stores any error that occurred during message operations
};


/* ---------------------- Async Thunk to Fetch Hospital Resource Requests ---------------------- */
const fetchIncomingHospitalResourceRequests = createAsyncThunk(
  "hospitalResourceRequests/fetchIncomingHospitalResourceRequests",
  async (hospitalId: string) => {
    try {
      const response = await request(
        `/api/hospital-resources-requests/${hospitalId}/incoming`,
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

const fetchOutgoingHospitalResourceRequests = createAsyncThunk(
  "hospitalResourceRequests/fetchOutgoingHospitalResourceRequests",
  async (hospitalId: string) => {
    try {
      const response = await request(
        `/api/hospital-resources-requests/${hospitalId}/outgoing`,
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

const hospitalResourceRequestSlice = createSlice({
    name: "hospitalReasourceRequests",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
    builder
      .addCase(fetchIncomingHospitalResourceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchIncomingHospitalResourceRequests.fulfilled,
        (state, action: PayloadAction<IHospitalResourceRequest[]>) => {
          state.incomingRequests = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchOutgoingHospitalResourceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOutgoingHospitalResourceRequests.fulfilled,
        (state, action: PayloadAction<IHospitalResourceRequest[]>) => {
          state.outgoingRequests = action.payload;
          state.loading = false;
        },
      );
  },
});

export {
  fetchIncomingHospitalResourceRequests,
  fetchOutgoingHospitalResourceRequests,
};
export default hospitalResourceRequestSlice.reducer 
