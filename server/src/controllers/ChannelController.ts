// ChannelController handles operations related to channels, such as creating, listing, and appending messages.
// It interacts with the Channel and User models and manages user connections.

import { FilterQuery, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Translate } from '@google-cloud/translate/build/src/v2';
import Channel, { IChannel, PUBLIC_CHANNEL_NAME } from "../models/Channel";
import Message from "../models/Message";
import Profile from "../models/Profile";
import User from "../models/User";
// import Env from '../utils/Env'
import GoogleStorage from "../utils/GoogleStorage";
import UserConnections from "../utils/UserConnections";
import UserController from "./UserController";

class ChannelController {
  /**
   * Delete a channel by Name (Name had unique constraint)
   * @param name - The name of the channel to delete
   * @returns The deleted channel object
   * @throws Error if trying to delete the public channel or if the channel is not found
   */
  delete = async (name: string) => {
    if (name === PUBLIC_CHANNEL_NAME) {
      throw new Error("Cannot delete the public channel");
    }

    const exists = await Channel.findOne({
      name,
    }).exec();

    if (!exists) {
      throw new Error(`Channel(${name}) not found.`);
    }

    await Channel.findOneAndDelete({ name }).exec();
    UserConnections.broadcast("updateGroups", {});
  };

  /**
   * Create a new channel or return an existing one if it already exists
   * @param channel - An object containing channel details
   * @param channel.name - Name for the channel
   * @param channel.userIds - Array of user IDs to be added to the channel
   * @param channel.description - Optional description for the channel
   * @param channel.ownerId - The ID of the user creating the channel
   * @param channel.closed - Optional flag to indicate if the channel is closed
   * @returns The created or existing channel object
   * @throws Error if trying to create a channel with the public channel name
   */
  create = async (channel: {
    name: string;
    userIds: Types.ObjectId[];
    description?: string;
    ownerId?: Types.ObjectId;
    closed?: boolean;
  }) => {
    if (channel.name === PUBLIC_CHANNEL_NAME) {
      throw new Error("Channel name cannot be the public channel name");
    }
    // Remove duplicates and ensure order of user IDs
    const userIds = Array.from(new Set(channel.userIds)).sort((a, b) =>
      a.toHexString().localeCompare(b.toHexString()),
    );
    const users = await Promise.all(
      userIds.map(async (id) => (await User.findById(id).exec())!),
    );
    let owner;
    if (channel.ownerId) {
      owner = await User.findById(channel.ownerId).exec();
    }

    // Check if the channel already exists
    let exists: IChannel | null;
    if (channel.name === "PrivateContact") {
      exists = await Channel.findOne({
        users,
      }).exec();
    } else {
      exists = await Channel.findOne({
        name: channel.name,
      }).exec();
    }

    if (channel.name === "PrivateContact" && exists) {
      return exists;
    }

    if (exists) {
      throw new Error("Group already exists.");
    } else {
      exists = await Channel.findOne({ name: channel.name }).exec();
      if (exists && channel.name != "PrivateContact") {
        throw new Error("Group should have unique name.");
      }
      const newChannel = await new Channel({
        name: channel.name,
        users,
        description: channel.description,
        owner: owner,
        closed: channel.closed,
      }).save();
      UserConnections.broadcast("updateGroups", {});
      return newChannel;
    }
  };

  /**
   * Creates a 911 emergency channel with specific configurations
   * @param username - The username of the caller
   * @param userId - MongoDB ObjectId of the user
   * @returns The created 911 channel
   */
  create911Channel = async (username: string, userId: Types.ObjectId) => {
    const channel911Name = `I${username}_911`;

    // Find system user
    const systemUser = await UserController.findUserByUsername("System");
    if (!systemUser) {
      throw new Error(
        "System user not found. Please ensure System user is created with Administrator role.",
      );
    }

    // Use existing create method with 911-specific configurations
    const channel = await this.create({
      name: channel911Name,
      userIds: [userId, systemUser._id],
      description: `911 Emergency Channel for ${username}`,
      ownerId: userId,
      closed: false,
    });

    // Add system welcome message
    await this.appendMessage({
      content:
        "Hello! A dispatcher will be with you shortly. Please provide any additional information here.",
      senderId: systemUser._id,
      channelId: channel._id,
      isAlert: false,
      responders: [],
    });

    return channel;
  };

