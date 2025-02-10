import { Grid } from '@mui/material'
import React, { useEffect, useState } from 'react'
import MessageInput from '../components/MessageInput'
import MessageList from '../components/MessageList'
import { addMessage, loadMessages } from '../features/messageSlice'
import IChannel from '../models/Channel'
import request from '../utils/request'

import { AppDispatch } from '@/app/store'
import { RootState } from '@/utils/types'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from '../styles/ChatRoomPage.module.css'

// ChatRoomPage component: Displays messages for a specific channel and allows sending new messages
const ChatRoomPage: React.FC = () => {
  // Extract channelId from URL
  const channelId = useLocation().pathname.split('/')[2]
  // Get messages for the current channel from Redux store
  const messages = useSelector(
    (state: RootState) => state.messageState.messages,
  )[channelId]
  const dispatch = useDispatch<AppDispatch>()
  const history = useNavigate()

  const [isLoading, setLoading] = useState<boolean>(true)

  // Function to send a new message
  // @param content - The text content of the message to be sent
  // @param channelId - The ID of the channel to send the message to
  const sendMessage = async (content: string, channelId: string) => {
    const message = await request(`/api/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
      }),
    })

    dispatch(addMessage(message))
  }

  useEffect(() => {
    // Function to handle redirection to public channel
    const d = async () => {
      const channels = (await request('/api/channels')) as IChannel[]
      const publicChannel = channels.filter(
        (channel) => channel.name === 'Public',
      )[0]
      history(`/messages/${publicChannel._id}`)
    }
    // Redirect '/public' to the actual public channel ID
    if (channelId === 'public') {
      d()
    }

    // Load messages for the current channel
    // @param channelId - The ID of the channel to load messages for
    dispatch(loadMessages(channelId))
    setLoading(false)
  }, [])

  return (
    <Grid className={styles.root} container direction="column">
      <Grid className={styles.list} item>
        <MessageList messages={messages || []} loading={isLoading} />
      </Grid>

      <Grid className={styles.input} item>
        <MessageInput
          onSubmit={(content: string) => sendMessage(content, channelId)}
        />
      </Grid>
    </Grid>
  )
}

export default ChatRoomPage
