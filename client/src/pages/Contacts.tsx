import React, { useEffect } from 'react'
// import { RouteComponentProps } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ContactList, { ClickContactHandler } from '../components/ContactList'
import IChannel from '../models/Channel'
import { loadContacts } from '../redux/contactSlice'
import { AppDispatch, RootState } from '../redux/store'
import request from '../utils/request'

const roleContactMap: Record<string, string[]> = {
  Citizen: ['Citizen', 'Administrator'],
  Dispatch: ['Dispatch', 'Police', 'Fire', 'Administrator'],
  Police: ['Dispatch', 'Police', 'Fire', 'Administrator'],
  Fire: ['Dispatch', 'Police', 'Fire', 'Administrator'],
  Nurse: ['Nurse', 'Administrator'],
  Administrator: [
    'Dispatch',
    'Police',
    'Fire',
    'Nurse',
    'Citizen',
    'Administrator',
  ],
}

// Contacts component: Displays a list of contacts and handles contact interactions
const Contacts: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const currentUserId = localStorage.getItem('uid')
  const currentUserRole = localStorage.getItem('role') || ''

  const { contacts, loading } = useSelector(
    (state: RootState) => state.contactState,
  )

  const allowedRoles = roleContactMap[currentUserRole] || []
  // Filter out the current user from the contacts list
  const users = contacts.filter(
    (user) => user._id !== currentUserId && allowedRoles.includes(user.role),
  )

  // Function to handle clicking on a contact
  // @param userId - The ID of the clicked user
  const onClick: ClickContactHandler = async (userId, username) => {
    // Create a new channel with the clicked user
    const channel = (await request('/api/channels', {
      method: 'POST',
      body: JSON.stringify({
        name: 'PrivateContact',
        users: [userId, localStorage.getItem('uid')],
      }),
    })) as IChannel

    const userOnOtherEnd = channel.users.filter((u) => u._id === userId)
    const name = userOnOtherEnd[0].username
    //const name = username

    navigate(`/messages/${channel._id}?name=${name}`)
  }

  useEffect(() => {
    // Load contacts when component mounts
    dispatch(loadContacts())
  }, [])

  return <ContactList users={users} loading={loading} onClick={onClick} />
}

export default Contacts
