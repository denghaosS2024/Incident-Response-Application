import { Fragment, FunctionComponent, ReactElement, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import {
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material'
import IChannel from '../models/Channel'

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

export interface IChannelProps {
  channel: IChannel
}

const AddGroup: FunctionComponent<IChannelProps> = ({
  channel,
}: IChannelProps) => {
  const [showForm, setShowForm] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [owner, setOwner] = useState('')
  const [users, setUsers] = useState<string[]>([])
  const [error, setError] = useState<string>('')

  const handleSubmit = () => {
    // todo
  }

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsClosed(event.target.checked)
  }

  const handleCancelClick = () => {
    setShowForm(false)
  }

  const handleDeleteClick = () => {
    // todo
    setShowForm(true)
  }

  const handleAddGroupClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault()
    setShowForm(true)
  }

  return (
    <Box>
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
        <Box component="form" sx={{ mt: 2, mx: 2 }}>
          <TextField
            label="Group Name"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mt={2}
          >
            <Typography variant="body1" sx={{ mr: 2 }}>
              Owner: {channel.owner.username}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isClosed}
                  onChange={handleToggleChange}
                  name="closed"
                  color="primary"
                />
              }
              label="Closed"
            />
          </Box>
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
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default AddGroup
