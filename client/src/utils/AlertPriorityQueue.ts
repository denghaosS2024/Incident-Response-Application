import IMessage from '../models/Message'

/**
 * Alert Priority Levels
 * Higher number means higher priority
 */
export const ALERT_PRIORITY = {
  HELP: 1,
  U_HELP: 2,
  E_HELP: 3,
}

/**
 * Gets the priority level of an alert based on its type
 */
export const getPriorityLevel = (alertType: string): number => {
  if (alertType === 'E_HELP' || alertType.startsWith('E HELP - Patient:')) {
    return ALERT_PRIORITY.E_HELP
  } else if (
    alertType === 'U_HELP' ||
    alertType.startsWith('U HELP - Patient:')
  ) {
    return ALERT_PRIORITY.U_HELP
  } else {
    return ALERT_PRIORITY.HELP
  }
}

/**
 * Class to manage alert priority and queue
 */
class AlertPriorityQueue {
  private queues: Record<string, IMessage[]> = {} // Keyed by channelId
  private activeAlerts: Record<string, IMessage> = {} // Keyed by channelId
  private alertTimeouts: Record<string, NodeJS.Timeout> = {} // Timeouts for each active alert
  private defaultTimeoutMs = 20000
  private initialized = false

  /**
   * Add an alert to the queue or handle it based on priority
   * @param alert The alert message to add
   * @param timeoutMs Optional timeout in milliseconds (defaults to 2 minutes)
   * @returns Object containing whether the alert was queued or active
   */
  addAlert(
    alert: IMessage,
    timeoutMs?: number,
  ): {
    queued: boolean
    active: boolean
    message: string
  } {
    const { channelId, content } = alert
    const alertType = this.getAlertTypeFromContent(content)
    const priority = getPriorityLevel(alertType)

    // Initialize queue for this channel if it doesn't exist
    if (!this.queues[channelId]) {
      this.queues[channelId] = []
    }

    // Get current active alert for this channel
    const currentActiveAlert = this.activeAlerts[channelId]

    // If no active alert, make this one active
    if (!currentActiveAlert) {
      this.activeAlerts[channelId] = alert
      // Set up timeout for this alert
      this.setupAlertTimeout(channelId, timeoutMs)
      console.log(`Alert ${alert._id} is now active for channel ${channelId}`)
      return {
        queued: false,
        active: true,
        message: 'Alert is now active.',
      }
    }

    // Get priority of current active alert
    const currentType = this.getAlertTypeFromContent(currentActiveAlert.content)
    const currentPriority = getPriorityLevel(currentType)

    // If new alert has higher priority, replace current active alert and queue the current one
    if (priority > currentPriority) {
      // Add current active to the queue
      this.queues[channelId].push(currentActiveAlert)
      // Sort the queue by priority (higher first) then by timestamp (older first)
      this.queues[channelId].sort((a, b) => {
        const priorityA = getPriorityLevel(
          this.getAlertTypeFromContent(a.content),
        )
        const priorityB = getPriorityLevel(
          this.getAlertTypeFromContent(b.content),
        )

        if (priorityA !== priorityB) {
          return priorityB - priorityA // Higher priority first
        }

        // Same priority, sort by timestamp
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      })

      // Make new alert active
      this.activeAlerts[channelId] = alert
      // Clear any existing timeout and set up a new one for this alert
      this.clearAlertTimeout(channelId)
      this.setupAlertTimeout(channelId, timeoutMs)
      console.log(
        `Higher priority alert ${alert._id} replaced ${currentActiveAlert._id}`,
      )
      return {
        queued: false,
        active: true,
        message: 'Alert has higher priority and is now active.',
      }
    }

    // Otherwise, add to the queue
    this.queues[channelId].push(alert)
    // Sort the queue
    this.queues[channelId].sort((a, b) => {
      const priorityA = getPriorityLevel(
        this.getAlertTypeFromContent(a.content),
      )
      const priorityB = getPriorityLevel(
        this.getAlertTypeFromContent(b.content),
      )

      if (priorityA !== priorityB) {
        return priorityB - priorityA // Higher priority first
      }

      // Same priority, sort by timestamp
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    })

    console.log(`Alert ${alert._id} queued for channel ${channelId}`)
    return {
      queued: true,
      active: false,
      message:
        'The alert is being delayed by other alerts and will be sent as soon as possible.',
    }
  }

  /**
   * Process the next alert in queue for a specific channel
   * @param channelId The channel ID
   * @returns The next alert from the queue or null if queue is empty
   */
  getNextAlert(channelId: string): IMessage | null {
    if (!this.queues[channelId] || this.queues[channelId].length === 0) {
      delete this.activeAlerts[channelId]
      return null
    }

    const nextAlert = this.queues[channelId].shift()
    if (nextAlert) {
      this.activeAlerts[channelId] = nextAlert
      console.log(
        `Next alert ${nextAlert._id} is now active for channel ${channelId}`,
      )
      return nextAlert
    }

    return null
  }

  /**
   * Check if an alert is active for a specific channel
   * @param channelId The channel ID
   * @returns Whether there's an active alert
   */
  hasActiveAlert(channelId: string): boolean {
    return !!this.activeAlerts[channelId]
  }

  /**
   * Get the active alert for a specific channel
   * @param channelId The channel ID
   * @returns The active alert or null
   */
  getActiveAlert(channelId: string): IMessage | null {
    return this.activeAlerts[channelId] || null
  }

