import { Types } from "mongoose";
import ProfileController from "../../src/controllers/ProfileController";
import Profile from "../../src/models/Profile";

jest.mock("../../src/models/Profile");

describe("ProfileController - Email & Phone Validation", () => {
  const userId = new Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();

    (Profile.findOneAndUpdate as jest.Mock).mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));
  });

  it("should throw an error when upserting profile with invalid email", async () => {
    const invalidProfileData = {
      email: "invalid-email.com",
      phone: "+1234567890",
    };

    await expect(
      ProfileController.upsertProfile(userId, invalidProfileData),
    ).rejects.toThrow("Invalid email format");
  });

  it("should throw an error when upserting profile with invalid phone", async () => {
    const invalidProfileData = {
      email: "valid@example.com",
      phone: "01234",
    };

    await expect(
      ProfileController.upsertProfile(userId, invalidProfileData),
    ).rejects.toThrow("Invalid phone format");
  });

  it("should pass when upserting with valid email and phone", async () => {
    const validProfileData = {
      email: "valid@example.com",
      phone: "+12345678901",
    };

    (Profile.findOneAndUpdate as jest.Mock).mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({
        userId,
        ...validProfileData,
      }),
    }));

    const result = await ProfileController.upsertProfile(
      userId,
      validProfileData,
    );
    expect(result.email).toBe(validProfileData.email);
    expect(result.phone).toBe(validProfileData.phone);
  });
});
