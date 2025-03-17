import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import IUser from '../models/User'
import request from '../utils/request'
import { ContactsState } from '../utils/types'

// Initial state for the contact slice
const initialState: ContactsState = {
  contacts: [], // Array of user objects
  loading: true, // Indicates if a contact operation is in progress
  error: null, // Stores any error that occurred during contact operations
}

// Interface for the payload of the loadContacts action
interface IContactsPayload {
  users: IUser[]
}

// Async thunk for fetching all contacts from the API
const loadContacts = createAsyncThunk('contacts/loadContacts', async () => {
  const users = await request<IUser[]>('/api/users')
  return { users } as IContactsPayload
})

// Create the contact slice with reducers and extra reducers
export const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle the fulfilled state of loadContacts
    builder
      .addCase(
        loadContacts.fulfilled,
        (state, action: PayloadAction<IContactsPayload>) => {
          const { users } = action.payload
          state.contacts = users
          state.loading = false
        },
      )
      .addCase(loadContacts.pending, (state) => {
        state.loading = true
      })

      .addCase(
        loadMockContacts.fulfilled,
        (state, action: PayloadAction<IContactsPayload>) => {
          const { users } = action.payload
          state.contacts = users
          state.loading = false // Set loading to false after mock data is loaded
        },
      )
      .addCase(loadMockContacts.pending, (state) => {
        state.loading = true // Set loading to true while data is being fetched
      })
  },
})

// Export the loadContacts async thunk
export { loadContacts }

// Export the reducer as the default export
export default contactSlice.reducer

//Export mock data, checking for adding group participants
// Add this to your `contactSlice` file
export const loadMockContacts = createAsyncThunk(
  'contacts/loadMockContacts',
  async () => {
    // Mock data for testing purposes
    const users: IUser[] = [
      { _id: '67c7a1280697d82aef1ac3ec', username: 'test', role: 'Citizen' },
      {
        _id: '67ca7468da683a25ed90e2fd',
        username: 'grouptest',
        role: 'Citizen',
        online: false,
      },
      {
        _id: '67ca7492da683a25ed90e306',
        username: 'participant_test',
        role: 'Citizen',
        online: true,
      },
    ]

    return { users } as IContactsPayload
  },
)
/**
 * Contact Slice
 *
 * This Redux slice manages the state of contacts in the application.
 *
 * Key components:
 * - Initial state: Defines the structure for contacts, loading state, and errors.
 * - loadContacts: An async thunk for fetching all contacts from the API.
 * - contactSlice: The main slice containing reducers and extra reducers.
 *
 * State structure:
 * - contacts: An array of user objects.
 * - loading: Boolean indicating if a contact operation is in progress.
 * - error: Stores any error that occurred during contact operations.
 *
 * Actions:
 * - loadContacts: Fetches and updates the list of contacts.
 *
 * Extra Reducers:
 * - Handles the fulfilled state of loadContacts, updating the contacts array.
 *
 * Usage:
 * This slice is combined in the store and provides actions and state
 * for managing contacts throughout the application.
 */
