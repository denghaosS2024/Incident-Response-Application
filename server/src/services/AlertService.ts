import { Types } from 'mongoose'
import { Alert, GroupAlertState } from '../models/AlertQueue'
import Channel from '../models/Channel'
import UserConnections from '../utils/UserConnections'
class AlertService {
  private static instance: AlertService
  private groupAlertMap: Map<string, GroupAlertState> = new Map()

  private constructor() {}

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService()
    }
    return AlertService.instance
  }

  public getGroupAlertState(groupId: string): GroupAlertState | undefined {
    return this.groupAlertMap.get(groupId)
  }

  public setGroupAlertState(
    groupId: string,
    groupAlertState: GroupAlertState,
  ): void {
    this.groupAlertMap.set(groupId, groupAlertState)
  }

  private static comparePriority(a: string, b: string): number {
    const priorityRank: Record<string, number> = {
      E: 3,
      U: 2,
      H: 1,
    }
    return priorityRank[a] - priorityRank[b]
  }

  private hasExpired(alert: Alert, now: Date): boolean {
    const createdAtDate = new Date(alert.createdAt)
    return now.getTime() - createdAtDate.getTime() > 2 * 10 * 1000
  }

  private static alertComparator(a: Alert, b: Alert): number {
    const priorityDiff = AlertService.comparePriority(b.priority, a.priority)
    if (priorityDiff !== 0) return priorityDiff
    return a.createdAt.getTime() - b.createdAt.getTime()
  }

  private async promoteNextAlert(groupId: string): Promise<void> {
    const state = this.getGroupAlertState(groupId)
    if (!state) return

    const nextAlert = state.alertQueue.shift()
    if (nextAlert) {
      await this.sendAlertNow(nextAlert, state, groupId)
    } else {
      // No more alerts in queue — clean up state
      state.ongoingAlert = undefined
      state.timeoutHandle = undefined
      console.log(`Alert queue is now empty for group ${groupId}`)
    }
  }

  private async sendAlertNow(
    alert: Alert,
    state: GroupAlertState,
    groupId: string,
  ): Promise<void> {
    state.ongoingAlert = alert
    if (state.timeoutHandle) clearTimeout(state.timeoutHandle)

    // Schedule next alert after 2 mins
    state.timeoutHandle = setTimeout(
      () => {
        this.promoteNextAlert(groupId)
      },
      2 * 10 * 1000,
    )

    const senderId = new Types.ObjectId(alert.senderId!)
    const channelId = new Types.ObjectId(alert.groupId!)

    const channel = await Channel.findById(channelId).exec()
    if (!channel) {
      throw new Error(`Channel(${groupId}) not found.`)
    }
    channel.users.forEach((user) => {
      const id = user._id.toHexString()
      const isSender = user._id.equals(senderId)

      if (!UserConnections.isUserConnected(id)) return

      const connection = UserConnections.getUserConnection(id)!

      if (isSender) {
        connection.emit('nurse-alert-success')
      } else {
        connection.emit('incoming-nurse-alert', alert)
      }
    })

    console.log(`Alert sent to group ${groupId}:`, alert)
    console.log('alertState', groupId, this.groupAlertMap)
  }

  public async queueOrSendAlert(alert: Alert): Promise<string> {
    const groupId = alert.groupId
    let state = this.getGroupAlertState(groupId)

    if (!state) {
      state = { alertQueue: [], timeoutHandle: undefined }
      this.setGroupAlertState(groupId, state)
    }

    const now = new Date()
    const ongoing = state.ongoingAlert

    // Case 1: No ongoing or expired -> send immediately
    if (!ongoing || this.hasExpired(ongoing, now)) {
      await this.sendAlertNow(alert, state, groupId)
      return 'Immediate alert sent'
    }

    // Case 2: Higher priority -> preempt ongoing alert immediately
    if (AlertService.comparePriority(alert.priority, ongoing.priority) > 0) {
      await this.sendAlertNow(alert, state, groupId)
      return 'Immediate alert sent'
    }

    // Case 3: Lower or equal priority -> queue it
    state.alertQueue.push(alert)
    state.alertQueue.sort(AlertService.alertComparator)
    return 'Alert queued'
  }

  public resetState() {
    this.groupAlertMap.clear()
  }
}

export default AlertService.getInstance()
export { AlertService }
