import {
  Box,
  Button,
  FormControlLabel,
  Link,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import React, { FunctionComponent, useEffect, useState } from 'react'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import IChannel from '../models/Channel'
import { isSystemGroup } from "../utils/SystemDefinedGroups"
import Board from "./Board"


interface IFormData {
  name: string
  description: string
  users: string[]
  owner: string
  closed: boolean
}

export interface IAddGroupFormProps {
  createChannel: (data: IFormData) => void;
  deleteChannel: (channelName: string) => void
  removeCurrentUserFromGroup: () => void;
  currentGroup: IChannel | null;
}


const AddGroupForm: FunctionComponent<IAddGroupFormProps> = (
  channelProps: IAddGroupFormProps,
) => {
  const owner = localStorage.getItem('uid') || ''
  const currentUsername = localStorage.getItem('username')

  const [closed, setIsClosed] = useState<boolean>(false)
  const [name, setGroupName] = useState('')
  const [description, setDescription] = useState('')

  const [nameError, setNameError] = useState<string>('')
  const [allowEdit, setAllowEdit] = useState(true)  // whether allow current user to edit selected channel (use this state to update UI)
  const [allowDelete, setAllowDelete] = useState(true)
  const [allowRemoveSelf, setAllowRemoveSelf] = useState(false)  // whether allow current user to remove herself from channel (use this state to update UI)

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [users, setUsers] = useState<string[]>([owner])

  useEffect(() => {
    setUsers((prev) => (prev.includes(owner) ? prev : [owner, ...prev]));
  }, [owner]); // Runs only when the owner changes

  const reloadForm = (group: IChannel | null) => {
    // set state in itself
    setNameError('')

    setGroupName(channelProps.currentGroup?.name || '')
    setDescription(channelProps.currentGroup?.description || '')
    setIsClosed(channelProps.currentGroup?.closed || false)

    const isSysGroup = isSystemGroup(group)
    const isOwnerOfGroup = (group != null) && (group.owner._id === owner)
    setAllowEdit((group == null) || isOwnerOfGroup)
    setAllowRemoveSelf((group != null) && !isOwnerOfGroup && !isSysGroup)
    setAllowDelete(isOwnerOfGroup)
  }

  useEffect(() => {
    reloadForm(channelProps.currentGroup)
  }, [channelProps.currentGroup])


  const handleSubmit = () => {
    let hasError = false

    setNameError('')

    if (!name.trim()) {
      setNameError('Group name is required')
      hasError = true
    }

    if (!hasError) {
      channelProps.createChannel({
        name,
        description,
        users: users.includes(owner) ? users : [...users, owner], // Ensure owner is in the list
        owner,
        closed,
      })
    }
  }

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsClosed(event.target.checked)
  }

  const handleDeleteClick = () => {
    setNameError('')
    if (!name.trim()) {
      setNameError('Group name is required')
    } else {
      setOpenConfirmDialog(true)
    }
  }

  const handleDeleteChannel = () => {
    setOpenConfirmDialog(false)
    channelProps.deleteChannel(name)
  }

  const handleRemoveCurrentUserFromGroup = () => {
    channelProps.removeCurrentUserFromGroup()
  }

  return (
    <Box sx={{
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      width: "100%",
      mx: "auto"
    }}>
      <Box component="form" sx={{ mt: 2, mx: 2, mb: 2 }}>
        <TextField
          label="Group Name"
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!nameError}
          helperText={nameError}
          required
          value={name}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          value={description}
          margin="normal"
          onChange={(e) => setDescription(e.target.value)}
        />
        {allowEdit && <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt={2}
        >
          <Typography variant="body1" sx={{mr: 2}}>
            Owner: {currentUsername}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={closed}
                onChange={handleToggleChange}
                name="closed"
                color="primary"
              />
            }
            label="Closed"
          />
        </Box>}
        <Board setUsers={setUsers} canDrag={allowEdit} currentGroup={channelProps.currentGroup}/>
        <Box display="flex" justifyContent="center" mt={2}>
          {allowRemoveSelf && <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={(e) => {
              e.preventDefault()
              handleRemoveCurrentUserFromGroup()
            }}
            sx={{mt: 2, mx: 1}}
          >
            Remove Self
          </Button>}
          {allowEdit && <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            sx={{mt: 2, mx: 1}}
          >
            {(channelProps.currentGroup == null) ? "Create" : "Save"}
          </Button>}
          <Button
            component={Link}
            href="/groups"
            variant="outlined"
            color="primary"
            sx={{ mt: 2, mx: 1 }}
          >
            Cancel
          </Button>
          {allowDelete && <Button
            variant="outlined"
            color="primary"
            onClick={handleDeleteClick}
            sx={{mt: 2, mx: 1}}
          >
            Delete
          </Button>}
          <ConfirmationDialog
            open={openConfirmDialog}
            title="Delete Group"
            description="Are you sure you want to delete this group?"
            onConfirm={handleDeleteChannel}
            onCancel={() => setOpenConfirmDialog(false)}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default AddGroupForm
