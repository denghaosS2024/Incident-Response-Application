import type { PayloadAction } from '@reduxjs/toolkit'
import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
// moment import removed as it's no longer needed
import IMessage from '../models/Message'
import request from '../utils/request'
import { MessagesState } from '../utils/types'

// Defines the structure of the payload for setting messages
interface ISetMessagesPayload {
  channelId: string
  messages: IMessage[]
}

// Initial state for the message slice
const initialState: MessagesState = {
  messages: {}, // Object where keys are channel IDs and values are arrays of messages
  loading: false, // Indicates if a message operation is in progress
  alerts: {}, // Object where keys are channel IDs and values are boolean alerts
  error: null, // Stores any error that occurred during message operations
}

// Helper function to ensure messages have a valid timestamp
const parseMessage: (rawMessage: IMessage) => IMessage = (
  message: IMessage,
) => {
  // Create a new object to avoid modifying the original
  const result = { ...message }

  return result
}

// Async thunk for fetching messages for a specific channel
const loadMessages = createAsyncThunk(
  'messages/loadMessages',
  async (channelId: string) => {
    const rawMessages = await request(`/api/channels/${channelId}/messages`)
    const messages = rawMessages.map(parseMessage)
    return { channelId, messages }
  },
)

export const updateMessage = createAction<IMessage>('messages/updateMessage')

// Async thunk for acknowledging a message
export const acknowledgeMessage = createAsyncThunk(
  'messages/acknowledgeMessage',
  async ({
    messageId,
    senderId,
    channelId,
    response,
  }: {
    messageId: string
    senderId: string
    channelId: string
    response?: 'ACCEPT' | 'BUSY'
  }) => {
    const result = await request(
      `/api/channels/${channelId}/messages/acknowledge`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, messageId, response }),
      },
    )
    return result
  },
)

// Create the message slice with reducers and extra reducers
export const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Reducer for adding a new message to a specific channel
    addMessage: (state, action: PayloadAction<IMessage>) => {
      const message = action.payload
      const channelMessages = state.messages[message.channelId] || []

      channelMessages.push(parseMessage(message))
      state.messages[message.channelId] = channelMessages

      // Set an alert for the channel if the message is not from the current user
      const currentUserId = localStorage.getItem('uid')
      if (message.sender._id !== currentUserId) {
        state.alerts[message.channelId] = true
      }
    },
    clearAllAlerts: (state) => {
      state.alerts = {}
    },
  },
  extraReducers: (builder) => {
    // Handle the fulfilled state of loadMessages
    builder.addCase(
      loadMessages.fulfilled,
      (state, action: PayloadAction<ISetMessagesPayload>) => {
        const { channelId, messages } = action.payload
        state.messages[channelId] = messages
      },
    )
    // Handle the fulfilled state of acknowledgeMessage
    builder.addCase(
      acknowledgeMessage.fulfilled,
      (state, action: PayloadAction<IMessage>) => {
        const updatedMessage = parseMessage(action.payload)
        const channelId = updatedMessage.channelId
        const channelMessages = state.messages[channelId]
        if (channelMessages) {
          const index = channelMessages.findIndex(
            (msg) => msg._id === updatedMessage._id,
          )
          if (index !== -1) {
            channelMessages[index] = updatedMessage
          }
        }
      },
    )
    builder.addCase(updateMessage, (state, action) => {
      const updatedMessage = parseMessage(action.payload)
      const channelId = updatedMessage.channelId.toString()
      const channelMessages = state.messages[channelId]
      if (channelMessages) {
        const index = channelMessages.findIndex(
          (m) => m._id === updatedMessage._id,
        )
        if (index !== -1) {
          channelMessages[index] = updatedMessage
        } else {
          // If not found, optionally push the message
          channelMessages.push(updatedMessage)
        }
      }
    })
  },
})

// Export the addMessage action creator
export const { addMessage, clearAllAlerts } = messageSlice.actions

// Export the loadMessages async thunk
export { loadMessages }

// Export the reducer as the default export
export default messageSlice.reducer

/**
 * Message Slice
 *
 * This Redux slice manages the state of messages in the application.
 *
 * Key components:
 * - Initial state: Defines the structure for messages, loading state, and errors.
 * - parseMessage: A helper function that formats message timestamps.
 * - loadMessages: An async thunk for fetching messages for a specific channel.
 * - messageSlice: The main slice containing reducers and extra reducers.
 *
 * State structure:
 * - messages: An object where keys are channel IDs and values are arrays of messages.
 * - loading: Boolean indicating if a message operation is in progress.
 * - error: Stores any error that occurred during message operations.
 *
 * Actions:
 * - addMessage: Adds a new message to a specific channel.
 * - loadMessages: Fetches and updates messages for a given channel.
 *
 * Usage:
 * This slice is combined in the store and provides actions and state
 * for managing messages throughout the application.
 */
