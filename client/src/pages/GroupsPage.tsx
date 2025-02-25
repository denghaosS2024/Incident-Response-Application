import React, { useEffect, useState } from 'react'
import AddGroup from '../components/AddGroup'

const Groups: React.FC = () => {
  const channel = {
    _id: '123',
    name: 'Default Channel',
    owner: { _id: '123', username: 'User', role: 'Admin' },
    closed: false,
    users: [],
  }
  return <AddGroup channel={channel} />
}

export default Groups
