import IMessage from '@/models/Message'
import { Box, Grid } from '@mui/material'
import React, { useState } from 'react'
import styles from '../../styles/ChatBox.module.css'
import AlertSnackbar from '../common/AlertSnackbar'
import MessageAlertOptions from '../MessageAlertOptions'
import MessageAttachmentOptions from '../MessageAttachmentOptions'
import MessageCallOptions from '../MessageCallOptions'
import MessageInput from '../MessageInput'
import MessageList from '../MessageList'
import VoiceRecorder from '../VoiceRecorder'

interface ChatBoxProps {
  channelId: string
  messages: IMessage[]
  currentUserId: string
  currentUserRole: string
  isLoading: boolean
  onSendMessage: (content: string, channelId: string) => Promise<void>
}

const ChatBox: React.FC<ChatBoxProps> = ({
  channelId,
  messages,
  currentUserId,
  currentUserRole,
  isLoading,
  onSendMessage,
}) => {
  // State for the snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // Function to handle errors from MessageCallOptions
  const handleCallError = (message: string) => {
    setSnackbarMessage(message)
    setOpenSnackbar(true)
  }

  // Function to close the snackbar
  const handleSnackbarClose = () => {
    setOpenSnackbar(false)
  }

  return (
    <Grid className={styles.root} container direction="column">
      <Grid className={styles.list} item>
        <MessageList messages={messages || []} loading={isLoading} />
      </Grid>

      <Grid className={styles.input} item>
        <Box display="flex" flexDirection="column">
          {/* All the buttons */}
          <Box
            display="flex"
            alignItems="center"
            // columnGap controls spacing between each button
            sx={{ columnGap: 1 }}
          >
            <MessageAttachmentOptions
              channelId={channelId}
              currentUserId={currentUserId}
            />
            <MessageCallOptions
              channelId={channelId}
              currentUserId={currentUserId}
              onError={handleCallError}
            />
            <VoiceRecorder channelId={channelId} />
            {['Fire', 'Police'].includes(currentUserRole) && (
              <MessageAlertOptions
                channelId={channelId}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            )}
          </Box>

          {/* Input box  */}
          <Box display="flex" alignItems="center">
            <Box flexGrow={1}>
              <MessageInput
                onSubmit={(content: string) =>
                  onSendMessage(content, channelId)
                }
              />
            </Box>
          </Box>
        </Box>
      </Grid>

      <AlertSnackbar
        open={openSnackbar}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity="error"
      />
    </Grid>
  )
}

export default ChatBox
