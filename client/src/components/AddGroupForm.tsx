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
import { group } from 'console'
import { set } from 'lodash'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import Board from "./Board";
import IUser from '@/models/User'

interface ITab {
  text: string
  link: string
  icon: ReactElement
}

// todo: should be refactored into a separate component as TabList
const tabs: ITab[] = [
  {
    text: 'Add Group',
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
  selectedUsers: string[]; // Accept users from "This Group"
  setSelectedUsers: (users: IUser[]) => void; // Add the setSelectedUsers function here
  deleteChannel: (channelName: string) => void
}


const AddGroupForm: FunctionComponent<IAddGroupFormProps> = (
  channelProps: IAddGroupFormProps
) => {
  const [showForm, setShowForm] = useState(false)
  const [closed, setIsClosed] = useState<boolean>(false)
  const [name, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [users, setUsers] = useState<string[]>([]); // Initialize with selectedUsers
  const [nameError, setNameError] = useState<string>('')
  const owner = localStorage.getItem('uid') || ''
  const currentUsername = localStorage.getItem('username')
  const currentUserRole = localStorage.getItem('role')
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [users, setUsers] = useState<string[]>([owner])

  
  console.log('owner:', owner)

  useEffect(() => {
    setUsers((prev) => [owner, ...prev]); // Ensure owner is always included
  }, []);
  
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
        users: [...users, owner], // Ensure owner is included
        owner,
        closed,
      })
      resetForm()
    }
  }

  const resetForm = () => {
    setNameError('')
    setGroupName('')
    setDescription('')
    setIsClosed(false)
  }

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsClosed(event.target.checked)
  }

  const handleCancelClick = () => {
    resetForm()
    setShowForm(false)
  }

  const handleDeleteClick = () => {
    let hasError = false

    setNameError('')
    if (!name.trim()) {
      setNameError('Group name is required')
      hasError = true
    } else {
      setOpenConfirmDialog(true)
    }
  }

  const handleDeleteChannel = () => {
    setOpenConfirmDialog(false)
    channelProps.deleteChannel(name)
  }

  const handleAddGroupClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault()
    setShowForm(true)
  }

  return (
    <Box sx={{ border: '1px solid #e0e0e0', 
              borderRadius: '4px' , 
              width: "95%",
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
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mt={2}
          >
            <Typography variant="body1" sx={{ mr: 2 }}>
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
          </Box>
          <Board setUsers={setUsers} setGroupName={setGroupName} setDescription={setDescription}/>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              sx={{ mt: 2, mx: 1 }}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCancelClick}
              sx={{ mt: 2, mx: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleDeleteClick}
              sx={{ mt: 2, mx: 1 }}
            >
              Delete
            </Button>
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