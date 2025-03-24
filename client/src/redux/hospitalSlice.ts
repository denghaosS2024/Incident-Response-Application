import IHospital from '@/models/Hospital'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HospitalState } from '../utils/types'

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

  
})

/* ---------------------- Export Actions & Reducer ---------------------- */
export const {
  setHospital,
  clearHospital,
  setHospitalLoading,
  setHospitalError,
} = hospitalSlice.actions

export default hospitalSlice.reducer
