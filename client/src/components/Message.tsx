import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { Box, Typography } from '@mui/material'
import moment from 'moment'
import { FunctionComponent } from 'react'
import Linkify from 'react-linkify'
import IMessage from '../models/Message'
import IUser from '../models/User'
import styles from '../styles/Message.module.css'
import getRoleIcon from './common/RoleIcon'
import NurseAlertMessage from './NurseAlertMessage'

export interface IMessageProps {
  /**
   * The message to display
   */
  message: IMessage
}

const Message: FunctionComponent<IMessageProps> = ({ message }) => {
  const currentUserId = localStorage.getItem('uid')
  // Check if the message content looks like a video url from bucket
  const videoUrlPrefix =
    'https://storage.googleapis.com/sem-video-bucket/videos/'
  const isVideo = message.content.startsWith(videoUrlPrefix)

  const imageUrlPrefix =
    'https://storage.googleapis.com/sem-video-bucket/images/'
  const isImage = message.content.startsWith(imageUrlPrefix)

  const fileUrlPrefix =
    'https://storage.googleapis.com/sem-video-bucket/uploads/'
  const isFile = message.content.startsWith(fileUrlPrefix)

  const audioUrlPrefix =
    'https://storage.googleapis.com/sem-video-bucket/voice_messages'
  const isAudio = message.content.startsWith(audioUrlPrefix)

  const isAlert = message.isAlert
  const senderId = message.sender._id

  // Check if this is a nurse alert by looking at the content format
  const isNurseAlert =
    isAlert &&
    (message.content.includes('HELP') &&
      (message.content.includes('Patient:') ||
       message.content.startsWith('E HELP') ||
       message.content.startsWith('U HELP')))

  // For regular alerts
  const [text, bgColor, textColor] = !isNurseAlert
    ? message.content.split('-')
    : ['', '', '']

  // If the message has responders, acknowledgedBy, and acknowledgedAt:
  const responders = message.responders || []
  const acknowledgedBy = message.acknowledgedBy || []
  const acknowledgedAt = message.acknowledgedAt || []

  // Figure out who is still not acknowledged
  // (assuming each element in responders and acknowledgedBy are IUser objects)
  const unacknowledged = responders.filter(
    (res) => !acknowledgedBy.some((ackUser) => ackUser._id === res._id),
  )

  const latestAckTime =
    acknowledgedBy.length === 0
      ? message.timestamp
      : acknowledgedAt[acknowledgedAt.length - 1]

  // For nurse alerts, render using the specialized component
  if (isNurseAlert) {
    return <NurseAlertMessage message={message} />
  }

  return (
    <Box className={styles.root}>
      <Box display="flex" alignItems="center">
        {getRoleIcon(message.sender.role)}
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
      ) : isImage ? (
        <img
          src={message.content}
          alt="Sent message"
          style={{
            maxWidth: '30%',
            height: 'auto',
            borderRadius: '8px',
            marginTop: '8px',
          }}
        />
      ) : isAudio ? (
        <audio controls style={{ width: '100%', marginTop: '8px' }}>
          <source src={message.content} type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      ) : isFile ? (
        <a
          href={message.content}
          download
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Box
            display="inline-flex"
            alignItems="center"
            bgcolor="#F5F5F5"
            borderRadius={1}
            mt={2}
            mb={2}
            px={2}
          >
            <InsertDriveFileIcon
              sx={{ fontSize: 40, color: '#FFA726', mr: 1 }}
            />
            <Box
              sx={{
                display: 'inline-flex',
                minWidth: 'fit-content',
                maxWidth: '100%',
                wordBreak: 'break-word',
              }}
            >
              <Typography variant="body1">
                {message.content
                  ?.split('/')
                  .pop()
                  ?.replace(/\.[^.]+\./, '.') ?? 'Unknown'}
              </Typography>
            </Box>
          </Box>
        </a>
      ) : isAlert ? (
        <Box>
          <Typography variant="body2" className={styles.content}>
            <Box
              sx={{
                backgroundColor: bgColor || 'black',
                color: textColor || 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                display: 'inline-block',
              }}
            >
              {' '}
              {text}
            </Box>
          </Typography>

          {/* Only show dynamic acknowledgment status to the Commander */}
          {currentUserId === senderId && (
            <>
              {unacknowledged.length > 0 ? (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ fontWeight: 'bold', mt: 1 }}
                >
                  Not acknowledged by:{' '}
                  {unacknowledged.map((u: IUser) => u.username).join(', ')}
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  color="success.main"
                  sx={{ fontWeight: 'bold', mt: 1 }}
                >
                  Acknowledged by all
                </Typography>
              )}
              {/* Optionally, show who has acknowledged along with their acknowledgment times */}
              {acknowledgedBy.length > 0 && (
                <Box mt={1}>
                  <Typography variant="caption" display="block">
                    Acknowledged at{' '}
                    {latestAckTime && moment(latestAckTime).isValid()
                      ? moment(latestAckTime).format('MM/DD/YY HH:mm')
                      : 'Invalid date'}
                  </Typography>
                  {/* {acknowledgedBy.map((ackUser: any, index: number) => {
                    const ackTime = acknowledgedAt[index]
                    return (
                      <Typography key={ackUser} variant="caption" display="block">
                        acknowledged at {ackTime && moment(ackTime).isValid() ? moment(ackTime).format('MM/DD/YY HH:mm') : 'Invalid date'}
                      </Typography>
                    )
                  })} */}
                </Box>
              )}
              {acknowledgedBy.length === 0 && (
                <Typography variant="caption" display="block">
                  Acknowledged at{' '}
                  {message.timestamp && moment(message.timestamp).isValid()
                    ? moment(message.timestamp).format('MM/DD/YY HH:mm')
                    : 'Invalid date'}
                </Typography>
              )}
            </>
          )}
        </Box>
      ) : (
        <Typography variant="body2" className={styles.content}>
          <Linkify>{message.content}</Linkify>
        </Typography>
      )}
    </Box>
  )
}

export default Message
