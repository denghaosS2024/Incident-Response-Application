import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import { setCurrentHospitalId } from '../redux/userHospitalSlice'
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
  const dispatch = useDispatch()
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

  // Effect for initializing hospital ID when Messages page loads
  useEffect(() => {
    const initializeHospitalId = async () => {
      const currentUserId = localStorage.getItem('uid')
      const currentRole = localStorage.getItem('role')
      
      // Check if user is a nurse - if not, we don't need to set hospital ID
      if (!currentUserId || currentRole !== 'Nurse') return
      
      try {
        // First check if we already have a hospital ID in sessionStorage
        const cachedHospitalId = sessionStorage.getItem('currentHospitalId')
        if (cachedHospitalId) {
          console.log('Messages: Using cached hospital ID:', cachedHospitalId)
          dispatch(setCurrentHospitalId(cachedHospitalId))
          return
        }
        
        // If no cached ID, fetch from profile
        console.log('Messages: Fetching user data to set hospital ID')
        const userData = await request(`/api/users/${currentUserId}`)
        
        if (userData && userData.hospitalId) {
          console.log('Messages: Setting hospital ID:', userData.hospitalId)
          dispatch(setCurrentHospitalId(userData.hospitalId))
          sessionStorage.setItem('currentHospitalId', userData.hospitalId)
        } else {
          console.log('Messages: User has no hospital ID in their profile')
        }
      } catch (error) {
        console.error('Messages: Error fetching hospital ID:', error)
      }
    }
    
    // Run the initialization
    initializeHospitalId()
  }, [dispatch]) // Re-run if dispatch changes (should never happen)
  
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
