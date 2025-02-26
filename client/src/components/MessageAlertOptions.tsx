import React, { useState, useEffect} from 'react'
import { IconButton, Popover, Box } from '@mui/material'
import { Warning } from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import { addMessage } from '../features/messageSlice'
import request from '../utils/request'
import AlertPanel from './AlertPanel'

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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    // TODO: Implement the logic to check if the current user is the incident commander or first responder
    const isIncidentCommander = true;
    const isFirstResponder = false;
    
    const [openAlertPanel, setOpenAlertPanel] = useState<boolean>(false)
    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget)
      setOpenAlertPanel(true);
    }
  
    const handleMenuClose = () => {
      setAnchorEl(null)
      setOpenAlertPanel(false);
    }
    
    return (
      <>
        {(isIncidentCommander || isFirstResponder) && (
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
      </>
    );
  }
  
  export default MessageAlertOptions