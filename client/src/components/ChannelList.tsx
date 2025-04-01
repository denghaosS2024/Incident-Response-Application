import { NavigateNext as Arrow } from '@mui/icons-material'
import EditIcon from '@mui/icons-material/Edit'
import {
  Box,
  Divider,
  IconButton,
  Link,
  List,
  ListItemText,
  SxProps,
  Typography,
} from '@mui/material'
import { Fragment, FunctionComponent } from 'react'
import IChannel from '../models/Channel'
import Loading from './common/Loading'
import getRoleIcon from './common/RoleIcon'

export interface IChannelProps {
  channel: IChannel
  onClick?: (channelId: string) => void
  isSettingButton?: boolean
  selectedChannelId?: string | null
  sx?: SxProps,
  settingButtonSx?: SxProps,
  settingButtonLinkSx?: SxProps,
}

// Channel component renders a single channel with an optional setting button
// @param channel - The channel object to render
// @param onClick - Optional click handler for when a user is clicked
// @param isSettingButton - Optional flag to show the setting button
export const Channel: FunctionComponent<IChannelProps> = ({
  channel: { _id, name, users, owner },
  onClick,
  isSettingButton = false,
  selectedChannelId,
  sx = {},
  settingButtonSx = {},
  settingButtonLinkSx = {},

}) => {
  // Get current username to check if it's their 911 channel
  const currentUsername = localStorage.getItem('username')
  const currentUserId = localStorage.getItem('uid')
  
  const displayName = name === `I${currentUsername}_911` ? '911 Call' : name
  let contactIcon: JSX.Element | null = null
  if (!owner && name !== 'Public') {
    const otherUser = users?.find((u) => u._id !== currentUserId)
    if (otherUser) {
      contactIcon = getRoleIcon(otherUser.role)
    }
  }
  const handleClick = () => {
    if (onClick) {
      onClick(_id)
    }
  }

  const isSelected = selectedChannelId === _id

  const ChannelContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
        padding: '12px',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: isSelected ? 'gray' : '#1976d2',
        color: 'white',
        ...(sx as object),
      }}
      onClick={handleClick}
    >
      {contactIcon && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>{contactIcon}</Box>
      )}
      <ListItemText>{displayName}</ListItemText>

      {isSettingButton && (
        <IconButton edge="end" size="large">
          <Arrow />
        </IconButton>
      )}
    </Box>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginBottom: '1rem',
        paddingLeft: isSettingButton ? '40px' : '0',
      }}
    >
      {isSettingButton && (
        <Link
          color="inherit"
          href={`/groups/${_id}?name=${name}`}
          sx={{
            position: 'absolute',
            left: 0,
          }}
        >
          <IconButton edge="start" size="large" sx={settingButtonSx}>
            <EditIcon />
          </IconButton>
        </Link>
      )}

      {isSettingButton ? (
        <Link
          color="inherit"
          href={`/messages/${_id}?name=${name}`}
          sx={{ width: '100%',  ...(settingButtonLinkSx as object)}}
        >
          {ChannelContent}
        </Link>
      ) : (
        <Box sx={{ width: '100%' }}>{ChannelContent}</Box>
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
  // Store the ID of the currently selected channel
  onSelectChannel: (id: string) => void
  selectedChannelId?: string | null
}

const ChannelList: FunctionComponent<IChannelListProps> = ({
  channels,
  loading,
  onSelectChannel,
  selectedChannelId,
}) => {
  if (!channels || loading) return <Loading />

  const groupChannel = channels
    .filter((channel) => channel.owner || channel.name === 'Public')
    .sort((a, b) => a.name.localeCompare(b.name))

  const contactChannel = channels
    .filter((channel) => !channel.owner && channel.name !== 'Public')
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Box sx={{ width: '100%' }}>
      {/* Group Channels */}
      {groupChannel.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Groups
          </Typography>
          <List sx={{ width: '100%' }}>
            {groupChannel.map((channel, index) => (
              <Fragment key={channel._id}>
                <Channel
                  channel={channel}
                  onClick={() => onSelectChannel(channel._id)}
                  selectedChannelId={selectedChannelId}
                />
                {index !== groupChannel.length - 1 && <Divider />}
              </Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* Contact Channels */}
      {contactChannel.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Contacts
          </Typography>
          <List sx={{ width: '100%' }}>
            {contactChannel.map((channel, index) => (
              <Fragment key={channel._id}>
                <Channel
                  channel={channel}
                  onClick={() => onSelectChannel(channel._id)}
                  selectedChannelId={selectedChannelId}
                />
                {index !== contactChannel.length - 1 && <Divider />}
              </Fragment>
            ))}
          </List>
        </Box>
      )}
    </Box>
  )
}

export default ChannelList
