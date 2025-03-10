import { Fragment, FunctionComponent, ReactElement, useState, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import Board from "./Board"
import IChannel from '../models/Channel'
import {isSystemGroup} from "../utils/SystemDefinedGroups"


interface ITab {
  text: string
  link: string
  icon: ReactElement
}

// todo: should be refactored into a separate component as TabList
const tabs: ITab[] = [
  {
    text: 'Create/Edit Group',
    link: '/groups',
    icon: <AddIcon />,
  },
]

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
  setCurrentGroup: (group: IChannel | null) => void;
}


const AddGroupForm: FunctionComponent<IAddGroupFormProps> = (
  channelProps: IAddGroupFormProps,
) => {
  const [showForm, setShowForm] = useState(false)
  const [closed, setIsClosed] = useState<boolean>(false)
  const [name, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [nameError, setNameError] = useState<string>('')
  const owner = localStorage.getItem('uid') || ''
  const currentUsername = localStorage.getItem('username')
  const [triggerResetBoard, setTriggerResetBoard] = useState(0)  // use a counter to notify child to update (bad approach)
  const [allowEdit, setAllowEdit] = useState(true)  // whether allow current user to edit selected channel (use this state to update UI)
  const [allowRemoveSelf, setAllowRemoveSelf] = useState(false)  // whether allow current user to remove herself from channel (use this state to update UI)

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [users, setUsers] = useState<string[]>([owner])


  // console.log('owner:', owner)

  useEffect(() => {
    setUsers((prev) => (prev.includes(owner) ? prev : [owner, ...prev]));
  }, [owner]); // Runs only when the owner changes


  const handleSubmit = () => {
    let hasError = false

    setNameError('')

    if (!name.trim()) {
      setNameError('Group name is required')
      hasError = true
    }
    setUsers([owner])

    if (!hasError) {
      channelProps.createChannel({
        name,
        description,
        users: users.includes(owner) ? users : [...users, owner], // Ensure owner is in the list
        owner,
        closed,
      })
      resetForm()
    }
  }

  const resetForm = () => {
    // set state in parent
    channelProps.setCurrentGroup(null)

    // set state in itself
    setNameError('')
    setGroupName('')
    setDescription('')
    setIsClosed(false)
    setAllowEdit(true)
    setAllowRemoveSelf(false)

    setTriggerResetBoard(triggerResetBoard + 1)  // notify child to reset
  }

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsClosed(event.target.checked)
  }

  const handleCancelClick = () => {
    resetForm()
    setShowForm(false)
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
    resetForm()
  }

  const handleRemoveCurrentUserFromGroup = () => {
    channelProps.removeCurrentUserFromGroup()
    resetForm()
  }

  const handleAddGroupClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault()
    setShowForm(true)
  }

  const handleGroupClickInBoard = (group: IChannel) => {
    channelProps.setCurrentGroup(group)

    const isSysGroup = isSystemGroup(group)
    const isOwnerOfGroup = group.owner._id === owner
    // console.log(`[handleGroupClickInBoard] isSysGroup: ${isSysGroup}; isOwnerOfGroup: ${isOwnerOfGroup}`)

    setAllowEdit(isOwnerOfGroup)
    setAllowRemoveSelf(!isOwnerOfGroup && !isSysGroup)

    setGroupName(group.name)
    setDescription(group.description || '')
    setIsClosed(group.closed || false)
  }

  return (
    <Box sx={{
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      width: "100%",
      mx: "auto"
    }}>
      <List>
        {tabs.map(({ text, link, icon }, index) => (
          <Fragment key={link}>
            <Link color="inherit" href={link} onClick={handleAddGroupClick}>
              <ListItem button>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText>{text}</ListItemText>
              </ListItem>
            </Link>

            {index !== tabs.length - 1 && <Divider />}
          </Fragment>
        ))}
      </List>

      {showForm && (
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
          <Board setUsers={setUsers} onGroupClick={handleGroupClickInBoard} triggerResetBoard={triggerResetBoard} canDrag={allowEdit} />
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
              {(channelProps.currentGroup == null) ? "Create" : "Edit"}
            </Button>}
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCancelClick}
              sx={{ mt: 2, mx: 1 }}
            >
              Cancel
            </Button>
            {allowEdit && <Button
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
      )}
    </Box>
  )
}

export default AddGroupForm
