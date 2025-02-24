import { FunctionComponent } from 'react'
import { Box, Typography } from '@mui/material'
import Linkify from 'react-linkify'
import IMessage from '../models/Message'
import { UserBadge, RoleType } from './common/UserBadge'
import styles from '../styles/Message.module.css'

export interface IMessageProps {
  /**
   * The message to display
   */
  message: IMessage
}

const Message: FunctionComponent<IMessageProps> = ({ message }) => {
  // Check if the message content looks like a video url from bucket
  const videoUrlPrefix = "https://storage.googleapis.com/sem-video-bucket/videos/"
  const isVideo = message.content.startsWith(videoUrlPrefix)

  return (
  <Box className={styles.root}>
    <Box display="flex" alignItems="center">
      <UserBadge role={message.sender.role as RoleType} />
      <Typography variant="body1" className={styles.name}>
        {message.sender.username}
      </Typography>
      <Typography variant="caption" className={styles.timestamp}>
        {message.timestamp}
      </Typography>
    </Box>
    {isVideo ? (
        <video controls width="300" style={{ maxWidth: '100%' }}>
          <source src={message.content} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      ) : (
      <Typography variant="body2" className={styles.content}>
        <Linkify>{message.content}</Linkify>
      </Typography>
      )}
  </Box>
)}

export default Message
