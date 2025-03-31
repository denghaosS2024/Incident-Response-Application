import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import ChatBox from '../components/Chat/ChatBox'
import IChannel from '../models/Channel'
import { addMessage, loadMessages } from '../redux/messageSlice'
import { AppDispatch, RootState } from '../redux/store'
import request from '../utils/request'

// ChatRoomPage component: Displays messages for a specific channel and allows sending new messages
const ChatRoomPage: React.FC = () => {
  // Extract channelId from URL
  const channelId = useLocation().pathname.split('/')[2]
  // Retrieve current user ID
  const currentUserId = localStorage.getItem('uid') ?? ''
  // Retrieve current user role
  const currentUserRole = localStorage.getItem('role') ?? ''
  // Get messages for the current channel from Redux store
  const messages = useSelector(
    (state: RootState) => state.messageState.messages,
  )[channelId]
  const dispatch = useDispatch<AppDispatch>()
  const history = useNavigate()
  const [isLoading, setLoading] = useState<boolean>(true)

  // Function to send a new message
  const sendMessage = async (content: string, channelId: string) => {
    const message = await request(`/api/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content: content,
        isAlert: false,
      }),
    })
    dispatch(addMessage(message))
  }

  useEffect(() => {
    // Function to handle redirection to public channel
    const handlePublicChannel = async () => {
      const channels = (await request('/api/channels')) as IChannel[]
      const publicChannel = channels.filter(
        (channel) => channel.name === 'Public',
      )[0]
      history(`/messages/${publicChannel._id}`)
    }

    // Redirect '/public' to the actual public channel ID
    if (channelId === 'public') {
      handlePublicChannel()
    }

    // Load messages for the current channel
    dispatch(loadMessages(channelId))
    setLoading(false)
  }, [channelId, dispatch, history])

  // Reuse ChatBox component
  return (
    <ChatBox
      channelId={channelId}
      messages={messages || []}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      isLoading={isLoading}
      onSendMessage={sendMessage}
    />
  )
}

export default ChatRoomPage
