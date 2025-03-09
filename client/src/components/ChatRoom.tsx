import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { addMessage, loadMessages } from '../features/messageSlice';
import IChannel from '../models/Channel';
import request from '../utils/request';
import { RootState } from '@/utils/types';
import {AppDispatch} from '@/app/store';
import ChatBox from '../components/Chat/ChatBox';
import { Typography, Box } from '@mui/material';

interface ChatRoomProps {
    channelId: string;
  }

// ChatRoomPage component: Displays messages for a specific channel and allows sending new messages
const ChatRoom: React.FC<ChatRoomProps> = ({ channelId }) => {
  // Retrieve current user ID
  const currentUserId = localStorage.getItem('uid') || ''
  // Retrieve current user role
  const currentUserRole = localStorage.getItem('role') || ''
  // Get messages for the current channel from Redux store
  const messages = useSelector(
    (state: RootState) => state.messageState.messages,
  )[channelId]
  const dispatch = useDispatch<AppDispatch>()
  const history = useNavigate()
  const [isLoading, setLoading] = useState<boolean>(true)
  const [channelName, setChannelName] = useState<string>('');

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

  // Load channel info and set channel name
  const loadChannelInfo = async () => {
    const channel = (await request(`/api/channels/${channelId}`)) as IChannel;
    setChannelName(channel.name);
  };

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

    loadChannelInfo();
    // Load messages for the current channel
    dispatch(loadMessages(channelId))
    setLoading(false)
  }, [channelId, dispatch, history])

  // Reuse ChatBox component
  return (
    <Box sx={{height: '100%'}}>
        <Typography variant='h6'>{channelName}</Typography>
    <ChatBox
      channelId={channelId}
      messages={messages || []}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      isLoading={isLoading}
      onSendMessage={sendMessage}
    />
    </Box>
  )
}

export default ChatRoom