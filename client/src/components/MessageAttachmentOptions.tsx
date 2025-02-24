import React, { useState, useEffect } from 'react'
import { IconButton, Menu, MenuItem, Dialog } from '@mui/material'
import { AttachFile } from '@mui/icons-material'
import MessageVideoRecorder from './MessageVideoRecorder'
import { useDispatch } from 'react-redux'
import { addMessage } from '../features/messageSlice'
import request from '../utils/request'
import FileUploadForm from './FileUploadForm'

interface MessageAttachmentOptionsProps {
  channelId: string,
  currentUserId: string
}

const MessageAttachmentOptions: React.FC<MessageAttachmentOptionsProps> = ({
  channelId,
  currentUserId
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isPrivateChannel, setPrivateChannel] = useState<boolean>(false)
  const [videoRecorderOpen, setVideoRecorderOpen] = useState<boolean>(false)
  const [openFileUpload, setOpenFileUpload] = useState(false);
  const handleOpenFileUpload = () => setOpenFileUpload(true);
  const handleCloseFileUpload = () => setOpenFileUpload(false);
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchChannelDetails = async () => {
      try {
        const channels = await request(`/api/channels`) 
        const currentChannel = channels.find((channel: any) => channel._id === channelId) // Find the current channel
        if (currentChannel) {
          setPrivateChannel(currentChannel.users.length === 2) // Check if only two users exist in the channel
        }
      } catch (error) {
        console.error('Failed to fetch channel details:', error)
      }
    }

    fetchChannelDetails()
  }, [channelId])  

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const openVideoRecorder = () => {
    handleMenuClose()
    setVideoRecorderOpen(true)
  }

  const closeVideoRecorder = () => {
    setVideoRecorderOpen(false)
  }

  return (
    <>
      <IconButton color="primary" onClick={handleMenuOpen}>
        <AttachFile />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {/* Existing attachment options can go here */}
        <MenuItem onClick={openVideoRecorder}>
          Record Video
        </MenuItem>

        <MenuItem onClick={handleOpenFileUpload}>
          File Upload
        </MenuItem>
      </Menu>
      {/* Modal for video recording */}
      <Dialog open={videoRecorderOpen} onClose={closeVideoRecorder} maxWidth="sm" fullWidth>
        <MessageVideoRecorder channelId={channelId} currentUserId={currentUserId} />
      </Dialog>

      <Dialog open={openFileUpload} onClose={handleCloseFileUpload}>
        <FileUploadForm onClose={handleCloseFileUpload}  channelId={channelId} />
      </Dialog>
    </>
  )
}

export default MessageAttachmentOptions
