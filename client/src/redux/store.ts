import { configureStore } from '@reduxjs/toolkit'
import contactReducer from './contactSlice'
import hospitalReducer from './hospitalSlice'
import incidentReducer from './incidentSlice'
import messageReducer from './messageSlice'
import notifyReducer from './notifySlice'
import profileReducer from './profileSlice'
import snackbarReducer from './snackbarSlice'
import storageReducer from './storageSlice'
/**
 * Redux Store Configuration
 *
 * This file sets up the central Redux store for the application.
 *
 * Key aspects:
 * - Uses configureStore from @reduxjs/toolkit to create the store.
 * - Combines reducers for messages and contacts.
 * - Exports the configured store and AppDispatch type.
 *
 * Store structure:
 * - messageState: Managed by messageReducer
 * - contactState: Managed by contactReducer
 *
 * Types:
 * - AppDispatch: Exported for use in typed dispatch calls.
 * - RootState: Commented out, but can be used for accessing full state type.
 *
 * Usage:
 * Import this store in the main app file to provide Redux state management
 * to the entire application.
 */

// Configure the Redux store
export const store = configureStore({
  reducer: {
    messageState: messageReducer, // Reducer for managing message state
    contactState: contactReducer, // Reducer for managing contact state
    incidentState: incidentReducer, // Reducer for managing incident state
    profileState: profileReducer, // Reducer for managing profile state
    snackbarState: snackbarReducer, // Reducer for managing snackbar state
    storage: storageReducer, // Reducer for managing storage state
    hospital: hospitalReducer, // Reducer for managing hospital state
    notifyState: notifyReducer, // Reducer for managing notification state
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>
// Uncomment above line to use RootState type for accessing full state type

// Export AppDispatch type for use in typed dispatch calls
export type AppDispatch = typeof store.dispatch

export type RootState = ReturnType<typeof store.getState>
