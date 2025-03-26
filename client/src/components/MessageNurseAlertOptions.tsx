import WarningIcon from '@mui/icons-material/Warning'
import { IconButton, Popover } from '@mui/material'
import React, { useState } from 'react'
import NurseAlertPanel from './NurseAlertPanel'

interface MessageNurseAlertOptionsProps {
  channelId: string
  currentUserId: string
  preSelectedPatient?: string
}

const MessageNurseAlertOptions: React.FC<MessageNurseAlertOptionsProps> = ({
  channelId,
  currentUserId,
  preSelectedPatient,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        color="warning"
        onClick={handleClick}
        aria-label="Nurse Alert"
        title="Send Alert to Other Nurses"
      >
        <WarningIcon />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <NurseAlertPanel
          channelId={channelId}
          onClose={handleClose}
          preSelectedPatient={preSelectedPatient}
        />
      </Popover>
    </>
  )
}

export default MessageNurseAlertOptions
