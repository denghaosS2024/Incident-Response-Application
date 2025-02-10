import React, { useEffect, useState } from 'react'
import ChannelList from '../components/ChannelList'
import IChannel, { resolveChannelName } from '../models/Channel'
import request from '../utils/request'

// Messages component: Displays a list of channels for the current user
const Messages: React.FC = () => {
  const [channels, setChannels] = useState<IChannel[]>([])
  const [loading, setLoading] = useState<boolean>(true)

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

  return <ChannelList channels={channels} loading={loading} />
}

export default Messages
