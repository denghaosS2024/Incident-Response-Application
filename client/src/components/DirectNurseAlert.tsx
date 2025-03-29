import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

interface DirectNurseAlertProps {
  alertType: 'E' | 'U' | ''
  patientName: string
  onAccept: () => void
  onBusy: () => void
}

/**
 * A component that directly renders a full-screen nurse alert
 * This bypasses any potential issues with Modal components or z-index stacking
 */
const DirectNurseAlert: React.FC<DirectNurseAlertProps> = ({
  alertType,
  patientName,
  onAccept,
  onBusy,
}) => {
  console.log('DirectNurseAlert rendering with:', { alertType, patientName })
  const [isFlashing, setIsFlashing] = useState(true)
  const [countdown, setCountdown] = useState(120) // 2 minutes

  // Log mount and unmount
  useEffect(() => {
    console.log('DirectNurseAlert mounted')

    return () => {
      console.log('DirectNurseAlert unmounted')
    }
  }, [])

  // Create flashing effect
  useEffect(() => {
    console.log('Setting up flashing effect')
    const flashInterval = setInterval(() => {
      setIsFlashing((prev) => !prev)
    }, 500)

    return () => clearInterval(flashInterval)
  }, [])

  // Countdown timer
  useEffect(() => {
    console.log('Setting up countdown timer')
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Determine colors based on alert type
  let bgColor = '#1976d2' // Default blue for regular HELP
  let altColor = '#1565c0'
  if (alertType === 'E') {
    bgColor = 'red'
    altColor = 'black'
  } else if (alertType === 'U') {
    bgColor = 'orange'
    altColor = 'white'
  }

  // Add button handlers with logging
  const handleAccept = () => {
    console.log('Accept button clicked')
    onAccept()
  }

  const handleBusy = () => {
    console.log('Busy button clicked')
    onBusy()
  }

  console.log('Creating portal for alert')
  // Create a portal to render directly to body
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: isFlashing ? bgColor : altColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '32px',
          borderRadius: '8px',
          width: '80%',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <h2
          style={{ color: '#d32f2f', marginBottom: '16px', fontSize: '32px' }}
        >
          {alertType === 'E' ? 'E HELP' : alertType === 'U' ? 'U HELP' : 'HELP'}
        </h2>

        <h3 style={{ marginBottom: '16px' }}>1 nurse needed for patient:</h3>

        <h1 style={{ marginBottom: '32px' }}>{patientName}</h1>

        <p style={{ marginBottom: '32px', color: '#666' }}>
          This alert will expire in {Math.floor(countdown / 60)}:
          {String(countdown % 60).padStart(2, '0')}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
          <button
            onClick={handleAccept}
            style={{
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              fontSize: '20px',
              fontWeight: 'bold',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ACCEPT
          </button>

          <button
            onClick={handleBusy}
            style={{
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              fontSize: '20px',
              fontWeight: 'bold',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            BUSY
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default DirectNurseAlert
