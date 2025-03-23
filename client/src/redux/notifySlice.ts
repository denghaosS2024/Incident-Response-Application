import { PayloadAction } from '@reduxjs/toolkit'

import { createSlice } from '@reduxjs/toolkit'

/**
 * This slice is used to store the notification states of the app
 */
export interface NotifyState {
  hasNewIncident: boolean
  hasGroupNotification: boolean
  showIncidentAlert: boolean
  showMaydayAlert: boolean
  incidentAlertMessage: string
}

const initialState: NotifyState = {
  hasNewIncident: false,
  hasGroupNotification: false,
  showIncidentAlert: false,
  showMaydayAlert: false,
  incidentAlertMessage: '',
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setHasNewIncident: (state, action: PayloadAction<boolean>) => {
      state.hasNewIncident = action.payload
    },
    setHasGroupNotification: (state, action: PayloadAction<boolean>) => {
      state.hasGroupNotification = action.payload
    },
    setShowIncidentAlert: (state, action: PayloadAction<boolean>) => {
      state.showIncidentAlert = action.payload
    },
    setShowMaydayAlert: (state, action: PayloadAction<boolean>) => {
      state.showMaydayAlert = action.payload
    },
    setIncidentAlertMessage: (state, action: PayloadAction<string>) => {
      state.incidentAlertMessage = action.payload
    },
  },
})

export const {
  setHasNewIncident,
  setHasGroupNotification,
  setShowIncidentAlert,
  setShowMaydayAlert,
  setIncidentAlertMessage,
} = appSlice.actions

export default appSlice.reducer
