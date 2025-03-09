import React, { useEffect, useState } from 'react'
import ChannelList from '../components/ChannelList'
import ChatRoom from '../components/ChatRoom'
import IChannel, { resolveChannelName } from '../models/Channel'
import request from '../utils/request'
import { Box } from '@mui/material'

// Messages component: Displays a list of channels for the current user
const Messages: React.FC = () => {
  const [channels, setChannels] = useState<IChannel[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannel(channelId);
  };

  useEffect(() => {
    const uid = localStorage.getItem('uid')
    // Function to fetch channels
    const getCs = async () => {
      const channels = (await request(
        `/api/channels?user=${uid}`,
      )) as IChannel[]
      // Resolve channel names before setting state
      setChannels(channels.map(resolveChannelName))
      setLoading(false)
    }
    getCs()
  }, [])

  return (
    <Box display="flex" height="100vh">
      {/* Channel list */}
      <Box width="30%" borderRight="1px solid #ccc" overflow="auto">
        <ChannelList
          channels={channels}
          loading={loading}
          onSelectChannel={handleSelectChannel}
        />
      </Box>

      {/* Chat room screen */}
      <Box width="70%" p={2}>
        {selectedChannel ? (
          
          <ChatRoom channelId={selectedChannel} />
        ) : (
          <p>Please select a channel to start chatting.</p>
        )}
      </Box>
    </Box>
  )
}

export default Messages
