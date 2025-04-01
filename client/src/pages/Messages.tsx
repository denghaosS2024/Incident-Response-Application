import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ChannelList from '../components/ChannelList'
import ChatRoom from '../components/ChatRoom'

import IChannel, { resolveChannelName } from '../models/Channel'
import request from '../utils/request'
import SocketClient from '../utils/Socket'

// Messages component: Displays a list of channels for the current user
const Messages: React.FC = () => {
  const [channels, setChannels] = useState<IChannel[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const { search } = useLocation()
  const navigate = useNavigate()
  const query = new URLSearchParams(search)

  // query.get("channelId") allows us to enter the Messages by going into the specific channel.
  // If it is not provided, the existing functinality does not change.
  const [selectedChannel, setSelectedChannel] = useState<string | null>(
    query.get('channelId'),
  )

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannel(channelId)
    // Clearing the URL after selecting a different channel
    navigate({ search: '' })
  }

  // Effect to update selected channel when URL params change
  useEffect(() => {
    const channelId = query.get('channelId')
    console.log('URL params changed, channelId:', channelId)
    if (channelId) {
      setSelectedChannel(channelId)
    }
  }, [search]) // Re-run when URL search params change

  useEffect(() => {
    const uid = localStorage.getItem('uid')
    // Function to fetch channels
    const getCs = async () => {
      const channels = (await request(
        `/api/channels?user=${uid}`,
      )) as IChannel[]
      setChannels(
        channels
          .filter((c) => !c.closed) // Remove closed channels
          .map(resolveChannelName), // Resolve channel names
      )
      setLoading(false)
    }
    getCs()

    // Refresh channel list on channel update/delete
    const socket = SocketClient
    socket.connect()
    socket.on('updateGroups', getCs)
    return () => {
      socket.off('updateGroups')
    }
  }, [])

  return (
    <Box display="flex" height="100vh" position="relative">
      {/* Channel list */}
      <Box
        width="30%"
        borderRight="1px solid #ccc"
        overflow="auto"
        sx={{ padding: '0.75rem' }}
      >
        <ChannelList
          channels={channels}
          loading={loading}
          onSelectChannel={handleSelectChannel}
          selectedChannelId={selectedChannel}
        />
      </Box>

      {/* Chat room screen */}
      <Box
        display="flex"
        flexDirection="column"
        width="70%"
        p={2}
        overflow="hidden"
      >
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
