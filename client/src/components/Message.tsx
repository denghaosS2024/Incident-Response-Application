import { FunctionComponent } from 'react'
import { Box, Typography } from '@mui/material'
import Linkify from 'react-linkify'
import IMessage from '../models/Message'
import styles from '../styles/Message.module.css'

export interface IMessageProps {
  /**
   * The message to display
   */
  message: IMessage
}

const Message: FunctionComponent<IMessageProps> = ({ message }) => (
  <Box className={styles.root}>
    <Box display="flex" alignItems="center">
      <Typography variant="body1" className={styles.name}>
        {message.sender.username}
      </Typography>
      <Typography variant="caption" className={styles.timestamp}>
        {message.timestamp}
      </Typography>
    </Box>
    <Typography variant="body2" className={styles.content}>
      <Linkify>{message.content}</Linkify>
    </Typography>
  </Box>
)

export default Message
