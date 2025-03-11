import { Grid, Box } from '@mui/material';
import React, { useState } from 'react';
import MessageInput from '../MessageInput';
import MessageList from '../MessageList';
import MessageCallOptions from '../MessageCallOptions';
import MessageAttachmentOptions from '../MessageAttachmentOptions';
import VoiceRecorder from '../VoiceRecorder';
import MessageAlertOptions from '../MessageAlertOptions';
import IMessage from '@/models/Message';
import styles from '../../styles/ChatBox.module.css';
import AlertSnackbar from '../common/AlertSnackbar'

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
    onSendMessage
}) => {
    // State for the snackbar
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Function to handle errors from MessageCallOptions
    const handleCallError = (message: string) => {
        setSnackbarMessage(message);
        setOpenSnackbar(true);
    };

    // Function to close the snackbar
    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    return (
        <Grid className={styles.root} container direction="column">
            <Grid className={styles.list} item>
                <MessageList messages={messages || []} loading={isLoading} />
            </Grid>

            <Grid className={styles.input} item>
                <Box display="flex">
                    <Box display="flex">
                        <MessageAttachmentOptions 
                            channelId={channelId} 
                            currentUserId={currentUserId}
                        />
                        <MessageCallOptions
                            channelId={channelId}
                            currentUserId={currentUserId}
                            onError={handleCallError}
                        />
                        <VoiceRecorder 
                            channelId={channelId}
                        />
                        {["Fire", "Police"].includes(currentUserRole) && (
                            <MessageAlertOptions
                                channelId={channelId}
                                currentUserId={currentUserId}
                                currentUserRole={currentUserRole}
                            />
                        )}
                    </Box>
                    <Box flexGrow={1}>
                        <MessageInput
                            onSubmit={(content: string) => onSendMessage(content, channelId)}
                        />
                    </Box>
                </Box>
            </Grid>

            <AlertSnackbar
                open={openSnackbar}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
                severity={'error'}
            />
        </Grid>
    )
}

export default ChatBox