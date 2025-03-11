/**
 * ProfileController.spec.ts
 * Tests for ProfileController functionality (getProfile, upsertProfile, deleteProfile)
 */

import { Types } from 'mongoose';
import ProfileController from '../../src/controllers/ProfileController';
import Profile from '../../src/models/Profile';
import * as TestDatabase from '../utils/TestDatabase';


describe('ProfileController', () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  const userId = new Types.ObjectId();
  const profileData = {
    userId,
    name: 'John Doe',
    dob: new Date('1990-01-01'),
    sex: 'Male' as "Male",
    address: '123 Main St, City, Country',
    phone: '123-456-7890',
    email: 'john.doe@example.com',
    medicalInfo: {
      condition: 'Diabetes',
      drugs: 'Metformin',
      allergies: 'Peanuts',
    },
    emergencyContacts: [
        { name: 'Jane Doe', phone: '987-654-3210', email: 'jane.doe@example.com' },
        { name: 'Mike Smith', phone: '555-555-5555', email: 'mike.smith@example.com' }
    ],
  };

  it('should create a new profile when upserting with a new userId', async () => {
    const profile = await ProfileController.upsertProfile(userId, profileData);
    
    expect(profile.userId.toString()).toBe(userId.toString());
    expect(profile.name).toBe(profileData.name);
    expect(profile.dob.toISOString()).toBe(profileData.dob.toISOString());
    expect(profile.sex).toBe(profileData.sex);
    expect(profile.address).toBe(profileData.address);
    expect(profile.phone).toBe(profileData.phone);
    expect(profile.email).toBe(profileData.email);
    expect(profile.medicalInfo.condition).toBe(profileData.medicalInfo.condition);
    expect(profile.medicalInfo.drugs).toBe(profileData.medicalInfo.drugs);
    expect(profile.medicalInfo.allergies).toBe(profileData.medicalInfo.allergies);
    expect(profile.emergencyContacts.length).toBe(2);
    expect(profile.emergencyContacts[0].name).toBe(profileData.emergencyContacts[0].name);
  });

  it('should update an existing profile when upserting with the same userId', async () => {
    const updatedData = { ...profileData, name: 'Updated Name', phone: '999-999-9999' };

    const updatedProfile = await ProfileController.upsertProfile(userId, updatedData);

    expect(updatedProfile.userId.toString()).toBe(userId.toString());
    expect(updatedProfile.name).toBe('Updated Name');
    expect(updatedProfile.phone).toBe('999-999-9999');
  });

  it('should retrieve a profile by userId', async () => {
    const foundProfile = await ProfileController.getProfile(userId);
    
    expect(foundProfile).toBeDefined();
    if ('userId' in foundProfile) {
        expect(foundProfile.userId.toString()).toBe(userId.toString());
        expect(foundProfile.name).toBe('Updated Name');
    } else {
        throw new Error("Expected a profile, but got an error message.");
    }
  });

  it('should return "Profile not found" when no profile exists for a userId', async () => {
    const randomUserId = new Types.ObjectId();
    const result = await ProfileController.getProfile(randomUserId);
    expect(result).toEqual({ message: 'Profile not found. Please create one.' });
  });

  it('should delete an existing profile by userId', async () => {
    const deleteResult = await ProfileController.deleteProfile(userId);
    
    expect(deleteResult).toEqual({ message: 'Profile deleted successfully' });

    const foundProfile = await Profile.findOne({ userId });
    expect(foundProfile).toBeNull();
  });

  it('should throw an error when trying to delete a non-existing profile', async () => {
    expect.assertions(1);
    try {
      await ProfileController.deleteProfile(userId);
    } catch (e) {
      const error = e as Error;
      expect(error.message).toBe('Profile not found');
    }
  });
});