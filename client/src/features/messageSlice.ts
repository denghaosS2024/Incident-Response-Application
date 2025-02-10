import IMessage from '@/models/Message'
import { MessagesState } from '@/utils/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import moment from 'moment'
import request from '../utils/request'

// Defines the structure of the payload for setting messages
interface ISetMessagesPayload {
  channelId: string
  messages: IMessage[]
}

// Initial state for the message slice
const initialState: MessagesState = {
  messages: {}, // Object where keys are channel IDs and values are arrays of messages
  loading: false, // Indicates if a message operation is in progress
  error: null, // Stores any error that occurred during message operations
}

// Helper function to parse and format message timestamps
const parseMessage: (rawMessage: IMessage) => IMessage = ({
  timestamp,
  ...rest
}: IMessage) => {
  return {
    timestamp: moment(timestamp).calendar(),
    ...rest,
  }
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
  },
})

// Export the addMessage action creator
export const { addMessage } = messageSlice.actions

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