  /**
   * List channels, optionally filtered by user
   * @param hasUser - Optional user ID to filter channels
   * @returns An array of channel objects, excluding their messages
   */
  list = async (hasUser?: Types.ObjectId) => {
    let query: FilterQuery<IChannel> = {};

    if (hasUser) {
      const user = await User.findById(hasUser).exec();

      if (user) {
        query = {
          users: user,
        };
      }
    }

    return Channel.find(query)
      .select("-messages") // Exclude messages when listing channels
      .exec();
  };

  /**
   * Get a channel by ID
   * @param id - The ID of the channel to retrieve
   * @returns The channel object if found, null otherwise
   */
  get = async (id: Types.ObjectId) => Channel.findById(id).exec();

  /**
   * Add a new message to a channel and notify online users
   * @param content - The content of the message
   * @param senderId - The ID of the user sending the message
   * @param channelId - The ID of the channel to add the message to
   * @returns The newly created message object
   * @throws Error if the sender or channel is not found
   */
  appendMessage = async ({
    content,
    senderId,
    channelId,
    isAlert,
    responders,
  }: {
    content: string;
    senderId: Types.ObjectId;
    channelId: Types.ObjectId;
    isAlert: boolean;
    responders: Types.ObjectId[];
  }) => {
    const sender = await User.findById(senderId).exec();
    if (!sender) {
      throw new Error(`Sender(${senderId.toHexString()}) not found.`);
    }

    const channel = await Channel.findById(channelId).exec();
    if (!channel) {
      throw new Error(`Channel(${channelId.toHexString()}) not found.`);
    }

    // Create and save the new message
    const message = await new Message({
      content,
      sender,
      channelId: channel._id,
      isAlert,
      responders,
    }).save();

    // Add the message to the channel
    channel.messages!.push(message);
    await channel.save();

    // Notify other online users in the channel
    channel.users.forEach((user) => {
      if (user._id.equals(senderId)) return;

      const id = user._id.toHexString();

      if (!UserConnections.isUserConnected(id)) return;

      const connection = UserConnections.getUserConnection(id)!;

      if (isAlert && user.role == "Fire") {
        connection.emit("new-fire-alert", message);
      } else if (isAlert && user.role == "Police") {
        connection.emit("new-police-alert", message);
      } else if (isAlert && user.role == "Nurse" && content.includes("HELP-")) {
        // Add specific case for nurse alerts
        // connection.emit('nurse-alert', message)
      } else {
        connection.emit("new-message", message);
      }
    });
    return message;
  };

  // Get a channel by name
  /**
   * @param name - The name of the channel to retrieve
   * @returns The channel object if found (first occurnace in DB), null otherwise
   * @throws Error if the channel is not found
   */
  getByName = async (name: string) => {
    const channel = await Channel.getByName(name);
    if (!channel) {
      throw new Error(`Channel(${name}) not found.`);
    }
    return channel;
  };

  /**
   * Get messages for a channel
   * @throws Error as this method is not implemented yet
   */
  getMessages = async () => {
    // TODO: Implement this method to retrieve messages for a channel
    throw new Error("Not Implemented");
  };

  /**
   * Start a video conference in a channel.
   * - Retrieves the sender and channel from the database.
   * - Generates a unique room ID and constructs a video conference link (using Jitsi Meet).
   * - Creates a new message with the conference link and appends it to the channel.
   * - Notifies other online users in the channel.
   *
   * @param channelId - The ID of the channel to start the conference in.
   * @param senderId - The ID of the user starting the conference.
   * @returns The newly created message object containing the conference link.
   * @throws Error if the sender or channel is not found.
   */
  startVideoConference = async (
    channelId: Types.ObjectId,
    senderId: Types.ObjectId,
  ) => {
    // Retrieve the sender from the database
    const sender = await User.findById(senderId).exec();
    if (!sender) {
      throw new Error(`Sender(${senderId.toHexString()}) not found.`);
    }

    // Retrieve the channel from the database
    const channel = await Channel.findById(channelId).exec();
    if (!channel) {
      throw new Error(`Channel(${channelId.toHexString()}) not found.`);
    }

    // Generate a unique room ID and construct the video conference link
    const roomId = uuidv4();
    const conferenceLink = `https://meet.jit.si/${roomId}`;

    const content = `Video conference started! Join here: ${conferenceLink}`;

    // Create and save the new message
    const message = await new Message({
      content,
      sender,
      channelId: channel._id,
    }).save();

    // Append the new message to the channel
    channel.messages!.push(message);
    await channel.save();

    // Notify other online users in the channel
    channel.users.forEach((user) => {
      if (user._id.equals(senderId)) return;
      const id = user._id.toHexString();
      if (!UserConnections.isUserConnected(id)) return;
      const connection = UserConnections.getUserConnection(id)!;
      connection.emit("new-message", message);
    });

    return message;
  };