  /**
   * Remove an alert from active and process the next in queue
   * @param channelId The channel ID
   * @param processNext Whether to process the next alert in queue (default: true)
   * @returns The next alert from the queue or null
   */
  completeActiveAlert(channelId: string, processNext = true): IMessage | null {
    // Clear any timeout for this channel
    this.clearAlertTimeout(channelId)

    // Remove the active alert
    delete this.activeAlerts[channelId]

    // Process the next alert if requested
    if (processNext) {
      return this.getNextAlert(channelId)
    }
    return null
  }

  /**
   * Clear any active timeout for a channel
   * @param channelId The channel ID
   */
  private clearAlertTimeout(channelId: string): void {
    if (this.alertTimeouts[channelId]) {
      clearTimeout(this.alertTimeouts[channelId])
      delete this.alertTimeouts[channelId]
    }
  }

  /**
   * Set up a timeout for an active alert
   * @param channelId The channel ID
   * @param timeoutMs Optional custom timeout in milliseconds
   */
  private setupAlertTimeout(channelId: string, timeoutMs?: number): void {
    // Clear any existing timeout first
    this.clearAlertTimeout(channelId)

    // Use provided timeout or default
    const actualTimeoutMs = timeoutMs || this.defaultTimeoutMs

    console.log(
      `Setting up alert timeout for channel ${channelId}: ${actualTimeoutMs}ms`,
    )

    // Create new timeout
    this.alertTimeouts[channelId] = setTimeout(() => {
      const activeAlert = this.activeAlerts[channelId]
      if (activeAlert) {
        console.log(
          `Alert ${activeAlert._id} has timed out after ${actualTimeoutMs}ms, removing from active alerts`,
        )

        // Get the next alert (if any)
        const nextAlert = this.completeActiveAlert(channelId)

        // Use dynamic import to avoid circular dependencies
        import('../utils/Socket').then(({ default: socket }) => {
          // Emit event to notify listeners about the timeout
          socket.emit('alert-timed-out', {
            channelId,
            messageId: activeAlert._id,
            nextAlert,
          })

          // If there's a next alert, emit an event for it
          if (nextAlert) {
            console.log(
              `Next alert ${nextAlert._id} is now active after timeout`,
            )
            const alertType = this.getAlertTypeFromContent(nextAlert.content)
            if (alertType === 'E_HELP') {
              socket.emit('new-alert', nextAlert)
            } else if (alertType === 'U_HELP') {
              socket.emit('new-police-alert', nextAlert)
            } else if (alertType === 'HELP') {
              socket.emit('nurse-alert', nextAlert)
            }
          }
        })
      }
    }, actualTimeoutMs)
  }

  /**
   * Extract the alert type from the content
   * @param content The message content
   * @returns The alert type
   */
  private getAlertTypeFromContent(content: string): string {
    if (content.startsWith('E HELP - Patient:')) {
      return 'E_HELP'
    } else if (content.startsWith('U HELP - Patient:')) {
      return 'U_HELP'
    } else {
      return 'HELP'
    }
  }

  /**
   * Check if a message is one of our active alerts and remove it if it has been acknowledged
   * This is crucial for handling cases where other nurses have responded to the alert
   * @param message The message that might be an acknowledged alert
   * @returns True if an alert was removed, false otherwise
   */
  checkAndRemoveAcknowledgedAlert(message: IMessage): boolean {
    // If this message is an active alert in any channel
    if (message && message._id && message.channelId) {
      const channelId = message.channelId
      const activeAlert = this.activeAlerts[channelId]

      // If this is our active alert and it has acknowledgments
      if (
        activeAlert &&
        activeAlert._id === message._id &&
        message.acknowledgedBy &&
        message.acknowledgedBy.length > 0
      ) {
        console.log(
          `Alert ${message._id} has been acknowledged, removing from active alerts`,
        )
        // Complete this alert since it's been acknowledged
        this.completeActiveAlert(channelId)
        return true
      }
    }
    return false
  }

  /**
   * Set the default timeout for all future alerts
   * @param timeoutMs The new default timeout in milliseconds
   */
  setDefaultTimeout(timeoutMs: number): void {
    if (timeoutMs > 0) {
      this.defaultTimeoutMs = timeoutMs
      console.log(`Default alert timeout set to ${timeoutMs}ms`)
    }
  }

  /**
   * Initialize listeners for alert acknowledgments if not already done
   */
  initializeListeners(): void {
    // Prevent multiple initializations
    if (this.initialized) return
    this.initialized = true

    // Use dynamic import to avoid circular dependencies
    import('../utils/Socket').then(({ default: socket }) => {
      // Listen for alert acknowledgments
      socket.on('acknowledge-alert', (updatedMessage: IMessage) => {
        console.log(
          'AlertPriorityQueue received acknowledge-alert',
          updatedMessage,
        )
        const removed = this.checkAndRemoveAcknowledgedAlert(updatedMessage)
        console.log('Alert removed from queue:', removed)

        // If this message has responses, also complete it
        if (updatedMessage.responses && updatedMessage.responses.length > 0) {
          console.log('Alert has responses, completing active alert')
          this.completeActiveAlert(updatedMessage.channelId)
        }
      })

      // Listen for timeout setting changes
      socket.on('set-alert-timeout', ({ timeoutMs }: { timeoutMs: number }) => {
        if (timeoutMs && timeoutMs > 0) {
          this.setDefaultTimeout(timeoutMs)
        }
      })
    })
  }
}

// Create singleton instance
const instance = new AlertPriorityQueue()

// Initialize listeners
instance.initializeListeners()

// Export singleton
export default instance
