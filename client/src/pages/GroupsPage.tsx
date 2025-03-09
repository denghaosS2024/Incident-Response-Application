import React, { useEffect, useState } from 'react'
import AddGroupForm from '../components/AddGroupForm'
import request, { IRequestError } from '../utils/request'
import IChannel from '../models/Channel'
import { IAddGroupFormProps } from '../components/AddGroupForm'
import AlertSnackbar from '../components/common/AlertSnackbar'
import { set } from 'lodash'
import style from '../styles/GroupPage.module.css'
import { RootState } from "../utils/types";
import { useSelector } from "react-redux";


//Pages 
import GroupDirectory from '../components/GroupDir/GroupDirectory'
import { Container } from '@mui/material'
import IUser from '@/models/User'

const Groups: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | ''>('')
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);

  const { contacts, loading, error } = useSelector((state: RootState) => state.contactState);
  const owner = localStorage.getItem('uid') || ''
  const [todo, setTodo] = useState<IUser[]>([]);
  const [done, setDone] = useState<IUser[]>([]);
  
  const resetBoard = () => {
    const filteredContacts = contacts.filter(contact => contact._id !== owner); // Remove the logged-in user
    setTodo(filteredContacts); // Reset todo to the filtered contacts
    setDone([]); // Clear done array
  };
  const newGroup: IAddGroupFormProps['createChannel'] = async ({
    name,
    description,
    users,
    owner,
    closed,
  }) => {
    try {
      setErrorMessage('')
      await request('/api/channels', {
        method: 'POST',
        body: JSON.stringify({ name, description, users, owner, closed }),
      })
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
          resetBoard={resetBoard} />
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
