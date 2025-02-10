import { NavigateNext as Arrow } from '@mui/icons-material'
import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
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
  user: { _id, username, online },
  onClick,
}) => (
  <ListItem button onClick={() => onClick && onClick(_id)}>
    <ListItemText style={{ flex: 1 }}>{username}</ListItemText>
    <Typography
      className={cx({
        [styles.online]: online,
      })}
      variant="caption"
    >
      {online ? 'online' : 'offline'}
    </Typography>
    {onClick && (
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          size="large"
          onClick={() => onClick && onClick(_id)}
        >
          <Arrow />
        </IconButton>
      </ListItemSecondaryAction>
    )}
  </ListItem>
)

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
    <List>
      {users &&
        users.map((user, index) => (
          <Fragment key={user._id}>
            <Contact user={user} onClick={onClick} />
            {index !== users.length - 1 && <Divider />}
          </Fragment>
        ))}
    </List>
  )
}
export default ContactList
