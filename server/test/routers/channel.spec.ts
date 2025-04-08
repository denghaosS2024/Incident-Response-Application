import request from "supertest";

import { Types } from "mongoose";
import app from "../../src/app";
import UserController from "../../src/controllers/UserController";
import { PUBLIC_CHANNEL_NAME } from "../../src/models/Channel";
import Profile from "../../src/models/Profile";
import ROLES from "../../src/utils/Roles";
import SystemDefinedGroups from "../../src/utils/SystemDefinedGroups";
import * as TestDatabase from "../utils/TestDatabase";

jest.mock("@google-cloud/storage", () => {
  const mockGetSignedUrl = jest.fn().mockResolvedValue(["mock-signed-url"]);
  const mockFile = jest.fn(() => ({ getSignedUrl: mockGetSignedUrl }));
  const mockBucket = jest.fn(() => ({ file: mockFile }));
  const mockStorage = jest.fn().mockImplementation(() => ({
    bucket: mockBucket,
  }));

  return { Storage: mockStorage };
});

describe("Router - Channel", () => {
  let userA: string;
  let userB: string;
  let userC: string;
  let channelId: string;
  let messageId: string;

  jest.setTimeout(10000);

  beforeAll(async () => {
    await TestDatabase.connect();

    userA = (
      await UserController.register(
        "Channel-User-A",
        "password-A",
        ROLES.CITIZEN,
      )
    )._id.toHexString();
    userB = (
      await UserController.register(
        "Channel-User-B",
        "password-B",
        ROLES.CITIZEN,
      )
    )._id.toHexString();
    userC = (
      await UserController.register(
        "Channel-User-C",
        "password-C",
        ROLES.CITIZEN,
      )
    )._id.toHexString();
  });

  it("lists system channels", async () => {
    const { body: channels } = await request(app)
      .get("/api/channels")
      .expect(200);

    expect(channels.length).toBe(SystemDefinedGroups.length);
  });

  it("creates a new channel excluding optional fields", async () => {
    const {
      body: { _id, users },
    } = await request(app)
      .post("/api/channels")
      .send({
        name: "Test Channel 1",
        users: [userA, userB],
      })
      .expect(200);

    expect(_id).toBeDefined();
    expect(users.length).toBe(2);
    expect(users[0].password).not.toBeDefined();

    channelId = _id;
  });

  it("creates a new channel including optional fields", async () => {
    const {
      body: { _id, users, description, owner, closed },
    } = await request(app)
      .post("/api/channels")
      .send({
        name: "Test Channel 2",
        description: "This is a test channel",
        users: [userA, userB],
        owner: userA,
        closed: true,
      })
      .expect(200);

    expect(_id).toBeDefined();
    expect(users.length).toBe(2);
    expect(users[0].password).not.toBeDefined();
    expect(users[1].password).not.toBeDefined();
    expect(description).toBe("This is a test channel");
    expect(owner).toBeDefined();
    expect(closed).toBe(true);
  });

  it("lists existing channels", async () => {
    const { body: channels } = await request(app)
      .get("/api/channels")
      .expect(200);

    // system channels + newly created channels
    expect(channels.length).toBe(SystemDefinedGroups.length + 2);
  });

  // Due to schema change and adding mandatory name to channels, this test is redundant
  it.skip("returns the existing channel if users are essentially the same", async () => {
    const {
      body: { _id, users },
    } = await request(app)
      .post("/api/channels")
      .send({
        name: "test-same-users",
        users: [userB, userA],
      })
      .expect(200);

    expect(_id).toBe(channelId);
    expect(users.length).toBe(2);
  });

  it("does not allow to create the public channel manually", async () => {
    await request(app)
      .post("/api/channels")
      .send({ name: PUBLIC_CHANNEL_NAME, users: [] })
      .expect(400);
  });

  it("lists existing channels that a user joined", async () => {
    const { body: channels } = await request(app)
      .get(`/api/channels?user=${userC}`)
      .expect(200);

    // Public and Citizens as userC is ROLES.CITIZEN
    expect(channels.length).toBe(2);
  });

  it("Can get channel by name", async () => {
    const { body: channel } = await request(app)
      .get(`/api/channels/name/${PUBLIC_CHANNEL_NAME}`)
      .expect(200);
    expect(channel).toBeDefined();
    expect(channel.name).toBe(PUBLIC_CHANNEL_NAME);
  });

  it("should return 404 if the channel name is invalid", async () => {
    const invalidChannelName = "invalid-channel-name";
    const { body } = await request(app)
      .get(`/api/channels/name/${invalidChannelName}`)
      .expect(404);
    expect(body).toHaveProperty("message");
    expect(body.message).toMatch(`Channel(${invalidChannelName}) not found.`);
  });

  describe("Append a message to a channel", () => {
    it("appends a new message into the channel", async () => {
      const content = "this is a simple message";
      const { body: message } = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set("x-application-uid", userA)
        .send({ content: content, isAlert: false })
        .expect(200);

      messageId = message._id;

      expect(messageId).toBeDefined();
      expect(message.content).toBe(content);
      expect(message.sender._id).toBe(userA);
      expect(message.timestamp).toBeDefined();
    });

    it("appends a new alert into the channel", async () => {
      const content = "P.A.R";
      const { body: message } = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set("x-application-uid", userA)
        .send({ content: content, isAlert: true })
        .expect(200);

      expect(messageId).toBeDefined();
      expect(message.content).toBe(content);
      expect(message.sender._id).toBe(userA);
      expect(message.isAlert).toBe(true);
      expect(message.timestamp).toBeDefined();
    });

    it("should return 404 if the channel ID is invalid", async () => {
      const invalidChannelId = "64f0413bd1fd8a7a6e8a1f21";
      const { body } = await request(app)
        .post(`/api/channels/${invalidChannelId}/messages`)
        .set("x-application-uid", userA)
        .send({ content: "test message", isAlert: false })
        .expect(404);

      expect(body).toHaveProperty("message");
      expect(body.message).toMatch(`Channel(${invalidChannelId}) not found.`);
    });
  });

  describe("Redirect to public channel messages", () => {
    it("should redirect to the public channel messages", async () => {
      const { headers } = await request(app)
        .get("/api/channels/public/messages")
        .expect(308);

      expect(headers.location).toMatch(
        /\/api\/channels\/[a-f0-9]{24}\/messages/,
      );
    });
  });

  describe("Get messages in a channel", () => {
    it("lists all messages in the channel", async () => {
      const { body: messages } = await request(app)
        .get(`/api/channels/${channelId}/messages`)
        .expect(200);

      expect(messages.length).toBe(2);
      expect(messages[0]._id).toBe(messageId);
    });

    it("should return 404 if the channel ID is invalid", async () => {
      const invalidChannelId = "64f0413bd1fd8a7a6e8a1f21";
      const { body } = await request(app)
        .get(`/api/channels/${invalidChannelId}/messages`)
        .expect(404);

      expect(body).toHaveProperty("message");
      expect(body.message).toMatch(`Channel(${invalidChannelId}) not found.`);
    });
  });

  it("can delete a channel", async () => {
    const channelName = "channel01";
    await request(app)
      .post("/api/channels")
      .send({
        name: channelName,
        users: [userA, userB],
        owner: userA,
      })
      .expect(200);

    const { body } = await request(app)
      .delete(`/api/channels`)
      .send({ name: channelName })
      .expect(200);

    expect(body.message).toBe(`Channel(${channelName}) deleted`);
  });

  it("should return 400 if the channel name is not provided", async () => {
    const { body } = await request(app)
      .delete("/api/channels")
      .send({})
      .expect(400);

    expect(body).toHaveProperty("message");
    expect(body.message).toBe("Channel name is required");
  });

  it("should return 400 if the channel does not exist", async () => {
    const fakeChannelName = "Non-Existent Channel";
    const { body } = await request(app)
      .delete("/api/channels")
      .send({ name: fakeChannelName })
      .expect(400);

    expect(body).toHaveProperty("message");
    expect(body.message).toMatch(/Channel.*not found/);
  });

  describe("Video Upload URL", () => {
    it("returns a valid video upload URL for an existing channel", async () => {
      // 1) Create a channel in the DB
      const {
        body: { _id },
      } = await request(app)
        .post("/api/channels")
        .send({
          name: "Test Channel For Upload Route",
          users: [userA],
        })
        .expect(200);

      // 2) Call the new GET route
      const { body } = await request(app)
        .get(`/api/channels/${_id}/video-upload-url`)
        .expect(200);

      // 3) Our controller returns { uploadUrl, fileUrl }
      expect(body).toHaveProperty("uploadUrl");
      expect(body).toHaveProperty("fileUrl");
      // We mocked the getSignedUrl to return "mock-signed-url"
      expect(body.uploadUrl).toBe("mock-signed-url");
      // And fileUrl typically starts with https://storage.googleapis.com/
      expect(body.fileUrl).toMatch(/^https:\/\/storage\.googleapis\.com\//);
    });

    it("returns 404 if the channel does not exist", async () => {
      // Provide a random ID that won’t match any existing channel
      const fakeId = "64f0413bd1fd8a7a6e8a1f21";

      // Expect a 404 and an error message from the catch block
      const { body } = await request(app)
        .get(`/api/channels/${fakeId}/video-upload-url`)
        .expect(404);

      // The error response is { message: error.message }
      expect(body).toHaveProperty("message");
      expect(body.message).toMatch(/Channel.*not found/);
    });
  });

  describe("Image Upload URL", () => {
    it("returns a valid video upload URL for an existing channel", async () => {
      const {
        body: { _id },
      } = await request(app)
        .post("/api/channels")
        .send({
          name: "Test Channel For Upload Image",
          users: [userA],
        })
        .expect(200);

      // GET image url
      const { body } = await request(app)
        .get(`/api/channels/${_id}/image-upload-url`)
        .expect(200);

      // Return uploadUrl and fileUrl
      expect(body).toHaveProperty("uploadUrl");
      expect(body).toHaveProperty("fileUrl");
      // We mocked the getSignedUrl to return "mock-signed-url"
      expect(body.uploadUrl).toBe("mock-signed-url");
      // And fileUrl typically starts with https://storage.googleapis.com/
      expect(body.fileUrl).toMatch(/^https:\/\/storage\.googleapis\.com\//);
    });

    it("returns 404 if the channel does not exist", async () => {
      // Provide a random ID that won’t match any existing channel
      const fakeId = "64f0413bd1fd8a7a6e8a1f21";

      // Expect a 404 and an error message from the catch block
      const { body } = await request(app)
        .get(`/api/channels/${fakeId}/image-upload-url`)
        .expect(404);

      // The error response is { message: error.message }
      expect(body).toHaveProperty("message");
      expect(body.message).toMatch(/Channel.*not found/);
    });
  });

  describe("File Upload URL", () => {
    it("returns a valid file upload URL for an existing channel", async () => {
      const {
        body: { _id },
      } = await request(app)
        .post("/api/channels")
        .send({
          name: "Test Channel For Upload File",
          users: [userA],
        })
        .expect(200);

      // Post necessary file information to get url
      const { body } = await request(app)
        .post(`/api/channels/${_id}/file-upload-url`)
        .send({
          fileName: "file",
          fileType: "application/pdf",
          fileExtension: ".pdf",
        })
        .expect(200);

      // Returns uploadUrl and fileUrl
      expect(body).toHaveProperty("uploadUrl");
      expect(body).toHaveProperty("fileUrl");
      // We mocked the getSignedUrl to return "mock-signed-url"
      expect(body.uploadUrl).toBe("mock-signed-url");
      // And fileUrl typically starts with https://storage.googleapis.com/
      expect(body.fileUrl).toMatch(/^https:\/\/storage\.googleapis\.com\//);
      // And fileUrl contains file extension
      expect(body.fileUrl).toContain(".pdf");
      // And fileUrl contains file name
      expect(body.fileUrl).toContain("file");
    });

    it("should return 404 if the channel does not exist", async () => {
      const fakeChannelId = "64f0413bd1fd8a7a6e8a1f21";
      const fileName = "test-file";
      const fileType = "image/jpeg";
      const fileExtension = "jpg";

      const { body } = await request(app)
        .post(`/api/channels/${fakeChannelId}/file-upload-url`)
        .send({ fileName, fileType, fileExtension })
        .expect(404);

      expect(body).toHaveProperty("message");
    });
  });

  describe("Voice Message Upload URL", () => {
    it("returns a valid voice message upload URL for an existing channel", async () => {
      const {
        body: { _id },
      } = await request(app)
        .post("/api/channels")
        .send({
          name: "Test Channel For Upload Voice Message",
          users: [userA],
        })
        .expect(200);

      // Post necessary file information to get url
      const { body } = await request(app)
        .post(`/api/channels/${_id}/voice-upload-url`)
        .send({ fileName: "recording" })
        .expect(200);

      // Returns uploadUrl and fileUrl
      expect(body).toHaveProperty("uploadUrl");
      expect(body).toHaveProperty("fileUrl");
      // We mocked the getSignedUrl to return "mock-signed-url"
      expect(body.uploadUrl).toBe("mock-signed-url");
      // And fileUrl typically starts with https://storage.googleapis.com/
      expect(body.fileUrl).toMatch(/^https:\/\/storage\.googleapis\.com\//);
      // And fileUrl contains file extension
      expect(body.fileUrl).toContain(".webm");
    });

    it("should return 404 if the channel does not exist", async () => {
      const fakeChannelId = "64f0413bd1fd8a7a6e8a1f21";
      const fileName = "test-voice-recording";

      const { body } = await request(app)
        .post(`/api/channels/${fakeChannelId}/voice-upload-url`)
        .send({ fileName })
        .expect(404);

      expect(body).toHaveProperty("message");
    });
  });

  describe("Make a phone call in a channel", () => {
    it("should initiate a phone call between two users and return the phone number", async () => {
      // Create profiles for both users with phone numbers
      await Profile.findOneAndUpdate(
        { userId: new Types.ObjectId(userA) },
        {
          $set: {
            userId: new Types.ObjectId(userA),
            name: "Channel-User-A",
            dob: new Date("1990-01-01"),
            sex: "Male",
            address: "123 Test St",
            phone: "1234567890",
            email: "usera@example.com",
            medicalInfo: {
              condition: "None",
              drugs: "None",
              allergies: "None",
            },
            emergencyContacts: [],
          },
        },
        { new: true, upsert: true },
      );

      await Profile.findOneAndUpdate(
        { userId: new Types.ObjectId(userB) },
        {
          $set: {
            userId: new Types.ObjectId(userB),
            name: "Channel-User-B",
            dob: new Date("1990-01-01"),
            sex: "Male",
            address: "456 Test St",
            phone: "0987654321",
            email: "userb@example.com",
            medicalInfo: {
              condition: "None",
              drugs: "None",
              allergies: "None",
            },
            emergencyContacts: [],
          },
        },
        { new: true, upsert: true },
      );

      // Ensure we have an existing channel between userA and userB
      const {
        body: { _id: testChannelId },
      } = await request(app)
        .post("/api/channels")
        .send({
          name: "Test Channel For Phone Call",
          users: [userA, userB],
        })
        .expect(200);

      // Make the phone call request
      const { body: result } = await request(app)
        .post(`/api/channels/${testChannelId}/phone-call`)
        .set("x-application-uid", userA) // Sender is userA
        .expect(200);

      // Validate the response contains the expected phone call message
      expect(result.message.content).toBe(
        `Phone call started now between Channel-User-A and Channel-User-B.`,
      );
      expect(result.message.sender.username).toBe("Channel-User-A");
      expect(result.message.channelId).toBe(testChannelId);

      // Validate the phone number returned is of userB (the receiver)
      expect(result.phoneNumber).toBe("0987654321");
    });

    it("should return 404 if the channel does not exist", async () => {
      // Provide a random ID that won’t match any existing channel
      const fakeId = "64f0413bd1fd8a7a6e8a1f21";

      // Expect a 404 and an error message from the catch block
      const { body } = await request(app)
        .post(`/api/channels/${fakeId}/phone-call`)
        .set("x-application-uid", userA)
        .expect(404);

      // The error response is { message: error.message }
      expect(body).toHaveProperty("message");
      expect(body.message).toMatch(`Channel(${fakeId}) not found.`);
    });
  });

  describe("Update Channel", () => {
    it("updates a channel to add a user", async () => {
      // Ensure the channel exists before updating
      expect(channelId).toBeDefined();

      // Send a PUT request to update the channel by adding userC
      const { body: updatedChannel } = await request(app)
        .put("/api/channels")
        .send({
          _id: channelId, // Existing channel ID
          name: "Test Channel 1", // Keep the name unchanged
          users: [userA, userB, userC], // Add userC
        })
        .expect(200);

      // Verify the response
      expect(updatedChannel).toBeDefined();
      expect(updatedChannel._id).toBe(channelId);
      expect(updatedChannel.users.length).toBe(3); // UserC should be added
      expect(updatedChannel.users.some((u) => u._id === userC)).toBe(true);
    });

    it("updates a channel to remove a user", async () => {
      // Ensure the channel exists before updating
      expect(channelId).toBeDefined();

      // Send a PUT request to update the channel by removing userB
      const { body: updatedChannel } = await request(app)
        .put("/api/channels")
        .send({
          _id: channelId, // Existing channel ID
          name: "Test Channel 1", // Keep the name unchanged
          users: [userA], // Remove userB by only keeping userA
        })
        .expect(200);

      // Verify the response
      expect(updatedChannel).toBeDefined();
      expect(updatedChannel._id).toBe(channelId);
      expect(updatedChannel.users.length).toBe(1); // Only 1 user should remain
      expect(updatedChannel.users.some((u) => u._id === userB)).toBe(false);
    });

    it("should return 400 if the channel ID is empty", async () => {
      const invalidChannelId = "";
      const { body } = await request(app)
        .put("/api/channels")
        .send({
          _id: invalidChannelId,
          name: "Test Channel",
          users: ["user-id"],
        })
        .expect(400);

      expect(body).toHaveProperty("message");
      expect(body.message).toMatch("Channel id is required");
    });

    it("should return 400 if the channel ID is invalid", async () => {
      const invalidChannelId = "invalid-channel-id";
      const { body } = await request(app)
        .put("/api/channels")
        .send({
          _id: invalidChannelId,
          name: "Test Channel",
          users: ["user-id"],
        })
        .expect(400);

      expect(body).toHaveProperty("message");
      expect(body.message).toMatch(
        "input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
      );
    });
  });

  describe("Get a Channel by ID", () => {
    it("retrieve a channel by ID", async () => {
      // Ensure the channel exists before retrievingconst
      const { body } = await request(app)
        .get(`/api/channels/${channelId}`)
        .expect(200);

      expect(body).toBeDefined();
      expect(body._id).toBe(channelId);
      expect(body.name).toBe("Test Channel 1");
      expect(body.users.length).toBe(1);
    });

    it("should return 404 if the channel does not exist", async () => {
      // Provide a random ID that won’t match any existing channel
      const fakeId = "64f0413bd1fd8a7a6e8a1f21";
      const { body } = await request(app)
        .get(`/api/channels/${fakeId}`)
        .expect(404);
      expect(body).toHaveProperty("message");
      expect(body.message).toMatch(/Channel.*not found/);
    });
  });

  describe("Acknowledge a Message in a Channel", () => {
    it("acknowledges a message in a channel", async () => {
      // Create a new channel and message
      const {
        body: { _id: channelId },
      } = await request(app)
        .post("/api/channels")
        .send({
          name: "Test Channel for Acknowledge",
          users: [userA],
        })
        .expect(200);

      const content = "This is a test message";
      const {
        body: { _id: messageId },
      } = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set("x-application-uid", userA)
        .send({ content, isAlert: false })
        .expect(200);

      // Acknowledge the message
      const { body: acknowledgedMessage } = await request(app)
        .patch(`/api/channels/${channelId}/messages/acknowledge`)
        .send({ messageId, senderId: userA })
        .expect(200);

      expect(acknowledgedMessage).toBeDefined();
      expect(acknowledgedMessage._id).toBe(messageId);
    });

    it("should return 404 if the channel does not exist for ackowledge", async () => {
      // Provide a random ID that won’t match any existing channel
      const fakeId = "64f0413bd1fdda7a6e1a1f21";
      const { body } = await request(app)
        .patch(`/api/channels/${fakeId}/messages/acknowledge`)
        .send({ messageId, senderId: userA })
        .expect(404);

      expect(body).toHaveProperty("message");
      expect(body.message).toMatch(/Channel.*not found/);
    });
  });

  describe("Get Closed Groups", () => {
    let closedChannelId1;
    let closedChannelId2;
    let openChannelId;

    beforeAll(async () => {
      // Create test channels - 2 closed and 1 open
      const { body: closed1 } = await request(app)
        .post("/api/channels")
        .send({
          name: "Closed Group 1",
          users: [userA, userB],
          closed: true,
        })
        .expect(200);

      const { body: closed2 } = await request(app)
        .post("/api/channels")
        .send({
          name: "Closed Group 2",
          users: [userA, userC],
          closed: true,
        })
        .expect(200);

      const { body: open } = await request(app)
        .post("/api/channels")
        .send({
          name: "Open Group",
          users: [userB, userC],
          closed: false,
        })
        .expect(200);

      closedChannelId1 = closed1._id;
      closedChannelId2 = closed2._id;
      openChannelId = open._id;
    });

    it("retrieves all closed groups", async () => {
      const { body: closedGroups } = await request(app)
        .get("/api/channels/groups/closed")
        .expect(200);

      expect(closedGroups.length).toBeGreaterThanOrEqual(2);

      const groupIds = closedGroups.map((group) => group._id);
      expect(groupIds).toContain(closedChannelId1);
      expect(groupIds).toContain(closedChannelId2);

      expect(groupIds).not.toContain(openChannelId);

      const names = closedGroups.map((group) => group.name);
      const sortedNames = [...names];
      expect(names).toEqual(sortedNames);
    });
  });

  afterAll(TestDatabase.close);
});