  /**
   * Start a phone call in a channel.
   * - Retrieves the sender and channel from the database.
   * - Retrieves the receiver's phone number from the database.
   * - Creates a new message including the caller and receiver and appends it to the channel.
   * - Notifies other online users in the channel.
   *
   * @param channelId - The ID of the channel to start the call in.
   * @param senderId - The ID of the user starting the call.
   * @returns The newly created message object containing the sender and receiver username, and receiver's phone number.
   * @throws Error if the sender or channel is not found.
   */
  makePhoneCall = async (
    channelId: Types.ObjectId,
    senderId: Types.ObjectId,
  ) => {
    // Retrieve the sender from the database
    const sender = await User.findById(senderId).exec();
    if (!sender) {
      throw new Error(`Sender(${senderId.toHexString()}) not found.`);
    }

    // Retrieve the channel from the database
    const channel = await Channel.findById(channelId).exec();
    if (!channel) {
      throw new Error(`Channel(${channelId.toHexString()}) not found.`);
    }

    const receiverId = channel.users.find((user) => !user._id.equals(senderId))
      ?._id as Types.ObjectId | undefined;
    if (!receiverId) {
      throw new Error(
        `No other user found in Channel(${channelId.toHexString()}).`,
      );
    }

    const receiverProfile = await Profile.findOne({
      userId: receiverId,
    }).exec();
    if (!receiverProfile) {
      throw new Error(
        `Profile for Receiver(${receiverId.toHexString()}) not found.`,
      );
    }
    const receiver = await User.findById(receiverId).exec();
    if (!receiver) {
      throw new Error(`Receiver(${receiverId.toHexString()}) not found.`);
    }
    const receiverPhoneNumber = receiverProfile.phone;
    const content = `Phone call started now between ${sender.username} and ${receiver?.username}.`;

    // Create and save the new message
    const message = await new Message({
      content,
      sender,
      channelId: channel._id,
    }).save();

    // Append the new message to the channel
    channel.messages!.push(message);
    await channel.save();

    // Notify other online users in the channel
    channel.users.forEach((user) => {
      if (user._id.equals(senderId)) return;
      const id = user._id.toHexString();
      if (!UserConnections.isUserConnected(id)) return;
      const connection = UserConnections.getUserConnection(id)!;
      connection.emit("new-message", message);
    });
    return { message, phoneNumber: receiverPhoneNumber };
  };

  getUploadUrl = async (
    channelId: Types.ObjectId,
    fileRoute: string,
    fileType: string,
    fileExtension: string,
  ) => {
    const channel = await Channel.findById(channelId).exec();
    if (!channel) {
      throw new Error(`Channel(${channelId.toHexString()}) not found.`);
    }

    const storage = GoogleStorage.getStorage();
    const bucketName = GoogleStorage.getBucketName();

    const fileName = `${fileRoute}/${Date.now()}.${fileExtension}`;
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    const expires = Date.now() + 15 * 60 * 1000;

    try {
      const [uploadUrl] = await file.getSignedUrl({
        version: "v4",
        action: "write",
        expires,
        contentType: fileType,
      });
      const fileUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      return { uploadUrl, fileUrl };
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return { error: "Error generating signed URL" };
    }
  };

  /**
   * Generate a signed URL for uploading a video to Google Cloud Storage.
   * @param channelId - The ID of the channel to upload the video to.
   * @returns An object containing the signed URL and the file URL.
   * @throws Error if the channel is not found.
   *
   * */
  getVideoUploadUrl = async (channelId: Types.ObjectId) => {
    return this.getUploadUrl(channelId, "videos", "video/webm", "webm");
  };

