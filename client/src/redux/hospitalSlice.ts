import IHospital from '@/models/Hospital'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import request from '../utils/request'
import { HospitalState } from '../utils/types'

/* ---------------------- Async Thunk: Fetch Hospital by ID ---------------------- */
/**
 * Fetch hospital details from API using hospital ID.
 */
export const fetchHospitalById = createAsyncThunk(
  'hospital/fetchById',
  async (hospitalId: string, { rejectWithValue }) => {
    try {
      const response = await request(`/api/hospital/${hospitalId}`, {
        method: 'GET',
      })
      return response // Return hospital data on success
    } catch (error) {
      return rejectWithValue(error) // Return error to Redux state
    }
  },
)

/* ---------------------- Initial State ---------------------- */
const initialState: HospitalState = {
  hospitalData: null,
  loading: false,
  error: null,
}

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitalById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchHospitalById.fulfilled,
        (state, action: PayloadAction<IHospital>) => {
          state.loading = false
          state.hospitalData = action.payload
        },
      )
      .addCase(fetchHospitalById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

/* ---------------------- Export Actions & Reducer ---------------------- */
export const { setHospital, clearHospital } = hospitalSlice.actions
export default hospitalSlice.reducer
