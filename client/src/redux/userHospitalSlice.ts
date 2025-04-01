import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserHospitalState {
  currentHospitalId: string | null
}

const initialState: UserHospitalState = {
  currentHospitalId: null
}

export const userHospitalSlice = createSlice({
  name: 'userHospital',
  initialState,
  reducers: {
    /**
     * Set the current user's hospital ID
     */
    setCurrentHospitalId: (state, action: PayloadAction<string | null>) => {
      state.currentHospitalId = action.payload
    },
    /**
     * Clear the current user's hospital ID
     */
    clearCurrentHospitalId: (state) => {
      state.currentHospitalId = null
    }
  }
})

/* Export actions & selectors */
export const { setCurrentHospitalId, clearCurrentHospitalId } = userHospitalSlice.actions

// Selector to get the current hospital ID
export const selectCurrentHospitalId = (state: { userHospital: UserHospitalState }) => state.userHospital.currentHospitalId

export default userHospitalSlice.reducer