  /**
   * Generate a signed URL for uploading an image to Google Cloud Storage.
   * @param channelId - The ID of the channel to upload the image to.
   * @returns An object containing the signed URL and the file URL.
   * @throws Error if the channel is not found.
   *
   * */
  getImageUploadUrl = async (channelId: Types.ObjectId) => {
    return this.getUploadUrl(channelId, "images", "image/png", "png");
  };

  /**
   * Generate a signed URL for uploading a file to Google Cloud Storage.
   * @param channelId - The ID of the channel to upload the file to.
   * @param fileName - The name of the file to upload.
   * @param fileType - The MIME type of the file.
   * @param fileExtension - The extension of the file.
   * @returns An object containing the signed URL and the file URL.
   * @throws Error if the channel is not found.
   *
   * */
  getFileUploadUrl = async (
    channelId: Types.ObjectId,
    fileName: string,
    fileType: string,
    fileExtension: string,
  ) => {
    return this.getUploadUrl(
      channelId,
      `uploads/${channelId}/${fileName}`,
      fileType,
      fileExtension,
    );
  };

  /**
   * Generate a signed URL for uploading a voice message to Google Cloud Storage.
   * @param channelId - The ID of the channel to upload the voice message to.
   * @param fileName - The name of the voice message file.
   * @returns An object containing the signed URL and the file URL.
   * @throws Error if the channel is not found.
   *
   * */
  getVoiceUploadUrl = async (channelId: Types.ObjectId, fileName: string) => {
    return this.getUploadUrl(
      channelId,
      `voice_messages/${channelId}/${fileName}`,
      "audio/webm",
      "webm",
    );
  };

  getUserGroups = async (userId: Types.ObjectId) => {
    try {
      const groups = await Channel.getGroupByUser(userId);
      return groups;
    } catch (error) {
      throw error;
    }
  };

  getChannel = async (channelId: Types.ObjectId) => {
    try {
      const channel = await Channel.getGroupById(channelId);
      if (!channel) {
        throw new Error(`Channel(${channelId.toHexString()}) not found.`);
      }
      return channel;
    } catch (error) {
      throw error;
    }
  };

