import React, { useEffect } from 'react'
// import { RouteComponentProps } from 'react-router'
import { AppDispatch } from '@/app/store'
import { RootState } from '@/utils/types'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ContactList, { ClickContactHandler } from '../components/ContactList'
import { loadContacts } from '../features/contactSlice'
import IChannel from '../models/Channel'
import request from '../utils/request'

// Contacts component: Displays a list of contacts and handles contact interactions
const Contacts: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const currentUserId = localStorage.getItem('uid')
  const { contacts, loading } = useSelector(
    (state: RootState) => state.contactState,
  )
  // Filter out the current user from the contacts list
  const users = contacts.filter((user) => user._id !== currentUserId)

  // Function to handle clicking on a contact
  // @param userId - The ID of the clicked user
  const onClick: ClickContactHandler = async (userId) => {
    // Create a new channel with the clicked user
    const channel = (await request('/api/channels', {
      method: 'POST',
      body: JSON.stringify({ users: [userId, localStorage.getItem('uid')] }),
    })) as IChannel

    const userOnOtherEnd = channel.users.filter((u) => u._id === userId)
    const name = userOnOtherEnd[0].username

    navigate(`/messages/${channel._id}?name=${name}`)
  }

  useEffect(() => {
    // Load contacts when component mounts
    dispatch(loadContacts())
  }, [])

  return (
    <ContactList
      users={users}
      loading={loading}
      onClick={(user) => onClick(user)}
    />
  )
}

export default Contacts
