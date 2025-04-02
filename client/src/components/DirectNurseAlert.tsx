import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

interface DirectNurseAlertProps {
  alertType: 'E' | 'U' | ''
  patientName: string
  onAccept: () => void
  onBusy: () => void
  onTimeExpired?: () => void // Optional callback for when time expires
  alertKey?: string // Unique key for the alert to force re-rendering
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
  onTimeExpired,
  alertKey = 'default',
}) => {
  console.log('DirectNurseAlert rendering with:', {
    alertType,
    patientName,
    alertKey,
  })
  const [isFlashing, setIsFlashing] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(20) // 20 seconds for testing, would be longer in production
  const [isVisible, setIsVisible] = useState(true) // Control visibility

  // Store timing references
  const startTimeRef = useRef(Date.now())
  const totalDurationMs = 20 * 1000 // 20 seconds for testing
  const endTimeRef = useRef(startTimeRef.current + totalDurationMs)

  // Reset time references whenever alertKey changes
  useEffect(() => {
    console.log(
      'DirectNurseAlert: Resetting timer references due to alertKey change:',
      alertKey,
    )
    startTimeRef.current = Date.now()
    endTimeRef.current = startTimeRef.current + totalDurationMs
    setIsFlashing(true)
    setIsVisible(true)
    setSecondsLeft(20)
  }, [alertKey, totalDurationMs])

  // Handle auto-hide when timer reaches zero
  useEffect(() => {
    if (secondsLeft <= 0 && isVisible) {
      console.log(
        'DirectNurseAlert: Timer reached zero, hiding alert without action',
      )
      setIsVisible(false)

      // Notify parent component if callback provided
      if (onTimeExpired) {
        onTimeExpired()
      }
    }
  }, [secondsLeft, isVisible, onTimeExpired])

  // Log mount and unmount
  useEffect(() => {
    console.log(
      'DirectNurseAlert mounted with expiry time:',
      new Date(endTimeRef.current).toISOString(),
      'alertKey:',
      alertKey,
    )
    // Force a reflow to ensure the component is visible
    document.body.style.overflow = 'hidden'

    return () => {
      console.log('DirectNurseAlert unmounted')
      document.body.style.overflow = ''
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

  // Simple countdown timer using requestAnimationFrame for better performance
  useEffect(() => {
    console.log(
      'Setting up countdown timer with end time:',
      new Date(endTimeRef.current).toISOString(),
    )

    // Update the countdown every second
    let frameId: number

    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, endTimeRef.current - now)
      const seconds = Math.ceil(remaining / 1000)

      if (secondsLeft !== seconds) {
        console.log('Countdown update:', seconds)
        setSecondsLeft(seconds)
      }

      if (remaining <= 0) {
        console.log('Timer complete')
        return
      }

      // Schedule next update
      frameId = requestAnimationFrame(updateTimer)
    }

    // Start the update loop
    frameId = requestAnimationFrame(updateTimer)

    // Also set a direct timeout for the full duration to ensure visibility control
    const dismissTimeoutId = setTimeout(() => {
      console.log('DirectNurseAlert: Visibility timeout reached, hiding alert')
      setIsVisible(false)
    }, totalDurationMs)

    return () => {
      cancelAnimationFrame(frameId)
      clearTimeout(dismissTimeoutId)
      console.log('Countdown cleanup')
    }
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

  // If not visible, don't render
  if (!isVisible) {
    console.log(
      'DirectNurseAlert: Not rendering because alert is no longer visible',
    )
    return null
  }

  // Alert content without the portal
  const AlertContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999, // Maximum z-index
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
          This alert will expire in {Math.floor(secondsLeft / 60)}:
          {String(secondsLeft % 60).padStart(2, '0')}
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
    </div>
  )

  try {
    console.log(
      'Creating portal for nurse alert with seconds left:',
      secondsLeft,
    )
    return ReactDOM.createPortal(AlertContent, document.body)
  } catch (error) {
    console.error('Portal creation failed, using direct rendering:', error)
    return AlertContent
  }
}

export default DirectNurseAlert
