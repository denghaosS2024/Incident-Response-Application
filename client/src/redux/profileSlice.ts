import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IEmergencyContact, IProfile } from "../models/Profile";
import request from "../utils/request";
import { ProfileState } from "../utils/types";

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (userId: string) => {
    try {
      const data = await request<IProfile>(`/api/profiles/${userId}`);
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  },
);

export const upsertProfile = createAsyncThunk(
  "profile/upsertProfile",
  async ({ userId, profile }: { userId: string; profile: IProfile }) => {
    try {
      const updatedProfile = await request<IProfile>(
        `/api/profiles/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify(profile),
        },
      );
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
);

/**
 * **Redux Slice**
 */
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    addEmergencyContact: (state, action: PayloadAction<IEmergencyContact>) => {
      if (!state.profile) return;
      state.profile.emergencyContacts.push(action.payload);
    },

    removeEmergencyContact: (state, action: PayloadAction<number>) => {
      if (!state.profile) return;
      state.profile.emergencyContacts.splice(action.payload, 1);
    },

    updateProfileField: (
      state,
      action: PayloadAction<{
        field: keyof IProfile;
        value: IProfile[keyof IProfile];
      }>,
    ) => {
      if (!state.profile) return;
      const { field, value } = action.payload;
      (state.profile[field] as typeof value) = value;
    },

    resetProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch profile";
      })
      .addCase(upsertProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

// **导出 reducers**
export const {
  addEmergencyContact,
  removeEmergencyContact,
  updateProfileField,
  resetProfile,
} = profileSlice.actions;
export default profileSlice.reducer;
