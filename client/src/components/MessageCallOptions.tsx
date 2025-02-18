import React, { useState } from 'react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import { Phone } from '@mui/icons-material'

const MessageCallOptions: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  // Option for making a phone call
  const handleMakeCall = () => {
    console.log('Make phone call...')
    handleMenuClose()
  }

  // Option for starting a video conference
  const handleStartVideoConference = () => {
    console.log('Start video conference...')
    handleMenuClose()
  }

  return (
    <>
      <IconButton color="primary" onClick={handleMenuOpen}>
        <Phone />
      </IconButton>
      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem onClick={handleMakeCall}>Make Phone Call</MenuItem>
        <MenuItem onClick={handleStartVideoConference}>
          Start Video Conference
        </MenuItem>
      </Menu>
    </>
  )
}

export default MessageCallOptions
