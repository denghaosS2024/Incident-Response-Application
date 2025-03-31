import { Types } from "mongoose";
import ChannelController from "../controllers/ChannelController";
import { Alert, GroupAlertState } from "../models/AlertQueue";
import Channel from "../models/Channel";
import Message, { IMessage } from "../models/Message";
import UserConnections from "../utils/UserConnections";
class AlertService {
    private static instance: AlertService;
    private groupAlertMap: Map<string, GroupAlertState> = new Map();

    private constructor() {}

    public static getInstance(): AlertService {
        if (!AlertService.instance) {
            AlertService.instance = new AlertService();
        }
        return AlertService.instance;
    }

    public getGroupAlertState(groupId: string): GroupAlertState | undefined {
        return this.groupAlertMap.get(groupId);
    }

    public setGroupAlertState(groupId: string, groupAlertState: GroupAlertState): void {
        this.groupAlertMap.set(groupId, groupAlertState);
    }

    public queueAlert(alert: Alert): void {
        const groupId = alert.groupId;
        const groupAlertState = this.getGroupAlertState(groupId);
        if (groupAlertState) {
            groupAlertState.alertQueue.push(alert);
        } else {
            this.setGroupAlertState(groupId, {
                alertQueue: [alert],
                ongoingAlert: undefined,
                timeoutHandle: undefined,
            });
        }
        console.log('alertState', groupId, this.groupAlertMap)
    }

    public sendAlert(groupId: string): void {
        const groupAlertState = this.getGroupAlertState(groupId);
        if (groupAlertState) {
            groupAlertState.ongoingAlert = groupAlertState.alertQueue.shift();
        }
        console.log('alertState', groupId, this.groupAlertMap)

    }

    private static comparePriority(a: string, b: string): number {
        const priorityRank: Record<string, number> = {
          'E': 3, 'U': 2, 'H': 1
        };
        return priorityRank[a] - priorityRank[b];
    }

    private promoteNextAlert(groupId: string) {
        const state = this.getGroupAlertState(groupId);
        if (!state || state.alertQueue.length === 0) {
            state!.ongoingAlert = undefined;
            state!.timeoutHandle = undefined;
            return;
        }
    
        // Get next eligible alert
        const next = state.alertQueue.shift()!;
        this.sendAlertNow(next, state, groupId);
    }

    private hasExpired(alert: Alert, now: Date): boolean {
        return (now.getTime() - alert.createdAt.getTime()) > 2 * 60 * 1000;
    }
    
    private static alertComparator(a: Alert, b: Alert): number {
        const priorityDiff = AlertService.comparePriority(b.priority, a.priority);
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
    }
    
    private async sendAlertNow(alert: Alert, state: GroupAlertState, groupId: string, onAlertSent?: () => void): Promise<IMessage> {
        alert.status = 'ongoing';
        alert.createdAt = new Date();
        state.ongoingAlert = alert;

        // Clear any old timer
        if (state.timeoutHandle) clearTimeout(state.timeoutHandle);

        // Schedule next alert after 2 mins
        state.timeoutHandle = setTimeout(() => {
            this.promoteNextAlert(groupId);
        }, 2 * 60 * 1000);

        // Call the callback if provided
        if (onAlertSent) {
            onAlertSent();
        }

        const senderId = new Types.ObjectId(alert.senderId!)
        const channelId = new Types.ObjectId(alert.channelId!)

        const message = await ChannelController.appendMessage({
            content: alert.content!,
            senderId: senderId,
            channelId: channelId,
            isAlert: alert.isAlert!,
            responders: alert.responders!.map(responder => new Types.ObjectId(responder)),
        })
        const channel = await Channel.findById(groupId).exec()
        if (!channel) {
            throw new Error(`Channel(${groupId}) not found.`)
        }
        channel.users.forEach((user) => {
            const id = user._id.toHexString();
            const isSender = user._id.equals(senderId);
        
            if (!UserConnections.isUserConnected(id)) return;
        
            const connection = UserConnections.getUserConnection(id)!;

            if (isSender) {
                connection.emit('nurse-alert-success', message);
            }
        });
            
        console.log(`Alert sent to group ${groupId}:`, alert);
        console.log('alertState', groupId, this.groupAlertMap)
        return message;
    }
    

    public async queueOrSendAlert(alert: Alert, onAlertSent?: () => void): Promise<IMessage> {
        const groupId = alert.groupId;
        let state = this.getGroupAlertState(groupId);

        if (!state) {
            state = { alertQueue: [], ongoingAlert: undefined, timeoutHandle: undefined };
            this.setGroupAlertState(groupId, state);
        }

        const now = new Date();
        const ongoing = state.ongoingAlert;

        // Case 1: No ongoing → send immediately
        if (!ongoing || this.hasExpired(ongoing, now)) {
            console.log('Case 1: No ongoing → send immediately', this.groupAlertMap)
            return await this.sendAlertNow(alert, state, groupId, onAlertSent);
        }

        // Case 2: Higher priority → preempt
        if (AlertService.comparePriority(alert.priority, ongoing.priority) > 0) {
            console.log('Case 2: Higher priority → preempt', this.groupAlertMap)
            return await this.sendAlertNow(alert, state, groupId, onAlertSent);
        }

        // Case 3: Queue it
        state.alertQueue.push(alert);
        state.alertQueue.sort(AlertService.alertComparator);
        console.log('Case 3: Queue it', this.groupAlertMap)
        const channel = await Channel.findById(groupId).exec()
        if (!channel) {
            throw new Error(`Channel(${groupId}) not found.`)
        }
        const senderId = new Types.ObjectId(alert.senderId!)
        const channelId = new Types.ObjectId(groupId)
        channel.users.forEach((user) => {
            const id = user._id.toHexString();
            const isSender = user._id.equals(senderId);
        
            if (!UserConnections.isUserConnected(id)) return;
        
            if (isSender) {
                const connection = UserConnections.getUserConnection(id)!;
                connection.emit('nurse-alert-delayed', "The alert is being delayed by other alerts and will be sent as soon as possible.");
            }
        });
        const message = new Message({
            content: alert.content!,
            senderId: senderId,
            channelId: channelId,
            isAlert: alert.isAlert!,
            responders: alert.responders!.map(responder => new Types.ObjectId(responder)),
        })

        return message;

    }
      
}

export default AlertService.getInstance();