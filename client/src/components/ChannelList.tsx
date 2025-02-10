import { NavigateNext as Arrow } from '@mui/icons-material'
import {
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material'
import { Fragment, FunctionComponent } from 'react'
import IChannel from '../models/Channel'
import Loading from './common/Loading'

export interface IChannelProps {
  channel: IChannel
}

export const Channel: FunctionComponent<IChannelProps> = ({
  channel: { _id, name },
}) => (
  <Link color="inherit" href={`/messages/${_id}?name=${name}`}>
    <ListItem>
      <ListItemText>{name}</ListItemText>
      <ListItemSecondaryAction>
        <IconButton edge="end" size="large">
          <Arrow />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  </Link>
)

export interface IChannelListProps {
  /**
   * List of channels that the current user is allowed to access
   */
  channels?: IChannel[]
  /**
   * Whether the channels are still loading
   */
  loading: boolean
}

const ChannelList: FunctionComponent<IChannelListProps> = ({
  channels,
  loading,
}) => {
  if (!channels || loading) return <Loading />

  return (
    <List>
      {channels.map((channel, index) => (
        <Fragment key={channel._id}>
          <Channel channel={channel} />
          {index !== channels.length - 1 && <Divider />}
        </Fragment>
      ))}
    </List>
  )
}

export default ChannelList
