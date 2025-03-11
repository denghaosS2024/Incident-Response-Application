import { Types } from 'mongoose';
import Profile, { IProfile } from '../models/Profile';

class ProfileController {
    /**
     * Get profile by userId
     */
    getProfile = async (userId: Types.ObjectId) => {
        const profile = await Profile.findOne({ userId }).exec();
        if (!profile) {
            return { message: "Profile not found. Please create one." }; // 直接返回信息，前端处理
        }
        return profile;
    };

    /**
     * Create or update profile by userId
     * If profile already exists, update it. Otherwise, create a new profile
     */
    upsertProfile = async (userId: Types.ObjectId, profileData: Partial<IProfile>) => {
        const profile = await Profile.findOneAndUpdate(
            { userId }, 
            { $set: profileData }, 
            { new: true, upsert: true } 
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