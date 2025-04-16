import { Box, Grid } from '@mui/material'
import React, { useState } from 'react'
import IMessage from '../../models/Message'
import styles from '../../styles/ChatBox.module.css'
import AlertSnackbar from '../common/AlertSnackbar'
import MessageAlertOptions from '../MessageAlertOptions'
import MessageAttachmentOptions from '../MessageAttachmentOptions'
import MessageCallOptions from '../MessageCallOptions'
import MessageInput from '../MessageInput'
import MessageList from '../MessageList'
import MessageNurseAlertOptions from '../MessageNurseAlertOptions'
import VoiceRecorder from '../VoiceRecorder'

interface ChatBoxProps {
    channelId: string
    messages: IMessage[]
    currentUserId: string
    currentUserRole: string
    isLoading: boolean
    onSendMessage: (content: string, channelId: string) => Promise<void>
    isHospitalGroup?: boolean
}

const ChatBox: React.FC<ChatBoxProps> = ({
    channelId,
    messages,
    currentUserId,
    currentUserRole,
    isLoading,
    onSendMessage,
    isHospitalGroup = false,
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

    // Get current patient from URL query params if in patient visit screen
    const getPatientFromUrl = (): string | undefined => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            const patient = urlParams.get('patient')
            if (patient) {
                return patient
            }
        }
        return undefined
    }

    const preSelectedPatient = getPatientFromUrl()

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
                        {currentUserRole === 'Nurse' && isHospitalGroup && (
                            <MessageNurseAlertOptions
                                channelId={channelId}
                                currentUserId={currentUserId}
                                preSelectedPatient={preSelectedPatient}
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

            {/* Snackbar for errors */}
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
