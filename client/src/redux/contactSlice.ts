import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import IUser from "../models/User";
import request from "../utils/request";
import { ContactsState } from "../utils/types";

// Initial state for the contact slice
const initialState: ContactsState = {
  contacts: [], // Array of user objects
  loading: true, // Indicates if a contact operation is in progress
  error: null, // Stores any error that occurred during contact operations
};

// Interface for the payload of the loadContacts action
interface IContactsPayload {
  users: IUser[];
}

// Async thunk for fetching all contacts from the API
const loadContacts = createAsyncThunk("contacts/loadContacts", async () => {
  let users = await request<IUser[]>("/api/users");
  users = users.filter((user) => user.username != "System");
  return { users } as IContactsPayload;
});

// Async thunk for fetching filtered contacts based on role
const loadFilteredContacts = createAsyncThunk(
  "contacts/loadFilteredContacts",
  async (currentUserRole: string) => {
    const roleContactMap: Record<string, string[]> = {
      Citizen: ["Citizen", "Administrator"],
      Dispatch: ["Dispatch", "Police", "Fire", "Administrator"],
      Police: ["Dispatch", "Police", "Fire", "Administrator"],
      Fire: ["Dispatch", "Police", "Fire", "Administrator"],
      Nurse: ["Nurse", "Administrator"],
      Administrator: [
        "Dispatch",
        "Police",
        "Fire",
        "Nurse",
        "Citizen",
        "Administrator",
      ],
    };

    const users = await request<IUser[]>("/api/users");
    const owner = localStorage.getItem("uid") ?? "";
    const allowedRoles = roleContactMap[currentUserRole] || [];
    let filteredUsers = users.filter(
      (user) => user._id !== owner && allowedRoles.includes(user.role),
    );
    filteredUsers = filteredUsers.filter((user) => user.username != "System");
    return { users: filteredUsers } as IContactsPayload;
  },
);

// Create the contact slice with reducers and extra reducers
export const contactSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle the fulfilled state of loadContacts
    builder
      .addCase(
        loadContacts.fulfilled,
        (state, action: PayloadAction<IContactsPayload>) => {
          const { users } = action.payload;
          state.contacts = users;
          state.loading = false;
        },
      )
      .addCase(loadContacts.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        loadFilteredContacts.fulfilled,
        (state, action: PayloadAction<IContactsPayload>) => {
          const { users } = action.payload;
          state.contacts = users;
          state.loading = false;
        },
      )
      .addCase(loadFilteredContacts.pending, (state) => {
        state.loading = true;
      });
  },
});

// Export the loadContacts and loadFilteredContacts async thunks
export { loadContacts, loadFilteredContacts };

// Export the reducer as the default export
export default contactSlice.reducer;
