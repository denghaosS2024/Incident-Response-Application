import { Container } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AddGroupForm, { IAddGroupFormProps } from '../components/AddGroupForm'
import AlertSnackbar from '../components/common/AlertSnackbar'
import IChannel from '../models/Channel'
import style from '../styles/GroupPage.module.css'
import request, { IRequestError } from '../utils/request'
import SocketClient from '../utils/Socket'

const GroupInformationPage: React.FC = () => {
  const uid = localStorage.getItem('uid') ?? ''
  const { id: channelId } = useParams<{ id: string }>()
  const [currentGroup, setCurrentGroup] = useState<IChannel | null>(null)
  const [loading, setLoading] = useState(true)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | ''>('')

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        if (channelId === 'new') {
          setCurrentGroup(null)
        } else {
          const response = await request(`/api/channels/${channelId}`) // Adjust the endpoint as necessary
          setCurrentGroup(response)
        }
      } catch (error) {
        console.error('Error fetching channel:', error)
        setErrorMessage('Error fetching channel: ' + channelId)
        setOpenSnackbar(true)

        setCurrentGroup(null)
      } finally {
        setLoading(false)
      }
    }
    fetchChannel().then()
  }, [channelId])

  if (loading) {
    return <div>Loading...</div> // Show loading state
  }

  // create or update channel
  const newGroup: IAddGroupFormProps['createChannel'] = async ({
    name,
    description,
    users,
    owner,
    closed,
  }) => {
    try {
      setErrorMessage('')

      let originalUsers: string[] = []
      let groupId = ''
      let isUpdate = false

      if (currentGroup) {
        // Update existing channel
        groupId = currentGroup._id
        originalUsers = currentGroup.users
          ? currentGroup.users.map((user) =>
              typeof user === 'object' ? user._id : user,
            )
          : []

        try {
          const updatedChannel = await request('/api/channels', {
            method: 'PUT',
            body: JSON.stringify({
              _id: groupId,
              name,
              description,
              users,
              owner,
              closed,
            }),
          })
          setCurrentGroup(updatedChannel)
        } catch (error) {
          setErrorMessage(`Failed to update group: ${name}`)
          setOpenSnackbar(true)
          setCurrentGroup(null)
          return
        }

        isUpdate = true
      } else {
        // Create new channel
        try {
          const newChannel = await request('/api/channels', {
            method: 'POST',
            body: JSON.stringify({
              _id: undefined,
              name,
              description,
              users,
              owner,
              closed,
            }),
          })
          setCurrentGroup(newChannel)
        } catch (error) {
          const err = error as IRequestError
          setErrorMessage(
            `Failed to create new group: ${err.message || 'Unknown error'}`,
          )
          setOpenSnackbar(true)
          setCurrentGroup(null)
          return
        }
      }

      if (isUpdate) {
        const newUsers = users.filter(
          (userId) => !originalUsers.includes(userId) && userId !== owner,
        )

        if (newUsers.length > 0) {
          console.log(
            `Sending notifications to ${newUsers.length} new members:`,
            newUsers,
          )

          newUsers.forEach((userId) => {
            SocketClient.emit('group-member-added', {
              userId: userId,
            })
          })
        }
      }

      setSuccessMessage('Group created or updated successfully!')
      setOpenSnackbar(true)
    } catch (e) {
      const error = e as IRequestError
      if (error.status >= 400 && error.status < 500) {
        setErrorMessage(`Error: ${error.message}`)
      } else {
        setErrorMessage('Server error occurred. Please try again later.')
      }
      setOpenSnackbar(true)
    }
  }

  const deleteGroup: IAddGroupFormProps['deleteChannel'] = async () => {
    setErrorMessage('')
    if (!currentGroup) {
      setErrorMessage('Failed to delete group: currentGroup is null')
      setOpenSnackbar(true)
      return
    }
    try {
      // FIXME: should delete according to currentGroup._id instead of name
      await request('/api/channels', {
        method: 'DELETE',
        body: JSON.stringify({ name: currentGroup.name }),
      })
      setSuccessMessage('Group deleted successfully!')
      setOpenSnackbar(true)
      setCurrentGroup(null)
    } catch (e) {
      const error = e as IRequestError
      if (error.status >= 400 && error.status < 500) {
        setErrorMessage(`Error: ${error.message}`)
      } else {
        console.log('error', error)
        setErrorMessage('Server error occurred. Please try again later.')
      }
      setOpenSnackbar(true)
    }
  }

  const removeCurrentUserFromGroup: IAddGroupFormProps['removeCurrentUserFromGroup'] =
    async () => {
      setErrorMessage('')

      if (currentGroup) {
        const originalUsers = currentGroup.users
          ? currentGroup.users.map((user) =>
              typeof user === 'object' ? user._id : user,
            )
          : []
        const usersWithoutCurrent = originalUsers.filter(
          (userId) => userId !== uid,
        )

        try {
          const updatedChannel = await request('/api/channels', {
            method: 'PUT',
            body: JSON.stringify({
              _id: currentGroup._id,
              name: currentGroup.name,
              description: currentGroup.description,
              users: usersWithoutCurrent,
              owner: currentGroup.owner._id,
              closed: currentGroup.closed,
            }),
          })
          setSuccessMessage('You are removed from the selected group.')
          setOpenSnackbar(true)
          setCurrentGroup(updatedChannel)
        } catch (e) {
          const error = e as IRequestError
          setErrorMessage(`Error: ${error.message}`)
          setOpenSnackbar(true)
        }
      }
    }

  return (
    <Container>
      <h1>{currentGroup ? `Group: ${currentGroup.name}` : 'New Group'}</h1>
      <div className={style.centeredForm}>
        <AddGroupForm
          createChannel={newGroup}
          deleteChannel={deleteGroup}
          removeCurrentUserFromGroup={removeCurrentUserFromGroup}
          currentGroup={currentGroup}
        />
      </div>
      <AlertSnackbar
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        message={errorMessage || successMessage}
        severity={errorMessage ? 'error' : 'success'}
      />
    </Container>
  )
}

export default GroupInformationPage
