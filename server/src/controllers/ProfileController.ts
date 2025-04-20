import { Types } from "mongoose";
import Profile, { IProfile } from "../models/Profile";

class ProfileController {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private phoneRegex = /^\+?[1-9]\d{1,14}$/;
  /**
   * Get profile by userId
   */
  getProfile = async (userId: Types.ObjectId) => {
    const profile = await Profile.findOne({ userId }).exec();
    if (!profile) {
      return { message: "Profile not found. Please create one." };
    }
    return profile;
  };

  /**
   * Create or update profile by userId
   * If profile already exists, update it. Otherwise, create a new profile
   */
  upsertProfile = async (
    userId: Types.ObjectId,
    profileData: Partial<IProfile>,
  ) => {
    if (profileData.email && !this.emailRegex.test(profileData.email)) {
      throw new Error("Invalid email format");
    }

    if (profileData.phone && !this.phoneRegex.test(profileData.phone)) {
      throw new Error("Invalid phone format");
    }
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: profileData },
      { new: true, upsert: true },
    ).exec();

    if (!profile) {
      throw new Error("Error updating profile");
    }

    return profile;
  };

  /**
   * Delete profile by userId
   */
  deleteProfile = async (userId: Types.ObjectId) => {
    const deletedProfile = await Profile.findOneAndDelete({ userId }).exec();
    if (!deletedProfile) {
      throw new Error("Profile not found");
    }
    return { message: "Profile deleted successfully" };
  };
}

export default new ProfileController();
