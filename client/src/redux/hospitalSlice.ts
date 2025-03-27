import IHospital from '@/models/Hospital'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import request from '../utils/request'
import { HospitalState } from '../utils/types'

/* ---------------------- Initial State ---------------------- */
const initialState: HospitalState = {
  hospitalData: null,
  hospitals: [],
  loading: false,
  error: null,
}

/* ---------------------- Async Thunk to Fetch Hospitals ---------------------- */
const fetchHospitals = createAsyncThunk('hospital/fetchHospitals', async () => {
  try {
    const response = await request('/api/hospital', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return response
  } catch (error) {
    console.error('Error fetching hostpitals:', error)
    throw error
  }
})

/* ---------------------- Redux Slice ---------------------- */
const hospitalSlice = createSlice({
  name: 'hospital',
  initialState,
  reducers: {
    /**
     * Manually set hospital data in Redux.
     */
    setHospital: (state, action: PayloadAction<IHospital>) => {
      state.hospitalData = action.payload
    },
    /**
     * Clear hospital data from Redux store.
     */
    clearHospital: (state) => {
      state.hospitalData = null
      state.error = null
      state.loading = false
    },
    /**
     * Set loading status for hospital-related operations
     */
    setHospitalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    /**
     * Set error message for hospital-related operations
     */
    setHospitalError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchHospitals.fulfilled,
        (state, action: PayloadAction<IHospital[]>) => {
          state.hospitals = action.payload
          state.loading = false
        },
      )
  },
})

/* ---------------------- Export Actions & Reducer ---------------------- */
export const {
  setHospital,
  clearHospital,
  setHospitalLoading,
  setHospitalError,
} = hospitalSlice.actions

export { fetchHospitals }

export default hospitalSlice.reducer
