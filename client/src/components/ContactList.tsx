import {
  NavigateNext as Arrow,
  Visibility,
  VisibilityOff,
  ReportProblem,
  LocalTaxi,
  LocalFireDepartment,
  HealthAndSafety
} from '@mui/icons-material'
import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
  Box,
} from '@mui/material'
import cx from 'classnames'
import { Fragment, FunctionComponent } from 'react'
import IUser from '../models/User'
import Loading from './common/Loading'

import styles from '../styles/ContactList.module.css'

export type ClickContactHandler = (id: string) => void

export interface IContactProps {
  user: IUser
  onClick?: ClickContactHandler
}

export const Contact: FunctionComponent<IContactProps> = ({
  user: { _id, username, online, role },
  onClick,
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Dispatch':
        return <ReportProblem sx={{ color: 'red', marginRight: '8px' }} />
      case 'Police':
        return <LocalTaxi sx={{ color: 'red', marginRight: '8px' }} />
      case 'Fire':
        return <LocalFireDepartment sx={{ color: 'red', marginRight: '8px' }} />
      case 'Nurse':
        return <HealthAndSafety sx={{ color: 'red', marginRight: '8px' }} />
      default:
        return null
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 15px',
        border: '1.5px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        marginBottom: '8px',
        width: '90%',
        mx: 'auto',
        cursor: 'pointer',
        '&:hover': { backgroundColor: '#f0f0f0' },
      }}
      onClick={() => onClick && onClick(_id)}
    >
      {getRoleIcon(role)}
      <ListItemText sx={{ flex: 1 }}>{username}</ListItemText>
      <Box>
        {online ? (
          <Visibility color="success" />
        ) : (
          <VisibilityOff color="disabled" />
        )}
      </Box>
      {onClick && (
        <IconButton
          edge="end"
          size="large"
          onClick={(e) => {
            e.stopPropagation()
            onClick(_id)
          }}
        >
          <Arrow />
        </IconButton>
      )}
    </Box>
  )
}

export interface IContactListProps {
  /**\
   * List of users that the current user is allowed to see
   */
  users?: IUser[]
  /**
   * Optional click handler for when a user is clicked
   */
  onClick?: ClickContactHandler
  /**
   * Whether the users are still loading
   */
  loading: boolean
}

export const ContactList: FunctionComponent<IContactListProps> = ({
  users,
  onClick,
  loading,
}) => {
  if (loading) return <Loading />

  if (users && users.length === 0) {
    return <Typography style={{ padding: 16 }}>No contacts</Typography>
  }

  return (
    <List sx={{ width: '100%', maxWidth: 320, mx: 'auto', padding: 0 }}>
      {users &&
        users.map((user) => (
          <Fragment key={user._id}>
            <Contact user={user} onClick={onClick} />
          </Fragment>
        ))}
    </List>
  )
}
export default ContactList
