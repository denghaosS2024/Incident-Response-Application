import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import SocketClient from '../../../utils/Socket'

const NurseActionDialog: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [messageData, setMessageData] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    console.log(
      'NurseActionDialog: Listening for nurse-specific socket messages',
    )

    const handleSocketMessage = (data: any) => {
      console.log('NurseActionDialog: Received socket message:', data)
      setMessageData(data)
      setOpen(true) // Open the dialog when a message is received
    }

    // Use the existing SocketClient instance to listen for the event
    SocketClient.on('hospital-patients-modified', handleSocketMessage)

    // Cleanup the listener when the component is unmounted
    return () => {
      SocketClient.off('hospital-patients-modified')
    }
  }, [])

  const handleOK = () => {
    setOpen(false)
  }

  const handleGOSEE = () => {
    setOpen(false)
    navigate('/patients/nurse')
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Action Required</DialogTitle>
      <DialogContent>
        {'One or more beds have been requested or modified'}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOK} color="secondary">
          OK
        </Button>
        <Button onClick={handleGOSEE} color="primary">
          GO SEE
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NurseActionDialog
