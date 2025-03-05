import { NavigateNext as Arrow } from '@mui/icons-material'
import {
  colors,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  SxProps,
} from '@mui/material'
import { Fragment, FunctionComponent } from 'react'
import IChannel from '../models/Channel'
import Loading from './common/Loading'

export interface IChannelProps {
  channel: IChannel
}

const ChannelStyle: SxProps = {
  backgroundColor: '#ADD8E6', // Material UI blue
  width: '95%',
  boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
  p: 2,
  borderRadius: 1,
  mx: 'auto', 
  display: 'flex',
  justifyContent:'space-between',
  alignItems:'center',
  paddingRight: '48px',
  marginBottom:"1rem"
}


export const Channel: FunctionComponent<IChannelProps> = ({
  channel: { _id, name },
}) => (
  <Link color="inherit" href={`/messages/${_id}?name=${name}`}>
    <ListItem sx={ChannelStyle}>
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
