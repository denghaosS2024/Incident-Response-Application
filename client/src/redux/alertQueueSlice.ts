import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import IMessage from '../models/Message'
import { getPriorityLevel } from '../utils/AlertPriorityQueue'

interface AlertQueueState {
  queues: Record<string, IMessage[]> // Keyed by channelId
  activeAlerts: Record<string, IMessage> // Keyed by channelId
  processedAlertIds: Record<string, boolean> // Track processed alerts as object instead of Set
}

const initialState: AlertQueueState = {
  queues: {},
  activeAlerts: {},
  processedAlertIds: {},
}

const ALERT_DURATION = 120000 // 2 minutes in milliseconds

export const alertQueueSlice = createSlice({
  name: 'alertQueue',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<IMessage>) => {
      const alert = action.payload
      const { channelId, content } = alert
      console.log('Redux: addAlert called with:', { id: alert._id, channelId, content })
      const alertType = getAlertTypeFromContent(content)
      const priority = getPriorityLevel(alertType)

      // Skip if we've already processed this alert
      if (state.processedAlertIds[alert._id]) {
        console.log('Alert already processed, skipping:', alert._id)
        return
      }

      // Initialize queue for this channel if it doesn't exist
      if (!state.queues[channelId]) {
        state.queues[channelId] = []
      }

      // Mark as processed to prevent duplicates
      state.processedAlertIds[alert._id] = true

      // Get current active alert for this channel
      const currentActiveAlert = state.activeAlerts[channelId]

      // If no active alert, make this one active
      if (!currentActiveAlert) {
        console.log('No active alert, setting this one as active:', alert._id)
        state.activeAlerts[channelId] = alert
        return
      }

      // Get priority of current active alert
      const currentType = getAlertTypeFromContent(currentActiveAlert.content)
      const currentPriority = getPriorityLevel(currentType)

      // If new alert has higher priority, replace current active alert and queue the current one
      if (priority > currentPriority) {
        console.log('New alert has higher priority, replacing active:', alert._id)
        // Add current active to the queue
        state.queues[channelId].push(currentActiveAlert)
        // Sort the queue by priority (higher first) then by timestamp (older first)
        state.queues[channelId].sort((a, b) => {
          const priorityA = getPriorityLevel(getAlertTypeFromContent(a.content))
          const priorityB = getPriorityLevel(getAlertTypeFromContent(b.content))

          if (priorityA !== priorityB) {
            return priorityB - priorityA // Higher priority first
          }

          // Same priority, sort by timestamp
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        })

        // Make new alert active
        state.activeAlerts[channelId] = alert
        
        // Log the updated queue
        console.log('QUEUE UPDATED - Current queue for channel', channelId, ':', state.queues[channelId].map(a => ({ 
          id: a._id, 
          content: a.content,
          priority: getPriorityLevel(getAlertTypeFromContent(a.content)),
          timestamp: a.timestamp
        })));
        
        return
      }

      // Otherwise, add to the queue
      console.log('Adding alert to queue:', alert._id)
      state.queues[channelId].push(alert)
      // Sort the queue
      state.queues[channelId].sort((a, b) => {
        const priorityA = getPriorityLevel(getAlertTypeFromContent(a.content))
        const priorityB = getPriorityLevel(getAlertTypeFromContent(b.content))

        if (priorityA !== priorityB) {
          return priorityB - priorityA // Higher priority first
        }

        // Same priority, sort by timestamp
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      })
      
      // Log the updated queue
      console.log('QUEUE UPDATED - Current queue for channel', channelId, ':', state.queues[channelId].map(a => ({ 
        id: a._id, 
        content: a.content,
        priority: getPriorityLevel(getAlertTypeFromContent(a.content)),
        timestamp: a.timestamp
      })));
    },

    completeActiveAlert: (state, action: PayloadAction<{ channelId: string; alertId: string }>) => {
      const { channelId, alertId } = action.payload
      console.log('Redux: completeActiveAlert called:', { channelId, alertId })
      console.log('Redux: current active alert:', state.activeAlerts[channelId]?._id)
      console.log('Redux: queue length:', state.queues[channelId]?.length || 0)
      
      // Check if the active alert matches the one we're trying to complete
      if (state.activeAlerts[channelId]?._id === alertId) {
        console.log('Active alert matches, removing from active')
        // Remove from active alerts
        delete state.activeAlerts[channelId]
        
        // Process next alert in queue
        if (state.queues[channelId]?.length > 0) {
          const nextAlert = state.queues[channelId].shift()
          if (nextAlert) {
            console.log('Setting next alert as active:', nextAlert._id)
            state.activeAlerts[channelId] = nextAlert
            
            // Log the updated queue after removing the next alert
            console.log('QUEUE UPDATED - Current queue after next alert activated for channel', channelId, ':', state.queues[channelId].map(a => ({ 
              id: a._id, 
              content: a.content,
              priority: getPriorityLevel(getAlertTypeFromContent(a.content)),
              timestamp: a.timestamp
            })));
          }
        } else {
          console.log('Queue is empty for channel', channelId);
        }
      } else {
        console.log('Active alert does not match or no active alert')
        // If the active alert doesn't match, check if it's in the queue
        if (state.queues[channelId]) {
          const queueIndex = state.queues[channelId].findIndex(alert => alert._id === alertId)
          if (queueIndex >= 0) {
            console.log('Found alert in queue, removing from queue')
            // Remove from queue
            state.queues[channelId].splice(queueIndex, 1)
            
            // Log the updated queue after removing an alert from the queue
            console.log('QUEUE UPDATED - Current queue after alert removed for channel', channelId, ':', state.queues[channelId].map(a => ({ 
              id: a._id, 
              content: a.content,
              priority: getPriorityLevel(getAlertTypeFromContent(a.content)),
              timestamp: a.timestamp
            })));
          }
        }
      }
    },

    clearQueue: (state, action: PayloadAction<string>) => {
      const channelId = action.payload
      console.log('Clearing queue for channel', channelId);
      delete state.queues[channelId]
      delete state.activeAlerts[channelId]
    },

    resetAlertQueue: (state) => {
      // Reset the entire state
      console.log('Resetting all alert queues');
      state.queues = {}
      state.activeAlerts = {}
      state.processedAlertIds = {}
    }
  },
})

// Helper function to extract alert type from content
const getAlertTypeFromContent = (content: string): string => {
  if (content.startsWith('E HELP - Patient:')) {
    return 'E_HELP'
  } else if (content.startsWith('U HELP - Patient:')) {
    return 'U_HELP'
  } else {
    return 'HELP'
  }
}

export const { addAlert, completeActiveAlert, clearQueue, resetAlertQueue } = alertQueueSlice.actions

// Selectors
export const selectActiveAlert = (state: { alertQueue: AlertQueueState }, channelId: string) => 
  state.alertQueue.activeAlerts[channelId]

export const selectQueue = (state: { alertQueue: AlertQueueState }, channelId: string) => 
  state.alertQueue.queues[channelId]

export const selectHasActiveAlert = (state: { alertQueue: AlertQueueState }, channelId: string) => 
  !!state.alertQueue.activeAlerts[channelId]

export default alertQueueSlice.reducer





