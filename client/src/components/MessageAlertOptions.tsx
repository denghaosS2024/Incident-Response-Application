import React, { useState, useEffect} from 'react'
import { IconButton, Popover, Box, Modal, Typography, keyframes } from '@mui/material'
import { Warning } from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import { addMessage } from '../features/messageSlice'
import request from '../utils/request'
import AlertPanel from './AlertPanel'
import SocketClient from '../utils/Socket'

interface MessageAlertOptionsProps {
    channelId: string
    currentUserId: string
    currentUserRole: string
}

const MessageAlertOptions: React.FC<MessageAlertOptionsProps> = ({
    channelId,
    currentUserId,
    currentUserRole,
  }) => {
    const socket = SocketClient
    const [maydayOpen, setMaydayOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    // TODO: Implement the logic to check if the current user is the incident commander or first responder
    const isIncidentCommander = false;
    // const isFirstResponder = true;
    
    const [openAlertPanel, setOpenAlertPanel] = useState<boolean>(false)
    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget)
      setOpenAlertPanel(true);
    }

    useEffect(() => {
      const handleMaydayReceived = (data: any) => {
        console.log('Mayday received:', data);
        // Check if the received Mayday is for this channel and from another user
        if (data.senderId !== currentUserId) {
          setMaydayOpen(true);
        }
      };
    
      socket.connect();
      socket.on('send-mayday', handleMaydayReceived);

      return () => {
        socket.off('send-mayday');
      };

    }, [currentUserId]);
  
    const handleMenuClose = () => {
      setAnchorEl(null)
      setOpenAlertPanel(false);
    }

    const handleMayday = () => {
      socket.emit('send-mayday', { senderId: currentUserId });
      console.log('Mayday sent');
    };

    const flash = keyframes`
        0% { background-color: red; }
        50% { background-color: black; }
        100% { background-color: red; }
    `;
    
    return (
      <>
        {(isIncidentCommander) && (
          <IconButton color="primary" onClick={handleMenuOpen}>
            <Warning />
          </IconButton>
        )}
  
        <Popover
          open={openAlertPanel}
          anchorEl={anchorEl}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          {currentUserRole && (
            <Box>
              <AlertPanel role={currentUserRole as "Fire" | "Police"} />
            </Box>
          )}
        </Popover>

        {(currentUserRole === "Fire" || currentUserRole === "Police") && (
          <IconButton color="primary" onClick={handleMayday}>
            <Warning />
          </IconButton>
        )}

        <Modal open={maydayOpen}>
          <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                animation: `${flash} 1s infinite`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
                MAYDAY
            </Typography>
          </Box>
        </Modal>
      </>
    );
  }
  
  export default MessageAlertOptions