  getClosedGroups = async () => {
    try {
      const closedGroups = await Channel.find({ closed: true }).sort({
        name: 1,
      });
      return closedGroups;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Update existing channel
   * @param channel - An object containing channel details to update
   * @param channel._id - ID of the channel to update
   * @param channel.userIds - Array of user IDs to be in the channel
   * @returns The updated channel object
   * @throws Error if the channel is not found
   */
  updateChannel = async (channel: {
    _id: Types.ObjectId;
    name: string;
    userIds: Types.ObjectId[];
    description?: string;
    ownerId?: Types.ObjectId;
    closed?: boolean;
  }) => {
    // Find the channel by ID
    const existingChannel = await Channel.findById(channel._id).exec();

    if (!existingChannel) {
      throw new Error(`Channel(${channel._id.toString()}) not found.`);
    }

    // Remove duplicates and ensure order of user IDs
    const userIds = Array.from(new Set(channel.userIds)).sort((a, b) =>
      a.toString().localeCompare(b.toString()),
    );

    // Find all user objects
    const users = await Promise.all(
      userIds.map(async (id) => {
        const user = await User.findById(id).exec();
        if (!user) {
          throw new Error(`User(${id.toString()}) not found.`);
        }
        return user;
      }),
    );

    const newUsers = users.filter(
      (u1) => !existingChannel.users.some((u2) => u1._id.equals(u2._id)),
    );

    // Only update the users field
    existingChannel.users = users;

    // Keep other properties the same
    existingChannel.name = channel.name || existingChannel.name;
    existingChannel.description =
      channel.description || existingChannel.description;
    existingChannel.closed =
      channel.closed !== undefined ? channel.closed : existingChannel.closed;

    // If owner is provided, update it
    if (channel.ownerId) {
      const newOwner = await User.findById(channel.ownerId).exec();
      if (newOwner) {
        existingChannel.owner = newOwner;
      }
    }

    // Send group member update notification
    newUsers.forEach((user) => {
      const id = user._id.toHexString();
      if (!UserConnections.isUserConnected(id)) return;
      const connection = UserConnections.getUserConnection(id)!;
      connection.emit("group-member-added", { userId: user._id });
    });

    // Save the updated channel
    const updatedChannel = await existingChannel.save();
    UserConnections.broadcast("updateGroups", {});

    return updatedChannel;
  };

  closeChannel = async (channelId: Types.ObjectId): Promise<IChannel> => {
    const updatedChannel = await Channel.closeChannel(channelId);

    UserConnections.broadcast("updateGroups", {});
    return updatedChannel;
  };

  acknowledgeMessage = async (
    messageId: Types.ObjectId,
    senderId: Types.ObjectId,
    channelId: Types.ObjectId,
    response?: "ACCEPT" | "BUSY",
  ) => {
    const sender = await User.findById(senderId).exec();
    if (!sender) {
      throw new Error(`Sender(${senderId.toHexString()}) not found.`);
    }

    const channel = await Channel.findById(channelId).exec();
    if (!channel) {
      throw new Error(`Channel(${channelId.toHexString()}) not found.`);
    }

    try {
      // Define an interface for the MongoDB update operation
      interface MessageUpdateOperation {
        $push: {
          acknowledgedBy: Types.ObjectId;
          acknowledgedAt: string;
          responses?: {
            userId: Types.ObjectId;
            response: "ACCEPT" | "BUSY";
            timestamp: string;
          };
        };
      }

      const updateObj: MessageUpdateOperation = {
        $push: {
          acknowledgedBy: senderId,
          acknowledgedAt: new Date().toISOString(),
        },
      };

      if (response) {
        updateObj.$push.responses = {
          userId: senderId,
          response,
          timestamp: new Date().toISOString(),
        };
      }

      const message = await Message.findByIdAndUpdate(messageId, updateObj, {
        new: true,
      }).exec();
      if (!message) {
        throw new Error(`Message(${messageId.toHexString()}) not found.`);
      }

      channel.users.forEach((user) => {
        if (user._id.equals(senderId)) return;

        const id = user._id.toHexString();

        if (!UserConnections.isUserConnected(id)) return;

        const connection = UserConnections.getUserConnection(id)!;

        connection.emit("acknowledge-alert", message);
      });

      return message;
    } catch (error) {
      throw error;
    }
  };

  getOrCreateDirectorChannel = async (chiefUsername: string, cityName: string) => {
    const chief = await UserController.getUserByUsername(chiefUsername);
    const director = await UserController.getDirectorByCity(cityName);
  
    if (!chief || !director) {
      throw new Error("Chief or City Director not found.");
    }
  
    const channelName = `${cityName}-DirectorChat-${chief.username}`;
  
    let channel = await Channel.findOne({
      name: channelName,
      users: { $all: [chief._id, director._id] },
    }).exec();
  
    if (channel) return channel;
  
    // If not exist, create it
    channel = await new Channel({
      name: channelName,
      users: [chief, director],
      description: `Private chat between ${chief.username} and Director`,
      owner: director,
      closed: false,
    }).save();
  
    return channel;
  };

  /**
   * Translates a message to the target language using Google Translate API
   * @param messageId - The ID of the message to translate
   * @param text - The text to translate
   * @param targetLang - The target language code (e.g., 'es', 'fr', 'zh')
   * @returns The translated text
   */
  translateMessage = async (messageId: string, text: string, targetLang: string) => {
    try {
      // Initialize the Google Translate API client
      const translate = new Translate({
        key: process.env.GOOGLE_TRANSLATE_API_KEY
      });

      // Translate the text
      const [translation] = await translate.translate(text, targetLang);
      
      // Find the message by ID and update its content_translation map
      // We don't await this operation to make it non-blocking
      if (messageId) {
        Message.findById(messageId).then(message => {
          if (message) {
            // Initialize content_translation if it doesn't exist
            if (!message.content_translation) {
              message.content_translation = new Map<string, string>();
            }
            
            // Save the translation with the target language as the key
            message.content_translation.set(targetLang, translation);
            message.markModified('content_translation'); // Required for Map modifications
            message.save();
          }
        }).catch(err => {
          console.error('Error saving translation:', err);
        });
      }

      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      // Return the original text if translation fails
      return text;
    }
  };
}

export default new ChannelController();
