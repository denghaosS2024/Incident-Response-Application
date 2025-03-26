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
  } else if (alertType === 'U_HELP' || alertType.startsWith('U HELP - Patient:')) {
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

  /**
   * Add an alert to the queue or handle it based on priority
   * @param alert The alert message to add
   * @returns Object containing whether the alert was queued or active
   */
  addAlert(alert: IMessage): {
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
   * @returns The next alert from the queue or null
   */
  completeActiveAlert(channelId: string): IMessage | null {
    delete this.activeAlerts[channelId]
    return this.getNextAlert(channelId)
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
}

// Export a singleton
export default new AlertPriorityQueue()
