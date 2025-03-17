import { Warning } from '@mui/icons-material'
import { Box, IconButton, Popover } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { addMessage } from '../redux/messageSlice'
import { AppDispatch } from '../redux/store'
import request from '../utils/request'
import SocketClient from '../utils/Socket'
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
  const socket = SocketClient
  const dispatch = useDispatch<AppDispatch>()
  // const [maydayOpen, setMaydayOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  // TODO: Implement the logic to check if the current user is the incident commander or first responder
  // const isIncidentCommander = false

  const [responders, setResponders] = useState<string[]>([])
  const [acknowledgedBy, setAcknowledgedBy] = useState<string[]>([])

  // hardcode for test purpose
  let isIncidentCommander = false
  if (
    currentUserId === '67cf2ea7882f62d18e656388' ||
    currentUserId === '67cf427215bcff53008820e3'
  ) {
    isIncidentCommander = true
  }
  // const isFirstResponder = true;

  const [openAlertPanel, setOpenAlertPanel] = useState<boolean>(false)
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    setOpenAlertPanel(true)
  }

  // Fetch the first resopnders
  const handleFetchResponders = async () => {
    const users = await request(`/api/users`, {
      method: 'GET',
    })
    // const responders = users.filter((user: any) => user._id !== currentUserId && (user.role === 'Fire' || user.role === 'Police'));
    const responders = users.filter(
      (user: any) =>
        user._id !== currentUserId && user.role === currentUserRole,
    )
    setResponders(responders.map((responder: any) => responder._id))

    console.log('Responders:', responders)
  }

  // Fetch the resopnder if commander
  useEffect(() => {
    // if (isIncidentCommander) {
    //   handleFetchResponders();
    // }
    handleFetchResponders()
  }, [isIncidentCommander])

  // useEffect(() => {
  //   const handleMaydayReceived = (data: any) => {
  //     console.log('Mayday received:', data);
  //     // Check if the received Mayday is for this channel and from another user
  //     if (data.senderId !== currentUserId) {
  //       setMaydayOpen(true);
  //     }
  //   };

  //   socket.connect();
  //   socket.on('send-mayday', handleMaydayReceived);

  //   return () => {
  //     socket.off('send-mayday');
  //   };

  // }, [currentUserId]);

  const handleMenuClose = () => {
    setAnchorEl(null)
    setOpenAlertPanel(false)
  }

  const sendAlert = async () => {
    const message = await request(`/api/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content: 'MAYDAY-red-black',
        isAlert: true,
        responders: responders,
        acknowledgedBy: [],
        acknowledgeAt: [],
      }),
    })

    dispatch(addMessage(message))
  }
  // const handleDoubleClick = () => {
  //   console.log('Double clicked');
  //   setMaydayOpen(false);
  // };

  // const lastTap = useRef<number | null>(null);

  // const handleDoubleTapDismiss = () => {
  //     const now = Date.now();
  //     if (lastTap.current && now - lastTap.current < 300) {
  //         setMaydayOpen(false);
  //         socket.emit('acknowledge-alert', { senderId: currentUserId, type: 'mayday', timestamp: now });
  //     }
  //     lastTap.current = now;
  // };

  // const flash = keyframes`
  //     0% { background-color: red; }
  //     50% { background-color: black; }
  //     100% { background-color: red; }
  // `;

  return (
    <>
      {isIncidentCommander && (
        <IconButton color="primary" onClick={handleMenuOpen}>
          <Warning />
        </IconButton>
      )}

      <Popover
        open={openAlertPanel}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        {currentUserRole && (
          <Box>
            <AlertPanel
              role={currentUserRole as 'Fire' | 'Police'}
              channelId={channelId}
              responders={responders}
            />
          </Box>
        )}
      </Popover>

      {!isIncidentCommander &&
        (currentUserRole === 'Fire' || currentUserRole === 'Police') && (
          <IconButton color="primary" onClick={sendAlert}>
            <Warning />
          </IconButton>
        )}

      {/* <Modal open={maydayOpen}>
          <Box
              onClick={handleDoubleTapDismiss}
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
                pointerEvents: 'auto',
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
                MAYDAY
            </Typography>
          </Box>
        </Modal> */}
    </>
  )
}

export default MessageAlertOptions
