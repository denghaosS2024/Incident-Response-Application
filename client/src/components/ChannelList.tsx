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
  Box,
  Typography
} from '@mui/material'
import { Fragment, FunctionComponent } from 'react'
import IChannel from '../models/Channel'
import Loading from './common/Loading'
import EditIcon from '@mui/icons-material/Edit'

export interface IChannelProps {
  channel: IChannel,
  isSettingButton?: boolean
}

const ChannelStyle: SxProps = {
  backgroundColor: '#ADD8E6',
  boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
  p: 2,
  borderRadius: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  overflow: 'hidden'
};

// Channel component renders a single channel with an optional setting button
// @param channel - The channel object to render
// @param isSettingButton - Optional flag to show the setting button
export const Channel: FunctionComponent<IChannelProps> = ({
  channel: { _id, name },
  isSettingButton = false
}) => {

  const ChannelContent = (
    <Box sx={ChannelStyle}>
      <ListItemText>{name}</ListItemText>
      {isSettingButton &&
        <IconButton edge="end" size="large">
          <Arrow />
        </IconButton>}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: "1rem", paddingLeft: isSettingButton ? '40px' : '0' }}>
      {isSettingButton && (
        <Link color="inherit"
          href={`/groups/${_id}?name=${name}`}
          sx={{
            position: 'absolute',
            left: 0
          }}>
          <IconButton edge="start" size="large">
            <EditIcon />
          </IconButton>
        </Link>
      )}

      {isSettingButton ? (
        <Link
          color="inherit"
          href={`/messages/${_id}?name=${name}`}
          sx={{ width: '100%' }}
        >
          {ChannelContent}
        </Link>
      ) : (
        <Box sx={{ width: '100%' }}>
          {ChannelContent}
        </Box>
      )}
    </Box>
  )
}

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
    <List sx={{ width: '100%' }}>
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