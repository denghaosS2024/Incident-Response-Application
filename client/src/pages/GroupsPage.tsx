import React, { useState } from 'react'
import AddGroupForm from '../components/AddGroupForm'
import request, { IRequestError } from '../utils/request'
import IChannel from '../models/Channel'
import { IAddGroupFormProps } from '@/components/AddGroupForm'
import AlertSnackbar from '../components/common/AlertSnackbar'
import style from '../styles/GroupPage.module.css'
import SocketClient from '../utils/Socket';

//Pages
import GroupDirectory from '../components/GroupDir/GroupDirectory'
import { Container } from '@mui/material'
import IUser from '@/models/User'

const Groups: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | ''>('')
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
  const [currentGroup, setCurrentGroup] = useState<IChannel | null>(null);

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

      let originalUsers: string[] = [];
      let groupId = '';
      let isUpdate = false;

      if (currentGroup) {
        // Update existing channel
        groupId = currentGroup._id;
        originalUsers = currentGroup.users
          ? currentGroup.users.map(user => typeof user === 'object' ? user._id : user)
          : [];

        await request('/api/channels', {
          method: 'PUT',
          body: JSON.stringify({
            _id: groupId,
            name, description, users, owner, closed
          }),
        })

        isUpdate = true;
      } else {
        // Create new channel
        await request('/api/channels', {
          method: 'POST',
          body: JSON.stringify({
            _id: undefined,
            name, description, users, owner, closed
          }),
        })
      }

      if (isUpdate) {
        const newUsers = users.filter(userId =>
          !originalUsers.includes(userId) &&
          userId !== owner
        );

        if (newUsers.length > 0) {
          console.log(`Sending notifications to ${newUsers.length} new members:`, newUsers);

          newUsers.forEach(userId => {
            SocketClient.emit('group-member-added', {
              userId: userId
            });
          });
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

  const deleteGroup: IAddGroupFormProps['deleteChannel'] = async (
    name: string,
  ) => {
    setErrorMessage('')
    try {
      // FIXME: should delete according to currentGroup._id instead of name
      await request('/api/channels', {
        method: 'DELETE',
        body: JSON.stringify({ name }),
      })
      setSuccessMessage('Group deleted successfully!')
      setOpenSnackbar(true)
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


  return (
    <Container>
      <div className={style.centeredForm}>
        <AddGroupForm createChannel={newGroup} deleteChannel={deleteGroup}
          selectedUsers={selectedUsers.map(user => user._id)} // Extract _id and pass it as string[]
          setSelectedUsers={setSelectedUsers}
          currentGroup={currentGroup}
          setCurrentGroup={setCurrentGroup} />
      </div>
      <GroupDirectory />
      <AlertSnackbar
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        message={errorMessage || successMessage}
        severity={errorMessage ? 'error' : 'success'}
      />
    </Container>
  )
}

export default Groups
